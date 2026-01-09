import React, { useState, useEffect, useRef } from 'react';
import MemberSidebar from '../../components/MemberSidebar';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../utils/api';
import {
  Settings, User, Mail, Phone, Lock, Bell, Camera,
  Save, Loader2, Upload, Link, X, Check, Eye, EyeOff
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';

const MemberSettingsPage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    full_name: '',
    phone: '',
  });

  // Password states
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email_news: true,
    email_events: true,
    email_messages: true,
    push_enabled: false,
  });

  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
      setPersonalInfo({
        full_name: response.data.full_name || '',
        phone: response.data.phone || '',
      });
      // Load notification preferences if available
      if (response.data.notification_preferences) {
        setNotifications(response.data.notification_preferences);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erreur lors du chargement du profil');
    }
    setLoading(false);
  };

  const handleSavePersonalInfo = async () => {
    setSaving(true);
    try {
      const response = await api.put('/profile', {
        full_name: personalInfo.full_name,
        phone: personalInfo.phone,
      });
      setProfile(response.data);
      toast.success('Informations mises à jour');
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(getErrorMessage(error, 'Erreur lors de la mise à jour'));
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current) {
      toast.error('Veuillez entrer votre mot de passe actuel');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/profile/password', null, {
        params: {
          current_password: passwordForm.current,
          new_password: passwordForm.new
        }
      });
      toast.success('Mot de passe modifié avec succès');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(getErrorMessage(error, 'Erreur lors du changement de mot de passe'));
    }
    setChangingPassword(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await api.put('/profile', {
        notification_preferences: notifications
      });
      toast.success('Préférences de notification mises à jour');
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Erreur lors de la mise à jour des préférences');
    }
    setSaving(false);
  };

  const validatePhotoUrl = (url) => {
    if (!url) return false;
    if (url.startsWith('blob:')) {
      toast.error('Les URLs "blob:" ne sont pas supportées. Utilisez une URL directe (https://...)');
      return false;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error('L\'URL doit commencer par http:// ou https://');
      return false;
    }
    return true;
  };

  const handlePhotoClick = () => {
    setShowPhotoModal(true);
  };

  const handlePhotoUrlSubmit = () => {
    const url = window.prompt('Entrez l\'URL de votre photo de profil:\n\n⚠️ Utilisez une URL permanente (https://...)\nLes URLs temporaires (blob:) ne fonctionnent pas.');
    if (url && validatePhotoUrl(url)) {
      updatePhotoUrl(url);
    }
    setShowPhotoModal(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image (JPG, PNG, GIF, WebP)');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`L'image fait ${sizeMB} Mo, maximum autorisé: 10 Mo`);
      return;
    }

    uploadPhotoFile(file);
    setShowPhotoModal(false);
  };

  const uploadPhotoFile = async (file) => {
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result.split(',')[1];
          const response = await api.post('/upload/photo', {
            photo_base64: base64,
            filename: file.name
          });

          await api.post('/profile/photo', null, { params: { photo_url: response.data.photo_url } });
          setProfile({ ...profile, photo_url: response.data.photo_url });
          toast.success('Photo mise à jour avec succès');
          if (refreshUser) refreshUser();
        } catch (error) {
          console.error('Error uploading photo:', error);
          toast.error('Erreur lors de l\'upload de la photo');
        }
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Erreur lors de la lecture du fichier');
      setUploadingPhoto(false);
    }
  };

  const updatePhotoUrl = async (url) => {
    setUploadingPhoto(true);
    try {
      await api.post('/profile/photo', null, { params: { photo_url: url } });
      setProfile({ ...profile, photo_url: url });
      toast.success('Photo mise à jour');
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error('Erreur lors de la mise à jour de la photo');
    }
    setUploadingPhoto(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <MemberSidebar />
        <div className="flex-1 lg:ml-64 p-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="flex min-h-screen bg-background">
      <MemberSidebar />

      <div className="flex-1 lg:ml-64 p-6 pb-24 lg:pb-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" strokeWidth={1.5} />
            Paramètres
          </h1>
          <p className="text-text-secondary font-manrope mt-2">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        <div className="space-y-6 max-w-3xl">
          {/* Photo de profil */}
          <div className="bg-paper rounded-xl border border-white/5 p-6">
            <h3 className="font-oswald text-lg text-text-primary uppercase mb-6 flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" /> Photo de profil
            </h3>

            <div className="flex items-center gap-6">
              <div
                className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-white/10 cursor-pointer group"
                onClick={handlePhotoClick}
              >
                {uploadingPhoto ? (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                ) : profile?.photo_url ? (
                  <img src={profile.photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-3xl font-oswald font-bold text-white">{initials}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>

              <div>
                <Button onClick={handlePhotoClick} variant="outline" className="border-white/10">
                  <Upload className="w-4 h-4 mr-2" />
                  Changer la photo
                </Button>
                <p className="text-xs text-text-muted mt-2">JPG, PNG ou GIF. Max 10 Mo.</p>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Informations personnelles */}
          <div className="bg-paper rounded-xl border border-white/5 p-6">
            <h3 className="font-oswald text-lg text-text-primary uppercase mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Informations personnelles
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-text-muted flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" /> Nom complet
                </Label>
                <Input
                  value={personalInfo.full_name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, full_name: e.target.value })}
                  className="bg-background border-white/10 text-text-primary"
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <Label className="text-text-muted flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" /> Email
                </Label>
                <Input
                  value={profile?.email || ''}
                  disabled
                  className="bg-background/50 border-white/10 text-text-muted cursor-not-allowed"
                />
                <p className="text-xs text-text-muted mt-1">L'email ne peut pas être modifié</p>
              </div>

              <div>
                <Label className="text-text-muted flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" /> Téléphone
                </Label>
                <Input
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="bg-background border-white/10 text-text-primary"
                  placeholder="+33 6 00 00 00 00"
                />
              </div>

              <Button
                onClick={handleSavePersonalInfo}
                disabled={saving}
                className="bg-primary hover:bg-primary-dark"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Enregistrer
              </Button>
            </div>
          </div>

          {/* Sécurité - Mot de passe */}
          <div className="bg-paper rounded-xl border border-white/5 p-6">
            <h3 className="font-oswald text-lg text-text-primary uppercase mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Sécurité
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-text-muted mb-2 block">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="bg-background border-white/10 text-text-primary pr-10"
                    placeholder="Votre mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-text-muted mb-2 block">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="bg-background border-white/10 text-text-primary pr-10"
                    placeholder="Minimum 6 caractères"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-text-muted mb-2 block">Confirmer le nouveau mot de passe</Label>
                <Input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="bg-background border-white/10 text-text-primary"
                  placeholder="Confirmez votre nouveau mot de passe"
                />
                {passwordForm.new && passwordForm.confirm && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${passwordForm.new === passwordForm.confirm ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordForm.new === passwordForm.confirm ? (
                      <><Check className="w-3 h-3" /> Les mots de passe correspondent</>
                    ) : (
                      <><X className="w-3 h-3" /> Les mots de passe ne correspondent pas</>
                    )}
                  </p>
                )}
              </div>

              <Button
                onClick={handlePasswordChange}
                disabled={changingPassword || !passwordForm.current || !passwordForm.new || passwordForm.new !== passwordForm.confirm}
                className="bg-primary hover:bg-primary-dark"
              >
                {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                Changer le mot de passe
              </Button>
            </div>
          </div>

          {/* Préférences de notification */}
          <div className="bg-paper rounded-xl border border-white/5 p-6">
            <h3 className="font-oswald text-lg text-text-primary uppercase mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notifications
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-text-primary font-medium">Actualités</p>
                  <p className="text-text-muted text-sm">Recevoir les news de l'Académie par email</p>
                </div>
                <Switch
                  checked={notifications.email_news}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email_news: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-white/5">
                <div>
                  <p className="text-text-primary font-medium">Événements</p>
                  <p className="text-text-muted text-sm">Être notifié des stages et événements</p>
                </div>
                <Switch
                  checked={notifications.email_events}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email_events: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-white/5">
                <div>
                  <p className="text-text-primary font-medium">Messages</p>
                  <p className="text-text-muted text-sm">Recevoir un email pour les nouveaux messages</p>
                </div>
                <Switch
                  checked={notifications.email_messages}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email_messages: checked })}
                />
              </div>

              <Button
                onClick={handleSaveNotifications}
                disabled={saving}
                variant="outline"
                className="border-white/10 mt-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Enregistrer les préférences
              </Button>
            </div>
          </div>
        </div>

        {/* Photo Upload Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-paper rounded-xl border border-white/10 w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-oswald text-xl font-bold text-text-primary uppercase">
                  Changer la Photo
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPhotoModal(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-primary hover:bg-primary-dark h-14 text-lg"
                >
                  <Upload className="w-5 h-5 mr-3" />
                  Télécharger depuis l'ordinateur
                </Button>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-text-muted text-sm">ou</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>

                <Button
                  onClick={handlePhotoUrlSubmit}
                  variant="outline"
                  className="w-full border-white/10 h-14 text-lg"
                >
                  <Link className="w-5 h-5 mr-3" />
                  Utiliser une URL
                </Button>

                <p className="text-xs text-text-muted text-center mt-4">
                  Formats acceptés: JPG, PNG, GIF, WebP (max 10 Mo)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberSettingsPage;
