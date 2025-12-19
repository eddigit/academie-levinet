import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, User, Search, Filter, 
  Trash2, Edit, Mail, Phone, MapPin, Crown, Loader2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import api from '../utils/api';
import { toast } from 'sonner';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'admin',
    phone: '',
    city: ''
  });

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

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ?`)) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    if (!window.confirm(`Changer le rôle en "${newRole}" ?`)) return;
    
    try {
      await api.put(`/admin/users/${userId}/role`, null, {
        params: { role: newRole }
      });
      toast.success(`Rôle mis à jour en "${newRole}"`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
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
        <div className="max-w-6xl mx-auto">
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
            
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-dark">
                  <UserPlus className="w-4 h-4 mr-2" /> Nouvel Utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-paper border-white/10 text-text-primary">
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
                    <Label className="text-text-secondary">Mot de passe *</Label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="mt-1 bg-background border-white/10"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Rôle *</Label>
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
                        <SelectItem value="member" className="text-text-primary">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" /> Membre
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
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

          {/* Users List */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="bg-paper rounded-xl border border-white/10 p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {user.photo_url ? (
                        <img 
                          src={user.photo_url} 
                          alt={user.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="font-oswald text-primary text-lg">
                            {user.full_name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-oswald text-text-primary">{user.full_name}</h3>
                        <p className="text-text-muted text-xs">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                      user.role === 'admin' 
                        ? 'bg-amber-500/20 text-amber-500' 
                        : 'bg-primary/20 text-primary'
                    }`}>
                      {user.role === 'admin' ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {user.role === 'admin' ? 'Admin' : 'Membre'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-text-secondary mb-4">
                    {user.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-text-muted" /> {user.phone}
                      </p>
                    )}
                    {user.city && (
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-text-muted" /> {user.city}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleRole(user.id, user.role)}
                      className="flex-1 border-white/10 text-xs"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role === 'admin' ? 'Rétrograder' : 'Promouvoir'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.full_name)}
                      className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUsersPage;
