import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, User, MessageSquare, BookOpen, Calendar, 
  Users, Award, ShoppingBag, Bell, LogOut, Settings, Newspaper, Coins
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const MemberSidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/conversations/unread-count');
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      // Silently fail
    }
  };

  const menuItems = [
    { path: '/member/dashboard', icon: LayoutDashboard, label: 'Tableau de Bord' },
    { path: '/member/profile', icon: User, label: 'Mon Profil' },
    { path: '/member/messages', icon: MessageSquare, label: 'Messages', badge: unreadCount },
    { path: '/member/programs', icon: BookOpen, label: 'Programmes Techniques' },
    { path: '/member/courses', icon: Calendar, label: 'Mes Cours' },
    { path: '/member/community', icon: Users, label: 'Communauté' },
    { path: '/member/grades', icon: Award, label: 'Mes Grades' },
    { path: '/member/wallet', icon: Coins, label: 'Token AJL', highlight: true },
    { path: '/member/boutique', icon: ShoppingBag, label: 'Boutique' },
  ];

  return (
    <aside className="w-64 min-h-screen fixed left-0 top-0 z-50 flex flex-col bg-paper border-r border-white/5">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg" 
            alt="Logo Académie Jacques Levinet" 
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h1 className="font-oswald text-lg font-bold text-text-primary uppercase tracking-wide">
              Espace Membre
            </h1>
            <p className="text-xs text-text-secondary font-manrope">Académie Levinet</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="font-oswald text-primary font-bold">
              {user?.full_name?.charAt(0) || 'M'}
            </span>
          </div>
          <div>
            <p className="font-oswald text-text-primary text-sm">{user?.full_name || 'Membre'}</p>
            <p className="text-xs text-primary font-manrope">Ceinture Orange</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-manrope transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                  : item.highlight
                    ? 'text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 border border-yellow-500/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 space-y-1">
        <Link
          to="/member/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-manrope text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
        >
          <Settings className="w-5 h-5" strokeWidth={1.5} />
          <span>Paramètres</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-manrope text-text-secondary hover:text-secondary hover:bg-secondary/10 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default MemberSidebar;
