import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';
import BUILD_INFO from '../buildInfo';
import { useSiteContent } from '../context/SiteContentContext';

const PublicFooter = () => {
  const { content, loading } = useSiteContent();

  // Default values in case content is not loaded
  const branding = content?.branding || {
    logo_url: "https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg",
    short_name: "AJL",
    foundation_year: "1998",
    description: "L'Académie Jacques Levinet forme l'élite de la self-défense mondiale depuis plus de 25 ans."
  };

  const contact = content?.contact || {
    email: "contact@academielevinet.com",
    phone: "+33 6 98 07 08 51",
    address: "Saint Jean de Védas, France"
  };

  const social = content?.social_links || {};
  const navigation = content?.navigation || { quick_links: [], disciplines: [], legal_links: [] };
  const footer = content?.footer || {
    copyright: "© 2025 Académie Jacques Levinet. Tous droits réservés.",
    developer: "GILLES KORZEC"
  };

  if (loading) {
    return null; // or a skeleton loader
  }

  return (
    <footer className="bg-paper border-t border-white/5">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img 
                src={branding.logo_url} 
                alt="Logo" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-oswald text-lg font-bold text-text-primary uppercase">{branding.short_name}</h3>
                <p className="text-xs text-text-muted">Depuis {branding.foundation_year}</p>
              </div>
            </div>
            <p className="text-text-secondary font-manrope text-sm leading-relaxed">
              {branding.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-oswald text-sm font-bold uppercase tracking-wider text-primary mb-6">Navigation</h4>
            <ul className="space-y-3">
              {navigation.quick_links.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disciplines */}
          <div>
            <h4 className="font-oswald text-sm font-bold uppercase tracking-wider text-primary mb-6">Disciplines</h4>
            <ul className="space-y-3">
              {navigation.disciplines.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-oswald text-sm font-bold uppercase tracking-wider text-primary mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-text-secondary">
                <Mail className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="font-manrope text-sm">{contact.email}</span>
              </li>
              <li className="flex items-center gap-3 text-text-secondary">
                <Phone className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="font-manrope text-sm">{contact.phone}</span>
              </li>
              <li className="flex items-start gap-3 text-text-secondary">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="font-manrope text-sm">{contact.address}</span>
              </li>
            </ul>
            {/* Social */}
            <div className="flex items-center gap-4 mt-6">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 transition-colors">
                  <Facebook className="w-5 h-5 text-text-secondary hover:text-primary" strokeWidth={1.5} />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 transition-colors">
                  <Instagram className="w-5 h-5 text-text-secondary hover:text-primary" strokeWidth={1.5} />
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 transition-colors">
                  <Youtube className="w-5 h-5 text-text-secondary hover:text-primary" strokeWidth={1.5} />
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 transition-colors">
                  <Linkedin className="w-5 h-5 text-text-secondary hover:text-primary" strokeWidth={1.5} />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 transition-colors">
                  <Twitter className="w-5 h-5 text-text-secondary hover:text-primary" strokeWidth={1.5} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-text-muted font-manrope text-sm text-center md:text-left">
              <p>{footer.copyright}</p>
              <p className="text-xs text-text-muted/60 mt-1">
                v{BUILD_INFO.version} • Build: {BUILD_INFO.date} {BUILD_INFO.time} • Commit: {BUILD_INFO.commitHash}
              </p>
            </div>
            <div className="flex items-center gap-6">
              {navigation.legal_links.map((link, idx) => (
                <Link key={idx} to={link.path} className="text-text-muted hover:text-primary transition-colors font-manrope text-sm">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-text-muted/50 mt-4 font-manrope">
            Plateforme réalisée par <span className="text-primary">{footer.developer}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;