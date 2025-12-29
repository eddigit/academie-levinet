import React from 'react';

/**
 * Composant Avatar réutilisable
 * Affiche la photo de l'utilisateur ou ses initiales dans un cercle coloré
 *
 * @param {Object} user - L'utilisateur (doit contenir photo_url, full_name ou first_name/last_name)
 * @param {string} size - Taille: 'xs' (24px), 'sm' (32px), 'md' (40px), 'lg' (48px), 'xl' (64px)
 * @param {string} className - Classes CSS additionnelles
 * @param {boolean} showOnlineIndicator - Afficher l'indicateur en ligne
 * @param {boolean} isOnline - Est-ce que l'utilisateur est en ligne
 */
const UserAvatar = ({
  user,
  size = 'md',
  className = '',
  showOnlineIndicator = false,
  isOnline = false
}) => {
  // Tailles en pixels
  const sizes = {
    xs: { container: 'w-6 h-6', text: 'text-[10px]', indicator: 'w-1.5 h-1.5 border' },
    sm: { container: 'w-8 h-8', text: 'text-xs', indicator: 'w-2 h-2 border' },
    md: { container: 'w-10 h-10', text: 'text-sm', indicator: 'w-2.5 h-2.5 border-2' },
    lg: { container: 'w-12 h-12', text: 'text-base', indicator: 'w-3 h-3 border-2' },
    xl: { container: 'w-16 h-16', text: 'text-xl', indicator: 'w-4 h-4 border-2' }
  };

  const sizeConfig = sizes[size] || sizes.md;

  // Récupérer les initiales
  const getInitials = () => {
    if (!user) return '?';

    // Si full_name existe
    if (user.full_name) {
      const parts = user.full_name.trim().split(' ').filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0]?.substring(0, 2).toUpperCase() || '?';
    }

    // Si first_name et last_name existent
    if (user.first_name || user.last_name) {
      const first = user.first_name?.[0] || '';
      const last = user.last_name?.[0] || '';
      return (first + last).toUpperCase() || '?';
    }

    // Si name existe
    if (user.name) {
      const parts = user.name.trim().split(' ').filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0]?.substring(0, 2).toUpperCase() || '?';
    }

    return '?';
  };

  // Générer une couleur de fond basée sur le nom
  const getBackgroundColor = () => {
    const name = user?.full_name || user?.name || user?.first_name || '';
    const colors = [
      'bg-primary/20 text-primary',
      'bg-accent/20 text-accent',
      'bg-secondary/20 text-secondary',
      'bg-green-500/20 text-green-500',
      'bg-blue-500/20 text-blue-500',
      'bg-purple-500/20 text-purple-500',
      'bg-orange-500/20 text-orange-500',
      'bg-pink-500/20 text-pink-500',
      'bg-cyan-500/20 text-cyan-500',
      'bg-yellow-500/20 text-yellow-500'
    ];

    // Simple hash basé sur le nom
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // URL de la photo
  const photoUrl = user?.photo_url || user?.avatar_url || user?.image_url;

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={user?.full_name || user?.name || 'Avatar'}
          className={`${sizeConfig.container} rounded-full object-cover border-2 border-white/10`}
          onError={(e) => {
            // Si l'image ne charge pas, on masque l'img et on montre les initiales
            e.target.style.display = 'none';
            e.target.nextSibling?.classList.remove('hidden');
          }}
        />
      ) : null}

      {/* Fallback initiales - affiché si pas de photo ou si erreur de chargement */}
      <div
        className={`${sizeConfig.container} ${!photoUrl ? '' : 'hidden'} rounded-full flex items-center justify-center font-bold ${sizeConfig.text} ${getBackgroundColor()}`}
      >
        {getInitials()}
      </div>

      {/* Indicateur en ligne */}
      {showOnlineIndicator && (
        <span
          className={`absolute bottom-0 right-0 ${sizeConfig.indicator} ${isOnline ? 'bg-green-500' : 'bg-gray-400'} border-paper rounded-full`}
        />
      )}
    </div>
  );
};

/**
 * Groupe d'avatars empilés
 * @param {Array} users - Liste des utilisateurs
 * @param {number} maxDisplay - Nombre max d'avatars à afficher
 * @param {string} size - Taille des avatars
 */
export const UserAvatarGroup = ({ users = [], maxDisplay = 4, size = 'sm' }) => {
  const displayUsers = users.slice(0, maxDisplay);
  const remaining = users.length - maxDisplay;

  return (
    <div className="flex -space-x-2">
      {displayUsers.map((user, index) => (
        <UserAvatar
          key={user.id || index}
          user={user}
          size={size}
          className="ring-2 ring-paper"
        />
      ))}
      {remaining > 0 && (
        <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-text-muted font-bold ring-2 ring-paper`}>
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
