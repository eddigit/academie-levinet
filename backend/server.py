from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from enum import Enum
from email_service import send_email, get_welcome_email_html, get_lead_notification_html, get_lead_confirmation_html, get_new_message_notification_html
import asyncio
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

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

class PostType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    ACHIEVEMENT = "achievement"
    EVENT = "event"

class ReactionType(str, Enum):
    LIKE = "like"
    LOVE = "love"
    FIRE = "fire"
    CLAP = "clap"
    STRONG = "strong"

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

# Messaging Models
class Conversation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    participants: List[str]  # List of user IDs
    participant_names: List[str]  # List of user names for display
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    last_sender_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ConversationCreate(BaseModel):
    recipient_id: str

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    sender_id: str
    sender_name: str
    content: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender_name: str
    content: str
    read: bool
    created_at: datetime

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

# Events Routes
@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, current_user: dict = Depends(get_current_user)):
    event_dict = event_data.model_dump()
    event_dict['created_by'] = current_user['id']
    event_dict['current_participants'] = 0
    
    event = Event(**event_dict)
    doc = event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.events.insert_one(doc)
    return event

@api_router.get("/events", response_model=List[Event])
async def get_events(
    event_type: Optional[str] = None,
    status: Optional[str] = None,
    city: Optional[str] = None,
    limit: int = 100
):
    query = {}
    if event_type:
        query['event_type'] = event_type
    if status:
        query['status'] = status
    if city:
        query['city'] = city
    
    events = await db.events.find(query, {"_id": 0}).sort("start_date", 1).limit(limit).to_list(limit)
    for event in events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
        if isinstance(event.get('updated_at'), str):
            event['updated_at'] = datetime.fromisoformat(event['updated_at'])
    return events

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if isinstance(event.get('created_at'), str):
        event['created_at'] = datetime.fromisoformat(event['created_at'])
    if isinstance(event.get('updated_at'), str):
        event['updated_at'] = datetime.fromisoformat(event['updated_at'])
    return event

@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, event_data: EventUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in event_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.events.update_one({"id": event_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    
    updated = await db.events.find_one({"id": event_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return updated

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

# Event Registrations
@api_router.post("/events/{event_id}/register")
async def register_for_event(event_id: str, current_user: dict = Depends(get_current_user)):
    # Check if event exists
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if already registered
    existing = await db.event_registrations.find_one({
        "event_id": event_id,
        "member_id": current_user['id']
    }, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    # Check max participants
    if event.get('max_participants') and event['current_participants'] >= event['max_participants']:
        raise HTTPException(status_code=400, detail="Event is full")
    
    # Create registration
    registration = EventRegistration(
        event_id=event_id,
        member_id=current_user['id'],
        member_name=current_user['full_name'],
        member_email=current_user['email']
    )
    doc = registration.model_dump()
    doc['registration_date'] = doc['registration_date'].isoformat()
    
    await db.event_registrations.insert_one(doc)
    
    # Update event participants count
    await db.events.update_one({"id": event_id}, {"$inc": {"current_participants": 1}})
    
    return registration

@api_router.get("/events/{event_id}/registrations", response_model=List[EventRegistration])
async def get_event_registrations(event_id: str, current_user: dict = Depends(get_current_user)):
    registrations = await db.event_registrations.find({"event_id": event_id}, {"_id": 0}).to_list(1000)
    for reg in registrations:
        if isinstance(reg.get('registration_date'), str):
            reg['registration_date'] = datetime.fromisoformat(reg['registration_date'])
    return registrations

@api_router.get("/my-registrations", response_model=List[EventRegistration])
async def get_my_registrations(current_user: dict = Depends(get_current_user)):
    registrations = await db.event_registrations.find({"member_id": current_user['id']}, {"_id": 0}).to_list(1000)
    for reg in registrations:
        if isinstance(reg.get('registration_date'), str):
            reg['registration_date'] = datetime.fromisoformat(reg['registration_date'])
    return registrations

@api_router.delete("/events/{event_id}/register")
async def unregister_from_event(event_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.event_registrations.delete_one({
        "event_id": event_id,
        "member_id": current_user['id']
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    # Update event participants count
    await db.events.update_one({"id": event_id}, {"$inc": {"current_participants": -1}})
    
    return {"message": "Unregistered successfully"}

# =====================
# MESSAGING ROUTES
# =====================

@api_router.get("/users/search")
async def search_users(q: str = "", current_user: dict = Depends(get_current_user)):
    """Search users by name or email for starting conversations"""
    if len(q) < 2:
        return []
    
    # Search in users (admins), members, and technical directors
    results = []
    
    # Search users
    users = await db.users.find({
        "$and": [
            {"id": {"$ne": current_user['id']}},
            {"$or": [
                {"full_name": {"$regex": q, "$options": "i"}},
                {"email": {"$regex": q, "$options": "i"}}
            ]}
        ]
    }, {"_id": 0, "password_hash": 0}).to_list(10)
    
    for u in users:
        results.append({
            "id": u['id'],
            "name": u['full_name'],
            "email": u['email'],
            "type": "Admin"
        })
    
    # Search members
    members = await db.members.find({
        "$or": [
            {"first_name": {"$regex": q, "$options": "i"}},
            {"last_name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}}
        ]
    }, {"_id": 0}).to_list(10)
    
    for m in members:
        if m['id'] != current_user['id']:
            results.append({
                "id": m['id'],
                "name": f"{m['first_name']} {m['last_name']}",
                "email": m['email'],
                "type": "Membre"
            })
    
    # Search technical directors
    directors = await db.technical_directors.find({
        "$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}}
        ]
    }, {"_id": 0}).to_list(10)
    
    for d in directors:
        if d['id'] != current_user['id']:
            results.append({
                "id": d['id'],
                "name": d['name'],
                "email": d['email'],
                "type": "Directeur Technique"
            })
    
    return results[:15]  # Limit total results

@api_router.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    """Get all conversations for the current user"""
    conversations = await db.conversations.find(
        {"participants": current_user['id']},
        {"_id": 0}
    ).sort("updated_at", -1).to_list(100)
    
    # Convert datetime strings and add unread count
    for conv in conversations:
        if isinstance(conv.get('created_at'), str):
            conv['created_at'] = datetime.fromisoformat(conv['created_at'])
        if isinstance(conv.get('updated_at'), str):
            conv['updated_at'] = datetime.fromisoformat(conv['updated_at'])
        if conv.get('last_message_at') and isinstance(conv.get('last_message_at'), str):
            conv['last_message_at'] = datetime.fromisoformat(conv['last_message_at'])
        
        # Get unread count for this conversation
        unread_count = await db.messages.count_documents({
            "conversation_id": conv['id'],
            "sender_id": {"$ne": current_user['id']},
            "read": False
        })
        conv['unread_count'] = unread_count
        
        # Get the other participant's name
        other_participant_idx = 1 if conv['participants'][0] == current_user['id'] else 0
        conv['other_participant_name'] = conv['participant_names'][other_participant_idx] if len(conv['participant_names']) > other_participant_idx else "Utilisateur"
        conv['other_participant_id'] = conv['participants'][other_participant_idx] if len(conv['participants']) > other_participant_idx else None
    
    return conversations

@api_router.post("/conversations")
async def create_conversation(data: ConversationCreate, current_user: dict = Depends(get_current_user)):
    """Create a new conversation or return existing one"""
    # Check if conversation already exists between these users
    existing = await db.conversations.find_one({
        "participants": {"$all": [current_user['id'], data.recipient_id]}
    }, {"_id": 0})
    
    if existing:
        if isinstance(existing.get('created_at'), str):
            existing['created_at'] = datetime.fromisoformat(existing['created_at'])
        if isinstance(existing.get('updated_at'), str):
            existing['updated_at'] = datetime.fromisoformat(existing['updated_at'])
        return existing
    
    # Get recipient name
    recipient_name = "Utilisateur"
    
    # Check in users
    recipient = await db.users.find_one({"id": data.recipient_id}, {"_id": 0})
    if recipient:
        recipient_name = recipient['full_name']
    else:
        # Check in members
        recipient = await db.members.find_one({"id": data.recipient_id}, {"_id": 0})
        if recipient:
            recipient_name = f"{recipient['first_name']} {recipient['last_name']}"
        else:
            # Check in technical directors
            recipient = await db.technical_directors.find_one({"id": data.recipient_id}, {"_id": 0})
            if recipient:
                recipient_name = recipient['name']
    
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Create conversation
    conversation = Conversation(
        participants=[current_user['id'], data.recipient_id],
        participant_names=[current_user['full_name'], recipient_name]
    )
    
    doc = conversation.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.conversations.insert_one(doc)
    
    return conversation

@api_router.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Get messages for a conversation"""
    # Verify user is participant
    conversation = await db.conversations.find_one({
        "id": conversation_id,
        "participants": current_user['id']
    }, {"_id": 0})
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = await db.messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    
    # Mark messages as read
    await db.messages.update_many(
        {
            "conversation_id": conversation_id,
            "sender_id": {"$ne": current_user['id']},
            "read": False
        },
        {"$set": {"read": True}}
    )
    
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    
    return messages

@api_router.post("/conversations/{conversation_id}/messages")
async def send_message(conversation_id: str, data: MessageCreate, current_user: dict = Depends(get_current_user)):
    """Send a message in a conversation"""
    # Verify user is participant
    conversation = await db.conversations.find_one({
        "id": conversation_id,
        "participants": current_user['id']
    }, {"_id": 0})
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Create message
    message = Message(
        conversation_id=conversation_id,
        sender_id=current_user['id'],
        sender_name=current_user['full_name'],
        content=data.content
    )
    
    doc = message.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.messages.insert_one(doc)
    
    # Update conversation
    await db.conversations.update_one(
        {"id": conversation_id},
        {
            "$set": {
                "last_message": data.content[:100],  # Truncate for preview
                "last_message_at": datetime.now(timezone.utc).isoformat(),
                "last_sender_id": current_user['id'],
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Send email notification to recipient (non-blocking)
    other_participant_id = conversation['participants'][1] if conversation['participants'][0] == current_user['id'] else conversation['participants'][0]
    
    # Find recipient email
    recipient = await db.users.find_one({"id": other_participant_id}, {"_id": 0})
    if not recipient:
        recipient = await db.members.find_one({"id": other_participant_id}, {"_id": 0})
    if not recipient:
        recipient = await db.technical_directors.find_one({"id": other_participant_id}, {"_id": 0})
    
    if recipient and recipient.get('email'):
        recipient_name = recipient.get('full_name') or recipient.get('name') or f"{recipient.get('first_name', '')} {recipient.get('last_name', '')}".strip()
        asyncio.create_task(send_email(
            to_email=recipient['email'],
            subject=f"Nouveau message de {current_user['full_name']}",
            html_content=get_new_message_notification_html(
                recipient_name=recipient_name,
                sender_name=current_user['full_name'],
                message_preview=data.content[:200]
            ),
            text_content=f"Vous avez reçu un nouveau message de {current_user['full_name']}: {data.content[:200]}"
        ))
    
    return message

@api_router.get("/conversations/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get total unread message count for the current user"""
    # Get all conversation IDs for this user
    conversations = await db.conversations.find(
        {"participants": current_user['id']},
        {"id": 1}
    ).to_list(1000)
    
    conversation_ids = [c['id'] for c in conversations]
    
    unread_count = await db.messages.count_documents({
        "conversation_id": {"$in": conversation_ids},
        "sender_id": {"$ne": current_user['id']},
        "read": False
    })
    
    return {"unread_count": unread_count}

# Admin Messaging Routes (Moderation)
@api_router.get("/admin/messages")
async def admin_get_all_messages(
    limit: int = 100,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Admin: Get all messages for moderation"""
    if current_user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    messages = await db.messages.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    
    total = await db.messages.count_documents({})
    
    return {"messages": messages, "total": total}

@api_router.delete("/admin/messages/{message_id}")
async def admin_delete_message(message_id: str, current_user: dict = Depends(get_current_user)):
    """Admin: Delete a message (moderation)"""
    if current_user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"message": "Message deleted successfully"}

@api_router.get("/admin/conversations")
async def admin_get_all_conversations(
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Admin: Get all conversations for moderation"""
    if current_user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    conversations = await db.conversations.find({}, {"_id": 0}).sort("updated_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for conv in conversations:
        if isinstance(conv.get('created_at'), str):
            conv['created_at'] = datetime.fromisoformat(conv['created_at'])
        if isinstance(conv.get('updated_at'), str):
            conv['updated_at'] = datetime.fromisoformat(conv['updated_at'])
        if conv.get('last_message_at') and isinstance(conv.get('last_message_at'), str):
            conv['last_message_at'] = datetime.fromisoformat(conv['last_message_at'])
        
        # Count messages in conversation
        msg_count = await db.messages.count_documents({"conversation_id": conv['id']})
        conv['message_count'] = msg_count
    
    total = await db.conversations.count_documents({})
    
    return {"conversations": conversations, "total": total}

# ==================== SOCIAL WALL ENDPOINTS ====================

# Models for social wall
class PostCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    post_type: str = "text"
    image_url: Optional[str] = None
    video_url: Optional[str] = None

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class ReactionCreate(BaseModel):
    reaction_type: str = "like"

@api_router.get("/wall/posts")
async def get_wall_posts(
    limit: int = 20,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get all posts for the community wall"""
    posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich posts with author info, comments count, reactions
    for post in posts:
        # Get author info
        author = await db.users.find_one({"id": post.get("author_id")}, {"_id": 0, "password_hash": 0})
        post["author"] = author
        
        # Get comments count
        comments_count = await db.post_comments.count_documents({"post_id": post["id"]})
        post["comments_count"] = comments_count
        
        # Get reactions summary
        reactions = await db.post_reactions.find({"post_id": post["id"]}, {"_id": 0}).to_list(100)
        reaction_summary = {}
        user_reaction = None
        for r in reactions:
            rt = r.get("reaction_type", "like")
            reaction_summary[rt] = reaction_summary.get(rt, 0) + 1
            if r.get("user_id") == current_user.get("id"):
                user_reaction = rt
        post["reactions"] = reaction_summary
        post["reactions_count"] = len(reactions)
        post["user_reaction"] = user_reaction
    
    total = await db.posts.count_documents({})
    return {"posts": posts, "total": total}

@api_router.post("/wall/posts")
async def create_post(
    post_data: PostCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new post on the community wall"""
    post = {
        "id": str(uuid.uuid4()),
        "author_id": current_user.get("id"),
        "content": post_data.content,
        "post_type": post_data.post_type,
        "image_url": post_data.image_url,
        "video_url": post_data.video_url,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.posts.insert_one(post)
    
    # Remove MongoDB _id for response
    post.pop("_id", None)
    
    # Return with author info
    post["author"] = {
        "id": current_user.get("id"),
        "full_name": current_user.get("full_name"),
        "email": current_user.get("email"),
        "role": current_user.get("role")
    }
    post["comments_count"] = 0
    post["reactions"] = {}
    post["reactions_count"] = 0
    post["user_reaction"] = None
    
    return post

@api_router.delete("/wall/posts/{post_id}")
async def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a post (author or admin only)"""
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.get("author_id") != current_user.get("id") and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    await db.posts.delete_one({"id": post_id})
    await db.post_comments.delete_many({"post_id": post_id})
    await db.post_reactions.delete_many({"post_id": post_id})
    
    return {"message": "Post deleted successfully"}

@api_router.get("/wall/posts/{post_id}/comments")
async def get_post_comments(
    post_id: str,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get comments for a specific post"""
    comments = await db.post_comments.find({"post_id": post_id}, {"_id": 0}).sort("created_at", 1).limit(limit).to_list(limit)
    
    # Enrich with author info
    for comment in comments:
        author = await db.users.find_one({"id": comment.get("author_id")}, {"_id": 0, "password_hash": 0})
        comment["author"] = author
    
    return {"comments": comments}

@api_router.post("/wall/posts/{post_id}/comments")
async def create_comment(
    post_id: str,
    comment_data: CommentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Add a comment to a post"""
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment = {
        "id": str(uuid.uuid4()),
        "post_id": post_id,
        "author_id": current_user.get("id"),
        "content": comment_data.content,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.post_comments.insert_one(comment)
    
    # Remove MongoDB _id for response
    comment.pop("_id", None)
    
    comment["author"] = {
        "id": current_user.get("id"),
        "full_name": current_user.get("full_name"),
        "email": current_user.get("email")
    }
    
    return comment

@api_router.delete("/wall/posts/{post_id}/comments/{comment_id}")
async def delete_comment(
    post_id: str,
    comment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a comment (author or admin only)"""
    comment = await db.post_comments.find_one({"id": comment_id, "post_id": post_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.get("author_id") != current_user.get("id") and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    await db.post_comments.delete_one({"id": comment_id})
    return {"message": "Comment deleted successfully"}

@api_router.post("/wall/posts/{post_id}/reactions")
async def toggle_reaction(
    post_id: str,
    reaction_data: ReactionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Toggle a reaction on a post"""
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    existing = await db.post_reactions.find_one({
        "post_id": post_id,
        "user_id": current_user.get("id")
    })
    
    if existing:
        if existing.get("reaction_type") == reaction_data.reaction_type:
            # Remove reaction
            await db.post_reactions.delete_one({"id": existing["id"]})
            return {"action": "removed", "reaction_type": None}
        else:
            # Update reaction
            await db.post_reactions.update_one(
                {"id": existing["id"]},
                {"$set": {"reaction_type": reaction_data.reaction_type}}
            )
            return {"action": "updated", "reaction_type": reaction_data.reaction_type}
    else:
        # Add reaction
        reaction = {
            "id": str(uuid.uuid4()),
            "post_id": post_id,
            "user_id": current_user.get("id"),
            "reaction_type": reaction_data.reaction_type,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.post_reactions.insert_one(reaction)
        return {"action": "added", "reaction_type": reaction_data.reaction_type}

@api_router.get("/wall/online-users")
async def get_online_users(current_user: dict = Depends(get_current_user)):
    """Get recently active users (active in last 15 minutes)"""
    # Update current user's last activity
    await db.user_activity.update_one(
        {"user_id": current_user.get("id")},
        {"$set": {
            "user_id": current_user.get("id"),
            "last_active": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    # Get users active in last 15 minutes
    threshold = (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat()
    active_records = await db.user_activity.find(
        {"last_active": {"$gte": threshold}},
        {"_id": 0}
    ).to_list(100)
    
    online_users = []
    for record in active_records:
        user = await db.users.find_one(
            {"id": record.get("user_id")},
            {"_id": 0, "password_hash": 0}
        )
        if user:
            online_users.append(user)
    
    return {"online_users": online_users, "count": len(online_users)}

@api_router.get("/wall/stats")
async def get_wall_stats(current_user: dict = Depends(get_current_user)):
    """Get community statistics"""
    total_members = await db.users.count_documents({})
    total_posts = await db.posts.count_documents({})
    total_comments = await db.post_comments.count_documents({})
    
    # Posts this week
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    posts_this_week = await db.posts.count_documents({"created_at": {"$gte": week_ago}})
    
    # Get recent achievements/milestones
    recent_members = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "total_members": total_members,
        "total_posts": total_posts,
        "total_comments": total_comments,
        "posts_this_week": posts_this_week,
        "recent_members": recent_members
    }

# ==================== STRIPE PAYMENT ENDPOINTS ====================

# Payment packages (fixed prices - never accept amounts from frontend)
PAYMENT_PACKAGES = {
    "premium": {
        "name": "Abonnement Premium",
        "amount": 5.99,
        "currency": "eur",
        "type": "subscription",
        "interval": "month",
        "description": "10% de remise sur la boutique, 10% sur les cahiers techniques, 10% sur les stages"
    },
}

class CheckoutRequest(BaseModel):
    package_id: str
    origin_url: str
    metadata: Optional[Dict[str, str]] = None

@api_router.post("/payments/checkout")
async def create_checkout_session(request: CheckoutRequest, http_request: Request):
    """Create a Stripe checkout session for a payment package"""
    
    # Validate package exists
    if request.package_id not in PAYMENT_PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package ID")
    
    package = PAYMENT_PACKAGES[request.package_id]
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment system not configured")
    
    # Build URLs from frontend origin
    success_url = f"{request.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{request.origin_url}/payment/cancel"
    
    # Initialize Stripe
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    # Create metadata
    metadata = request.metadata or {}
    metadata["package_id"] = request.package_id
    metadata["package_name"] = package["name"]
    
    # Create checkout session
    checkout_request = CheckoutSessionRequest(
        amount=package["amount"],
        currency=package["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Save transaction to database
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "package_id": request.package_id,
        "package_name": package["name"],
        "amount": package["amount"],
        "currency": package["currency"],
        "status": "pending",
        "payment_status": "initiated",
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    """Get the status of a payment session"""
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment system not configured")
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    try:
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Update transaction in database
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "status": status.status,
                "payment_status": status.payment_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency,
            "metadata": status.metadata
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/payments/packages")
async def get_payment_packages():
    """Get all available payment packages"""
    return {"packages": PAYMENT_PACKAGES}

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment system not configured")
    
    # Get request body and signature
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update transaction based on webhook event
        if webhook_response.session_id:
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "status": webhook_response.event_type,
                    "payment_status": webhook_response.payment_status,
                    "webhook_event_id": webhook_response.event_id,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        
        return {"status": "success", "event_type": webhook_response.event_type}
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

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