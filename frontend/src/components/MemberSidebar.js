import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, User, MessageSquare, BookOpen, Calendar,
  Users, Award, ShoppingBag, LogOut, Settings, Coins, Menu, X, Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSiteContent } from '../context/SiteContentContext';
import api from '../utils/api';

const MemberSidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { content } = useSiteContent();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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

  // Mobile bottom nav items (4 main items + menu)
  const mobileNavItems = [
    { path: '/member/dashboard', icon: Home, label: 'Accueil' },
    { path: '/member/messages', icon: MessageSquare, label: 'Messages', badge: unreadCount },
    { path: '/member/programs', icon: BookOpen, label: 'Programmes' },
    { path: '/member/wallet', icon: Coins, label: 'Token' },
  ];

  const NavLink = ({ item, onClick }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={onClick}
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
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <aside className="hidden lg:flex w-64 min-h-screen fixed left-0 top-0 z-50 flex-col bg-paper border-r border-white/5">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={content?.images?.logo || "/images/logo-levinet.jpeg"}
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
          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt={user?.full_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="font-oswald text-primary font-bold">
                {user?.full_name?.charAt(0) || 'M'}
              </span>
            </div>
          )}
          <div>
            <p className="font-oswald text-text-primary text-sm">{user?.full_name || 'Membre'}</p>
            <p className="text-xs text-primary font-manrope">{user?.belt_grade || 'Membre'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}
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

  // Mobile Bottom Navigation Bar
  const MobileBottomNav = () => (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-paper border-t border-white/5 safe-bottom">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all relative ${
                isActive ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" strokeWidth={1.5} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
        {/* Menu burger for more options */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-2 px-3 rounded-lg text-text-secondary"
        >
          <Menu className="w-6 h-6" strokeWidth={1.5} />
          <span className="text-[10px] mt-1 font-medium">Plus</span>
        </button>
      </div>
    </nav>
  );

  // Mobile Drawer Menu
  const MobileDrawer = () => (
    <>
      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[60] transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-[85%] max-w-[320px] bg-paper z-[70] transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with User Avatar */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 safe-top">
          <Link
            to="/member/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3"
          >
            {user?.photo_url ? (
              <img
                src={user.photo_url}
                alt={user?.full_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                <span className="font-oswald text-lg text-primary font-bold">
                  {user?.full_name?.charAt(0) || 'M'}
                </span>
              </div>
            )}
            <div>
              <h2 className="font-oswald text-base font-bold text-white">
                {user?.full_name || 'Membre'}
              </h2>
              <p className="text-xs text-primary">{user?.belt_grade || 'Membre'}</p>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {menuItems.map((item) => (
            <NavLink key={item.path} item={item} onClick={() => setIsMobileMenuOpen(false)} />
          ))}

          <div className="pt-4 mt-4 border-t border-white/10">
            <Link
              to="/member/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-manrope text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              <Settings className="w-5 h-5" strokeWidth={1.5} />
              <span>Paramètres</span>
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-paper safe-bottom">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              logout();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-manrope text-secondary hover:bg-secondary/10 w-full transition-all"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileBottomNav />
      <MobileDrawer />
    </>
  );
};

export default MemberSidebar;
