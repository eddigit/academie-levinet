import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../utils/api';
import { Users, DollarSign, TrendingUp, UserCheck, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const AdminStatsPage = () => {
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
      <div className="space-y-6 md:space-y-8" data-testid="admin-stats-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-manrope">Retour au mur</span>
            </Link>
            <h1 className="font-oswald text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary uppercase tracking-wide">
              Statistiques
            </h1>
            <p className="text-text-secondary font-manrope mt-1 text-sm md:text-base">
              Vue d'ensemble et analyses détaillées
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" data-testid="stats-cards">
          <div className="stat-card p-4 md:p-6">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-oswald font-bold text-text-primary mb-1 md:mb-2">
              {stats?.total_members || 0}
            </div>
            <div className="text-xs md:text-sm text-text-secondary font-manrope">Nombre d'utilisateurs</div>
            <div className="flex items-center gap-2 mt-2 md:mt-3">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              <span className="text-[10px] md:text-xs text-primary font-manrope">+10% ce mois-ci</span>
            </div>
          </div>

          <div className="stat-card p-4 md:p-6">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-oswald font-bold text-text-primary mb-1 md:mb-2">
              € {stats?.total_revenue?.toLocaleString() || 0}
            </div>
            <div className="text-xs md:text-sm text-text-secondary font-manrope">Chiffre d'affaires</div>
            <div className="flex items-center gap-2 mt-2 md:mt-3">
              <ArrowDown className="w-3 h-3 md:w-4 md:h-4 text-secondary" />
              <span className="text-[10px] md:text-xs text-secondary font-manrope">-5% ce mois-ci</span>
            </div>
          </div>

          <div className="stat-card p-4 md:p-6">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-oswald font-bold text-text-primary mb-1 md:mb-2">
              {stats?.active_memberships || 0}
            </div>
            <div className="text-xs md:text-sm text-text-secondary font-manrope">Adhésions actives</div>
            <div className="flex items-center gap-2 mt-2 md:mt-3">
              <ArrowUp className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              <span className="text-[10px] md:text-xs text-primary font-manrope">En ce mois-ci</span>
            </div>
          </div>

          <div className="stat-card p-4 md:p-6">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-oswald font-bold text-text-primary mb-1 md:mb-2">
              {stats?.pending_renewals || 0}
            </div>
            <div className="text-xs md:text-sm text-text-secondary font-manrope">Renouvellements en attente</div>
            <div className="flex items-center gap-2 mt-2 md:mt-3">
              <ArrowUp className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              <span className="text-[10px] md:text-xs text-primary font-manrope">En ce mois-ci</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Monthly Growth Chart */}
          <div className="bg-paper rounded-lg border border-white/10 p-4 md:p-6">
            <h3 className="font-oswald text-lg md:text-xl font-bold text-text-primary uppercase mb-4 md:mb-6 tracking-wide">
              Croissance Mensuelle
            </h3>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthly_growth || []}>
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
                  <Bar dataKey="members" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution by Country */}
          <div className="bg-paper rounded-lg border border-white/10 p-4 md:p-6">
            <h3 className="font-oswald text-lg md:text-xl font-bold text-text-primary uppercase mb-4 md:mb-6 tracking-wide">
              Répartition par Pays
            </h3>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.members_by_country || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(stats?.members_by_country || []).map((entry, index) => (
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

        {/* Recent Members Table */}
        <div className="bg-paper rounded-lg border border-white/10 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-white/10">
            <h3 className="font-oswald text-lg md:text-xl font-bold text-text-primary uppercase tracking-wide">
              Derniers Membres Inscrits
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs md:text-sm tracking-wide">Membre</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs md:text-sm tracking-wide">Email</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs md:text-sm tracking-wide">Pays</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs md:text-sm tracking-wide">Grade</th>
                  <th className="text-left py-3 px-4 text-text-secondary font-oswald uppercase text-xs md:text-sm tracking-wide">Statut</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recent_members || []).map((member, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          <span className="text-primary font-oswald text-sm md:text-base">
                            {member.full_name?.charAt(0)?.toUpperCase() || 'M'}
                          </span>
                        </div>
                        <span className="text-text-primary font-manrope text-sm">{member.full_name}</span>
                      </div>
                    </td>
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

export default AdminStatsPage;
