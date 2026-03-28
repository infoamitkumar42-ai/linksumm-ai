import os
import uuid
import logging
import subprocess
import requests
import asyncio
from fastapi import HTTPException

logger = logging.getLogger(__name__)

async def download_audio(url: str, platform: str) -> str:
    """
    Multi-platform audio downloader with fallback strategies.
    Returns path to downloaded audio file.
    """
    logger.info(f"Starting download process for {platform} URL: {url}")
    
    try:
        if platform == "youtube":
            file_path = await asyncio.to_thread(download_youtube_audio, url)
        elif platform == "instagram":
            file_path = await download_instagram_with_fallbacks(url)
        elif platform == "facebook":
            file_path = await asyncio.to_thread(download_facebook_audio, url)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")
            
        # Validate the downloaded file
        await asyncio.to_thread(validate_audio_file, file_path)
        
        return file_path
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Download process failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

def download_youtube_audio(url: str) -> str:
    """YouTube Shorts - most reliable method"""
    try:
        import yt_dlp
    except ImportError:
        logger.error("yt-dlp not installed")
        raise Exception("Downloader dependency missing")
    
    file_id = str(uuid.uuid4())
    output_template = f"/tmp/{file_id}.%(ext)s"
    expected_filename = f"/tmp/{file_id}.mp3"
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_template,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '64',
        }],
        'socket_timeout': 30,
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
    }
    
    try:
        logger.info("Downloading YouTube audio using yt-dlp")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.extract_info(url, download=True)
            if os.path.exists(expected_filename):
                return expected_filename
            raise Exception("File not created after download")
    except Exception as e:
        logger.error(f"YouTube download failed: {str(e)}")
        raise Exception(f"YouTube download failed: {str(e)}")

async def download_instagram_with_fallbacks(url: str) -> str:
    """Try multiple methods for Instagram until one succeeds"""
    
    # Method 1: yt-dlp with optimized settings
    try:
        logger.info("Instagram Method 1: Trying yt-dlp")
        return await asyncio.to_thread(download_instagram_ytdlp, url)
    except Exception as e1:
        logger.warning(f"Method 1 failed: {str(e1)}")
        
        # Method 2: Instaloader
        try:
            logger.info("Instagram Method 2: Trying Instaloader")
            return await asyncio.to_thread(download_instagram_instaloader, url)
        except Exception as e2:
            logger.warning(f"Method 2 failed: {str(e2)}")
            
            # Method 3: Direct Extraction
            try:
                logger.info("Instagram Method 3: Trying Direct Extraction")
                return await asyncio.to_thread(download_instagram_direct, url)
            except Exception as e3:
                logger.warning(f"Method 3 failed: {str(e3)}")
                
                # Method 4: Gallery-dl
                try:
                    logger.info("Instagram Method 4: Trying gallery-dl")
                    return await asyncio.to_thread(download_instagram_gallerydl, url)
                except Exception as e4:
                    logger.error(f"All Instagram download methods failed. Last error: {str(e4)}")
                    raise HTTPException(
                        status_code=422, 
                        detail="Instagram blocked automatic download. Please try: 1) A different link, or 2) Upload the video file manually."
                    )

def download_instagram_ytdlp(url: str) -> str:
    """Instagram Method 1: yt-dlp with optimized settings"""
    import yt_dlp
    
    file_id = str(uuid.uuid4())
    output_template = f"/tmp/{file_id}.%(ext)s"
    expected_filename = f"/tmp/{file_id}.mp3"
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_template,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '64',
        }],
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.instagram.com/',
            'X-Requested-With': 'XMLHttpRequest',
        },
        'extractor_args': {
            'instagram': {
                'extract_flat': False,
            }
        },
        'socket_timeout': 30,
        'quiet': True,
        'no_warnings': True,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.extract_info(url, download=True)
        if not os.path.exists(expected_filename):
            raise Exception("File not created by yt-dlp")
        return expected_filename

def download_instagram_instaloader(url: str) -> str:
    """Instagram Method 2: Using Instaloader library"""
    import instaloader
    import re
    
    # Extract shortcode from URL
    match = re.search(r'instagram\.com/(?:reel|reels|p)/([^/?]+)', url)
    if not match:
        raise Exception("Could not extract shortcode from URL")
    shortcode = match.group(1)
    
    L = instaloader.Instaloader(
        download_videos=True,
        download_video_thumbnails=False,
        download_comments=False,
        save_metadata=False,
        dirname_pattern='/tmp'
    )
    
    post = instaloader.Post.from_shortcode(L.context, shortcode)
    if not post.is_video:
        raise Exception("Post is not a video")
        
    # Instaloader downloads to a specific filename pattern, we need to find it
    # It usually saves as /tmp/{date}_UTC.mp4
    # To be safe, we'll just use the video_url directly and download it
    video_url = post.video_url
    
    file_id = str(uuid.uuid4())
    expected_filename = f"/tmp/{file_id}.mp4" # We'll just return the mp4, whisper can handle it
    
    response = requests.get(video_url, stream=True, timeout=30)
    response.raise_for_status()
    
    with open(expected_filename, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
            
    return expected_filename

def download_instagram_direct(url: str) -> str:
    """Instagram Method 3: Direct video URL extraction via yt-dlp"""
    import yt_dlp
    
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True, # Just get info
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        
        # Try to find the best video URL
        video_url = None
        if 'url' in info:
            video_url = info['url']
        elif 'entries' in info and len(info['entries']) > 0:
            video_url = info['entries'][0].get('url')
            
        if not video_url:
            raise Exception("Could not extract direct video URL")
            
        file_id = str(uuid.uuid4())
        expected_filename = f"/tmp/{file_id}.mp4"
        
        response = requests.get(video_url, stream=True, timeout=30)
        response.raise_for_status()
        
        with open(expected_filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
                
        return expected_filename

def download_instagram_gallerydl(url: str) -> str:
    """Instagram Method 4: Gallery-dl fallback"""
    result = subprocess.run([
        'gallery-dl',
        '--no-download',
        '--get-urls',
        url
    ], capture_output=True, text=True)
    
    if result.returncode != 0 or not result.stdout.strip():
        raise Exception(f"gallery-dl failed: {result.stderr}")
        
    video_url = result.stdout.strip().split('\n')[0] # Take the first URL
    
    file_id = str(uuid.uuid4())
    expected_filename = f"/tmp/{file_id}.mp4"
    
    response = requests.get(video_url, stream=True, timeout=30)
    response.raise_for_status()
    
    with open(expected_filename, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
            
    return expected_filename

def download_facebook_audio(url: str) -> str:
    """Facebook Reels download"""
    import yt_dlp
    
    file_id = str(uuid.uuid4())
    output_template = f"/tmp/{file_id}.%(ext)s"
    expected_filename = f"/tmp/{file_id}.mp3"
    
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
        },
        'socket_timeout': 30,
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.extract_info(url, download=True)
            return expected_filename
    except Exception as e:
        logger.error(f"Facebook download failed: {str(e)}")
        raise HTTPException(status_code=422, detail="Failed to download Facebook Reel. It might be private.")

def validate_audio_file(file_path: str) -> bool:
    """
    Validates that downloaded file is actual audio, not metadata.
    """
    logger.info(f"Validating file: {file_path}")
    
    # Check 1: File exists
    if not os.path.exists(file_path):
        logger.error("Validation failed: File not found")
        raise HTTPException(status_code=500, detail="Download failed: File not found")
    
    # Check 2: File size > 10KB
    file_size = os.path.getsize(file_path)
    if file_size < 10240:  # 10KB
        os.remove(file_path) # Clean up the bad file
        logger.error(f"Validation failed: File too small ({file_size} bytes) - likely metadata only")
        raise HTTPException(
            status_code=422, 
            detail="Could not extract audio. Please try YouTube Shorts or upload file."
        )
    
    # Check 3: File is audio/video format
    valid_exts = ['.mp3', '.m4a', '.mp4', '.webm', '.opus', '.wav']
    if not any(file_path.lower().endswith(ext) for ext in valid_exts):
        os.remove(file_path)
        logger.error(f"Validation failed: Invalid file format for {file_path}")
        raise HTTPException(
            status_code=422, 
            detail="Could not extract audio. Invalid file format."
        )
    
    # Check 4: Try to get duration using mutagen
    try:
        from mutagen import File as MutagenFile
        audio = MutagenFile(file_path)
        if audio and hasattr(audio, 'info') and hasattr(audio.info, 'length'):
            if audio.info.length < 1:
                os.remove(file_path)
                logger.error(f"Validation failed: Audio duration too short ({audio.info.length}s)")
                raise HTTPException(
                    status_code=422, 
                    detail="Could not extract audio. Video is too short."
                )
            logger.info(f"File validation passed. Duration: {audio.info.length:.2f}s, Size: {file_size/1024:.2f}KB")
        else:
            logger.warning("Mutagen could not determine duration, but file size is OK. Proceeding.")
    except ImportError:
        logger.warning("Mutagen not installed, skipping duration check. Proceeding based on file size.")
    except Exception as e:
        logger.warning(f"Mutagen check failed: {str(e)}. Proceeding based on file size.")
    
    return True
