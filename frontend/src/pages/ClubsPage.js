import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, MapPin, Phone, Mail,
  Edit, Trash2, Loader2, X, UserCog, Users, Shield, RefreshCw
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import api, { getErrorMessage } from '../utils/api';
import { toast } from 'sonner';
import { countries, getFlag, disciplines as disciplinesList } from '../utils/countries';
import UserAvatar, { UserAvatarGroup } from '../components/UserAvatar';

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [technicalDirectors, setTechnicalDirectors] = useState([]);
  const [nationalDirectors, setNationalDirectors] = useState([]);
  const [instructorsList, setInstructorsList] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [saving, setSaving] = useState(false);

  // Role management
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);

  const [formData, setFormData] = useState({
    name: '', address: '', city: '', country: 'France', country_code: 'FR',
    phone: '', email: '', logo_url: '', technical_director_ids: [],
    national_director_ids: [], instructor_ids: [], disciplines: [], schedule: ''
  });

  useEffect(() => {
    fetchClubs();
    fetchTechnicalDirectors();
    fetchNationalDirectors();
    fetchInstructors();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await api.get('/clubs');
      const data = response.data?.clubs || response.data || response;
      setClubs(Array.isArray(data) ? data : []);
    } catch (error) {
      setClubs([]);
    }
    setLoading(false);
  };

  const fetchTechnicalDirectors = async () => {
    try {
      const response = await api.get('/technical-directors-list');
      const data = response.data?.directors || response.data || [];
      setTechnicalDirectors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching technical directors:', error);
      setTechnicalDirectors([]);
    }
  };

  const fetchNationalDirectors = async () => {
    try {
      const response = await api.get('/national-directors-list');
      const data = response.data?.directors || response.data || [];
      setNationalDirectors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching national directors:', error);
      setNationalDirectors([]);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await api.get('/instructors-list');
      const data = response.data?.instructors || response.data || [];
      setInstructorsList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setInstructorsList([]);
    }
  };

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/admin/users');
      const data = response.data?.users || response.data || [];
      setAllUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching all users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
      setAllUsers([]);
    }
    setLoadingUsers(false);
  };

  const updateUserRole = async (userId, newRole) => {
    setUpdatingRole(userId);
    try {
      await api.put(`/admin/users/${userId}/role?role=${newRole}`);
      toast.success('Rôle mis à jour');
      // Refresh lists
      await Promise.all([
        fetchAllUsers(),
        fetchTechnicalDirectors(),
        fetchNationalDirectors(),
        fetchInstructors()
      ]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erreur lors de la mise à jour du rôle'));
    }
    setUpdatingRole(null);
  };

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Supprimer l'utilisateur "${userName}" ?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Utilisateur supprimé');
      await Promise.all([
        fetchAllUsers(),
        fetchTechnicalDirectors(),
        fetchNationalDirectors(),
        fetchInstructors()
      ]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erreur lors de la suppression'));
    }
  };

  const openRoleModal = () => {
    fetchAllUsers();
    setIsRoleModalOpen(true);
  };

  // Rôles valides - Nouvelle structure
  const VALID_ROLES = [
    { value: 'eleve', label: 'Élève', color: 'gray' },
    { value: 'eleve_libre', label: 'Élève Libre', color: 'green' },
    { value: 'instructeur', label: 'Instructeur', color: 'primary' },
    { value: 'directeur_technique', label: 'Directeur Technique', color: 'accent' },
    { value: 'admin', label: 'Administrateur', color: 'red' }
  ];

  const resetForm = () => {
    setFormData({
      name: '', address: '', city: '', country: 'France', country_code: 'FR',
      phone: '', email: '', logo_url: '', technical_director_ids: [],
      national_director_ids: [], instructor_ids: [], disciplines: [], schedule: ''
    });
    setEditingClub(null);
  };

  const openAddModal = () => { resetForm(); setIsModalOpen(true); };

  const openEditModal = (club) => {
    setEditingClub(club);
    setFormData({
      name: club.name || '',
      address: club.address || '',
      city: club.city || '',
      country: club.country || 'France',
      country_code: club.country_code || 'FR',
      phone: club.phone || '',
      email: club.email || '',
      logo_url: club.logo_url || '',
      technical_director_ids: club.technical_director_ids || (club.technical_director_id ? [club.technical_director_id] : []),
      national_director_ids: club.national_director_ids || [],
      instructor_ids: club.instructor_ids || [],
      disciplines: club.disciplines || [],
      schedule: club.schedule || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); resetForm(); };

  const handleCountryChange = (code) => {
    const country = countries.find(c => c.code === code);
    setFormData(prev => ({ ...prev, country_code: code, country: country?.name || 'France' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.city) {
      toast.error('Nom et ville sont obligatoires');
      return;
    }
    setSaving(true);
    try {
      if (editingClub) {
        await api.put(`/admin/clubs/${editingClub.id}`, formData);
        toast.success('Club mis à jour');
      } else {
        await api.post('/admin/clubs', formData);
        toast.success('Club créé');
      }
      closeModal();
      fetchClubs();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Erreur'));
    }
    setSaving(false);
  };

  const handleDelete = async (club) => {
    if (!window.confirm(`Supprimer le club "${club.name}" ?`)) return;
    try {
      await api.delete(`/admin/clubs/${club.id}`);
      toast.success('Club supprimé');
      fetchClubs();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getTechnicalDirectorName = (id) => {
    const d = technicalDirectors.find(dir => dir.id === id);
    return d?.full_name || d?.name || 'Inconnu';
  };

  const getNationalDirectorName = (id) => {
    const d = nationalDirectors.find(dir => dir.id === id);
    return d?.full_name || d?.name || 'Inconnu';
  };

  const getInstructorName = (id) => {
    const i = instructorsList.find(inst => inst.id === id);
    return i?.full_name || i?.name || 'Inconnu';
  };

  const getTechnicalDirector = (id) => technicalDirectors.find(d => d.id === id);
  const getNationalDirector = (id) => nationalDirectors.find(d => d.id === id);
  const getInstructor = (id) => instructorsList.find(i => i.id === id);

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          club.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = countryFilter === 'all' || club.country_code === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const uniqueCountries = [...new Set(clubs.map(c => c.country_code).filter(Boolean))];

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
            <h1 className="font-oswald text-2xl sm:text-3xl font-bold text-text-primary uppercase tracking-wide">Clubs</h1>
            <p className="text-text-secondary font-manrope mt-1 text-sm">{clubs.length} club(s)</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={openRoleModal} variant="outline" className="border-accent text-accent hover:bg-accent/10">
              <Shield className="w-4 h-4 mr-2" />Gérer les rôles
            </Button>
            <Button onClick={openAddModal} className="bg-primary hover:bg-primary-dark">
              <Plus className="w-4 h-4 mr-2" />Nouveau Club
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-paper border-white/10" />
          </div>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-paper border-white/10"><SelectValue placeholder="Tous les pays" /></SelectTrigger>
            <SelectContent className="bg-paper border-white/10">
              <SelectItem value="all">Tous les pays</SelectItem>
              {uniqueCountries.map(code => (
                <SelectItem key={code} value={code}>{getFlag(code)} {countries.find(c => c.code === code)?.name || code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClubs.map((club) => (
            <div key={club.id} className="bg-paper rounded-lg border border-white/10 overflow-hidden hover:border-primary/50 transition-colors">
              <div className="p-4 border-b border-white/5">
                <div className="flex items-start gap-3">
                  {club.logo_url ? (
                    <img src={club.logo_url} alt={club.name} className="w-14 h-14 rounded-lg object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-oswald text-lg text-white uppercase truncate">{club.name}</h3>
                      <span className="text-xl">{getFlag(club.country_code)}</span>
                    </div>
                    <p className="text-text-muted text-sm flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />{club.city}, {club.country}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {club.phone && <p className="text-xs text-text-secondary flex items-center gap-2"><Phone className="w-3 h-3" />{club.phone}</p>}
                {club.email && <p className="text-xs text-text-secondary flex items-center gap-2 truncate"><Mail className="w-3 h-3" />{club.email}</p>}

                {/* Directeurs Nationaux */}
                {club.national_director_ids?.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs text-text-muted mb-2 flex items-center gap-1"><UserCog className="w-3 h-3" />Directeurs Nationaux:</p>
                    <div className="flex flex-wrap gap-2">
                      {club.national_director_ids.map(id => {
                        const director = getNationalDirector(id);
                        return (
                          <div key={id} className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 rounded-lg">
                            <UserAvatar user={{ full_name: getNationalDirectorName(id), photo_url: director?.photo_url }} size="xs" />
                            <span className="text-xs text-purple-400">{getNationalDirectorName(id)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Directeurs Techniques */}
                {(club.technical_director_ids?.length > 0 || club.technical_director_id) && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs text-text-muted mb-2 flex items-center gap-1"><UserCog className="w-3 h-3" />Directeurs Techniques:</p>
                    <div className="flex flex-wrap gap-2">
                      {(club.technical_director_ids || [club.technical_director_id]).filter(Boolean).map(id => {
                        const director = getTechnicalDirector(id);
                        return (
                          <div key={id} className="flex items-center gap-2 px-2 py-1 bg-accent/10 rounded-lg">
                            <UserAvatar user={{ full_name: getTechnicalDirectorName(id), photo_url: director?.photo_url }} size="xs" />
                            <span className="text-xs text-accent">{getTechnicalDirectorName(id)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Instructeurs */}
                {club.instructor_ids?.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs text-text-muted mb-2 flex items-center gap-1"><Users className="w-3 h-3" />Instructeurs:</p>
                    <div className="flex flex-wrap gap-2">
                      {club.instructor_ids.slice(0, 4).map(id => {
                        const instructor = getInstructor(id);
                        return (
                          <div key={id} className="flex items-center gap-2 px-2 py-1 bg-primary/10 rounded-lg">
                            <UserAvatar user={{ full_name: getInstructorName(id), photo_url: instructor?.photo_url }} size="xs" />
                            <span className="text-xs text-primary">{getInstructorName(id)}</span>
                          </div>
                        );
                      })}
                      {club.instructor_ids.length > 4 && (
                        <span className="px-2 py-1 bg-white/10 text-text-muted rounded-lg text-xs flex items-center">
                          +{club.instructor_ids.length - 4} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 p-4 pt-0">
                <Button variant="outline" size="sm" onClick={() => openEditModal(club)} className="flex-1 border-white/10">
                  <Edit className="w-4 h-4 mr-1" />Modifier
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(club)} className="border-secondary/50 text-secondary hover:bg-secondary/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredClubs.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">Aucun club trouvé</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-paper rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="font-oswald text-xl text-text-primary uppercase">{editingClub ? 'Modifier le Club' : 'Nouveau Club'}</h2>
              <button onClick={closeModal} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <Label className="text-text-secondary">Nom du club *</Label>
                <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required className="mt-1 bg-background border-white/10" />
              </div>
              <div>
                <Label className="text-text-secondary">Adresse</Label>
                <Input value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} className="mt-1 bg-background border-white/10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-text-secondary">Ville *</Label>
                  <Input value={formData.city} onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} required className="mt-1 bg-background border-white/10" />
                </div>
                <div>
                  <Label className="text-text-secondary">Pays</Label>
                  <Select value={formData.country_code} onValueChange={handleCountryChange}>
                    <SelectTrigger className="mt-1 bg-background border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-paper border-white/10 max-h-60">
                      {countries.map(c => (<SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-text-secondary">Téléphone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="mt-1 bg-background border-white/10" />
                </div>
                <div>
                  <Label className="text-text-secondary">Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="mt-1 bg-background border-white/10" />
                </div>
              </div>
              {/* Directeurs Nationaux */}
              <div>
                <Label className="text-text-secondary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Directeurs Nationaux
                  {formData.national_director_ids.length > 0 && (
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                      {formData.national_director_ids.length} selectionne(s)
                    </span>
                  )}
                </Label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-background rounded-lg border border-white/10">
                  {nationalDirectors.length === 0 ? (
                    <p className="text-text-muted text-sm col-span-2 py-2">Aucun directeur national disponible</p>
                  ) : nationalDirectors.map(d => (
                    <label key={d.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${formData.national_director_ids.includes(d.id) ? 'bg-purple-500/20 border border-purple-500/50' : 'hover:bg-white/5 border border-transparent'}`}>
                      <input type="checkbox" checked={formData.national_director_ids.includes(d.id)} onChange={(e) => {
                        if (e.target.checked) setFormData(prev => ({ ...prev, national_director_ids: [...prev.national_director_ids, d.id] }));
                        else setFormData(prev => ({ ...prev, national_director_ids: prev.national_director_ids.filter(id => id !== d.id) }));
                      }} className="rounded border-white/20 text-purple-500" />
                      <UserAvatar user={d} size="xs" />
                      <div className="flex-1 min-w-0">
                        <span className="text-text-primary text-sm block truncate">{d.full_name || d.name}</span>
                        {d.city && <span className="text-text-muted text-xs">{d.city}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Directeurs Techniques */}
              <div>
                <Label className="text-text-secondary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  Directeurs Techniques
                  {formData.technical_director_ids.length > 0 && (
                    <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                      {formData.technical_director_ids.length} selectionne(s)
                    </span>
                  )}
                </Label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-background rounded-lg border border-white/10">
                  {technicalDirectors.length === 0 ? (
                    <p className="text-text-muted text-sm col-span-2 py-2">Aucun directeur technique disponible</p>
                  ) : technicalDirectors.map(d => (
                    <label key={d.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${formData.technical_director_ids.includes(d.id) ? 'bg-accent/20 border border-accent/50' : 'hover:bg-white/5 border border-transparent'}`}>
                      <input type="checkbox" checked={formData.technical_director_ids.includes(d.id)} onChange={(e) => {
                        if (e.target.checked) setFormData(prev => ({ ...prev, technical_director_ids: [...prev.technical_director_ids, d.id] }));
                        else setFormData(prev => ({ ...prev, technical_director_ids: prev.technical_director_ids.filter(id => id !== d.id) }));
                      }} className="rounded border-white/20 text-accent" />
                      <UserAvatar user={d} size="xs" />
                      <div className="flex-1 min-w-0">
                        <span className="text-text-primary text-sm block truncate">{d.full_name || d.name}</span>
                        {d.city && <span className="text-text-muted text-xs">{d.city}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Instructeurs */}
              <div>
                <Label className="text-text-secondary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Instructeurs
                  {formData.instructor_ids.length > 0 && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      {formData.instructor_ids.length} selectionne(s)
                    </span>
                  )}
                </Label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 bg-background rounded-lg border border-white/10">
                  {instructorsList.length === 0 ? (
                    <p className="text-text-muted text-sm col-span-2 py-2">Aucun instructeur disponible</p>
                  ) : instructorsList.map(i => (
                    <label key={i.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${formData.instructor_ids.includes(i.id) ? 'bg-primary/20 border border-primary/50' : 'hover:bg-white/5 border border-transparent'}`}>
                      <input type="checkbox" checked={formData.instructor_ids.includes(i.id)} onChange={(e) => {
                        if (e.target.checked) setFormData(prev => ({ ...prev, instructor_ids: [...prev.instructor_ids, i.id] }));
                        else setFormData(prev => ({ ...prev, instructor_ids: prev.instructor_ids.filter(id => id !== i.id) }));
                      }} className="rounded border-white/20 text-primary" />
                      <UserAvatar user={i} size="xs" />
                      <div className="flex-1 min-w-0">
                        <span className="text-text-primary text-sm block truncate">{i.full_name || i.name}</span>
                        {i.city && <span className="text-text-muted text-xs">{i.city}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-text-secondary">Disciplines</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {disciplinesList.map(d => (
                    <label key={d} className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-white/10 cursor-pointer hover:border-primary/50">
                      <input type="checkbox" checked={formData.disciplines.includes(d)} onChange={(e) => {
                        if (e.target.checked) setFormData(prev => ({ ...prev, disciplines: [...prev.disciplines, d] }));
                        else setFormData(prev => ({ ...prev, disciplines: prev.disciplines.filter(disc => disc !== d) }));
                      }} className="rounded border-white/20" />
                      <span className="text-text-secondary text-sm">{d}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-text-secondary">Horaires</Label>
                <Textarea value={formData.schedule} onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))} className="mt-1 bg-background border-white/10" rows={3} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal} className="flex-1 border-white/10">Annuler</Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary-dark">
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{editingClub ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-paper rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h2 className="font-oswald text-xl text-text-primary uppercase flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Gestion des Rôles
                </h2>
                <p className="text-text-muted text-sm mt-1">
                  Assignez les rôles aux utilisateurs pour qu'ils apparaissent dans les listes de sélection
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => fetchAllUsers()} disabled={loadingUsers} className="border-white/10">
                  <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                </Button>
                <button onClick={() => setIsRoleModalOpen(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-white/10 bg-background/50">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary"></span>
                  <span className="text-text-secondary">Instructeurs: {instructorsList.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-accent"></span>
                  <span className="text-text-secondary">Dir. Techniques: {technicalDirectors.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  <span className="text-text-secondary">Dir. Nationaux: {nationalDirectors.length}</span>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : allUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted">Aucun utilisateur trouvé</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-background/50 sticky top-0">
                    <tr>
                      <th className="text-left p-4 text-text-muted text-sm font-medium">Utilisateur</th>
                      <th className="text-left p-4 text-text-muted text-sm font-medium">Email</th>
                      <th className="text-left p-4 text-text-muted text-sm font-medium">Rôle actuel</th>
                      <th className="text-left p-4 text-text-muted text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allUsers.map(user => (
                      <tr key={user.id} className="hover:bg-white/5">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} size="sm" />
                            <div>
                              <p className="text-text-primary font-medium">{user.full_name || 'Sans nom'}</p>
                              <p className="text-text-muted text-xs">{user.city || 'Ville non définie'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-text-secondary text-sm">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                            user.role === 'directeur_technique' ? 'bg-accent/20 text-accent' :
                            user.role === 'instructeur' ? 'bg-primary/20 text-primary' :
                            user.role === 'eleve_libre' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {VALID_ROLES.find(r => r.value === user.role)?.label || user.role || 'Non défini'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Select
                              value={user.role || 'eleve'}
                              onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                              disabled={updatingRole === user.id}
                            >
                              <SelectTrigger className="w-40 bg-background border-white/10 text-sm h-8">
                                {updatingRole === user.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent className="bg-paper border-white/10">
                                {VALID_ROLES.map(role => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteUser(user.id, user.full_name)}
                              className="border-secondary/50 text-secondary hover:bg-secondary/10 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-background/50">
              <p className="text-text-muted text-xs">
                <strong>Astuce:</strong> Les utilisateurs avec le rôle "Instructeur" apparaîtront dans la liste des instructeurs,
                "Directeur Technique" dans les directeurs techniques, etc.
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ClubsPage;
