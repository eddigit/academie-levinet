import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';
import { 
  Handshake, TrendingUp, MousePointerClick, Target, Users, DollarSign,
  ArrowUp, ArrowDown, Plus, Edit, Trash2, Eye, ExternalLink, Search,
  Calendar, BarChart3, PieChart as PieChartIcon, Link2, X, Loader2,
  Megaphone, UserPlus, Share2, Award
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

const AdminPartnersPage = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    totalAffiliates: 0,
    totalCommissions: 0,
    totalRevenue: 0
  });
  const [campaigns, setCampaigns] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editingAffiliate, setEditingAffiliate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, campaignsRes, affiliatesRes] = await Promise.all([
        api.get('/partners/stats'),
        api.get('/partners/campaigns'),
        api.get('/partners/affiliates')
      ]);
      setStats(statsRes.data);
      setCampaigns(campaignsRes.data);
      setAffiliates(affiliatesRes.data);
    } catch (error) {
      console.error('Error fetching partner data:', error);
      // Initialiser avec des données de démo
      setStats({
        totalCampaigns: 5,
        activeCampaigns: 3,
        totalClicks: 12450,
        totalConversions: 342,
        conversionRate: 2.75,
        totalAffiliates: 18,
        totalCommissions: 4250,
        totalRevenue: 28500
      });
      setCampaigns([
        { id: '1', name: 'Lancement 2025', status: 'active', type: 'display', budget: 5000, spent: 3200, clicks: 4500, conversions: 125, start_date: '2025-01-01', end_date: '2025-03-31' },
        { id: '2', name: 'Recrutement Clubs', status: 'active', type: 'social', budget: 3000, spent: 1800, clicks: 3200, conversions: 89, start_date: '2025-01-15', end_date: '2025-02-28' },
        { id: '3', name: 'Promo Équipements', status: 'paused', type: 'email', budget: 2000, spent: 2000, clicks: 2100, conversions: 67, start_date: '2024-11-01', end_date: '2024-12-31' },
        { id: '4', name: 'Stages Été 2025', status: 'draft', type: 'display', budget: 4000, spent: 0, clicks: 0, conversions: 0, start_date: '2025-06-01', end_date: '2025-08-31' },
        { id: '5', name: 'Newsletter Décembre', status: 'completed', type: 'email', budget: 1500, spent: 1500, clicks: 2650, conversions: 61, start_date: '2024-12-01', end_date: '2024-12-31' }
      ]);
      setAffiliates([
        { id: '1', name: 'MartialArts.fr', email: 'contact@martialarts.fr', code: 'MARTIAL25', clicks: 2340, conversions: 78, commission_rate: 15, total_earned: 1250, status: 'active', joined_at: '2024-06-15' },
        { id: '2', name: 'Combat Sport Zone', email: 'partenaire@csz.com', code: 'CSZ2025', clicks: 1890, conversions: 52, commission_rate: 12, total_earned: 890, status: 'active', joined_at: '2024-08-20' },
        { id: '3', name: 'FitBlog France', email: 'collab@fitblog.fr', code: 'FITBLOG', clicks: 1560, conversions: 41, commission_rate: 10, total_earned: 650, status: 'active', joined_at: '2024-09-10' },
        { id: '4', name: 'Self Defense Academy', email: 'admin@sda.org', code: 'SDA2025', clicks: 980, conversions: 28, commission_rate: 15, total_earned: 420, status: 'active', joined_at: '2024-10-05' },
        { id: '5', name: 'Sport Équipement Pro', email: 'pro@sportequip.com', code: 'SEP25', clicks: 450, conversions: 12, commission_rate: 8, total_earned: 180, status: 'inactive', joined_at: '2024-11-01' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const campaignTypeLabels = {
    display: { label: 'Display', color: 'bg-blue-500/20 text-blue-400' },
    social: { label: 'Réseaux Sociaux', color: 'bg-purple-500/20 text-purple-400' },
    email: { label: 'Email', color: 'bg-green-500/20 text-green-400' },
    search: { label: 'Recherche', color: 'bg-orange-500/20 text-orange-400' }
  };

  const statusLabels = {
    active: { label: 'Active', color: 'bg-green-500/20 text-green-400' },
    paused: { label: 'En pause', color: 'bg-yellow-500/20 text-yellow-400' },
    draft: { label: 'Brouillon', color: 'bg-gray-500/20 text-gray-400' },
    completed: { label: 'Terminée', color: 'bg-blue-500/20 text-blue-400' }
  };

  const chartDataClicks = [
    { month: 'Jan', clicks: 1200, conversions: 35 },
    { month: 'Fév', clicks: 1450, conversions: 42 },
    { month: 'Mar', clicks: 1800, conversions: 48 },
    { month: 'Avr', clicks: 1650, conversions: 45 },
    { month: 'Mai', clicks: 2100, conversions: 58 },
    { month: 'Jun', clicks: 2400, conversions: 65 },
    { month: 'Jul', clicks: 2250, conversions: 49 }
  ];

  const chartDataRevenue = [
    { month: 'Jan', revenue: 3200 },
    { month: 'Fév', revenue: 3800 },
    { month: 'Mar', revenue: 4200 },
    { month: 'Avr', revenue: 3900 },
    { month: 'Mai', revenue: 4800 },
    { month: 'Jun', revenue: 5200 },
    { month: 'Jul', revenue: 3400 }
  ];

  const pieDataCampaigns = [
    { name: 'Display', value: 45 },
    { name: 'Réseaux Sociaux', value: 30 },
    { name: 'Email', value: 15 },
    { name: 'Recherche', value: 10 }
  ];

  const deleteCampaign = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return;
    try {
      await api.delete(`/partners/campaigns/${id}`);
      setCampaigns(campaigns.filter(c => c.id !== id));
      toast.success('Campagne supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const deleteAffiliate = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet affilié ?')) return;
    try {
      await api.delete(`/partners/affiliates/${id}`);
      setAffiliates(affiliates.filter(a => a.id !== id));
      toast.success('Affilié supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAffiliates = affiliates.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="space-y-6 md:space-y-8" data-testid="admin-partners-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-oswald text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-3">
              <Handshake className="w-8 h-8 text-primary" />
              Partenaires & Sponsors
            </h1>
            <p className="text-text-secondary font-manrope mt-1 text-sm md:text-base">
              Gérez vos campagnes publicitaires et affiliés
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="stat-card p-4 md:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Megaphone className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-oswald font-bold text-text-primary mb-1">
              {stats.activeCampaigns}/{stats.totalCampaigns}
            </div>
            <div className="text-xs md:text-sm text-text-secondary font-manrope">Campagnes Actives</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-xs text-primary font-manrope">+2 ce mois</span>
            </div>
          </div>

          <div className="stat-card p-4 md:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-oswald font-bold text-text-primary mb-1">
              {stats.totalClicks.toLocaleString()}
            </div>
            <div className="text-xs md:text-sm text-text-secondary font-manrope">Clics Totaux</div>
            <div className="flex items-center gap-2 mt-2">
              <ArrowUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-manrope">+18% ce mois</span>
            </div>
          </div>

          <div className="stat-card p-4 md:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-oswald font-bold text-text-primary mb-1">
              {stats.totalConversions}
            </div>
            <div className="text-xs md:text-sm text-text-secondary font-manrope">Conversions ({stats.conversionRate}%)</div>
            <div className="flex items-center gap-2 mt-2">
              <ArrowUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-manrope">+12% ce mois</span>
            </div>
          </div>

          <div className="stat-card p-4 md:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-oswald font-bold text-text-primary mb-1">
              {stats.totalAffiliates}
            </div>
            <div className="text-xs md:text-sm text-text-secondary font-manrope">Affiliés Actifs</div>
            <div className="flex items-center gap-2 mt-2">
              <UserPlus className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-purple-400 font-manrope">+3 nouveaux</span>
            </div>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="stat-card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-xl font-oswald font-bold text-text-primary">
                  € {stats.totalRevenue.toLocaleString()}
                </div>
                <div className="text-xs text-text-secondary">Revenus générés</div>
              </div>
            </div>
          </div>
          
          <div className="stat-card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-xl font-oswald font-bold text-text-primary">
                  € {stats.totalCommissions.toLocaleString()}
                </div>
                <div className="text-xs text-text-secondary">Commissions versées</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Clicks & Conversions Chart */}
          <div className="bg-paper rounded-lg border border-white/10 p-4 md:p-6">
            <h3 className="font-oswald text-lg font-bold text-text-primary uppercase mb-4 tracking-wide flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Clics & Conversions
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartDataClicks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="clicks" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="conversions" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Campaign Distribution */}
          <div className="bg-paper rounded-lg border border-white/10 p-4 md:p-6">
            <h3 className="font-oswald text-lg font-bold text-text-primary uppercase mb-4 tracking-wide flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Répartition Campagnes
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDataCampaigns}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieDataCampaigns.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 rounded-t-lg font-oswald uppercase text-sm transition-colors ${
              activeTab === 'campaigns' 
                ? 'bg-primary text-white' 
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Megaphone className="w-4 h-4 inline-block mr-2" />
            Campagnes
          </button>
          <button
            onClick={() => setActiveTab('affiliates')}
            className={`px-4 py-2 rounded-t-lg font-oswald uppercase text-sm transition-colors ${
              activeTab === 'affiliates' 
                ? 'bg-primary text-white' 
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            <Share2 className="w-4 h-4 inline-block mr-2" />
            Affiliés
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              type="text"
              placeholder={activeTab === 'campaigns' ? 'Rechercher une campagne...' : 'Rechercher un affilié...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-paper border-white/10"
            />
          </div>
          <Button
            onClick={() => activeTab === 'campaigns' ? setShowCampaignModal(true) : setShowAffiliateModal(true)}
            className="bg-primary hover:bg-primary-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === 'campaigns' ? 'Nouvelle Campagne' : 'Nouvel Affilié'}
          </Button>
        </div>

        {/* Campaigns Table */}
        {activeTab === 'campaigns' && (
          <div className="bg-paper rounded-lg border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Campagne</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Type</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Statut</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Budget</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Clics</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Conversions</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-text-primary font-manrope font-medium">{campaign.name}</div>
                          <div className="text-xs text-text-muted">
                            {campaign.start_date} → {campaign.end_date}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-manrope ${campaignTypeLabels[campaign.type]?.color || 'bg-gray-500/20 text-gray-400'}`}>
                          {campaignTypeLabels[campaign.type]?.label || campaign.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-manrope ${statusLabels[campaign.status]?.color || 'bg-gray-500/20 text-gray-400'}`}>
                          {statusLabels[campaign.status]?.label || campaign.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-text-primary font-manrope">€{campaign.spent.toLocaleString()} / €{campaign.budget.toLocaleString()}</div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-primary font-manrope">{campaign.clicks.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="text-text-primary font-manrope">{campaign.conversions}</div>
                        <div className="text-xs text-text-muted">
                          {campaign.clicks > 0 ? ((campaign.conversions / campaign.clicks) * 100).toFixed(1) : 0}%
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { setEditingCampaign(campaign); setShowCampaignModal(true); }}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4 text-text-secondary" />
                          </button>
                          <button 
                            onClick={() => deleteCampaign(campaign.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Affiliates Table */}
        {activeTab === 'affiliates' && (
          <div className="bg-paper rounded-lg border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Affilié</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Code</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Statut</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Clics</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Conversions</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Commission</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Gains</th>
                    <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAffiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-text-primary font-manrope font-medium">{affiliate.name}</div>
                          <div className="text-xs text-text-muted">{affiliate.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="px-2 py-1 bg-white/10 rounded text-primary text-sm font-mono">
                          {affiliate.code}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-manrope ${
                          affiliate.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {affiliate.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-primary font-manrope">{affiliate.clicks.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="text-text-primary font-manrope">{affiliate.conversions}</div>
                        <div className="text-xs text-text-muted">
                          {affiliate.clicks > 0 ? ((affiliate.conversions / affiliate.clicks) * 100).toFixed(1) : 0}%
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-primary font-manrope">{affiliate.commission_rate}%</td>
                      <td className="py-3 px-4 text-green-400 font-manrope font-medium">€{affiliate.total_earned.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { setEditingAffiliate(affiliate); setShowAffiliateModal(true); }}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4 text-text-secondary" />
                          </button>
                          <button 
                            onClick={() => deleteAffiliate(affiliate.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Campaign Modal */}
        {showCampaignModal && (
          <CampaignModal
            campaign={editingCampaign}
            onClose={() => { setShowCampaignModal(false); setEditingCampaign(null); }}
            onSave={fetchData}
          />
        )}

        {/* Affiliate Modal */}
        {showAffiliateModal && (
          <AffiliateModal
            affiliate={editingAffiliate}
            onClose={() => { setShowAffiliateModal(false); setEditingAffiliate(null); }}
            onSave={fetchData}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

// Campaign Modal Component
const CampaignModal = ({ campaign, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    type: campaign?.type || 'display',
    status: campaign?.status || 'draft',
    budget: campaign?.budget || 0,
    start_date: campaign?.start_date || '',
    end_date: campaign?.end_date || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (campaign) {
        await api.put(`/partners/campaigns/${campaign.id}`, formData);
        toast.success('Campagne mise à jour');
      } else {
        await api.post('/partners/campaigns', formData);
        toast.success('Campagne créée');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-xl p-6 w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-oswald text-xl text-text-primary uppercase">
            {campaign ? 'Modifier la Campagne' : 'Nouvelle Campagne'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la campagne</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-text-primary"
              >
                <option value="display">Display</option>
                <option value="social">Réseaux Sociaux</option>
                <option value="email">Email</option>
                <option value="search">Recherche</option>
              </select>
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-text-primary"
              >
                <option value="draft">Brouillon</option>
                <option value="active">Active</option>
                <option value="paused">En pause</option>
                <option value="completed">Terminée</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="budget">Budget (€)</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
              required
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Date de début</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="end_date">Date de fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary-dark">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (campaign ? 'Mettre à jour' : 'Créer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Affiliate Modal Component
const AffiliateModal = ({ affiliate, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: affiliate?.name || '',
    email: affiliate?.email || '',
    code: affiliate?.code || '',
    commission_rate: affiliate?.commission_rate || 10,
    status: affiliate?.status || 'active'
  });
  const [saving, setSaving] = useState(false);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (affiliate) {
        await api.put(`/partners/affiliates/${affiliate.id}`, formData);
        toast.success('Affilié mis à jour');
      } else {
        await api.post('/partners/affiliates', formData);
        toast.success('Affilié créé');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-xl p-6 w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-oswald text-xl text-text-primary uppercase">
            {affiliate ? 'Modifier l\'Affilié' : 'Nouvel Affilié'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom / Société</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-white/5 border-white/10"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-white/5 border-white/10"
            />
          </div>

          <div>
            <Label htmlFor="code">Code Affilié</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                className="bg-white/5 border-white/10 font-mono"
              />
              <Button type="button" variant="outline" onClick={generateCode}>
                <Link2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="commission_rate">Commission (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                min="0"
                max="100"
                value={formData.commission_rate}
                onChange={(e) => setFormData({ ...formData, commission_rate: parseInt(e.target.value) })}
                required
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-text-primary"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary-dark">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (affiliate ? 'Mettre à jour' : 'Créer')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPartnersPage;
