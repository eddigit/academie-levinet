import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronDown } from 'lucide-react';

const PublicationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const publications = [
    {
      name: 'Krav Mag AJL',
      href: '/kravmag',
      description: 'Magazine international'
    },
    {
      name: 'Éditions AJL',
      href: '/editions',
      description: 'Livres et ouvrages'
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-1.5 px-3 lg:px-4 py-2 lg:py-2.5 h-11 border border-white/20 hover:border-white/50 text-white font-oswald uppercase tracking-wider leading-none rounded-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/5"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <BookOpen className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
        <span className="text-xs lg:text-sm">Publications</span>
        <ChevronDown
          className={`w-3 h-3 lg:w-4 lg:h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-[#0B1120] border border-white/20 rounded-lg shadow-2xl overflow-hidden z-[100] animate-fadeIn">
          <div className="p-2">
            {publications.map((item, idx) => (
              <Link
                key={idx}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="block p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <BookOpen className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <span className="font-oswald text-sm text-white group-hover:text-blue-500 transition-colors block">
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-500 font-manrope">
                      {item.description}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Info Footer */}
          <div className="px-4 py-2 bg-white/5 border-t border-white/10">
            <p className="text-[10px] text-gray-500 font-manrope text-center">
              Accès gratuit aux publications AJL
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationsDropdown;
