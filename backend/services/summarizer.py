import os
import logging
from groq import Groq
from fastapi import HTTPException

logger = logging.getLogger(__name__)

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    logger.error("GROQ_API_KEY not found")
    client = None
else:
    client = Groq(api_key=api_key)

def generate_summary(transcript: str) -> str:
    """
    Generates a structured summary from the transcript using Groq API.
    """
    if not client:
        raise HTTPException(status_code=500, detail="Groq API key not configured")

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
    
    models_to_try = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
    ]

    last_error = None
    for model_name in models_to_try:
        try:
            logger.info(f"Attempting summarization with model: {model_name}")
            completion = client.chat.completions.create(
                model=model_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert content summarizer."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=1024,
            )
            
            summary_text = completion.choices[0].message.content
            
            if not summary_text:
                logger.warning(f"Model {model_name} returned empty summary")
                continue
                
            logger.info(f"Summarization successful with model: {model_name}")
            return summary_text.strip()
            
        except Exception as e:
            logger.warning(f"Model {model_name} failed: {str(e)}")
            last_error = e
            continue

    # If all models fail
    logger.error(f"All Groq models failed. Last error: {str(last_error)}")
    
    if last_error and ("429" in str(last_error) or "rate_limit" in str(last_error).lower()):
        raise HTTPException(
            status_code=429, 
            detail="Summarization rate limit exceeded. Please try again later."
        )
        
    raise HTTPException(
        status_code=500, 
        detail="Error during summarization process"
    )
