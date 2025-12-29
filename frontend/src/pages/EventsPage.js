import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api, { getErrorMessage } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Users, Calendar, MapPin, Clock, Euro, X, Loader2, Eye, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import UserAvatar, { UserAvatarGroup } from '../components/UserAvatar';
import EventDetailModal from '../components/EventDetailModal';

// Rôles autorisés à organiser des événements
const ORGANIZER_ROLES = ['instructeur', 'directeur_technique', 'directeur_national', 'admin', 'fondateur'];

// Labels des rôles pour l'affichage
const ROLE_LABELS = {
  instructeur: 'Instructeur',
  directeur_technique: 'Directeur Technique',
  directeur_national: 'Directeur National',
  admin: 'Administrateur',
  fondateur: 'Fondateur'
};

// Event Modal Component - Extracted outside to prevent re-renders
const EventModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isEdit, 
  saving,
  formData,
  onFieldChange,
  organizers = []
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="font-oswald text-xl text-text-primary uppercase">
            {isEdit ? 'Modifier l\'Événement' : 'Nouvel Événement'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <Label className="text-text-secondary">Titre *</Label>
            <Input
              value={formData.title}
              onChange={(e) => onFieldChange('title', e.target.value)}
              required
              className="mt-1 bg-background border-white/10 text-text-primary"
              placeholder="Nom de l'événement"
            />
          </div>

          <div>
            <Label className="text-text-secondary">Description *</Label>
            <textarea
              value={formData.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              required
              rows={3}
              className="w-full mt-1 px-4 py-3 bg-background border border-white/10 rounded-md text-text-primary font-manrope resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Description de l'événement..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-text-secondary">Type d'événement</Label>
              <Select value={formData.eventType} onValueChange={(val) => onFieldChange('eventType', val)}>
                <SelectTrigger className="mt-1 bg-background border-white/10 text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-paper border-white/10">
                  <SelectItem value="Stage" className="text-text-primary">Stage</SelectItem>
                  <SelectItem value="Cours" className="text-text-primary">Cours</SelectItem>
                  <SelectItem value="Compétition" className="text-text-primary">Compétition</SelectItem>
                  <SelectItem value="Examen de Grade" className="text-text-primary">Examen de Grade</SelectItem>
                  <SelectItem value="Séminaire" className="text-text-primary">Séminaire</SelectItem>
                  <SelectItem value="Workshop" className="text-text-primary">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-text-secondary flex items-center gap-2">
                <User className="w-4 h-4" /> Organisateur / Instructeur
              </Label>
              <Select 
                value={formData.instructor || '_none'} 
                onValueChange={(val) => onFieldChange('instructor', val === '_none' ? '' : val)}
              >
                <SelectTrigger className="mt-1 bg-background border-white/10 text-text-primary">
                  <SelectValue placeholder="Sélectionner un organisateur" />
                </SelectTrigger>
                <SelectContent className="bg-paper border-white/10 max-h-60">
                  <SelectItem value="_none" className="text-text-muted">Aucun</SelectItem>
                  {organizers.map((org) => (
                    <SelectItem key={org.id} value={org.full_name} className="text-text-primary">
                      <span className="flex items-center gap-2">
                        {org.full_name}
                        <span className="text-xs text-text-muted">({ROLE_LABELS[org.role] || org.role})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-text-secondary">Date début *</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => onFieldChange('startDate', e.target.value)}
                required
                className="mt-1 bg-background border-white/10 text-text-primary"
              />
            </div>
            <div>
              <Label className="text-text-secondary">Date fin *</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => onFieldChange('endDate', e.target.value)}
                required
                className="mt-1 bg-background border-white/10 text-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-text-secondary">Heure début</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => onFieldChange('startTime', e.target.value)}
                className="mt-1 bg-background border-white/10 text-text-primary"
              />
            </div>
            <div>
              <Label className="text-text-secondary">Heure fin</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => onFieldChange('endTime', e.target.value)}
                className="mt-1 bg-background border-white/10 text-text-primary"
              />
            </div>
          </div>

          <div>
            <Label className="text-text-secondary">Lieu *</Label>
            <Input
              value={formData.location}
              onChange={(e) => onFieldChange('location', e.target.value)}
              required
              className="mt-1 bg-background border-white/10 text-text-primary"
              placeholder="Nom de la salle ou adresse"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-text-secondary">Ville *</Label>
              <Input
                value={formData.city}
                onChange={(e) => onFieldChange('city', e.target.value)}
                required
                className="mt-1 bg-background border-white/10 text-text-primary"
                placeholder="Paris"
              />
            </div>
            <div>
              <Label className="text-text-secondary">Pays *</Label>
              <Input
                value={formData.country}
                onChange={(e) => onFieldChange('country', e.target.value)}
                required
                className="mt-1 bg-background border-white/10 text-text-primary"
                placeholder="France"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-text-secondary">Participants max</Label>
              <Input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => onFieldChange('maxParticipants', e.target.value)}
                className="mt-1 bg-background border-white/10 text-text-primary"
                placeholder="Illimité si vide"
              />
            </div>
            <div>
              <Label className="text-text-secondary">Prix (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => onFieldChange('price', e.target.value)}
                className="mt-1 bg-background border-white/10 text-text-primary"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label className="text-text-secondary">URL de l'image</Label>
            <Input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => onFieldChange('imageUrl', e.target.value)}
              className="mt-1 bg-background border-white/10 text-text-primary"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/10"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-oswald uppercase"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</>
              ) : (
                isEdit ? 'Mettre à jour' : 'Créer l\'événement'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const initialFormData = {
  title: '',
  description: '',
  eventType: 'Stage',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  location: '',
  city: '',
  country: '',
  instructor: '',
  maxParticipants: '',
  price: '',
  imageUrl: ''
};

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [organizers, setOrganizers] = useState([]);

  // Single form state object to prevent re-renders
  const [formData, setFormData] = useState(initialFormData);
  
  // Handler to update a single field
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      // Récupérer les utilisateurs éligibles pour organiser des événements
      const response = await api.get('/events/organizers');
      const eligibleOrganizers = response.data?.organizers || [];
      setOrganizers(eligibleOrganizers);
    } catch (error) {
      console.error('Error fetching organizers:', error);
      setOrganizers([]);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentEvent(null);
  }, []);

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const openEditModal = (event) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      eventType: event.event_type || 'Stage',
      startDate: event.start_date || '',
      endDate: event.end_date || '',
      startTime: event.start_time || '',
      endTime: event.end_time || '',
      location: event.location || '',
      city: event.city || '',
      country: event.country || '',
      instructor: event.instructor || '',
      maxParticipants: event.max_participants?.toString() || '',
      price: event.price?.toString() || '',
      imageUrl: event.image_url || ''
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    resetForm();
  };

  const openDetailModal = (event) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEvent(null);
  };

  const getFormDataPayload = () => ({
    title: formData.title,
    description: formData.description,
    event_type: formData.eventType,
    start_date: formData.startDate,
    end_date: formData.endDate,
    start_time: formData.startTime,
    end_time: formData.endTime,
    location: formData.location,
    city: formData.city,
    country: formData.country,
    instructor: formData.instructor,
    max_participants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
    price: parseFloat(formData.price) || 0,
    image_url: formData.imageUrl
  });

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.location || !formData.city || !formData.country) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setSaving(true);
    try {
      await api.post('/events', getFormDataPayload());
      toast.success('Événement créé avec succès');
      closeAddModal();
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(getErrorMessage(error, 'Erreur lors de la création'));
    }
    setSaving(false);
  };

  const handleEditEvent = async (e) => {
    e.preventDefault();
    if (!currentEvent) return;
    
    setSaving(true);
    try {
      await api.put(`/events/${currentEvent.id}`, getFormDataPayload());
      toast.success('Événement mis à jour');
      closeEditModal();
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(getErrorMessage(error, 'Erreur lors de la mise à jour'));
    }
    setSaving(false);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement?')) {
      try {
        await api.delete(`/events/${eventId}`);
        toast.success('Événement supprimé');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'Stage': 'bg-primary/20 text-primary',
      'Cours': 'bg-accent/20 text-accent',
      'Compétition': 'bg-secondary/20 text-secondary',
      'Examen de Grade': 'bg-purple-500/20 text-purple-500',
      'Séminaire': 'bg-green-500/20 text-green-500',
      'Workshop': 'bg-yellow-500/20 text-yellow-500'
    };
    return colors[type] || 'bg-text-muted/20 text-text-muted';
  };

  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.status === 'À venir').length,
    ongoing: events.filter(e => e.status === 'En cours').length,
    totalParticipants: events.reduce((sum, e) => sum + (e.current_participants || 0), 0)
  };


  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8" data-testid="events-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-oswald text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary uppercase tracking-wide">
              Calendrier des Événements
            </h1>
            <p className="text-text-secondary font-manrope mt-1 text-sm md:text-base">{events.length} événements</p>
          </div>
          <Button 
            onClick={openAddModal}
            data-testid="add-event-button" 
            className="bg-primary hover:bg-primary-dark text-white font-oswald uppercase w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Nouvel Événement
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="stat-card p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs md:text-sm text-text-secondary font-manrope">Total</p>
                <p className="text-xl md:text-2xl font-oswald font-bold text-text-primary">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="stat-card p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs md:text-sm text-text-secondary font-manrope">À venir</p>
                <p className="text-xl md:text-2xl font-oswald font-bold text-text-primary">{stats.upcoming}</p>
              </div>
            </div>
          </div>
          <div className="stat-card p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs md:text-sm text-text-secondary font-manrope">En cours</p>
                <p className="text-xl md:text-2xl font-oswald font-bold text-text-primary">{stats.ongoing}</p>
              </div>
            </div>
          </div>
          <div className="stat-card p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-secondary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs md:text-sm text-text-secondary font-manrope">Participants</p>
                <p className="text-xl md:text-2xl font-oswald font-bold text-text-primary">{stats.totalParticipants}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-text-secondary font-manrope">Chargement...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 bg-paper rounded-xl border border-white/10">
              <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary font-manrope">Aucun événement</p>
              <Button onClick={openAddModal} className="mt-4 bg-primary hover:bg-primary-dark">
                <Plus className="w-4 h-4 mr-2" /> Créer un événement
              </Button>
            </div>
          ) : (
            events.map((event, index) => (
              <div key={event.id} className="stat-card p-4 md:p-6 hover:border-primary/30 transition-colors" data-testid={`event-card-${index}`}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                  {/* Image */}
                  {event.image_url && (
                    <div className="lg:col-span-3">
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-full h-32 lg:h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className={event.image_url ? 'lg:col-span-7' : 'lg:col-span-10'}>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-manrope font-medium ${getEventTypeColor(event.event_type)}`}>
                        {event.event_type}
                      </span>
                      {event.price > 0 && (
                        <span className="inline-block px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-manrope font-medium">
                          {event.price}€
                        </span>
                      )}
                    </div>
                    <h3 className="font-oswald text-xl md:text-2xl font-bold text-text-primary uppercase mb-2">
                      {event.title}
                    </h3>
                    <p className="text-text-secondary font-manrope text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 text-xs text-text-muted font-manrope">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                        <span>{event.start_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                        <span>{event.start_time} - {event.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                        <span>{event.city}, {event.country}</span>
                      </div>
                    </div>
                    {event.instructor && (
                      <div className="mt-3 text-xs text-text-muted font-manrope">
                        Instructeur: <span className="text-text-primary font-medium">{event.instructor}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-2 flex lg:flex-col gap-2 justify-end items-end lg:items-center">
                    <div className="text-center mb-0 lg:mb-2 hidden lg:block">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Users className="w-5 h-5 text-primary" strokeWidth={1.5} />
                        <span className="text-xl font-oswald font-bold text-text-primary">
                          {event.current_participants || 0}
                          {event.max_participants && `/${event.max_participants}`}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted font-manrope">Inscrits</p>
                    </div>
                    <Button
                      onClick={() => openDetailModal(event)}
                      size="sm"
                      className="bg-primary hover:bg-primary-dark text-white"
                    >
                      <Eye className="w-4 h-4 mr-1 lg:mr-2" strokeWidth={1.5} />
                      <span className="hidden sm:inline">Voir</span>
                    </Button>
                    <Button
                      onClick={() => openEditModal(event)}
                      variant="outline"
                      size="sm"
                      className="border-white/10 text-text-secondary hover:text-text-primary"
                    >
                      <Edit className="w-4 h-4 mr-1 lg:mr-2" strokeWidth={1.5} />
                      <span className="hidden sm:inline">Modifier</span>
                    </Button>
                    <Button
                      onClick={() => handleDelete(event.id)}
                      variant="outline"
                      size="sm"
                      className="border-secondary/50 text-secondary hover:bg-secondary/10"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Modal */}
        <EventModal 
          isOpen={isAddModalOpen} 
          onClose={closeAddModal} 
          onSubmit={handleAddEvent}
          isEdit={false}
          saving={saving}
          formData={formData}
          onFieldChange={handleFieldChange}
          organizers={organizers}
        />

        {/* Edit Modal */}
        <EventModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleEditEvent}
          isEdit={true}
          saving={saving}
          formData={formData}
          onFieldChange={handleFieldChange}
          organizers={organizers}
        />

        {/* Detail Modal with Participants */}
        <EventDetailModal
          event={selectedEvent}
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          currentUser={user}
          onUpdate={fetchEvents}
        />
      </div>
    </DashboardLayout>
  );
};

export default EventsPage;
