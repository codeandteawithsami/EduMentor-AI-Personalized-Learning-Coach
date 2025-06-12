from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from LeemboAI import LeemboAI
from typing import List

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
mentor = LeemboAI()

class TopicRequest(BaseModel):
    topic: str

class AssessmentRequest(BaseModel):
    topic: str
    assessment: Dict

class TrendingTopicsRequest(BaseModel):
    limit: int
    user_age: int = Field(..., alias="userAge")
    user_preferences: List[str] = Field(..., alias="userPreferences")

    class Config:
        validate_by_name = True

class AssessmentResponse(BaseModel):
    topic: str
    assessment: Dict

class TrendingTopicsResponse(BaseModel):
    topics: List[str]

class LearningResponse(BaseModel):
    topic: str
    assessment: Dict
    resources: List[Dict]
    explanation: str
    quiz: List[Dict]

class RecommendedCoursesRequest(BaseModel):
    userPreferences: List[str] = Field(default=[])
    currentTopic: str = Field(default="")
    limit: int = Field(default=4)

class CourseResponse(BaseModel):
    id: str
    title: str
    platform: str
    instructor: str
    duration: str
    rating: float
    thumbnail: str
    url: str
    tags: List[str]

class RecommendedCoursesResponse(BaseModel):
    courses: List[CourseResponse]
    
@app.post("/api/assess", response_model=AssessmentResponse)
async def get_assessment(request: TopicRequest):
    """Get initial assessment for user approval."""
    try:
        result = mentor.get_initial_assessment(request.topic)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/learn", response_model=LearningResponse)
async def continue_learning(request: AssessmentRequest):
    """Continue learning process with approved assessment."""
    try:
        result = mentor.continue_with_assessment(request.topic, request.assessment)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/trending_topics", response_model=TrendingTopicsResponse)
async def get_trending_topics(request: TrendingTopicsRequest):
    """Get trending educational topics based on user age and preferences."""
    try:
        topics = mentor.get_trending_topics(
            limit=request.limit,
            user_age=request.user_age,  # ✅ snake_case here
            user_preferences=request.user_preferences  # ✅ snake_case here
        )
        return {"topics": topics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommended_courses", response_model=RecommendedCoursesResponse)
async def get_recommended_courses(request: RecommendedCoursesRequest):
    """Get recommended video courses based on user preferences and current topic."""
    try:
        courses = mentor.get_recommended_courses(
            user_preferences=request.userPreferences,
            current_topic=request.currentTopic,
            limit=request.limit
        )
        return {"courses": courses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)