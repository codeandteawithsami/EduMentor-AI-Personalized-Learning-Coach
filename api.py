from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from edumentor import EduMentorAI

app = FastAPI(title="EduMentor AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize EduMentor AI
mentor = EduMentorAI()

class TopicRequest(BaseModel):
    topic: str

class LearningResponse(BaseModel):
    assessment: Dict
    resources: List[Dict]
    explanation: str
    quiz: List[Dict]

@app.post("/api/learn", response_model=LearningResponse)
async def learn_topic(request: TopicRequest):
    try:
        result = mentor.learn_topic(request.topic)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 