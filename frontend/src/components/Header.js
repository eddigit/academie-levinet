import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, UserCircle, Settings, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatFullName, getInitials } from '../lib/utils';

const Header = () => {
  const { logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="hidden lg:flex h-16 glassmorphism-header fixed top-0 right-0 left-64 z-40 items-center justify-end px-6 border-b border-white/5">
      <div className="flex items-center gap-4">
        {/* Notifications (optional - for future use) */}
        {/* <button className="p-2 rounded-lg hover:bg-white/5 transition-colors relative">
          <Bell className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button> */}

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
            data-testid="header-user-menu"
          >
            {/* User Info */}
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">
                {formatFullName(user?.full_name || user?.name) || 'Utilisateur'}
              </p>
              <p className="text-xs text-text-muted capitalize">
                {user?.role === 'admin' ? 'Administrateur' :
                 user?.role === 'directeur_technique' ? 'Directeur Technique' :
                 user?.role === 'instructeur' ? 'Instructeur' :
                 user?.role === 'eleve_libre' ? 'Élève Libre' :
                 'Élève'}
              </p>
            </div>

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

            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-paper border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.email}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                >
                  <UserCircle className="w-5 h-5" strokeWidth={1.5} />
                  <span>Mon Profil</span>
                </Link>
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                  >
                    <Settings className="w-5 h-5" strokeWidth={1.5} />
                    <span>Paramètres</span>
                  </Link>
                )}
              </div>

              {/* Logout */}
              <div className="border-t border-white/5">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  data-testid="header-logout-button"
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
    </header>
  );
};

export default Header;
