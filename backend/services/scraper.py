import os
import uuid
import logging
import instaloader
from fastapi import HTTPException

logger = logging.getLogger(__name__)

def download_audio(url: str) -> str:
    """
    Downloads audio from Instagram Reel using Instaloader.
    """
    try:
        # Initialize Instaloader
        L = instaloader.Instaloader(
            download_videos=True,
            download_video_thumbnails=False,
            download_comments=False,
            save_metadata=False,
            compress_json=False,
            dirname_pattern="/tmp",
            filename_pattern="{shortcode}"
        )
        
        # Extract shortcode from URL
        shortcode = url.split("/")[-2] if url.endswith("/") else url.split("/")[-1]
        shortcode = shortcode.split("?")[0]  # Remove query params
        
        logger.info(f"Downloading reel with shortcode: {shortcode}")
        
        # Download the reel
        post = instaloader.Post.from_shortcode(L.context, shortcode)
        
        if not post.is_video:
            raise HTTPException(
                status_code=422,
                detail="This post is not a video"
            )
        
        # Download video
        video_url = post.video_url
        
        # Download using yt-dlp (works better for actual download)
        import yt_dlp
        
        file_id = str(uuid.uuid4())
        output_path = f"/tmp/{file_id}"
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': f'{output_path}.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '64',
            }],
            'quiet': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
        
        audio_file = f"{output_path}.mp3"
        
        if os.path.exists(audio_file):
            logger.info(f"Audio downloaded: {audio_file}")
            return audio_file
        else:
            raise Exception("Audio extraction failed")
            
    except instaloader.exceptions.InstaloaderException as e:
        logger.error(f"Instaloader error: {str(e)}")
        raise HTTPException(
            status_code=422,
            detail="Could not access this reel. Make sure it's public."
        )
    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        raise HTTPException(
            status_code=422,
            detail=f"Download failed: {str(e)}"
        )
