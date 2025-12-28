import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import SocialWall from '../components/SocialWall';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Users, DollarSign, TrendingUp, UserCheck, ArrowUp, ArrowDown, BarChart3, MessageCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch forums for everyone
        const forumsResponse = await api.getForums();
        setForums(forumsResponse?.forums || forumsResponse || []);
        
        // Only fetch stats for admins
        if (isAdmin) {
          const data = await api.getDashboardStats();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

        {/* Forums Section - For everyone */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-oswald text-xl font-bold text-text-primary uppercase tracking-wide flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Forums de Discussion
            </h3>
            <Link 
              to="/admin/forums" 
              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              Voir tous les forums
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {forums.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forums.slice(0, 6).map((forum) => (
                <Link
                  key={forum.id || forum._id}
                  to="/admin/forums"
                  className="bg-paper border border-white/10 rounded-xl p-4 hover:border-primary/30 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-oswald text-text-primary font-semibold truncate group-hover:text-primary transition-colors">
                        {forum.name || forum.title}
                      </h4>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">
                        {forum.description || 'Forum de discussion'}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {forum.topic_count || forum.topics_count || 0} sujets
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {forum.message_count || forum.posts_count || 0} posts
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-paper border border-white/10 rounded-xl p-8 text-center">
              <MessageCircle className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary font-manrope">Aucun forum disponible pour le moment.</p>
              {isAdmin && (
                <Link 
                  to="/admin/forums" 
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-white font-oswald uppercase text-sm transition-colors"
                >
                  Créer un forum
                </Link>
              )}
            </div>
          )}
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