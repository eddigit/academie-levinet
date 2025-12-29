import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Phone, Mail, Users, Award, Calendar, 
  ArrowLeft, Loader2, Building2, Shield, Clock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../utils/api';
import { getFlag, disciplines as disciplinesList } from '../utils/countries';
import UserAvatar from '../components/UserAvatar';
import PublicLayout from '../components/PublicLayout';

const ClubDetailPage = () => {
  const { clubId } = useParams();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClub();
  }, [clubId]);

  const fetchClub = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/clubs/${clubId}`);
      const data = response.data || response;
      setClub(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching club:', err);
      setError('Club non trouvé');
    } finally {
      setLoading(false);
    }
  };

  // Generate Google Maps embed URL from address
  const getMapUrl = () => {
    if (!club?.address && !club?.city) return null;
    const address = encodeURIComponent(`${club.address || ''} ${club.city || ''} ${club.country || ''}`);
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${address}`;
  };

  // Get discipline info
  const getDisciplineInfo = (code) => {
    const discipline = disciplinesList.find(d => d.code === code);
    return discipline || { name: code, color: 'bg-gray-500' };
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !club) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
          <Building2 className="w-16 h-16 text-gray-500" />
          <h1 className="text-2xl font-oswald text-text-primary">{error || 'Club non trouvé'}</h1>
          <Link to="/trouver-club">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la liste des clubs
            </Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <Link to="/trouver-club" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste des clubs
          </Link>

          {/* Club Header */}
          <div className="bg-card border border-border rounded-xl p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Club Logo */}
              <div className="flex-shrink-0">
                {club.logo_url ? (
                  <img 
                    src={club.logo_url} 
                    alt={club.name}
                    className="w-32 h-32 rounded-xl object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <Building2 className="w-16 h-16 text-primary" />
                  </div>
                )}
              </div>

              {/* Club Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{getFlag(club.country_code)}</span>
                  <h1 className="text-2xl md:text-3xl font-oswald font-bold text-text-primary">
                    {club.name}
                  </h1>
                </div>

                <div className="flex flex-wrap gap-4 text-text-secondary mt-4">
                  {club.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{club.address}, {club.city}</span>
                    </div>
                  )}
                  {!club.address && club.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{club.city}, {club.country}</span>
                    </div>
                  )}
                  {club.phone && (
                    <a href={`tel:${club.phone}`} className="flex items-center gap-2 hover:text-primary">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{club.phone}</span>
                    </a>
                  )}
                  {club.email && (
                    <a href={`mailto:${club.email}`} className="flex items-center gap-2 hover:text-primary">
                      <Mail className="w-4 h-4 text-primary" />
                      <span>{club.email}</span>
                    </a>
                  )}
                </div>

                {/* Disciplines */}
                {club.disciplines && club.disciplines.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {club.disciplines.map((code) => {
                      const disc = getDisciplineInfo(code);
                      return (
                        <span 
                          key={code}
                          className={`px-3 py-1 rounded-full text-sm font-medium text-white ${disc.color}`}
                        >
                          {disc.name}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-text-primary font-semibold">{club.member_count || 0}</span>
                    <span className="text-text-secondary">membres</span>
                  </div>
                  {club.instructors && club.instructors.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      <span className="text-text-primary font-semibold">{club.instructors.length}</span>
                      <span className="text-text-secondary">instructeur(s)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Schedule */}
              {club.schedule && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-xl font-oswald font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Horaires
                  </h2>
                  <div className="text-text-secondary whitespace-pre-line">
                    {club.schedule}
                  </div>
                </div>
              )}

              {/* Map */}
              {(club.address || club.city) && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-xl font-oswald font-bold text-text-primary mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Localisation
                  </h2>
                  <div className="aspect-video rounded-lg overflow-hidden border border-border">
                    <iframe
                      src={`https://www.google.com/maps?q=${encodeURIComponent(`${club.address || ''} ${club.city || ''} ${club.country || ''}`)}&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Localisation de ${club.name}`}
                    />
                  </div>
                  <p className="text-text-secondary mt-3">
                    {club.address && `${club.address}, `}{club.city}, {club.country}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Technical Directors */}
              {club.technical_director_ids && club.technical_director_ids.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-xl font-oswald font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Direction Technique
                  </h2>
                  <div className="space-y-3">
                    {(club.technical_directors || []).map((director) => (
                      <div key={director.id} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                        <UserAvatar user={director} size="md" />
                        <div>
                          <p className="text-text-primary font-medium">{director.full_name}</p>
                          <p className="text-text-secondary text-sm">Directeur Technique</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructors */}
              {club.instructors && club.instructors.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-xl font-oswald font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Instructeurs
                  </h2>
                  <div className="space-y-3">
                    {club.instructors.map((instructor) => (
                      <div key={instructor.id} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                        <UserAvatar user={instructor} size="md" />
                        <div>
                          <p className="text-text-primary font-medium">{instructor.full_name}</p>
                          {instructor.belt_grade && (
                            <p className="text-text-secondary text-sm">{instructor.belt_grade}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Members Preview */}
              {club.members && club.members.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-xl font-oswald font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Membres ({club.members.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {club.members.slice(0, 9).map((member) => (
                      <div key={member.id} className="flex items-center gap-2 p-2 bg-background rounded-lg">
                        <UserAvatar user={member} size="sm" />
                        <div className="overflow-hidden">
                          <p className="text-text-primary text-sm font-medium truncate">
                            {member.full_name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {club.members.length > 9 && (
                    <p className="text-text-secondary text-sm mt-3 text-center">
                      Et {club.members.length - 9} autres membres...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link to="/onboarding">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Rejoindre ce club
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ClubDetailPage;
