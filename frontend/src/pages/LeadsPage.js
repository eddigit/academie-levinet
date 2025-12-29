import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { Users, Filter, Mail, Phone, MapPin, User, UserCircle, Shield, Sparkles, Phone as PhoneIcon, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_URL}/api`;

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, typeFilter]);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('person_type', typeFilter);
      
      const response = await axios.get(`${API}/leads?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Erreur lors du chargement des leads');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/leads/${leadId}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Statut mis à jour');
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Nouveau': return 'bg-primary/20 text-primary';
      case 'Contacté': return 'bg-accent/20 text-accent';
      case 'Converti': return 'bg-green-500/20 text-green-500';
      case 'Non intéressé': return 'bg-secondary/20 text-secondary';
      default: return 'bg-text-muted/20 text-text-muted';
    }
  };

  const getPersonTypeIcon = (type) => {
    switch (type) {
      case 'Femme': return User;
      case 'Homme': return UserCircle;
      case 'Enfant': return User;
      case 'Professionnel': return Shield;
      default: return User;
    }
  };

  const statsByStatus = {
    total: leads.length,
    new: leads.filter(l => l.status === 'Nouveau').length,
    contacted: leads.filter(l => l.status === 'Contacté').length,
    converted: leads.filter(l => l.status === 'Converti').length
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="leads-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-oswald text-4xl font-bold text-text-primary uppercase tracking-wide" data-testid="leads-title">
              Gestion des Leads
            </h1>
            <p className="text-text-secondary font-manrope mt-2">{leads.length} prospects</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-manrope">Total</p>
                <p className="text-2xl font-oswald font-bold text-text-primary">{statsByStatus.total}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-manrope">Nouveaux</p>
                <p className="text-2xl font-oswald font-bold text-text-primary">{statsByStatus.new}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <PhoneIcon className="w-6 h-6 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-manrope">Contactés</p>
                <p className="text-2xl font-oswald font-bold text-text-primary">{statsByStatus.contacted}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-manrope">Convertis</p>
                <p className="text-2xl font-oswald font-bold text-text-primary">{statsByStatus.converted}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="stat-card">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="filter-status" className="w-full md:w-48 bg-background border-border text-text-primary">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className="bg-paper border-border">
                <SelectItem value=" " className="text-text-primary">Tous les statuts</SelectItem>
                <SelectItem value="Nouveau" className="text-text-primary">Nouveau</SelectItem>
                <SelectItem value="Contacté" className="text-text-primary">Contacté</SelectItem>
                <SelectItem value="Converti" className="text-text-primary">Converti</SelectItem>
                <SelectItem value="Non intéressé" className="text-text-primary">Non intéressé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger data-testid="filter-type" className="w-full md:w-48 bg-background border-border text-text-primary">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-paper border-border">
                <SelectItem value=" " className="text-text-primary">Tous les types</SelectItem>
                <SelectItem value="Femme" className="text-text-primary">Femme</SelectItem>
                <SelectItem value="Homme" className="text-text-primary">Homme</SelectItem>
                <SelectItem value="Enfant" className="text-text-primary">Enfant</SelectItem>
                <SelectItem value="Professionnel" className="text-text-primary">Professionnel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Leads Table */}
        <div className="stat-card" data-testid="leads-table">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-text-secondary font-manrope">Chargement...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary font-manrope">Aucun lead trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Nom</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Contact</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Localisation</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Motivations</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Statut</th>
                    <th className="text-left py-3 px-4 text-sm font-oswald uppercase leading-none tracking-wide text-text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, index) => (
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-smooth" data-testid={`lead-row-${index}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {React.createElement(getPersonTypeIcon(lead.person_type), { 
                            className: "w-5 h-5 text-primary", 
                            strokeWidth: 1.5 
                          })}
                          <span className="text-text-primary font-manrope text-sm">{lead.person_type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-primary font-manrope font-medium">{lead.full_name}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-text-secondary text-sm">
                            <Mail className="w-4 h-4" />
                            <span className="font-manrope">{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-text-secondary text-sm">
                            <Phone className="w-4 h-4" />
                            <span className="font-manrope">{lead.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-text-secondary text-sm">
                          <MapPin className="w-4 h-4" />
                          <span className="font-manrope">{lead.city}, {lead.country}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {lead.motivations.map((mot, i) => (
                            <span key={i} className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs font-manrope">
                              {mot}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-manrope font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Select value={lead.status} onValueChange={(value) => updateLeadStatus(lead.id, value)}>
                          <SelectTrigger className="w-32 h-8 text-xs bg-background border-border text-text-primary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-paper border-border">
                            <SelectItem value="Nouveau" className="text-text-primary text-xs">Nouveau</SelectItem>
                            <SelectItem value="Contacté" className="text-text-primary text-xs">Contacté</SelectItem>
                            <SelectItem value="Converti" className="text-text-primary text-xs">Converti</SelectItem>
                            <SelectItem value="Non intéressé" className="text-text-primary text-xs">Non intéressé</SelectItem>
                          </SelectContent>
                        </Select>
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

export default LeadsPage;