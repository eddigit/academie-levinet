import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../utils/api';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Award, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const MemberDetailPage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMember();
  }, [memberId]);

  const fetchMember = async () => {
    try {
      const data = await api.getMember(memberId);
      setMember(data);
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
        await api.deleteMember(memberId);
        toast.success('Membre supprimé avec succès');
        navigate('/members');
      } catch (error) {
        console.error('Error deleting member:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-primary font-oswald text-xl">Chargement...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!member) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary font-manrope">Membre non trouvé</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="member-detail-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/members')} 
              data-testid="back-button"
              variant="outline" 
              className="border-border text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Button>
            <div>
              <h1 className="font-oswald text-4xl font-bold text-text-primary uppercase tracking-wide" data-testid="member-name">
                {member.first_name} {member.last_name}
              </h1>
              <p className="text-text-secondary font-manrope mt-2">Profil du membre</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button data-testid="delete-button" variant="destructive" onClick={handleDelete} className="bg-secondary/20 hover:bg-secondary/30 text-secondary">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="stat-card text-center" data-testid="profile-card">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center">
                <span className="text-5xl font-oswald font-bold text-white">
                  {member.first_name[0]}{member.last_name[0]}
                </span>
              </div>
              <h2 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-2">
                {member.first_name} {member.last_name}
              </h2>
              <p className="text-text-secondary font-manrope mb-4">{member.email}</p>
              <div className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-manrope font-medium mb-6">
                {member.belt_grade}
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-manrope font-medium ml-2 ${
                member.membership_status === 'Actif' ? 'bg-primary/20 text-primary' :
                member.membership_status === 'Expiré' ? 'bg-secondary/20 text-secondary' :
                'bg-text-muted/20 text-text-muted'
              }`}>
                {member.membership_status}
              </div>
            </div>

            {/* Contact Info */}
            <div className="stat-card" data-testid="contact-info">
              <h3 className="font-oswald text-lg font-bold text-text-primary uppercase mb-4 tracking-wide">
                Informations de Contact
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-xs text-text-muted font-manrope uppercase tracking-wide mb-1">Email</p>
                    <p className="text-text-primary font-manrope">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-xs text-text-muted font-manrope uppercase tracking-wide mb-1">Téléphone</p>
                    <p className="text-text-primary font-manrope">{member.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-xs text-text-muted font-manrope uppercase tracking-wide mb-1">Localisation</p>
                    <p className="text-text-primary font-manrope">{member.city}, {member.country}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-xs text-text-muted font-manrope uppercase tracking-wide mb-1">Date de naissance</p>
                    <p className="text-text-primary font-manrope">{member.date_of_birth}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Membership Info */}
            <div className="stat-card" data-testid="membership-info">
              <h3 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-6 tracking-wide">
                Adhésion
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-background/50 rounded-lg border border-white/5">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide mb-2">Type d'adhésion</p>
                  <p className="text-xl font-oswald font-bold text-text-primary">{member.membership_type}</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-white/5">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide mb-2">Statut</p>
                  <p className="text-xl font-oswald font-bold text-text-primary">{member.membership_status}</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-white/5">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide mb-2">Date de début</p>
                  <p className="text-xl font-oswald font-bold text-text-primary">{member.membership_start_date}</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border border-white/5">
                  <p className="text-xs text-text-muted font-manrope uppercase tracking-wide mb-2">Date de fin</p>
                  <p className="text-xl font-oswald font-bold text-text-primary">{member.membership_end_date}</p>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="stat-card" data-testid="performance-stats">
              <h3 className="font-oswald text-2xl font-bold text-text-primary uppercase mb-6 tracking-wide">
                Performances
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-background/50 rounded-lg border border-white/5">
                  <Award className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-3xl font-oswald font-bold text-text-primary mb-2">{member.belt_grade}</p>
                  <p className="text-sm text-text-secondary font-manrope">Grade actuel</p>
                </div>
                <div className="text-center p-6 bg-background/50 rounded-lg border border-white/5">
                  <Calendar className="w-8 h-8 text-accent mx-auto mb-3" />
                  <p className="text-3xl font-oswald font-bold text-text-primary mb-2">{member.sessions_attended}</p>
                  <p className="text-sm text-text-secondary font-manrope">Sessions</p>
                </div>
                <div className="text-center p-6 bg-background/50 rounded-lg border border-white/5">
                  <Award className="w-8 h-8 text-secondary mx-auto mb-3" />
                  <p className="text-3xl font-oswald font-bold text-text-primary mb-2">5</p>
                  <p className="text-sm text-text-secondary font-manrope">Victoires</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberDetailPage;