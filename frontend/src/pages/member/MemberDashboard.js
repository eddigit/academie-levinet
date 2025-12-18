import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MemberSidebar from '../../components/MemberSidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { 
  Award, Calendar, MessageSquare, BookOpen, Users, 
  ChevronRight, TrendingUp, Clock, Target
} from 'lucide-react';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    coursesThisMonth: 8,
    totalCourses: 45,
    unreadMessages: 0,
    nextEvent: null
  });
  const [recentNews, setRecentNews] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch unread count
      const unreadRes = await api.get('/conversations/unread-count');
      setStats(prev => ({ ...prev, unreadMessages: unreadRes.data.unread_count }));

      // Fetch recent news
      const newsRes = await api.get('/news');
      setRecentNews(newsRes.data.slice(0, 3));

      // Fetch upcoming events
      const eventsRes = await api.get('/events');
      setUpcomingEvents(eventsRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const quickActions = [
    { icon: Calendar, label: 'Voir mes cours', path: '/member/courses', color: 'primary' },
    { icon: MessageSquare, label: 'Messages', path: '/member/messages', color: 'accent', badge: stats.unreadMessages },
    { icon: BookOpen, label: 'Programmes', path: '/member/programs', color: 'secondary' },
    { icon: Users, label: 'Communauté', path: '/member/community', color: 'green-500' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <MemberSidebar />
      
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide">
            Bienvenue, {user?.full_name?.split(' ')[0] || 'Membre'} 👋
          </h1>
          <p className="text-text-secondary font-manrope mt-2">
            Voici un aperçu de votre activité à l'Académie Jacques Levinet
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-paper rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" strokeWidth={1.5} />
            </div>
            <p className="font-oswald text-3xl text-text-primary font-bold">{stats.coursesThisMonth}</p>
            <p className="text-text-muted font-manrope text-sm">Cours ce mois</p>
          </div>

          <div className="bg-paper rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" strokeWidth={1.5} />
              </div>
            </div>
            <p className="font-oswald text-3xl text-text-primary font-bold">{stats.totalCourses}</p>
            <p className="text-text-muted font-manrope text-sm">Cours total</p>
          </div>

          <div className="bg-paper rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-secondary" strokeWidth={1.5} />
              </div>
            </div>
            <p className="font-oswald text-3xl text-text-primary font-bold">Orange</p>
            <p className="text-text-muted font-manrope text-sm">Grade actuel</p>
          </div>

          <div className="bg-paper rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-500" strokeWidth={1.5} />
              </div>
            </div>
            <p className="font-oswald text-3xl text-text-primary font-bold">6</p>
            <p className="text-text-muted font-manrope text-sm">Mois d'ancienneté</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="font-oswald text-xl text-text-primary uppercase mb-4">Accès Rapide</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <Link
                key={idx}
                to={action.path}
                className="bg-paper rounded-xl border border-white/5 p-4 hover:border-primary/30 transition-colors group relative"
              >
                <div className={`w-10 h-10 rounded-lg bg-${action.color}/10 flex items-center justify-center mb-3`}>
                  <action.icon className={`w-5 h-5 text-${action.color}`} strokeWidth={1.5} />
                </div>
                <p className="font-oswald text-text-primary group-hover:text-primary transition-colors">
                  {action.label}
                </p>
                {action.badge > 0 && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                    {action.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="bg-paper rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-oswald text-xl text-text-primary uppercase">Prochains Événements</h2>
              <Link to="/member/courses" className="text-primary text-sm font-manrope flex items-center gap-1 hover:underline">
                Voir tout <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? upcomingEvents.map((event, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex flex-col items-center justify-center">
                    <span className="font-oswald text-primary text-lg font-bold">15</span>
                    <span className="text-xs text-primary">DEC</span>
                  </div>
                  <div>
                    <p className="font-oswald text-text-primary">{event.title}</p>
                    <p className="text-xs text-text-muted">{event.location || 'Académie'}</p>
                  </div>
                </div>
              )) : (
                <>
                  <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex flex-col items-center justify-center">
                      <span className="font-oswald text-primary text-lg font-bold">18</span>
                      <span className="text-xs text-primary">DEC</span>
                    </div>
                    <div>
                      <p className="font-oswald text-text-primary">Stage SPK Avancé</p>
                      <p className="text-xs text-text-muted">Paris - 9h00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-secondary/20 flex flex-col items-center justify-center">
                      <span className="font-oswald text-secondary text-lg font-bold">22</span>
                      <span className="text-xs text-secondary">DEC</span>
                    </div>
                    <div>
                      <p className="font-oswald text-text-primary">Passage de Grade</p>
                      <p className="text-xs text-text-muted">Lyon - 14h00</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recent News */}
          <div className="bg-paper rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-oswald text-xl text-text-primary uppercase">Actualités</h2>
              <Link to="/member/community" className="text-primary text-sm font-manrope flex items-center gap-1 hover:underline">
                Voir tout <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentNews.length > 0 ? recentNews.map((news, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-lg">
                  <p className="font-oswald text-text-primary text-sm">{news.title}</p>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">{news.content?.substring(0, 100)}...</p>
                </div>
              )) : (
                <>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="font-oswald text-text-primary text-sm">Nouveau programme technique disponible</p>
                    <p className="text-xs text-text-muted mt-1">Les vidéos du module 5 sont maintenant accessibles...</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="font-oswald text-text-primary text-sm">Stage international en Février</p>
                    <p className="text-xs text-text-muted mt-1">Inscriptions ouvertes pour le stage avec Maître Levinet...</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-6 bg-paper rounded-xl border border-white/5 p-6">
          <h2 className="font-oswald text-xl text-text-primary uppercase mb-4">Ma Progression</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary font-manrope text-sm">Vers Ceinture Verte</span>
                <span className="text-primary font-oswald">65%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-green-500 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="font-oswald text-2xl text-primary">12/20</p>
                <p className="text-xs text-text-muted">Cours requis</p>
              </div>
              <div className="text-center">
                <p className="font-oswald text-2xl text-accent">3/5</p>
                <p className="text-xs text-text-muted">Techniques validées</p>
              </div>
              <div className="text-center">
                <p className="font-oswald text-2xl text-secondary">1</p>
                <p className="text-xs text-text-muted">Stage requis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
