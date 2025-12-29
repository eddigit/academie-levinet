import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, Euro, User, Loader2, Check, UserPlus, UserMinus } from 'lucide-react';
import { Button } from './ui/button';
import UserAvatar, { UserAvatarGroup } from './UserAvatar';
import api from '../utils/api';
import { toast } from 'sonner';

const EventDetailModal = ({ event, isOpen, onClose, currentUser, onUpdate }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      fetchParticipants();
      checkRegistration();
    }
  }, [isOpen, event]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/events/${event.id}/registrations`);
      setParticipants(response.data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
    setLoading(false);
  };

  const checkRegistration = async () => {
    try {
      const response = await api.get('/my-registrations');
      const myRegistrations = response.data || [];
      setIsRegistered(myRegistrations.some(r => r.event_id === event.id));
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await api.post(`/events/${event.id}/register`);
      toast.success('Inscription confirmée !');
      setIsRegistered(true);
      fetchParticipants();
      onUpdate && onUpdate();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erreur lors de l\'inscription';
      toast.error(message);
    }
    setRegistering(false);
  };

  const handleUnregister = async () => {
    if (!window.confirm('Voulez-vous vraiment vous désinscrire de cet événement ?')) return;

    setRegistering(true);
    try {
      await api.delete(`/events/${event.id}/register`);
      toast.success('Désinscription confirmée');
      setIsRegistered(false);
      fetchParticipants();
      onUpdate && onUpdate();
    } catch (error) {
      toast.error('Erreur lors de la désinscription');
    }
    setRegistering(false);
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'Stage': 'bg-primary/20 text-primary',
      'Cours': 'bg-accent/20 text-accent',
      'Competition': 'bg-secondary/20 text-secondary',
      'Examen de Grade': 'bg-purple-500/20 text-purple-500',
      'Seminaire': 'bg-green-500/20 text-green-500',
      'Workshop': 'bg-yellow-500/20 text-yellow-500'
    };
    return colors[type] || 'bg-text-muted/20 text-text-muted';
  };

  const spotsLeft = event?.max_participants
    ? event.max_participants - (event.current_participants || 0)
    : null;

  const isFull = spotsLeft !== null && spotsLeft <= 0;

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          {event.image_url ? (
            <div className="h-48 overflow-hidden">
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-paper to-transparent" />
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20" />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Event Info */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                {event.event_type}
              </span>
              {event.price > 0 && (
                <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium flex items-center gap-1">
                  <Euro className="w-3 h-3" />
                  {event.price}
                </span>
              )}
              {event.status && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.status === 'A venir' ? 'bg-green-500/20 text-green-500' :
                  event.status === 'En cours' ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-text-muted/20 text-text-muted'
                }`}>
                  {event.status}
                </span>
              )}
            </div>

            <h2 className="font-oswald text-2xl md:text-3xl font-bold text-text-primary uppercase">
              {event.title}
            </h2>

            <p className="text-text-secondary mt-3">{event.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-text-muted">Date</p>
                <p className="text-text-primary text-sm">{event.start_date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-text-muted">Horaires</p>
                <p className="text-text-primary text-sm">{event.start_time} - {event.end_time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg col-span-2">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-text-muted">Lieu</p>
                <p className="text-text-primary text-sm">{event.location}</p>
                <p className="text-text-muted text-xs">{event.city}, {event.country}</p>
              </div>
            </div>

            {event.instructor && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg col-span-2">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-text-muted">Instructeur</p>
                  <p className="text-text-primary text-sm">{event.instructor}</p>
                </div>
              </div>
            )}
          </div>

          {/* Registration Status */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-oswald text-text-primary uppercase">Participants</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-oswald font-bold text-primary">
                  {participants.length}
                </span>
                {event.max_participants && (
                  <span className="text-text-muted text-sm">/{event.max_participants}</span>
                )}
              </div>
            </div>

            {/* Progress bar if max participants */}
            {event.max_participants && (
              <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all ${isFull ? 'bg-secondary' : 'bg-primary'}`}
                  style={{ width: `${Math.min((participants.length / event.max_participants) * 100, 100)}%` }}
                />
              </div>
            )}

            {/* Participants list */}
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : participants.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {participants.map((p, idx) => (
                  <div key={p.id || idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                    <UserAvatar user={{ full_name: p.member_name, photo_url: p.photo_url }} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm truncate">{p.member_name}</p>
                      {p.grade && <p className="text-text-muted text-xs">{p.grade}</p>}
                    </div>
                    {p.member_id === currentUser?.id && (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">Vous</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-center py-4 text-sm">Aucun participant pour le moment</p>
            )}
          </div>

          {/* Registration Button */}
          {currentUser && (
            <div className="pt-4 border-t border-white/10">
              {isRegistered ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 text-green-500">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Vous êtes inscrit(e)</span>
                  </div>
                  <Button
                    onClick={handleUnregister}
                    disabled={registering}
                    variant="outline"
                    className="border-secondary/50 text-secondary hover:bg-secondary/10"
                  >
                    {registering ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UserMinus className="w-4 h-4 mr-2" />
                    )}
                    Se desinscrire
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleRegister}
                  disabled={registering || isFull}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-oswald uppercase"
                >
                  {registering ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Inscription en cours...</>
                  ) : isFull ? (
                    <>Complet</>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-2" /> S'inscrire à cet événement</>
                  )}
                </Button>
              )}

              {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 5 && !isRegistered && (
                <p className="text-center text-yellow-500 text-sm mt-2">
                  Plus que {spotsLeft} place{spotsLeft > 1 ? 's' : ''} disponible{spotsLeft > 1 ? 's' : ''} !
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
