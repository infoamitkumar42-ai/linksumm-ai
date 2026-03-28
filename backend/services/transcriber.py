import os
import logging
from groq import Groq
from fastapi import HTTPException

logger = logging.getLogger(__name__)

# Initialize Groq client
# It automatically picks up GROQ_API_KEY from environment variables
client = Groq()

def transcribe_audio(file_path: str) -> str:
    """
    Transcribes the given audio file using Groq's Whisper API.
    Deletes the file after successful transcription.
    """
    try:
        # Check file size (must be < 25MB for Whisper)
        file_size_bytes = os.path.getsize(file_path)
        file_size_mb = file_size_bytes / (1024 * 1024)
        
        logger.info(f"Audio file size: {file_size_mb:.2f} MB")
        
        if file_size_mb >= 25:
            raise HTTPException(
                status_code=400, 
                detail="File size exceeds the 25MB limit for transcription."
            )
            
        logger.info(f"Transcribing audio file: {file_path}")
        
        # Open the file and send to Groq API
        with open(file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(file_path), file.read()),
                model="whisper-large-v3",
                # Groq's whisper-large-v3 supports auto-detect by default when language is not specified
                response_format="json"
            )
            
        transcript_text = transcription.text.strip()
        
        if not transcript_text:
            raise HTTPException(
                status_code=422, 
                detail="No speech detected in video"
            )
            
        logger.info("Transcription successful")
        return transcript_text
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        # Handle rate limits or other API errors
        if "rate limit" in str(e).lower() or "429" in str(e):
            raise HTTPException(
                status_code=429, 
                detail="Transcription rate limit exceeded. Please try again later."
            )
        raise HTTPException(
            status_code=500, 
            detail="Error during transcription process"
        )
    finally:
        # Always attempt to clean up the file
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up file: {file_path}")
        except Exception as cleanup_error:
            logger.warning(f"Failed to clean up file {file_path}: {str(cleanup_error)}")
