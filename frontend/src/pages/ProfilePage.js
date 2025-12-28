import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage } from '../utils/api';
import {
  User, Mail, Phone, MapPin, Calendar, Award, Edit, Camera,
  Save, X, Loader2, Lock, Check, Home, Users, Upload, Link,
  Shield, Crown, GraduationCap, Building2, Globe
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
};

const beltGrades = [
  "Ceinture Blanche", "Ceinture Jaune", "Ceinture Orange", "Ceinture Verte",
  "Ceinture Bleue", "Ceinture Marron", "Ceinture Noire", "Ceinture Noire 1er Dan",
  "Ceinture Noire 2ème Dan", "Ceinture Noire 3ème Dan", "Ceinture Noire 4ème Dan",
  "Ceinture Noire 5ème Dan"
];

// Rôles: admin > directeur_technique > instructeur > eleve (avec club) > eleve_libre (sans club)
const roleLabels = {
  'admin': { label: 'Administrateur', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/20' },
  'directeur_technique': { label: 'Directeur Technique', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/20' },
  'instructeur': { label: 'Instructeur', icon: GraduationCap, color: 'text-red-500', bg: 'bg-red-500/20' },
  'eleve': { label: 'Élève', icon: User, color: 'text-primary', bg: 'bg-primary/20' },
  'eleve_libre': { label: 'Élève Libre', icon: Globe, color: 'text-green-500', bg: 'bg-green-500/20' },
  // Compatibilité anciens rôles
  'membre': { label: 'Élève', icon: User, color: 'text-primary', bg: 'bg-primary/20' },
  'fondateur': { label: 'Administrateur', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/20' },
  'directeur_national': { label: 'Administrateur', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/20' }
};

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Affectations data
  const [clubs, setClubs] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [technicalDirectors, setTechnicalDirectors] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchAffectations();
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

  const fetchAffectations = async () => {
    try {
      const [clubsRes, instructorsRes, dtRes] = await Promise.all([
        api.get('/clubs'),
        api.get('/admin/users?role=instructeur'),
        api.get('/admin/users?role=directeur_technique')
      ]);
      setClubs(clubsRes.data?.clubs || []);
      setInstructors(instructorsRes.data?.users || []);
      setTechnicalDirectors(dtRes.data?.users || []);
    } catch (error) {
      console.error('Error fetching affectations:', error);
    }
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
        bio: editForm.bio
      });
      setProfile(response.data);
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès');
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(getErrorMessage(error, 'Erreur lors de la mise à jour'));
    }
    setSaving(false);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 10 Mo');
      return;
    }

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target.result.split(',')[1];
          const uploadResponse = await api.post('/upload/photo', {
            photo_base64: base64,
            filename: file.name
          });
          await api.post('/profile/photo', null, { params: { photo_url: uploadResponse.data.photo_url } });
          setProfile({ ...profile, photo_url: uploadResponse.data.photo_url });
          toast.success('Photo mise à jour');
          if (refreshUser) refreshUser();
        } catch (error) {
          console.error('Error uploading photo:', error);
          toast.error('Erreur lors de l\'upload');
        }
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setUploadingPhoto(false);
    }
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
        params: { current_password: passwordForm.current, new_password: passwordForm.new }
      });
      toast.success('Mot de passe modifié avec succès');
      setShowPasswordModal(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erreur lors du changement de mot de passe'));
    }
    setChangingPassword(false);
  };

  const getClubName = (clubId) => {
    const club = clubs.find(c => (c.id || c._id) === clubId);
    return club ? club.name : 'Non assigné';
  };

  const getUserName = (userId, userList) => {
    const user = userList.find(u => (u.id || u._id) === userId);
    return user ? user.full_name : 'Non assigné';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const beltStyle = beltColors[profile?.belt_grade] || beltColors['Ceinture Blanche'];
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const roleConfig = roleLabels[profile?.role] || roleLabels.membre;
  const RoleIcon = roleConfig.icon;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-oswald text-2xl md:text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
              <User className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              Mon Compte
            </h1>
            <p className="text-text-muted mt-1">Gérez vos informations personnelles</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 border-white/10">
              <Edit className="w-4 h-4" /> Modifier
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
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-paper rounded-xl border border-white/5 overflow-hidden">
              {/* Photo Section */}
              <div
                className="relative h-48 flex items-center justify-center"
                style={{ background: `radial-gradient(circle at center, ${beltStyle.accent}40 0%, ${beltStyle.accent}20 30%, transparent 70%)` }}
              >
                <div
                  className="relative z-10 w-28 h-28 rounded-xl overflow-hidden border-4 shadow-xl group cursor-pointer"
                  style={{ borderColor: beltStyle.accent }}
                  onClick={() => fileInputRef.current?.click()}
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

                {/* Role Badge */}
                <div className="mt-4 flex justify-center">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${roleConfig.bg} ${roleConfig.color}`}>
                    <RoleIcon className="w-4 h-4" />
                    {roleConfig.label}
                  </span>
                </div>

                {/* Belt Badge */}
                {profile?.belt_grade && (
                  <div className="mt-3">
                    <span
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                      style={{ backgroundColor: beltStyle.badgeBg, color: beltStyle.badgeText }}
                    >
                      <Award className="w-4 h-4" />
                      {profile.belt_grade}
                    </span>
                  </div>
                )}

                {/* Status badges */}
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  {profile?.has_paid_license && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-500 text-xs rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Licence
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
            <div className="bg-paper rounded-xl border border-white/5 p-5">
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

          {/* Details Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <h3 className="font-oswald text-lg text-text-primary uppercase mb-6">
                Informations personnelles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" /> Nom complet
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editForm.full_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="bg-background border-white/10"
                    />
                  ) : (
                    <p className="text-text-primary">{profile?.full_name || '-'}</p>
                  )}
                </div>

                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" /> Email
                  </Label>
                  <p className="text-text-primary">{profile?.email || '-'}</p>
                </div>

                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" /> Téléphone
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="bg-background border-white/10"
                      placeholder="+33 6 00 00 00 00"
                    />
                  ) : (
                    <p className="text-text-primary">{profile?.phone || '-'}</p>
                  )}
                </div>

                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" /> Date de naissance
                  </Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editForm.date_of_birth || ''}
                      onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                      className="bg-background border-white/10"
                    />
                  ) : (
                    <p className="text-text-primary">
                      {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('fr-FR') : '-'}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" /> Ville
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editForm.city || ''}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="bg-background border-white/10"
                    />
                  ) : (
                    <p className="text-text-primary">{profile?.city || '-'}</p>
                  )}
                </div>

                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" /> Pays
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editForm.country || 'France'}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="bg-background border-white/10"
                    />
                  ) : (
                    <p className="text-text-primary">{profile?.country || 'France'}</p>
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
                    className="bg-background border-white/10 min-h-[100px]"
                    placeholder="Présentez-vous en quelques mots..."
                  />
                ) : (
                  <p className="text-text-secondary">{profile?.bio || 'Aucune présentation'}</p>
                )}
              </div>
            </div>

            {/* Affectations - Conditional based on role */}
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <h3 className="font-oswald text-lg text-text-primary uppercase mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Affectations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grade - visible for all */}
                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4" /> Grade
                  </Label>
                  <p className="text-text-primary">{profile?.belt_grade || 'Non défini'}</p>
                  <p className="text-xs text-text-muted mt-1">Modifiable uniquement par un administrateur</p>
                </div>

                {/* Role - read only */}
                <div>
                  <Label className="text-text-muted flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4" /> Rôle
                  </Label>
                  <p className="text-text-primary">{roleConfig.label}</p>
                  <p className="text-xs text-text-muted mt-1">Modifiable uniquement par un administrateur</p>
                </div>

                {/* Club - for membres and instructeurs */}
                {(profile?.role === 'membre' || profile?.role === 'instructeur') && (
                  <div>
                    <Label className="text-text-muted flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4" /> Club
                    </Label>
                    <p className="text-text-primary">
                      {profile?.club_id ? getClubName(profile.club_id) : (profile?.club_name || 'Non assigné')}
                    </p>
                  </div>
                )}

                {/* Instructor - for membres */}
                {profile?.role === 'membre' && (
                  <div>
                    <Label className="text-text-muted flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4" /> Instructeur référent
                    </Label>
                    <p className="text-text-primary">
                      {profile?.instructor_id ? getUserName(profile.instructor_id, instructors) : (profile?.instructor_name || 'Non assigné')}
                    </p>
                  </div>
                )}

                {/* DT - for instructeurs */}
                {profile?.role === 'instructeur' && (
                  <div>
                    <Label className="text-text-muted flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4" /> Directeur Technique
                    </Label>
                    <p className="text-text-primary">
                      {profile?.technical_director_id ? getUserName(profile.technical_director_id, technicalDirectors) : 'Non assigné'}
                    </p>
                  </div>
                )}

                {/* Region - for DT */}
                {(profile?.role === 'directeur_technique' || profile?.role === 'directeur_national') && (
                  <div className="md:col-span-2">
                    <Label className="text-text-muted flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" /> Zone de responsabilité
                    </Label>
                    <p className="text-text-primary">{profile?.region || profile?.country || 'Non définie'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <h3 className="font-oswald text-lg text-text-primary uppercase mb-6">
                Informations du compte
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-text-muted mb-2 block">Date d'inscription</Label>
                  <p className="text-text-primary">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-text-muted mb-2 block">Statut adhésion</Label>
                  <p className="text-text-primary">{profile?.membership_status || 'Actif'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Nouveau mot de passe</Label>
                  <Input
                    type="password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Confirmer le nouveau mot de passe</Label>
                  <Input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="mt-1 bg-background border-white/10"
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
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
