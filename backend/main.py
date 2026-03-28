import os
import time
import re
import uuid
import logging
from fastapi import FastAPI, HTTPException, Query
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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# Import services
from services.scraper import download_audio
from services.transcriber import transcribe_audio
from services.summarizer import generate_summary

# Pydantic models
class SummarizeRequest(BaseModel):
    url: str

class SaveSummaryRequest(BaseModel):
    user_id: str
    source_url: str
    platform: str
    transcript: str
    summary: str
    word_count: int
    processing_time: float

class SavePublicSummaryRequest(BaseModel):
    summary: str
    transcript: str
    source_url: str
    platform: str
    word_count: int

def validate_url(url: str) -> str:
    """Validates if the URL is from Instagram or Facebook and returns the platform."""
    ig_pattern = r'instagram\.com/(reel|reels|p)/'
    fb_pattern = r'(facebook\.com/reel/|fb\.watch/|facebook\.com/share/r/)'
    
    if re.search(ig_pattern, url):
        return "instagram"
    elif re.search(fb_pattern, url):
        return "facebook"
    else:
        raise HTTPException(status_code=400, detail="Invalid URL. Please provide a valid Instagram or Facebook Reel link.")

@app.get("/")
def health_check():
    return {"status": "alive", "service": "LinkSumm AI"}

@app.post("/api/summarize")
def summarize_reel(request: SummarizeRequest):
    start_time = time.time()
    
    # Step 1: Validate URL
    platform = validate_url(request.url)
    
    # Step 2: Download Audio
    try:
        audio_path = download_audio(request.url)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Download error: {e}")
        raise HTTPException(status_code=422, detail="Could not download. Make sure reel is public")
    
    # Step 3: Transcribe Audio
    try:
        transcript = transcribe_audio(audio_path)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail="Error during transcription")
    
    # Step 4: Summarize
    try:
        summary = generate_summary(transcript)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        raise HTTPException(status_code=500, detail="Error during summarization")
    
    processing_time = round(time.time() - start_time, 1)
    word_count = len(summary.split())
    
    return {
        "summary": summary,
        "transcript": transcript,
        "source_url": request.url,
        "platform": platform,
        "word_count": word_count,
        "processing_time": processing_time
    }

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

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
