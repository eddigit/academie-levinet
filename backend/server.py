from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Enums
class MembershipStatus(str, Enum):
    ACTIVE = "Actif"
    EXPIRED = "Expiré"
    PENDING = "En attente"

class MembershipType(str, Enum):
    STANDARD = "Standard"
    PREMIUM = "Premium"
    VIP = "VIP"

class BeltGrade(str, Enum):
    WHITE = "Ceinture Blanche"
    YELLOW = "Ceinture Jaune"
    ORANGE = "Ceinture Orange"
    GREEN = "Ceinture Verte"
    BLUE = "Ceinture Bleue"
    BROWN = "Ceinture Marron"
    BLACK = "Ceinture Noire"

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    full_name: str
    role: str = "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    user: dict

class TechnicalDirector(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    country: str
    city: str
    photo: Optional[str] = None
    members_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TechnicalDirectorCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    country: str
    city: str
    photo: Optional[str] = None

class Member(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    date_of_birth: str
    country: str
    city: str
    technical_director_id: str
    photo: Optional[str] = None
    belt_grade: BeltGrade
    membership_status: MembershipStatus
    membership_type: MembershipType
    membership_start_date: str
    membership_end_date: str
    sessions_attended: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MemberCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    date_of_birth: str
    country: str
    city: str
    technical_director_id: str
    photo: Optional[str] = None
    belt_grade: BeltGrade
    membership_type: MembershipType
    membership_start_date: str
    membership_end_date: str

class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    member_id: str
    amount: float
    payment_date: str
    payment_method: str
    status: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubscriptionCreate(BaseModel):
    member_id: str
    amount: float
    payment_date: str
    payment_method: str
    status: str

class DashboardStats(BaseModel):
    total_members: int
    total_revenue: float
    active_memberships: int
    new_members_this_month: int
    revenue_change_percent: float
    members_by_month: List[dict]
    members_by_country: List[dict]
    recent_members: List[Member]

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user_data.model_dump()
    user_dict['password_hash'] = hash_password(user_data.password)
    del user_dict['password']
    
    user = User(**user_dict)
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    # Create a clean copy without _id for insertion
    insert_doc = {k: v for k, v in doc.items()}
    await db.users.insert_one(insert_doc)
    
    token = create_token(user.id, user.email)
    user_response = {k: v for k, v in doc.items() if k != 'password_hash' and k != '_id'}
    
    return {"token": token, "user": user_response}

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'])
    user_response = {k: v for k, v in user.items() if k != 'password_hash'}
    
    return {"token": token, "user": user_response}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != 'password_hash'}

# Technical Directors Routes
@api_router.post("/technical-directors", response_model=TechnicalDirector)
async def create_technical_director(director_data: TechnicalDirectorCreate, current_user: dict = Depends(get_current_user)):
    director = TechnicalDirector(**director_data.model_dump())
    doc = director.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.technical_directors.insert_one(doc)
    return director

@api_router.get("/technical-directors", response_model=List[TechnicalDirector])
async def get_technical_directors(current_user: dict = Depends(get_current_user)):
    directors = await db.technical_directors.find({}, {"_id": 0}).to_list(1000)
    for director in directors:
        if isinstance(director.get('created_at'), str):
            director['created_at'] = datetime.fromisoformat(director['created_at'])
        members_count = await db.members.count_documents({"technical_director_id": director['id']})
        director['members_count'] = members_count
    return directors

@api_router.get("/technical-directors/{director_id}", response_model=TechnicalDirector)
async def get_technical_director(director_id: str, current_user: dict = Depends(get_current_user)):
    director = await db.technical_directors.find_one({"id": director_id}, {"_id": 0})
    if not director:
        raise HTTPException(status_code=404, detail="Director not found")
    if isinstance(director.get('created_at'), str):
        director['created_at'] = datetime.fromisoformat(director['created_at'])
    members_count = await db.members.count_documents({"technical_director_id": director_id})
    director['members_count'] = members_count
    return director

@api_router.put("/technical-directors/{director_id}", response_model=TechnicalDirector)
async def update_technical_director(director_id: str, director_data: TechnicalDirectorCreate, current_user: dict = Depends(get_current_user)):
    update_data = director_data.model_dump()
    result = await db.technical_directors.update_one({"id": director_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Director not found")
    updated = await db.technical_directors.find_one({"id": director_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    members_count = await db.members.count_documents({"technical_director_id": director_id})
    updated['members_count'] = members_count
    return updated

@api_router.delete("/technical-directors/{director_id}")
async def delete_technical_director(director_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.technical_directors.delete_one({"id": director_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Director not found")
    return {"message": "Director deleted successfully"}

# Members Routes
@api_router.post("/members", response_model=Member)
async def create_member(member_data: MemberCreate, current_user: dict = Depends(get_current_user)):
    member_dict = member_data.model_dump()
    member_dict['membership_status'] = MembershipStatus.ACTIVE
    member_dict['sessions_attended'] = 0
    
    member = Member(**member_dict)
    doc = member.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.members.insert_one(doc)
    return member

@api_router.get("/members", response_model=List[Member])
async def get_members(
    country: Optional[str] = None,
    city: Optional[str] = None,
    technical_director_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if country:
        query['country'] = country
    if city:
        query['city'] = city
    if technical_director_id:
        query['technical_director_id'] = technical_director_id
    if status:
        query['membership_status'] = status
    
    members = await db.members.find(query, {"_id": 0}).to_list(1000)
    for member in members:
        if isinstance(member.get('created_at'), str):
            member['created_at'] = datetime.fromisoformat(member['created_at'])
    return members

@api_router.get("/members/{member_id}", response_model=Member)
async def get_member(member_id: str, current_user: dict = Depends(get_current_user)):
    member = await db.members.find_one({"id": member_id}, {"_id": 0})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if isinstance(member.get('created_at'), str):
        member['created_at'] = datetime.fromisoformat(member['created_at'])
    return member

@api_router.put("/members/{member_id}", response_model=Member)
async def update_member(member_id: str, member_data: MemberCreate, current_user: dict = Depends(get_current_user)):
    update_data = member_data.model_dump()
    result = await db.members.update_one({"id": member_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    updated = await db.members.find_one({"id": member_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/members/{member_id}")
async def delete_member(member_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.members.delete_one({"id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member deleted successfully"}

# Subscriptions Routes
@api_router.post("/subscriptions", response_model=Subscription)
async def create_subscription(sub_data: SubscriptionCreate, current_user: dict = Depends(get_current_user)):
    subscription = Subscription(**sub_data.model_dump())
    doc = subscription.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.subscriptions.insert_one(doc)
    return subscription

@api_router.get("/subscriptions", response_model=List[Subscription])
async def get_subscriptions(member_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"member_id": member_id} if member_id else {}
    subscriptions = await db.subscriptions.find(query, {"_id": 0}).to_list(1000)
    for sub in subscriptions:
        if isinstance(sub.get('created_at'), str):
            sub['created_at'] = datetime.fromisoformat(sub['created_at'])
    return subscriptions

# Dashboard Routes
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    total_members = await db.members.count_documents({})
    active_memberships = await db.members.count_documents({"membership_status": "Actif"})
    
    subscriptions = await db.subscriptions.find({}, {"_id": 0}).to_list(10000)
    total_revenue = sum(sub['amount'] for sub in subscriptions)
    
    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_members_this_month = await db.members.count_documents({
        "created_at": {"$gte": start_of_month.isoformat()}
    })
    
    members_by_month = [
        {"month": "Jan", "count": 12},
        {"month": "Fév", "count": 19},
        {"month": "Mar", "count": 15},
        {"month": "Avr", "count": 22},
        {"month": "Mai", "count": 18},
        {"month": "Jun", "count": 25},
        {"month": "Jul", "count": 30}
    ]
    
    members = await db.members.find({}, {"_id": 0}).to_list(1000)
    members_by_country_dict = {}
    for member in members:
        country = member.get('country', 'Unknown')
        members_by_country_dict[country] = members_by_country_dict.get(country, 0) + 1
    
    members_by_country = [{"country": k, "count": v} for k, v in members_by_country_dict.items()]
    
    recent_members_list = await db.members.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    for member in recent_members_list:
        if isinstance(member.get('created_at'), str):
            member['created_at'] = datetime.fromisoformat(member['created_at'])
    
    return {
        "total_members": total_members,
        "total_revenue": total_revenue,
        "active_memberships": active_memberships,
        "new_members_this_month": new_members_this_month,
        "revenue_change_percent": 12.5,
        "members_by_month": members_by_month,
        "members_by_country": members_by_country,
        "recent_members": recent_members_list
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()