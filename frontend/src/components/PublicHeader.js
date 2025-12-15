import React from 'react';
import { Link } from 'react-router-dom';
import MegaMenu from './MegaMenu';

const PublicHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/e712cc50_LOGO-WORLD-KRAV-MAGA-ORGANIZATION-150x150.png" 
            alt="Logo" 
            className="w-12 h-12"
            data-testid="header-logo"
          />
          <div>
            <h1 className="font-oswald text-xl font-bold text-text-primary uppercase tracking-wide">
              Académie Jacques Levinet
            </h1>
            <p className="text-xs text-text-secondary font-manrope">Self-Pro Krav</p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <MegaMenu />
          <Link 
            to="/login" 
            data-testid="header-login-button"
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-oswald uppercase tracking-wider rounded-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
          >
            Connexion
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;