import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api, { getErrorMessage } from '../utils/api';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Award, User, MessageSquare, RefreshCw, Trash2, Edit, X, Save, Loader2, Upload, Link } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

// Belt grade to color mapping
const beltColors = {
  'Ceinture Blanche': { bg: 'from-gray-100 to-white', ring: 'ring-gray-200', text: 'text-gray-800', accent: '#E5E7EB', badgeBg: '#E5E7EB', badgeText: '#1F2937' },
  'Ceinture Jaune': { bg: 'from-yellow-400 to-yellow-300', ring: 'ring-yellow-400', text: 'text-yellow-900', accent: '#FBBF24', badgeBg: '#FBBF24', badgeText: '#1F2937' },
  'Ceinture Orange': { bg: 'from-orange-500 to-orange-400', ring: 'ring-orange-500', text: 'text-orange-900', accent: '#F97316', badgeBg: '#F97316', badgeText: '#FFFFFF' },
  'Ceinture Verte': { bg: 'from-green-500 to-green-400', ring: 'ring-green-500', text: 'text-green-900', accent: '#22C55E', badgeBg: '#22C55E', badgeText: '#FFFFFF' },
  'Ceinture Bleue': { bg: 'from-blue-500 to-blue-400', ring: 'ring-blue-500', text: 'text-blue-900', accent: '#3B82F6', badgeBg: '#3B82F6', badgeText: '#FFFFFF' },
  'Ceinture Marron': { bg: 'from-amber-700 to-amber-600', ring: 'ring-amber-700', text: 'text-amber-100', accent: '#B45309', badgeBg: '#B45309', badgeText: '#FFFFFF' },
  'Ceinture Noire': { bg: 'from-gray-900 to-gray-800', ring: 'ring-gray-900', text: 'text-white', accent: '#374151', badgeBg: '#1F2937', badgeText: '#FFFFFF' },
};

const getBeltColor = (grade) => {
  return beltColors[grade] || beltColors['Ceinture Blanche'];
};

// Belt grade options
const beltGrades = [
  'Ceinture Blanche',
  'Ceinture Jaune',
  'Ceinture Orange',
  'Ceinture Verte',
  'Ceinture Bleue',
  'Ceinture Marron',
  'Ceinture Noire',
  'Ceinture Noire 1er Dan',
  'Ceinture Noire 2ème Dan',
  'Ceinture Noire 3ème Dan',
  'Ceinture Noire 4ème Dan',
  'Ceinture Noire 5ème Dan',
];

// Membership types
const membershipTypes = ['Standard', 'Premium', 'VIP', 'Instructeur', 'Directeur Technique'];

// Membership statuses
const membershipStatuses = ['Actif', 'Inactif', 'Suspendu', 'Expiré'];

// Rôle labels
const roleLabels = {
  'admin': 'Administrateur',
  'fondateur': 'Fondateur',
  'directeur_national': 'Directeur National',
  'directeur_technique': 'Directeur Technique',
  'instructeur': 'Instructeur',
  'membre': 'Membre'
};

const MemberDetailPage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingConversation, setStartingConversation] = useState(false);

  // Listes pour les affectations
  const [clubs, setClubs] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [technicalDirectors, setTechnicalDirectors] = useState([]);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMember();
    fetchAffectations();
  }, [memberId]);

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

  const fetchMember = async () => {
    try {
      const response = await api.get(`/admin/users/${memberId}`);
      const userData = response.data;
      // Extraire first_name/last_name de full_name si absent
      if (userData.full_name && !userData.first_name) {
        const parts = userData.full_name.split(' ', 1);
        userData.first_name = parts[0] || '';
        userData.last_name = userData.full_name.substring(parts[0].length + 1) || '';
      }
      setMember(userData);
    } catch (error) {
      console.error('Error fetching member:', error);
      toast.error('Erreur lors du chargement du membre');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre?')) {
      try {
        await api.delete(`/admin/users/${memberId}`);
        toast.success('Membre supprimé avec succès');
        navigate('/members');
      } catch (error) {
        console.error('Error deleting member:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleSendMessage = async () => {
    setStartingConversation(true);
    try {
      // Create or get existing conversation with this member
      const response = await api.post('/conversations', { recipient_id: member.id });
      // Navigate to messages page with this conversation
      navigate('/messages', { state: { conversationId: response.data.id } });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
    } finally {
      setStartingConversation(false);
    }
  };

  const handleRenewMembership = () => {
    // Open edit modal with membership section focused
    handleEditMember();
    toast.info('Modifiez les dates d\'adhésion pour renouveler');
  };

  const handleEditMember = () => {
    setEditForm({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      email: member.email || '',
      phone: member.phone || '',
      city: member.city || '',
      country: member.country || 'France',
      date_of_birth: member.date_of_birth || '',
      belt_grade: member.belt_grade || 'Ceinture Blanche',
      membership_type: member.membership_type || 'Standard',
      membership_status: member.membership_status || 'Actif',
      membership_start_date: member.membership_start_date || '',
      membership_end_date: member.membership_end_date || '',
      photo_url: member.photo_url || '',
      role: member.role || 'membre',
      club_id: member.club_id || '',
      instructor_id: member.instructor_id || '',
      technical_director_id: member.technical_director_id || '',
    });
    setIsEditOpen(true);
  };

  // Helper pour obtenir le nom d'un club par son ID
  const getClubName = (clubId) => {
    const club = clubs.find(c => (c.id || c._id) === clubId);
    return club ? club.name : 'Non assigné';
  };

  // Helper pour obtenir le nom d'un utilisateur par son ID
  const getUserName = (userId, userList) => {
    const user = userList.find(u => (u.id || u._id) === userId);
    return user ? user.full_name : 'Non assigné';
  };

  const validatePhotoUrl = (url) => {
    if (!url) return true; // Empty is ok
    // Block blob: URLs - they are temporary and won't work
    if (url.startsWith('blob:')) {
      toast.error('Les URLs "blob:" ne sont pas supportées. Utilisez une URL directe (https://...)');
      return false;
    }
    // Allow data: URLs (base64 images from uploads) - no size limit here, validated during upload
    if (url.startsWith('data:')) {
      return true;
    }
    // Check for valid URL format
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error('L\'URL doit commencer par http:// ou https://');
      return false;
    }
    return true;
  };

  const handleFileSelect = async (e) => {
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
    
    // Log file info for debugging
    console.log(`Uploading: ${file.name} (${(file.size / 1024).toFixed(1)} Ko)`);
    
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target.result.split(',')[1];
          const response = await api.post('/upload/photo', {
            photo_base64: base64,
            filename: file.name
          });
          setEditForm({ ...editForm, photo_url: response.data.photo_url });
          toast.success('Photo uploadée');
        } catch (error) {
          console.error('Error uploading photo:', error);
          toast.error('Erreur lors de l\'upload');
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

  const handleSaveMember = async () => {
    // Validate photo URL before saving
    if (!validatePhotoUrl(editForm.photo_url)) {
      return;
    }

    setSaving(true);
    try {
      // Construire full_name à partir de first_name et last_name
      const updateData = {
        ...editForm,
        full_name: `${editForm.first_name} ${editForm.last_name}`.trim()
      };
      await api.put(`/admin/users/${memberId}`, updateData);
      setMember({ ...member, ...editForm });
      setIsEditOpen(false);
      toast.success('Membre mis à jour avec succès');
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error(getErrorMessage(error, 'Erreur lors de la mise à jour'));
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <User className="w-16 h-16 text-text-muted mx-auto mb-4" strokeWidth={1} />
            <p className="text-text-secondary font-manrope text-lg">Membre non trouvé</p>
            <Button onClick={() => navigate('/members')} variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux membres
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const beltStyle = getBeltColor(member.belt_grade);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-6" data-testid="member-detail-page">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/members')} 
              variant="ghost"
              className="text-text-secondary hover:text-text-primary"
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5 mr-2" strokeWidth={1.5} /> Retour
            </Button>
            <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide">
              Fiche Adhérent
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="text-text-secondary hover:text-text-primary"
              onClick={handleEditMember}
            >
              <Edit className="w-5 h-5" strokeWidth={1.5} />
            </Button>
            <Button 
              variant="ghost" 
              className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
              onClick={handleDelete}
              data-testid="delete-button"
            >
              <Trash2 className="w-5 h-5" strokeWidth={1.5} />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Profile Photo with Belt Color Background */}
          <div className="lg:col-span-5">
            <div className="bg-paper rounded-xl border border-white/5 overflow-hidden" data-testid="profile-card">
              {/* Belt Color Background with Photo */}
              <div 
                className={`relative h-80 bg-gradient-to-br ${beltStyle.bg} flex items-center justify-center overflow-hidden`}
                style={{ background: `radial-gradient(circle at center, ${beltStyle.accent}40 0%, ${beltStyle.accent}20 30%, transparent 70%)` }}
              >
                {/* Concentric circles decoration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-72 h-72 rounded-full border-2 opacity-20"
                    style={{ borderColor: beltStyle.accent }}
                  ></div>
                  <div 
                    className="absolute w-56 h-56 rounded-full border-2 opacity-30"
                    style={{ borderColor: beltStyle.accent }}
                  ></div>
                  <div 
                    className="absolute w-40 h-40 rounded-full border-2 opacity-40"
                    style={{ borderColor: beltStyle.accent }}
                  ></div>
                </div>
                
                {/* Profile Photo */}
                <div 
                  className={`relative z-10 w-48 h-48 rounded-xl overflow-hidden border-4 shadow-2xl`}
                  style={{ borderColor: beltStyle.accent }}
                >
                  {member.photo_url ? (
                    <img 
                      src={member.photo_url} 
                      alt={`${member.first_name} ${member.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-6xl font-oswald font-bold text-white">
                        {member.first_name[0]}{member.last_name[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Grade Badge */}
              <div className="p-4 text-center bg-paper border-t border-white/5">
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ backgroundColor: beltStyle.badgeBg, color: beltStyle.badgeText }}
                >
                  <Award className="w-5 h-5" strokeWidth={1.5} />
                  <span className="font-oswald uppercase leading-none tracking-wide font-bold">
                    Grade: SPK - {member.belt_grade}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-t border-white/5 flex gap-3">
                <Button 
                  onClick={handleSendMessage}
                  disabled={startingConversation}
                  className="flex-1 bg-primary hover:bg-primary-dark"
                >
                  <MessageSquare className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  {startingConversation ? 'Chargement...' : 'Envoyer un Message'}
                </Button>
              </div>
            </div>

            {/* Other Members Carousel (placeholder) */}
            <div className="mt-6 bg-paper rounded-xl border border-white/5 p-4">
              <h4 className="font-oswald text-sm text-text-muted uppercase tracking-wide mb-3">
                Autres Adhérents
              </h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i} 
                    className="w-12 h-12 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center"
                  >
                    <User className="w-6 h-6 text-text-muted" strokeWidth={1} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Information Sections */}
          <div className="lg:col-span-7 space-y-6">
            {/* Informations Personnelles */}
            <div className="bg-paper rounded-xl border border-white/5 p-6" data-testid="personal-info">
              <h3 className="font-oswald text-xl font-bold text-text-primary uppercase mb-6 tracking-wide">
                Informations Personnelles
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Nom</p>
                  <p className="text-lg text-text-primary font-manrope">{member.last_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Prénom</p>
                  <p className="text-lg text-text-primary font-manrope">{member.first_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Date de naissance</p>
                  <p className="text-lg text-text-primary font-manrope">{member.date_of_birth || 'Non renseigné'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Email</p>
                  <p className="text-lg text-text-primary font-manrope flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    {member.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Téléphone</p>
                  <p className="text-lg text-text-primary font-manrope flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    {member.phone || 'Non renseigné'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Localisation</p>
                  <p className="text-lg text-text-primary font-manrope flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    {member.city}, {member.country}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Type</p>
                  <p className="text-lg text-text-primary font-manrope">{member.membership_type || 'Standard'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Rôle</p>
                  <p className="text-lg text-text-primary font-manrope">{roleLabels[member.role] || 'Membre'}</p>
                </div>
              </div>
            </div>

            {/* Affectations */}
            <div className="bg-paper rounded-xl border border-white/5 p-6" data-testid="affectations-info">
              <h3 className="font-oswald text-xl font-bold text-text-primary uppercase mb-6 tracking-wide">
                Affectations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(member.role === 'membre' || member.role === 'instructeur') && (
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Club</p>
                    <p className="text-lg text-text-primary font-manrope">
                      {member.club_id ? getClubName(member.club_id) : 'Non assigné'}
                    </p>
                  </div>
                )}

                {member.role === 'membre' && (
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Instructeur référent</p>
                    <p className="text-lg text-text-primary font-manrope">
                      {member.instructor_id ? getUserName(member.instructor_id, instructors) : 'Non assigné'}
                    </p>
                  </div>
                )}

                {member.role === 'instructeur' && (
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Directeur Technique</p>
                    <p className="text-lg text-text-primary font-manrope">
                      {member.technical_director_id ? getUserName(member.technical_director_id, technicalDirectors) : 'Non assigné'}
                    </p>
                  </div>
                )}

                {(member.role === 'directeur_technique' || member.role === 'directeur_national') && (
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Zone de responsabilité</p>
                    <p className="text-lg text-text-primary font-manrope">
                      {member.region || member.country || 'Non définie'}
                    </p>
                  </div>
                )}

                {(member.role === 'admin' || member.role === 'fondateur') && (
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Accès</p>
                    <p className="text-lg text-text-primary font-manrope">
                      Accès complet à l'administration
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Adhésion */}
            <div className="bg-paper rounded-xl border border-white/5 p-6" data-testid="membership-info">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-oswald text-xl font-bold text-text-primary uppercase tracking-wide">
                  Adhésion
                </h3>
                <div className={`px-3 py-1 rounded-full text-sm font-manrope ${
                  member.membership_status === 'Actif' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {member.membership_status || 'Actif'}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Statut</p>
                  <p className="text-lg text-text-primary font-manrope">{member.membership_status || 'Actif'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Type</p>
                  <p className="text-lg text-text-primary font-manrope">{member.membership_type || 'Annuelle'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Date début</p>
                  <p className="text-lg text-text-primary font-manrope flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    {member.membership_start_date || 'Non renseigné'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide">Date fin</p>
                  <p className="text-lg text-text-primary font-manrope flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                    {member.membership_end_date || 'Non renseigné'}
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleRenewMembership}
                className="w-full md:w-auto bg-primary hover:bg-primary-dark"
              >
                <RefreshCw className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Renouveler
              </Button>
            </div>

            {/* Historique des Cours (placeholder) */}
            <div className="bg-paper rounded-xl border border-white/5 p-6">
              <h3 className="font-oswald text-xl font-bold text-text-primary uppercase mb-6 tracking-wide">
                Historique des Cours
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-text-primary font-manrope">Stage SPK Avancé</p>
                    <p className="text-xs text-text-muted">15/12/2025</p>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Présent</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-text-primary font-manrope">Cours Hebdomadaire</p>
                    <p className="text-xs text-text-muted">12/12/2025</p>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Présent</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-text-primary font-manrope">Passage de Grade</p>
                    <p className="text-xs text-text-muted">01/12/2025</p>
                  </div>
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">Réussi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Member Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-paper rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-oswald text-2xl font-bold text-text-primary uppercase tracking-wide">
                Modifier le Membre
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditOpen(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Personal Info Section */}
              <div>
                <h3 className="font-oswald text-lg font-bold text-text-primary uppercase mb-4 tracking-wide">
                  Informations Personnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-text-secondary">Prénom</Label>
                    <Input
                      id="first_name"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-text-secondary">Nom</Label>
                    <Input
                      id="last_name"
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-text-secondary">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-text-secondary">Téléphone</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth" className="text-text-secondary">Date de naissance</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={editForm.date_of_birth}
                      onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-text-secondary">Photo de profil</Label>
                    
                    {/* Photo preview */}
                    {editForm.photo_url && (
                      <div className="flex items-center gap-4 mb-3">
                        <img 
                          src={editForm.photo_url} 
                          alt="Preview" 
                          className="w-16 h-16 rounded-lg object-cover border border-white/10"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditForm({ ...editForm, photo_url: '' })}
                          className="text-red-400 hover:text-red-500"
                        >
                          Supprimer
                        </Button>
                      </div>
                    )}
                    
                    {/* Upload buttons */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="flex-1 border-white/10"
                      >
                        {uploadingPhoto ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {uploadingPhoto ? 'Upload...' : 'Télécharger'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const url = window.prompt('Entrez l\'URL de la photo:');
                          if (url && validatePhotoUrl(url)) {
                            setEditForm({ ...editForm, photo_url: url });
                          }
                        }}
                        className="flex-1 border-white/10"
                      >
                        <Link className="w-4 h-4 mr-2" />
                        URL
                      </Button>
                    </div>
                    
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    <p className="text-xs text-text-muted">
                      JPG, PNG, GIF, WebP (max 5 Mo)
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div>
                <h3 className="font-oswald text-lg font-bold text-text-primary uppercase mb-4 tracking-wide">
                  Localisation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-text-secondary">Ville</Label>
                    <Input
                      id="city"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-text-secondary">Pays</Label>
                    <Input
                      id="country"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
              </div>

              {/* Affectations Section */}
              <div>
                <h3 className="font-oswald text-lg font-bold text-text-primary uppercase mb-4 tracking-wide">
                  Affectations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Rôle</Label>
                    <Select
                      value={editForm.role || 'membre'}
                      onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="fondateur">Fondateur</SelectItem>
                        <SelectItem value="directeur_national">Directeur National</SelectItem>
                        <SelectItem value="directeur_technique">Directeur Technique</SelectItem>
                        <SelectItem value="instructeur">Instructeur</SelectItem>
                        <SelectItem value="membre">Membre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(editForm.role === 'membre' || editForm.role === 'instructeur') && (
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Club</Label>
                      <Select
                        value={editForm.club_id || '_none'}
                        onValueChange={(value) => setEditForm({ ...editForm, club_id: value === '_none' ? '' : value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Sélectionner un club" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">Aucun</SelectItem>
                          {clubs.map((club) => (
                            <SelectItem key={club.id || club._id} value={club.id || club._id}>
                              {club.name} {club.city && `(${club.city})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {editForm.role === 'membre' && (
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Instructeur référent</Label>
                      <Select
                        value={editForm.instructor_id || '_none'}
                        onValueChange={(value) => setEditForm({ ...editForm, instructor_id: value === '_none' ? '' : value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Sélectionner un instructeur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">Aucun</SelectItem>
                          {instructors.map((instr) => (
                            <SelectItem key={instr.id || instr._id} value={instr.id || instr._id}>
                              {instr.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {editForm.role === 'instructeur' && (
                    <div className="space-y-2">
                      <Label className="text-text-secondary">Directeur Technique référent</Label>
                      <Select
                        value={editForm.technical_director_id || '_none'}
                        onValueChange={(value) => setEditForm({ ...editForm, technical_director_id: value === '_none' ? '' : value })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Sélectionner un DT" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">Aucun</SelectItem>
                          {technicalDirectors.map((dt) => (
                            <SelectItem key={dt.id || dt._id} value={dt.id || dt._id}>
                              {dt.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Martial Arts Section */}
              <div>
                <h3 className="font-oswald text-lg font-bold text-text-primary uppercase mb-4 tracking-wide">
                  Grade & Adhésion
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Grade</Label>
                    <Select
                      value={editForm.belt_grade}
                      onValueChange={(value) => setEditForm({ ...editForm, belt_grade: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {beltGrades.map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Type d'adhésion</Label>
                    <Select
                      value={editForm.membership_type}
                      onValueChange={(value) => setEditForm({ ...editForm, membership_type: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {membershipTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-text-secondary">Statut</Label>
                    <Select
                      value={editForm.membership_status}
                      onValueChange={(value) => setEditForm({ ...editForm, membership_status: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {membershipStatuses.map((status) => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Membership Dates Section */}
              <div>
                <h3 className="font-oswald text-lg font-bold text-text-primary uppercase mb-4 tracking-wide">
                  Dates d'Adhésion
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="membership_start_date" className="text-text-secondary">Date de début</Label>
                    <Input
                      id="membership_start_date"
                      type="date"
                      value={editForm.membership_start_date}
                      onChange={(e) => setEditForm({ ...editForm, membership_start_date: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="membership_end_date" className="text-text-secondary">Date de fin</Label>
                    <Input
                      id="membership_end_date"
                      type="date"
                      value={editForm.membership_end_date}
                      onChange={(e) => setEditForm({ ...editForm, membership_end_date: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="border-white/10"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSaveMember}
                disabled={saving}
                className="bg-primary hover:bg-primary-dark"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetailPage;
