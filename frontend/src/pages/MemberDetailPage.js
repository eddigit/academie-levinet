import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Award, User, MessageSquare, RefreshCw, Trash2, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
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

const MemberDetailPage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingConversation, setStartingConversation] = useState(false);

  useEffect(() => {
    fetchMember();
  }, [memberId]);

  const fetchMember = async () => {
    try {
      const response = await api.get(`/members/${memberId}`);
      setMember(response.data);
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
        await api.delete(`/members/${memberId}`);
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
    toast.info('Fonctionnalité de renouvellement à venir');
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
              onClick={() => toast.info('Édition à venir')}
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
                  <span className="font-oswald uppercase tracking-wide font-bold">
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
    </div>
  );
};

export default MemberDetailPage;
