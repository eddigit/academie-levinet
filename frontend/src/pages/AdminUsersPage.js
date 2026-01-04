import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Shield, User, Search, Filter, 
  Trash2, Edit, Mail, Phone, MapPin, Crown, Loader2, Key, Eye, EyeOff, X, Save, Award, Camera, Upload, GraduationCap, Building2, Globe
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import api, { getErrorMessage } from '../utils/api';
import { toast } from 'sonner';
import { formatFullName, getInitials } from '../lib/utils';

const beltGrades = [
  "Ceinture Blanche", "Ceinture Jaune", "Ceinture Orange", "Ceinture Verte",
  "Ceinture Bleue", "Ceinture Marron", "Ceinture Noire", "Ceinture Noire 1er Dan",
  "Ceinture Noire 2ème Dan", "Ceinture Noire 3ème Dan", "Ceinture Noire 4ème Dan",
  "Ceinture Noire 5ème Dan", "Instructeur", "Directeur Technique", "Directeur National"
];

// Rôles unifiés - Nouvelle structure
// Admin (3 personnes max) > Directeur Technique > Instructeur > Élève (avec club) > Élève Libre (sans club)
const roleLabels = {
  'admin': { label: 'Administrateur', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/20' },
  'directeur_technique': { label: 'Directeur Technique', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/20' },
  'instructeur': { label: 'Instructeur', icon: GraduationCap, color: 'text-red-500', bg: 'bg-red-500/20' },
  'eleve': { label: 'Élève', icon: User, color: 'text-primary', bg: 'bg-primary/20' },
  'eleve_libre': { label: 'Élève Libre', icon: Globe, color: 'text-green-500', bg: 'bg-green-500/20' },
  // Compatibilité anciens rôles (redirigent vers les nouveaux)
  'membre': { label: 'Élève', icon: User, color: 'text-primary', bg: 'bg-primary/20' },
  'fondateur': { label: 'Administrateur', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/20' },
  'directeur_national': { label: 'Administrateur', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/20' }
};

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Listes pour les affectations
  const [clubs, setClubs] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [technicalDirectors, setTechnicalDirectors] = useState([]);

  // Create user modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '', password: '', full_name: '', role: 'eleve', phone: '', city: '',
    country: 'France', belt_grade: '', send_email: true, club_id: '', instructor_id: '', technical_director_id: ''
  });
  const [newUserPhoto, setNewUserPhoto] = useState(null);
  const [newUserPhotoPreview, setNewUserPhotoPreview] = useState(null);

  // Edit user modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);

  // Password change modal
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  // Charger les clubs, instructeurs et DT au montage
  useEffect(() => {
    const fetchAffectations = async () => {
      try {
        // Charger les clubs
        const clubsResponse = await api.get('/clubs');
        setClubs(clubsResponse.data?.clubs || []);

        // Charger les instructeurs
        const instructorsResponse = await api.get('/admin/users?role=instructeur');
        setInstructors(instructorsResponse.data?.users || []);

        // Charger les directeurs techniques
        const dtResponse = await api.get('/admin/users?role=directeur_technique');
        setTechnicalDirectors(dtResponse.data?.users || []);
      } catch (error) {
        console.error('Error fetching affectations:', error);
      }
    };
    fetchAffectations();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users', {
        params: roleFilter ? { role: roleFilter } : {}
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    }
    setLoading(false);
  };

  const handlePhotoSelect = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 Mo');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) {
        setEditPhotoFile(file);
        setEditPhotoPreview(reader.result);
      } else {
        setNewUserPhoto(file);
        setNewUserPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result.split(',')[1];
          const response = await api.post('/upload/photo', {
            photo_base64: base64,
            filename: file.name
          });
          resolve(response.data.photo_url);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.full_name) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setCreating(true);
    try {
      // Upload photo if selected
      let photoUrl = null;
      if (newUserPhoto) {
        photoUrl = await uploadPhoto(newUserPhoto);
      }
      
      await api.post('/admin/users', {
        ...newUser,
        photo_url: photoUrl
      });
      
      toast.success(`${roleLabels[newUser.role]?.label || 'Utilisateur'} créé avec succès`);
      setIsCreateOpen(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'eleve', phone: '', city: '', country: 'France', belt_grade: '', send_email: true, club_id: '', instructor_id: '', technical_director_id: '' });
      setNewUserPhoto(null);
      setNewUserPhotoPreview(null);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(getErrorMessage(error, 'Erreur lors de la création'));
    }
    setCreating(false);
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setEditPhotoFile(null);
    setEditPhotoPreview(user.photo_url || null);
    setIsEditOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    setSaving(true);
    try {
      // Upload new photo if selected
      let photoUrl = editingUser.photo_url;
      if (editPhotoFile) {
        photoUrl = await uploadPhoto(editPhotoFile);
      }
      
      await api.put(`/admin/users/${editingUser.id}`, {
        ...editingUser,
        photo_url: photoUrl
      });
      
      toast.success('Utilisateur mis à jour');
      setIsEditOpen(false);
      setEditingUser(null);
      setEditPhotoFile(null);
      setEditPhotoPreview(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(getErrorMessage(error, 'Erreur lors de la mise à jour'));
    }
    setSaving(false);
  };

  const handleOpenPasswordModal = (userId) => {
    setPasswordUserId(userId);
    setNewPassword('');
    setShowPassword(false);
    setIsPasswordOpen(true);
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setChangingPassword(true);
    try {
      await api.put(`/admin/users/${passwordUserId}/password`, null, {
        params: { new_password: newPassword }
      });
      toast.success('Mot de passe modifié avec succès');
      setIsPasswordOpen(false);
      setNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(getErrorMessage(error, 'Erreur lors du changement de mot de passe'));
    }
    setChangingPassword(false);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ?\n\nCette action est irréversible.`)) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(getErrorMessage(error, 'Erreur lors de la suppression'));
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper pour obtenir le nom d'un club par son ID
  const getClubName = (clubId) => {
    if (!clubId) return null;
    const club = clubs.find(c => (c.id || c._id) === clubId);
    return club ? club.name : null;
  };

  // Vérifier si l'utilisateur courant est admin
  const isAdmin = currentUser?.role === 'admin';

  const getCounts = () => {
    return {
      total: users.length,
      admin: users.filter(u => u.role === 'admin').length,
      directeur_technique: users.filter(u => u.role === 'directeur_technique').length,
      instructeur: users.filter(u => u.role === 'instructeur').length,
      eleve: users.filter(u => u.role === 'eleve' || u.role === 'membre').length,
      eleve_libre: users.filter(u => u.role === 'eleve_libre').length
    };
  };
  
  const counts = getCounts();

  const getRoleDisplay = (role) => {
    const config = roleLabels[role] || roleLabels.eleve;
    const Icon = config.icon;
    return (
      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${config.bg} ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="font-oswald text-2xl md:text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              Gestion des Utilisateurs
            </h1>
            <p className="text-text-muted font-manrope mt-1 text-sm md:text-base">
              {counts.total} utilisateurs • {counts.admin} admin(s) • {counts.instructeur} instructeur(s) • {counts.eleve} élève(s) • {counts.eleve_libre} élève(s) libre(s)
            </p>
          </div>
          
          {/* Create User Button - Admin only */}
          {isAdmin && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-dark w-full md:w-auto">
                  <UserPlus className="w-4 h-4 mr-2" /> Nouvel Utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-paper border-white/10 text-text-primary max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-oswald text-xl uppercase">Créer un utilisateur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Photo Upload */}
                <div className="flex flex-col items-center gap-3">
                  <div 
                    className="w-24 h-24 rounded-full bg-background border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {newUserPhotoPreview ? (
                      <img src={newUserPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-text-muted" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handlePhotoSelect(e, false)}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-primary hover:underline"
                  >
                    {newUserPhotoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-text-secondary">Nom complet *</Label>
                    <Input
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                      className="mt-1 bg-background border-white/10"
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-text-secondary">Email *</Label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="mt-1 bg-background border-white/10"
                      placeholder="jean@academielevinet.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-text-secondary">Mot de passe (laisser vide pour générer)</Label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="mt-1 bg-background border-white/10"
                      placeholder="Généré automatiquement si vide"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-text-secondary">Type de compte *</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value, club_id: '', instructor_id: '', technical_director_id: '' })}
                    >
                      <SelectTrigger className="mt-1 bg-background border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-paper border-white/10">
                        <SelectItem value="admin" className="text-text-primary">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-amber-500" /> Administrateur
                          </div>
                        </SelectItem>
                        <SelectItem value="directeur_technique" className="text-text-primary">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-500" /> Directeur Technique
                          </div>
                        </SelectItem>
                        <SelectItem value="instructeur" className="text-text-primary">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-red-500" /> Instructeur
                          </div>
                        </SelectItem>
                        <SelectItem value="eleve" className="text-text-primary">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" /> Élève (avec club)
                          </div>
                        </SelectItem>
                        <SelectItem value="eleve_libre" className="text-text-primary">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-green-500" /> Élève Libre (sans club)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Affectations conditionnelles selon le rôle */}
                  {(newUser.role === 'eleve' || newUser.role === 'instructeur') && (
                    <div className="md:col-span-2">
                      <Label className="text-text-secondary">Club</Label>
                      <Select
                        value={newUser.club_id}
                        onValueChange={(value) => setNewUser({ ...newUser, club_id: value })}
                      >
                        <SelectTrigger className="mt-1 bg-background border-white/10">
                          <SelectValue placeholder="Sélectionner un club" />
                        </SelectTrigger>
                        <SelectContent className="bg-paper border-white/10 max-h-60">
                          <SelectItem value="" className="text-text-muted">Aucun</SelectItem>
                          {clubs.map((club) => (
                            <SelectItem key={club.id || club._id} value={club.id || club._id} className="text-text-primary">
                              {club.name} {club.city && `(${club.city})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newUser.role === 'eleve' && (
                    <div className="md:col-span-2">
                      <Label className="text-text-secondary">Instructeur référent</Label>
                      <Select
                        value={newUser.instructor_id}
                        onValueChange={(value) => setNewUser({ ...newUser, instructor_id: value })}
                      >
                        <SelectTrigger className="mt-1 bg-background border-white/10">
                          <SelectValue placeholder="Sélectionner un instructeur" />
                        </SelectTrigger>
                        <SelectContent className="bg-paper border-white/10 max-h-60">
                          <SelectItem value="" className="text-text-muted">Aucun</SelectItem>
                          {instructors.map((instr) => (
                            <SelectItem key={instr.id || instr._id} value={instr.id || instr._id} className="text-text-primary">
                              {formatFullName(instr.full_name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newUser.role === 'instructeur' && (
                    <div className="md:col-span-2">
                      <Label className="text-text-secondary">Directeur Technique référent</Label>
                      <Select
                        value={newUser.technical_director_id}
                        onValueChange={(value) => setNewUser({ ...newUser, technical_director_id: value })}
                      >
                        <SelectTrigger className="mt-1 bg-background border-white/10">
                          <SelectValue placeholder="Sélectionner un DT" />
                        </SelectTrigger>
                        <SelectContent className="bg-paper border-white/10 max-h-60">
                          <SelectItem value="" className="text-text-muted">Aucun</SelectItem>
                          {technicalDirectors.map((dt) => (
                            <SelectItem key={dt.id || dt._id} value={dt.id || dt._id} className="text-text-primary">
                              {formatFullName(dt.full_name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label className="text-text-secondary">Téléphone</Label>
                    <Input
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="mt-1 bg-background border-white/10"
                      placeholder="+33 6 00 00 00 00"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Ville</Label>
                    <Input
                      value={newUser.city}
                      onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                      className="mt-1 bg-background border-white/10"
                      placeholder="Paris"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Pays</Label>
                    <Input
                      value={newUser.country}
                      onChange={(e) => setNewUser({ ...newUser, country: e.target.value })}
                      className="mt-1 bg-background border-white/10"
                      placeholder="France"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Grade</Label>
                    <Select
                      value={newUser.belt_grade}
                      onValueChange={(value) => setNewUser({ ...newUser, belt_grade: value })}
                    >
                      <SelectTrigger className="mt-1 bg-background border-white/10">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent className="bg-paper border-white/10 max-h-60">
                        {beltGrades.map((grade) => (
                          <SelectItem key={grade} value={grade} className="text-text-primary">{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Switch
                    checked={newUser.send_email}
                    onCheckedChange={(checked) => setNewUser({ ...newUser, send_email: checked })}
                  />
                  <div>
                    <Label className="text-text-primary">Envoyer les identifiants par email</Label>
                    <p className="text-text-muted text-xs">L'utilisateur recevra un email avec ses accès</p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleCreateUser} 
                  disabled={creating}
                  className="w-full bg-primary hover:bg-primary-dark mt-4"
                >
                  {creating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Création...</>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-2" /> Créer l'utilisateur</>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
            <Input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-paper border-white/10 text-text-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={roleFilter === '' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('')}
              className={`${roleFilter === '' ? 'bg-primary' : 'border-white/10'} text-xs md:text-sm`}
              size="sm"
            >
              Tous ({counts.total})
            </Button>
            <Button
              variant={roleFilter === 'admin' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('admin')}
              className={`${roleFilter === 'admin' ? 'bg-amber-500 hover:bg-amber-600' : 'border-white/10'} text-xs md:text-sm`}
              size="sm"
            >
              <Crown className="w-3 h-3 mr-1" /> Admins ({counts.admin})
            </Button>
            <Button
              variant={roleFilter === 'directeur_technique' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('directeur_technique')}
              className={`${roleFilter === 'directeur_technique' ? 'bg-purple-500 hover:bg-purple-600' : 'border-white/10'} text-xs md:text-sm`}
              size="sm"
            >
              <Shield className="w-3 h-3 mr-1" /> DT ({counts.directeur_technique})
            </Button>
            <Button
              variant={roleFilter === 'instructeur' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('instructeur')}
              className={`${roleFilter === 'instructeur' ? 'bg-red-500 hover:bg-red-600' : 'border-white/10'} text-xs md:text-sm`}
              size="sm"
            >
              <GraduationCap className="w-3 h-3 mr-1" /> Instr. ({counts.instructeur})
            </Button>
            <Button
              variant={roleFilter === 'membre' ? 'default' : 'outline'}
              onClick={() => setRoleFilter('membre')}
              className={`${roleFilter === 'membre' ? 'bg-primary' : 'border-white/10'} text-xs md:text-sm`}
              size="sm"
            >
              <User className="w-3 h-3 mr-1" /> Membres ({counts.membre})
            </Button>
          </div>
        </div>

        {/* Users Grid - Mobile Cards / Desktop Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-text-muted">Chargement...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-paper rounded-xl border border-white/10">
            <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-paper rounded-xl border border-white/10 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {user.photo_url ? (
                      <img src={user.photo_url} alt={formatFullName(user.full_name)} className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-oswald text-xl text-primary">{getInitials(user.full_name)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-oswald text-text-primary truncate">{formatFullName(user.full_name)}</p>
                      <p className="text-text-muted text-xs truncate">{user.email}</p>
                      <div className="mt-1">{getRoleDisplay(user.role)}</div>
                    </div>
                  </div>
                  <div className="text-xs text-text-secondary space-y-1 mb-3">
                    {user.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {user.phone}</p>}
                    {user.city && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {user.city}, {user.country || 'France'}</p>}
                    {user.belt_grade && <p className="flex items-center gap-1"><Award className="w-3 h-3" /> {user.belt_grade}</p>}
                    {getClubName(user.club_id) && <p className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {getClubName(user.club_id)}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/members/${user.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full border-primary/30 text-primary text-xs">
                        <Eye className="w-3 h-3 mr-1" /> Voir
                      </Button>
                    </Link>
                    {isAdmin && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)} className="border-white/10 text-xs">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenPasswordModal(user.id)} className="border-white/10">
                          <Key className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id, user.full_name)} className="border-red-500/30 text-red-500">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-paper rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-background/50">
                    <th className="text-left p-4 text-text-muted font-manrope text-sm">Utilisateur</th>
                    <th className="text-left p-4 text-text-muted font-manrope text-sm">Contact</th>
                    <th className="text-left p-4 text-text-muted font-manrope text-sm">Rôle</th>
                    <th className="text-left p-4 text-text-muted font-manrope text-sm">Club</th>
                    <th className="text-left p-4 text-text-muted font-manrope text-sm">Grade</th>
                    <th className="text-left p-4 text-text-muted font-manrope text-sm">Statut</th>
                    <th className="text-right p-4 text-text-muted font-manrope text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {user.photo_url ? (
                            <img src={user.photo_url} alt={formatFullName(user.full_name)} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="font-oswald text-primary">{getInitials(user.full_name)}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-oswald text-text-primary">{formatFullName(user.full_name)}</p>
                            <p className="text-text-muted text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-text-secondary">
                          {user.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {user.phone}</p>}
                          {user.city && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {user.city}</p>}
                        </div>
                      </td>
                      <td className="p-4">{getRoleDisplay(user.role)}</td>
                      <td className="p-4">
                        <span className="text-text-secondary text-sm flex items-center gap-1">
                          {getClubName(user.club_id) ? (
                            <><Building2 className="w-3 h-3" /> {getClubName(user.club_id)}</>
                          ) : '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-text-secondary text-sm">{user.belt_grade || '-'}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {user.has_paid_license && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded w-fit">Licence</span>
                          )}
                          {user.is_premium && (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-xs rounded w-fit">Premium</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Link to={`/members/${user.id}`}>
                            <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10" title="Voir la fiche">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          {isAdmin && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleEditUser(user)} className="border-white/10 text-text-secondary hover:text-text-primary">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleOpenPasswordModal(user.id)} className="border-white/10 text-text-secondary hover:text-text-primary" title="Changer le mot de passe">
                                <Key className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id, user.full_name)} className="border-red-500/30 text-red-500 hover:bg-red-500/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Edit User Modal */}
        {isEditOpen && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-paper rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-paper z-10">
                <h2 className="font-oswald text-lg md:text-xl text-text-primary uppercase">Modifier l'utilisateur</h2>
                <button onClick={() => setIsEditOpen(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                {/* Photo Upload */}
                <div className="flex flex-col items-center gap-3 pb-4 border-b border-white/10">
                  <div 
                    className="w-24 h-24 rounded-full bg-background border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden relative group"
                    onClick={() => editFileInputRef.current?.click()}
                  >
                    {editPhotoPreview ? (
                      <>
                        <img src={editPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <Camera className="w-8 h-8 text-text-muted" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    onChange={(e) => handlePhotoSelect(e, true)}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="text-sm text-primary hover:underline"
                  >
                    {editPhotoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-text-secondary">Nom complet</Label>
                    <Input
                      value={editingUser.full_name || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                      className="mt-1 bg-background border-white/10 text-text-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Email</Label>
                    <Input
                      type="email"
                      value={editingUser.email || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="mt-1 bg-background border-white/10 text-text-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Téléphone</Label>
                    <Input
                      value={editingUser.phone || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="mt-1 bg-background border-white/10 text-text-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Ville</Label>
                    <Input
                      value={editingUser.city || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })}
                      className="mt-1 bg-background border-white/10 text-text-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Pays</Label>
                    <Input
                      value={editingUser.country || 'France'}
                      onChange={(e) => setEditingUser({ ...editingUser, country: e.target.value })}
                      className="mt-1 bg-background border-white/10 text-text-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Rôle</Label>
                    <Select
                      value={editingUser.role || 'membre'}
                      onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                    >
                      <SelectTrigger className="mt-1 bg-background border-white/10 text-text-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-paper border-white/10">
                        <SelectItem value="admin" className="text-text-primary">Administrateur</SelectItem>
                        <SelectItem value="fondateur" className="text-text-primary">Fondateur</SelectItem>
                        <SelectItem value="directeur_national" className="text-text-primary">Directeur National</SelectItem>
                        <SelectItem value="directeur_technique" className="text-text-primary">Directeur Technique</SelectItem>
                        <SelectItem value="instructeur" className="text-text-primary">Instructeur</SelectItem>
                        <SelectItem value="membre" className="text-text-primary">Membre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-text-secondary">Grade</Label>
                    <Select
                      value={editingUser.belt_grade || ''}
                      onValueChange={(value) => setEditingUser({ ...editingUser, belt_grade: value })}
                    >
                      <SelectTrigger className="mt-1 bg-background border-white/10 text-text-primary">
                        <SelectValue placeholder="Sélectionner un grade" />
                      </SelectTrigger>
                      <SelectContent className="bg-paper border-white/10 max-h-60">
                        {beltGrades.map((grade) => (
                          <SelectItem key={grade} value={grade} className="text-text-primary">{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Affectations conditionnelles selon le rôle */}
                {(editingUser.role === 'eleve' || editingUser.role === 'instructeur') && (
                  <div className="mt-4">
                    <Label className="text-text-secondary">Club</Label>
                    <Select
                      value={editingUser.club_id || ''}
                      onValueChange={(value) => setEditingUser({ ...editingUser, club_id: value })}
                    >
                      <SelectTrigger className="mt-1 bg-background border-white/10 text-text-primary">
                        <SelectValue placeholder="Sélectionner un club" />
                      </SelectTrigger>
                      <SelectContent className="bg-paper border-white/10 max-h-60">
                        <SelectItem value="" className="text-text-muted">Aucun</SelectItem>
                        {clubs.map((club) => (
                          <SelectItem key={club.id || club._id} value={club.id || club._id} className="text-text-primary">
                            {club.name} {club.city && `(${club.city})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {editingUser.role === 'eleve' && (
                  <div className="mt-4">
                    <Label className="text-text-secondary">Instructeur référent</Label>
                    <Select
                      value={editingUser.instructor_id || ''}
                      onValueChange={(value) => setEditingUser({ ...editingUser, instructor_id: value })}
                    >
                      <SelectTrigger className="mt-1 bg-background border-white/10 text-text-primary">
                        <SelectValue placeholder="Sélectionner un instructeur" />
                      </SelectTrigger>
                      <SelectContent className="bg-paper border-white/10 max-h-60">
                        <SelectItem value="" className="text-text-muted">Aucun</SelectItem>
                        {instructors.map((instr) => (
                          <SelectItem key={instr.id || instr._id} value={instr.id || instr._id} className="text-text-primary">
                            {instr.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {editingUser.role === 'instructeur' && (
                  <div className="mt-4">
                    <Label className="text-text-secondary">Directeur Technique référent</Label>
                    <Select
                      value={editingUser.technical_director_id || ''}
                      onValueChange={(value) => setEditingUser({ ...editingUser, technical_director_id: value })}
                    >
                      <SelectTrigger className="mt-1 bg-background border-white/10 text-text-primary">
                        <SelectValue placeholder="Sélectionner un DT" />
                      </SelectTrigger>
                      <SelectContent className="bg-paper border-white/10 max-h-60">
                        <SelectItem value="" className="text-text-muted">Aucun</SelectItem>
                        {technicalDirectors.map((dt) => (
                          <SelectItem key={dt.id || dt._id} value={dt.id || dt._id} className="text-text-primary">
                            {formatFullName(dt.full_name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={editingUser.has_paid_license || false}
                      onCheckedChange={(checked) => setEditingUser({ ...editingUser, has_paid_license: checked })}
                    />
                    <Label className="text-text-secondary">Licence payée</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={editingUser.is_premium || false}
                      onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_premium: checked })}
                    />
                    <Label className="text-text-secondary">Premium</Label>
                  </div>
                </div>
              </div>
              <div className="p-4 md:p-6 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 bg-paper">
                <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-white/10 w-full sm:w-auto">
                  Annuler
                </Button>
                <Button onClick={handleSaveUser} disabled={saving} className="bg-primary hover:bg-primary-dark w-full sm:w-auto">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {isPasswordOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-paper rounded-xl border border-white/10 w-full max-w-md">
              <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="font-oswald text-lg md:text-xl text-text-primary uppercase flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" /> Changer le mot de passe
                </h2>
                <button onClick={() => setIsPasswordOpen(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 md:p-6">
                <p className="text-text-muted text-sm mb-4">
                  Définissez un nouveau mot de passe pour cet utilisateur.
                </p>
                <div className="relative">
                  <Label className="text-text-secondary">Nouveau mot de passe</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-background border-white/10 text-text-primary pr-10"
                      placeholder="Minimum 6 caractères"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 md:p-6 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-3">
                <Button variant="outline" onClick={() => setIsPasswordOpen(false)} className="border-white/10 w-full sm:w-auto">
                  Annuler
                </Button>
                <Button 
                  onClick={handleChangePassword} 
                  disabled={changingPassword || newPassword.length < 6}
                  className="bg-primary hover:bg-primary-dark w-full sm:w-auto"
                >
                  {changingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                  Changer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
