# Mock Stripe Checkout pour le développement local
from pydantic import BaseModel
from typing import Optional, List, Dict


class CheckoutSessionRequest(BaseModel):
    """Mock pour StripeCheckout request"""
    price_id: Optional[str] = None
    product_name: Optional[str] = None
    unit_amount: Optional[int] = None
    currency: str = "eur"
    quantity: int = 1
    success_url: str = ""
    cancel_url: str = ""
    metadata: Optional[Dict] = None
    customer_email: Optional[str] = None


class CheckoutSessionResponse(BaseModel):
    """Mock pour la réponse de création de session"""
    session_id: str = "mock_session_id"
    url: str = "https://checkout.stripe.com/mock"


class CheckoutStatusResponse(BaseModel):
    """Mock pour le statut de checkout"""
    status: str = "complete"
    payment_status: str = "paid"
    customer_email: Optional[str] = None
    amount_total: Optional[int] = None
    currency: Optional[str] = None
    metadata: Optional[Dict] = None


class StripeCheckout:
    """Mock de StripeCheckout pour le développement local"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        print(f"[MOCK] StripeCheckout initialisé (mode développement)")
    
    async def create_session(self, request: CheckoutSessionRequest) -> CheckoutSessionResponse:
        """Mock: création de session de paiement"""
        print(f"[MOCK] Création de session Stripe pour: {request.product_name or 'produit'}")
        return CheckoutSessionResponse(
            session_id="mock_cs_" + str(hash(str(request)))[:10],
            url=f"http://localhost:3000/payment-success?session_id=mock_session"
        )
    
    async def get_session_status(self, session_id: str) -> CheckoutStatusResponse:
        """Mock: récupération du statut de session"""
        print(f"[MOCK] Récupération du statut pour session: {session_id}")
        return CheckoutStatusResponse(
            status="complete",
            payment_status="paid",
            customer_email="test@example.com",
            amount_total=1000,
            currency="eur",
            metadata={}
        )

