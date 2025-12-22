import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import SocialWall from '../components/SocialWall';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Users, DollarSign, TrendingUp, UserCheck, ArrowUp, ArrowDown, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Only fetch stats for admins
        if (isAdmin) {
          const data = await api.getDashboardStats();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isAdmin]);

  if (loading && isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64" data-testid="loading-spinner">
          <div className="text-text-primary font-oswald text-xl">Chargement...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8" data-testid="dashboard-page">
        {/* Header - Mobile First */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="font-oswald text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary uppercase tracking-wide" data-testid="dashboard-title">
              Bienvenue
            </h1>
            <p className="text-text-secondary font-manrope mt-1 text-sm md:text-base">
              {user?.name || 'Membre'} - Académie Jacques Levinet
            </p>
          </div>
          {isAdmin && (
            <Link 
              to="/admin/stats" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary font-oswald uppercase text-sm transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Voir Statistiques
            </Link>
          )}
        </div>

        {/* Community Social Wall - FIRST for everyone */}
        <div>
          <h3 className="font-oswald text-xl font-bold text-text-primary uppercase mb-6 tracking-wide">
            Mur de la Communauté
          </h3>
          <SocialWall />
        </div>

        {/* Stats Section - Only for Admins */}
        {isAdmin && stats && (
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="font-oswald text-xl font-bold text-text-primary uppercase mb-6 tracking-wide">
              Aperçu Rapide
            </h3>
            
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-testid="stats-cards">
              <div className="stat-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-oswald font-bold text-text-primary">
                      {stats?.total_members || 0}
                    </div>
                    <div className="text-xs text-text-secondary font-manrope">Utilisateurs</div>
                  </div>
                </div>
              </div>

              <div className="stat-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-xl font-oswald font-bold text-text-primary">
                      € {stats?.total_revenue?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-text-secondary font-manrope">Revenus</div>
                  </div>
                </div>
              </div>

              <div className="stat-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-oswald font-bold text-text-primary">
                      {stats?.active_memberships || 0}
                    </div>
                    <div className="text-xs text-text-secondary font-manrope">Actifs</div>
                  </div>
                </div>
              </div>

              <div className="stat-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="text-xl font-oswald font-bold text-text-primary">
                      {stats?.new_members_this_month || 0}
                    </div>
                    <div className="text-xs text-text-secondary font-manrope">Nouveaux</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;