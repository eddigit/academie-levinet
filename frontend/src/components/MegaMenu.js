import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, Shield, Users, Award, Target, Globe, BookOpen, UserPlus, Menu } from 'lucide-react';

const MegaMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuSections = [
    {
      title: "L'Académie",
      items: [
        { name: 'Le Fondateur', href: '/founder', icon: Award, description: 'Capitaine Jacques Levinet, 10ème Dan' },
        { name: 'À Propos', href: '/about', icon: Shield, description: 'Notre histoire et mission' },
      ]
    },
    {
      title: 'Nos Disciplines',
      items: [
        { name: 'Self-Pro Krav (SPK)', href: '/disciplines/spk', icon: Target, description: 'Méthode phare de self-défense' },
        { name: 'WKMO - Grand Public', href: '/disciplines/wkmo', icon: Users, description: 'Krav Maga pour tous' },
        { name: 'SFJL - Défense Féminine', href: '/disciplines/sfjl', icon: Shield, description: 'Empowerment et sécurité' },
        { name: 'IPC/ROS - Professionnels', href: '/disciplines/ipc', icon: Shield, description: 'Formation forces de l\'ordre' },
      ]
    },
    {
      title: 'Formation',
      items: [
        { name: 'Pédagogie & Grades', href: '/pedagogy', icon: BookOpen, description: 'Système de certification' },
        { name: 'Présence Internationale', href: '/international', icon: Globe, description: '50+ pays représentés' },
      ]
    },
    {
      title: 'Rejoindre',
      items: [
        { name: "Devenir Membre", href: '/join', icon: UserPlus, description: 'Rejoignez l\'élite' },
      ]
    }
  ];

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-white/50 text-white font-oswald uppercase tracking-widest rounded-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/5"
        data-testid="mega-menu-trigger"
      >
        <Menu className="w-5 h-5" strokeWidth={1.5} />
        <span className="hidden md:inline">Menu</span>
      </button>

      {/* Mega Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-xl animate-fadeIn"
          data-testid="mega-menu-overlay"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 p-3 border border-white/20 hover:border-secondary rounded-sm transition-colors group"
            data-testid="mega-menu-close"
          >
            <X className="w-6 h-6 text-white group-hover:text-secondary transition-colors" strokeWidth={1.5} />
          </button>

          {/* Header */}
          <div className="container mx-auto px-6 pt-8">
            <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_defense-academy-3/artifacts/e712cc50_LOGO-WORLD-KRAV-MAGA-ORGANIZATION-150x150.png" 
                alt="Logo" 
                className="w-12 h-12"
              />
              <div>
                <h1 className="font-oswald text-xl font-bold text-text-primary uppercase tracking-wide">
                  Académie Jacques Levinet
                </h1>
                <p className="text-xs text-text-secondary font-manrope">Self-Pro Krav</p>
              </div>
            </Link>
          </div>

          {/* Menu Content */}
          <div className="container mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {menuSections.map((section, idx) => (
                <div key={idx} className="space-y-6">
                  <h3 className="font-oswald text-sm font-bold uppercase tracking-[0.2em] text-primary border-b border-primary/30 pb-2">
                    {section.title}
                  </h3>
                  <ul className="space-y-4">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className="group flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
                        >
                          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <item.icon className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" strokeWidth={1.5} />
                          </div>
                          <div>
                            <span className="font-oswald text-lg text-white group-hover:text-primary transition-colors flex items-center gap-2">
                              {item.name}
                              <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" strokeWidth={2} />
                            </span>
                            <p className="text-sm text-text-muted font-manrope mt-1">{item.description}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-text-secondary font-manrope">
                Prêt à rejoindre l'élite de la self-défense mondiale ?
              </p>
              <Link
                to="/onboarding"
                onClick={() => setIsOpen(false)}
                className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase tracking-widest rounded-sm shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:scale-105"
              >
                Commencer Maintenant
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MegaMenu;