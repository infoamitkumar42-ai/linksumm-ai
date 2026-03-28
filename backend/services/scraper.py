import os
import uuid
import yt_dlp
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

def download_audio(url: str) -> str:
    """
    Downloads audio from the given URL using yt-dlp.
    Saves the file as an MP3 in the /tmp/ directory.
    Returns the path to the downloaded audio file.
    """
    # Generate a unique filename
    file_id = str(uuid.uuid4())
    output_template = f"/tmp/{file_id}.%(ext)s"
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_template,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '64',
        }],
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        },
        'socket_timeout': 30,
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        logger.info(f"Downloading audio for URL: {url}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            # The actual file will be saved as .mp3 because of the postprocessor
            expected_filename = f"/tmp/{file_id}.mp3"
            
            if not os.path.exists(expected_filename):
                raise Exception("Downloaded file not found")
                
            logger.info(f"Successfully downloaded audio to {expected_filename}")
            return expected_filename
            
    except yt_dlp.utils.DownloadError as e:
        logger.error(f"yt-dlp download error: {str(e)}")
        raise HTTPException(
            status_code=422, 
            detail="Could not download. Make sure reel is public"
        )
    except Exception as e:
        logger.error(f"Unexpected error during download: {str(e)}")
        raise HTTPException(
            status_code=422, 
            detail="Could not download. Make sure reel is public"
        )
