import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import SocialWall from '../components/SocialWall';
import { api } from '../utils/api';
import { Users, DollarSign, TrendingUp, UserCheck, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64" data-testid="loading-spinner">
          <div className="text-text-primary font-oswald text-xl">Chargement...</div>
        </div>
      </DashboardLayout>
    );
  }

  const COLORS = ['#3B82F6', '#EF4444', '#F97316', '#10B981', '#8B5CF6'];

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="dashboard-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-oswald text-4xl font-bold text-text-primary uppercase tracking-wide" data-testid="dashboard-title">
              Tableau de Bord
            </h1>
            <p className="text-text-secondary font-manrope mt-2">Statistiques et vue d'ensemble</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="stats-cards">
          <div className="stat-card" data-testid="stat-card-members">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-oswald font-bold text-text-primary mb-2">
              {stats?.total_members || 0}
            </div>
            <div className="text-sm text-text-secondary font-manrope">Nombre d'utilisateurs</div>
            <div className="flex items-center gap-2 mt-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-manrope">+10% ce mois-ci</span>
            </div>
          </div>

          <div className="stat-card" data-testid="stat-card-revenue">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div className="text-3xl font-oswald font-bold text-text-primary mb-2">
              € {stats?.total_revenue?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-text-secondary font-manrope">Chiffre d'affaires</div>
            <div className="flex items-center gap-2 mt-3">
              <ArrowDown className="w-4 h-4 text-secondary" />
              <span className="text-xs text-secondary font-manrope">-5% ce mois-ci</span>
            </div>
          </div>

          <div className="stat-card" data-testid="stat-card-active">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-oswald font-bold text-text-primary mb-2">
              {stats?.active_memberships || 0}
            </div>
            <div className="text-sm text-text-secondary font-manrope">Adhésions actives</div>
            <div className="flex items-center gap-2 mt-3">
              <ArrowUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-manrope">En ce mois-ci</span>
            </div>
          </div>

          <div className="stat-card" data-testid="stat-card-new">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <div className="text-3xl font-oswald font-bold text-text-primary mb-2">
              {stats?.new_members_this_month || 0}
            </div>
            <div className="text-sm text-text-secondary font-manrope">Nouveaux membres</div>
            <div className="flex items-center gap-2 mt-3">
              <ArrowUp className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary font-manrope">Ce mois</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-8 stat-card" data-testid="chart-members-by-month">
            <h3 className="font-oswald text-xl font-bold text-text-primary uppercase mb-6 tracking-wide">
              Stats Récentes
            </h3>
            <p className="text-sm text-text-secondary font-manrope mb-6">Nouvelles adhésions par mois</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.members_by_month || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="lg:col-span-4 stat-card" data-testid="chart-members-by-country">
            <h3 className="font-oswald text-xl font-bold text-text-primary uppercase mb-6 tracking-wide">
              Répartition
            </h3>
            <p className="text-sm text-text-secondary font-manrope mb-6">Membres par pays</p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.members_by_country || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ country, percent }) => `${country}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="country"
                >
                  {(stats?.members_by_country || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Members */}
        <div className="stat-card" data-testid="recent-members-section">
          <h3 className="font-oswald text-xl font-bold text-text-primary uppercase mb-6 tracking-wide">
            Membres Récents
          </h3>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-sm font-oswald uppercase tracking-wide text-text-secondary">Nom</th>
                  <th className="text-left py-3 px-4 text-sm font-oswald uppercase tracking-wide text-text-secondary">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-oswald uppercase tracking-wide text-text-secondary">Pays</th>
                  <th className="text-left py-3 px-4 text-sm font-oswald uppercase tracking-wide text-text-secondary">Grade</th>
                  <th className="text-left py-3 px-4 text-sm font-oswald uppercase tracking-wide text-text-secondary">Statut</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_members?.map((member, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-smooth" data-testid={`recent-member-${index}`}>
                    <td className="py-3 px-4 text-text-primary font-manrope">{member.first_name} {member.last_name}</td>
                    <td className="py-3 px-4 text-text-secondary font-manrope text-sm">{member.email}</td>
                    <td className="py-3 px-4 text-text-secondary font-manrope">{member.country}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;