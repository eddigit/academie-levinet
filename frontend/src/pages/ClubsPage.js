import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Search, MapPin, Users, User, Phone, Mail, 
  Edit, Trash2, Loader2, X, Save, Calendar, Award, Eye, Filter,
  UserCog, Globe, Clock
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import api from '../utils/api';
import { toast } from 'sonner';

const disciplines = [
  "Self-Pro Krav (SPK)",
  "WKMO",
  "SFJL",
  "IPC",
  "Self-Défense",
  "Krav Maga",
  "Karaté",
  "Jiu-Jitsu"
];

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [directors, setDirectors] = useState([]);
  const [instructorsList, setInstructorsList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newClub, setNewClub] = useState({
    name: '', address: '', city: '', country: 'France', phone: '', email: '',
    logo_url: '', technical_director_id: '', instructor_ids: [], disciplines: [], schedule: ''
  });
  
  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Detail modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Assign member modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assigningClub, setAssigningClub] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    fetchClubs();
    fetchDirectors();
    fetchInstructors();
    fetchAllUsers();
  }, [countryFilter]);

  const fetchClubs = async () => {
    try {
      const params = {};
      if (countryFilter) params.country = countryFilter;
      const response = await api.get('/clubs', { params });
      setClubs(response.data.clubs || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Erreur lors du chargement des clubs');
    }
    setLoading(false);
  };

  const fetchDirectors = async () => {
    try {
      const response = await api.get('/technical-directors-list');
      setDirectors(response.data.directors || []);
    } catch (error) {
      console.error('Error fetching directors:', error);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await api.get('/instructors-list');
      setInstructorsList(response.data.instructors || []);
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setAllUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchClubDetail = async (clubId) => {
    setLoadingDetail(true);
    try {
      const response = await api.get(`/clubs/${clubId}`);
      setSelectedClub(response.data);
      setIsDetailOpen(true);
    } catch (error) {
      console.error('Error fetching club detail:', error);
      toast.error('Erreur lors du chargement des détails');
    }
    setLoadingDetail(false);
  };

  const handleCreateClub = async () => {
    if (!newClub.name || !newClub.city || !newClub.technical_director_id) {
      toast.error('Veuillez remplir les champs obligatoires (nom, ville, directeur technique)');
      return;
    }
    
    setCreating(true);
    try {
      await api.post('/admin/clubs', newClub);
      toast.success('Club créé avec succès');
      setIsCreateOpen(false);
      setNewClub({
        name: '', address: '', city: '', country: 'France', phone: '', email: '',
        logo_url: '', technical_director_id: '', instructor_ids: [], disciplines: [], schedule: ''
      });
      fetchClubs();
    } catch (error) {
      console.error('Error creating club:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    }
    setCreating(false);
  };

  const handleEditClub = (club) => {
    setEditingClub({ ...club });
    setIsEditOpen(true);
  };

  const handleSaveClub = async () => {
    if (!editingClub) return;
    
    setSaving(true);
    try {
      await api.put(`/admin/clubs/${editingClub.id}`, editingClub);
      toast.success('Club mis à jour');
      setIsEditOpen(false);
      setEditingClub(null);
      fetchClubs();
    } catch (error) {
      console.error('Error updating club:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    }
    setSaving(false);
  };

  const handleDeleteClub = async (clubId, clubName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le club "${clubName}" ?\n\nCette action est irréversible.`)) return;
    
    try {
      await api.delete(`/admin/clubs/${clubId}`);
      toast.success('Club supprimé');
      fetchClubs();
    } catch (error) {
      console.error('Error deleting club:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const handleAssignMember = async () => {
    if (!selectedUserId || !assigningClub) return;
    
    try {
      await api.post(`/admin/clubs/${assigningClub.id}/members/${selectedUserId}`);
      toast.success('Membre assigné au club');
      setIsAssignOpen(false);
      setSelectedUserId('');
      fetchClubs();
      if (selectedClub?.id === assigningClub.id) {
        fetchClubDetail(assigningClub.id);
      }
    } catch (error) {
      console.error('Error assigning member:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'assignation');
    }
  };

  const handleRemoveMember = async (clubId, userId, userName) => {
    if (!window.confirm(`Retirer ${userName} de ce club ?`)) return;
    
    try {
      await api.delete(`/admin/clubs/${clubId}/members/${userId}`);
      toast.success('Membre retiré du club');
      fetchClubDetail(clubId);
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors du retrait');
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.technical_director_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueCountries = [...new Set(clubs.map(c => c.country).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
                <Building2 className="w-8 h-8 text-primary" />
                Gestion des Clubs
              </h1>
              <p className="text-text-muted font-manrope mt-1">
                {clubs.length} club(s) • {clubs.reduce((acc, c) => acc + (c.member_count || 0), 0)} membre(s) au total
              </p>
            </div>
            
            {/* Create Club Button */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-dark">
                  <Plus className="w-4 h-4 mr-2" /> Nouveau Club
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-paper border-white/10 text-text-primary max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-oswald text-xl uppercase">Créer un club</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label className="text-text-secondary">Nom du club *</Label>
                      <Input
                        value={newClub.name}
                        onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                        placeholder="Club SPK Paris"
                      />
                    </div>
                    <div>
                      <Label className="text-text-secondary">Ville *</Label>
                      <Input
                        value={newClub.city}
                        onChange={(e) => setNewClub({ ...newClub, city: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                        placeholder="Paris"
                      />
                    </div>
                    <div>
                      <Label className="text-text-secondary">Pays</Label>
                      <Input
                        value={newClub.country}
                        onChange={(e) => setNewClub({ ...newClub, country: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                        placeholder="France"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-text-secondary">Adresse</Label>
                      <Input
                        value={newClub.address}
                        onChange={(e) => setNewClub({ ...newClub, address: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                        placeholder="123 Rue de la Self-Défense"
                      />
                    </div>
                    <div>
                      <Label className="text-text-secondary">Téléphone</Label>
                      <Input
                        value={newClub.phone}
                        onChange={(e) => setNewClub({ ...newClub, phone: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                    <div>
                      <Label className="text-text-secondary">Email</Label>
                      <Input
                        type="email"
                        value={newClub.email}
                        onChange={(e) => setNewClub({ ...newClub, email: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                        placeholder="contact@club.com"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-text-secondary">Directeur Technique *</Label>
                      <Select
                        value={newClub.technical_director_id}
                        onValueChange={(value) => setNewClub({ ...newClub, technical_director_id: value })}
                      >
                        <SelectTrigger className="mt-1 bg-background border-white/10">
                          <SelectValue placeholder="Sélectionner un DT" />
                        </SelectTrigger>
                        <SelectContent className="bg-paper border-white/10">
                          {directors.map((dt) => (
                            <SelectItem key={dt.id} value={dt.id} className="text-text-primary">
                              {dt.full_name} {dt.city ? `(${dt.city})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-text-secondary">Disciplines enseignées</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {disciplines.map((disc) => (
                          <button
                            key={disc}
                            type="button"
                            onClick={() => {
                              const updated = newClub.disciplines.includes(disc)
                                ? newClub.disciplines.filter(d => d !== disc)
                                : [...newClub.disciplines, disc];
                              setNewClub({ ...newClub, disciplines: updated });
                            }}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              newClub.disciplines.includes(disc)
                                ? 'bg-primary text-white'
                                : 'bg-background border border-white/10 text-text-secondary hover:border-primary/50'
                            }`}
                          >
                            {disc}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-text-secondary">Horaires</Label>
                      <Textarea
                        value={newClub.schedule}
                        onChange={(e) => setNewClub({ ...newClub, schedule: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                        placeholder="Lun-Ven: 18h-21h&#10;Sam: 10h-12h"
                        rows={3}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-text-secondary">URL du logo</Label>
                      <Input
                        value={newClub.logo_url}
                        onChange={(e) => setNewClub({ ...newClub, logo_url: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleCreateClub} 
                    disabled={creating}
                    className="w-full bg-primary hover:bg-primary-dark mt-4"
                  >
                    {creating ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Création...</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-2" /> Créer le club</>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher par nom, ville ou directeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-paper border-white/10 text-text-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={countryFilter === '' ? 'default' : 'outline'}
                onClick={() => setCountryFilter('')}
                className={countryFilter === '' ? 'bg-primary' : 'border-white/10'}
              >
                <Globe className="w-4 h-4 mr-2" /> Tous
              </Button>
              {uniqueCountries.slice(0, 3).map((country) => (
                <Button
                  key={country}
                  variant={countryFilter === country ? 'default' : 'outline'}
                  onClick={() => setCountryFilter(country)}
                  className={countryFilter === country ? 'bg-primary' : 'border-white/10'}
                >
                  {country}
                </Button>
              ))}
            </div>
          </div>

          {/* Clubs Grid */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-text-muted">Chargement des clubs...</p>
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="text-center py-12 bg-paper rounded-xl border border-white/10">
              <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">Aucun club trouvé</p>
              <Button onClick={() => setIsCreateOpen(true)} className="mt-4 bg-primary">
                <Plus className="w-4 h-4 mr-2" /> Créer le premier club
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <div key={club.id} className="bg-paper rounded-xl border border-white/10 overflow-hidden hover:border-primary/30 transition-colors">
                  {/* Club Header */}
                  <div className="p-6 border-b border-white/5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {club.logo_url ? (
                          <img src={club.logo_url} alt={club.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-oswald text-lg text-text-primary uppercase">{club.name}</h3>
                          <p className="text-text-muted text-sm flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {club.city}, {club.country}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        club.status === 'Actif' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {club.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Club Info */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <UserCog className="w-4 h-4 text-primary" />
                      <span>DT: {club.technical_director_name || 'Non assigné'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{club.member_count || 0} membre(s)</span>
                    </div>
                    {club.disciplines?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {club.disciplines.slice(0, 2).map((disc, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                            {disc}
                          </span>
                        ))}
                        {club.disciplines.length > 2 && (
                          <span className="px-2 py-0.5 bg-white/5 text-text-muted text-xs rounded">
                            +{club.disciplines.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="p-4 border-t border-white/5 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchClubDetail(club.id)}
                      className="flex-1 border-white/10"
                    >
                      <Eye className="w-4 h-4 mr-1" /> Détails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClub(club)}
                      className="border-white/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClub(club.id, club.name)}
                      className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Club Detail Modal */}
          {isDetailOpen && selectedClub && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setIsDetailOpen(false)}>
              <div className="bg-paper rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-paper z-20">
                  <div className="flex items-center gap-3">
                    {selectedClub.logo_url ? (
                      <img src={selectedClub.logo_url} alt={selectedClub.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <h2 className="font-oswald text-xl text-text-primary uppercase">{selectedClub.name}</h2>
                      <p className="text-text-muted text-sm">{selectedClub.city}, {selectedClub.country}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsDetailOpen(false)} className="text-text-muted hover:text-text-primary">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stats */}
                  <div className="md:col-span-3 grid grid-cols-3 gap-4">
                    <div className="bg-background/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-oswald text-primary">{selectedClub.stats?.total_members || 0}</p>
                      <p className="text-text-muted text-sm">Membres</p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-oswald text-green-500">{selectedClub.stats?.active_visits || 0}</p>
                      <p className="text-text-muted text-sm">Visites actives</p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-oswald text-amber-500">{selectedClub.instructors?.length || 0}</p>
                      <p className="text-text-muted text-sm">Instructeurs</p>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="space-y-4">
                    <h3 className="font-oswald text-lg text-text-primary uppercase">Informations</h3>
                    {selectedClub.address && (
                      <p className="text-text-secondary text-sm flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                        {selectedClub.address}
                      </p>
                    )}
                    {selectedClub.phone && (
                      <p className="text-text-secondary text-sm flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        {selectedClub.phone}
                      </p>
                    )}
                    {selectedClub.email && (
                      <p className="text-text-secondary text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        {selectedClub.email}
                      </p>
                    )}
                    {selectedClub.schedule && (
                      <div>
                        <p className="text-text-secondary text-sm flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-primary" /> Horaires
                        </p>
                        <p className="text-text-muted text-sm whitespace-pre-line ml-6">{selectedClub.schedule}</p>
                      </div>
                    )}
                    {selectedClub.disciplines?.length > 0 && (
                      <div>
                        <p className="text-text-secondary text-sm mb-2">Disciplines:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedClub.disciplines.map((disc, idx) => (
                            <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                              {disc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Technical Director */}
                  <div className="space-y-4">
                    <h3 className="font-oswald text-lg text-text-primary uppercase">Directeur Technique</h3>
                    {selectedClub.technical_director ? (
                      <div className="flex items-center gap-3 bg-background/50 p-3 rounded-lg">
                        {selectedClub.technical_director.photo_url ? (
                          <img src={selectedClub.technical_director.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <UserCog className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="text-text-primary font-oswald">{selectedClub.technical_director.full_name}</p>
                          <p className="text-text-muted text-xs">{selectedClub.technical_director.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-text-muted text-sm">Non assigné</p>
                    )}
                    
                    {/* Instructors */}
                    <h3 className="font-oswald text-lg text-text-primary uppercase pt-4">Instructeurs</h3>
                    {selectedClub.instructors?.length > 0 ? (
                      <div className="space-y-2">
                        {selectedClub.instructors.map((inst) => (
                          <div key={inst.id} className="flex items-center gap-3 bg-background/50 p-2 rounded-lg">
                            <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                              <Award className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-text-primary text-sm">{inst.full_name}</p>
                              <p className="text-text-muted text-xs">{inst.belt_grade}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-muted text-sm">Aucun instructeur assigné</p>
                    )}
                  </div>
                  
                  {/* Members */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-oswald text-lg text-text-primary uppercase">Membres</h3>
                      <Button
                        size="sm"
                        onClick={() => { setAssigningClub(selectedClub); setIsAssignOpen(true); }}
                        className="bg-primary hover:bg-primary-dark"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Ajouter
                      </Button>
                    </div>
                    {selectedClub.members?.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedClub.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between bg-background/50 p-2 rounded-lg group">
                            <div className="flex items-center gap-2">
                              {member.photo_url ? (
                                <img src={member.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                              )}
                              <div>
                                <p className="text-text-primary text-sm">{member.full_name}</p>
                                <p className="text-text-muted text-xs">{member.belt_grade || 'Non défini'}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveMember(selectedClub.id, member.id, member.full_name)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-1 rounded transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-muted text-sm">Aucun membre</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Club Modal */}
          {isEditOpen && editingClub && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setIsEditOpen(false)}>
              <div className="bg-paper rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="font-oswald text-xl text-text-primary uppercase">Modifier le club</h2>
                  <button onClick={() => setIsEditOpen(false)} className="text-text-muted hover:text-text-primary z-10">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label className="text-text-secondary">Nom du club</Label>
                      <Input
                        value={editingClub.name || ''}
                        onChange={(e) => setEditingClub({ ...editingClub, name: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                      />
                    </div>
                    <div>
                      <Label className="text-text-secondary">Ville</Label>
                      <Input
                        value={editingClub.city || ''}
                        onChange={(e) => setEditingClub({ ...editingClub, city: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                      />
                    </div>
                    <div>
                      <Label className="text-text-secondary">Pays</Label>
                      <Input
                        value={editingClub.country || ''}
                        onChange={(e) => setEditingClub({ ...editingClub, country: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-text-secondary">Adresse</Label>
                      <Input
                        value={editingClub.address || ''}
                        onChange={(e) => setEditingClub({ ...editingClub, address: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                      />
                    </div>
                    <div>
                      <Label className="text-text-secondary">Téléphone</Label>
                      <Input
                        value={editingClub.phone || ''}
                        onChange={(e) => setEditingClub({ ...editingClub, phone: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                      />
                    </div>
                    <div>
                      <Label className="text-text-secondary">Email</Label>
                      <Input
                        type="email"
                        value={editingClub.email || ''}
                        onChange={(e) => setEditingClub({ ...editingClub, email: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-text-secondary">Directeur Technique</Label>
                      <Select
                        value={editingClub.technical_director_id || ''}
                        onValueChange={(value) => setEditingClub({ ...editingClub, technical_director_id: value })}
                      >
                        <SelectTrigger className="mt-1 bg-background border-white/10">
                          <SelectValue placeholder="Sélectionner un DT" />
                        </SelectTrigger>
                        <SelectContent className="bg-paper border-white/10">
                          {directors.map((dt) => (
                            <SelectItem key={dt.id} value={dt.id} className="text-text-primary">
                              {dt.full_name} {dt.city ? `(${dt.city})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-text-secondary">Statut</Label>
                      <Select
                        value={editingClub.status || 'Actif'}
                        onValueChange={(value) => setEditingClub({ ...editingClub, status: value })}
                      >
                        <SelectTrigger className="mt-1 bg-background border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-paper border-white/10">
                          <SelectItem value="Actif" className="text-text-primary">Actif</SelectItem>
                          <SelectItem value="Inactif" className="text-text-primary">Inactif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-text-secondary">Horaires</Label>
                      <Textarea
                        value={editingClub.schedule || ''}
                        onChange={(e) => setEditingClub({ ...editingClub, schedule: e.target.value })}
                        className="mt-1 bg-background border-white/10"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-white/10">
                    Annuler
                  </Button>
                  <Button onClick={handleSaveClub} disabled={saving} className="bg-primary hover:bg-primary-dark">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Enregistrer
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Assign Member Modal */}
          {isAssignOpen && assigningClub && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-paper rounded-xl border border-white/10 w-full max-w-md">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="font-oswald text-xl text-text-primary uppercase">Ajouter un membre</h2>
                  <button onClick={() => setIsAssignOpen(false)} className="text-text-muted hover:text-text-primary">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-text-muted text-sm mb-4">
                    Ajouter un membre au club <strong className="text-text-primary">{assigningClub.name}</strong>
                  </p>
                  <Label className="text-text-secondary">Sélectionner un utilisateur</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="mt-1 bg-background border-white/10">
                      <SelectValue placeholder="Choisir un membre..." />
                    </SelectTrigger>
                    <SelectContent className="bg-paper border-white/10 max-h-60">
                      {allUsers
                        .filter(u => !u.club_id || u.club_id !== assigningClub.id)
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id} className="text-text-primary">
                            {user.full_name} ({user.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAssignOpen(false)} className="border-white/10">
                    Annuler
                  </Button>
                  <Button onClick={handleAssignMember} disabled={!selectedUserId} className="bg-primary hover:bg-primary-dark">
                    <Plus className="w-4 h-4 mr-2" /> Ajouter au club
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClubsPage;
