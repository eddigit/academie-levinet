import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../utils/api';
import { Search, Filter, Info, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { getFlag, getFlagByName } from '../utils/countries';
import UserAvatar from '../components/UserAvatar';
import { formatFirstName, formatLastName } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const MembersPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ country: '', city: '', technical_director_id: '', status: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
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

  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.first_name?.toLowerCase().includes(searchLower) ||
      member.last_name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.country?.toLowerCase().includes(searchLower)
    );
  });

  const countries = [...new Set(members.map(m => m.country).filter(Boolean))];

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
          {isAdmin && (
            <Button onClick={() => navigate('/admin/users')} className="bg-primary hover:bg-primary-dark text-white font-oswald uppercase">
              <Settings className="w-4 h-4 mr-2" /> Gérer les utilisateurs
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
                Pour ajouter, modifier ou supprimer un membre, rendez-vous dans la section{' '}
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
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Nom</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Pays / Ville</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Grade</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Statut</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member, index) => (
                    <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-smooth" data-testid={`member-row-${index}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {/* Photo */}
                          <div className="relative flex-shrink-0">
                            <UserAvatar
                              user={{
                                full_name: `${member.first_name} ${member.last_name}`,
                                photo_url: member.photo_url
                              }}
                              size="md"
                            />
                            {/* Flag badge */}
                            <span className="absolute -bottom-1 -right-1 text-sm">
                              {member.country_code ? getFlag(member.country_code) : getFlagByName(member.country)}
                            </span>
                          </div>
                          <span className="text-text-primary font-manrope">
                            {formatFirstName(member.first_name)} {formatLastName(member.last_name)}
                          </span>
                        </div>
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