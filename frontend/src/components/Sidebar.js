import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, CreditCard, LogOut, UserPlus, Newspaper, Calendar, MessageSquare, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new messages every 30 seconds
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
    { path: '/dashboard', icon: LayoutDashboard, label: 'Tableau de Bord', testId: 'nav-dashboard' },
    { path: '/messages', icon: MessageSquare, label: 'Messagerie', testId: 'nav-messages', badge: unreadCount },
    { path: '/news', icon: Newspaper, label: 'News', testId: 'nav-news' },
    { path: '/events', icon: Calendar, label: 'Événements', testId: 'nav-events' },
    { path: '/leads', icon: UserPlus, label: 'Leads', testId: 'nav-leads' },
    { path: '/members', icon: Users, label: 'Membres', testId: 'nav-members' },
    { path: '/technical-directors', icon: UserCog, label: 'Directeurs Techniques', testId: 'nav-directors' },
    { path: '/subscriptions', icon: CreditCard, label: 'Cotisations', testId: 'nav-subscriptions' },
  ];

  // Admin-only menu items
  const adminItems = [
    { path: '/admin/messages', icon: Shield, label: 'Modération', testId: 'nav-moderation' },
  ];

  return (
    <aside className="glassmorphism-sidebar w-64 min-h-screen fixed left-0 top-0 z-50 flex flex-col" data-testid="sidebar">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img 
            src="https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/e712cc50_LOGO-WORLD-KRAV-MAGA-ORGANIZATION-150x150.png" 
            alt="Académie Levinet Logo" 
            className="w-12 h-12 object-contain"
            data-testid="sidebar-logo"
          />
          <div>
            <h1 className="font-oswald text-lg font-bold text-text-primary uppercase tracking-wide">
              Académie
            </h1>
            <p className="text-xs text-text-secondary font-manrope">Jacques Levinet</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto" data-testid="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={item.testId}
              className={`sidebar-link flex items-center justify-between gap-3 px-4 py-3 rounded-md text-sm font-manrope ${
                isActive ? 'active' : 'text-text-secondary hover:text-text-primary'
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

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <>
            <div className="pt-4 mt-4 border-t border-white/5">
              <p className="px-4 text-xs font-oswald text-text-muted uppercase tracking-wider mb-2">Administration</p>
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={item.testId}
                  className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded-md text-sm font-manrope ${
                    isActive ? 'active' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          data-testid="logout-button"
          className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-manrope text-text-secondary hover:text-secondary hover:bg-secondary/10 w-full transition-smooth"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;