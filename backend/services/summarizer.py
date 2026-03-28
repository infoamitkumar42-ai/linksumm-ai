import os
import logging
import google.generativeai as genai
from fastapi import HTTPException

logger = logging.getLogger(__name__)

# Initialize Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    logger.error("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=api_key)

def generate_summary(transcript: str) -> str:
    """
    Generates a structured summary from the transcript using Gemini API.
    """
    prompt = f"""
    You are an expert content summarizer. Please read the following transcript from a video reel and generate a structured summary.
    
    The summary MUST be in the exact same language as the transcript provided below.
    
    Please format the output exactly as follows using Markdown:
    
    ## 📌 One-Line Summary
    [A single, concise sentence capturing the main idea]
    
    ## 📝 Key Points
    * [Point 1]
    * [Point 2]
    * [Point 3]
    (Provide 3 to 5 bullet points)
    
    ## 🎯 Action Items
    * [Action 1]
    * [Action 2]
    (Provide practical takeaways if applicable, otherwise state "None")
    
    ## 🏷️ Tags
    [#Tag1] [#Tag2] [#Tag3]
    
    Transcript:
    \"\"\"
    {transcript}
    \"\"\"
    """
    
    try:
        logger.info("Sending transcript to Gemini for summarization")
        
        # Use gemini-1.5-flash (fastest model)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        summary_text = response.text
        
        if not summary_text:
            raise HTTPException(
                status_code=500, 
                detail="Generated summary was empty"
            )
            
        logger.info("Summarization successful")
        return summary_text.strip()
        
    except Exception as e:
        logger.error(f"Summarization error: {str(e)}")
        # Handle rate limits (15 req/min on free tier)
        if "429" in str(e) or "quota" in str(e).lower() or "rate" in str(e).lower():
            raise HTTPException(
                status_code=429, 
                detail="Summarization rate limit exceeded. Please try again later."
            )
        raise HTTPException(
            status_code=500, 
            detail=f"Error during summarization: {str(e)}"
        )
