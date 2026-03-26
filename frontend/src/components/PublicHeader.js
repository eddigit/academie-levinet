import React from 'react';
import { Link } from 'react-router-dom';
import MegaMenu from './MegaMenu';
import { useAuth } from '../context/AuthContext';
import { useSiteContent } from '../context/SiteContentContext';

const PublicHeader = () => {
  const { user } = useAuth();
  const { content } = useSiteContent();

  const branding = {
    logo_url: content?.branding?.logo_url || "/images/logo-levinet.jpeg",
    name: content?.branding?.name || "Académie Jacques Levinet",
    tagline: content?.branding?.tagline || "École Internationale de Self-Défense"
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 lg:gap-3">
          <img
            src={branding.logo_url}
            alt={`Logo ${branding.name}`}
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
            data-testid="header-logo"
          />
          <div>
            <h1 className="font-oswald text-base lg:text-xl font-bold text-text-primary uppercase tracking-wide">
              {branding.name}
            </h1>
            <p className="text-[10px] lg:text-xs text-text-secondary font-manrope">{branding.tagline}</p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2 lg:gap-4">
          <MegaMenu />
          <Link
            to="/boutique"
            className="hidden sm:block px-3 lg:px-4 py-2 text-sm lg:text-base text-text-secondary hover:text-primary font-oswald uppercase leading-none tracking-wider transition-colors"
          >
            Boutique
          </Link>
          {/* Bouton Connexion/Plateforme masqué — appli en stand by */}
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
