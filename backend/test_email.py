"""
Script de test pour l'envoi d'emails
Usage: python test_email.py <email_destinataire>
"""
import asyncio
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Charger le .env
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

from email_service import send_email, get_welcome_email_html

async def test_email(recipient_email: str):
    """Test l'envoi d'un email de bienvenue"""
    print(f"🚀 Envoi d'un email de test à {recipient_email}...")
    print(f"📧 Configuration SMTP:")
    print(f"   - Host: {os.environ.get('SMTP_HOST', 'N/A')}")
    print(f"   - Port: {os.environ.get('SMTP_PORT', 'N/A')}")
    print(f"   - User: {os.environ.get('SMTP_USER', 'N/A')}")
    print(f"   - From: {os.environ.get('SMTP_FROM_EMAIL', 'N/A')}")
    print()
    
    # Générer le HTML
    html_content = get_welcome_email_html(
        user_name="Utilisateur Test",
        user_email=recipient_email
    )
    
    # Envoyer l'email
    success = await send_email(
        to_email=recipient_email,
        subject="✅ Test Email - Académie Jacques Levinet",
        html_content=html_content,
        text_content="Ceci est un email de test pour vérifier la configuration SMTP de l'Académie Jacques Levinet."
    )
    
    if success:
        print("✅ Email envoyé avec succès !")
        print(f"📬 Vérifiez la boîte de réception de {recipient_email}")
    else:
        print("❌ Échec de l'envoi de l'email")
        print("⚠️  Vérifiez les logs ci-dessus pour plus de détails")
    
    return success

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Usage: python test_email.py <email_destinataire>")
        print("   Exemple: python test_email.py contact@academielevinet.com")
        sys.exit(1)
    
    recipient = sys.argv[1]
    
    # Vérifier les variables d'environnement
    required_vars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM_EMAIL']
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        print("❌ Variables d'environnement manquantes:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n⚠️  Assurez-vous d'avoir un fichier .env avec ces variables")
        sys.exit(1)
    
    # Exécuter le test
    asyncio.run(test_email(recipient))
