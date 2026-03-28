import os
import time
import re
import uuid
import logging
import shutil
import traceback
from datetime import datetime, timedelta, timezone
import razorpay
import paypalrestsdk
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="LinkSumm AI Backend")

# GLOBAL EXCEPTION HANDLERS: Ensure we ALWAYS return JSON, never HTML
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"GLOBAL ERROR CAUGHT: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected internal error occurred.",
            "error": str(exc),
            "status": "error"
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status": "error"
        }
    )

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# Initialize Razorpay
razorpay_key_id = os.getenv("RAZORPAY_KEY_ID")
razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET")
razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret)) if razorpay_key_id and razorpay_key_secret else None

# Initialize PayPal
paypal_client_id = os.getenv("PAYPAL_CLIENT_ID")
paypal_client_secret = os.getenv("PAYPAL_CLIENT_SECRET")
paypal_mode = os.getenv("PAYPAL_MODE", "sandbox")
if paypal_client_id and paypal_client_secret:
    paypalrestsdk.configure({
        "mode": paypal_mode,
        "client_id": paypal_client_id,
        "client_secret": paypal_client_secret
    })

# Import services
from services.scraper import download_audio
from services.transcriber import transcribe_audio
from services.summarizer import generate_summary

# Pydantic models
from models import (
    SummarizeRequest, SaveSummaryRequest, SavePublicSummaryRequest,
    CheckQuotaRequest, CheckQuotaResponse, CreateSubscriptionRequest,
    RazorpaySubscriptionResponse, PaypalSubscriptionResponse,
    SubscriptionStatusResponse, CancelSubscriptionRequest, CancelSubscriptionResponse,
    PricingResponse, Plan
)

def validate_url(url: str) -> str:
    """Validates if the URL is from YouTube Shorts, Instagram, or Facebook and returns the platform."""
    yt_pattern = r'(youtube\.com/shorts/|youtu\.be/)'
    ig_pattern = r'instagram\.com/(reel|reels|p)/'
    fb_pattern = r'(facebook\.com/reel/|fb\.watch/|facebook\.com/share/r/)'
    
    if re.search(yt_pattern, url):
        return "youtube"
    elif re.search(ig_pattern, url):
        return "instagram"
    elif re.search(fb_pattern, url):
        return "facebook"
    else:
        raise HTTPException(status_code=400, detail="Invalid URL. Please provide a valid YouTube Shorts, Instagram, or Facebook Reel link.")

@app.get("/")
def health_check():
    return {"status": "alive", "service": "LinkSumm AI"}

@app.post("/api/summarize")
async def summarize_reel(request: SummarizeRequest):
    start_time = time.time()
    logger.info(f"Summarize request received for URL: {request.url}")
    
    audio_path = None
    try:
        # Step 1: Validate URL
        platform = validate_url(request.url)
        logger.info(f"Platform identified: {platform}")
        
        # Step 2: Download Audio
        try:
            audio_path = download_audio(request.url, platform)
        except HTTPException as he:
            raise he
        except Exception as e:
            logger.error(f"Download error: {str(e)}")
            raise HTTPException(status_code=422, detail=f"Download failed: {str(e)}")
        
        # Step 3: Transcribe Audio
        try:
            from services.transcriber import transcribe_audio
            transcript = transcribe_audio(audio_path)
        except Exception as e:
            logger.error(f"Transcription error: {str(e)}")
            raise HTTPException(status_code=500, detail="Error during transcription")
        
        # Step 4: Summarize
        try:
            from services.summarizer import generate_summary
            summary = generate_summary(transcript)
        except Exception as e:
            logger.error(f"Summarization error: {str(e)}")
            raise HTTPException(status_code=500, detail="Error during summarization")
        
        processing_time = round(time.time() - start_time, 1)
        word_count = len(summary.split())
        
        # Increment quota if user_id is provided
        if request.user_id and supabase:
            try:
                today = datetime.now(timezone.utc).date().isoformat()
                usage_res = supabase.table("user_api_usage").select("*").eq("user_id", request.user_id).eq("date", today).execute()
                if len(usage_res.data) > 0:
                    count = usage_res.data[0].get("summaries_count", 0)
                    supabase.table("user_api_usage").update({"summaries_count": count + 1}).eq("id", usage_res.data[0]["id"]).execute()
                else:
                    supabase.table("user_api_usage").insert({
                        "user_id": request.user_id,
                        "date": today,
                        "summaries_count": 1,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }).execute()
            except Exception as e:
                logger.error(f"Failed to increment quota: {e}")
        
        return {
            "summary": summary,
            "transcript": transcript,
            "source_url": request.url,
            "platform": platform,
            "word_count": word_count,
            "processing_time": processing_time,
            "status": "success"
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in summarize_reel: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
            except Exception:
                pass

@app.post("/api/summarize-upload")
async def summarize_upload(file: UploadFile = File(...), user_id: str = Query(None)):
    """
    Ultimate fallback: Accepts an audio/video file upload, skips yt-dlp download,
    and directly transcribes and summarizes the content.
    """
    start_time = time.time()
    
    # Generate unique filename in /tmp/
    file_id = str(uuid.uuid4())
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'mp4'
    temp_path = f"/tmp/{file_id}.{ext}"
    
    try:
        # Save uploaded file
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        logger.info(f"Successfully saved uploaded file to {temp_path}")
        
        # Step 1: Transcribe Audio
        from services.transcriber import transcribe_audio
        transcript = transcribe_audio(temp_path)
        
        # Step 2: Summarize
        from services.summarizer import generate_summary
        summary = generate_summary(transcript)
        
        processing_time = round(time.time() - start_time, 1)
        word_count = len(summary.split())
        
        # Increment quota if user_id is provided
        if user_id and supabase:
            try:
                today = datetime.now(timezone.utc).date().isoformat()
                usage_res = supabase.table("user_api_usage").select("*").eq("user_id", user_id).eq("date", today).execute()
                if len(usage_res.data) > 0:
                    count = usage_res.data[0].get("summaries_count", 0)
                    supabase.table("user_api_usage").update({"summaries_count": count + 1}).eq("id", usage_res.data[0]["id"]).execute()
                else:
                    supabase.table("user_api_usage").insert({
                        "user_id": user_id,
                        "date": today,
                        "summaries_count": 1,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }).execute()
            except Exception as e:
                logger.error(f"Failed to increment quota: {e}")
        
        return {
            "summary": summary,
            "transcript": transcript,
            "source_url": "Uploaded File",
            "platform": "upload",
            "word_count": word_count,
            "processing_time": processing_time
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload processing error: {e}")
        raise HTTPException(status_code=500, detail="Error processing uploaded file")
    finally:
        # Cleanup just in case transcriber didn't catch it
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

@app.post("/api/save-summary")
def save_summary(request: SaveSummaryRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    data = {
        "user_id": request.user_id,
        "source_url": request.source_url,
        "platform": request.platform,
        "transcript": request.transcript,
        "summary": request.summary,
        "word_count": request.word_count,
        "processing_time": request.processing_time
    }
    
    try:
        response = supabase.table("summaries").insert(data).execute()
        if len(response.data) > 0:
            return {"success": True, "id": response.data[0]["id"]}
        else:
            raise HTTPException(status_code=500, detail="Failed to save summary")
    except Exception as e:
        logger.error(f"Supabase insert error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save summary")

@app.get("/api/history/{user_id}")
def get_history(user_id: str, search: str = Query(None)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    try:
        query = supabase.table("summaries").select("*").eq("user_id", user_id).order("created_at", desc=True)
        
        if search:
            # Case insensitive search on summary or source_url
            query = query.or_(f"summary.ilike.%{search}%,source_url.ilike.%{search}%")
            
        response = query.execute()
        return response.data
    except Exception as e:
        logger.error(f"Supabase fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch history")

@app.delete("/api/summary/{summary_id}")
def delete_summary(summary_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    try:
        response = supabase.table("summaries").delete().eq("id", summary_id).execute()
        return {"success": True, "message": "Summary deleted"}
    except Exception as e:
        logger.error(f"Supabase delete error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete summary")

@app.post("/api/save-public-summary")
def save_public_summary(request: SavePublicSummaryRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    # Generate random 8-char alphanumeric share_id
    share_id = str(uuid.uuid4()).replace("-", "")[:8]
    
    data = {
        "share_id": share_id,
        "summary": request.summary,
        "transcript": request.transcript,
        "source_url": request.source_url,
        "platform": request.platform,
        "word_count": request.word_count,
        "view_count": 0
    }
    
    try:
        response = supabase.table("public_summaries").insert(data).execute()
        if len(response.data) > 0:
            # Note: Hardcoded frontend URL as requested, but could be env var
            return {
                "share_id": share_id,
                "share_url": f"https://linksumm-ai.vercel.app/s/{share_id}"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to generate share link")
    except Exception as e:
        logger.error(f"Supabase public insert error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate share link")

@app.get("/api/shared/{share_id}")
def get_shared_summary(share_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    try:
        # Fetch the summary
        response = supabase.table("public_summaries").select("*").eq("share_id", share_id).execute()
        
        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Shared summary not found")
            
        summary_data = response.data[0]
        
        # Increment view count asynchronously or synchronously
        new_view_count = summary_data.get("view_count", 0) + 1
        supabase.table("public_summaries").update({"view_count": new_view_count}).eq("share_id", share_id).execute()
        
        # Update the response data with the new view count
        summary_data["view_count"] = new_view_count
        
        return summary_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Supabase fetch shared error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch shared summary")

@app.post("/api/check-quota", response_model=CheckQuotaResponse)
def check_quota(request: CheckQuotaRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    user_id = request.user_id
    
    # Check if user is premium
    try:
        sub_res = supabase.table("users_subscription").select("*").eq("user_id", user_id).execute()
        if len(sub_res.data) > 0:
            sub = sub_res.data[0]
            if sub.get("is_premium"):
                # Check if expired
                expires_str = sub.get("subscription_expires")
                if expires_str:
                    # Parse ISO format, handle Z
                    expires_str = expires_str.replace('Z', '+00:00')
                    expires = datetime.fromisoformat(expires_str)
                    if expires > datetime.now(timezone.utc):
                        return CheckQuotaResponse(can_summarize=True, remaining=-1, reason="premium")
                    else:
                        # Expired, update DB
                        supabase.table("users_subscription").update({"is_premium": False}).eq("user_id", user_id).execute()
    except Exception as e:
        logger.error(f"Error checking subscription: {e}")
        
    # User is free or expired, check daily quota
    today = datetime.now(timezone.utc).date().isoformat()
    try:
        usage_res = supabase.table("user_api_usage").select("*").eq("user_id", user_id).eq("date", today).execute()
        
        count = 0
        if len(usage_res.data) > 0:
            count = usage_res.data[0].get("summaries_count", 0)
            
        if count < 2:
            return CheckQuotaResponse(can_summarize=True, remaining=2-count, reason="free_tier")
        else:
            return CheckQuotaResponse(
                can_summarize=False, 
                remaining=0, 
                reason="quota_exceeded", 
                message="You've used your 2 free summaries today. Upgrade to Premium for unlimited."
            )
    except Exception as e:
        logger.error(f"Error checking quota: {e}")
        raise HTTPException(status_code=500, detail="Failed to check quota")

@app.post("/api/create-razorpay-subscription", response_model=RazorpaySubscriptionResponse)
def create_razorpay_subscription(request: CreateSubscriptionRequest):
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Razorpay not configured")
        
    plan_id = os.getenv("RAZORPAY_PLAN_ID")
    if not plan_id:
        raise HTTPException(status_code=500, detail="Razorpay plan ID not configured")
        
    try:
        # Create subscription
        subscription = razorpay_client.subscription.create({
            "plan_id": plan_id,
            "total_count": 12, # 1 year
            "customer_notify": 1,
            "notes": {
                "user_id": request.user_id,
                "email": request.user_email
            }
        })
        
        # Store in DB
        if supabase:
            # Check if exists
            existing = supabase.table("users_subscription").select("*").eq("user_id", request.user_id).execute()
            data = {
                "user_id": request.user_id,
                "subscription_id": subscription['id'],
                "payment_method": "razorpay",
                "is_premium": False,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            if len(existing.data) > 0:
                supabase.table("users_subscription").update(data).eq("user_id", request.user_id).execute()
            else:
                data["created_at"] = datetime.now(timezone.utc).isoformat()
                supabase.table("users_subscription").insert(data).execute()
                
        return RazorpaySubscriptionResponse(
            subscription_id=subscription['id'],
            key_id=razorpay_key_id,
            amount=9900 # 99 INR in paise
        )
    except Exception as e:
        logger.error(f"Razorpay subscription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/create-paypal-subscription", response_model=PaypalSubscriptionResponse)
def create_paypal_subscription(request: CreateSubscriptionRequest):
    plan_id = os.getenv("PAYPAL_PLAN_ID")
    if not plan_id or not paypal_client_id:
        raise HTTPException(status_code=500, detail="PayPal not configured")
        
    try:
        billing_agreement = paypalrestsdk.BillingAgreement({
            "name": "LinkSumm AI Premium",
            "description": "Unlimited summaries and no ads",
            "start_date": (datetime.now(timezone.utc) + timedelta(minutes=5)).strftime('%Y-%m-%dT%H:%M:%SZ'),
            "plan": {
                "id": plan_id
            },
            "payer": {
                "payment_method": "paypal"
            },
            "override_merchant_preferences": {
                "return_url": request.return_url if hasattr(request, 'return_url') and request.return_url else "https://linksumm-ai.vercel.app/account?paypal=success",
                "cancel_url": request.cancel_url if hasattr(request, 'cancel_url') and request.cancel_url else "https://linksumm-ai.vercel.app/pricing?paypal=cancel"
            }
        })
        
        if billing_agreement.create():
            approval_url = next((link.href for link in billing_agreement.links if link.rel == "approval_url"), None)
            
            # Store pending subscription
            if supabase:
                existing = supabase.table("users_subscription").select("*").eq("user_id", request.user_id).execute()
                # We don't have the final sub ID yet, just store intent or wait for webhook
                # Actually, billing_agreement doesn't have the final ID until executed.
                # We can store a pending state if needed.
                
            return PaypalSubscriptionResponse(
                approval_url=approval_url,
                plan_id=plan_id
            )
        else:
            logger.error(f"PayPal error: {billing_agreement.error}")
            raise HTTPException(status_code=500, detail="Failed to create PayPal subscription")
    except Exception as e:
        logger.error(f"PayPal subscription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/execute-paypal-subscription", response_model=ExecutePaypalSubscriptionResponse)
def execute_paypal_subscription(request: ExecutePaypalSubscriptionRequest):
    try:
        billing_agreement = paypalrestsdk.BillingAgreement.execute(request.token)
        if billing_agreement.id:
            if supabase:
                # Store the final subscription ID
                existing = supabase.table("users_subscription").select("*").eq("user_id", request.user_id).execute()
                data = {
                    "user_id": request.user_id,
                    "subscription_id": billing_agreement.id,
                    "payment_method": "paypal",
                    "is_premium": True,
                    "subscription_started": datetime.now(timezone.utc).isoformat(),
                    "subscription_expires": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                if len(existing.data) > 0:
                    supabase.table("users_subscription").update(data).eq("user_id", request.user_id).execute()
                else:
                    data["created_at"] = datetime.now(timezone.utc).isoformat()
                    supabase.table("users_subscription").insert(data).execute()
            
            return ExecutePaypalSubscriptionResponse(success=True, message="Subscription activated")
        else:
            return ExecutePaypalSubscriptionResponse(success=False, message="Failed to execute agreement")
    except Exception as e:
        logger.error(f"PayPal execute error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/razorpay-webhook")
async def razorpay_webhook(request: Request):
    # Verify signature
    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
    signature = request.headers.get("x-razorpay-signature")
    
    payload = await request.body()
    
    try:
        razorpay_client.utility.verify_webhook_signature(payload.decode('utf-8'), signature, webhook_secret)
    except Exception as e:
        logger.error(f"Razorpay webhook signature verification failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")
        
    data = await request.json()
    event = data.get("event")
    
    if event == "subscription.charged":
        sub_id = data['payload']['subscription']['entity']['id']
        # Find user by sub_id
        if supabase:
            sub_res = supabase.table("users_subscription").select("*").eq("subscription_id", sub_id).execute()
            if len(sub_res.data) > 0:
                user_id = sub_res.data[0]['user_id']
                
                # Update subscription
                supabase.table("users_subscription").update({
                    "is_premium": True,
                    "subscription_started": datetime.now(timezone.utc).isoformat(),
                    "subscription_expires": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }).eq("user_id", user_id).execute()
                
                # Log payment
                payment_id = data['payload']['payment']['entity']['id']
                amount = data['payload']['payment']['entity']['amount'] / 100
                supabase.table("payments").insert({
                    "user_id": user_id,
                    "payment_id": payment_id,
                    "amount": amount,
                    "currency": "INR",
                    "payment_method": "razorpay",
                    "status": "success",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }).execute()
                
    return {"status": "ok"}

@app.post("/api/paypal-webhook")
async def paypal_webhook(request: Request):
    data = await request.json()
    event_type = data.get("event_type")
    
    try:
        if event_type in ["BILLING.SUBSCRIPTION.ACTIVATED", "PAYMENT.SALE.COMPLETED"]:
            resource = data.get("resource", {})
            sub_id = resource.get("id")
            
            if event_type == "PAYMENT.SALE.COMPLETED":
                sub_id = resource.get("billing_agreement_id")
            
            if sub_id and supabase:
                # Find user by sub_id
                sub_res = supabase.table("users_subscription").select("*").eq("subscription_id", sub_id).execute()
                
                if len(sub_res.data) > 0:
                    user_id = sub_res.data[0]['user_id']
                    
                    # Update subscription
                    supabase.table("users_subscription").update({
                        "is_premium": True,
                        "subscription_started": datetime.now(timezone.utc).isoformat(),
                        "subscription_expires": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }).eq("user_id", user_id).execute()
                    
                    # Log payment if it's a sale
                    if event_type == "PAYMENT.SALE.COMPLETED":
                        payment_id = resource.get("id")
                        amount_obj = resource.get("amount", {})
                        amount = float(amount_obj.get("total", 0))
                        currency = amount_obj.get("currency", "USD")
                        
                        supabase.table("payments").insert({
                            "user_id": user_id,
                            "payment_id": payment_id,
                            "amount": amount,
                            "currency": currency,
                            "payment_method": "paypal",
                            "status": "success",
                            "created_at": datetime.now(timezone.utc).isoformat()
                        }).execute()
    except Exception as e:
        logger.error(f"PayPal webhook error: {e}")
        
    return {"status": "ok"}

@app.get("/api/subscription-status/{user_id}", response_model=SubscriptionStatusResponse)
def get_subscription_status(user_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    try:
        res = supabase.table("users_subscription").select("*").eq("user_id", user_id).execute()
        if len(res.data) > 0:
            sub = res.data[0]
            is_premium = sub.get("is_premium", False)
            expires_str = sub.get("subscription_expires")
            
            days_remaining = None
            if is_premium and expires_str:
                expires_str = expires_str.replace('Z', '+00:00')
                expires = datetime.fromisoformat(expires_str)
                now = datetime.now(timezone.utc)
                if expires > now:
                    days_remaining = (expires - now).days
                else:
                    is_premium = False
                    
            return SubscriptionStatusResponse(
                is_premium=is_premium,
                subscription_expires=expires_str,
                days_remaining=days_remaining,
                payment_method=sub.get("payment_method"),
                can_cancel=is_premium
            )
            
        return SubscriptionStatusResponse(is_premium=False, can_cancel=False)
    except Exception as e:
        logger.error(f"Error fetching subscription status: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch status")

@app.post("/api/cancel-subscription", response_model=CancelSubscriptionResponse)
def cancel_subscription(request: CancelSubscriptionRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    try:
        # Fetch sub details
        res = supabase.table("users_subscription").select("*").eq("user_id", request.user_id).execute()
        if len(res.data) == 0:
            raise HTTPException(status_code=404, detail="Subscription not found")
            
        sub = res.data[0]
        payment_method = sub.get("payment_method")
        sub_id = sub.get("subscription_id")
        
        # If sub_id is not available from request, use the one from DB
        request_sub_id = request.subscription_id or sub_id
        
        if payment_method == "razorpay" and razorpay_client and request_sub_id:
            try:
                razorpay_client.subscription.cancel(request_sub_id)
            except Exception as e:
                logger.error(f"Razorpay cancel error: {e}")
                
        elif payment_method == "paypal" and paypal_client_id and request_sub_id:
            try:
                billing_agreement = paypalrestsdk.BillingAgreement.find(request_sub_id)
                billing_agreement.cancel({"note": "Canceled by user"})
            except Exception as e:
                logger.error(f"PayPal cancel error: {e}")
                
        # Update DB
        supabase.table("users_subscription").update({
            "auto_renew": False,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("user_id", request.user_id).execute()
        
        return CancelSubscriptionResponse(success=True, message="Subscription cancelled successfully. You will remain premium until the end of your billing cycle.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cancel subscription error: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel subscription")

@app.get("/api/pricing", response_model=PricingResponse)
def get_pricing():
    return PricingResponse(
        plans=[
            Plan(
                name="Free",
                price=0,
                summaries_per_day=2,
                features=[
                    "2 summaries per day",
                    "Ad-supported experience",
                    "Standard processing speed",
                    "Save history",
                    "Share summaries publicly"
                ]
            ),
            Plan(
                name="Premium",
                price=4.99,
                price_inr=99,
                price_usd=4.99,
                summaries_per_day="Unlimited",
                features=[
                    "Unlimited summaries",
                    "Zero ads",
                    "Faster processing priority",
                    "Priority email support",
                    "Download summary as PDF (coming soon)"
                ]
            )
        ],
        billing_cycles=["monthly"]
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
