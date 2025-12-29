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

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
        { name: 'WKMO', href: '/disciplines/wkmo', icon: Users, description: 'World Krav Maga Organization' },
        { name: 'IPC / ROS', href: '/disciplines/ipc', icon: Shield, description: 'Formation professionnelle' },
        { name: 'Self Pro Krav', href: '/disciplines/spk', icon: Target, description: 'Apprenez à vous défendre' },
        { name: 'Canne Défense', href: '/disciplines/canne', icon: Shield, description: 'Art de la canne' },
        { name: 'Self Féminine', href: '/disciplines/sfjl', icon: Shield, description: 'Pour vous, mesdames' },
        { name: 'Self Enfant', href: '/disciplines/enfant', icon: Users, description: 'Pour les plus jeunes' },
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
        { name: "Je Veux Apprendre", href: '/onboarding', icon: UserPlus, description: 'Commencez maintenant' },
      ]
    }
  ];

  const menuOverlay = isOpen ? (
    <div 
      className="fixed inset-0 animate-fadeIn overflow-auto scroll-touch"
      style={{ backgroundColor: '#0B1120', zIndex: 9999 }}
      data-testid="mega-menu-overlay"
    >
      {/* Close Button */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 md:p-3 border border-white/20 hover:border-red-500 rounded-sm transition-colors group z-10"
        style={{ zIndex: 10000 }}
        data-testid="mega-menu-close"
      >
        <X className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-red-500 transition-colors" strokeWidth={1.5} />
      </button>

      {/* Header */}
      <div className="container mx-auto px-4 md:px-6 pt-4 md:pt-8 relative" style={{ zIndex: 10000 }}>
        <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 md:gap-3">
          <img 
            src="https://customer-assets.emergentagent.com/job_spk-academy/artifacts/rz31ua12_WhatsApp%20Image%202025-12-18%20at%2013.59.58.jpeg" 
            alt="Logo" 
            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
          />
          <div>
            <h1 className="font-oswald text-base md:text-xl font-bold text-white uppercase tracking-wide">
              Académie Jacques Levinet
            </h1>
            <p className="text-[10px] md:text-xs text-gray-400 font-manrope">École Internationale de Self-Défense</p>
          </div>
        </Link>
      </div>

      {/* Menu Content - Mobile First Grid */}
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-16 relative" style={{ zIndex: 10000 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-4 md:space-y-6">
              <h3 className="font-oswald text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-blue-500 border-b border-blue-500/30 pb-2">
                {section.title}
              </h3>
              <ul className="space-y-2 md:space-y-4">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-start gap-3 md:gap-4 p-2 md:p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
                    >
                      <div className="p-1.5 md:p-2 bg-white/5 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                        <item.icon className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="font-oswald text-sm md:text-lg text-white group-hover:text-blue-500 transition-colors flex items-center gap-2">
                          {item.name}
                          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" strokeWidth={2} />
                        </span>
                        <p className="text-xs md:text-sm text-gray-500 font-manrope mt-0.5 md:mt-1">{item.description}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 md:mt-16 pt-6 md:pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <p className="text-gray-400 font-manrope text-sm md:text-base text-center md:text-left">
            Prêt à rejoindre l'élite de la self-défense mondiale ?
          </p>
          <Link
            to="/onboarding"
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white font-oswald uppercase tracking-widest leading-none rounded-sm shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:scale-105 text-sm md:text-base w-full sm:w-auto"
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
        className="flex items-center justify-center gap-2 px-5 py-3 h-11 border border-white/20 hover:border-white/50 text-white font-oswald uppercase tracking-widest leading-none rounded-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/5"
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