import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

const PublicFooter = () => {
  return (
    <footer className="bg-paper border-t border-white/5">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg" 
                alt="Logo" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-oswald text-lg font-bold text-text-primary uppercase">AJL</h3>
                <p className="text-xs text-text-muted">Depuis 1998</p>
              </div>
            </div>
            <p className="text-text-secondary font-manrope text-sm leading-relaxed">
              L'Académie Jacques Levinet forme l'élite de la self-défense mondiale depuis plus de 25 ans.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-oswald text-sm font-bold uppercase tracking-wider text-primary mb-6">Navigation</h4>
            <ul className="space-y-3">
              <li><Link to="/founder" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Le Fondateur</Link></li>
              <li><Link to="/about" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">À Propos</Link></li>
              <li><Link to="/disciplines/spk" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Self-Pro Krav</Link></li>
              <li><Link to="/pedagogy" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Pédagogie</Link></li>
            </ul>
          </div>

          {/* Disciplines */}
          <div>
            <h4 className="font-oswald text-sm font-bold uppercase tracking-wider text-primary mb-6">Disciplines</h4>
            <ul className="space-y-3">
              <li><Link to="/disciplines/wkmo" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">WKMO - Grand Public</Link></li>
              <li><Link to="/disciplines/sfjl" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">SFJL - Défense Féminine</Link></li>
              <li><Link to="/disciplines/ipc" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">IPC - Professionnels</Link></li>
              <li><Link to="/international" className="text-text-secondary hover:text-primary transition-colors font-manrope text-sm">Présence Internationale</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-oswald text-sm font-bold uppercase tracking-wider text-primary mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-text-secondary">
                <Mail className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="font-manrope text-sm">contact@academie-levinet.com</span>
              </li>
              <li className="flex items-center gap-3 text-text-secondary">
                <Phone className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="font-manrope text-sm">+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-start gap-3 text-text-secondary">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span className="font-manrope text-sm">France - Siège International</span>
              </li>
            </ul>
            {/* Social */}
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 transition-colors">
                <Facebook className="w-5 h-5 text-text-secondary hover:text-primary" strokeWidth={1.5} />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 transition-colors">
                <Instagram className="w-5 h-5 text-text-secondary hover:text-primary" strokeWidth={1.5} />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-primary/20 transition-colors">
                <Youtube className="w-5 h-5 text-text-secondary hover:text-primary" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted font-manrope text-sm">
            © 2025 Académie Jacques Levinet. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-text-muted hover:text-primary transition-colors font-manrope text-sm">Mentions Légales</Link>
            <Link to="#" className="text-text-muted hover:text-primary transition-colors font-manrope text-sm">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;