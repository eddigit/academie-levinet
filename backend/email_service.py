import aiosmtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)

SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD')
SMTP_FROM_EMAIL = os.environ.get('SMTP_FROM_EMAIL')
SMTP_FROM_NAME = os.environ.get('SMTP_FROM_NAME', 'Académie Jacques Levinet')


async def send_email(to_email: str, subject: str, html_content: str, text_content: str = None):
    """
    Send email via Gmail SMTP (async)
    """
    try:
        message = MIMEMultipart('alternative')
        message['Subject'] = subject
        message['From'] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        message['To'] = to_email

        # Add text version
        if text_content:
            part1 = MIMEText(text_content, 'plain', 'utf-8')
            message.attach(part1)

        # Add HTML version
        part2 = MIMEText(html_content, 'html', 'utf-8')
        message.attach(part2)

        # Send email
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True,
        )
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def get_welcome_email_html(user_name: str, user_email: str) -> str:
    """Template d'email de bienvenue"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: 'Arial', sans-serif; background-color: #0B1120; color: #F3F4F6; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #111827; }}
            .header {{ background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 40px 20px; text-align: center; }}
            .logo-container {{ display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px; }}
            .logo-img {{ width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid white; }}
            .logo-text {{ font-size: 28px; font-weight: bold; color: white; text-transform: uppercase; letter-spacing: 2px; }}
            .content {{ padding: 40px 30px; }}
            .title {{ font-size: 24px; font-weight: bold; color: #F3F4F6; margin-bottom: 20px; }}
            .text {{ font-size: 16px; line-height: 1.6; color: #9CA3AF; margin-bottom: 15px; }}
            .button {{ display: inline-block; background-color: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }}
            .footer {{ background-color: #0B1120; padding: 30px; text-align: center; color: #6B7280; font-size: 14px; }}
            .highlight {{ color: #3B82F6; font-weight: bold; }}
            .contact-info {{ margin-top: 20px; font-size: 13px; line-height: 1.8; }}
            .social-links {{ margin-top: 15px; }}
            .social-links a {{ color: #3B82F6; text-decoration: none; margin: 0 10px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-container">
                    <img src="https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg" alt="Logo AJL" class="logo-img">
                    <div class="logo-text">AJL</div>
                </div>
                <p style="color: rgba(255,255,255,0.9); font-size: 14px;">ACADÉMIE JACQUES LEVINET</p>
                <p style="color: rgba(255,255,255,0.8); margin-top: 5px; font-size: 13px;">Self-Pro Krav - Excellence en Self-Défense depuis 1998</p>
            </div>
            
            <div class="content">
                <h1 class="title">Bienvenue {user_name} ! 🥋</h1>
                
                <p class="text">
                    Nous sommes ravis de vous accueillir au sein de l'<span class="highlight">Académie Jacques Levinet</span>, 
                    la référence mondiale en Self-Pro Krav (SPK).
                </p>
                
                <p class="text">
                    Votre compte a été créé avec succès. Vous faites désormais partie d'une communauté internationale 
                    de plus de 50 000 membres répartis dans plus de 50 pays.
                </p>
                
                <p class="text">
                    <strong>Vos identifiants de connexion :</strong><br>
                    Email : <span class="highlight">{user_email}</span>
                </p>
                
                <p class="text">
                    <strong>Prochaines étapes :</strong>
                </p>
                <ul style="color: #9CA3AF; line-height: 1.8;">
                    <li>Explorez votre tableau de bord</li>
                    <li>Consultez les actualités et événements</li>
                    <li>Contactez votre directeur technique local</li>
                    <li>Découvrez nos cours en ligne</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="https://academielevinet.com" class="button">
                        Accéder à mon compte
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p style="font-weight: bold; color: #9CA3AF;">© 2025 Académie Jacques Levinet - Tous droits réservés</p>
                <p style="margin-top: 10px; font-size: 12px;">
                    Self-Pro Krav : La self-défense efficace, réaliste et sécurisée
                </p>
                <div class="contact-info">
                    <p>📞 +33 6 98 07 08 51</p>
                    <p>📍 Saint Jean de Védas, France</p>
                    <p>🌐 <a href="https://academie-levinet.com" style="color: #3B82F6;">academie-levinet.com</a></p>
                </div>
                <div class="social-links">
                    <a href="https://www.facebook.com/capitainejacqueslevinet/">Facebook</a> •
                    <a href="https://www.youtube.com/@CapitaineJacquesLevinet">YouTube</a> •
                    <a href="https://www.linkedin.com/in/jacqueslevinet/">LinkedIn</a> •
                    <a href="https://x.com/Jacques_LEVINET">Twitter</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """


def get_lead_notification_html(lead_data: dict) -> str:
    """Template d'email pour notification de nouveau lead"""
    motivations_list = "<br>".join([f"• {m}" for m in lead_data.get('motivations', [])])
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: 'Arial', sans-serif; background-color: #0B1120; color: #F3F4F6; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #111827; }}
            .header {{ background: linear-gradient(135deg, #F97316 0%, #DC2626 100%); padding: 30px 20px; text-align: center; }}
            .title {{ font-size: 20px; font-weight: bold; color: white; }}
            .content {{ padding: 30px; }}
            .info-box {{ background-color: #1F2937; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3B82F6; }}
            .info-label {{ font-size: 12px; color: #6B7280; text-transform: uppercase; margin-bottom: 5px; }}
            .info-value {{ font-size: 16px; color: #F3F4F6; font-weight: 500; }}
            .footer {{ background-color: #0B1120; padding: 20px; text-align: center; color: #6B7280; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px;">
                    <img src="https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg" alt="Logo AJL" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid white;">
                    <div class="title">🎯 Nouveau Lead Reçu</div>
                </div>
                <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin-top: 5px;">ACADÉMIE JACQUES LEVINET</p>
            </div>
            
            <div class="content">
                <p style="color: #9CA3AF; margin-bottom: 20px;">
                    Un nouveau prospect a rempli le formulaire d'onboarding.
                </p>
                
                <div class="info-box">
                    <div class="info-label">Nom</div>
                    <div class="info-value">{lead_data.get('full_name', 'N/A')}</div>
                </div>
                
                <div class="info-box">
                    <div class="info-label">Type de personne</div>
                    <div class="info-value">{lead_data.get('person_type', 'N/A')}</div>
                </div>
                
                <div class="info-box">
                    <div class="info-label">Email</div>
                    <div class="info-value">{lead_data.get('email', 'N/A')}</div>
                </div>
                
                <div class="info-box">
                    <div class="info-label">Téléphone</div>
                    <div class="info-value">{lead_data.get('phone', 'N/A')}</div>
                </div>
                
                <div class="info-box">
                    <div class="info-label">Localisation</div>
                    <div class="info-value">{lead_data.get('city', 'N/A')}, {lead_data.get('country', 'N/A')}</div>
                </div>
                
                <div class="info-box">
                    <div class="info-label">Motivations</div>
                    <div class="info-value" style="line-height: 1.8;">
                        {motivations_list}
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p style="font-weight: bold;">Académie Jacques Levinet - Système de gestion des leads</p>
                <p style="margin-top: 10px; font-size: 12px;">📞 +33 6 98 07 08 51 | 📍 Saint Jean de Védas, France</p>
                <p style="font-size: 11px; margin-top: 10px;">🌐 <a href="https://academielevinet.com" style="color: #3B82F6;">academielevinet.com</a></p>
            </div>
        </div>
    </body>
    </html>
    """


def get_lead_confirmation_html(lead_name: str) -> str:
    """Template d'email de confirmation pour le lead"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: 'Arial', sans-serif; background-color: #0B1120; color: #F3F4F6; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #111827; }}
            .header {{ background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 40px 20px; text-align: center; }}
            .logo {{ font-size: 28px; font-weight: bold; color: white; text-transform: uppercase; letter-spacing: 2px; }}
            .content {{ padding: 40px 30px; }}
            .title {{ font-size: 24px; font-weight: bold; color: #F3F4F6; margin-bottom: 20px; }}
            .text {{ font-size: 16px; line-height: 1.6; color: #9CA3AF; margin-bottom: 15px; }}
            .highlight {{ color: #3B82F6; font-weight: bold; }}
            .footer {{ background-color: #0B1120; padding: 30px; text-align: center; color: #6B7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px;">
                    <img src="https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg" alt="Logo AJL" style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid white;">
                    <div style="font-size: 28px; font-weight: bold; color: white; text-transform: uppercase; letter-spacing: 2px;">AJL</div>
                </div>
                <p style="color: rgba(255,255,255,0.9); font-size: 14px;">ACADÉMIE JACQUES LEVINET</p>
                <p style="color: rgba(255,255,255,0.8); margin-top: 5px; font-size: 13px;">Self-Pro Krav - Excellence depuis 1998</p>
            </div>
            
            <div class="content">
                <h1 class="title">Merci {lead_name} ! ✅</h1>
                
                <p class="text">
                    Nous avons bien reçu votre demande d'information concernant l'<span class="highlight">Académie Jacques Levinet</span>.
                </p>
                
                <p class="text">
                    Un membre de notre équipe prendra contact avec vous <strong>dans les 48 heures</strong> 
                    pour répondre à vos questions et vous accompagner dans votre parcours.
                </p>
                
                <p class="text">
                    En attendant, n'hésitez pas à :
                </p>
                <ul style="color: #9CA3AF; line-height: 1.8;">
                    <li>Consulter notre site web pour en savoir plus sur le SPK</li>
                    <li>Découvrir notre réseau international de clubs</li>
                    <li>Visionner nos vidéos de démonstration</li>
                </ul>
                
                <p class="text" style="margin-top: 30px;">
                    À très bientôt,<br>
                    <strong>L'équipe de l'Académie Jacques Levinet</strong>
                </p>
            </div>
            
            <div class="footer">
                <p style="font-weight: bold;">© 2025 Académie Jacques Levinet</p>
                <p style="margin-top: 10px;">Self-Pro Krav : L'excellence en self-défense</p>
                <p style="margin-top: 15px; font-size: 12px;">📞 +33 6 98 07 08 51 | 📍 Saint Jean de Védas, France</p>
                <p style="font-size: 11px; margin-top: 10px;">
                    <a href="https://www.facebook.com/capitainejacqueslevinet/" style="color: #3B82F6; margin: 0 5px;">Facebook</a> •
                    <a href="https://www.youtube.com/@CapitaineJacquesLevinet" style="color: #3B82F6; margin: 0 5px;">YouTube</a> •
                    <a href="https://www.linkedin.com/in/jacqueslevinet/" style="color: #3B82F6; margin: 0 5px;">LinkedIn</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """


def get_new_message_notification_html(recipient_name: str, sender_name: str, message_preview: str) -> str:
    """Template d'email de notification de nouveau message"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: 'Arial', sans-serif; background-color: #0B1120; color: #F3F4F6; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #111827; }}
            .header {{ background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px 20px; text-align: center; }}
            .title {{ font-size: 20px; font-weight: bold; color: white; }}
            .content {{ padding: 30px; }}
            .message-box {{ background-color: #1F2937; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981; }}
            .sender {{ font-size: 14px; color: #10B981; font-weight: bold; margin-bottom: 10px; }}
            .message-content {{ font-size: 16px; color: #D1D5DB; line-height: 1.6; }}
            .button {{ display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }}
            .footer {{ background-color: #0B1120; padding: 20px; text-align: center; color: #6B7280; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px;">
                    <img src="https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg" alt="Logo AJL" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid white;">
                    <div class="title">💬 Nouveau Message</div>
                </div>
                <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin-top: 5px;">ACADÉMIE JACQUES LEVINET</p>
            </div>
            
            <div class="content">
                <p style="color: #9CA3AF; margin-bottom: 20px;">
                    Bonjour {recipient_name},
                </p>
                
                <p style="color: #9CA3AF; margin-bottom: 20px;">
                    Vous avez reçu un nouveau message sur la plateforme de l'Académie Jacques Levinet.
                </p>
                
                <div class="message-box">
                    <div class="sender">De : {sender_name}</div>
                    <div class="message-content">{message_preview}...</div>
                </div>
                
                <p style="color: #9CA3AF;">
                    Connectez-vous à votre espace membre pour lire et répondre à ce message.
                </p>
                
                <div style="text-align: center;">
                    <a href="#" class="button">Voir le message</a>
                </div>
            </div>
            
            <div class="footer">
                <p style="font-weight: bold;">Académie Jacques Levinet - Messagerie Interne</p>
                <p style="margin-top: 10px; font-size: 12px;">📞 +33 6 98 07 08 51 | 📍 Saint Jean de Védas, France</p>
                <p style="margin-top: 10px; font-size: 11px; color: #4B5563;">
                    Vous recevez cet email car vous avez un compte sur notre plateforme.
                </p>
                <p style="font-size: 11px; margin-top: 10px;">
                    <a href="https://academielevinet.com" style="color: #3B82F6;">academielevinet.com</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """
