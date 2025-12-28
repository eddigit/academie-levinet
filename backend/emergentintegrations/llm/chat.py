# Mock LLM Chat pour le développement local
from typing import Optional, List
from pydantic import BaseModel


class UserMessage(BaseModel):
    """Message utilisateur pour le chat"""
    content: str


class LlmChat:
    """Mock de LlmChat pour le développement local"""
    
    def __init__(self, api_key: str = "", model: str = "gpt-4"):
        self.api_key = api_key
        self.model = model
        print(f"[MOCK] LlmChat initialisé (mode développement)")
    
    async def chat(self, messages: List[UserMessage], system_prompt: str = "") -> str:
        """Mock: réponse de chat"""
        print(f"[MOCK] Chat request reçu")
        return "Ceci est une réponse mock du chatbot. En production, cette fonctionnalité utilise l'API LLM d'Emergent Agent."
    
    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        """Mock: génération de texte"""
        print(f"[MOCK] Generate request reçu")
        return "Réponse générée en mode mock (développement local)."

