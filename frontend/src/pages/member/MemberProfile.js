import React, { useState, useEffect, useRef } from 'react';
import MemberSidebar from '../../components/MemberSidebar';
import { useAuth } from '../../context/AuthContext';
import api, { getErrorMessage } from '../../utils/api';
import { 
  User, Mail, Phone, MapPin, Calendar, Award, Edit, Camera, 
  Save, X, Loader2, Lock, Check, Home, Users, Upload, Link
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

// Belt colors
const beltColors = {
  'Ceinture Blanche': { accent: '#E5E7EB', badgeBg: '#E5E7EB', badgeText: '#1F2937' },
  'Ceinture Jaune': { accent: '#FBBF24', badgeBg: '#FBBF24', badgeText: '#1F2937' },
  'Ceinture Orange': { accent: '#F97316', badgeBg: '#F97316', badgeText: '#FFFFFF' },
  'Ceinture Verte': { accent: '#22C55E', badgeBg: '#22C55E', badgeText: '#FFFFFF' },
  'Ceinture Bleue': { accent: '#3B82F6', badgeBg: '#3B82F6', badgeText: '#FFFFFF' },
  'Ceinture Marron': { accent: '#B45309', badgeBg: '#B45309', badgeText: '#FFFFFF' },
  'Ceinture Noire': { accent: '#374151', badgeBg: '#1F2937', badgeText: '#FFFFFF' },
  'Ceinture Noire 1er Dan': { accent: '#374151', badgeBg: '#1F2937', badgeText: '#FFFFFF' },
  'Ceinture Noire 2ème Dan': { accent: '#374151', badgeBg: '#1F2937', badgeText: '#FFFFFF' },
  'Ceinture Noire 3ème Dan': { accent: '#374151', badgeBg: '#1F2937', badgeText: '#FFFFFF' },
  'Ceinture Noire 4ème Dan': { accent: '#374151', badgeBg: '#1F2937', badgeText: '#FFFFFF' },
  'Ceinture Noire 5ème Dan': { accent: '#374151', badgeBg: '#1F2937', badgeText: '#FFFFFF' },
  'Instructeur': { accent: '#DC2626', badgeBg: '#DC2626', badgeText: '#FFFFFF' },
  'Directeur Technique': { accent: '#7C3AED', badgeBg: '#7C3AED', badgeText: '#FFFFFF' },
  'Directeur National': { accent: '#EA580C', badgeBg: '#EA580C', badgeText: '#FFFFFF' },
};

const beltGrades = [
  "Ceinture Blanche", "Ceinture Jaune", "Ceinture Orange", "Ceinture Verte",
  "Ceinture Bleue", "Ceinture Marron", "Ceinture Noire", "Ceinture Noire 1er Dan",
  "Ceinture Noire 2ème Dan", "Ceinture Noire 3ème Dan", "Ceinture Noire 4ème Dan",
  "Ceinture Noire 5ème Dan", "Instructeur", "Directeur Technique", "Directeur National"
];

const MemberProfile = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Photo upload state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
      setEditForm(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erreur lors du chargement du profil');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put('/profile', {
        full_name: editForm.full_name,
        phone: editForm.phone,
        city: editForm.city,
        country: editForm.country,
        date_of_birth: editForm.date_of_birth,
        belt_grade: editForm.belt_grade,
        club_name: editForm.club_name,
        instructor_name: editForm.instructor_name,
        bio: editForm.bio
      });
      setProfile(response.data);
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès');
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour');
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
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image (JPG, PNG, GIF, WebP)');
      return;
    }
    
    // Validate file size (max 10MB - generous limit)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`L'image fait ${sizeMB} Mo, maximum autorisé: 10 Mo`);
      return;
    }
    
    // Show file info
    const sizeKB = (file.size / 1024).toFixed(1);
    console.log(`Uploading: ${file.name} (${sizeKB} Ko)`);
    
    uploadPhotoFile(file);
    setShowPhotoModal(false);
  };

  const uploadPhotoFile = async (file) => {
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result.split(',')[1]; // Remove data:image/...;base64, prefix
          const response = await api.post('/upload/photo', {
            photo_base64: base64,
            filename: file.name
          });
          
          // Update profile with new photo URL
          await api.post('/profile/photo', null, { params: { photo_url: response.data.photo_url } });
          setProfile({ ...profile, photo_url: response.data.photo_url });
          toast.success('Photo mise à jour avec succès');
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
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error('Erreur lors de la mise à jour de la photo');
    }
    setUploadingPhoto(false);
  };

  const handlePasswordChange = async () => {
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
      setShowPasswordModal(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(getErrorMessage(error, 'Erreur lors du changement de mot de passe'));
    }
    setChangingPassword(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <MemberSidebar />
        <div className="flex-1 ml-64 p-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const beltStyle = beltColors[profile?.belt_grade] || beltColors['Ceinture Blanche'];
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="flex min-h-screen bg-background">
      <MemberSidebar />
      
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide">
            Mon Profil
          </h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 border-white/10">
              <Edit className="w-4 h-4" strokeWidth={1.5} />
              Modifier
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => { setIsEditing(false); setEditForm(profile); }} variant="outline" className="gap-2 border-white/10">
                <X className="w-4 h-4" /> Annuler
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary hover:bg-primary-dark">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-paper rounded-xl border border-white/5 overflow-hidden">
              {/* Photo Section with Belt Color */}
              <div 
                className="relative h-48 flex items-center justify-center"
                style={{ background: `radial-gradient(circle at center, ${beltStyle.accent}40 0%, ${beltStyle.accent}20 30%, transparent 70%)` }}
              >
                {/* Photo */}
                <div 
                  className="relative z-10 w-28 h-28 rounded-xl overflow-hidden border-4 shadow-xl group cursor-pointer"
                  style={{ borderColor: beltStyle.accent }}
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
                      <span className="text-4xl font-oswald font-bold text-white">{initials}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Info Section */}
              <div className="p-5 text-center">
                <h2 className="font-oswald text-2xl font-bold text-text-primary uppercase">
                  {profile?.full_name}
                </h2>
                <p className="text-text-muted text-sm mt-1">{profile?.email}</p>
                
                {/* Belt Badge */}
                <div className="mt-4">
                  <span 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{ 
                      backgroundColor: beltStyle.badgeBg, 
                      color: beltStyle.badgeText 
                    }}
                  >
                    <Award className="w-4 h-4" />
                    {profile?.belt_grade || 'Non défini'}
                  </span>
                </div>

                {/* Status badges */}
                <div className="flex justify-center gap-2 mt-4">
                  {profile?.has_paid_license && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-500 text-xs rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Licence active
                    </span>
                  )}
                  {profile?.is_premium && (
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-xs rounded-full">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-paper rounded-xl border border-white/5 p-5 mt-6">
              <h3 className="font-oswald text-lg text-text-primary uppercase mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" /> Sécurité
              </h3>
              <Button 
                onClick={() => setShowPasswordModal(true)} 
                variant="outline" 
                className="w-full border-white/10"
              >
                Changer le mot de passe
              </Button>
            </div>
          </div>

          {/* Details Card */}
          <div className="lg:col-span-2">
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <h3 className="font-oswald text-lg text-text-primary uppercase mb-6">
                Informations personnelles
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" /> Nom complet
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editForm.full_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="bg-background border-white/10 text-text-primary"
                    />
                  ) : (
                    <p className="text-text-primary">{profile?.full_name || '-'}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" /> Téléphone
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="bg-background border-white/10 text-text-primary"
                      placeholder="+33 6 00 00 00 00"
                    />
                  ) : (
                    <p className="text-text-primary">{profile?.phone || '-'}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" /> Ville
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editForm.city || ''}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="bg-background border-white/10 text-text-primary"
                      placeholder="Paris"
                    />
                  ) : (
                    <p className="text-text-primary">{profile?.city || '-'}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" /> Pays
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editForm.country || 'France'}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="bg-background border-white/10 text-text-primary"
                    />
                  ) : (
                    <p className="text-text-primary">{profile?.country || 'France'}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" /> Date de naissance
                  </Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editForm.date_of_birth || ''}
                      onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                      className="bg-background border-white/10 text-text-primary"
                    />
                  ) : (
                    <p className="text-text-primary">
                      {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('fr-FR') : '-'}
                    </p>
                  )}
                </div>

                {/* Belt Grade */}
                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4" /> Grade
                  </Label>
                  {isEditing ? (
                    <Select
                      value={editForm.belt_grade || ''}
                      onValueChange={(value) => setEditForm({ ...editForm, belt_grade: value })}
                    >
                      <SelectTrigger className="bg-background border-white/10 text-text-primary">
                        <SelectValue placeholder="Sélectionnez votre grade" />
                      </SelectTrigger>
                      <SelectContent className="bg-paper border-white/10">
                        {beltGrades.map((grade) => (
                          <SelectItem key={grade} value={grade} className="text-text-primary">
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-text-primary">{profile?.belt_grade || '-'}</p>
                  )}
                </div>

                {/* Club */}
                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <Home className="w-4 h-4" /> Club
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editForm.club_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, club_name: e.target.value })}
                      className="bg-background border-white/10 text-text-primary"
                      placeholder="Nom du club"
                    />
                  ) : (
                    <p className="text-text-primary">{profile?.club_name || '-'}</p>
                  )}
                </div>

                {/* Instructor */}
                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" /> Instructeur
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editForm.instructor_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, instructor_name: e.target.value })}
                      className="bg-background border-white/10 text-text-primary"
                      placeholder="Nom de l'instructeur"
                    />
                  ) : (
                    <p className="text-text-primary">{profile?.instructor_name || '-'}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6">
                <Label className="text-text-muted mb-2 block">Bio / Présentation</Label>
                {isEditing ? (
                  <Textarea
                    value={editForm.bio || ''}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="bg-background border-white/10 text-text-primary min-h-[100px]"
                    placeholder="Présentez-vous en quelques mots..."
                  />
                ) : (
                  <p className="text-text-secondary">{profile?.bio || 'Aucune présentation'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-paper rounded-xl border border-white/10 p-6 w-full max-w-md">
              <h3 className="font-oswald text-xl text-text-primary uppercase mb-6">
                Changer le mot de passe
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary">Mot de passe actuel</Label>
                  <Input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="mt-1 bg-background border-white/10 text-text-primary"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Nouveau mot de passe</Label>
                  <Input
                    type="password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="mt-1 bg-background border-white/10 text-text-primary"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Confirmer le nouveau mot de passe</Label>
                  <Input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="mt-1 bg-background border-white/10 text-text-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 border-white/10"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handlePasswordChange}
                  disabled={changingPassword}
                  className="flex-1 bg-primary hover:bg-primary-dark"
                >
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer'}
                </Button>
              </div>
            </div>
          </div>
        )}

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
                {/* Upload from computer */}
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-primary hover:bg-primary-dark h-14 text-lg"
                >
                  <Upload className="w-5 h-5 mr-3" />
                  Télécharger depuis l'ordinateur
                </Button>

                {/* Or separator */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-text-muted text-sm">ou</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>

                {/* Use URL */}
                <Button
                  onClick={handlePhotoUrlSubmit}
                  variant="outline"
                  className="w-full border-white/10 h-14 text-lg"
                >
                  <Link className="w-5 h-5 mr-3" />
                  Utiliser une URL
                </Button>

                <p className="text-xs text-text-muted text-center mt-4">
                  Formats acceptés: JPG, PNG, GIF, WebP (max 5 Mo)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberProfile;
