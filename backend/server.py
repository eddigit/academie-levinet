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
from email_service import send_email, get_welcome_email_html, get_lead_notification_html, get_lead_confirmation_html
import asyncio

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

class LeadPersonType(str, Enum):
    WOMAN = "Femme"
    MAN = "Homme"
    CHILD = "Enfant"
    PROFESSIONAL = "Professionnel"

class LeadStatus(str, Enum):
    NEW = "Nouveau"
    CONTACTED = "Contacté"
    CONVERTED = "Converti"
    NOT_INTERESTED = "Non intéressé"

class NewsCategory(str, Enum):
    EVENT = "Événement"
    RESULT = "Résultat"
    TRAINING = "Formation"
    ANNOUNCEMENT = "Annonce"
    ACHIEVEMENT = "Réussite"
    TECHNIQUE = "Technique"

class NewsStatus(str, Enum):
    DRAFT = "Brouillon"
    PUBLISHED = "Publié"

class EventType(str, Enum):
    STAGE = "Stage"
    COURSE = "Cours"
    COMPETITION = "Compétition"
    EXAM = "Examen de Grade"
    SEMINAR = "Séminaire"
    WORKSHOP = "Workshop"

class EventStatus(str, Enum):
    UPCOMING = "À venir"
    ONGOING = "En cours"
    COMPLETED = "Terminé"
    CANCELLED = "Annulé"

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

class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    person_type: LeadPersonType
    motivations: List[str]
    full_name: str
    email: EmailStr
    phone: str
    city: str
    country: str
    status: LeadStatus = LeadStatus.NEW
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LeadCreate(BaseModel):
    person_type: LeadPersonType
    motivations: List[str]
    full_name: str
    email: EmailStr
    phone: str
    city: str
    country: str

class News(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    excerpt: str
    category: NewsCategory
    status: NewsStatus = NewsStatus.DRAFT
    image_url: Optional[str] = None
    author_id: str
    author_name: str
    views: int = 0
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NewsCreate(BaseModel):
    title: str
    content: str
    excerpt: str
    category: NewsCategory
    status: NewsStatus = NewsStatus.DRAFT
    image_url: Optional[str] = None

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    category: Optional[NewsCategory] = None
    status: Optional[NewsStatus] = None
    image_url: Optional[str] = None

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    event_type: EventType
    start_date: str
    end_date: str
    start_time: str
    end_time: str
    location: str
    city: str
    country: str
    instructor: Optional[str] = None
    max_participants: Optional[int] = None
    current_participants: int = 0
    price: float = 0.0
    image_url: Optional[str] = None
    status: EventStatus = EventStatus.UPCOMING
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    title: str
    description: str
    event_type: EventType
    start_date: str
    end_date: str
    start_time: str
    end_time: str
    location: str
    city: str
    country: str
    instructor: Optional[str] = None
    max_participants: Optional[int] = None
    price: float = 0.0
    image_url: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[EventType] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    instructor: Optional[str] = None
    max_participants: Optional[int] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    status: Optional[EventStatus] = None

class EventRegistration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    member_id: str
    member_name: str
    member_email: str
    registration_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "Confirmé"
    payment_status: str = "En attente"

class EventRegistrationCreate(BaseModel):
    event_id: str
    member_id: str

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
    
    # Send welcome email (non-blocking)
    asyncio.create_task(send_email(
        to_email=user.email,
        subject=f"Bienvenue à l'Académie Jacques Levinet, {user.full_name} !",
        html_content=get_welcome_email_html(user.full_name, user.email),
        text_content=f"Bienvenue {user.full_name}! Votre compte a été créé avec succès."
    ))
    
    token = create_token(user.id, user.email)
    user_response = {k: v for k, v in doc.items() if k != 'password_hash' and k != '_id'}
    
    return {"token": token, "user": user_response}

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'])
    user_response = {k: v for k, v in user.items() if k != 'password_hash' and k != '_id'}
    
    return {"token": token, "user": user_response}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != 'password_hash' and k != '_id'}

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

# Leads Routes
@api_router.post("/leads", response_model=Lead)
async def create_lead(lead_data: LeadCreate):
    lead = Lead(**lead_data.model_dump())
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.leads.insert_one(doc)
    
    # Send confirmation email to lead (non-blocking)
    asyncio.create_task(send_email(
        to_email=lead.email,
        subject="Votre demande a bien été reçue - Académie Jacques Levinet",
        html_content=get_lead_confirmation_html(lead.full_name),
        text_content=f"Bonjour {lead.full_name}, nous avons bien reçu votre demande et nous vous contacterons sous 48h."
    ))
    
    # Send notification to admin (non-blocking)
    admin_email = os.environ.get('SMTP_FROM_EMAIL')
    if admin_email:
        asyncio.create_task(send_email(
            to_email=admin_email,
            subject=f"🎯 Nouveau Lead : {lead.full_name} ({lead.person_type})",
            html_content=get_lead_notification_html(doc),
            text_content=f"Nouveau lead reçu : {lead.full_name} - {lead.email}"
        ))
    
    return lead

@api_router.get("/leads", response_model=List[Lead])
async def get_leads(
    status: Optional[str] = None,
    person_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if status:
        query['status'] = status
    if person_type:
        query['person_type'] = person_type
    
    leads = await db.leads.find(query, {"_id": 0}).to_list(1000)
    for lead in leads:
        if isinstance(lead.get('created_at'), str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    return leads

@api_router.get("/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if isinstance(lead.get('created_at'), str):
        lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    return lead

@api_router.put("/leads/{lead_id}/status")
async def update_lead_status(
    lead_id: str,
    status: LeadStatus,
    notes: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    update_data = {"status": status}
    if notes:
        update_data["notes"] = notes
    
    result = await db.leads.update_one({"id": lead_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    updated = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully"}

# News Routes
@api_router.post("/news", response_model=News)
async def create_news(news_data: NewsCreate, current_user: dict = Depends(get_current_user)):
    news_dict = news_data.model_dump()
    news_dict['author_id'] = current_user['id']
    news_dict['author_name'] = current_user['full_name']
    
    if news_data.status == NewsStatus.PUBLISHED:
        news_dict['published_at'] = datetime.now(timezone.utc).isoformat()
    
    news = News(**news_dict)
    doc = news.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc.get('published_at'):
        doc['published_at'] = doc['published_at'].isoformat()
    
    await db.news.insert_one(doc)
    return news

@api_router.get("/news", response_model=List[News])
async def get_news(
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 100
):
    query = {}
    if status:
        query['status'] = status
    if category:
        query['category'] = category
    
    news_list = await db.news.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    for news in news_list:
        if isinstance(news.get('created_at'), str):
            news['created_at'] = datetime.fromisoformat(news['created_at'])
        if isinstance(news.get('updated_at'), str):
            news['updated_at'] = datetime.fromisoformat(news['updated_at'])
        if news.get('published_at') and isinstance(news.get('published_at'), str):
            news['published_at'] = datetime.fromisoformat(news['published_at'])
    return news_list

@api_router.get("/news/{news_id}", response_model=News)
async def get_news_item(news_id: str):
    news = await db.news.find_one({"id": news_id}, {"_id": 0})
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    # Increment views
    await db.news.update_one({"id": news_id}, {"$inc": {"views": 1}})
    news['views'] += 1
    
    if isinstance(news.get('created_at'), str):
        news['created_at'] = datetime.fromisoformat(news['created_at'])
    if isinstance(news.get('updated_at'), str):
        news['updated_at'] = datetime.fromisoformat(news['updated_at'])
    if news.get('published_at') and isinstance(news.get('published_at'), str):
        news['published_at'] = datetime.fromisoformat(news['published_at'])
    return news

@api_router.put("/news/{news_id}", response_model=News)
async def update_news(news_id: str, news_data: NewsUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in news_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    # If changing status to published, set published_at
    if news_data.status == NewsStatus.PUBLISHED:
        existing = await db.news.find_one({"id": news_id}, {"_id": 0})
        if existing and not existing.get('published_at'):
            update_data['published_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.news.update_one({"id": news_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="News not found")
    
    updated = await db.news.find_one({"id": news_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    if updated.get('published_at') and isinstance(updated.get('published_at'), str):
        updated['published_at'] = datetime.fromisoformat(updated['published_at'])
    return updated

@api_router.delete("/news/{news_id}")
async def delete_news(news_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.news.delete_one({"id": news_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="News not found")
    return {"message": "News deleted successfully"}

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