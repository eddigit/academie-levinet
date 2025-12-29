import React from 'react';
import { ExternalLink } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const SponsorCard = ({ sponsor }) => {
  const handleClick = async () => {
    try {
      // Tracker le clic
      await fetch(`${API_URL}/api/sponsors/${sponsor.id}/click`, {
        method: 'POST'
      });
      
      // Ouvrir le lien dans un nouvel onglet
      window.open(sponsor.website_url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking sponsor click:', error);
      // Ouvrir quand même le lien même si le tracking échoue
      window.open(sponsor.website_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
            Partenaire
          </span>
          <ExternalLink className="h-3 w-3 text-gray-400" />
        </div>
        
        <button
          onClick={handleClick}
          className="w-full group cursor-pointer"
          title={`Visiter ${sponsor.name}`}
        >
          <img
            src={sponsor.logo_url}
            alt={sponsor.name}
            className="w-full h-auto rounded-md group-hover:opacity-90 transition-opacity"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="100"%3E%3Crect fill="%23f3f4f6" width="200" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="Arial" font-size="14"%3E' + sponsor.name + '%3C/text%3E%3C/svg%3E';
            }}
          />
          
          <div className="mt-2 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
              {sponsor.name}
            </p>
          </div>
        </button>
      </div>
      
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Sponsor officiel de l'Académie
        </p>
      </div>
    </div>
  );
};

export default SponsorCard;
