from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
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

# Configure logging early
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Mock emergentintegrations pour le deploiement (module non disponible sur PyPI)
try:
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    # Mocks pour Stripe Checkout
    from pydantic import BaseModel as PydanticBaseModel
    class CheckoutSessionRequest(PydanticBaseModel):
        price_id: Optional[str] = None
        product_name: Optional[str] = None
        unit_amount: Optional[int] = None
        currency: str = "eur"
        quantity: int = 1
        success_url: str = ""
        cancel_url: str = ""
        metadata: Optional[Dict] = None
        customer_email: Optional[str] = None
    
    class CheckoutSessionResponse(PydanticBaseModel):
        session_id: str = "mock_session_id"
        url: str = "https://checkout.stripe.com/mock"
    
    class CheckoutStatusResponse(PydanticBaseModel):
        status: str = "complete"
        payment_status: str = "paid"
        customer_email: Optional[str] = None
        amount_total: Optional[int] = None
        currency: Optional[str] = None
        metadata: Optional[Dict] = None
    
    class StripeCheckout:
        def __init__(self, api_key: str):
            self.api_key = api_key
        async def create_session(self, request):
            return CheckoutSessionResponse(session_id="mock_" + str(hash(str(request)))[:10], url="http://localhost:3000/payment-success")
        async def get_session_status(self, session_id: str):
            return CheckoutStatusResponse()
    
    # Mocks pour LLM Chat
    class UserMessage(PydanticBaseModel):
        content: str
    
    class LlmChat:
        def __init__(self, api_key: str = "", model: str = "gpt-4"):
            pass
        async def chat(self, messages, system_prompt: str = ""):
            return "Reponse mock du chatbot."
        async def generate(self, prompt: str, system_prompt: str = ""):
            return "Reponse generee en mode mock."

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image

# Cloudinary pour le stockage d'images
import cloudinary
import cloudinary.uploader
import cloudinary.api
import cloudinary.utils
from reportlab.lib.units import cm
import io
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# LLM Configuration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# MongoDB connection with retry and timeout
mongo_url = os.environ['MONGO_URL']
print("🔌 Connexion à MongoDB...")
client = AsyncIOMotorClient(
    mongo_url,
    serverSelectionTimeoutMS=30000,
    connectTimeoutMS=30000,
    socketTimeoutMS=30000,
    retryWrites=True,
    retryReads=True
)
db = client[os.environ['DB_NAME']]
print(f"📦 Base de données: {os.environ['DB_NAME']}")

# Configuration Cloudinary pour le stockage d'images
CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', '')
CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '')
CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', '')

if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True
    )
    print("☁️ Cloudinary configuré")
else:
    print("⚠️ Cloudinary non configuré (variables d'environnement manquantes)")

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Enums
class MembershipStatus(str, Enum):
    ACTIVE = "Actif"
    INACTIVE = "Inactif"
    SUSPENDED = "Suspendu"
    EXPIRED = "Expiré"
    PENDING = "En attente"

class MembershipType(str, Enum):
    STANDARD = "Standard"
    PREMIUM = "Premium"
    VIP = "VIP"
    INSTRUCTOR = "Instructeur"
    TECHNICAL_DIRECTOR = "Directeur Technique"

class BeltGrade(str, Enum):
    WHITE = "Ceinture Blanche"
    YELLOW = "Ceinture Jaune"
    ORANGE = "Ceinture Orange"
    GREEN = "Ceinture Verte"
    BLUE = "Ceinture Bleue"
    BROWN = "Ceinture Marron"
    BLACK = "Ceinture Noire"  # Legacy - keep for compatibility
    BLACK_1DAN = "Ceinture Noire 1er Dan"
    BLACK_2DAN = "Ceinture Noire 2ème Dan"
    BLACK_3DAN = "Ceinture Noire 3ème Dan"
    BLACK_4DAN = "Ceinture Noire 4ème Dan"
    BLACK_5DAN = "Ceinture Noire 5ème Dan"
    BLACK_6DAN = "Ceinture Noire 6ème Dan"
    BLACK_7DAN = "Ceinture Noire 7ème Dan"
    BLACK_8DAN = "Ceinture Noire 8ème Dan"
    BLACK_9DAN = "Ceinture Noire 9ème Dan"
    BLACK_10DAN = "Ceinture Noire 10ème Dan"
    INSTRUCTOR = "Instructeur"
    TECHNICAL_DIRECTOR = "Directeur Technique"
    NATIONAL_DIRECTOR = "Directeur National"

class PendingMemberStatus(str, Enum):
    PENDING = "En attente"
    APPROVED = "Approuvé"
    REJECTED = "Rejeté"

class LeadPersonType(str, Enum):
    WOMAN = "Femme"
    ADULT = "Adulte"  # Remplace "Homme" pour être plus inclusif
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

class ProductCategory(str, Enum):
    MITAINES = "Mitaines"
    GANTS = "Gants de Combat"
    CASQUES = "Casques"
    PROTECTIONS = "Protections"
    KIMONOS = "Kimonos"
    ACCESSOIRES = "Accessoires"

class OrderStatus(str, Enum):
    PENDING = "En attente"
    PAID = "Payé"
    SHIPPED = "Expédié"
    DELIVERED = "Livré"
    CANCELLED = "Annulé"

class EventType(str, Enum):
    STAGE = "Stage"
    COURSE = "Cours"
    COMPETITION = "Compétition"
    EXAM = "Examen de Grade"
    SEMINAR = "Séminaire"
    WORKSHOP = "Workshop"

class EventStatus(str, Enum):
    UPCOMING = "À venir"
    UPCOMING_NO_ACCENT = "A venir"  # Compatibilité données existantes
    ONGOING = "En cours"
    COMPLETED = "Terminé"
    CANCELLED = "Annulé"

# Models
class User(BaseModel):
    """
    Modèle unifié pour tous les utilisateurs de l'académie.
    Rôles hiérarchiques: admin | fondateur | directeur_national | directeur_technique | instructeur | membre
    """
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    full_name: str
    first_name: Optional[str] = None  # Prénom (extrait de full_name ou saisi)
    last_name: Optional[str] = None   # Nom (extrait de full_name ou saisi)
    role: str = "membre"  # Rôle principal: admin, fondateur, directeur_national, directeur_technique, instructeur, membre
    roles: List[str] = []  # Rôles additionnels (peut cumuler instructeur + directeur_technique)

    # Paiements et abonnements
    has_paid_license: bool = False
    is_premium: bool = False
    stripe_customer_id: Optional[str] = None

    # Profil personnel
    photo_url: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    country: str = "France"
    country_code: str = "FR"
    date_of_birth: Optional[str] = None
    bio: Optional[str] = None

    # Grade martial
    belt_grade: Optional[str] = None  # Ceinture: Blanche → Noire 5ème Dan
    dan_grade: Optional[str] = None   # Grade Dan spécifique (pour compatibilité)

    # Affiliation club
    club_id: Optional[str] = None     # ID du club affilié
    club_name: Optional[str] = None   # Nom du club (pour affichage rapide)
    club_ids: List[str] = []          # Clubs associés (pour instructeurs multi-clubs)
    instructor_name: Optional[str] = None
    technical_director_id: Optional[str] = None  # DT responsable (pour membres)

    # Adhésion (anciennement dans Member)
    membership_status: Optional[str] = None  # Actif, Inactif, Suspendu, Expiré
    membership_type: Optional[str] = None    # Standard, Premium, VIP
    membership_start_date: Optional[str] = None
    membership_end_date: Optional[str] = None
    sessions_attended: int = 0

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserProfileUpdate(BaseModel):
    """Mise à jour du profil par l'utilisateur lui-même"""
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    date_of_birth: Optional[str] = None
    belt_grade: Optional[str] = None
    dan_grade: Optional[str] = None
    club_name: Optional[str] = None
    instructor_name: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None

class AdminUserUpdate(BaseModel):
    """Mise à jour complète d'un utilisateur par un admin"""
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    roles: Optional[List[str]] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    date_of_birth: Optional[str] = None
    belt_grade: Optional[str] = None
    dan_grade: Optional[str] = None
    # Contexte d'obtention du grade (stage/club/online)
    grade_context_type: Optional[str] = None  # "stage", "club", "online"
    grade_context_name: Optional[str] = None  # Nom du stage ou club
    club_id: Optional[str] = None
    club_name: Optional[str] = None
    club_ids: Optional[List[str]] = None
    instructor_id: Optional[str] = None
    instructor_name: Optional[str] = None
    technical_director_id: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    # Adhésion
    membership_status: Optional[str] = None
    membership_type: Optional[str] = None
    membership_start_date: Optional[str] = None
    membership_end_date: Optional[str] = None
    sessions_attended: Optional[int] = None
    # Paiements
    has_paid_license: Optional[bool] = None
    is_premium: Optional[bool] = None

class AdminUserCreate(BaseModel):
    """Création d'un utilisateur par un admin"""
    email: EmailStr
    password: Optional[str] = None  # If None, generate random password
    full_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str = "membre"  # admin, fondateur, directeur_national, directeur_technique, instructeur, membre
    roles: List[str] = []  # Rôles additionnels
    phone: Optional[str] = None
    city: Optional[str] = None
    country: str = "France"
    country_code: str = "FR"
    date_of_birth: Optional[str] = None
    belt_grade: Optional[str] = None
    dan_grade: Optional[str] = None
    club_id: Optional[str] = None
    club_name: Optional[str] = None
    club_ids: List[str] = []
    instructor_id: Optional[str] = None
    technical_director_id: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    # Adhésion
    membership_status: Optional[str] = "Actif"
    membership_type: Optional[str] = "Standard"
    membership_start_date: Optional[str] = None
    membership_end_date: Optional[str] = None
    # Options
    send_email: bool = True

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
    photo_url: Optional[str] = None
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
    photo_url: Optional[str] = None
    belt_grade: BeltGrade
    membership_type: MembershipType
    membership_start_date: str
    membership_end_date: str

class MemberUpdate(BaseModel):
    """Model for partial member updates - all fields optional"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    technical_director_id: Optional[str] = None
    photo_url: Optional[str] = None
    belt_grade: Optional[str] = None  # Accept string for flexibility
    membership_status: Optional[str] = None
    membership_type: Optional[str] = None
    membership_start_date: Optional[str] = None
    membership_end_date: Optional[str] = None

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
    training_mode: Optional[str] = None  # 'online', 'club', 'both'
    nearest_club_city: Optional[str] = None
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
    training_mode: Optional[str] = None  # 'online', 'club', 'both'
    nearest_club_city: Optional[str] = None

# Task Management Models
class TaskType(str, Enum):
    BUG = "Bug"
    IMPROVEMENT = "Amélioration"
    INTEGRATION = "Intégration"

class TaskStatus(str, Enum):
    TODO = "À faire"
    DONE = "Terminé"

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    task_type: TaskType
    status: TaskStatus = TaskStatus.TODO
    created_by: str  # User ID
    created_by_name: str  # User full name
    assigned_to: Optional[str] = None  # Assigned admin user ID
    assigned_to_name: Optional[str] = None  # Assigned admin full name
    assigned_to_photo: Optional[str] = None  # Assigned admin photo URL
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskCreate(BaseModel):
    title: str
    description: str
    task_type: TaskType
    assigned_to: Optional[str] = None  # Admin user ID to assign

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[TaskType] = None
    status: Optional[TaskStatus] = None
    assigned_to: Optional[str] = None

# ========== TOKEN AJL - GAMIFICATION ==========
class TokenActionType(str, Enum):
    """Types d'actions qui génèrent ou consomment des tokens AJL"""
    # Gains
    SIGNUP_BONUS = "signup_bonus"           # Inscription: +100
    DAILY_LOGIN = "daily_login"             # Connexion quotidienne: +5
    STREAK_BONUS = "streak_bonus"           # Série de 7 jours: +50
    PROFILE_COMPLETE = "profile_complete"   # Profil complet: +50
    POST_CREATED = "post_created"           # Créer un post: +10
    COMMENT_ADDED = "comment_added"         # Commenter: +3
    REACTION_RECEIVED = "reaction_received" # Recevoir une réaction: +2
    EVENT_PARTICIPATION = "event_participation"  # Participer événement: +50
    GRADE_PASSED = "grade_passed"           # Passage de grade: +200
    REFERRAL_BONUS = "referral_bonus"       # Inviter un ami: +100
    FIRST_PURCHASE = "first_purchase"       # Premier achat: +50
    FORUM_POST = "forum_post"               # Poster forum: +5
    LICENSE_PAID = "license_paid"           # Payer licence: +100
    ADMIN_GRANT = "admin_grant"             # Attribution admin: variable
    # Dépenses
    SHOP_REDEMPTION = "shop_redemption"     # Réduction boutique
    BADGE_PURCHASE = "badge_purchase"       # Acheter badge
    PREMIUM_UNLOCK = "premium_unlock"       # Débloquer contenu

# Valeurs des récompenses token
TOKEN_REWARDS = {
    TokenActionType.SIGNUP_BONUS: 100,
    TokenActionType.DAILY_LOGIN: 5,
    TokenActionType.STREAK_BONUS: 50,
    TokenActionType.PROFILE_COMPLETE: 50,
    TokenActionType.POST_CREATED: 10,
    TokenActionType.COMMENT_ADDED: 3,
    TokenActionType.REACTION_RECEIVED: 2,
    TokenActionType.EVENT_PARTICIPATION: 50,
    TokenActionType.GRADE_PASSED: 200,
    TokenActionType.REFERRAL_BONUS: 100,
    TokenActionType.FIRST_PURCHASE: 50,
    TokenActionType.FORUM_POST: 5,
    TokenActionType.LICENSE_PAID: 100,
}

# Limites anti-abus (max gains par jour par type)
TOKEN_DAILY_LIMITS = {
    TokenActionType.POST_CREATED: 50,       # Max 5 posts récompensés/jour
    TokenActionType.COMMENT_ADDED: 30,      # Max 10 commentaires/jour
    TokenActionType.REACTION_RECEIVED: 20,  # Max 10 réactions/jour
    TokenActionType.FORUM_POST: 25,         # Max 5 posts forum/jour
}

class TokenBalance(BaseModel):
    """Solde de tokens AJL d'un utilisateur"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    balance: int = 0               # Solde actuel
    total_earned: int = 0          # Total gagné (lifetime)
    total_spent: int = 0           # Total dépensé (lifetime)
    last_daily_claim: Optional[datetime] = None  # Dernière connexion quotidienne
    streak_days: int = 0           # Jours consécutifs de connexion
    longest_streak: int = 0        # Plus longue série
    level: int = 1                 # Niveau du membre
    xp: int = 0                    # Points d'expérience
    # Future blockchain integration
    wallet_address: Optional[str] = None  # Adresse wallet crypto (phase 2)
    tokens_locked: int = 0         # Tokens verrouillés pour migration
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenTransaction(BaseModel):
    """Transaction de tokens AJL (gain ou dépense)"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: int                    # Positif = gain, négatif = dépense
    action_type: str               # Type d'action (TokenActionType)
    description: Optional[str] = None  # Description lisible
    reference_id: Optional[str] = None  # ID du post, événement, etc.
    context_type: Optional[str] = None  # "stage", "club", "online" - contexte d'obtention du grade
    context_name: Optional[str] = None  # Nom du stage ou club
    balance_after: int = 0         # Solde après transaction
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BadgeType(str, Enum):
    """Types de badges disponibles"""
    NEWCOMER = "newcomer"           # Nouveau membre
    REGULAR = "regular"             # 7 jours consécutifs
    DEDICATED = "dedicated"         # 30 jours consécutifs
    CHAMPION = "champion"           # 100 jours consécutifs
    SOCIAL = "social"               # 10 posts créés
    INFLUENCER = "influencer"       # 50 réactions reçues
    HELPER = "helper"               # 25 commentaires
    WARRIOR = "warrior"             # Grade ceinture noire
    COLLECTOR = "collector"         # 1000 tokens accumulés
    WHALE = "whale"                 # 5000 tokens accumulés
    PIONEER = "pioneer"             # Badge early adopter
    VIP = "vip"                     # Membre premium
    INSTRUCTOR_BADGE = "instructor" # Instructeur certifié

class Badge(BaseModel):
    """Définition d'un badge"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    badge_type: str
    name: str
    description: str
    icon: str                      # Emoji ou URL icône
    rarity: str = "common"         # common, rare, epic, legendary
    token_cost: int = 0            # Coût en tokens (si achetable)
    requirement: Optional[str] = None  # Condition pour débloquer
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserBadge(BaseModel):
    """Badge obtenu par un utilisateur"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    badge_id: str
    badge_type: str
    earned_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenRedeemRequest(BaseModel):
    """Demande d'échange de tokens"""
    amount: int
    redemption_type: str           # "shop_discount", "badge", "premium"
    reference_id: Optional[str] = None  # ID du produit/badge

class TokenGrantRequest(BaseModel):
    """Attribution de tokens par admin"""
    user_id: str
    amount: int
    reason: str

# ========== FIN TOKEN AJL ==========

# ========== SPONSORS/PUBLICITÉS ==========

class SponsorPosition(str, Enum):
    LEFT = "left"
    RIGHT = "right"
    BOTH = "both"

class Sponsor(BaseModel):
    """Sponsor/Partenaire avec espace publicitaire"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str                          # Nom du sponsor
    logo_url: str                      # URL du logo/image publicitaire
    website_url: str                   # URL du site du sponsor
    position: str = "right"            # left, right, both
    active: bool = True                # Actif ou non
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    priority: int = 0                  # Ordre d'affichage (plus élevé = plus haut)
    # Statistiques
    impressions: int = 0               # Nombre d'affichages
    clicks: int = 0                    # Nombre de clics
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SponsorCreate(BaseModel):
    """Création d'un sponsor"""
    name: str
    logo_url: str
    website_url: str
    position: str = "right"
    active: bool = True
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    priority: int = 0

class SponsorUpdate(BaseModel):
    """Mise à jour d'un sponsor"""
    name: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    position: Optional[str] = None
    active: Optional[bool] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    priority: Optional[int] = None

class SponsorClickRequest(BaseModel):
    """Tracking d'un clic sur un sponsor"""
    sponsor_id: str

# ========== FIN SPONSORS ==========

# Pending Member (existing members requesting access)
class PendingMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # From onboarding steps 1-4
    person_type: str
    motivations: List[str]
    full_name: str
    email: EmailStr
    phone: str
    # From existing member form
    city: str
    country: str = "France"
    club_name: str
    instructor_name: str
    belt_grade: str
    training_mode: Optional[str] = None
    # Status
    status: PendingMemberStatus = PendingMemberStatus.PENDING
    admin_notes: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PendingMemberCreate(BaseModel):
    person_type: str
    motivations: List[str]
    full_name: str
    email: EmailStr
    phone: str
    city: str
    country: str = "France"
    club_name: str
    instructor_name: str
    belt_grade: str
    training_mode: Optional[str] = None

# Settings model for SMTP configuration
class SmtpSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "smtp_settings"
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    from_email: str = ""
    from_name: str = "Académie Jacques Levinet"
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SmtpSettingsUpdate(BaseModel):
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    from_email: Optional[str] = None
    from_name: Optional[str] = None

class SmtpTestRequest(BaseModel):
    test_email: str

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
    title: str = ""
    description: str = ""
    event_type: Optional[EventType] = None
    start_date: str = ""
    end_date: str = ""
    start_time: str = ""
    end_time: str = ""
    location: str = ""
    city: str = ""
    country: str = ""
    instructor: Optional[str] = None
    max_participants: Optional[int] = None
    current_participants: int = 0
    price: float = 0.0
    image_url: Optional[str] = None
    status: Optional[EventStatus] = EventStatus.UPCOMING
    created_by: Optional[str] = None
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

class DashboardMemberSummary(BaseModel):
    """Modèle allégé pour les membres récents du dashboard"""
    model_config = ConfigDict(extra="ignore")
    id: str = ""
    first_name: str = ""
    last_name: str = ""
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    technical_director_id: Optional[str] = None
    photo_url: Optional[str] = None
    belt_grade: Optional[str] = None
    membership_status: Optional[str] = None
    membership_type: Optional[str] = None
    membership_start_date: Optional[str] = None
    membership_end_date: Optional[str] = None
    sessions_attended: int = 0
    created_at: Optional[datetime] = None

class DashboardStats(BaseModel):
    total_members: int
    total_revenue: float
    active_memberships: int
    new_members_this_month: int
    revenue_change_percent: float
    members_by_month: List[dict]
    members_by_country: List[dict]
    recent_members: List[DashboardMemberSummary]

# Club Models
class ClubStatus(str, Enum):
    ACTIVE = "Actif"
    INACTIVE = "Inactif"

class VisitRequestStatus(str, Enum):
    PENDING = "En attente"
    APPROVED = "Approuvé"
    REJECTED = "Rejeté"

class Club(BaseModel):
    id: str
    name: str
    address: Optional[str] = None
    city: str
    postal_code: Optional[str] = None
    country: str = "France"
    country_code: str = "FR"  # ISO country code for flag display
    phone: Optional[str] = None
    email: Optional[str] = None
    logo_url: Optional[str] = None
    national_director_ids: List[str] = []  # Multiple DNs allowed
    technical_director_ids: List[str] = []  # Multiple DTs allowed
    instructor_ids: List[str] = []
    disciplines: List[str] = []
    schedule: Optional[str] = None
    status: ClubStatus = ClubStatus.ACTIVE
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

class ClubCreate(BaseModel):
    name: str
    address: Optional[str] = None
    city: str
    postal_code: Optional[str] = None
    country: str = "France"
    country_code: str = "FR"
    phone: Optional[str] = None
    email: Optional[str] = None
    logo_url: Optional[str] = None
    national_director_ids: List[str] = []
    technical_director_ids: List[str] = []
    instructor_ids: List[str] = []
    disciplines: List[str] = []
    schedule: Optional[str] = None

class ClubUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    logo_url: Optional[str] = None
    national_director_ids: Optional[List[str]] = None
    technical_director_ids: Optional[List[str]] = None
    instructor_ids: Optional[List[str]] = None
    disciplines: Optional[List[str]] = None
    schedule: Optional[str] = None
    status: Optional[ClubStatus] = None

class VisitRequest(BaseModel):
    id: str
    member_id: str
    member_name: Optional[str] = None
    member_email: Optional[str] = None
    home_club_id: str
    home_club_name: Optional[str] = None
    target_club_id: str
    target_club_name: Optional[str] = None
    status: VisitRequestStatus = VisitRequestStatus.PENDING
    reason: Optional[str] = None
    visit_date: Optional[str] = None
    approved_by: Optional[str] = None
    approved_by_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processed_at: Optional[datetime] = None

class VisitRequestCreate(BaseModel):
    target_club_id: str
    reason: Optional[str] = None
    visit_date: Optional[str] = None

# Utility functions
async def upload_base64_to_cloudinary(base64_data: str, folder: str = "academie-levinet/uploads") -> Optional[str]:
    """Helper to upload base64 or data URL to Cloudinary"""
    if not CLOUDINARY_CLOUD_NAME or not CLOUDINARY_API_KEY or not CLOUDINARY_API_SECRET:
        logger.warning("Cloudinary not configured, returning base64")
        return None

    try:
        # If it doesn't have the data:image prefix, add it (default to jpeg)
        if not base64_data.startswith('data:'):
            base64_data = f"data:image/jpeg;base64,{base64_data}"

        result = cloudinary.uploader.upload(
            base64_data,
            folder=folder,
            resource_type="image",
            transformation=[
                {"width": 800, "height": 800, "crop": "limit", "quality": "auto", "fetch_format": "auto"}
            ]
        )
        return result.get('secure_url')
    except Exception as e:
        logger.error(f"Cloudinary upload error: {e}")
        return None

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
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "photo": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== ROLE CHECK HELPERS ====================
# Rôles admin: admin + anciens rôles fondateur/directeur_national
ADMIN_ROLES = {'admin', 'fondateur', 'directeur_national'}
# Rôles de gestion: admin + directeur_technique (peuvent gérer les utilisateurs)
MANAGEMENT_ROLES = ADMIN_ROLES | {'directeur_technique'}

def is_admin_role(user: dict) -> bool:
    """Vérifie si l'utilisateur a un rôle admin (admin, fondateur, directeur_national)"""
    return user.get('role') in ADMIN_ROLES

def is_management_role(user: dict) -> bool:
    """Vérifie si l'utilisateur a un rôle de gestion (admin ou directeur_technique)"""
    return user.get('role') in MANAGEMENT_ROLES

def require_admin(current_user: dict):
    """Lève une 403 si l'utilisateur n'est pas admin"""
    if not is_admin_role(current_user):
        raise HTTPException(status_code=403, detail="Accès administrateur requis")

def require_management(current_user: dict):
    """Lève une 403 si l'utilisateur n'est pas admin ou directeur_technique"""
    if not is_management_role(current_user):
        raise HTTPException(status_code=403, detail="Accès gestion requis (admin ou directeur technique)")

# Auth Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    email = user_data.email.strip().lower()
    logger.info(f"[REGISTER] Tentative d'inscription pour: {email}")

    existing = await db.users.find_one(
        {"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}},
        {"_id": 0}
    )
    if existing:
        logger.warning(f"[REGISTER] Email deja existant: {email}")
        raise HTTPException(status_code=400, detail="Email déjà enregistré")

    user_dict = user_data.model_dump()
    user_dict['email'] = email  # Stocker en minuscules
    user_dict['password_hash'] = hash_password(user_data.password)
    del user_dict['password']

    user = User(**user_dict)
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()

    # Create a clean copy without _id for insertion
    insert_doc = {k: v for k, v in doc.items()}
    await db.users.insert_one(insert_doc)
    logger.info(f"[REGISTER] Utilisateur insere en DB: {email} (id: {user.id})")

    # Verification immediate du hash (safety check)
    if not verify_password(user_data.password, doc['password_hash']):
        logger.error(f"[REGISTER] CRITIQUE: Verification du hash echouee immediatement apres creation pour {email}")

    # Award signup bonus tokens (non-blocking - ne doit PAS crasher l'inscription)
    try:
        await award_tokens(
            user.id,
            TokenActionType.SIGNUP_BONUS.value,
            description="Bonus de bienvenue - Inscription"
        )
    except Exception as e:
        logger.error(f"[REGISTER] award_tokens echoue pour {email}: {e}")

    # Send welcome email (non-blocking)
    asyncio.create_task(send_email(
        to_email=user.email,
        subject=f"Bienvenue à l'Académie Jacques Levinet, {user.full_name} !",
        html_content=get_welcome_email_html(user.full_name, user.email),
        text_content=f"Bienvenue {user.full_name}! Votre compte a été créé avec succès."
    ))

    token = create_token(user.id, user.email)
    user_response = {k: v for k, v in doc.items() if k != 'password_hash' and k != '_id'}

    logger.info(f"[REGISTER] Inscription terminee avec succes pour {email}")
    return {"token": token, "user": user_response}

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    email = credentials.email.strip().lower()
    logger.info(f"[LOGIN] Tentative de connexion pour: {email}")

    # Recherche case-insensitive: essayer d'abord exact, puis regex
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        logger.info(f"[LOGIN] Correspondance exacte echouee pour {email}, essai case-insensitive")
        user = await db.users.find_one(
            {"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}},
            {"_id": 0}
        )
        if user:
            logger.warning(f"[LOGIN] Utilisateur trouve avec casse differente: stocke='{user['email']}' vs saisi='{email}'. Normalisation en cours.")
            # Corriger la casse de l'email en DB pour les futurs logins
            await db.users.update_one(
                {"id": user['id']},
                {"$set": {"email": email}}
            )

    if not user:
        logger.warning(f"[LOGIN] Utilisateur non trouve: {email}")
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    # Verifier que password_hash existe
    if 'password_hash' not in user or not user['password_hash']:
        logger.error(f"[LOGIN] Utilisateur {email} n'a pas de champ password_hash!")
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    # Verifier le mot de passe
    try:
        password_valid = verify_password(credentials.password, user['password_hash'])
    except Exception as e:
        logger.error(f"[LOGIN] Erreur verification mot de passe pour {email}: {e} (hash prefix: {user['password_hash'][:10]}...)")
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    if not password_valid:
        logger.warning(f"[LOGIN] Mot de passe incorrect pour {email} (hash prefix: {user['password_hash'][:10]}...)")
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    token = create_token(user['id'], user['email'])
    user_response = {k: v for k, v in user.items() if k != 'password_hash' and k != '_id'}

    logger.info(f"[LOGIN] Connexion reussie pour {email} (id: {user['id']})")
    return {"token": token, "user": user_response}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != 'password_hash' and k != '_id'}

# ==================== DEBUG / DIAGNOSTIC ENDPOINTS (ADMIN) ====================

@api_router.get("/admin/debug/user/{email_or_id}")
async def debug_user_account(email_or_id: str, current_user: dict = Depends(get_current_user)):
    """Admin: Diagnostiquer un compte utilisateur - verifie email, format du hash, etc."""
    require_admin(current_user)

    # Chercher par email d'abord (case-insensitive), puis par id
    user = await db.users.find_one(
        {"email": {"$regex": f"^{re.escape(email_or_id.strip())}$", "$options": "i"}},
        {"_id": 0}
    )
    if not user:
        user = await db.users.find_one({"id": email_or_id.strip()}, {"_id": 0})

    if not user:
        return {"found": False, "message": f"Aucun utilisateur trouve pour: {email_or_id}"}

    # Analyser le compte
    password_hash = user.get('password_hash', '')
    has_hash = bool(password_hash)
    hash_prefix = password_hash[:7] if has_hash else 'NONE'
    hash_length = len(password_hash) if has_hash else 0

    # Detecter l'algorithme de hash
    hash_algorithm = "unknown"
    if password_hash.startswith("$2b$"):
        hash_algorithm = "bcrypt_2b (standard)"
    elif password_hash.startswith("$2a$"):
        hash_algorithm = "bcrypt_2a (legacy)"
    elif password_hash.startswith("$2y$"):
        hash_algorithm = "bcrypt_2y (php)"
    elif password_hash.startswith("$argon2"):
        hash_algorithm = "argon2 (INCOMPATIBLE)"
    elif password_hash.startswith("$pbkdf2"):
        hash_algorithm = "pbkdf2 (INCOMPATIBLE)"

    # Verifier la normalisation de l'email
    email = user.get('email', '')
    email_is_lowercase = email == email.lower()
    email_has_whitespace = email != email.strip()

    return {
        "found": True,
        "user_id": user.get('id'),
        "email_stored": email,
        "email_is_lowercase": email_is_lowercase,
        "email_has_whitespace": email_has_whitespace,
        "has_password_hash": has_hash,
        "hash_prefix": hash_prefix,
        "hash_length": hash_length,
        "hash_algorithm": hash_algorithm,
        "role": user.get('role'),
        "created_at": user.get('created_at'),
        "full_name": user.get('full_name'),
        "membership_status": user.get('membership_status'),
        "has_paid_license": user.get('has_paid_license'),
    }

@api_router.post("/admin/debug/normalize-emails")
async def normalize_all_emails(current_user: dict = Depends(get_current_user)):
    """Admin: Normaliser tous les emails en minuscules. Rapporte les changements."""
    require_admin(current_user)

    fixed = []
    async for user in db.users.find({}, {"_id": 0, "id": 1, "email": 1}):
        email = user.get('email', '')
        normalized = email.strip().lower()
        if email != normalized:
            await db.users.update_one(
                {"id": user['id']},
                {"$set": {"email": normalized}}
            )
            fixed.append({"id": user['id'], "old": email, "new": normalized})
            logger.info(f"[NORMALIZE] Email corrige: '{email}' -> '{normalized}'")

    logger.info(f"[NORMALIZE] {len(fixed)} emails normalises au total")
    return {"fixed_count": len(fixed), "fixed_emails": fixed}

@api_router.post("/admin/debug/test-password")
async def test_password_for_user(email: str, password: str, current_user: dict = Depends(get_current_user)):
    """Admin: Tester si un mot de passe correspond pour un email donne (debug uniquement)."""
    require_admin(current_user)

    user = await db.users.find_one(
        {"email": {"$regex": f"^{re.escape(email.strip())}$", "$options": "i"}},
        {"_id": 0, "password_hash": 1, "email": 1, "id": 1}
    )
    if not user:
        return {"found": False}

    try:
        result = verify_password(password, user['password_hash'])
        return {
            "found": True,
            "password_matches": result,
            "hash_prefix": user['password_hash'][:10],
            "stored_email": user['email']
        }
    except Exception as e:
        return {
            "found": True,
            "password_matches": False,
            "error": str(e),
            "hash_prefix": user.get('password_hash', '')[:10]
        }

# ==================== USER PROFILE ENDPOINTS ====================

@api_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's full profile"""
    return {k: v for k, v in current_user.items() if k != 'password_hash' and k != '_id'}

@api_router.put("/profile")
async def update_profile(data: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    """Update current user's profile"""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    await db.users.update_one(
        {"id": current_user['id']},
        {"$set": update_data}
    )
    
    updated_user = await db.users.find_one({"id": current_user['id']}, {"_id": 0, "password_hash": 0, "photo": 0})
    return updated_user

@api_router.put("/profile/password")
async def update_password(
    current_password: str,
    new_password: str,
    current_user: dict = Depends(get_current_user)
):
    """Update current user's password"""
    # Verify current password
    user = await db.users.find_one({"id": current_user['id']})
    if not verify_password(current_password, user['password_hash']):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Le nouveau mot de passe doit contenir au moins 6 caractères")
    
    # Update password
    await db.users.update_one(
        {"id": current_user['id']},
        {"$set": {"password_hash": hash_password(new_password)}}
    )
    
    return {"message": "Mot de passe mis à jour avec succès"}

@api_router.post("/profile/photo")
async def upload_profile_photo(photo_url: str, current_user: dict = Depends(get_current_user)):
    """Update profile photo URL"""
    await db.users.update_one(
        {"id": current_user['id']},
        {"$set": {"photo_url": photo_url}}
    )
    return {"message": "Photo mise à jour", "photo_url": photo_url}

# ==================== FILE UPLOAD ====================

class PhotoUploadRequest(BaseModel):
    photo_base64: str  # Base64 encoded image data
    filename: str = "photo.jpg"

class ImageUploadRequest(BaseModel):
    image_data: str  # Full data URL (data:image/...;base64,...)

@api_router.post("/upload/image")
async def upload_image(data: ImageUploadRequest, current_user: dict = Depends(get_current_user)):
    """Upload an image to Cloudinary, return the secure URL"""
    try:
        # Validate data URL
        if not data.image_data:
            raise HTTPException(status_code=400, detail="Image data required")
        
        # If it's already a Cloudinary URL or external URL, just return it
        if data.image_data.startswith('http://') or data.image_data.startswith('https://'):
            return {"url": data.image_data, "message": "URL d'image enregistrée"}
        
        # If it's a data URL, upload to Cloudinary
        if data.image_data.startswith('data:image/'):
            # Check if Cloudinary is configured
            if not CLOUDINARY_CLOUD_NAME or not CLOUDINARY_API_KEY or not CLOUDINARY_API_SECRET:
                raise HTTPException(
                    status_code=500, 
                    detail="Cloudinary non configuré. Contactez l'administrateur."
                )
            
            try:
                # Upload to Cloudinary
                import uuid
                public_id = f"academie-levinet/{uuid.uuid4()}"
                
                # Cloudinary accepts data URLs directly
                result = cloudinary.uploader.upload(
                    data.image_data,
                    public_id=public_id,
                    folder="academie-levinet",
                    resource_type="image",
                    overwrite=True,
                    # Optimize images automatically
                    transformation=[
                        {"quality": "auto:good", "fetch_format": "auto"}
                    ]
                )
                
                # Get the secure URL from Cloudinary
                cloudinary_url = result.get('secure_url')
                
                logger.info(f"✅ Image uploadée sur Cloudinary: {cloudinary_url}")
                
                return {
                    "url": cloudinary_url, 
                    "message": "Image uploadée avec succès sur Cloudinary",
                    "public_id": result.get('public_id'),
                    "format": result.get('format'),
                    "size": result.get('bytes')
                }
                
            except Exception as cloudinary_error:
                logger.error(f"❌ Erreur Cloudinary: {str(cloudinary_error)}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Erreur lors de l'upload Cloudinary: {str(cloudinary_error)}"
                )
        
        raise HTTPException(status_code=400, detail="Format d'image invalide. Utilisez une URL ou un fichier image.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erreur upload image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload: {str(e)}")

@api_router.get("/images/{image_id}")
async def get_image(image_id: str):
    """Retrieve an image by its ID and return as data URL or redirect"""
    image = await db.images.find_one({"id": image_id})
    if not image:
        raise HTTPException(status_code=404, detail="Image non trouvée")
    
    # Return the image data directly
    from fastapi.responses import Response
    import base64
    
    data_url = image.get("data", "")
    if data_url.startswith("data:"):
        # Parse data URL
        try:
            header, encoded = data_url.split(",", 1)
            mime_type = header.split(":")[1].split(";")[0]
            image_bytes = base64.b64decode(encoded)
            return Response(content=image_bytes, media_type=mime_type)
        except Exception:
            pass
    
    # Fallback: return as JSON
    return {"data": data_url}

@api_router.post("/upload/photo")
async def upload_photo(data: PhotoUploadRequest, current_user: dict = Depends(get_current_user)):
    """Upload a photo and return the URL (uses Cloudinary if available)"""
    try:
        # Validate base64
        if not data.photo_base64:
            raise HTTPException(status_code=400, detail="Photo data required")
        
        # Try uploading to Cloudinary
        cloudinary_url = await upload_base64_to_cloudinary(data.photo_base64, folder="academie-levinet/profiles")

        if cloudinary_url:
            return {"photo_url": cloudinary_url, "message": "Photo uploadée avec succès sur Cloudinary"}

        # Fallback to base64 if Cloudinary fails or is not configured
        if data.photo_base64.startswith('data:'):
            photo_url = data.photo_base64
        else:
            ext = data.filename.lower().split('.')[-1]
            mime_types = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'webp': 'image/webp'}
            mime_type = mime_types.get(ext, 'image/jpeg')
            photo_url = f"data:{mime_type};base64,{data.photo_base64}"
        
        return {"photo_url": photo_url, "message": "Photo uploadée avec succès (base64 fallback)"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload: {str(e)}")

@api_router.post("/admin/users/{user_id}/photo")
async def update_user_photo(user_id: str, data: PhotoUploadRequest, current_user: dict = Depends(get_current_user)):
    """Admin/DT: Update a user's photo"""
    require_management(current_user)
    
    # Check user exists
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Try uploading to Cloudinary
    cloudinary_url = await upload_base64_to_cloudinary(data.photo_base64, folder="academie-levinet/profiles")

    if cloudinary_url:
        photo_url = cloudinary_url
    else:
        # Fallback to base64
        if data.photo_base64.startswith('data:'):
            photo_url = data.photo_base64
        else:
            ext = data.filename.lower().split('.')[-1]
            mime_types = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'webp': 'image/webp'}
            mime_type = mime_types.get(ext, 'image/jpeg')
            photo_url = f"data:{mime_type};base64,{data.photo_base64}"
    
    await db.users.update_one({"id": user_id}, {"$set": {"photo_url": photo_url}})
    
    return {"photo_url": photo_url, "message": "Photo mise à jour"}

# ==================== ADMIN USER MANAGEMENT ====================

@api_router.get("/admin/admins")
async def get_all_admins(current_user: dict = Depends(get_current_user)):
    """Get list of all administrators (admin only)"""
    require_admin(current_user)
    
    admins = await db.users.find(
        {"role": "admin"},
        {"_id": 0, "id": 1, "full_name": 1, "email": 1, "photo_url": 1}
    ).to_list(100)
    
    return admins

@api_router.get("/admin/users")
async def get_all_users(
    role: Optional[str] = None,
    country: Optional[str] = None,
    city: Optional[str] = None,
    club_id: Optional[str] = None,
    membership_status: Optional[str] = None,
    belt_grade: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """
    Admin: Get all users with optional filters.

    Filtres disponibles:
    - role: admin | fondateur | directeur_national | directeur_technique | instructeur | membre
    - country: Pays
    - city: Ville
    - club_id: ID du club affilié
    - membership_status: Actif | Inactif | Suspendu | Expiré
    - belt_grade: Grade/Ceinture
    """
    # Admins et directeurs techniques peuvent voir les utilisateurs
    require_management(current_user)

    query = {}
    if role:
        # Treat 'membre' and 'eleve' as equivalent (legacy compatibility)
        if role in ('membre', 'eleve'):
            query["role"] = {"$in": ["membre", "eleve"]}
        else:
            query["role"] = role
    if country:
        query["country"] = country
    if city:
        query["city"] = city
    if club_id:
        query["club_id"] = club_id
    if membership_status:
        query["membership_status"] = membership_status
    if belt_grade:
        query["belt_grade"] = belt_grade

    # Optimize query with projection to exclude password_hash and limit results
    cursor = db.users.find(query, {"_id": 0, "password_hash": 0, "photo": 0}).sort("created_at", -1).skip(skip).limit(limit)
    users = await cursor.to_list(limit)
    total = await db.users.count_documents(query)

    for user in users:
        if isinstance(user.get('created_at'), str):
            try:
                user['created_at'] = datetime.fromisoformat(user['created_at'].replace('Z', '+00:00'))
            except:
                pass
        # Ajouter first_name/last_name depuis full_name si absent
        if user.get('full_name') and not user.get('first_name'):
            parts = user['full_name'].split(' ', 1)
            user['first_name'] = parts[0]
            user['last_name'] = parts[1] if len(parts) > 1 else ''

    return {"users": users, "total": total}

@api_router.post("/admin/users")
async def create_admin_user(data: AdminUserCreate, current_user: dict = Depends(get_current_user)):
    """Admin/DT: Create a new user (admin, member, instructor, technical_director)"""
    require_management(current_user)
    
    # Normaliser l'email en minuscules et vérifier l'unicité
    email = data.email.strip().lower()
    existing = await db.users.find_one(
        {"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    # Normalize role (accept both French and English versions)
    # Nouveaux rôles: admin, directeur_technique, instructeur, eleve (avec club), eleve_libre (sans club)
    role_mapping = {
        'directeur_technique': 'directeur_technique',
        'technical_director': 'directeur_technique',
        'instructeur': 'instructeur',
        'instructor': 'instructeur',
        'eleve': 'eleve',
        'student': 'eleve',
        'membre': 'eleve',  # Compatibilité ancienne appellation
        'member': 'eleve',
        'eleve_libre': 'eleve_libre',
        'online_student': 'eleve_libre',
        'admin': 'admin',
        # Compatibilité avec les anciens rôles (mappés vers admin)
        'fondateur': 'admin',
        'directeur_national': 'admin'
    }
    
    # Validate role
    valid_roles = list(role_mapping.keys())
    if data.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Rôle invalide. Utilisez: admin, directeur_technique, instructeur, eleve, eleve_libre")
    
    # Use normalized role
    normalized_role = role_mapping.get(data.role, data.role)
    
    # Generate password if not provided
    import secrets
    import string
    password = data.password
    if not password:
        password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    
    # Determine belt grade based on role if not provided
    belt_grade = data.belt_grade
    if not belt_grade and normalized_role == 'instructeur':
        belt_grade = 'Instructeur'
    elif not belt_grade and normalized_role == 'directeur_technique':
        belt_grade = 'Directeur Technique'
    elif not belt_grade and normalized_role in ['eleve', 'eleve_libre']:
        belt_grade = 'Ceinture Blanche'  # Défaut pour les élèves
    
    user = User(
        email=email,  # Email normalisé en minuscules
        password_hash=hash_password(password),
        full_name=data.full_name,
        role=normalized_role,
        phone=data.phone,
        city=data.city,
        has_paid_license=True  # Admin-created users are considered paid
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['country'] = data.country
    doc['country_code'] = data.country_code
    doc['belt_grade'] = belt_grade
    doc['dan_grade'] = data.dan_grade
    doc['club_name'] = data.club_name
    doc['club_ids'] = data.club_ids
    doc['photo_url'] = data.photo_url
    doc['user_type'] = normalized_role  # Store normalized type
    
    await db.users.insert_one(doc)
    
    # Synchronize clubs if this is a technical director
    if normalized_role == 'directeur_technique' and data.club_ids:
        for club_id in data.club_ids:
            await db.clubs.update_one(
                {"id": club_id},
                {"$addToSet": {"technical_director_ids": user.id}}
            )
    
    # Send email with credentials if requested
    if data.send_email:
        role_labels = {
            'admin': 'Administrateur',
            'fondateur': 'Fondateur',
            'directeur_national': 'Directeur National',
            'directeur_technique': 'Directeur Technique',
            'instructeur': 'Instructeur',
            'membre': 'Membre',
            'member': 'Membre',
            'instructor': 'Instructeur',
            'technical_director': 'Directeur Technique',
            'national_director': 'Directeur National'
        }
        role_label = role_labels.get(normalized_role, normalized_role)
        
        login_url = os.environ.get('FRONTEND_URL', 'https://academielevinet.com')
        
        asyncio.create_task(send_email(
            to_email=data.email,
            subject=f"🎉 Votre compte {role_label} - Académie Jacques Levinet",
            html_content=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e3a5f;">Bienvenue {data.full_name} !</h2>
                <p>Votre compte <strong>{role_label}</strong> a été créé sur la plateforme de l'Académie Jacques Levinet.</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #1e3a5f;">Vos identifiants de connexion :</h3>
                    <p><strong>Email :</strong> {data.email}</p>
                    <p><strong>Mot de passe :</strong> {password}</p>
                </div>
                
                <p>⚠️ <strong>Important :</strong> Nous vous recommandons de changer votre mot de passe dès votre première connexion.</p>
                
                <p style="margin-top: 30px;">
                    <a href="{login_url}/login" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Se connecter maintenant
                    </a>
                </p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="color: #666; font-size: 12px;">
                    Académie Jacques Levinet - Self-Pro Krav (SPK)<br>
                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                </p>
            </div>
            """,
            text_content=f"Bienvenue {data.full_name} ! Votre compte {role_label} a été créé. Email: {data.email}, Mot de passe: {password}. Connectez-vous sur {login_url}/login"
        ))
    
    return {
        "message": f"Utilisateur {role_label} créé avec succès" + (" - Email envoyé" if data.send_email else ""),
        "user_id": user.id,
        "password": password if not data.password else None  # Return generated password if applicable
    }

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, role: str, current_user: dict = Depends(get_current_user)):
    """Admin: Update user role"""
    require_admin(current_user)

    valid_roles = ['admin', 'directeur_technique', 'instructeur', 'eleve', 'eleve_libre']
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Rôle invalide. Rôles valides: {', '.join(valid_roles)}")

    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": role}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    return {"message": f"Rôle mis à jour en '{role}'"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """Admin: Delete a user"""
    require_admin(current_user)
    
    # Prevent self-deletion
    if user_id == current_user['id']:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte")
    
    result = await db.users.delete_one({"id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return {"message": "Utilisateur supprimé"}

@api_router.get("/admin/users/{user_id}")
async def get_user_details(user_id: str, current_user: dict = Depends(get_current_user)):
    """Admin/DT: Get full user details"""
    require_management(current_user)
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0, "photo": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    return user

@api_router.put("/admin/users/{user_id}")
async def update_user(user_id: str, data: AdminUserUpdate, current_user: dict = Depends(get_current_user)):
    """Admin/DT: Update any user's profile (unified model)"""
    require_management(current_user)

    # Get current user data to check role changes
    current_user_data = await db.users.find_one({"id": user_id})
    if not current_user_data:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Get only non-None fields for partial update
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    # Extraire les champs de contexte de grade (ne pas les sauvegarder dans l'utilisateur)
    grade_context_type = update_data.pop('grade_context_type', None)
    grade_context_name = update_data.pop('grade_context_name', None)

    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")

    # Check if email is being changed and if it's already taken
    if 'email' in update_data:
        existing = await db.users.find_one({"email": update_data['email'], "id": {"$ne": user_id}})
        if existing:
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    # Synchronize clubs if this is a technical director and club_ids changed
    if 'club_ids' in update_data and current_user_data.get('role') == 'directeur_technique':
        old_club_ids = set(current_user_data.get('club_ids', []))
        new_club_ids = set(update_data['club_ids'])
        
        # Remove director from clubs no longer assigned
        removed_clubs = old_club_ids - new_club_ids
        for club_id in removed_clubs:
            await db.clubs.update_one(
                {"id": club_id},
                {"$pull": {"technical_director_ids": user_id}}
            )
        
        # Add director to newly assigned clubs
        added_clubs = new_club_ids - old_club_ids
        for club_id in added_clubs:
            await db.clubs.update_one(
                {"id": club_id},
                {"$addToSet": {"technical_director_ids": user_id}}
            )
    
    # Détecter changement de grade pour attribuer des tokens
    old_belt_grade = current_user_data.get('belt_grade')
    new_belt_grade = update_data.get('belt_grade')
    grade_changed = new_belt_grade and new_belt_grade != old_belt_grade

    result = await db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Attribuer des tokens pour le passage de grade
    if grade_changed:
        context_desc = ""
        if grade_context_type and grade_context_name:
            context_desc = f" ({grade_context_type}: {grade_context_name})"
        elif grade_context_type:
            context_desc = f" ({grade_context_type})"
            
        await award_tokens(
            user_id=user_id,
            action_type=TokenActionType.GRADE_PASSED.value,
            description=f"Passage de grade: {new_belt_grade}{context_desc}",
            context_type=grade_context_type,
            context_name=grade_context_name
        )
    
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0, "photo": 0})
    return {"message": "Utilisateur mis à jour", "user": updated_user}

@api_router.put("/admin/users/{user_id}/password")
async def admin_change_user_password(user_id: str, new_password: str, current_user: dict = Depends(get_current_user)):
    """Admin/DT: Change any user's password"""
    require_management(current_user)
    
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 6 caractères")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"password_hash": hash_password(new_password)}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return {"message": "Mot de passe mis à jour avec succès"}

# ==================== LEGACY ROUTES SUPPRIMÉES ====================
# Les anciennes routes /technical-directors qui utilisaient la collection 'technical_directors'
# ont été supprimées. Utiliser maintenant:
# - GET /technical-directors → retourne les users avec role="directeur_technique"
# - DELETE/PUT → utiliser /admin/users/{user_id}
# ==================================================================

# ==================== MEMBRES (ALIAS VERS USERS) ====================
# Les membres sont des utilisateurs avec role="membre"
# Ces endpoints sont des alias pour compatibilité, utilisez /admin/users avec role=membre

@api_router.get("/members")
async def get_members_alias(
    country: Optional[str] = None,
    city: Optional[str] = None,
    technical_director_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Alias: Récupère les utilisateurs avec role=membre/eleve"""
    query = {"$or": [
        {"role": {"$in": ["membre", "eleve", "member", "student"]}},
        {"roles": {"$in": ["membre", "eleve", "member", "student"]}}
    ]}
    if country:
        query['country'] = country
    if city:
        query['city'] = city
    if technical_director_id:
        query['technical_director_id'] = technical_director_id
    if status:
        query['membership_status'] = status
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]

    cursor = db.users.find(query, {"_id": 0, "password_hash": 0, "photo": 0}).sort("full_name", 1).skip(skip).limit(limit)
    users = await cursor.to_list(limit)
    total = await db.users.count_documents(query)

    # Ajouter first_name/last_name pour compatibilité
    for user in users:
        if user.get('full_name') and not user.get('first_name'):
            parts = user['full_name'].split(' ', 1)
            user['first_name'] = parts[0]
            user['last_name'] = parts[1] if len(parts) > 1 else ''
        if isinstance(user.get('created_at'), str):
            try:
                user['created_at'] = datetime.fromisoformat(user['created_at'].replace('Z', '+00:00'))
            except:
                pass
    return {"users": users, "total": total}

@api_router.get("/instructors")
async def get_instructors(
    country: Optional[str] = None,
    city: Optional[str] = None,
    club_id: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get all instructors - accessible to all authenticated users"""
    try:
        query = {"$or": [
            {"role": {"$in": ["instructeur", "instructor"]}},
            {"roles": {"$in": ["instructeur", "instructor"]}},
            {"belt_grade": "Instructeur"}
        ]}
        if country:
            query["country"] = country
        if city:
            query["city"] = city
        if club_id:
            query["club_id"] = club_id
        if search:
            query["$or"] = [
                {"full_name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]

        cursor = db.users.find(query, {"_id": 0, "password_hash": 0, "photo": 0}).sort("full_name", 1).skip(skip).limit(limit)
        instructors = await cursor.to_list(limit)
        total = await db.users.count_documents(query)

        for user in instructors:
            if user.get('full_name') and not user.get('first_name'):
                parts = user['full_name'].split(' ', 1)
                user['first_name'] = parts[0]
                user['last_name'] = parts[1] if len(parts) > 1 else ''
        return {"users": instructors, "total": total}
    except Exception as e:
        logger.error(f"Error in get_instructors: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur lors du chargement des instructeurs: {str(e)}")

@api_router.get("/technical-directors")
async def get_technical_directors(
    country: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get all technical directors - accessible to all authenticated users"""
    query = {"$or": [
        {"role": {"$in": ["directeur_technique", "technical_director"]}},
        {"roles": {"$in": ["directeur_technique", "technical_director"]}},
        {"belt_grade": "Directeur Technique"}
    ]}
    if country:
        query["country"] = country
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    cursor = db.users.find(query, {"_id": 0, "password_hash": 0, "photo": 0}).sort("full_name", 1).skip(skip).limit(limit)
    directors = await cursor.to_list(limit)
    total = await db.users.count_documents(query)
    # Country name to code mapping for resolving missing country_code
    COUNTRY_NAME_TO_CODE = {
        "france": "FR", "belgique": "BE", "suisse": "CH", "canada": "CA",
        "luxembourg": "LU", "maroc": "MA", "tunisie": "TN",
        "sénégal": "SN", "senegal": "SN", "côte d'ivoire": "CI",
        "cameroun": "CM", "allemagne": "DE", "espagne": "ES", "italie": "IT",
        "portugal": "PT", "royaume-uni": "GB", "états-unis": "US", "etats-unis": "US",
        "brésil": "BR", "bresil": "BR", "mexique": "MX", "argentine": "AR",
        "japon": "JP", "australie": "AU", "nouvelle-zélande": "NZ",
        "afrique du sud": "ZA", "île maurice": "MU", "ile maurice": "MU",
        "andorre": "AD", "oman": "OM", "comores": "KM", "pakistan": "PK",
        "madagascar": "MG", "polynésie française": "PF", "polynesie francaise": "PF",
        "île rodrigues": "MU-R", "ile rodrigues": "MU-R",
        "algérie": "DZ", "algerie": "DZ", "pologne": "PL", "pays-bas": "NL",
        "suède": "SE", "suede": "SE", "norvège": "NO", "norvege": "NO",
        "danemark": "DK", "finlande": "FI", "grèce": "GR", "grece": "GR",
        "turquie": "TR", "roumanie": "RO", "hongrie": "HU",
        "république tchèque": "CZ", "republique tcheque": "CZ",
        "autriche": "AT", "irlande": "IE", "monaco": "MC",
        "russie": "RU", "chine": "CN", "inde": "IN", "israël": "IL", "israel": "IL",
        "vietnam": "VN", "thaïlande": "TH", "thailande": "TH",
        "corée du sud": "KR", "coree du sud": "KR",
        "chili": "CL", "colombie": "CO",
    }
    for user in directors:
        if user.get('full_name') and not user.get('first_name'):
            parts = user['full_name'].split(' ', 1)
            user['first_name'] = parts[0]
            user['last_name'] = parts[1] if len(parts) > 1 else ''
        # Resolve country_code from country name if missing or mismatched
        country_name = user.get('country', '')
        country_code = user.get('country_code', '')
        if country_name and not country_code:
            resolved = COUNTRY_NAME_TO_CODE.get(country_name.lower().strip())
            if resolved:
                user['country_code'] = resolved
    return {"users": directors, "total": total}

@api_router.get("/members/{member_id}")
async def get_member_alias(member_id: str, current_user: dict = Depends(get_current_user)):
    """Alias: Récupère un utilisateur par ID"""
    user = await db.users.find_one({"id": member_id}, {"_id": 0, "password_hash": 0, "photo": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Member not found")
    if user.get('full_name') and not user.get('first_name'):
        parts = user['full_name'].split(' ', 1)
        user['first_name'] = parts[0]
        user['last_name'] = parts[1] if len(parts) > 1 else ''
    return user

@api_router.put("/members/{member_id}")
async def update_member_alias(member_id: str, data: AdminUserUpdate, current_user: dict = Depends(get_current_user)):
    """Alias: Met à jour un utilisateur"""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")

    result = await db.users.update_one({"id": member_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")

    updated = await db.users.find_one({"id": member_id}, {"_id": 0, "password_hash": 0, "photo": 0})
    return updated

@api_router.post("/members")
async def create_member_alias(data: AdminUserCreate, current_user: dict = Depends(get_current_user)):
    """Alias: Crée un utilisateur avec role=membre"""
    # Force role to membre
    user_dict = data.model_dump()
    user_dict['role'] = 'membre'

    # Normaliser l'email en minuscules
    email = data.email.strip().lower()
    user_dict['email'] = email

    # Check if email exists (case-insensitive)
    existing = await db.users.find_one(
        {"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Generate password if not provided
    password = data.password or ''.join(random.choices(string.ascii_letters + string.digits, k=12))
    user_dict['password_hash'] = hash_password(password)
    user_dict.pop('password', None)

    # Set defaults
    user_dict['id'] = str(uuid.uuid4())
    user_dict['created_at'] = datetime.now(timezone.utc).isoformat()
    user_dict['membership_status'] = user_dict.get('membership_status') or 'Actif'

    await db.users.insert_one(user_dict)
    logger.info(f"[MEMBER_CREATE] Membre cree: {email}")

    # Return without password_hash and _id
    user_dict.pop('password_hash', None)
    user_dict.pop('_id', None)
    return {"message": "Member created", "user": user_dict}

@api_router.delete("/members/{member_id}")
async def delete_member_alias(member_id: str, current_user: dict = Depends(get_current_user)):
    """Alias: Supprime un utilisateur"""
    result = await db.users.delete_one({"id": member_id})
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
    # Membres = users avec role="membre" ou "eleve" (legacy compatibility)
    member_query = {"role": {"$in": ["membre", "eleve"]}}

    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Run independent counts in parallel
    total_members_task = db.users.count_documents(member_query)
    active_memberships_task = db.users.count_documents({**member_query, "membership_status": "Actif"})
    revenue_pipeline = [{"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    total_revenue_task = db.subscriptions.aggregate(revenue_pipeline).to_list(1)
    new_members_task = db.users.count_documents({
        **member_query,
        "created_at": {"$gte": start_of_month.isoformat()}
    })

    total_members, active_memberships, revenue_result, new_members_this_month = await asyncio.gather(
        total_members_task, active_memberships_task, total_revenue_task, new_members_task
    )

    total_revenue = revenue_result[0]["total"] if revenue_result else 0.0

    members_by_month = [
        {"month": "Jan", "count": 12},
        {"month": "Fév", "count": 19},
        {"month": "Mar", "count": 15},
        {"month": "Avr", "count": 22},
        {"month": "Mai", "count": 18},
        {"month": "Jun", "count": 25},
        {"month": "Jul", "count": 30}
    ]

    # Optimized: use aggregation for country stats
    country_pipeline = [
        {"$match": member_query},
        {"$project": {"country": 1}},  # Critical: minimize document size early
        {"$group": {"_id": "$country", "count": {"$sum": 1}}},
        {"$project": {"_id": 0, "country": {"$ifNull": ["$_id", "Inconnu"]}, "count": 1}}
    ]
    members_by_country = await db.users.aggregate(country_pipeline).to_list(1000)

    # Optimized: use strict projection for recent members
    recent_members_list = await db.users.find(
        member_query,
        {"_id": 0, "password_hash": 0, "photo": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    recent_members_formatted = []
    for member in recent_members_list:
        if isinstance(member.get('created_at'), str):
            try:
                member['created_at'] = datetime.fromisoformat(member['created_at'].replace('Z', '+00:00'))
            except:
                member['created_at'] = None
        # Ajouter first_name/last_name pour compatibilité
        if member.get('full_name') and not member.get('first_name'):
            parts = member['full_name'].split(' ', 1)
            member['first_name'] = parts[0]
            member['last_name'] = parts[1] if len(parts) > 1 else ''
        # Créer un DashboardMemberSummary avec des valeurs par défaut
        recent_members_formatted.append(DashboardMemberSummary(
            id=member.get('id', ''),
            first_name=member.get('first_name', ''),
            last_name=member.get('last_name', ''),
            full_name=member.get('full_name'),
            email=member.get('email'),
            phone=member.get('phone'),
            date_of_birth=member.get('date_of_birth'),
            country=member.get('country'),
            city=member.get('city'),
            technical_director_id=member.get('technical_director_id'),
            photo_url=member.get('photo_url'),
            belt_grade=member.get('belt_grade'),
            membership_status=member.get('membership_status'),
            membership_type=member.get('membership_type'),
            membership_start_date=member.get('membership_start_date'),
            membership_end_date=member.get('membership_end_date'),
            sessions_attended=member.get('sessions_attended', 0),
            created_at=member.get('created_at')
        ))

    return {
        "total_members": total_members,
        "total_revenue": total_revenue,
        "active_memberships": active_memberships,
        "new_members_this_month": new_members_this_month,
        "revenue_change_percent": 12.5,
        "members_by_month": members_by_month,
        "members_by_country": members_by_country,
        "recent_members": recent_members_formatted
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

# Task Management Routes
@api_router.post("/tasks", response_model=Task)
async def create_task(task_data: TaskCreate, current_user: dict = Depends(get_current_user)):
    """Create a new task (admin only)"""
    require_admin(current_user)
    
    # Get assigned user name and photo if assigned_to is provided
    assigned_to_name = None
    assigned_to_photo = None
    if task_data.assigned_to:
        assigned_user = await db.users.find_one({"id": task_data.assigned_to, "role": "admin"}, {"_id": 0})
        if assigned_user:
            assigned_to_name = assigned_user.get('full_name')
            assigned_to_photo = assigned_user.get('photo_url')
    
    task = Task(
        **task_data.model_dump(),
        created_by=current_user['id'],
        created_by_name=current_user['full_name'],
        assigned_to_name=assigned_to_name,
        assigned_to_photo=assigned_to_photo
    )
    doc = task.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.tasks.insert_one(doc)
    return task

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(current_user: dict = Depends(get_current_user)):
    """Get all tasks (admin only)"""
    require_admin(current_user)
    
    tasks = await db.tasks.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for task in tasks:
        if isinstance(task.get('created_at'), str):
            task['created_at'] = datetime.fromisoformat(task['created_at'])
        if isinstance(task.get('updated_at'), str):
            task['updated_at'] = datetime.fromisoformat(task['updated_at'])
    return tasks

@api_router.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific task (admin only)"""
    require_admin(current_user)
    
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if isinstance(task.get('created_at'), str):
        task['created_at'] = datetime.fromisoformat(task['created_at'])
    if isinstance(task.get('updated_at'), str):
        task['updated_at'] = datetime.fromisoformat(task['updated_at'])
    return task

@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a task (admin only)"""
    require_admin(current_user)
    
    update_data = {k: v for k, v in task_data.model_dump().items() if v is not None}
    
    # Update assigned_to_name and photo if assigned_to is being changed
    if 'assigned_to' in update_data and update_data['assigned_to']:
        assigned_user = await db.users.find_one({"id": update_data['assigned_to'], "role": "admin"}, {"_id": 0})
        if assigned_user:
            update_data['assigned_to_name'] = assigned_user.get('full_name')
            update_data['assigned_to_photo'] = assigned_user.get('photo_url')
    elif 'assigned_to' in update_data and update_data['assigned_to'] is None:
        update_data['assigned_to_name'] = None
        update_data['assigned_to_photo'] = None
    
    if update_data:
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        result = await db.tasks.update_one({"id": task_id}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Task not found")
    
    updated = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return updated

@api_router.patch("/tasks/{task_id}/toggle")
async def toggle_task_status(task_id: str, current_user: dict = Depends(get_current_user)):
    """Toggle task status between TODO and DONE (admin only)"""
    require_admin(current_user)
    
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    new_status = TaskStatus.DONE if task['status'] == TaskStatus.TODO else TaskStatus.TODO
    await db.tasks.update_one(
        {"id": task_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    updated = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return updated

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a task (admin only)"""
    require_admin(current_user)
    
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

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
    # Also delete related comments and reactions
    await db.news_comments.delete_many({"news_id": news_id})
    await db.news_reactions.delete_many({"news_id": news_id})
    return {"message": "News deleted successfully"}

# News Comments and Reactions
@api_router.get("/news/{news_id}/comments")
async def get_news_comments(news_id: str):
    """Get all comments for a news article"""
    comments = await db.news_comments.find(
        {"news_id": news_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    return {"comments": comments}

class NewsCommentCreate(BaseModel):
    content: str

@api_router.post("/news/{news_id}/comments")
async def add_news_comment(news_id: str, comment_data: NewsCommentCreate, current_user: dict = Depends(get_current_user)):
    """Add a comment to a news article"""
    # Verify news exists
    news = await db.news.find_one({"id": news_id})
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    comment = {
        "id": str(uuid.uuid4()),
        "news_id": news_id,
        "author_id": current_user["id"],
        "author_name": current_user.get("full_name", "Membre"),
        "author_photo": current_user.get("photo_url"),
        "content": comment_data.content,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.news_comments.insert_one(comment)
    
    # Increment comment count on news
    await db.news.update_one({"id": news_id}, {"$inc": {"comments_count": 1}})
    
    return comment

@api_router.delete("/news/{news_id}/comments/{comment_id}")
async def delete_news_comment(news_id: str, comment_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a comment from a news article"""
    comment = await db.news_comments.find_one({"id": comment_id, "news_id": news_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Only author or admin can delete
    if comment["author_id"] != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.news_comments.delete_one({"id": comment_id})
    await db.news.update_one({"id": news_id}, {"$inc": {"comments_count": -1}})
    
    return {"message": "Comment deleted"}

@api_router.post("/news/{news_id}/reactions")
async def toggle_news_reaction(news_id: str, reaction_data: dict, current_user: dict = Depends(get_current_user)):
    """Toggle a reaction on a news article"""
    # Verify news exists
    news = await db.news.find_one({"id": news_id})
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    
    reaction_type = reaction_data.get("reaction_type", "like")
    user_id = current_user["id"]
    
    # Check if user already has a reaction
    existing = await db.news_reactions.find_one({"news_id": news_id, "user_id": user_id})
    
    if existing:
        if existing["reaction_type"] == reaction_type:
            # Same reaction - remove it
            await db.news_reactions.delete_one({"id": existing["id"]})
            await db.news.update_one({"id": news_id}, {"$inc": {"reactions_count": -1}})
            return {"action": "removed", "reaction_type": reaction_type}
        else:
            # Different reaction - update it
            await db.news_reactions.update_one(
                {"id": existing["id"]},
                {"$set": {"reaction_type": reaction_type}}
            )
            return {"action": "updated", "reaction_type": reaction_type}
    else:
        # New reaction
        reaction = {
            "id": str(uuid.uuid4()),
            "news_id": news_id,
            "user_id": user_id,
            "user_name": current_user.get("full_name", "Membre"),
            "reaction_type": reaction_type,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.news_reactions.insert_one(reaction)
        await db.news.update_one({"id": news_id}, {"$inc": {"reactions_count": 1}})
        return {"action": "added", "reaction_type": reaction_type}

@api_router.get("/news/{news_id}/reactions")
async def get_news_reactions(news_id: str):
    """Get all reactions for a news article"""
    reactions = await db.news_reactions.find(
        {"news_id": news_id},
        {"_id": 0}
    ).to_list(500)
    
    # Group by reaction type
    reaction_counts = {}
    for r in reactions:
        rt = r.get("reaction_type", "like")
        reaction_counts[rt] = reaction_counts.get(rt, 0) + 1
    
    return {
        "reactions": reactions,
        "counts": reaction_counts,
        "total": len(reactions)
    }

@api_router.get("/news/{news_id}/user-reaction")
async def get_user_news_reaction(news_id: str, current_user: dict = Depends(get_current_user)):
    """Get current user's reaction on a news article"""
    reaction = await db.news_reactions.find_one(
        {"news_id": news_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    return {"reaction": reaction}

# Events Routes

# Endpoint to get eligible event organizers (instructors, directors, admins, founders)
@api_router.get("/events/organizers")
async def get_event_organizers(current_user: dict = Depends(get_current_user)):
    """
    Get list of users eligible to organize events.
    Roles: instructeur, directeur_technique, directeur_national, admin, fondateur
    Accessible to any authenticated user.
    """
    eligible_roles = ['instructeur', 'directeur_technique', 'directeur_national', 'admin', 'fondateur']
    
    organizers = await db.users.find(
        {"role": {"$in": eligible_roles}},
        {"_id": 0, "id": 1, "full_name": 1, "role": 1, "email": 1}
    ).sort("full_name", 1).to_list(100)
    
    return {"organizers": organizers}

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
    
    # Vérifier que l'événement n'est pas passé
    from datetime import date
    event_end_date = event.get('end_date')
    if event_end_date:
        try:
            end_date = datetime.strptime(event_end_date, '%Y-%m-%d').date()
            if end_date < date.today():
                raise HTTPException(status_code=400, detail="Impossible de s'inscrire \u00e0 un \u00e9v\u00e9nement pass\u00e9")
        except ValueError:
            pass  # Si le format de date est invalide, on continue
    
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
    
    # Search users - exclure les adresses système (academie-levinet, academielevinet)
    # Use strict projection to avoid large document sizes
    users = await db.users.find({
        "$and": [
            {"id": {"$ne": current_user['id']}},
            {"email": {"$not": {"$regex": "academie-?levinet", "$options": "i"}}},
            {"$or": [
                {"full_name": {"$regex": q, "$options": "i"}},
                {"email": {"$regex": q, "$options": "i"}}
            ]}
        ]
    }, {"_id": 0, "id": 1, "full_name": 1, "email": 1, "photo_url": 1, "role": 1}).to_list(10)
    
    for u in users:
        results.append({
            "id": u['id'],
            "name": u['full_name'],
            "email": u['email'],
            "photo_url": u.get('photo_url'),
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
                "photo_url": m.get('photo_url'),
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
                "photo_url": d.get('photo_url'),
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
    
    if not conversations:
        return []

    # Batch fetch all other participants' photos to avoid N+1 queries
    other_participant_ids = []
    conversation_ids = []
    for conv in conversations:
        conversation_ids.append(conv['id'])
        other_participant_idx = 1 if conv['participants'][0] == current_user['id'] else 0
        if len(conv['participants']) > other_participant_idx:
            other_participant_ids.append(conv['participants'][other_participant_idx])

    users_info = {}
    if other_participant_ids:
        users_cursor = db.users.find(
            {"id": {"$in": other_participant_ids}},
            {"_id": 0, "id": 1, "photo_url": 1}
        )
        async for user in users_cursor:
            users_info[user['id']] = user.get('photo_url')

    # Batch fetch unread counts
    unread_counts_cursor = db.messages.aggregate([
        {"$match": {
            "conversation_id": {"$in": conversation_ids},
            "sender_id": {"$ne": current_user['id']},
            "read": False
        }},
        {"$group": {"_id": "$conversation_id", "count": {"$sum": 1}}}
    ])
    unread_counts = {item["_id"]: item["count"] async for item in unread_counts_cursor}

    # Convert datetime strings and add unread count
    for conv in conversations:
        if isinstance(conv.get('created_at'), str):
            conv['created_at'] = datetime.fromisoformat(conv['created_at'])
        if isinstance(conv.get('updated_at'), str):
            conv['updated_at'] = datetime.fromisoformat(conv['updated_at'])
        if conv.get('last_message_at') and isinstance(conv.get('last_message_at'), str):
            conv['last_message_at'] = datetime.fromisoformat(conv['last_message_at'])
        
        # Get unread count from batch-fetched data
        conv['unread_count'] = unread_counts.get(conv['id'], 0)
        
        # Get the other participant's info
        other_participant_idx = 1 if conv['participants'][0] == current_user['id'] else 0
        other_participant_id = conv['participants'][other_participant_idx] if len(conv['participants']) > other_participant_idx else None
        conv['other_participant_name'] = conv['participant_names'][other_participant_idx] if len(conv['participant_names']) > other_participant_idx else "Utilisateur"
        conv['other_participant_id'] = other_participant_id
        
        # Get other participant's photo from our batch-fetched info
        conv['other_participant_photo'] = users_info.get(other_participant_id) if other_participant_id else None
    
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
    recipient = await db.users.find_one({"id": data.recipient_id}, {"_id": 0, "photo": 0})
    if recipient:
        recipient_name = recipient['full_name']
    else:
        # Check in members
        recipient = await db.members.find_one({"id": data.recipient_id}, {"_id": 0, "photo": 0})
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
    # Valider que le message n'est pas vide
    if not data.content or not data.content.strip():
        raise HTTPException(status_code=400, detail="Le message ne peut pas être vide")
    
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
    recipient = await db.users.find_one({"id": other_participant_id}, {"_id": 0, "photo": 0})
    if not recipient:
        recipient = await db.members.find_one({"id": other_participant_id}, {"_id": 0, "photo": 0})
    if not recipient:
        recipient = await db.technical_directors.find_one({"id": other_participant_id}, {"_id": 0, "photo": 0})
    
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
    require_admin(current_user)
    
    messages = await db.messages.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    
    total = await db.messages.count_documents({})
    
    return {"messages": messages, "total": total}

@api_router.delete("/admin/messages/{message_id}")
async def admin_delete_message(message_id: str, current_user: dict = Depends(get_current_user)):
    """Admin: Delete a message (moderation)"""
    require_admin(current_user)
    
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
    require_admin(current_user)
    
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
    
    if not posts:
        return {"posts": [], "total": 0}

    # Batch fetch all authors
    author_ids = list(set(post.get("author_id") for post in posts if post.get("author_id")))
    authors_info = {}
    if author_ids:
        authors_cursor = db.users.find(
            {"id": {"$in": author_ids}},
            {"_id": 0, "id": 1, "full_name": 1, "photo_url": 1, "role": 1}
        )
        async for author in authors_cursor:
            authors_info[author['id']] = author

    # Batch fetch comment counts and reactions in parallel
    post_ids = [post["id"] for post in posts]
    comment_counts_task = db.post_comments.aggregate([
        {"$match": {"post_id": {"$in": post_ids}}},
        {"$group": {"_id": "$post_id", "count": {"$sum": 1}}}
    ]).to_list(len(post_ids))
    reactions_task = db.post_reactions.find({"post_id": {"$in": post_ids}}, {"_id": 0}).to_list(1000)

    comment_counts_res, reactions_res = await asyncio.gather(comment_counts_task, reactions_task)

    comment_counts = {item["_id"]: item["count"] for item in comment_counts_res}
    all_reactions = {}
    for r in reactions_res:
        pid = r["post_id"]
        if pid not in all_reactions:
            all_reactions[pid] = []
        all_reactions[pid].append(r)

    # Enrich posts with author info, comments count, reactions
    for post in posts:
        pid = post["id"]
        # Get author info from our batch-fetched data
        author_id = post.get("author_id")
        if author_id in authors_info:
            post["author"] = authors_info[author_id]
        else:
            # Fallback if author not found - use stored info if available
            post["author"] = {
                "id": author_id,
                "full_name": post.get("author_name", "Membre"),
                "photo_url": post.get("author_photo")
            }
        
        # Get comments count from batch-fetched data
        post["comments_count"] = comment_counts.get(pid, 0)
        
        # Get reactions summary from batch-fetched data
        post_reactions = all_reactions.get(pid, [])
        reaction_summary = {}
        user_reaction = None
        for r in post_reactions:
            rt = r.get("reaction_type", "like")
            reaction_summary[rt] = reaction_summary.get(rt, 0) + 1
            if r.get("user_id") == current_user.get("id"):
                user_reaction = rt
        post["reactions"] = reaction_summary
        post["reactions_count"] = len(post_reactions)
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
        "author_name": current_user.get("full_name", "Membre"),
        "author_photo": current_user.get("photo_url"),
        "content": post_data.content,
        "post_type": post_data.post_type,
        "image_url": post_data.image_url,
        "video_url": post_data.video_url,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.posts.insert_one(post)
    
    # 🎯 Award tokens for creating a post
    await award_tokens(
        current_user.get("id"),
        TokenActionType.POST_CREATED.value,
        description="Publication sur le mur",
        reference_id=post["id"]
    )
    
    # Remove MongoDB _id for response
    post.pop("_id", None)
    
    # Return with author info
    post["author"] = {
        "id": current_user.get("id"),
        "full_name": current_user.get("full_name"),
        "email": current_user.get("email"),
        "role": current_user.get("role"),
        "photo_url": current_user.get("photo_url")
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
    
    if not comments:
        return {"comments": []}

    # Batch fetch all authors
    author_ids = list(set(comment.get("author_id") for comment in comments if comment.get("author_id")))
    authors_info = {}
    if author_ids:
        authors_cursor = db.users.find(
            {"id": {"$in": author_ids}},
            {"_id": 0, "id": 1, "full_name": 1, "photo_url": 1, "role": 1}
        )
        async for author in authors_cursor:
            authors_info[author['id']] = author

    # Enrich with author info
    for comment in comments:
        author_id = comment.get("author_id")
        if author_id in authors_info:
            comment["author"] = authors_info[author_id]
        else:
            # Fallback if author not found
            comment["author"] = {
                "id": author_id,
                "full_name": comment.get("author_name", "Membre"),
                "photo_url": comment.get("author_photo")
            }
    
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
        "author_name": current_user.get("full_name", "Membre"),
        "author_photo": current_user.get("photo_url"),
        "content": comment_data.content,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.post_comments.insert_one(comment)
    
    # 🎯 Award tokens for commenting
    await award_tokens(
        current_user.get("id"),
        TokenActionType.COMMENT_ADDED.value,
        description="Commentaire sur un post",
        reference_id=comment["id"]
    )
    
    # Remove MongoDB _id for response
    comment.pop("_id", None)
    
    comment["author"] = {
        "id": current_user.get("id"),
        "full_name": current_user.get("full_name"),
        "email": current_user.get("email"),
        "photo_url": current_user.get("photo_url")
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
        
        # 🎯 Award tokens to post author for receiving a reaction
        if post.get("author_id") and post.get("author_id") != current_user.get("id"):
            await award_tokens(
                post.get("author_id"),
                TokenActionType.REACTION_RECEIVED.value,
                description="Réaction reçue sur un post",
                reference_id=post_id
            )
        
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
            {"_id": 0, "password_hash": 0, "photo": 0}
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
    recent_members = await db.users.find({}, {"_id": 0, "password_hash": 0, "photo": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "total_members": total_members,
        "total_posts": total_posts,
        "total_comments": total_comments,
        "posts_this_week": posts_this_week,
        "recent_members": recent_members
    }

# ==================== PARTNERS & SPONSORS ENDPOINTS ====================

class CampaignCreate(BaseModel):
    name: str
    type: str  # display, social, email, search
    status: str = "draft"  # draft, active, paused, completed
    budget: float = 0
    start_date: str
    end_date: str

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    budget: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class AffiliateCreate(BaseModel):
    name: str
    email: str
    code: str
    commission_rate: int = 10
    status: str = "active"

class AffiliateUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    code: Optional[str] = None
    commission_rate: Optional[int] = None
    status: Optional[str] = None

@api_router.get("/partners/stats")
async def get_partner_stats(current_user: dict = Depends(get_current_user)):
    """Get partner and affiliate statistics"""
    campaigns = await db.campaigns.find({}, {"_id": 0}).to_list(1000)
    affiliates = await db.affiliates.find({}, {"_id": 0}).to_list(1000)
    
    total_campaigns = len(campaigns)
    active_campaigns = len([c for c in campaigns if c.get("status") == "active"])
    total_clicks = sum(c.get("clicks", 0) for c in campaigns)
    total_conversions = sum(c.get("conversions", 0) for c in campaigns)
    
    total_affiliates = len([a for a in affiliates if a.get("status") == "active"])
    affiliate_clicks = sum(a.get("clicks", 0) for a in affiliates)
    affiliate_conversions = sum(a.get("conversions", 0) for a in affiliates)
    total_commissions = sum(a.get("total_earned", 0) for a in affiliates)
    
    # Estimate revenue (conversions * average order value)
    avg_order_value = 85  # euros
    total_revenue = (total_conversions + affiliate_conversions) * avg_order_value
    
    return {
        "totalCampaigns": total_campaigns,
        "activeCampaigns": active_campaigns,
        "totalClicks": total_clicks + affiliate_clicks,
        "totalConversions": total_conversions + affiliate_conversions,
        "conversionRate": round((total_conversions + affiliate_conversions) / max(total_clicks + affiliate_clicks, 1) * 100, 2),
        "totalAffiliates": total_affiliates,
        "totalCommissions": total_commissions,
        "totalRevenue": total_revenue
    }

@api_router.get("/partners/campaigns")
async def get_campaigns(current_user: dict = Depends(get_current_user)):
    """Get all campaigns"""
    campaigns = await db.campaigns.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return campaigns

@api_router.post("/partners/campaigns")
async def create_campaign(data: CampaignCreate, current_user: dict = Depends(get_current_user)):
    """Create a new campaign"""
    campaign = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "type": data.type,
        "status": data.status,
        "budget": data.budget,
        "spent": 0,
        "clicks": 0,
        "conversions": 0,
        "start_date": data.start_date,
        "end_date": data.end_date,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.campaigns.insert_one(campaign)
    return campaign

@api_router.put("/partners/campaigns/{campaign_id}")
async def update_campaign(campaign_id: str, data: CampaignUpdate, current_user: dict = Depends(get_current_user)):
    """Update a campaign"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if update_data:
        await db.campaigns.update_one({"id": campaign_id}, {"$set": update_data})
    campaign = await db.campaigns.find_one({"id": campaign_id}, {"_id": 0})
    return campaign

@api_router.delete("/partners/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a campaign"""
    await db.campaigns.delete_one({"id": campaign_id})
    return {"message": "Campagne supprimée"}

@api_router.get("/partners/affiliates")
async def get_affiliates(current_user: dict = Depends(get_current_user)):
    """Get all affiliates"""
    affiliates = await db.affiliates.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return affiliates

@api_router.post("/partners/affiliates")
async def create_affiliate(data: AffiliateCreate, current_user: dict = Depends(get_current_user)):
    """Create a new affiliate"""
    # Check if code already exists
    existing = await db.affiliates.find_one({"code": data.code})
    if existing:
        raise HTTPException(status_code=400, detail="Ce code affilié existe déjà")
    
    affiliate = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": data.email,
        "code": data.code,
        "commission_rate": data.commission_rate,
        "status": data.status,
        "clicks": 0,
        "conversions": 0,
        "total_earned": 0,
        "joined_at": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.affiliates.insert_one(affiliate)
    return affiliate

@api_router.put("/partners/affiliates/{affiliate_id}")
async def update_affiliate(affiliate_id: str, data: AffiliateUpdate, current_user: dict = Depends(get_current_user)):
    """Update an affiliate"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if update_data:
        await db.affiliates.update_one({"id": affiliate_id}, {"$set": update_data})
    affiliate = await db.affiliates.find_one({"id": affiliate_id}, {"_id": 0})
    return affiliate

@api_router.delete("/partners/affiliates/{affiliate_id}")
async def delete_affiliate(affiliate_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an affiliate"""
    await db.affiliates.delete_one({"id": affiliate_id})
    return {"message": "Affilié supprimé"}

@api_router.post("/partners/track-click")
async def track_affiliate_click(code: str):
    """Track a click from an affiliate link (public endpoint)"""
    affiliate = await db.affiliates.find_one({"code": code, "status": "active"})
    if affiliate:
        await db.affiliates.update_one(
            {"id": affiliate["id"]},
            {"$inc": {"clicks": 1}}
        )
        return {"success": True}
    return {"success": False}

@api_router.post("/partners/track-conversion")
async def track_affiliate_conversion(code: str, amount: float = 0):
    """Track a conversion from an affiliate (public endpoint)"""
    affiliate = await db.affiliates.find_one({"code": code, "status": "active"})
    if affiliate:
        commission = amount * (affiliate.get("commission_rate", 10) / 100)
        await db.affiliates.update_one(
            {"id": affiliate["id"]},
            {
                "$inc": {
                    "conversions": 1,
                    "total_earned": commission
                }
            }
        )
        return {"success": True, "commission": commission}
    return {"success": False}

# ==================== FORUMS ENDPOINTS ====================

class ForumCreate(BaseModel):
    name: str
    description: str
    icon: str = "💬"
    is_private: bool = False
    participants: Optional[List[str]] = []

class ForumUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    is_private: Optional[bool] = None
    participants: Optional[List[str]] = None

class TopicCreate(BaseModel):
    title: str
    description: Optional[str] = None
    is_pinned: bool = False
    is_locked: bool = False

class TopicUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_locked: Optional[bool] = None

class ForumMessageCreate(BaseModel):
    content: str
    topic_id: str

@api_router.get("/forums/stats")
async def get_forums_stats(current_user: dict = Depends(get_current_user)):
    """Get forum statistics"""
    total_forums = await db.forums.count_documents({})
    total_topics = await db.forum_topics.count_documents({})
    total_messages = await db.forum_messages.count_documents({})
    
    # Get unique authors from messages (last 30 days)
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    recent_messages = await db.forum_messages.find(
        {"created_at": {"$gte": thirty_days_ago}},
        {"author_id": 1}
    ).to_list(10000)
    active_users = len(set(msg.get("author_id") for msg in recent_messages if msg.get("author_id")))
    
    return {
        "totalForums": total_forums,
        "totalTopics": total_topics,
        "totalMessages": total_messages,
        "activeUsers": active_users
    }

@api_router.get("/forums")
async def get_forums(current_user: dict = Depends(get_current_user)):
    """Get all forums"""
    forums = await db.forums.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    if not forums:
        return []

    forum_ids = [f["id"] for f in forums]

    # Aggregate topic and message counts in parallel
    topic_counts_task = db.forum_topics.aggregate([
        {"$match": {"forum_id": {"$in": forum_ids}}},
        {"$group": {"_id": "$forum_id", "count": {"$sum": 1}}}
    ]).to_list(len(forum_ids))
    message_counts_task = db.forum_messages.aggregate([
        {"$match": {"forum_id": {"$in": forum_ids}}},
        {"$group": {"_id": "$forum_id", "count": {"$sum": 1}}}
    ]).to_list(len(forum_ids))

    topic_counts_res, message_counts_res = await asyncio.gather(topic_counts_task, message_counts_task)

    topic_counts = {item["_id"]: item["count"] for item in topic_counts_res}
    message_counts = {item["_id"]: item["count"] for item in message_counts_res}

    for forum in forums:
        forum["topic_count"] = topic_counts.get(forum["id"], 0)
        forum["message_count"] = message_counts.get(forum["id"], 0)
    
    return forums

@api_router.post("/forums")
async def create_forum(data: ForumCreate, current_user: dict = Depends(get_current_user)):
    """Create a new forum"""
    forum = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "description": data.description,
        "icon": data.icon,
        "is_private": data.is_private,
        "participants": data.participants or [],
        "created_by": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "topic_count": 0,
        "message_count": 0
    }
    await db.forums.insert_one(forum)
    return forum

@api_router.put("/forums/{forum_id}")
async def update_forum(forum_id: str, data: ForumUpdate, current_user: dict = Depends(get_current_user)):
    """Update a forum"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if update_data:
        await db.forums.update_one({"id": forum_id}, {"$set": update_data})
    forum = await db.forums.find_one({"id": forum_id}, {"_id": 0})
    return forum

@api_router.delete("/forums/{forum_id}")
async def delete_forum(forum_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a forum and all its topics and messages"""
    # Delete all messages in topics of this forum
    await db.forum_messages.delete_many({"forum_id": forum_id})
    # Delete all topics
    await db.forum_topics.delete_many({"forum_id": forum_id})
    # Delete forum
    await db.forums.delete_one({"id": forum_id})
    return {"message": "Forum supprimé"}

@api_router.get("/forums/{forum_id}/topics")
async def get_forum_topics(forum_id: str, current_user: dict = Depends(get_current_user)):
    """Get all topics in a forum"""
    topics = await db.forum_topics.find(
        {"forum_id": forum_id}, 
        {"_id": 0}
    ).sort([("is_pinned", -1), ("created_at", -1)]).to_list(1000)
    
    # Add message counts and view counts
    for topic in topics:
        topic["message_count"] = await db.forum_messages.count_documents({"topic_id": topic["id"]})
        if "view_count" not in topic:
            topic["view_count"] = 0
    
    return topics

@api_router.post("/forums/{forum_id}/topics")
async def create_topic(forum_id: str, data: TopicCreate, current_user: dict = Depends(get_current_user)):
    """Create a new topic in a forum"""
    try:
        topic = {
            "id": str(uuid.uuid4()),
            "forum_id": forum_id,
            "title": data.title,
            "description": data.description or "",
            "author_id": current_user.get("id", ""),
            "author_name": current_user.get("full_name") or current_user.get("name") or "Utilisateur",
            "author_photo": current_user.get("photo_url"),
            "is_pinned": data.is_pinned if data.is_pinned is not None else False,
            "is_locked": data.is_locked if data.is_locked is not None else False,
            "view_count": 0,
            "message_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_activity": datetime.now(timezone.utc).isoformat()
        }
        await db.forum_topics.insert_one(topic)
        return topic
    except Exception as e:
        logger.error(f"Error creating topic: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/forums/topics/{topic_id}")
async def update_topic(topic_id: str, data: TopicUpdate, current_user: dict = Depends(get_current_user)):
    """Update a topic"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if update_data:
        await db.forum_topics.update_one({"id": topic_id}, {"$set": update_data})
    topic = await db.forum_topics.find_one({"id": topic_id}, {"_id": 0})
    return topic

@api_router.delete("/forums/topics/{topic_id}")
async def delete_topic(topic_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a topic and all its messages"""
    topic = await db.forum_topics.find_one({"id": topic_id})
    if topic:
        # Delete all messages in this topic
        await db.forum_messages.delete_many({"topic_id": topic_id})
        # Delete topic
        await db.forum_topics.delete_one({"id": topic_id})
    return {"message": "Sujet supprimé"}

@api_router.get("/forums/topics/{topic_id}/messages")
async def get_topic_messages(topic_id: str, current_user: dict = Depends(get_current_user)):
    """Get all messages in a topic"""
    # Increment view count
    await db.forum_topics.update_one(
        {"id": topic_id},
        {"$inc": {"view_count": 1}}
    )
    
    messages = await db.forum_messages.find(
        {"topic_id": topic_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(10000)
    
    return messages

@api_router.post("/forums/topics/{topic_id}/messages")
async def create_message(topic_id: str, data: ForumMessageCreate, current_user: dict = Depends(get_current_user)):
    """Post a message in a topic"""
    # Check if topic is locked
    topic = await db.forum_topics.find_one({"id": topic_id})
    if topic and topic.get("is_locked"):
        raise HTTPException(status_code=403, detail="Ce sujet est verrouillé")
    
    message = {
        "id": str(uuid.uuid4()),
        "topic_id": topic_id,
        "forum_id": topic.get("forum_id") if topic else None,
        "content": data.content,
        "author_id": current_user["id"],
        "author_name": current_user.get("full_name", "Utilisateur"),
        "author_photo": current_user.get("photo_url"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.forum_messages.insert_one(message)
    
    # Update topic last activity
    await db.forum_topics.update_one(
        {"id": topic_id},
        {"$set": {"last_activity": datetime.now(timezone.utc).isoformat()}}
    )
    
    return message

# ==================== E-COMMERCE ENDPOINTS ====================

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: Optional[str] = None
    stock: int = 0
    sizes: Optional[List[str]] = None
    is_active: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    stock: Optional[int] = None
    sizes: Optional[List[str]] = None
    is_active: Optional[bool] = None

@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    active_only: bool = True
):
    """Get all products, optionally filtered by category"""
    query = {}
    if category:
        query["category"] = category
    if active_only:
        query["is_active"] = True
    
    products = await db.products.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"products": products}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get a single product by ID"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/admin/products")
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_user)
):
    """Admin: Create a new product"""
    require_admin(current_user)
    
    product = {
        "id": str(uuid.uuid4()),
        "name": product_data.name,
        "description": product_data.description,
        "price": product_data.price,
        "category": product_data.category,
        "image_url": product_data.image_url,
        "stock": product_data.stock,
        "sizes": product_data.sizes or [],
        "is_active": product_data.is_active,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.products.insert_one(product)
    product.pop("_id", None)
    return product

@api_router.put("/admin/products/{product_id}")
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Admin: Update a product"""
    require_admin(current_user)
    
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/products/{product_id}")
async def delete_product(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Admin: Delete a product"""
    require_admin(current_user)
    
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

@api_router.get("/admin/products")
async def admin_get_products(
    current_user: dict = Depends(get_current_user)
):
    """Admin: Get all products including inactive ones"""
    require_admin(current_user)
    
    products = await db.products.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"products": products}

@api_router.get("/admin/orders")
async def admin_get_orders(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Admin: Get all orders"""
    require_admin(current_user)
    
    query = {}
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"orders": orders}

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    current_user: dict = Depends(get_current_user)
):
    """Admin: Update order status"""
    require_admin(current_user)
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated"}

@api_router.get("/shop/stats")
async def get_shop_stats(current_user: dict = Depends(get_current_user)):
    """Get shop statistics"""
    require_admin(current_user)
    
    total_products = await db.products.count_documents({})
    active_products = await db.products.count_documents({"is_active": True})
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "En attente"})
    
    # Low stock products
    low_stock = await db.products.find({"stock": {"$lt": 5}, "is_active": True}, {"_id": 0}).to_list(10)
    
    return {
        "total_products": total_products,
        "active_products": active_products,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "low_stock_products": low_stock
    }

# ==================== STRIPE PAYMENT ENDPOINTS ====================

# Fixed membership packages (not from frontend)
MEMBERSHIP_PACKAGES = {
    "licence": {
        "name": "Licence Membre",
        "amount": 35.00,
        "currency": "eur",
        "type": "one_time",
        "description": "Cotisation annuelle - Licence obligatoire pour l'assurance"
    },
    "premium": {
        "name": "Abonnement Premium",
        "amount": 5.99,
        "currency": "eur",
        "type": "subscription",
        "interval": "month",
        "description": "10% de remise sur boutique, cahiers techniques et stages"
    },
}

# ---- Request Models ----
class MembershipCheckoutRequest(BaseModel):
    package_id: str  # "licence" or "premium"
    origin_url: str
    user_id: Optional[str] = None

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1
    size: Optional[str] = None

class ShopCheckoutRequest(BaseModel):
    items: List[CartItem]
    origin_url: str
    user_id: Optional[str] = None
    apply_premium_discount: bool = False

# ---- MEMBERSHIP PAYMENTS (Licence 35€ + Premium 5.99€/mois) ----

@api_router.get("/payments/packages")
async def get_payment_packages():
    """Get all available membership packages"""
    return {"packages": MEMBERSHIP_PACKAGES}

@api_router.post("/payments/membership/checkout")
async def create_membership_checkout(
    request: MembershipCheckoutRequest, 
    http_request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Create checkout session for licence or premium subscription"""
    
    if request.package_id not in MEMBERSHIP_PACKAGES:
        raise HTTPException(status_code=400, detail="Package invalide")
    
    package = MEMBERSHIP_PACKAGES[request.package_id]
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Système de paiement non configuré")
    
    success_url = f"{request.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}&type=membership"
    cancel_url = f"{request.origin_url}/payment/cancel"
    
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    metadata = {
        "type": "membership",
        "package_id": request.package_id,
        "package_name": package["name"],
        "user_id": current_user.get("id"),
        "user_email": current_user.get("email")
    }
    
    checkout_request = CheckoutSessionRequest(
        amount=package["amount"],
        currency=package["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Save transaction
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "type": "membership",
        "package_id": request.package_id,
        "package_name": package["name"],
        "user_id": current_user.get("id"),
        "amount": package["amount"],
        "currency": package["currency"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

# ---- SHOP PAYMENTS (Produits boutique) ----

@api_router.post("/payments/shop/checkout")
async def create_shop_checkout(
    request: ShopCheckoutRequest, 
    http_request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Create checkout session for shop products"""
    
    if not request.items:
        raise HTTPException(status_code=400, detail="Panier vide")
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Système de paiement non configuré")
    
    # Calculate total from database (NEVER trust frontend amounts)
    total_amount = 0.0
    order_items = []
    
    for item in request.items:
        product = await db.products.find_one({"id": item.product_id, "is_active": True})
        if not product:
            raise HTTPException(status_code=400, detail=f"Produit {item.product_id} non trouvé")
        if product["stock"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"Stock insuffisant pour {product['name']}")
        
        item_price = product["price"] * item.quantity
        
        # Apply 10% discount for premium members
        if request.apply_premium_discount:
            item_price = item_price * 0.9
        
        total_amount += item_price
        order_items.append({
            "product_id": item.product_id,
            "product_name": product["name"],
            "quantity": item.quantity,
            "size": item.size,
            "unit_price": product["price"],
            "total_price": item_price
        })
    
    success_url = f"{request.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}&type=shop"
    cancel_url = f"{request.origin_url}/payment/cancel"
    
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    order_id = str(uuid.uuid4())
    metadata = {
        "type": "shop",
        "order_id": order_id,
        "user_id": current_user.get("id"),
        "user_email": current_user.get("email"),
        "premium_discount": str(request.apply_premium_discount),
        "items_count": str(len(order_items))
    }
    
    checkout_request = CheckoutSessionRequest(
        amount=round(total_amount, 2),
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create order (pending payment)
    order = {
        "id": order_id,
        "session_id": session.session_id,
        "user_id": current_user.get("id"),
        "user_email": current_user.get("email"),
        "items": order_items,
        "subtotal": sum(item["unit_price"] * item["quantity"] for item in order_items),
        "discount_applied": request.apply_premium_discount,
        "total_amount": round(total_amount, 2),
        "currency": "eur",
        "status": "En attente",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order)
    
    return {"url": session.url, "session_id": session.session_id, "order_id": order_id}

# ---- PAYMENT STATUS ----

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    """Get the status of a payment session"""
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Système de paiement non configuré")
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    try:
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency,
            "metadata": status.metadata
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---- STRIPE WEBHOOK ----

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events
    
    Events handled:
    - checkout.session.completed: Payment successful
    - checkout.session.expired: Session expired
    - invoice.paid: Subscription renewed
    - customer.subscription.deleted: Subscription cancelled
    """
    
    stripe_api_key = os.environ.get('STRIPE_API_KEY')
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Système de paiement non configuré")
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        event_type = webhook_response.event_type
        session_id = webhook_response.session_id
        metadata = webhook_response.metadata or {}
        
        logger.info(f"Webhook received: {event_type} for session {session_id}")
        
        # Handle different payment types
        payment_type = metadata.get("type", "unknown")
        
        if event_type == "checkout.session.completed":
            if payment_type == "membership":
                # Update user membership status
                user_id = metadata.get("user_id")
                package_id = metadata.get("package_id")
                
                if user_id and package_id == "licence":
                    await db.users.update_one(
                        {"id": user_id},
                        {"$set": {
                            "has_paid_license": True,
                            "license_paid_at": datetime.now(timezone.utc).isoformat()
                        }}
                    )
                    logger.info(f"Licence activated for user {user_id}")
                
                elif user_id and package_id == "premium":
                    await db.users.update_one(
                        {"id": user_id},
                        {"$set": {
                            "is_premium": True,
                            "premium_since": datetime.now(timezone.utc).isoformat()
                        }}
                    )
                    logger.info(f"Premium activated for user {user_id}")
                
                # Update transaction
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {
                        "status": "completed",
                        "payment_status": "paid",
                        "completed_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
            
            elif payment_type == "shop":
                # Update order status
                order_id = metadata.get("order_id")
                if order_id:
                    order = await db.orders.find_one({"id": order_id})
                    if order:
                        # Decrease stock for each item
                        for item in order.get("items", []):
                            await db.products.update_one(
                                {"id": item["product_id"]},
                                {"$inc": {"stock": -item["quantity"]}}
                            )
                        
                        # Update order status
                        await db.orders.update_one(
                            {"id": order_id},
                            {"$set": {
                                "status": "Payé",
                                "payment_status": "paid",
                                "paid_at": datetime.now(timezone.utc).isoformat()
                            }}
                        )
                        logger.info(f"Order {order_id} completed")
        
        elif event_type == "checkout.session.expired":
            # Mark as expired
            if payment_type == "shop":
                order_id = metadata.get("order_id")
                if order_id:
                    await db.orders.update_one(
                        {"id": order_id},
                        {"$set": {"status": "Annulé", "payment_status": "expired"}}
                    )
            
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"status": "expired", "payment_status": "expired"}}
            )
        
        elif event_type == "customer.subscription.deleted":
            # Premium subscription cancelled
            user_id = metadata.get("user_id")
            if user_id:
                await db.users.update_one(
                    {"id": user_id},
                    {"$set": {"is_premium": False, "premium_cancelled_at": datetime.now(timezone.utc).isoformat()}}
                )
                logger.info(f"Premium cancelled for user {user_id}")
        
        return {"status": "success", "event_type": event_type}
    
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# ---- USER ORDERS ----

@api_router.get("/orders/my")
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    """Get current user's orders"""
    orders = await db.orders.find(
        {"user_id": current_user.get("id")},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return {"orders": orders}

@api_router.get("/membership/status")
async def get_membership_status(current_user: dict = Depends(get_current_user)):
    """Get current user's membership status"""
    user = await db.users.find_one({"id": current_user.get("id")}, {"_id": 0, "password_hash": 0, "photo": 0})
    return {
        "licence_paid": user.get("licence_paid", False),
        "licence_date": user.get("licence_date"),
        "is_premium": user.get("is_premium", False),
        "premium_since": user.get("premium_since")
    }

# ==================== SITE CONTENT MANAGEMENT ENDPOINTS ====================

# Default site content structure
DEFAULT_SITE_CONTENT = {
    "branding": {
        "logo_url": "/images/logo-levinet.jpeg",
        "name": "Académie Jacques Levinet",
        "short_name": "AJL",
        "tagline": "École Internationale de Self-Défense",
        "foundation_year": "1998",
        "description": "L'Académie Jacques Levinet forme l'élite de la self-défense mondiale depuis plus de 25 ans."
    },
    "hero": {
        "title": "ACADÉMIE JACQUES LEVINET",
        "subtitle": "Self-Pro Krav (SPK)",
        "description": "Méthode de self-défense réaliste et efficace, adaptée à tous",
        "cta_text": "Rejoindre l'Académie",
        "cta_link": "/onboarding",
        "background_image": "",
        "video_url": "",
        "cta_background_image": "",
        "audience_cards": {
            "public_image": "",
            "women_image": "",
            "pro_image": ""
        }
    },
    "login": {
        "title": "Académie Jacques Levinet",
        "subtitle": "École Internationale de Self-Défense",
        "tagline": "L'excellence en self-défense",
        "background_image": "https://images.unsplash.com/photo-1644594570589-ef85bd03169f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxrcmF2JTIwbWFnYSUyMHRyYWluaW5nJTIwY2xhc3N8ZW58MHx8fHwxNzY1NzM2Njg0fDA&ixlib=rb-4.1.0&q=85",
        "overlay_color": "#0B1120",
        "overlay_opacity": 0.7
    },
    "founder": {
        "name": "",
        "title": "",
        "bio": "",
        "quote": "",
        "photo": "",
        "daily_message": "",
        "daily_message_date": ""
    },
    "about": {
        "title": "À Propos",
        "description": "L'Académie Jacques Levinet forme depuis plus de 40 ans des pratiquants et des professionnels à travers le monde.",
        "image_url": "",
        "image": "",
        "secondary_image": ""
    },
    "disciplines": {
        "wkmo": {
            "title": "WKMO",
            "subtitle": "Pour Toute la Famille",
            "description": "Méthode pour tous les âges",
            "logo_image": "",
            "secondary_image": "",
            "hero_image": ""
        },
        "spk": {
            "title": "Krav Maga Self-Défense",
            "subtitle": "Apprenez à Vous Défendre",
            "description": "Techniques de self-défense efficaces",
            "logo_image": "",
            "secondary_image": "",
            "hero_image": ""
        },
        "sfjl": {
            "title": "Self-Défense Féminine Jacques Levinet",
            "subtitle": "Spécifiquement pour les Femmes",
            "description": "Techniques adaptées pour la défense féminine",
            "logo_image": "",
            "secondary_image": "",
            "hero_image": ""
        },
        "ipc": {
            "title": "IPC / ROS",
            "subtitle": "Pour les Professionnels",
            "description": "Formation pour forces de l'ordre et sécurité",
            "logo_image": "",
            "secondary_image": "",
            "hero_image": ""
        },
        "canne": {
            "title": "Canne Défense",
            "subtitle": "L'Art de la Canne de Défense",
            "description": "Méthode de défense avec canne",
            "logo_image": "",
            "secondary_image": "",
            "hero_image": ""
        },
        "enfant": {
            "title": "Self-Défense Enfants",
            "subtitle": "Pour les Jeunes Pratiquants",
            "description": "Méthode adaptée aux enfants",
            "logo_image": "",
            "secondary_image": "",
            "hero_image": ""
        },
        "baton": {
            "title": "Bâton Défense",
            "subtitle": "Techniques de Bâton",
            "description": "Maîtrise du bâton de défense",
            "logo_image": "",
            "secondary_image": "",
            "hero_image": ""
        }
    },
    "pages": {
        "pedagogy": {
            "title": "Pédagogie",
            "subtitle": "Notre Méthode d'Enseignement",
            "description": "Une approche pédagogique unique",
            "hero_image": "",
            "content_image": "",
            "secondary_image": ""
        },
        "international": {
            "title": "International",
            "subtitle": "Présence Mondiale",
            "description": "L'Académie Jacques Levinet dans le monde",
            "hero_image": "",
            "map_background": "",
            "gallery_images": []
        },
        "kravmag": {
            "title": "Krav Maga AJL",
            "subtitle": "La Méthode Jacques Levinet",
            "description": "Krav Maga authentique et efficace",
            "hero_image": "",
            "content_image": "",
            "secondary_image": ""
        },
        "editions": {
            "title": "Éditions AJL",
            "subtitle": "Publications et Ouvrages",
            "description": "Livres et supports pédagogiques",
            "hero_image": "",
            "books_cover": [],
            "featured_book_image": "",
            "catalog_image": ""
        },
        "join": {
            "title": "Nous Rejoindre",
            "subtitle": "Devenez Membre",
            "description": "Rejoignez notre communauté internationale",
            "hero_image": "",
            "benefits_image": "",
            "cta_background": ""
        },
        "find_club": {
            "title": "Trouver un Club",
            "subtitle": "Clubs Partenaires",
            "description": "Trouvez un club près de chez vous",
            "hero_image": "",
            "map_marker_image": ""
        },
        "shop": {
            "title": "Boutique",
            "subtitle": "Équipements et Produits",
            "description": "Équipez-vous avec nos produits officiels",
            "hero_image": "",
            "banner_image": "",
            "category_images": {}
        }
    },
    "features": [
        {"title": "Self-Défense Réaliste", "description": "Techniques éprouvées sur le terrain", "icon": "shield"},
        {"title": "Réseau International", "description": "Présence dans plus de 30 pays", "icon": "globe"},
        {"title": "Formation Complète", "description": "Du débutant à l'instructeur", "icon": "award"}
    ],
    "testimonials": [],
    "contact": {
        "email": "contact@academie-levinet.com",
        "phone": "+33698070851",
        "address": "Saint Jean de Védas"
    },
    "social_links": {
        "facebook": "https://www.facebook.com/capitainejacqueslevinet/",
        "instagram": "",
        "youtube": "https://www.youtube.com/@CapitaineJacquesLevinet",
        "linkedin": "https://www.linkedin.com/in/jacqueslevinet/",
        "twitter": "https://x.com/Jacques_LEVINET"
    },
    "images": {
        "logo": "",
        "logo_white": "",
        "favicon": "",
        "og_image": ""
    },
    "footer": {
        "copyright": "© 2025 Académie Jacques Levinet. Tous droits réservés."
    }
}

@api_router.get("/founder-message")
async def get_founder_message():
    """Public: Get founder info and daily message for the dashboard"""
    content = await db.settings.find_one({"id": "site_content"}, {"_id": 0})
    if not content:
        content = DEFAULT_SITE_CONTENT
    
    founder = content.get("founder", DEFAULT_SITE_CONTENT["founder"])
    return {
        "name": founder.get("name", "Capitaine Jacques LEVINET"),
        "title": founder.get("title", "Fondateur de l'Académie"),
        "grade": founder.get("grade", ""),
        "photo": founder.get("photo", ""),
        "daily_message": founder.get("daily_message", ""),
        "daily_message_date": founder.get("daily_message_date", "")
    }

@api_router.get("/admin/site-content")
async def get_site_content(current_user: dict = Depends(get_current_user)):
    """Admin: Get site content for editing"""
    require_admin(current_user)
    
    content = await db.settings.find_one({"id": "site_content"}, {"_id": 0})
    if not content:
        return DEFAULT_SITE_CONTENT
    
    # Merge with defaults for any missing keys
    merged = {**DEFAULT_SITE_CONTENT, **content}
    return merged

@api_router.put("/admin/site-content")
async def update_site_content(data: dict, current_user: dict = Depends(get_current_user)):
    """Admin: Update site content"""
    require_admin(current_user)
    
    # Log pour debug
    import json
    data_size = len(json.dumps(data))
    logger.info(f"📥 Sauvegarde site-content: {data_size} octets, sections: {list(data.keys())}")
    
    # Vérifier la taille (MongoDB limite à 16MB)
    if data_size > 15 * 1024 * 1024:  # 15MB pour marge de sécurité
        logger.error(f"❌ Document trop volumineux: {data_size} octets")
        raise HTTPException(status_code=413, detail=f"Document trop volumineux ({data_size / 1024 / 1024:.1f} Mo). Réduisez la taille des images.")
    
    data["id"] = "site_content"
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    data["updated_by"] = current_user["id"]
    
    try:
        result = await db.settings.update_one(
            {"id": "site_content"},
            {"$set": data},
            upsert=True
        )
        logger.info(f"✅ Site-content sauvegardé: matched={result.matched_count}, modified={result.modified_count}")
        _invalidate_site_content_cache()
    except Exception as e:
        logger.error(f"❌ Erreur MongoDB: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur base de données: {str(e)}")

    return {"message": "Contenu du site mis à jour"}

@api_router.put("/admin/site-content/{section}")
async def update_site_section(section: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Admin: Update a specific section of site content"""
    require_admin(current_user)
    
    valid_sections = ['hero', 'about', 'features', 'testimonials', 'contact', 'social_links', 'footer']
    if section not in valid_sections:
        raise HTTPException(status_code=400, detail=f"Section invalide. Sections valides: {', '.join(valid_sections)}")
    
    await db.settings.update_one(
        {"id": "site_content"},
        {
            "$set": {
                section: data,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "updated_by": current_user["id"]
            }
        },
        upsert=True
    )
    _invalidate_site_content_cache()

    return {"message": f"Section '{section}' mise à jour"}

# In-memory cache for site content (avoids hitting MongoDB on every page load)
_site_content_cache = {"data": None, "timestamp": 0}
_SITE_CONTENT_CACHE_TTL = 60  # seconds

def _invalidate_site_content_cache():
    """Invalidate the site content cache when admin updates content"""
    _site_content_cache["data"] = None
    _site_content_cache["timestamp"] = 0

@api_router.get("/site-content")
async def get_public_site_content():
    """Public: Get site content for display - optimized for performance"""
    import time
    from fastapi.responses import JSONResponse

    now = time.time()

    # Serve from cache if available and fresh
    if _site_content_cache["data"] is not None and (now - _site_content_cache["timestamp"]) < _SITE_CONTENT_CACHE_TTL:
        return JSONResponse(
            content=_site_content_cache["data"],
            headers={"Cache-Control": "public, max-age=60, stale-while-revalidate=300"}
        )

    content = await db.settings.find_one({"id": "site_content"}, {"_id": 0})
    if not content:
        _site_content_cache["data"] = DEFAULT_SITE_CONTENT
        _site_content_cache["timestamp"] = now
        return JSONResponse(
            content=DEFAULT_SITE_CONTENT,
            headers={"Cache-Control": "public, max-age=60, stale-while-revalidate=300"}
        )

    merged = {**DEFAULT_SITE_CONTENT, **content}

    essential_content = {
        "branding": merged.get("branding", DEFAULT_SITE_CONTENT["branding"]),
        "hero": {
            "title": merged.get("hero", {}).get("title", DEFAULT_SITE_CONTENT["hero"]["title"]),
            "subtitle": merged.get("hero", {}).get("subtitle", DEFAULT_SITE_CONTENT["hero"]["subtitle"]),
            "description": merged.get("hero", {}).get("description", DEFAULT_SITE_CONTENT["hero"]["description"]),
            "cta_text": merged.get("hero", {}).get("cta_text", DEFAULT_SITE_CONTENT["hero"]["cta_text"]),
            "cta_link": merged.get("hero", {}).get("cta_link", DEFAULT_SITE_CONTENT["hero"]["cta_link"]),
            "background_image": merged.get("hero", {}).get("background_image", ""),
            "video_url": merged.get("hero", {}).get("video_url", ""),
            "cta_background_image": merged.get("hero", {}).get("cta_background_image", ""),
            "audience_cards": merged.get("hero", {}).get("audience_cards", {})
        },
        "login": merged.get("login", DEFAULT_SITE_CONTENT["login"]),
        "founder": merged.get("founder", DEFAULT_SITE_CONTENT["founder"]),
        "about": merged.get("about", DEFAULT_SITE_CONTENT["about"]),
        "disciplines": merged.get("disciplines", DEFAULT_SITE_CONTENT["disciplines"]),
        "pages": merged.get("pages", DEFAULT_SITE_CONTENT["pages"]),
        "contact": merged.get("contact", DEFAULT_SITE_CONTENT["contact"]),
        "social_links": merged.get("social_links", DEFAULT_SITE_CONTENT["social_links"]),
        "footer": merged.get("footer", DEFAULT_SITE_CONTENT["footer"])
    }

    # Update cache
    _site_content_cache["data"] = essential_content
    _site_content_cache["timestamp"] = now

    return JSONResponse(
        content=essential_content,
        headers={"Cache-Control": "public, max-age=60, stale-while-revalidate=300"}
    )

# ==================== PENDING MEMBERS (EXISTING MEMBERS) ENDPOINTS ====================

# ==================== AI ASSISTANT ENDPOINTS ====================

# System prompts for the two assistants
VISITOR_ASSISTANT_PROMPT = """Tu es Léo, l'assistant virtuel de l'Académie Jacques Levinet — la fédération internationale de Krav Maga Self-Défense.

🎯 TA MISSION : Transformer chaque visiteur en futur membre. Tu es chaleureux, motivant, et tu crées l'envie.

📌 CE QUE TU DOIS SAVOIR :

L'ACADÉMIE JACQUES LEVINET, C'EST :
- 50 ans d'expertise en self-défense
- Fondée par le Capitaine Jacques Levinet, 10ème Dan, ancien instructeur de la Police Nationale
- Présente dans 40+ pays avec des centaines de clubs
- Notre méthode "Self-Pro Krav" : le Krav Maga adapté aux lois françaises, 100% légal et éthique

POURQUOI APPRENDRE CHEZ NOUS ?
- Pas besoin d'être sportif ou fort — nos techniques sont basées sur vos réflexes naturels
- Vous apprenez à vous défendre en quelques séances seulement
- Cours adaptés à TOUS : hommes, femmes, enfants, seniors
- Méthode légale — on respecte la légitime défense, on ne va jamais trop loin
- Gagnez en confiance, en sécurité, en forme physique

L'ADHÉSION (35€/an) INCLUT :
- Accès à l'espace membre complet
- Programmes de formation en ligne
- Annuaire des clubs dans le monde
- Messagerie avec les instructeurs
- Événements et stages exclusifs
- Boutique équipements

🗣️ TON STYLE :
- Parle comme un ami bienveillant, pas comme un robot
- Pose des questions pour comprendre leurs besoins ("Qu'est-ce qui vous amène vers la self-défense ?")
- Rassure les inquiets ("Pas besoin d'être sportif !")
- Crée l'urgence ("Plus tôt vous commencez, plus vite vous serez confiant")
- Termine TOUJOURS par une invitation à s'inscrire : "Prêt à faire le premier pas ? → academie-levinet.com/onboarding"

⚡ RÉPONSES : Maximum 4-5 phrases, percutantes et motivantes. Utilise des emojis avec modération pour rendre tes réponses vivantes."""

MEMBER_ASSISTANT_PROMPT = """Tu es Léo, l'assistant personnel des membres de l'Académie Jacques Levinet.

🎯 TA MISSION : Aider les membres à exploiter 100% de leur espace membre et les garder motivés dans leur progression.

📌 FONCTIONNALITÉS DE LA PLATEFORME :

🏠 TABLEAU DE BORD (/dashboard)
→ Vue d'ensemble de votre activité, actualités, prochains événements

👤 MON PROFIL (/member/profile)
→ Modifier vos infos, photo, grade, mot de passe
→ Mettre à jour votre club et instructeur

💬 MESSAGERIE (/messages)
→ Contacter les instructeurs et autres membres
→ Poser vos questions techniques

📅 ÉVÉNEMENTS (/events)
→ Stages, séminaires, passages de grades
→ Inscrivez-vous aux événements près de chez vous !

📰 ACTUALITÉS (/news)
→ Dernières nouvelles de l'académie et de votre discipline

🏢 CLUBS (/clubs)
→ Trouvez un club près de chez vous
→ Demandez à visiter d'autres clubs du réseau

🛒 BOUTIQUE (/shop)
→ Équipements officiels : kimonos, protections, accessoires

🗣️ TON STYLE :
- Sois un coach motivant et bienveillant
- Guide pas à pas avec des instructions claires
- Félicite les progrès ("Super que vous participiez aux événements !")
- Encourage la régularité ("L'entraînement régulier est la clé !")
- Propose toujours une action concrète

💡 ASTUCES À PARTAGER :
- "Pensez à mettre à jour votre photo de profil pour être reconnu dans les stages !"
- "Activez les notifications pour ne manquer aucun événement"
- "La messagerie vous permet de contacter directement votre instructeur"
- "Consultez régulièrement les news pour les opportunités de formation"

⚡ RÉPONSES : Maximum 4-5 phrases, pratiques et encourageantes. Utilise des emojis pour rendre tes réponses conviviales."""

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

# Store active chat sessions in memory (for simplicity)
chat_sessions: Dict[str, LlmChat] = {}

async def get_ai_config():
    """Get AI configuration from database or use defaults"""
    config = await db.settings.find_one({"id": "ai_config"}, {"_id": 0})
    if not config:
        return {
            "visitor_extra_instructions": "",
            "member_extra_instructions": "",
            "ai_enabled": True
        }
    return config

@api_router.post("/assistant/visitor", response_model=ChatResponse)
async def visitor_assistant(data: ChatMessage):
    """Public AI assistant for visitors - presents the academy"""
    session_id = data.session_id or str(uuid.uuid4())
    
    try:
        # Get custom instructions
        ai_config = await get_ai_config()
        if not ai_config.get("ai_enabled", True):
            return ChatResponse(response="L'assistant est temporairement indisponible.", session_id=session_id)
        
        extra_instructions = ai_config.get("visitor_extra_instructions", "")
        full_prompt = VISITOR_ASSISTANT_PROMPT
        if extra_instructions:
            full_prompt += f"\n\nINSTRUCTIONS SUPPLÉMENTAIRES DE L'ADMIN:\n{extra_instructions}"
        
        # Get or create chat session
        if session_id not in chat_sessions:
            chat_sessions[session_id] = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=session_id,
                system_message=full_prompt
            ).with_model("openai", "gpt-4o-mini")
        
        chat = chat_sessions[session_id]
        
        # Send message and get response
        user_message = UserMessage(text=data.message)
        response = await chat.send_message(user_message)
        
        # Save to database for history
        await db.chat_history.insert_one({
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "type": "visitor",
            "user_message": data.message,
            "assistant_response": response,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return ChatResponse(response=response, session_id=session_id)
        
    except Exception as e:
        logger.error(f"Visitor assistant error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur de l'assistant. Veuillez réessayer.")

@api_router.post("/assistant/member", response_model=ChatResponse)
async def member_assistant(data: ChatMessage, current_user: dict = Depends(get_current_user)):
    """AI assistant for members - helps with platform usage"""
    session_id = data.session_id or f"member_{current_user['id']}"
    
    try:
        # Get custom instructions
        ai_config = await get_ai_config()
        if not ai_config.get("ai_enabled", True):
            return ChatResponse(response="L'assistant est temporairement indisponible.", session_id=session_id)
        
        extra_instructions = ai_config.get("member_extra_instructions", "")
        
        # Personalized system message with member info
        personalized_prompt = f"""{MEMBER_ASSISTANT_PROMPT}

INFORMATIONS SUR LE MEMBRE ACTUEL :
- Nom : {current_user.get('full_name', 'Membre')}
- Grade : {current_user.get('belt_grade', 'Non défini')}
- Club : {current_user.get('club_name', 'Non défini')}
"""
        if extra_instructions:
            personalized_prompt += f"\n\nINSTRUCTIONS SUPPLÉMENTAIRES DE L'ADMIN:\n{extra_instructions}"
        
        # Get or create chat session
        if session_id not in chat_sessions:
            chat_sessions[session_id] = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=session_id,
                system_message=personalized_prompt
            ).with_model("openai", "gpt-4o-mini")
        
        chat = chat_sessions[session_id]
        
        # Send message and get response
        user_message = UserMessage(text=data.message)
        response = await chat.send_message(user_message)
        
        # Save to database for history
        await db.chat_history.insert_one({
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "type": "member",
            "user_id": current_user['id'],
            "user_message": data.message,
            "assistant_response": response,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return ChatResponse(response=response, session_id=session_id)
        
    except Exception as e:
        logger.error(f"Member assistant error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur de l'assistant. Veuillez réessayer.")

@api_router.get("/assistant/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    """Get member's chat history"""
    history = await db.chat_history.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"history": history}

# ==================== AI CONFIGURATION ENDPOINTS ====================

@api_router.get("/admin/ai-config")
async def get_ai_configuration(current_user: dict = Depends(get_current_user)):
    """Admin: Get AI assistant configuration"""
    require_admin(current_user)
    
    config = await db.settings.find_one({"id": "ai_config"}, {"_id": 0})
    if not config:
        return {
            "visitor_extra_instructions": "",
            "member_extra_instructions": "",
            "ai_enabled": True,
            "visitor_base_prompt": VISITOR_ASSISTANT_PROMPT,
            "member_base_prompt": MEMBER_ASSISTANT_PROMPT
        }
    
    config["visitor_base_prompt"] = VISITOR_ASSISTANT_PROMPT
    config["member_base_prompt"] = MEMBER_ASSISTANT_PROMPT
    return config

@api_router.put("/admin/ai-config")
async def update_ai_configuration(data: dict, current_user: dict = Depends(get_current_user)):
    """Admin: Update AI assistant configuration"""
    require_admin(current_user)
    
    allowed_fields = ["visitor_extra_instructions", "member_extra_instructions", "ai_enabled"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data["id"] = "ai_config"
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.settings.update_one(
        {"id": "ai_config"},
        {"$set": update_data},
        upsert=True
    )
    
    # Clear chat sessions to apply new instructions
    global chat_sessions
    chat_sessions = {}
    
    return {"message": "Configuration IA mise à jour"}

# ==================== MEMBERSHIP & INVOICE ENDPOINTS ====================

@api_router.get("/admin/members/subscriptions")
async def get_members_subscriptions(current_user: dict = Depends(get_current_user)):
    """Admin: Get all members with their subscription status"""
    require_admin(current_user)
    
    members = await db.users.find(
        {"role": "member"},
        {"_id": 0, "password_hash": 0, "photo": 0}
    ).sort("created_at", -1).to_list(500)
    
    # Calculate subscription status for each member
    today = datetime.now(timezone.utc)
    for member in members:
        license_date = member.get("license_paid_at") or member.get("created_at")
        if license_date:
            if isinstance(license_date, str):
                license_date = datetime.fromisoformat(license_date.replace('Z', '+00:00'))
            
            expiry_date = license_date + timedelta(days=365)
            member["subscription_status"] = "active" if today < expiry_date else "expired"
            member["expiry_date"] = expiry_date.isoformat()
            member["days_remaining"] = max(0, (expiry_date - today).days)
        else:
            member["subscription_status"] = "never_paid"
            member["expiry_date"] = None
            member["days_remaining"] = 0
    
    active = sum(1 for m in members if m["subscription_status"] == "active")
    expired = sum(1 for m in members if m["subscription_status"] == "expired")
    
    return {
        "members": members,
        "stats": {
            "total": len(members),
            "active": active,
            "expired": expired,
            "never_paid": len(members) - active - expired
        }
    }

@api_router.put("/admin/members/{user_id}/subscription")
async def update_member_subscription(
    user_id: str,
    has_paid_license: bool,
    license_paid_at: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Admin: Manually update a member's subscription status"""
    require_admin(current_user)
    
    update_data = {"has_paid_license": has_paid_license}
    if license_paid_at:
        update_data["license_paid_at"] = license_paid_at
    elif has_paid_license:
        update_data["license_paid_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Membre non trouvé")
    
    # Create invoice record
    if has_paid_license:
        invoice = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": "membership",
            "amount": 35.00,
            "currency": "EUR",
            "status": "paid",
            "payment_method": "manual",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": current_user["id"]
        }
        await db.invoices.insert_one(invoice)
    
    return {"message": "Statut de cotisation mis à jour"}

@api_router.get("/invoices/my")
async def get_my_invoices(current_user: dict = Depends(get_current_user)):
    """Get current user's invoices"""
    invoices = await db.invoices.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"invoices": invoices}

@api_router.get("/invoices/{invoice_id}/pdf")
async def download_invoice_pdf(invoice_id: str, current_user: dict = Depends(get_current_user)):
    """Generate and download invoice as PDF"""
    # Get invoice
    invoice = await db.invoices.find_one({"id": invoice_id}, {"_id": 0})
    if not invoice:
        raise HTTPException(status_code=404, detail="Facture non trouvée")
    
    # Check access (user's own invoice or admin)
    if invoice["user_id"] != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    # Get user info
    user = await db.users.find_one({"id": invoice["user_id"]}, {"_id": 0, "password_hash": 0, "photo": 0})
    
    # Generate PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, spaceAfter=30, alignment=1)
    normal_style = styles['Normal']
    
    elements = []
    
    # Header
    elements.append(Paragraph("ACADÉMIE JACQUES LEVINET", title_style))
    elements.append(Paragraph("Self-Pro Krav (SPK)", ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=14, alignment=1, spaceAfter=20)))
    elements.append(Spacer(1, 20))
    
    # Invoice info
    invoice_date = invoice.get("created_at", "")
    if isinstance(invoice_date, str) and invoice_date:
        invoice_date = datetime.fromisoformat(invoice_date.replace('Z', '+00:00')).strftime("%d/%m/%Y")
    
    elements.append(Paragraph(f"<b>FACTURE N° {invoice['id'][:8].upper()}</b>", styles['Heading2']))
    elements.append(Paragraph(f"Date : {invoice_date}", normal_style))
    elements.append(Spacer(1, 20))
    
    # Client info
    elements.append(Paragraph("<b>FACTURÉ À :</b>", styles['Heading3']))
    elements.append(Paragraph(f"{user.get('full_name', 'N/A')}", normal_style))
    elements.append(Paragraph(f"Email : {user.get('email', 'N/A')}", normal_style))
    if user.get('city'):
        elements.append(Paragraph(f"Ville : {user.get('city')}", normal_style))
    elements.append(Spacer(1, 30))
    
    # Invoice table
    invoice_type = "Cotisation Membre Annuelle" if invoice.get("type") == "membership" else invoice.get("type", "Autre")
    data = [
        ["Description", "Montant"],
        [invoice_type, f"{invoice.get('amount', 35):.2f} €"],
        ["", ""],
        ["TOTAL", f"{invoice.get('amount', 35):.2f} €"]
    ]
    
    table = Table(data, colWidths=[12*cm, 4*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a5f')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TOPPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f0f0f0')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cccccc')),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 30))
    
    # Payment status
    status_text = "PAYÉE" if invoice.get("status") == "paid" else "EN ATTENTE"
    elements.append(Paragraph(f"<b>Statut :</b> {status_text}", normal_style))
    elements.append(Spacer(1, 40))
    
    # Footer
    elements.append(Paragraph("Merci de votre confiance !", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=10, alignment=1)))
    elements.append(Paragraph("Académie Jacques Levinet - Self-Pro Krav", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=9, alignment=1, textColor=colors.gray)))
    
    doc.build(elements)
    
    # Return PDF as base64
    pdf_data = buffer.getvalue()
    buffer.close()
    
    return {
        "filename": f"facture_{invoice['id'][:8]}.pdf",
        "content": base64.b64encode(pdf_data).decode('utf-8'),
        "content_type": "application/pdf"
    }

@api_router.post("/admin/invoices/generate")
async def generate_invoice_for_member(
    user_id: str,
    amount: float = 35.0,
    invoice_type: str = "membership",
    current_user: dict = Depends(get_current_user)
):
    """Admin: Generate an invoice for a member"""
    require_admin(current_user)
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    invoice = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": invoice_type,
        "amount": amount,
        "currency": "EUR",
        "status": "paid",
        "payment_method": "manual",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user["id"]
    }
    
    await db.invoices.insert_one(invoice)
    
    return {"message": "Facture générée", "invoice_id": invoice["id"]}

# ==================== PENDING MEMBERS ENDPOINTS ====================

@api_router.post("/pending-members")
async def create_pending_member(data: PendingMemberCreate):
    """Create a pending member request (for existing members)"""
    # Normalize email to lowercase to prevent case-sensitive duplicates
    normalized_email = data.email.strip().lower()

    # Check if email already exists in users (case-insensitive)
    existing_user = await db.users.find_one(
        {"email": {"$regex": f"^{re.escape(normalized_email)}$", "$options": "i"}}
    )
    if existing_user:
        raise HTTPException(status_code=400, detail="Un compte existe déjà avec cet email. Veuillez vous connecter.")

    # Check if already has a pending or approved request (any non-rejected status, case-insensitive)
    existing_pending = await db.pending_members.find_one(
        {"email": {"$regex": f"^{re.escape(normalized_email)}$", "$options": "i"}, "status": {"$in": ["En attente", "Approuvé"]}}
    )
    if existing_pending:
        if existing_pending.get("status") == "Approuvé":
            raise HTTPException(status_code=400, detail="Votre demande a déjà été approuvée. Vérifiez vos emails pour vos identifiants de connexion.")
        raise HTTPException(status_code=400, detail="Une demande est déjà en cours pour cet email.")

    # Store with normalized email
    member_data = data.model_dump()
    member_data['email'] = normalized_email
    pending_member = PendingMember(**member_data)
    doc = pending_member.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.pending_members.insert_one(doc)
    
    # Send confirmation email to the pending member
    asyncio.create_task(send_email(
        to_email=data.email,
        subject="Demande reçue - Académie Jacques Levinet",
        html_content=f"""
        <h2>Bonjour {data.full_name},</h2>
        <p>Nous avons bien reçu votre demande d'accès à l'espace membre de l'Académie Jacques Levinet.</p>
        <p>Votre profil est actuellement <strong>en attente de validation</strong> par notre équipe.</p>
        <p>Vous recevrez un email de confirmation dès que votre compte sera activé.</p>
        <br/>
        <p>Cordialement,<br/>L'équipe de l'Académie Jacques Levinet</p>
        """,
        text_content=f"Bonjour {data.full_name}, votre demande d'accès est en attente de validation."
    ))
    
    return {"message": "Votre demande a été enregistrée. Vous recevrez un email une fois votre compte validé.", "id": pending_member.id}

@api_router.get("/admin/pending-members")
async def get_pending_members(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Admin: Get all pending member requests"""
    require_admin(current_user)
    
    query = {}
    if status:
        query["status"] = status
    
    pending = await db.pending_members.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for p in pending:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    
    return {"pending_members": pending, "total": len(pending)}

@api_router.post("/admin/pending-members/{pending_id}/approve")
async def approve_pending_member(pending_id: str, current_user: dict = Depends(get_current_user)):
    """Admin: Approve a pending member and create their account"""
    require_admin(current_user)
    
    pending = await db.pending_members.find_one({"id": pending_id}, {"_id": 0})
    if not pending:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    
    if pending.get('status') != 'En attente':
        raise HTTPException(status_code=400, detail="Cette demande a déjà été traitée")

    # Check if a user account already exists for this email (prevents duplicate account creation)
    normalized_email = pending['email'].strip().lower()
    existing_user = await db.users.find_one(
        {"email": {"$regex": f"^{re.escape(normalized_email)}$", "$options": "i"}}
    )
    if existing_user:
        # Mark this pending request as approved since user already exists
        await db.pending_members.update_one(
            {"id": pending_id},
            {"$set": {
                "status": "Approuvé",
                "reviewed_by": current_user['id'],
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
                "admin_notes": "Compte existant détecté - approuvé automatiquement"
            }}
        )
        return {"message": "Un compte existe déjà pour cet email. La demande a été marquée comme approuvée.", "user_id": existing_user.get('id')}

    # Generate temporary password
    import secrets
    import string
    temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))

    # Create user account
    user = User(
        email=normalized_email,
        password_hash=hash_password(temp_password),
        full_name=pending['full_name'],
        role="membre",  # Rôle unifié français
        has_paid_license=True,  # Existing members already paid
        is_premium=False
    )

    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['belt_grade'] = pending.get('belt_grade', 'Ceinture Blanche')
    user_doc['city'] = pending.get('city', '')
    user_doc['club_name'] = pending.get('club_name', '')
    user_doc['instructor_name'] = pending.get('instructor_name', '')
    user_doc['phone'] = pending.get('phone', '')
    user_doc['motivations'] = pending.get('motivations', [])
    user_doc['person_type'] = pending.get('person_type', '')
    user_doc['training_mode'] = pending.get('training_mode', '')

    await db.users.insert_one(user_doc)
    logger.info(f"[APPROVE_MEMBER] Compte cree depuis demande en attente: {normalized_email} (id: {user.id})")
    
    # Update pending member status
    await db.pending_members.update_one(
        {"id": pending_id},
        {"$set": {
            "status": "Approuvé",
            "reviewed_by": current_user['id'],
            "reviewed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Send email with temporary password
    login_url = os.environ.get('FRONTEND_URL', 'https://academielevinet.com')
    asyncio.create_task(send_email(
        to_email=pending['email'],
        subject="🎉 Votre compte est activé - Académie Jacques Levinet",
        html_content=f"""
        <h2>Bienvenue {pending['full_name']} !</h2>
        <p>Votre demande d'accès à l'espace membre de l'Académie Jacques Levinet a été <strong>approuvée</strong> !</p>
        <p>Voici vos identifiants de connexion :</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email :</strong> {pending['email']}</p>
            <p><strong>Mot de passe temporaire :</strong> {temp_password}</p>
        </div>
        <p>⚠️ <strong>Important :</strong> Nous vous recommandons de changer votre mot de passe dès votre première connexion.</p>
        <p><a href="{login_url}/login" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">Se connecter</a></p>
        <br/>
        <p>Bienvenue dans la communauté SPK !</p>
        <p>L'équipe de l'Académie Jacques Levinet</p>
        """,
        text_content=f"Bienvenue {pending['full_name']} ! Votre compte est activé. Connectez-vous avec: Email: {pending['email']}, Mot de passe: {temp_password}"
    ))
    
    return {"message": "Membre approuvé et compte créé avec succès. Un email a été envoyé.", "user_id": user.id}

@api_router.post("/admin/pending-members/{pending_id}/reject")
async def reject_pending_member(
    pending_id: str,
    reason: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Admin: Reject a pending member request"""
    require_admin(current_user)
    
    pending = await db.pending_members.find_one({"id": pending_id}, {"_id": 0})
    if not pending:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    
    await db.pending_members.update_one(
        {"id": pending_id},
        {"$set": {
            "status": "Rejeté",
            "admin_notes": reason,
            "reviewed_by": current_user['id'],
            "reviewed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Send rejection email
    asyncio.create_task(send_email(
        to_email=pending['email'],
        subject="Votre demande - Académie Jacques Levinet",
        html_content=f"""
        <h2>Bonjour {pending['full_name']},</h2>
        <p>Après vérification, nous n'avons pas pu valider votre demande d'accès à l'espace membre.</p>
        {f'<p>Raison : {reason}</p>' if reason else ''}
        <p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre instructeur ou l'administration.</p>
        <br/>
        <p>Cordialement,<br/>L'équipe de l'Académie Jacques Levinet</p>
        """,
        text_content=f"Bonjour {pending['full_name']}, votre demande n'a pas pu être validée."
    ))
    
    return {"message": "Demande rejetée"}

# ==================== SMTP SETTINGS ENDPOINTS ====================

@api_router.get("/admin/settings/smtp")
async def get_smtp_settings(current_user: dict = Depends(get_current_user)):
    """Admin: Get SMTP settings (password masked)"""
    require_admin(current_user)
    
    settings = await db.settings.find_one({"id": "smtp_settings"}, {"_id": 0})
    if not settings:
        # Return default settings
        return {
            "smtp_host": "smtp.gmail.com",
            "smtp_port": 587,
            "smtp_user": "",
            "smtp_password_set": False,
            "from_email": "",
            "from_name": "Académie Jacques Levinet"
        }
    
    # Mask password
    settings['smtp_password_set'] = bool(settings.get('smtp_password'))
    settings.pop('smtp_password', None)
    return settings

@api_router.put("/admin/settings/smtp")
async def update_smtp_settings(data: SmtpSettingsUpdate, current_user: dict = Depends(get_current_user)):
    """Admin: Update SMTP settings"""
    require_admin(current_user)
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    update_data['id'] = "smtp_settings"
    
    await db.settings.update_one(
        {"id": "smtp_settings"},
        {"$set": update_data},
        upsert=True
    )
    
    # Also update environment variables for the email service
    if data.smtp_user:
        os.environ['SMTP_USER'] = data.smtp_user
    if data.smtp_password:
        os.environ['SMTP_PASSWORD'] = data.smtp_password
    if data.from_email:
        os.environ['SMTP_FROM_EMAIL'] = data.from_email
    
    return {"message": "Paramètres SMTP mis à jour avec succès"}

@api_router.post("/admin/settings/smtp/test")
async def test_smtp_settings(data: SmtpTestRequest, current_user: dict = Depends(get_current_user)):
    """Admin: Send test email to verify SMTP settings"""
    require_admin(current_user)
    
    # Get SMTP settings from database
    settings = await db.settings.find_one({"id": "smtp_settings"})
    if not settings:
        raise HTTPException(status_code=400, detail="Aucune configuration SMTP trouvée. Veuillez d'abord enregistrer vos paramètres.")
    
    smtp_host = settings.get('smtp_host', 'smtp.gmail.com')
    smtp_port = settings.get('smtp_port', 587)
    smtp_user = settings.get('smtp_user')
    smtp_password = settings.get('smtp_password')
    from_email = settings.get('from_email')
    from_name = settings.get('from_name', 'Académie Jacques Levinet')
    
    if not smtp_user or not smtp_password:
        raise HTTPException(status_code=400, detail="Email SMTP et mot de passe requis. Veuillez compléter la configuration.")
    
    if not from_email:
        from_email = smtp_user
    
    test_email = data.test_email
    
    try:
        import aiosmtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        message = MIMEMultipart('alternative')
        message['Subject'] = "✅ Test SMTP - Académie Jacques Levinet"
        message['From'] = f"{from_name} <{from_email}>"
        message['To'] = test_email
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111827; color: #F3F4F6; padding: 40px; border-radius: 10px;">
            <h2 style="color: #3B82F6;">✅ Test SMTP Réussi !</h2>
            <p>Si vous recevez cet email, la configuration SMTP de l'Académie Jacques Levinet fonctionne correctement.</p>
            <hr style="border-color: #374151; margin: 20px 0;">
            <p style="color: #9CA3AF; font-size: 14px;"><strong>Configuration utilisée :</strong></p>
            <ul style="color: #9CA3AF; font-size: 14px;">
                <li>Serveur : {smtp_host}</li>
                <li>Port : {smtp_port}</li>
                <li>Email : {smtp_user}</li>
                <li>Expéditeur : {from_name}</li>
            </ul>
            <p style="margin-top: 30px; color: #6B7280; font-size: 12px;">— L'équipe Académie Jacques Levinet</p>
        </div>
        """
        
        text_content = f"Test SMTP réussi ! Configuration: {smtp_host}:{smtp_port}, Email: {smtp_user}"
        
        part1 = MIMEText(text_content, 'plain', 'utf-8')
        part2 = MIMEText(html_content, 'html', 'utf-8')
        message.attach(part1)
        message.attach(part2)
        
        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            start_tls=True,
        )
        
        return {"message": f"Email de test envoyé avec succès à {test_email}"}
    except aiosmtplib.SMTPAuthenticationError as e:
        raise HTTPException(status_code=400, detail=f"Échec d'authentification SMTP. Vérifiez votre email et mot de passe d'application. Erreur: {str(e)}")
    except aiosmtplib.SMTPConnectError as e:
        raise HTTPException(status_code=400, detail=f"Impossible de se connecter au serveur SMTP. Vérifiez l'adresse et le port. Erreur: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'envoi: {str(e)}")

# ==================== INSTRUCTORS LIST ENDPOINT (LEGACY) ====================
# Deprecated: use paginated /api/instructors instead

# ==================== CLUB MANAGEMENT ENDPOINTS ====================

@api_router.get("/clubs")
async def get_clubs(
    city: Optional[str] = None,
    country: Optional[str] = None,
    status: Optional[str] = None,
    technical_director_id: Optional[str] = None
):
    """Get all clubs with optional filters"""
    try:
        query = {}
        if city:
            query["city"] = {"$regex": city, "$options": "i"}
        if country:
            query["country"] = {"$regex": country, "$options": "i"}
        if status:
            query["status"] = status
        if technical_director_id:
            query["technical_director_id"] = technical_director_id

        clubs = await db.clubs.find(query, {"_id": 0}).sort("name", 1).to_list(1000)

        # Collect all user IDs referenced by clubs to resolve in a single batch
        all_user_ids = set()
        for club in clubs:
            if club.get("technical_director_id"):
                all_user_ids.add(club["technical_director_id"])
            for uid in (club.get("technical_director_ids") or []):
                all_user_ids.add(uid)
            for uid in (club.get("national_director_ids") or []):
                all_user_ids.add(uid)
            for uid in (club.get("instructor_ids") or []):
                all_user_ids.add(uid)

        # Batch-fetch all referenced users at once
        user_map = {}
        if all_user_ids:
            users = await db.users.find(
                {"id": {"$in": list(all_user_ids)}},
                {"_id": 0, "id": 1, "full_name": 1, "email": 1, "photo_url": 1, "city": 1, "country": 1, "dan_grade": 1, "club_id": 1}
            ).to_list(len(all_user_ids))
            user_map = {u["id"]: u for u in users}

        # Enrich clubs with resolved profiles and member counts
        for club in clubs:
            member_count = await db.users.count_documents({"club_id": club["id"]})
            club["member_count"] = member_count

            # Resolve technical director (old single field)
            if club.get("technical_director_id"):
                dt = user_map.get(club["technical_director_id"])
                club["technical_director_name"] = dt.get("full_name") if dt else "Non assigné"

            # Resolve technical directors (multiple)
            club["technical_directors_resolved"] = [
                user_map[uid] for uid in (club.get("technical_director_ids") or []) if uid in user_map
            ]
            # Resolve national directors
            club["national_directors_resolved"] = [
                user_map[uid] for uid in (club.get("national_director_ids") or []) if uid in user_map
            ]
            # Resolve instructors
            club["instructors_resolved"] = [
                user_map[uid] for uid in (club.get("instructor_ids") or []) if uid in user_map
            ]

        return {"clubs": clubs, "total": len(clubs)}
    except Exception as e:
        logger.error(f"Error in get_clubs: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erreur lors du chargement des clubs: {str(e)}")

@api_router.get("/clubs/{club_id}")
async def get_club(club_id: str):
    """Get a single club with full details"""
    club = await db.clubs.find_one({"id": club_id}, {"_id": 0})
    if not club:
        raise HTTPException(status_code=404, detail="Club non trouvé")

    # Get technical director (old single field for backward compatibility)
    if club.get("technical_director_id"):
        dt = await db.users.find_one({"id": club["technical_director_id"]}, {"_id": 0, "id": 1, "full_name": 1, "email": 1, "photo_url": 1})
        club["technical_director"] = dt

    # Get technical directors (new multiple field)
    if club.get("technical_director_ids"):
        technical_directors = await db.users.find(
            {"id": {"$in": club["technical_director_ids"]}},
            {"_id": 0, "id": 1, "full_name": 1, "email": 1, "photo_url": 1, "belt_grade": 1, "role": 1}
        ).to_list(100)
        club["technical_directors"] = technical_directors
    else:
        club["technical_directors"] = []

    # Get instructors - include ALL users with instructor role in this club
    instructor_ids = club.get("instructor_ids") or []
    # Also find instructors who have this club_id assigned
    instructors_by_club = await db.users.find(
        {"club_id": club_id, "role": "instructeur"},
        {"_id": 0, "id": 1, "full_name": 1, "email": 1, "photo_url": 1, "belt_grade": 1, "role": 1}
    ).to_list(100)

    # Combine instructors from instructor_ids and those with club_id
    all_instructor_ids = set(instructor_ids)
    all_instructor_ids.update([i["id"] for i in instructors_by_club])

    if all_instructor_ids:
        instructors = await db.users.find(
            {"id": {"$in": list(all_instructor_ids)}},
            {"_id": 0, "id": 1, "full_name": 1, "email": 1, "photo_url": 1, "belt_grade": 1, "role": 1}
        ).to_list(100)
        club["instructors"] = instructors
    else:
        club["instructors"] = []

    # Get members - include regular members (eleve role)
    members = await db.users.find(
        {"club_id": club_id, "role": {"$in": ["eleve", "membre"]}},
        {"_id": 0, "id": 1, "full_name": 1, "email": 1, "photo_url": 1, "belt_grade": 1, "role": 1}
    ).to_list(1000)
    club["members"] = members
    club["member_count"] = len(members)
    
    # Get statistics
    club["stats"] = {
        "total_members": len(members),
        "admins": len([m for m in members if m.get("role") == "admin"]),
        "active_visits": await db.visit_requests.count_documents({"target_club_id": club_id, "status": "Approuvé"})
    }
    
    return club

@api_router.post("/admin/clubs")
async def create_club(club_data: ClubCreate, current_user: dict = Depends(get_current_user)):
    """Create a new club (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")

    club_id = str(uuid.uuid4())
    club = {
        "id": club_id,
        "name": club_data.name,
        "address": club_data.address,
        "city": club_data.city,
        "postal_code": club_data.postal_code,
        "country": club_data.country,
        "country_code": club_data.country_code,
        "phone": club_data.phone,
        "email": club_data.email,
        "logo_url": club_data.logo_url,
        "national_director_ids": club_data.national_director_ids,
        "technical_director_ids": club_data.technical_director_ids,
        "instructor_ids": club_data.instructor_ids,
        "disciplines": club_data.disciplines,
        "schedule": club_data.schedule,
        "status": ClubStatus.ACTIVE.value,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": None
    }

    await db.clubs.insert_one(club)

    # Update technical directors' club assignments
    for td_id in club_data.technical_director_ids:
        td = await db.users.find_one({"id": td_id})
        if td and td.get("role") != "admin":
            await db.users.update_one({"id": td_id}, {"$set": {"club_id": club_id}})

    return {"message": "Club créé avec succès", "club": {k: v for k, v in club.items() if k != "_id"}}

@api_router.put("/admin/clubs/{club_id}")
async def update_club(club_id: str, club_data: ClubUpdate, current_user: dict = Depends(get_current_user)):
    """Update a club (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    club = await db.clubs.find_one({"id": club_id})
    if not club:
        raise HTTPException(status_code=404, detail="Club non trouvé")
    
    update_data = {k: v for k, v in club_data.model_dump().items() if v is not None}

    # If changing technical directors, update their club assignments
    if "technical_director_ids" in update_data:
        for td_id in update_data["technical_director_ids"]:
            td = await db.users.find_one({"id": td_id})
            if td and td.get("role") != "admin":
                await db.users.update_one({"id": td_id}, {"$set": {"club_id": club_id}})

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.clubs.update_one({"id": club_id}, {"$set": update_data})
    
    updated_club = await db.clubs.find_one({"id": club_id}, {"_id": 0})
    return {"message": "Club mis à jour", "club": updated_club}

@api_router.delete("/admin/clubs/{club_id}")
async def delete_club(club_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a club (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    club = await db.clubs.find_one({"id": club_id})
    if not club:
        raise HTTPException(status_code=404, detail="Club non trouvé")
    
    # Check if club has members
    member_count = await db.users.count_documents({"club_id": club_id})
    if member_count > 0:
        raise HTTPException(status_code=400, detail=f"Impossible de supprimer: {member_count} membre(s) sont rattachés à ce club")
    
    await db.clubs.delete_one({"id": club_id})
    await db.visit_requests.delete_many({"$or": [{"home_club_id": club_id}, {"target_club_id": club_id}]})
    
    return {"message": "Club supprimé avec succès"}

@api_router.post("/admin/clubs/{club_id}/members/{user_id}")
async def assign_member_to_club(club_id: str, user_id: str, current_user: dict = Depends(get_current_user)):
    """Assign a member to a club (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    club = await db.clubs.find_one({"id": club_id})
    if not club:
        raise HTTPException(status_code=404, detail="Club non trouvé")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    await db.users.update_one({"id": user_id}, {"$set": {"club_id": club_id}})
    
    return {"message": f"Membre assigné au club {club['name']}"}

@api_router.delete("/admin/clubs/{club_id}/members/{user_id}")
async def remove_member_from_club(club_id: str, user_id: str, current_user: dict = Depends(get_current_user)):
    """Remove a member from a club (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    await db.users.update_one({"id": user_id}, {"$unset": {"club_id": ""}})
    
    return {"message": "Membre retiré du club"}

@api_router.get("/clubs/{club_id}/stats")
async def get_club_stats(club_id: str, current_user: dict = Depends(get_current_user)):
    """Get statistics for a club"""
    club = await db.clubs.find_one({"id": club_id}, {"_id": 0})
    if not club:
        raise HTTPException(status_code=404, detail="Club non trouvé")
    
    members = await db.users.find({"club_id": club_id}, {"_id": 0, "password_hash": 0, "photo": 0}).to_list(1000)
    
    # Calculate statistics
    stats = {
        "total_members": len(members),
        "by_grade": {},
        "by_role": {},
        "with_license": 0,
        "premium_members": 0,
        "pending_visits": await db.visit_requests.count_documents({"target_club_id": club_id, "status": "En attente"}),
        "approved_visits": await db.visit_requests.count_documents({"target_club_id": club_id, "status": "Approuvé"})
    }
    
    for member in members:
        grade = member.get("belt_grade", "Non défini")
        stats["by_grade"][grade] = stats["by_grade"].get(grade, 0) + 1
        
        role = member.get("role", "membre")
        stats["by_role"][role] = stats["by_role"].get(role, 0) + 1
        
        if member.get("has_paid_license"):
            stats["with_license"] += 1
        if member.get("is_premium"):
            stats["premium_members"] += 1
    
    return stats

# ==================== VISIT REQUEST ENDPOINTS ====================

@api_router.get("/visit-requests")
async def get_visit_requests(
    status: Optional[str] = None,
    club_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get visit requests (for admins/DTs or member's own requests)"""
    query = {}
    
    if current_user.get("role") == "admin":
        # Admins see all
        if club_id:
            query["$or"] = [{"home_club_id": club_id}, {"target_club_id": club_id}]
    elif current_user.get("role") == "directeur_technique":
        # DTs see requests for their club
        user_club = current_user.get("club_id")
        if user_club:
            query["target_club_id"] = user_club
    else:
        # Members see only their own requests
        query["member_id"] = current_user["id"]
    
    if status:
        query["status"] = status
    
    requests = await db.visit_requests.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    return {"visit_requests": requests, "total": len(requests)}

@api_router.post("/visit-requests")
async def create_visit_request(request_data: VisitRequestCreate, current_user: dict = Depends(get_current_user)):
    """Create a visit request to another club"""
    home_club_id = current_user.get("club_id")
    if not home_club_id:
        raise HTTPException(status_code=400, detail="Vous devez être membre d'un club pour faire une demande de visite")
    
    if home_club_id == request_data.target_club_id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas demander à visiter votre propre club")
    
    # Verify target club exists
    target_club = await db.clubs.find_one({"id": request_data.target_club_id}, {"_id": 0})
    if not target_club:
        raise HTTPException(status_code=404, detail="Club cible non trouvé")
    
    home_club = await db.clubs.find_one({"id": home_club_id}, {"_id": 0})
    
    # Check for existing pending request
    existing = await db.visit_requests.find_one({
        "member_id": current_user["id"],
        "target_club_id": request_data.target_club_id,
        "status": "En attente"
    })
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà une demande en attente pour ce club")
    
    request_id = str(uuid.uuid4())
    visit_request = {
        "id": request_id,
        "member_id": current_user["id"],
        "member_name": current_user.get("full_name"),
        "member_email": current_user.get("email"),
        "home_club_id": home_club_id,
        "home_club_name": home_club.get("name") if home_club else None,
        "target_club_id": request_data.target_club_id,
        "target_club_name": target_club.get("name"),
        "status": VisitRequestStatus.PENDING.value,
        "reason": request_data.reason,
        "visit_date": request_data.visit_date,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "processed_at": None,
        "approved_by": None,
        "approved_by_name": None
    }
    
    await db.visit_requests.insert_one(visit_request)
    
    return {"message": "Demande de visite créée", "request": {k: v for k, v in visit_request.items() if k != "_id"}}

@api_router.put("/visit-requests/{request_id}/approve")
async def approve_visit_request(request_id: str, current_user: dict = Depends(get_current_user)):
    """Approve a visit request (admin or target club's DT)"""
    visit_request = await db.visit_requests.find_one({"id": request_id})
    if not visit_request:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    
    # Check permissions
    is_admin = current_user.get("role") == "admin"
    is_club_dt = (
        current_user.get("role") == "directeur_technique" and
        current_user.get("club_id") == visit_request.get("target_club_id")
    )

    if not is_admin and not is_club_dt:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à approuver cette demande")
    
    await db.visit_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": VisitRequestStatus.APPROVED.value,
            "approved_by": current_user["id"],
            "approved_by_name": current_user.get("full_name"),
            "processed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Demande de visite approuvée"}

@api_router.put("/visit-requests/{request_id}/reject")
async def reject_visit_request(request_id: str, current_user: dict = Depends(get_current_user)):
    """Reject a visit request (admin or target club's DT)"""
    visit_request = await db.visit_requests.find_one({"id": request_id})
    if not visit_request:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    
    is_admin = current_user.get("role") == "admin"
    is_club_dt = (
        current_user.get("role") == "directeur_technique" and
        current_user.get("club_id") == visit_request.get("target_club_id")
    )

    if not is_admin and not is_club_dt:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à refuser cette demande")
    
    await db.visit_requests.update_one(
        {"id": request_id},
        {"$set": {
            "status": VisitRequestStatus.REJECTED.value,
            "approved_by": current_user["id"],
            "approved_by_name": current_user.get("full_name"),
            "processed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Demande de visite refusée"}

@api_router.delete("/visit-requests/{request_id}")
async def cancel_visit_request(request_id: str, current_user: dict = Depends(get_current_user)):
    """Cancel a visit request (member only, if pending)"""
    visit_request = await db.visit_requests.find_one({"id": request_id})
    if not visit_request:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    
    if visit_request.get("member_id") != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Vous ne pouvez annuler que vos propres demandes")
    
    if visit_request.get("status") != "En attente":
        raise HTTPException(status_code=400, detail="Seules les demandes en attente peuvent être annulées")
    
    await db.visit_requests.delete_one({"id": request_id})
    
    return {"message": "Demande de visite annulée"}

@api_router.get("/technical-directors-list")
async def get_technical_directors_list():
    """Get all technical directors for club assignment"""
    directors = await db.users.find(
        {"$or": [
            {"role": "directeur_technique"},
            {"role": "technical_director"},
            {"roles": "directeur_technique"},
            {"belt_grade": "Directeur Technique"}
        ]},
        {"_id": 0, "id": 1, "full_name": 1, "email": 1, "city": 1, "country": 1, "photo_url": 1, "club_id": 1, "dan_grade": 1}
    ).to_list(1000)
    return {"directors": directors}

@api_router.get("/national-directors-list")
async def get_national_directors_list():
    """Get all national directors for club assignment"""
    directors = await db.users.find(
        {"$or": [
            {"role": "directeur_national"},
            {"role": "national_director"},
            {"roles": "directeur_national"},
            {"belt_grade": "Directeur National"}
        ]},
        {"_id": 0, "id": 1, "full_name": 1, "email": 1, "city": 1, "country": 1, "photo_url": 1, "dan_grade": 1}
    ).to_list(1000)
    return {"directors": directors}

@api_router.get("/instructors-list")
async def get_instructors_list():
    """Get all instructors for club assignment"""
    instructors = await db.users.find(
        {"$or": [
            {"role": "instructeur"},
            {"role": "instructor"},
            {"roles": "instructeur"},
            {"belt_grade": "Instructeur"}
        ]},
        {"_id": 0, "id": 1, "full_name": 1, "email": 1, "city": 1, "country": 1, "photo_url": 1, "club_id": 1, "dan_grade": 1}
    ).to_list(1000)
    return {"instructors": instructors}

@api_router.get("/debug/user-roles")
async def debug_user_roles():
    """DEBUG: Get all user roles - À SUPPRIMER EN PRODUCTION"""
    users = await db.users.find({}, {"_id": 0, "id": 1, "full_name": 1, "email": 1, "role": 1, "roles": 1}).to_list(100)
    roles_count = {}
    for u in users:
        role = u.get('role', 'UNDEFINED')
        roles_count[role] = roles_count.get(role, 0) + 1
    return {
        "total_users": len(users),
        "roles_count": roles_count,
        "users": users
    }

# ==================== CHAT ENDPOINTS (Real AI Integration) ====================

@api_router.post("/chat/visitor")
async def chat_visitor_endpoint(message: dict):
    """AI Chat for visitors - Sales-oriented assistant"""
    try:
        session_id = message.get("session_id", str(uuid.uuid4()))
        user_message_text = message.get("message", "")
        
        if not user_message_text:
            return {
                "response": "👋 Bonjour et bienvenue à l'Académie Jacques Levinet ! Je suis Léo, votre guide. Qu'est-ce qui vous amène vers la self-défense aujourd'hui ?",
                "session_id": session_id
            }
        
        # Get or create session
        if session_id not in chat_sessions:
            chat_sessions[session_id] = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=session_id,
                system_message=VISITOR_ASSISTANT_PROMPT
            ).with_model("openai", "gpt-4o-mini")
        
        chat = chat_sessions[session_id]
        user_message = UserMessage(text=user_message_text)
        response = await chat.send_message(user_message)
        
        return {
            "response": response,
            "session_id": session_id
        }
    except Exception as e:
        logger.error(f"Chat visitor error: {str(e)}")
        # Fallback response if AI fails
        return {
            "response": "👋 Bienvenue à l'Académie Jacques Levinet ! Je suis là pour vous aider à découvrir notre méthode de Krav Maga Self-Défense. Que souhaitez-vous savoir ? 💪",
            "session_id": message.get("session_id", str(uuid.uuid4()))
        }

@api_router.post("/chat/member")
async def chat_member_endpoint(message: dict, current_user: dict = Depends(get_current_user)):
    """AI Chat for members - Platform guide assistant"""
    try:
        session_id = message.get("session_id", str(uuid.uuid4()))
        user_message_text = message.get("message", "")
        user_name = current_user.get("full_name", "").split()[0] if current_user.get("full_name") else "Champion"
        
        if not user_message_text:
            return {
                "response": f"👋 Salut {user_name} ! Je suis Léo, ton assistant personnel. Comment puis-je t'aider aujourd'hui ? Tu veux explorer ton espace membre, trouver un événement, ou autre chose ? 🥋",
                "session_id": session_id
            }
        
        # Personalize the prompt with member info
        member_context = f"""

INFORMATIONS SUR CE MEMBRE :
- Prénom : {user_name}
- Grade : {current_user.get('belt_grade', 'Non défini')}
- Club : {current_user.get('club', 'Non assigné')}
- Ville : {current_user.get('city', 'Non renseignée')}
"""
        
        # Get or create session
        member_session_key = f"member_{current_user.get('id', session_id)}"
        if member_session_key not in chat_sessions:
            chat_sessions[member_session_key] = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=member_session_key,
                system_message=MEMBER_ASSISTANT_PROMPT + member_context
            ).with_model("openai", "gpt-4o-mini")
        
        chat = chat_sessions[member_session_key]
        user_message = UserMessage(text=user_message_text)
        response = await chat.send_message(user_message)
        
        return {
            "response": response,
            "session_id": session_id
        }
    except Exception as e:
        logger.error(f"Chat member error: {str(e)}")
        # Fallback response if AI fails
        user_name = current_user.get("full_name", "").split()[0] if current_user.get("full_name") else "Champion"
        return {
            "response": f"👋 Salut {user_name} ! Je suis là pour t'aider. Tu peux consulter ton profil dans /member/profile, voir les événements dans /events, ou envoyer un message à ton instructeur via /messages. Que souhaites-tu faire ? 🥋",
            "session_id": message.get("session_id", str(uuid.uuid4()))
        }

# ==================== ONBOARDING DYNAMIC ENDPOINTS ====================

@api_router.get("/onboarding/countries")
async def get_onboarding_countries():
    """Get list of countries for onboarding form"""
    countries = [
        {"code": "FR", "name": "France"},
        {"code": "BE", "name": "Belgique"},
        {"code": "CH", "name": "Suisse"},
        {"code": "CA", "name": "Canada"},
        {"code": "LU", "name": "Luxembourg"},
        {"code": "MA", "name": "Maroc"},
        {"code": "TN", "name": "Tunisie"},
        {"code": "SN", "name": "Sénégal"},
        {"code": "CI", "name": "Côte d'Ivoire"},
        {"code": "CM", "name": "Cameroun"},
        {"code": "DE", "name": "Allemagne"},
        {"code": "ES", "name": "Espagne"},
        {"code": "IT", "name": "Italie"},
        {"code": "PT", "name": "Portugal"},
        {"code": "GB", "name": "Royaume-Uni"},
        {"code": "US", "name": "États-Unis"},
        {"code": "BR", "name": "Brésil"},
        {"code": "MX", "name": "Mexique"},
        {"code": "AR", "name": "Argentine"},
        {"code": "JP", "name": "Japon"},
        {"code": "AU", "name": "Australie"},
        {"code": "NZ", "name": "Nouvelle-Zélande"},
        {"code": "ZA", "name": "Afrique du Sud"},
        {"code": "MU", "name": "Île Maurice"},
        {"code": "AD", "name": "Andorre"},
        {"code": "OM", "name": "Oman"},
        {"code": "KM", "name": "Comores"},
        {"code": "PK", "name": "Pakistan"},
        {"code": "MU-R", "name": "Île Rodrigues"},
        {"code": "MG", "name": "Madagascar"},
        {"code": "PF", "name": "Polynésie française"},
        {"code": "OTHER", "name": "Autre pays"}
    ]
    return {"countries": countries}

@api_router.get("/onboarding/instructors")
async def get_onboarding_instructors(country: Optional[str] = None, city: Optional[str] = None):
    """Get list of instructors/technical directors for onboarding form"""
    # Rôles unifiés: instructeur, directeur_technique, directeur_national
    query = {"role": {"$in": ["instructeur", "directeur_technique", "directeur_national"]}}
    
    if country:
        query["country"] = {"$regex": country, "$options": "i"}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    
    instructors = await db.users.find(
        query,
        {"_id": 0, "id": 1, "full_name": 1, "city": 1, "country": 1, "belt_grade": 1, "club_id": 1}
    ).to_list(500)
    
    # Also get clubs to enrich data
    for instructor in instructors:
        if instructor.get("club_id"):
            club = await db.clubs.find_one({"id": instructor["club_id"]}, {"_id": 0, "name": 1})
            instructor["club_name"] = club.get("name") if club else None
    
    return {"instructors": instructors}

@api_router.get("/onboarding/clubs")
async def get_onboarding_clubs(country: Optional[str] = None, city: Optional[str] = None):
    """Get list of clubs for onboarding form"""
    query = {"status": "Actif"}
    
    if country:
        query["country"] = {"$regex": country, "$options": "i"}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    
    clubs = await db.clubs.find(
        query,
        {"_id": 0, "id": 1, "name": 1, "city": 1, "country": 1, "technical_director_name": 1, "address": 1}
    ).sort("name", 1).to_list(500)
    
    return {"clubs": clubs}

# ========== TOKEN AJL - ENDPOINTS ==========

async def get_or_create_token_balance(user_id: str) -> dict:
    """Récupère ou crée le solde token d'un utilisateur"""
    balance = await db.token_balances.find_one({"user_id": user_id})
    if not balance:
        balance = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "balance": 0,
            "total_earned": 0,
            "total_spent": 0,
            "last_daily_claim": None,
            "streak_days": 0,
            "longest_streak": 0,
            "level": 1,
            "xp": 0,
            "wallet_address": None,
            "tokens_locked": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.token_balances.insert_one(balance)
    return balance

async def check_daily_limit(user_id: str, action_type: str) -> bool:
    """Vérifie si l'utilisateur a atteint la limite quotidienne pour une action"""
    if action_type not in [at.value for at in TokenActionType]:
        return True
    
    # Vérifier si ce type d'action a une limite
    action_enum = TokenActionType(action_type)
    if action_enum not in TOKEN_DAILY_LIMITS:
        return True
    
    max_daily = TOKEN_DAILY_LIMITS[action_enum]
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Compter les tokens gagnés aujourd'hui pour cette action
    pipeline = [
        {"$match": {
            "user_id": user_id,
            "action_type": action_type,
            "amount": {"$gt": 0},
            "created_at": {"$gte": today_start.isoformat()}
        }},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    result = await db.token_transactions.aggregate(pipeline).to_list(1)
    current_total = result[0]["total"] if result else 0
    
    return current_total < max_daily

async def award_tokens(user_id: str, action_type: str, amount: Optional[int] = None, 
                       description: Optional[str] = None, reference_id: Optional[str] = None,
                       context_type: Optional[str] = None, context_name: Optional[str] = None) -> Optional[dict]:
    """Attribue des tokens à un utilisateur pour une action
    
    Args:
        context_type: Type de contexte d'obtention ("stage", "club", "online")
        context_name: Nom du stage ou club où le grade a été obtenu
    """
    # Vérifier limite quotidienne
    if not await check_daily_limit(user_id, action_type):
        return None
    
    # Déterminer le montant
    if amount is None:
        action_enum = TokenActionType(action_type) if action_type in [at.value for at in TokenActionType] else None
        if action_enum and action_enum in TOKEN_REWARDS:
            amount = TOKEN_REWARDS[action_enum]
        else:
            amount = 0
    
    if amount == 0:
        return None
    
    # Récupérer ou créer le solde
    balance_doc = await get_or_create_token_balance(user_id)
    new_balance = balance_doc.get("balance", 0) + amount
    new_total_earned = balance_doc.get("total_earned", 0) + (amount if amount > 0 else 0)
    new_total_spent = balance_doc.get("total_spent", 0) + (abs(amount) if amount < 0 else 0)
    
    # Calculer le niveau (1 niveau tous les 500 tokens gagnés)
    new_level = max(1, (new_total_earned // 500) + 1)
    
    # Mettre à jour le solde
    await db.token_balances.update_one(
        {"user_id": user_id},
        {"$set": {
            "balance": new_balance,
            "total_earned": new_total_earned,
            "total_spent": new_total_spent,
            "level": new_level,
            "xp": new_total_earned % 500,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Créer la transaction avec contexte optionnel
    transaction = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "amount": amount,
        "action_type": action_type,
        "description": description or f"Récompense: {action_type}",
        "reference_id": reference_id,
        "context_type": context_type,
        "context_name": context_name,
        "balance_after": new_balance,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.token_transactions.insert_one(transaction)
    
    return transaction

@api_router.get("/tokens/balance")
async def get_token_balance(current_user: dict = Depends(get_current_user)):
    """Récupère le solde de tokens AJL de l'utilisateur"""
    balance = await get_or_create_token_balance(current_user.get("id"))
    balance.pop("_id", None)
    
    # Ajouter infos utilisateur
    balance["user_name"] = current_user.get("full_name")
    balance["next_level_xp"] = 500  # XP nécessaire pour le niveau suivant
    
    return balance

@api_router.get("/tokens/rewards-config")
async def get_rewards_config(current_user: dict = Depends(get_current_user)):
    """Récupère la configuration des récompenses Token AJL"""
    rewards = []
    
    # Convertir TOKEN_REWARDS en liste avec descriptions
    action_descriptions = {
        TokenActionType.SIGNUP_BONUS: {"name": "Bonus d'inscription", "description": "Offert à la création de compte", "icon": "🎁", "category": "unique"},
        TokenActionType.DAILY_LOGIN: {"name": "Connexion quotidienne", "description": "Se connecter chaque jour", "icon": "📅", "category": "récurrent"},
        TokenActionType.STREAK_BONUS: {"name": "Bonus de série", "description": "7 jours consécutifs de connexion", "icon": "🔥", "category": "récurrent"},
        TokenActionType.PROFILE_COMPLETE: {"name": "Profil complété", "description": "Remplir toutes les informations du profil", "icon": "👤", "category": "unique"},
        TokenActionType.POST_CREATED: {"name": "Publication sur le mur", "description": "Créer un post sur le mur communautaire", "icon": "📝", "category": "quotidien", "limit": TOKEN_DAILY_LIMITS.get(TokenActionType.POST_CREATED)},
        TokenActionType.COMMENT_ADDED: {"name": "Commentaire", "description": "Commenter un post", "icon": "💬", "category": "quotidien", "limit": TOKEN_DAILY_LIMITS.get(TokenActionType.COMMENT_ADDED)},
        TokenActionType.REACTION_RECEIVED: {"name": "Réaction reçue", "description": "Recevoir une réaction sur votre post", "icon": "❤️", "category": "quotidien", "limit": TOKEN_DAILY_LIMITS.get(TokenActionType.REACTION_RECEIVED)},
        TokenActionType.EVENT_PARTICIPATION: {"name": "Participation à un événement", "description": "Participer à un événement de l'académie", "icon": "🎯", "category": "activité"},
        TokenActionType.GRADE_PASSED: {"name": "Passage de grade", "description": "Obtenir un nouveau grade", "icon": "🥋", "category": "progression"},
        TokenActionType.REFERRAL_BONUS: {"name": "Parrainage", "description": "Parrainer un nouveau membre", "icon": "🤝", "category": "unique"},
        TokenActionType.FIRST_PURCHASE: {"name": "Premier achat", "description": "Effectuer un premier achat en boutique", "icon": "🛒", "category": "unique"},
        TokenActionType.FORUM_POST: {"name": "Post sur le forum", "description": "Créer un sujet ou répondre sur le forum", "icon": "💭", "category": "quotidien", "limit": TOKEN_DAILY_LIMITS.get(TokenActionType.FORUM_POST)},
        TokenActionType.LICENSE_PAID: {"name": "Licence payée", "description": "Payer sa licence annuelle", "icon": "📜", "category": "annuel"},
    }
    
    for action_type, amount in TOKEN_REWARDS.items():
        info = action_descriptions.get(action_type, {})
        reward = {
            "action_type": action_type.value,
            "amount": amount,
            "name": info.get("name", action_type.value),
            "description": info.get("description", ""),
            "icon": info.get("icon", "⭐"),
            "category": info.get("category", "autre"),
            "daily_limit": info.get("limit")
        }
        rewards.append(reward)
    
    return {
        "rewards": rewards,
        "currency_name": "Token AJL",
        "currency_symbol": "AJL",
        "description": "Le Token AJL est notre monnaie communautaire. Gagnez des tokens en participant activement à l'académie !"
    }

@api_router.get("/tokens/history")
async def get_token_history(
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Récupère l'historique des transactions de tokens"""
    transactions = await db.token_transactions.find(
        {"user_id": current_user.get("id")},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    total = await db.token_transactions.count_documents({"user_id": current_user.get("id")})
    
    return {"transactions": transactions, "total": total}

@api_router.post("/tokens/claim-daily")
async def claim_daily_tokens(current_user: dict = Depends(get_current_user)):
    """Réclame le bonus quotidien de tokens"""
    user_id = current_user.get("id")
    balance = await get_or_create_token_balance(user_id)
    
    now = datetime.now(timezone.utc)
    last_claim = balance.get("last_daily_claim")
    
    if last_claim:
        if isinstance(last_claim, str):
            last_claim = datetime.fromisoformat(last_claim.replace("Z", "+00:00"))
        
        # Vérifier si déjà réclamé aujourd'hui
        if last_claim.date() == now.date():
            raise HTTPException(
                status_code=400, 
                detail="Bonus quotidien déjà réclamé aujourd'hui"
            )
        
        # Calculer la série
        yesterday = (now - timedelta(days=1)).date()
        if last_claim.date() == yesterday:
            new_streak = balance.get("streak_days", 0) + 1
        else:
            new_streak = 1
    else:
        new_streak = 1
    
    # Mettre à jour le streak
    longest_streak = max(balance.get("longest_streak", 0), new_streak)
    await db.token_balances.update_one(
        {"user_id": user_id},
        {"$set": {
            "last_daily_claim": now.isoformat(),
            "streak_days": new_streak,
            "longest_streak": longest_streak
        }}
    )
    
    # Attribuer les tokens quotidiens
    transaction = await award_tokens(
        user_id, 
        TokenActionType.DAILY_LOGIN.value,
        description=f"Connexion quotidienne - Jour {new_streak}"
    )
    
    # Bonus de série (tous les 7 jours)
    streak_bonus = None
    if new_streak > 0 and new_streak % 7 == 0:
        streak_bonus = await award_tokens(
            user_id,
            TokenActionType.STREAK_BONUS.value,
            description=f"Série de {new_streak} jours consécutifs!"
        )
    
    return {
        "success": True,
        "daily_tokens": TOKEN_REWARDS[TokenActionType.DAILY_LOGIN],
        "streak_days": new_streak,
        "streak_bonus": streak_bonus.get("amount") if streak_bonus else 0,
        "message": f"Bravo! {new_streak} jour(s) consécutif(s)"
    }

@api_router.get("/tokens/leaderboard")
async def get_token_leaderboard(
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Récupère le classement des membres par tokens"""
    pipeline = [
        {"$sort": {"total_earned": -1}},
        {"$limit": limit},
        {"$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "id",
            "as": "user"
        }},
        {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
        {"$project": {
            "_id": 0,
            "user_id": 1,
            "balance": 1,
            "total_earned": 1,
            "level": 1,
            "streak_days": 1,
            "user_name": "$user.full_name",
            "user_photo": "$user.photo_url",
            "user_role": "$user.role"
        }}
    ]
    
    leaderboard = await db.token_balances.aggregate(pipeline).to_list(limit)
    
    # Ajouter le rang
    for i, entry in enumerate(leaderboard, 1):
        entry["rank"] = i
        entry["is_current_user"] = entry.get("user_id") == current_user.get("id")
    
    # Récupérer le rang de l'utilisateur actuel s'il n'est pas dans le top
    current_user_in_top = any(e.get("is_current_user") for e in leaderboard)
    current_user_rank = None
    
    if not current_user_in_top:
        user_balance = await db.token_balances.find_one({"user_id": current_user.get("id")})
        if user_balance:
            higher_count = await db.token_balances.count_documents({
                "total_earned": {"$gt": user_balance.get("total_earned", 0)}
            })
            current_user_rank = {
                "rank": higher_count + 1,
                "user_id": current_user.get("id"),
                "user_name": current_user.get("full_name"),
                "user_photo": current_user.get("photo_url"),
                "balance": user_balance.get("balance", 0),
                "total_earned": user_balance.get("total_earned", 0),
                "level": user_balance.get("level", 1),
                "is_current_user": True
            }
    
    return {
        "leaderboard": leaderboard,
        "current_user_rank": current_user_rank
    }

@api_router.post("/tokens/redeem")
async def redeem_tokens(
    request: TokenRedeemRequest,
    current_user: dict = Depends(get_current_user)
):
    """Échange des tokens contre une récompense"""
    user_id = current_user.get("id")
    balance = await get_or_create_token_balance(user_id)
    
    if balance.get("balance", 0) < request.amount:
        raise HTTPException(status_code=400, detail="Solde insuffisant")
    
    # Débiter les tokens
    transaction = await award_tokens(
        user_id,
        request.redemption_type,
        amount=-request.amount,
        description=f"Échange: {request.redemption_type}",
        reference_id=request.reference_id
    )
    
    return {
        "success": True,
        "tokens_spent": request.amount,
        "new_balance": balance.get("balance", 0) - request.amount,
        "transaction": transaction
    }

@api_router.post("/admin/tokens/grant")
async def admin_grant_tokens(
    request: TokenGrantRequest,
    current_user: dict = Depends(get_current_user)
):
    """Attribution de tokens par un admin"""
    require_admin(current_user)
    
    # Vérifier que l'utilisateur cible existe
    target_user = await db.users.find_one({"id": request.user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    transaction = await award_tokens(
        request.user_id,
        TokenActionType.ADMIN_GRANT.value,
        amount=request.amount,
        description=f"Attribution admin: {request.reason}"
    )
    
    return {
        "success": True,
        "user_id": request.user_id,
        "user_name": target_user.get("full_name"),
        "tokens_granted": request.amount,
        "transaction": transaction
    }

@api_router.get("/admin/tokens/stats")
async def admin_token_stats(current_user: dict = Depends(get_current_user)):
    """Statistiques globales des tokens (admin)"""
    require_admin(current_user)
    
    # Stats globales
    pipeline = [
        {"$group": {
            "_id": None,
            "total_users": {"$sum": 1},
            "total_tokens_in_circulation": {"$sum": "$balance"},
            "total_tokens_earned": {"$sum": "$total_earned"},
            "total_tokens_spent": {"$sum": "$total_spent"},
            "avg_balance": {"$avg": "$balance"},
            "max_balance": {"$max": "$balance"}
        }}
    ]
    stats = await db.token_balances.aggregate(pipeline).to_list(1)
    global_stats = stats[0] if stats else {}
    global_stats.pop("_id", None)
    
    # Transactions récentes
    recent_transactions = await db.token_transactions.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    # Enrichir avec noms utilisateurs
    for tx in recent_transactions:
        user = await db.users.find_one({"id": tx.get("user_id")}, {"_id": 0, "full_name": 1})
        tx["user_name"] = user.get("full_name") if user else "Inconnu"
    
    return {
        "stats": global_stats,
        "recent_transactions": recent_transactions
    }

# Badges endpoints
@api_router.get("/badges")
async def get_all_badges(current_user: dict = Depends(get_current_user)):
    """Liste tous les badges disponibles"""
    badges = await db.badges.find({}, {"_id": 0}).to_list(100)
    
    # Si pas de badges, créer les badges par défaut
    if not badges:
        default_badges = [
            {"badge_type": "newcomer", "name": "Nouveau Membre", "description": "Bienvenue dans l'Académie!", "icon": "🎉", "rarity": "common"},
            {"badge_type": "regular", "name": "Habitué", "description": "7 jours de connexion consécutifs", "icon": "⭐", "rarity": "common"},
            {"badge_type": "dedicated", "name": "Dévoué", "description": "30 jours de connexion consécutifs", "icon": "🌟", "rarity": "rare"},
            {"badge_type": "champion", "name": "Champion", "description": "100 jours de connexion consécutifs", "icon": "🏆", "rarity": "legendary"},
            {"badge_type": "social", "name": "Social", "description": "10 posts créés sur le mur", "icon": "💬", "rarity": "common"},
            {"badge_type": "influencer", "name": "Influenceur", "description": "50 réactions reçues", "icon": "🔥", "rarity": "rare"},
            {"badge_type": "helper", "name": "Entraide", "description": "25 commentaires postés", "icon": "🤝", "rarity": "common"},
            {"badge_type": "warrior", "name": "Guerrier", "description": "Atteindre la ceinture noire", "icon": "🥋", "rarity": "epic"},
            {"badge_type": "collector", "name": "Collectionneur", "description": "Accumuler 1000 tokens AJL", "icon": "💰", "rarity": "rare"},
            {"badge_type": "whale", "name": "Baleine", "description": "Accumuler 5000 tokens AJL", "icon": "🐋", "rarity": "legendary"},
            {"badge_type": "pioneer", "name": "Pionnier", "description": "Parmi les premiers membres", "icon": "🚀", "rarity": "epic"},
            {"badge_type": "instructor", "name": "Instructeur", "description": "Instructeur certifié", "icon": "👨‍🏫", "rarity": "epic"},
        ]
        for badge in default_badges:
            badge["id"] = str(uuid.uuid4())
            badge["token_cost"] = 0
            badge["created_at"] = datetime.now(timezone.utc).isoformat()
            # Créer une copie pour l'insertion (MongoDB va ajouter _id)
            insert_doc = badge.copy()
            await db.badges.insert_one(insert_doc)
        # Retourner les badges sans _id
        badges = default_badges
    
    return {"badges": badges}

@api_router.get("/badges/my")
async def get_my_badges(current_user: dict = Depends(get_current_user)):
    """Récupère les badges de l'utilisateur"""
    user_badges = await db.user_badges.find(
        {"user_id": current_user.get("id")},
        {"_id": 0}
    ).to_list(100)
    
    # Enrichir avec les détails des badges
    for ub in user_badges:
        badge = await db.badges.find_one({"id": ub.get("badge_id")}, {"_id": 0})
        if badge:
            ub["badge"] = badge
    
    return {"badges": user_badges}

# ========== FIN TOKEN AJL ENDPOINTS ==========

# ========== SPONSORS/PUBLICITÉS ENDPOINTS ==========

@api_router.get("/sponsors")
async def get_active_sponsors():
    """Récupère les sponsors actifs pour affichage public"""
    now = datetime.now(timezone.utc)
    
    # Trouver les sponsors actifs dans la période
    sponsors = await db.sponsors.find({
        "active": True,
        "$or": [
            {"end_date": None},
            {"end_date": {"$gte": now.isoformat()}}
        ]
    }, {"_id": 0}).sort("priority", -1).to_list(100)
    
    # Incrémenter les impressions
    for sponsor in sponsors:
        await db.sponsors.update_one(
            {"id": sponsor["id"]},
            {"$inc": {"impressions": 1}}
        )
    
    return {"sponsors": sponsors}

@api_router.post("/sponsors/{sponsor_id}/click")
async def track_sponsor_click(sponsor_id: str):
    """Tracker un clic sur un sponsor"""
    sponsor = await db.sponsors.find_one({"id": sponsor_id})
    
    if not sponsor:
        raise HTTPException(status_code=404, detail="Sponsor introuvable")
    
    # Incrémenter les clics
    await db.sponsors.update_one(
        {"id": sponsor_id},
        {"$inc": {"clicks": 1}}
    )
    
    return {"success": True, "redirect_url": sponsor.get("website_url")}

@api_router.get("/admin/sponsors")
async def get_all_sponsors_admin(current_user: dict = Depends(get_current_user)):
    """Liste tous les sponsors (admin)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    sponsors = await db.sponsors.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"sponsors": sponsors}

@api_router.post("/admin/sponsors")
async def create_sponsor(
    sponsor_data: SponsorCreate,
    current_user: dict = Depends(get_current_user)
):
    """Créer un nouveau sponsor (admin)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    sponsor = Sponsor(**sponsor_data.model_dump())
    sponsor_dict = sponsor.model_dump()
    sponsor_dict["created_at"] = sponsor_dict["created_at"].isoformat()
    sponsor_dict["updated_at"] = sponsor_dict["updated_at"].isoformat()
    
    # Convertir les dates optionnelles si elles existent et ne sont pas None
    if sponsor_dict.get("start_date") and sponsor_dict["start_date"] is not None:
        if isinstance(sponsor_dict["start_date"], datetime):
            sponsor_dict["start_date"] = sponsor_dict["start_date"].isoformat()
    else:
        sponsor_dict["start_date"] = None
        
    if sponsor_dict.get("end_date") and sponsor_dict["end_date"] is not None:
        if isinstance(sponsor_dict["end_date"], datetime):
            sponsor_dict["end_date"] = sponsor_dict["end_date"].isoformat()
    else:
        sponsor_dict["end_date"] = None
    
    await db.sponsors.insert_one(sponsor_dict)
    
    sponsor_dict.pop("_id", None)
    return {"sponsor": sponsor_dict}

@api_router.put("/admin/sponsors/{sponsor_id}")
async def update_sponsor(
    sponsor_id: str,
    sponsor_data: SponsorUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Mettre à jour un sponsor (admin)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    existing = await db.sponsors.find_one({"id": sponsor_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Sponsor introuvable")
    
    update_data = {k: v for k, v in sponsor_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Convertir les dates optionnelles si elles existent
    if "start_date" in update_data and update_data["start_date"]:
        if isinstance(update_data["start_date"], datetime):
            update_data["start_date"] = update_data["start_date"].isoformat()
        elif update_data["start_date"] == "":
            update_data["start_date"] = None
            
    if "end_date" in update_data and update_data["end_date"]:
        if isinstance(update_data["end_date"], datetime):
            update_data["end_date"] = update_data["end_date"].isoformat()
        elif update_data["end_date"] == "":
            update_data["end_date"] = None
    
    await db.sponsors.update_one(
        {"id": sponsor_id},
        {"$set": update_data}
    )
    
    updated_sponsor = await db.sponsors.find_one({"id": sponsor_id}, {"_id": 0})
    return {"sponsor": updated_sponsor}

@api_router.delete("/admin/sponsors/{sponsor_id}")
async def delete_sponsor(
    sponsor_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Supprimer un sponsor (admin)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.sponsors.delete_one({"id": sponsor_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sponsor introuvable")
    
    return {"success": True}

@api_router.get("/admin/sponsors/stats")
async def get_sponsors_stats(current_user: dict = Depends(get_current_user)):
    """Statistiques globales des sponsors (admin)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    sponsors = await db.sponsors.find({}, {"_id": 0}).to_list(100)
    
    total_impressions = sum(s.get("impressions", 0) for s in sponsors)
    total_clicks = sum(s.get("clicks", 0) for s in sponsors)
    
    # Calcul du CTR (Click-Through Rate)
    ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
    
    # Sponsors par performance
    sponsors_by_performance = sorted(
        sponsors,
        key=lambda s: s.get("clicks", 0),
        reverse=True
    )
    
    return {
        "total_sponsors": len(sponsors),
        "active_sponsors": len([s for s in sponsors if s.get("active")]),
        "total_impressions": total_impressions,
        "total_clicks": total_clicks,
        "ctr_percentage": round(ctr, 2),
        "top_performers": sponsors_by_performance[:5]
    }

# ========== FIN SPONSORS ENDPOINTS ==========

app.include_router(api_router)

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# STATIC FILES - Serve React Frontend (Unified Deployment)
# ============================================================================

# Path to the frontend build directory
FRONTEND_BUILD_DIR = ROOT_DIR.parent / "frontend" / "build"
FRONTEND_STATIC_DIR = FRONTEND_BUILD_DIR / "static"

# Check if frontend build exists (for unified deployment)
if FRONTEND_BUILD_DIR.exists() and FRONTEND_STATIC_DIR.exists():
    logger.info(f"Frontend build found at {FRONTEND_BUILD_DIR}, serving static files")
    
    # Mount static assets (JS, CSS, images)
    app.mount("/static", StaticFiles(directory=FRONTEND_STATIC_DIR), name="static")
    
    # Serve other static files (manifest.json, sw.js, etc.)
    @app.get("/manifest.json")
    async def serve_manifest():
        return FileResponse(FRONTEND_BUILD_DIR / "manifest.json")
    
    @app.get("/sw.js")
    async def serve_sw():
        return FileResponse(FRONTEND_BUILD_DIR / "sw.js", media_type="application/javascript")
    
    @app.get("/favicon.ico")
    async def serve_favicon():
        favicon_path = FRONTEND_BUILD_DIR / "favicon.ico"
        if favicon_path.exists():
            return FileResponse(favicon_path)
        raise HTTPException(status_code=404)
    
    # Catch-all route for React SPA - MUST be last
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        """
        Serve React app for all non-API routes.
        This enables client-side routing in the React SPA.
        """
        # Don't serve index.html for API routes (they should 404 if not found)
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # Serve index.html for all other routes
        return FileResponse(FRONTEND_BUILD_DIR / "index.html")
else:
    logger.info("No frontend build found - running in API-only mode")
    
    @app.get("/")
    async def root():
        return {
            "message": "Académie Levinet API",
            "status": "running",
            "docs": "/docs",
            "mode": "api-only"
        }

async def create_indexes():
    """Create indexes in the background"""
    try:
        logger.info("🚀 Création des index pour la performance (arrière-plan)...")
        # Use background=True for safer index creation on live DB
        await db.users.create_index([("role", 1)], background=True)
        await db.users.create_index([("roles", 1)], background=True)
        await db.users.create_index([("country", 1)], background=True)
        await db.users.create_index([("full_name", 1)], background=True)
        await db.users.create_index([("email", 1)], background=True)
        await db.users.create_index([("belt_grade", 1)], background=True)
        await db.post_comments.create_index([("post_id", 1)], background=True)
        await db.post_reactions.create_index([("post_id", 1)], background=True)
        await db.messages.create_index([("conversation_id", 1)], background=True)
        await db.messages.create_index([("sender_id", 1), ("read", 1)], background=True)
        await db.conversations.create_index([("participants", 1)], background=True)
        await db.posts.create_index([("created_at", -1)], background=True)
        logger.info("✅ Indexation terminée")
    except Exception as e:
        logger.error(f"⚠️ Erreur création index: {e}")

@app.on_event("startup")
async def startup_db_client():
    """Test MongoDB connection on startup"""
    try:
        # Test the connection
        await client.admin.command('ping')
        logger.info("✅ MongoDB connecté avec succès")

        # Start index creation in background to not block startup
        asyncio.create_task(create_indexes())

    except Exception as e:
        logger.error(f"❌ ERREUR MongoDB startup: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
