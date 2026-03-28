import os
import time
import re
import uuid
import logging
import shutil
import traceback
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

# GLOBAL EXCEPTION HANDLERS
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
    """Validates URL and returns platform name."""
    patterns = {
        "youtube": r'(youtube\.com/shorts/|youtu\.be/)',
        "instagram": r'instagram\.com/(reel|reels|p)/',
        "facebook": r'(facebook\.com/reel/|fb\.watch/|facebook\.com/share/r/)'
    }
    for platform, pattern in patterns.items():
        if re.search(pattern, url):
            return platform
    raise HTTPException(
        status_code=400,
        detail="Invalid URL. Please provide a valid YouTube Shorts, Instagram, or Facebook Reel link."
    )

@app.get("/")
def health_check():
    return {"status": "alive", "service": "LinkSumm AI"}

@app.post("/api/summarize")
async def summarize_reel(request: SummarizeRequest):
    start_time = time.time()
    logger.info(f"Summarize request received for URL: {request.url}")
    try:
        platform = validate_url(request.url)
        logger.info(f"Platform identified: {platform}")
        try:
            audio_path = download_audio(request.url, platform)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Download error: {str(e)}")
            raise HTTPException(status_code=422, detail=f"Download failed: {str(e)}")
        try:
            transcript = transcribe_audio(audio_path)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Transcription error: {str(e)}")
            raise HTTPException(status_code=500, detail="Error during transcription")
        if not transcript or len(transcript.strip()) < 10:
            raise HTTPException(status_code=422, detail="No speech detected in video")
        try:
            summary = generate_summary(transcript)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Summarization error: {str(e)}")
            raise HTTPException(status_code=500, detail="Error during summarization")
        processing_time = round(time.time() - start_time, 1)
        word_count = len(summary.split())
        return {
            "summary": summary,
            "transcript": transcript,
            "source_url": request.url,
            "platform": platform,
            "word_count": word_count,
            "processing_time": processing_time,
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in summarize_reel: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize-upload")
async def summarize_upload(file: UploadFile = File(...)):
    start_time = time.time()
    file_id = str(uuid.uuid4())
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'mp4'
    temp_path = f"/tmp/{file_id}.{ext}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"Saved uploaded file to {temp_path}")
        transcript = transcribe_audio(temp_path)
        if not transcript or len(transcript.strip()) < 10:
            raise HTTPException(status_code=422, detail="No speech detected in video")
        summary = generate_summary(transcript)
        processing_time = round(time.time() - start_time, 1)
        word_count = len(summary.split())
        return {
            "summary": summary,
            "transcript": transcript,
            "source_url": "Uploaded File",
            "platform": "upload",
            "word_count": word_count,
            "processing_time": processing_time,
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload processing error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing uploaded file")
    finally:
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
        supabase.table("summaries").delete().eq("id", summary_id).execute()
        return {"success": True, "message": "Summary deleted"}
    except Exception as e:
        logger.error(f"Supabase delete error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete summary")

@app.post("/api/save-public-summary")
def save_public_summary(request: SavePublicSummaryRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
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
        response = supabase.table("public_summaries").select("*").eq("share_id", share_id).execute()
        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Shared summary not found")
        summary_data = response.data[0]
        new_view_count = summary_data.get("view_count", 0) + 1
        supabase.table("public_summaries").update({"view_count": new_view_count}).eq("share_id", share_id).execute()
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
