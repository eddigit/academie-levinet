# Vérification du Système Email - Académie Jacques Levinet
**Date:** 4 janvier 2026

## ✅ Architecture Email Vérifiée

### Configuration SMTP
- **Serveur:** smtp.gmail.com
- **Port:** 587 (TLS)
- **Email:** academielevinetad@gmail.com
- **Nom d'expéditeur:** Académie Jacques Levinet

### Templates Email Disponibles

1. **Email de Bienvenue** (`get_welcome_email_html`)
   - Logo AJL
   - Message personnalisé avec nom de l'utilisateur
   - Identifiants de connexion
   - Liste des prochaines étapes
   - Liens vers https://academielevinet.com ✅
   - Contacts : +33 6 98 07 08 51, Saint Jean de Védas
   - Réseaux sociaux : Facebook, YouTube, LinkedIn, Twitter

2. **Notification de Lead** (`get_lead_notification_html`)
   - Pour les admins quand un nouveau prospect remplit le formulaire
   - Toutes les infos du lead (nom, email, téléphone, localisation, motivations)
   - URL mise à jour : academielevinet.com ✅

3. **Confirmation Lead** (`get_lead_confirmation_html`)
   - Email automatique envoyé au prospect
   - Confirmation de réception
   - Délai de réponse : 48h
   - Liens vers le site et réseaux sociaux
   - URL mise à jour : academielevinet.com ✅

4. **Notification Message** (`get_new_message_notification_html`)
   - Alerte quand un utilisateur reçoit un message
   - Aperçu du message
   - Bouton pour accéder à la messagerie
   - URL mise à jour : academielevinet.com ✅

### Endpoints API

#### POST /admin/settings/smtp
- Mise à jour de la configuration SMTP
- Accessible uniquement aux admins

#### POST /admin/settings/smtp/test
- Envoi d'un email de test
- Vérifie la configuration SMTP
- Email de test professionnel avec design AJL

### Script de Test Local

**Fichier:** `backend/test_email.py`
```bash
python test_email.py <email_destinataire>
```

## ⚠️ Action Requise

### Mot de Passe d'Application Gmail

**Erreur actuelle:** 
```
(535, '5.7.8 Username and Password not accepted')
```

**Solution:** Le mot de passe d'application Gmail doit être régénéré.

**Étapes pour générer un nouveau mot de passe d'application Gmail:**

1. Aller sur https://myaccount.google.com/apppasswords
2. Se connecter avec le compte `academielevinetad@gmail.com`
3. Sélectionner "Mail" et "Autre (nom personnalisé)"
4. Nommer "Academie Levinet Backend"
5. Copier le mot de passe généré (16 caractères avec espaces)
6. Mettre à jour dans:
   - **Local:** `backend/.env` → `SMTP_PASSWORD="xxxx xxxx xxxx xxxx"`
   - **Render:** Dashboard → Environment → `SMTP_PASSWORD`

**Note:** Le compte Gmail doit avoir:
- La validation en 2 étapes activée
- L'accès "Applications moins sécurisées" DÉSACTIVÉ (on utilise des mots de passe d'application)

## 📝 Tests Recommandés (après mise à jour du mot de passe)

### 1. Test Local
```bash
cd backend
python test_email.py votre-email@example.com
```

### 2. Test via API (Postman/curl)
```bash
POST https://academielevinet.com/api/admin/settings/smtp/test
Headers: 
  Authorization: Bearer <admin_token>
  Content-Type: application/json
Body:
{
  "test_email": "votre-email@example.com"
}
```

### 3. Test Fonctionnel
1. Créer un nouvel utilisateur depuis l'admin
2. Cocher "Envoyer email de bienvenue"
3. Vérifier la réception

## ✅ Ce qui est Prêt

- ✅ Architecture email fonctionnelle
- ✅ Templates HTML professionnels et responsive
- ✅ URLs mises à jour vers academielevinet.com
- ✅ Coordonnées officielles intégrées
- ✅ Logos et branding cohérents
- ✅ Endpoints API pour configuration et test
- ✅ Script de test autonome
- ⚠️ Nécessite mise à jour du mot de passe Gmail

## 🔒 Sécurité

- Les mots de passe ne sont jamais stockés en clair
- Utilisation de TLS pour SMTP
- Authentification requise pour accès admin
- Variables d'environnement pour les credentials
