import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCog, CreditCard, LogOut, UserPlus,
  Newspaper, Calendar, MessageSquare, Shield, ShoppingBag, UserCheck,
  Settings, Bot, Receipt, Globe, Building2, X, Menu, Home, User, BarChart3,
  ChevronDown, UserCircle, Handshake, MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatFullName, getInitials } from '../lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    { path: '/dashboard', icon: LayoutDashboard, label: 'Tableau de Bord', testId: 'nav-dashboard' },
    { path: '/messages', icon: MessageSquare, label: 'Messagerie', testId: 'nav-messages', badge: unreadCount },
    { path: '/news', icon: Newspaper, label: 'News', testId: 'nav-news' },
    { path: '/events', icon: Calendar, label: 'Événements', testId: 'nav-events' },
    { path: '/leads', icon: UserPlus, label: 'Leads', testId: 'nav-leads' },
    { path: '/members', icon: Users, label: 'Membres', testId: 'nav-members' },
    { path: '/clubs', icon: Building2, label: 'Clubs', testId: 'nav-clubs' },
    { path: '/technical-directors', icon: UserCog, label: 'Directeurs Tech.', testId: 'nav-directors' },
    { path: '/instructors', icon: User, label: 'Instructeurs', testId: 'nav-instructors' },
    { path: '/subscriptions', icon: CreditCard, label: 'Cotisations', testId: 'nav-subscriptions' },
    { path: '/shop', icon: ShoppingBag, label: 'Boutique AJL', testId: 'nav-shop' },
  ];

  const adminItems = [
    { path: '/admin/stats', icon: BarChart3, label: 'Statistiques', testId: 'nav-stats' },
    { path: '/admin/partners', icon: Handshake, label: 'Partenaires', testId: 'nav-partners' },
    { path: '/admin/forums', icon: MessageCircle, label: 'Forums', testId: 'nav-forums' },
    { path: '/admin/pending-members', icon: UserCheck, label: 'Validations', testId: 'nav-pending', highlight: true },
    { path: '/admin/users', icon: Users, label: 'Utilisateurs', testId: 'nav-users' },
    { path: '/admin/subscriptions', icon: Receipt, label: 'Cotisations', testId: 'nav-admin-subs' },
    { path: '/admin/site-content', icon: Globe, label: 'Site Internet', testId: 'nav-site' },
    { path: '/admin/products', icon: ShoppingBag, label: 'Gestion Produits', testId: 'nav-products' },
    { path: '/admin/ai-config', icon: Bot, label: 'Config. IA', testId: 'nav-ai-config' },
    { path: '/admin/messages', icon: Shield, label: 'Modération', testId: 'nav-moderation' },
    { path: '/admin/settings', icon: Settings, label: 'Paramètres', testId: 'nav-settings' },
  ];

  // Mobile bottom nav items (4-5 main items)
  const mobileNavItems = [
    { path: '/dashboard', icon: Home, label: 'Accueil' },
    { path: '/messages', icon: MessageSquare, label: 'Messages', badge: unreadCount },
    { path: '/events', icon: Calendar, label: 'Événements' },
    { path: '/members', icon: Users, label: 'Membres' },
  ];

  const NavLink = ({ item, onClick }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        data-testid={item.testId}
        onClick={onClick}
        className={`sidebar-link flex items-center justify-between gap-3 px-4 py-3 rounded-md text-sm font-manrope transition-all ${
          isActive 
            ? 'bg-primary/20 text-primary border-l-2 border-primary' 
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
    <aside className="hidden lg:flex glassmorphism-sidebar w-64 h-screen fixed left-0 top-0 z-50 flex-col" data-testid="sidebar">
      <div className="p-6 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img 
            src="https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg" 
            alt="Académie Levinet Logo" 
            className="w-12 h-12 rounded-full object-cover"
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

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scroll-touch" data-testid="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="pt-4 mt-4 border-t border-white/5">
              <p className="px-4 text-xs font-oswald text-text-muted uppercase tracking-wider mb-2">Administration</p>
            </div>
            {adminItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </>
        )}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-white/5 flex-shrink-0" ref={userMenuRef}>
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
            data-testid="user-menu-toggle"
          >
            {/* Avatar */}
            {user?.photo_url ? (
              <img
                src={user.photo_url}
                alt={formatFullName(user.full_name || user.name)}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                <span className="font-oswald text-sm text-primary font-bold">
                  {getInitials(user?.full_name || user?.name || user?.email || 'U')}
                </span>
              </div>
            )}
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {formatFullName(user?.full_name || user?.name) || 'Utilisateur'}
              </p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-paper border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
              <Link
                to="/profile"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
              >
                <UserCircle className="w-5 h-5" strokeWidth={1.5} />
                <span>Mon compte</span>
              </Link>
              <Link
                to="/admin/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
              >
                <Settings className="w-5 h-5" strokeWidth={1.5} />
                <span>Paramètres</span>
              </Link>
              <div className="border-t border-white/5">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  data-testid="logout-button"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-secondary hover:bg-secondary/10 w-full transition-all"
                >
                  <LogOut className="w-5 h-5" strokeWidth={1.5} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  // Mobile Bottom Navigation Bar
  const MobileBottomNav = () => (
    <nav className="lg:hidden mobile-nav-bar" data-testid="mobile-nav">
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
          data-testid="mobile-menu-toggle"
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
        className={`lg:hidden fixed inset-y-0 left-0 w-[85%] max-w-[320px] mobile-drawer z-[70] transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with User Avatar */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 safe-top">
          <Link
            to="/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3"
          >
            {user?.photo_url ? (
              <img
                src={user.photo_url}
                alt={formatFullName(user.full_name || user.name)}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                <span className="font-oswald text-lg text-primary font-bold">
                  {getInitials(user?.full_name || user?.name || user?.email || 'U')}
                </span>
              </div>
            )}
            <div>
              <h2 className="font-oswald text-base font-bold text-white">
                {formatFullName(user?.full_name || user?.name) || 'Utilisateur'}
              </h2>
              <p className="text-xs text-gray-400">{user?.email}</p>
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
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scroll-touch" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {menuItems.map((item) => (
            <NavLink key={item.path} item={item} onClick={() => setIsMobileMenuOpen(false)} />
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="pt-4 mt-4 border-t border-white/10">
                <p className="px-4 text-xs font-oswald text-text-muted uppercase tracking-wider mb-2">Administration</p>
              </div>
              {adminItems.map((item) => (
                <NavLink key={item.path} item={item} onClick={() => setIsMobileMenuOpen(false)} />
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-inherit safe-bottom">
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

export default Sidebar;
