import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api, { getErrorMessage } from '../utils/api';
import { countries, getFlag, danGrades, disciplines } from '../utils/countries';
import { Plus, Edit, Trash2, Search, X, Loader2, Upload, User, MapPin, Award, Building2, Mail, Phone, Info, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import UserAvatar from '../components/UserAvatar';
import { formatFullName } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const TechnicalDirectorsPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [directors, setDirectors] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDirector, setEditingDirector] = useState(null);
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
    dan_grade: '1dan',
    photo_url: '',
    club_ids: [],
    is_also_instructor: false,
  });

  useEffect(() => {
    fetchDirectors();
    fetchClubs();
  }, []);

  const fetchDirectors = async () => {
    try {
      // Utiliser /technical-directors accessible à tous les utilisateurs connectés
      const response = await api.get('/technical-directors');
      // Backend returns array directly
      const users = Array.isArray(response.data) ? response.data : (response.data?.users || []);
      setDirectors(users);
    } catch (error) {
      console.error('Error fetching directors:', error);
      setDirectors([]);
      toast.error('Erreur lors du chargement des directeurs techniques');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const response = await api.get('/clubs');
      const data = response.data || response;
      const clubsList = Array.isArray(data) ? data : [];
      setClubs(clubsList);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setClubs([]);
      toast.error('Erreur lors du chargement des clubs');
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
      dan_grade: '1dan',
      photo_url: '',
      club_ids: [],
      is_also_instructor: false,
    });
    setEditingDirector(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (director) => {
    setEditingDirector(director);
    setFormData({
      full_name: director.full_name || director.name || '',
      email: director.email || '',
      phone: director.phone || '',
      country: director.country || 'France',
      country_code: director.country_code || 'FR',
      city: director.city || '',
      dan_grade: director.dan_grade || '1dan',
      photo_url: director.photo_url || director.photo || '',
      club_ids: director.club_ids || [],
      is_also_instructor: director.roles?.includes('instructor') || false,
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
        role: 'directeur_technique',
      };

      if (editingDirector) {
        await api.put(`/admin/users/${editingDirector.id}`, payload);
        toast.success('Directeur Technique mis à jour');
      } else {
        await api.post('/admin/users', payload);
        toast.success('Directeur Technique créé');
      }
      closeModal();
      fetchDirectors();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erreur lors de l\'enregistrement'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (director) => {
    if (!window.confirm(`Supprimer le Directeur Technique ${director.full_name || director.name} ?`)) return;

    try {
      await api.delete(`/admin/users/${director.id}`);
      toast.success('Directeur Technique supprimé');
      fetchDirectors();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredDirectors = directors.filter(d => {
    const name = d.full_name || d.name || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = countryFilter === 'all' || d.country_code === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const uniqueCountries = [...new Set(directors.map(d => d.country_code).filter(Boolean))];

  // Get clubs managed by a director
  const getDirectorClubs = (directorId) => {
    return clubs.filter(club => 
      club.technical_director_ids?.includes(directorId) || 
      club.technical_director_id === directorId
    );
  };

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
      <div className="space-y-6" data-testid="directors-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-oswald text-2xl sm:text-3xl font-bold text-text-primary uppercase tracking-wide">
              Directeurs Techniques
            </h1>
            <p className="text-text-secondary font-manrope mt-1 text-sm">
              {directors.length} directeur(s) • Responsables de clubs
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
                Pour ajouter, modifier ou supprimer un directeur technique, rendez-vous dans la section{' '}
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
          {filteredDirectors.map((director) => {
            const directorClubs = getDirectorClubs(director.id);
            return (
              <div
                key={director.id}
                className="bg-paper rounded-lg border border-white/10 p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  <div className="relative flex-shrink-0">
                    <UserAvatar
                      user={{
                        full_name: director.full_name || director.name,
                        photo_url: director.photo_url || director.photo
                      }}
                      size="xl"
                    />
                    {/* Flag badge */}
                    <span className="absolute -bottom-1 -right-1 text-xl">
                      {getFlag(director.country_code)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-oswald text-lg text-white uppercase truncate">
                      {formatFullName(director.full_name || director.name)}
                    </h3>
                    
                    <div className="space-y-1 mt-2">
                      {director.email && (
                        <p className="flex items-center gap-2 text-xs text-text-muted truncate">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          {director.email}
                        </p>
                      )}
                      {director.phone && (
                        <p className="flex items-center gap-2 text-xs text-text-muted">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          {director.phone}
                        </p>
                      )}
                      {director.city && (
                        <p className="flex items-center gap-2 text-xs text-text-secondary">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {director.city}, {director.country}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {director.dan_grade && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/20 text-accent rounded text-xs font-medium">
                          <Award className="w-3 h-3" />
                          {danGrades.find(d => d.value === director.dan_grade)?.label || director.dan_grade}
                        </span>
                      )}
                      {director.roles?.includes('instructor') && (
                        <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium">
                          + Instructeur
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Clubs */}
                {directorClubs.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <p className="text-xs text-text-muted mb-2 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Clubs gérés:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {directorClubs.map(club => (
                        <span key={club.id} className="px-2 py-1 bg-white/5 text-text-secondary rounded text-xs">
                          {club.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredDirectors.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted font-manrope">Aucun directeur technique trouvé</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-paper rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="font-oswald text-xl text-text-primary uppercase">
                {editingDirector ? 'Modifier le DT' : 'Nouveau Directeur Technique'}
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

              {/* Also Instructor checkbox */}
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <input
                  type="checkbox"
                  id="is_also_instructor"
                  checked={formData.is_also_instructor}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_also_instructor: e.target.checked }))}
                  className="rounded border-white/20"
                />
                <label htmlFor="is_also_instructor" className="text-sm text-text-secondary cursor-pointer">
                  Ce Directeur Technique est aussi <span className="text-primary font-medium">Instructeur</span>
                </label>
              </div>

              {/* Clubs */}
              <div>
                <Label className="text-text-secondary">Clubs à gérer</Label>
                {clubs.length === 0 ? (
                  <p className="text-xs text-text-muted mt-2">Aucun club disponible. Créez d'abord des clubs.</p>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-background rounded-lg border border-white/10">
                    {clubs.map(club => (
                      <label key={club.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/5 p-1 rounded">
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
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal} className="flex-1 border-white/10">
                  Annuler
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary-dark">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingDirector ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TechnicalDirectorsPage;
