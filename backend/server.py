from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Depends, Response, Cookie, Header
from fastapi.responses import StreamingResponse, FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
import uuid
import asyncio
from typing import Optional
import httpx

import sys
sys.path.append('/app/backend')

from models.user import UserCreate, User, LoginRequest, SignupRequest, AuthResponse
from models.video import JobStatus, VideoMetadata, EPReport
from models.profile import ProfileCreateRequest, UserProfile
from utils.auth import hash_password, verify_password, create_session_token, get_current_user
from utils.gridfs_helper import save_video_to_gridfs, get_video_from_gridfs
from services.video_processor import VideoProcessorService
from routes.profile import create_profile_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

video_processor = None

def get_video_processor():
    global video_processor
    if video_processor is None:
        video_processor = VideoProcessorService(db)
    return video_processor

@api_router.post("/auth/signup")
async def signup(request: SignupRequest, response: Response):
    existing = await db.users.find_one({"email": request.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = await hash_password(request.password)
    
    user_doc = {
        "user_id": user_id,
        "email": request.email,
        "name": request.name,
        "picture": None,
        "password_hash": hashed_pw,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    session_token = await create_session_token(db, user_id)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    
    return {"user": user, "session_token": session_token}

@api_router.post("/auth/login")
async def login(request: LoginRequest, response: Response):
    user_doc = await db.users.find_one({"email": request.email}, {"_id": 0})
    
    if not user_doc or not await verify_password(request.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    session_token = await create_session_token(db, user_doc["user_id"])
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user = {k: v for k, v in user_doc.items() if k != "password_hash"}
    
    return {"user": user, "session_token": session_token}

@api_router.get("/auth/google-redirect")
async def google_auth_redirect():
    redirect_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard"
    auth_url = f"https://auth.emergentagent.com/?redirect={redirect_url}"
    return {"auth_url": auth_url}

@api_router.get("/auth/session")
async def exchange_session(session_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        data = response.json()
        
        existing_user = await db.users.find_one({"email": data["email"]}, {"_id": 0})
        
        if existing_user:
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": data.get("name", existing_user["name"]),
                    "picture": data.get("picture", existing_user.get("picture"))
                }}
            )
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            user_doc = {
                "user_id": user_id,
                "email": data["email"],
                "name": data.get("name", ""),
                "picture": data.get("picture"),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
        
        session_token = data.get("session_token") or await create_session_token(db, user_id)
        
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        await db.user_sessions.update_one(
            {"session_token": session_token},
            {"$set": {
                "user_id": user_id,
                "session_token": session_token,
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
        
        return {"user": user, "session_token": session_token}

@api_router.get("/auth/me")
async def get_me(session_token: Optional[str] = Cookie(None), authorization: Optional[str] = Header(None)):
    user = await get_current_user(db, session_token, authorization)
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
        response.delete_cookie("session_token", path="/")
    return {"message": "Logged out"}

@api_router.post("/videos/upload")
async def upload_video(
    file: UploadFile = File(...),
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    user = await get_current_user(db, session_token, authorization)
    
    if file.size and file.size > 200 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Video size exceeds 200MB limit")
    
    video_id = await save_video_to_gridfs(db, file)
    
    metadata_doc = {
        "video_id": video_id,
        "user_id": user["user_id"],
        "filename": file.filename,
        "file_size": file.size or 0,
        "format": file.content_type,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.video_metadata.insert_one(metadata_doc)
    
    return {"video_id": video_id, "message": "Video uploaded successfully"}

@api_router.post("/videos/{video_id}/process")
async def process_video(
    video_id: str,
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    user = await get_current_user(db, session_token, authorization)
    
    metadata = await db.video_metadata.find_one({"video_id": video_id, "user_id": user["user_id"]}, {"_id": 0})
    if not metadata:
        raise HTTPException(status_code=404, detail="Video not found")
    
    job_id = f"job_{uuid.uuid4().hex}"
    
    job_doc = {
        "job_id": job_id,
        "user_id": user["user_id"],
        "video_id": video_id,
        "status": "pending",
        "progress": 0.0,
        "current_step": "Initializing...",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.video_jobs.insert_one(job_doc)
    
    processor = get_video_processor()
    asyncio.create_task(processor.process_video(job_id, video_id, user["user_id"]))
    
    return {"job_id": job_id, "message": "Processing started"}

@api_router.get("/jobs/{job_id}/status")
async def get_job_status(
    job_id: str,
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    user = await get_current_user(db, session_token, authorization)
    
    job = await db.video_jobs.find_one({"job_id": job_id, "user_id": user["user_id"]}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

@api_router.get("/reports/{report_id}")
async def get_report(
    report_id: str,
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    user = await get_current_user(db, session_token, authorization)
    
    report = await db.ep_reports.find_one({"report_id": report_id, "user_id": user["user_id"]}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return report

@api_router.get("/reports")
async def list_reports(
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    user = await get_current_user(db, session_token, authorization)
    
    reports = await db.ep_reports.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    
    return {"reports": reports}

profile_router = create_profile_router(db)
api_router.include_router(profile_router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@api_router.get("/learning/daily-tip")
async def get_daily_tip(
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    user = await get_current_user(db, session_token, authorization)
    profile = await db.user_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    
    import openai
    client = openai.OpenAI(api_key=os.getenv("EMERGENT_LLM_KEY"))
    
    role_context = f"a {profile.get('role', 'Executive')} at {profile.get('seniority_level', 'Senior')} level" if profile else "an executive"
    
    prompt = f"""Generate a practical, actionable executive presence tip for {role_context}. 

Requirements:
- One specific technique or practice
- 2-3 sentences maximum
- Immediately actionable
- Focus on one of: gravitas, communication, presence, or storytelling
- Professional tone

Return ONLY the tip text, nothing else."""
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150
    )
    
    tip = response.choices[0].message.content.strip()
    category = ["Gravitas", "Communication", "Presence", "Storytelling"][hash(tip) % 4]
    
    return {
        "tip": tip,
        "category": category,
        "date": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/learning/ted-talks")
async def get_ted_talks(
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None)
):
    user = await get_current_user(db, session_token, authorization)
    
    talks = [
        {
            "id": 1,
            "title": "Your body language may shape who you are",
            "speaker": "Amy Cuddy",
            "duration": "21 min",
            "relevance": "Presence, Body Language, Confidence",
            "url": "https://www.ted.com/talks/amy_cuddy_your_body_language_may_shape_who_you_are",
            "description": "Learn how power posing and body language influence confidence and presence"
        },
        {
            "id": 2,
            "title": "How great leaders inspire action",
            "speaker": "Simon Sinek",
            "duration": "18 min",
            "relevance": "Vision Articulation, Leadership, Communication",
            "url": "https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action",
            "description": "Discover the power of starting with 'why' in leadership communication"
        },
        {
            "id": 3,
            "title": "The power of vulnerability",
            "speaker": "Brené Brown",
            "duration": "20 min",
            "relevance": "Authenticity, Emotional Intelligence, Connection",
            "url": "https://www.ted.com/talks/brene_brown_the_power_of_vulnerability",
            "description": "Understand how vulnerability strengthens authentic leadership"
        },
        {
            "id": 4,
            "title": "How to speak so that people want to listen",
            "speaker": "Julian Treasure",
            "duration": "10 min",
            "relevance": "Communication, Vocal Presence, Clarity",
            "url": "https://www.ted.com/talks/julian_treasure_how_to_speak_so_that_people_want_to_listen",
            "description": "Master vocal techniques for more effective speaking"
        },
        {
            "id": 5,
            "title": "The skill of self confidence",
            "speaker": "Dr. Ivan Joseph",
            "duration": "13 min",
            "relevance": "Confidence, Self-belief, Performance",
            "url": "https://www.ted.com/talks/ivan_joseph_the_skill_of_self_confidence",
            "description": "Build self-confidence through practice and self-talk"
        }
    ]
    
    return {"talks": talks}
