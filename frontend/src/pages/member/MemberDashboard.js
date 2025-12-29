import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MemberSidebar from '../../components/MemberSidebar';
import SocialWall from '../../components/SocialWall';
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
  const [founderInfo, setFounderInfo] = useState(null);

  useEffect(() => {
    fetchData();
    fetchFounderMessage();
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

  const fetchFounderMessage = async () => {
    try {
      const response = await api.get('/founder-message');
      setFounderInfo(response.data);
    } catch (error) {
      console.error('Error fetching founder message:', error);
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
        {/* Header avec Message du Fondateur */}
        <div className="mb-6 flex items-start gap-8">
          {/* Bienvenue */}
          <div className="flex-shrink-0">
            <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide">
              Bienvenue, {user?.full_name?.split(' ')[0] || 'Membre'} 👋
            </h1>
            <p className="text-text-secondary font-manrope mt-2">
              Membre - Académie Jacques Levinet
            </p>
          </div>

          {/* Message du Fondateur */}
          {founderInfo && (founderInfo.daily_message || founderInfo.photo) && (
            <div className="flex-1 flex items-center gap-4">
              {founderInfo.photo && (
                <img 
                  src={founderInfo.photo} 
                  alt={founderInfo.name || 'Fondateur'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                />
              )}
              <div className="flex-1">
                {founderInfo.daily_message && (
                  <p className="text-text-primary italic text-sm leading-relaxed">
                    "{founderInfo.daily_message}"
                  </p>
                )}
                <p className="text-xs text-primary mt-1 font-semibold">
                  — {founderInfo.name || 'Le Fondateur'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Social Wall - 3 Column Layout */}
        <SocialWall />
      </div>
    </div>
  );
};

export default MemberDashboard;
