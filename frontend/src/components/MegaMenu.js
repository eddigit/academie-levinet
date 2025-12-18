import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ChevronRight, Shield, Users, Award, Target, Globe, BookOpen, UserPlus, Menu } from 'lucide-react';

const MegaMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const menuOverlay = isOpen ? (
    <div 
      className="fixed inset-0 animate-fadeIn overflow-auto"
      style={{ backgroundColor: '#0B1120', zIndex: 9999 }}
      data-testid="mega-menu-overlay"
    >
      {/* Close Button */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-6 right-6 p-3 border border-white/20 hover:border-red-500 rounded-sm transition-colors group z-10"
        style={{ zIndex: 10000 }}
        data-testid="mega-menu-close"
      >
        <X className="w-6 h-6 text-white group-hover:text-red-500 transition-colors" strokeWidth={1.5} />
      </button>

      {/* Header */}
      <div className="container mx-auto px-6 pt-8 relative" style={{ zIndex: 10000 }}>
        <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
          <img 
            src="https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg" 
            alt="Logo" 
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h1 className="font-oswald text-xl font-bold text-white uppercase tracking-wide">
              Académie Jacques Levinet
            </h1>
            <p className="text-xs text-gray-400 font-manrope">(École Internationale de Self-Défense)</p>
          </div>
        </Link>
      </div>

      {/* Menu Content */}
      <div className="container mx-auto px-6 py-16 relative" style={{ zIndex: 10000 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <h3 className="font-oswald text-sm font-bold uppercase tracking-[0.2em] text-blue-500 border-b border-blue-500/30 pb-2">
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
                      <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                        <item.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="font-oswald text-lg text-white group-hover:text-blue-500 transition-colors flex items-center gap-2">
                          {item.name}
                          <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" strokeWidth={2} />
                        </span>
                        <p className="text-sm text-gray-500 font-manrope mt-1">{item.description}</p>
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
          <p className="text-gray-400 font-manrope">
            Prêt à rejoindre l'élite de la self-défense mondiale ?
          </p>
          <Link
            to="/onboarding"
            onClick={() => setIsOpen(false)}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-oswald uppercase tracking-widest rounded-sm shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:scale-105"
          >
            Commencer Maintenant
          </Link>
        </div>
      </div>
    </div>
  ) : null;

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

      {/* Render overlay via portal */}
      {mounted && createPortal(menuOverlay, document.body)}
    </>
  );
};

export default MegaMenu;