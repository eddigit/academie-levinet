import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, User, Search, Filter, 
  Trash2, Edit, Mail, Phone, MapPin, Crown, Loader2, Key, Eye, EyeOff, X, Save, Award
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import api from '../utils/api';
import { toast } from 'sonner';

const beltGrades = [
  "Ceinture Blanche", "Ceinture Jaune", "Ceinture Orange", "Ceinture Verte",
  "Ceinture Bleue", "Ceinture Marron", "Ceinture Noire", "Ceinture Noire 1er Dan",
  "Ceinture Noire 2ème Dan", "Ceinture Noire 3ème Dan", "Ceinture Noire 4ème Dan",
  "Ceinture Noire 5ème Dan", "Instructeur", "Directeur Technique", "Directeur National"
];

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Create user modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '', password: '', full_name: '', role: 'admin', phone: '', city: '', 
    belt_grade: '', send_email: true
  });
  
  // Edit user modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Password change modal
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

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

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setCreating(true);
    try {
      await api.post('/admin/users', newUser);
      toast.success(`Utilisateur ${newUser.role} créé avec succès`);
      setIsCreateOpen(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'admin', phone: '', city: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    }
    setCreating(false);
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setIsEditOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    setSaving(true);
    try {
      await api.put(`/admin/users/${editingUser.id}`, editingUser);
      toast.success('Utilisateur mis à jour');
      setIsEditOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
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
      toast.error(error.response?.data?.detail || 'Erreur lors du changement de mot de passe');
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
      toast.error(error.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const memberCount = users.filter(u => u.role === 'member').length;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                Gestion des Utilisateurs
              </h1>
              <p className="text-text-muted font-manrope mt-1">
                {adminCount} admin(s) • {memberCount} membre(s)
              </p>
            </div>
            
            {/* Create User Button */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-dark">
                  <UserPlus className="w-4 h-4 mr-2" /> Nouvel Utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-paper border-white/10 text-text-primary max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-oswald text-xl uppercase">Créer un utilisateur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-text-secondary">Nom complet *</Label>
                    <Input
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                      className="mt-1 bg-background border-white/10"
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Email *</Label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="mt-1 bg-background border-white/10"
                      placeholder="jean@academie-levinet.com"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Mot de passe (laisser vide pour générer automatiquement)</Label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="mt-1 bg-background border-white/10"
                      placeholder="Généré automatiquement si vide"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Type de compte *</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value })}
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
                        <SelectItem value="technical_director" className="text-text-primary">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-500" /> Directeur Technique
                          </div>
                        </SelectItem>
                        <SelectItem value="instructor" className="text-text-primary">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-red-500" /> Instructeur
                          </div>
                        </SelectItem>
                        <SelectItem value="member" className="text-text-primary">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" /> Membre
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                  <div className="grid grid-cols-2 gap-4">
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
            <div className="flex gap-2">
              <Button
                variant={roleFilter === '' ? 'default' : 'outline'}
                onClick={() => setRoleFilter('')}
                className={roleFilter === '' ? 'bg-primary' : 'border-white/10'}
              >
                <Filter className="w-4 h-4 mr-2" /> Tous
              </Button>
              <Button
                variant={roleFilter === 'admin' ? 'default' : 'outline'}
                onClick={() => setRoleFilter('admin')}
                className={roleFilter === 'admin' ? 'bg-amber-500 hover:bg-amber-600' : 'border-white/10'}
              >
                <Crown className="w-4 h-4 mr-2" /> Admins
              </Button>
              <Button
                variant={roleFilter === 'member' ? 'default' : 'outline'}
                onClick={() => setRoleFilter('member')}
                className={roleFilter === 'member' ? 'bg-primary' : 'border-white/10'}
              >
                <User className="w-4 h-4 mr-2" /> Membres
              </Button>
            </div>
          </div>

          {/* Users Table */}
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
            <div className="bg-paper rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-background/50">
                    <th className="text-left p-4 text-text-muted font-manrope text-sm">Utilisateur</th>
                    <th className="text-left p-4 text-text-muted font-manrope text-sm">Contact</th>
                    <th className="text-left p-4 text-text-muted font-manrope text-sm">Rôle</th>
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
                            <img src={user.photo_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="font-oswald text-primary">{user.full_name?.charAt(0)?.toUpperCase()}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-oswald text-text-primary">{user.full_name}</p>
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
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 w-fit ${
                          user.role === 'admin' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'
                        }`}>
                          {user.role === 'admin' ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {user.role === 'admin' ? 'Admin' : 'Membre'}
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="border-white/10 text-text-secondary hover:text-text-primary"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPasswordModal(user.id)}
                            className="border-white/10 text-text-secondary hover:text-text-primary"
                            title="Changer le mot de passe"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.full_name)}
                            className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Edit User Modal */}
          {isEditOpen && editingUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-paper rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="font-oswald text-xl text-text-primary uppercase">Modifier l'utilisateur</h2>
                  <button onClick={() => setIsEditOpen(false)} className="text-text-muted hover:text-text-primary">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                        value={editingUser.role || 'member'}
                        onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                      >
                        <SelectTrigger className="mt-1 bg-background border-white/10 text-text-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-paper border-white/10">
                          <SelectItem value="admin" className="text-text-primary">Administrateur</SelectItem>
                          <SelectItem value="member" className="text-text-primary">Membre</SelectItem>
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
                        <SelectContent className="bg-paper border-white/10">
                          {beltGrades.map((grade) => (
                            <SelectItem key={grade} value={grade} className="text-text-primary">{grade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-text-secondary">Club</Label>
                      <Input
                        value={editingUser.club_name || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, club_name: e.target.value })}
                        className="mt-1 bg-background border-white/10 text-text-primary"
                      />
                    </div>
                    <div>
                      <Label className="text-text-secondary">Instructeur</Label>
                      <Input
                        value={editingUser.instructor_name || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, instructor_name: e.target.value })}
                        className="mt-1 bg-background border-white/10 text-text-primary"
                      />
                    </div>
                    <div>
                      <Label className="text-text-secondary">URL Photo</Label>
                      <Input
                        value={editingUser.photo_url || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, photo_url: e.target.value })}
                        className="mt-1 bg-background border-white/10 text-text-primary"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-6 pt-4 border-t border-white/10">
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
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-white/10">
                    Annuler
                  </Button>
                  <Button onClick={handleSaveUser} disabled={saving} className="bg-primary hover:bg-primary-dark">
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
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="font-oswald text-xl text-text-primary uppercase flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" /> Changer le mot de passe
                  </h2>
                  <button onClick={() => setIsPasswordOpen(false)} className="text-text-muted hover:text-text-primary">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-text-muted text-sm mb-4">
                    Définissez un nouveau mot de passe pour cet utilisateur. Il devra utiliser ce mot de passe pour se connecter.
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
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsPasswordOpen(false)} className="border-white/10">
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={changingPassword || newPassword.length < 6}
                    className="bg-primary hover:bg-primary-dark"
                  >
                    {changingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
                    Changer le mot de passe
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

export default AdminUsersPage;
