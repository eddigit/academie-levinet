import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../utils/api';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ country: '', city: '', technical_director_id: '', status: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    country: '',
    city: '',
    technical_director_id: '',
    belt_grade: 'Ceinture Blanche',
    membership_type: 'Standard',
    membership_start_date: '',
    membership_end_date: ''
  });

  useEffect(() => {
    fetchMembers();
    fetchDirectors();
  }, [filters]);

  const fetchMembers = async () => {
    try {
      const data = await api.getMembers(filters);
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Erreur lors du chargement des membres');
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectors = async () => {
    try {
      const data = await api.getTechnicalDirectors();
      setDirectors(data);
    } catch (error) {
      console.error('Error fetching directors:', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.createMember(formData);
      toast.success('Membre ajouté avec succès');
      setIsAddModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        country: '',
        city: '',
        technical_director_id: '',
        belt_grade: 'Ceinture Blanche',
        membership_type: 'Standard',
        membership_start_date: '',
        membership_end_date: ''
      });
      fetchMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Erreur lors de l\'ajout du membre');
    }
  };

  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.first_name.toLowerCase().includes(searchLower) ||
      member.last_name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.country.toLowerCase().includes(searchLower)
    );
  });

  const countries = [...new Set(members.map(m => m.country))];
  const cities = [...new Set(members.map(m => m.city))];

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="members-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-oswald text-4xl font-bold text-text-primary uppercase tracking-wide" data-testid="members-title">
              Gestion des Membres
            </h1>
            <p className="text-text-secondary font-manrope mt-2">{filteredMembers.length} membres</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-member-button" className="bg-primary hover:bg-primary-dark text-white font-oswald uppercase">
                <Plus className="w-4 h-4 mr-2" /> Ajouter un Membre
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-paper border-border max-w-2xl max-h-[90vh] overflow-y-auto z-50" data-testid="add-member-modal">
              <DialogHeader>
                <DialogTitle className="font-oswald text-2xl text-text-primary uppercase">Nouveau Membre</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-text-secondary">Prénom</Label>
                    <Input
                      data-testid="input-first-name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                      className="bg-background border-border text-text-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Nom</Label>
                    <Input
                      data-testid="input-last-name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                      className="bg-background border-border text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-text-secondary">Email</Label>
                  <Input
                    data-testid="input-member-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-background border-border text-text-primary"
                  />
                </div>

                <div>
                  <Label className="text-text-secondary">Téléphone</Label>
                  <Input
                    data-testid="input-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-background border-border text-text-primary"
                  />
                </div>

                <div>
                  <Label className="text-text-secondary">Date de naissance</Label>
                  <Input
                    data-testid="input-dob"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    required
                    className="bg-background border-border text-text-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-text-secondary">Pays</Label>
                    <Input
                      data-testid="input-country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      required
                      className="bg-background border-border text-text-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Ville</Label>
                    <Input
                      data-testid="input-city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="bg-background border-border text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-text-secondary">Directeur Technique</Label>
                  <Select
                    value={formData.technical_director_id}
                    onValueChange={(value) => setFormData({ ...formData, technical_director_id: value })}
                  >
                    <SelectTrigger data-testid="select-director" className="bg-background border-border text-text-primary">
                      <SelectValue placeholder="Sélectionner un directeur" />
                    </SelectTrigger>
                    <SelectContent className="bg-paper border-border">
                      {directors.map((dir) => (
                        <SelectItem key={dir.id} value={dir.id} className="text-text-primary">
                          {dir.name} - {dir.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-text-secondary">Grade (Ceinture)</Label>
                  <Select
                    value={formData.belt_grade}
                    onValueChange={(value) => setFormData({ ...formData, belt_grade: value })}
                  >
                    <SelectTrigger data-testid="select-belt" className="bg-background border-border text-text-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-paper border-border">
                      <SelectItem value="Ceinture Blanche" className="text-text-primary">Ceinture Blanche</SelectItem>
                      <SelectItem value="Ceinture Jaune" className="text-text-primary">Ceinture Jaune</SelectItem>
                      <SelectItem value="Ceinture Orange" className="text-text-primary">Ceinture Orange</SelectItem>
                      <SelectItem value="Ceinture Verte" className="text-text-primary">Ceinture Verte</SelectItem>
                      <SelectItem value="Ceinture Bleue" className="text-text-primary">Ceinture Bleue</SelectItem>
                      <SelectItem value="Ceinture Marron" className="text-text-primary">Ceinture Marron</SelectItem>
                      <SelectItem value="Ceinture Noire" className="text-text-primary">Ceinture Noire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-text-secondary">Type d'adhésion</Label>
                  <Select
                    value={formData.membership_type}
                    onValueChange={(value) => setFormData({ ...formData, membership_type: value })}
                  >
                    <SelectTrigger data-testid="select-membership-type" className="bg-background border-border text-text-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-paper border-border">
                      <SelectItem value="Standard" className="text-text-primary">Standard</SelectItem>
                      <SelectItem value="Premium" className="text-text-primary">Premium</SelectItem>
                      <SelectItem value="VIP" className="text-text-primary">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-text-secondary">Date de début</Label>
                    <Input
                      data-testid="input-start-date"
                      type="date"
                      value={formData.membership_start_date}
                      onChange={(e) => setFormData({ ...formData, membership_start_date: e.target.value })}
                      required
                      className="bg-background border-border text-text-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-text-secondary">Date de fin</Label>
                    <Input
                      data-testid="input-end-date"
                      type="date"
                      value={formData.membership_end_date}
                      onChange={(e) => setFormData({ ...formData, membership_end_date: e.target.value })}
                      required
                      className="bg-background border-border text-text-primary"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  data-testid="submit-member-button"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-oswald uppercase"
                >
                  Ajouter le Membre
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <div className="stat-card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <Input
                data-testid="search-input"
                type="text"
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border text-text-primary"
              />
            </div>
            <Select value={filters.country} onValueChange={(value) => setFilters({ ...filters, country: value })}>
              <SelectTrigger data-testid="filter-country" className="w-full md:w-48 bg-background border-border text-text-primary">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Pays" />
              </SelectTrigger>
              <SelectContent className="bg-paper border-border">
                <SelectItem value=" " className="text-text-primary">Tous les pays</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country} className="text-text-primary">{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Members Table */}
        <div className="stat-card" data-testid="members-table">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-text-secondary font-manrope">Chargement...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary font-manrope">Aucun membre trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase tracking-wide text-text-secondary">Nom</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase tracking-wide text-text-secondary">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase tracking-wide text-text-secondary">Pays / Ville</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase tracking-wide text-text-secondary">Grade</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase tracking-wide text-text-secondary">Statut</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase tracking-wide text-text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member, index) => (
                    <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-smooth" data-testid={`member-row-${index}`}>
                      <td className="py-3 px-4 text-text-primary font-manrope">
                        {member.first_name} {member.last_name}
                      </td>
                      <td className="py-3 px-4 text-text-secondary font-manrope text-sm">{member.email}</td>
                      <td className="py-3 px-4 text-text-secondary font-manrope">{member.city}, {member.country}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-manrope font-medium">
                          {member.belt_grade}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-manrope font-medium ${
                          member.membership_status === 'Actif' ? 'bg-primary/20 text-primary' :
                          member.membership_status === 'Expiré' ? 'bg-secondary/20 text-secondary' :
                          'bg-text-muted/20 text-text-muted'
                        }`}>
                          {member.membership_status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link 
                          to={`/members/${member.id}`}
                          data-testid={`view-member-${index}`}
                          className="text-primary hover:text-primary-light font-manrope text-sm transition-smooth"
                        >
                          Voir détails
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MembersPage;