import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api, { getErrorMessage } from '../utils/api';
import { countries, getFlag, danGrades, disciplines } from '../utils/countries';
import { Plus, Edit, Trash2, Search, X, Loader2, Upload, User, MapPin, Award, Building2, MessageSquare, Eye, Info, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';

const InstructorsPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [instructors, setInstructors] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: 'France',
    country_code: 'FR',
    city: '',
    dan_grade: 'debutant',
    photo_url: '',
    club_ids: [],
    disciplines: [],
  });

  useEffect(() => {
    fetchInstructors();
    fetchClubs();
  }, []);

  const fetchInstructors = async () => {
    try {
      // Utiliser /instructors accessible à tous les utilisateurs connectés
      const response = await api.get('/instructors');
      // Backend returns array directly
      const users = Array.isArray(response.data) ? response.data : (response.data?.users || []);
      setInstructors(users);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setInstructors([]);
      toast.error('Erreur lors du chargement des instructeurs');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const response = await api.get('/clubs');
      const data = response.data || response;
      setClubs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setClubs([]);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      country: 'France',
      country_code: 'FR',
      city: '',
      dan_grade: 'debutant',
      photo_url: '',
      club_ids: [],
      disciplines: [],
    });
    setEditingInstructor(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      full_name: instructor.full_name || '',
      email: instructor.email || '',
      phone: instructor.phone || '',
      country: instructor.country || 'France',
      country_code: instructor.country_code || 'FR',
      city: instructor.city || '',
      dan_grade: instructor.dan_grade || 'debutant',
      photo_url: instructor.photo_url || '',
      club_ids: instructor.club_ids || [],
      disciplines: instructor.disciplines || [],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validation de la taille (max 10 Mo)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`L'image fait ${sizeMB} Mo, maximum autorisé: 10 Mo`);
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        // Retirer le préfixe data:image/...;base64,
        const base64 = reader.result.split(',')[1];
        const response = await api.post('/upload/photo', {
          photo_base64: base64,
          filename: file.name
        });
        setFormData(prev => ({ ...prev, photo_url: response.data.photo_url }));
        toast.success('Photo uploadée');
      } catch (error) {
        console.error('Error uploading photo:', error);
        toast.error('Erreur lors de l\'upload de la photo');
      }
      setUploading(false);
    };
    reader.onerror = () => {
      toast.error('Erreur lors de la lecture du fichier');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCountryChange = (countryCode) => {
    const country = countries.find(c => c.code === countryCode);
    setFormData(prev => ({
      ...prev,
      country_code: countryCode,
      country: country?.name || 'France'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      toast.error('Nom et email sont obligatoires');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        role: 'instructeur',
      };

      if (editingInstructor) {
        await api.put(`/admin/users/${editingInstructor.id}`, payload);
        toast.success('Instructeur mis à jour');
      } else {
        await api.post('/admin/users', payload);
        toast.success('Instructeur créé');
      }
      closeModal();
      fetchInstructors();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erreur lors de l\'enregistrement'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (instructor) => {
    if (!window.confirm(`Supprimer l'instructeur ${instructor.full_name} ?`)) return;

    try {
      await api.delete(`/admin/users/${instructor.id}`);
      toast.success('Instructeur supprimé');
      fetchInstructors();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleViewProfile = (instructor) => {
    navigate(`/members/${instructor.id}`);
  };

  const handleSendMessage = async (instructor) => {
    try {
      const response = await api.post('/conversations', { recipient_id: instructor.id });
      navigate('/messages', { state: { conversationId: response.data.id } });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
    }
  };

  const filteredInstructors = instructors.filter(i => {
    const matchesSearch = i.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = countryFilter === 'all' || i.country_code === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const uniqueCountries = [...new Set(instructors.map(i => i.country_code).filter(Boolean))];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-oswald text-2xl sm:text-3xl font-bold text-text-primary uppercase tracking-wide">
              Instructeurs
            </h1>
            <p className="text-text-secondary font-manrope mt-1 text-sm">
              {instructors.length} instructeur(s) • Réseau des formateurs AJL
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => navigate('/admin/users')} className="bg-primary hover:bg-primary-dark">
              <Settings className="w-4 h-4 mr-2" />
              Gérer les utilisateurs
            </Button>
          )}
        </div>

        {/* Info message for admins */}
        {isAdmin && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-300 font-medium">Gestion centralisée des utilisateurs</p>
              <p className="text-blue-300/70 mt-1">
                Pour ajouter, modifier ou supprimer un instructeur, rendez-vous dans la section{' '}
                <button 
                  onClick={() => navigate('/admin/users')} 
                  className="text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  Gestion des Utilisateurs
                </button>.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-paper border-white/10"
            />
          </div>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-paper border-white/10">
              <SelectValue placeholder="Tous les pays" />
            </SelectTrigger>
            <SelectContent className="bg-paper border-white/10">
              <SelectItem value="all">Tous les pays</SelectItem>
              {uniqueCountries.map(code => (
                <SelectItem key={code} value={code}>
                  {getFlag(code)} {countries.find(c => c.code === code)?.name || code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInstructors.map((instructor) => (
            <div
              key={instructor.id}
              className="bg-paper rounded-lg border border-white/10 p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Photo */}
                <div className="relative flex-shrink-0">
                  <UserAvatar user={instructor} size="xl" />
                  {/* Flag badge */}
                  <span className="absolute -bottom-1 -right-1 text-lg">
                    {getFlag(instructor.country_code)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-oswald text-lg text-white uppercase truncate">
                    {instructor.full_name}
                  </h3>
                  <p className="text-text-muted text-sm truncate">{instructor.email}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {instructor.city && (
                      <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                        <MapPin className="w-3 h-3" />
                        {instructor.city}
                      </span>
                    )}
                    {instructor.dan_grade && (
                      <span className="inline-flex items-center gap-1 text-xs text-accent">
                        <Award className="w-3 h-3" />
                        {danGrades.find(d => d.value === instructor.dan_grade)?.label || instructor.dan_grade}
                      </span>
                    )}
                  </div>

                  {instructor.club_ids?.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                      <Building2 className="w-3 h-3" />
                      {instructor.club_ids.length} club(s)
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/5">
                {/* Voir la fiche + Message */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProfile(instructor)}
                    className="flex-1 border-white/10"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Voir la fiche
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage(instructor)}
                    className="flex-1 border-primary/50 text-primary hover:bg-primary/10"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInstructors.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted font-manrope">Aucun instructeur trouvé</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstructorsPage;
