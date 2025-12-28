import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api, { getErrorMessage } from '../utils/api';
import { countries, getFlag, danGrades, disciplines } from '../utils/countries';
import { Plus, Edit, Trash2, Search, X, Loader2, Upload, User, MapPin, Award, Building2, MessageSquare, Eye } from 'lucide-react';
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
            <Button onClick={openAddModal} className="bg-primary hover:bg-primary-dark">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Instructeur
            </Button>
          )}
        </div>

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
                {/* Première ligne : Voir la fiche + Message */}
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
                {/* Deuxième ligne : Actions admin uniquement */}
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(instructor)}
                      className="flex-1 border-white/10"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(instructor)}
                      className="border-secondary/50 text-secondary hover:bg-secondary/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
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

      {/* Modal - Admin only */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-paper rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="font-oswald text-xl text-text-primary uppercase">
                {editingInstructor ? 'Modifier l\'Instructeur' : 'Nouvel Instructeur'}
              </h2>
              <button onClick={closeModal} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Photo */}
              <div className="flex items-center gap-4">
                <UserAvatar
                  user={{ full_name: formData.full_name, photo_url: formData.photo_url }}
                  size="xl"
                />
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="border-white/10"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                    {uploading ? 'Upload...' : 'Changer la photo'}
                  </Button>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-text-secondary">Nom complet *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
              </div>

              {/* Phone & City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-text-secondary">Téléphone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary">Ville</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="mt-1 bg-background border-white/10"
                  />
                </div>
              </div>

              {/* Country & Dan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-text-secondary">Pays</Label>
                  <Select value={formData.country_code} onValueChange={handleCountryChange}>
                    <SelectTrigger className="mt-1 bg-background border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-paper border-white/10 max-h-60">
                      {countries.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-text-secondary">Grade Dan</Label>
                  <Select value={formData.dan_grade} onValueChange={(v) => setFormData(prev => ({ ...prev, dan_grade: v }))}>
                    <SelectTrigger className="mt-1 bg-background border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-paper border-white/10">
                      {danGrades.map(d => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clubs */}
              <div>
                <Label className="text-text-secondary">Clubs associés</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-background rounded-lg border border-white/10">
                  {clubs.map(club => (
                    <label key={club.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.club_ids.includes(club.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, club_ids: [...prev.club_ids, club.id] }));
                          } else {
                            setFormData(prev => ({ ...prev, club_ids: prev.club_ids.filter(id => id !== club.id) }));
                          }
                        }}
                        className="rounded border-white/20"
                      />
                      <span className="text-text-secondary">{club.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal} className="flex-1 border-white/10">
                  Annuler
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary-dark">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingInstructor ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InstructorsPage;
