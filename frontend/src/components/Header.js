import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { LogOut, UserCircle, Settings, ChevronDown, Bell, Plus, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatFullName, getInitials } from '../lib/utils';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const Header = () => {
  const { logout, user, getToken } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch token balance
  useEffect(() => {
    const fetchBalance = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/api/tokens/balance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTokenBalance(data.balance);
        }
      } catch (error) {
        console.error('Error fetching token balance:', error);
      }
    };
    fetchBalance();
    // Refresh balance every minute
    const interval = setInterval(fetchBalance, 60000);
    return () => clearInterval(interval);
  }, [getToken]);

  return (
    <header className="hidden lg:flex h-16 glassmorphism-header fixed top-0 right-0 left-64 z-40 items-center justify-end px-6 border-b border-white/5">
      <div className="flex items-center gap-4">
        {/* Token Balance */}
        {tokenBalance !== null && (
          <Link
            to="/member/wallet"
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 rounded-full transition-all"
            title="Mon portefeuille Token AJL"
          >
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-bold text-yellow-500">{tokenBalance}</span>
            <span className="text-xs text-yellow-500/70">AJL</span>
          </Link>
        )}

        {/* Nouvelle Tâche button for admins */}
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all font-medium text-sm"
            title="Créer une nouvelle tâche"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle tâche</span>
          </button>
        )}

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
            data-testid="header-user-menu"
          >
            {/* User Info */}
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">
                {formatFullName(user?.full_name || user?.name) || 'Utilisateur'}
              </p>
              <p className="text-xs text-text-muted capitalize">
                {user?.role === 'admin' ? 'Administrateur' :
                 user?.role === 'directeur_technique' ? 'Directeur Technique' :
                 user?.role === 'instructeur' ? 'Instructeur' :
                 user?.role === 'eleve_libre' ? 'Élève Libre' :
                 'Élève'}
              </p>
            </div>

            {/* Avatar */}
            {user?.photo_url ? (
              <img
                src={user.photo_url}
                alt={formatFullName(user.full_name || user.name)}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                <span className="font-oswald text-sm text-primary font-bold">
                  {getInitials(user?.full_name || user?.name || user?.email || 'U')}
                </span>
              </div>
            )}

            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-paper border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.email}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                >
                  <UserCircle className="w-5 h-5" strokeWidth={1.5} />
                  <span>Mon Profil</span>
                </Link>
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                  >
                    <Settings className="w-5 h-5" strokeWidth={1.5} />
                    <span>Paramètres</span>
                  </Link>
                )}
              </div>

              {/* Logout */}
              <div className="border-t border-white/5">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  data-testid="header-logout-button"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-secondary hover:bg-secondary/10 w-full transition-all"
                >
                  <LogOut className="w-5 h-5" strokeWidth={1.5} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && createPortal(
        <TaskCreationModal
          onClose={() => setShowTaskModal(false)}
          onTaskCreated={() => {
            setShowTaskModal(false);
            // Optionally show a success message
          }}
        />,
        document.body
      )}
    </header>
  );
};

// Task Creation Modal Component
const TaskCreationModal = ({ onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'Bug',
    assigned_to: ''
  });
  const [admins, setAdmins] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load administrators list
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const api = require('../utils/api').default;
        const response = await api.get('/admin/admins');
        setAdmins(response.data || []);
      } catch (err) {
        console.error('Erreur chargement admins:', err);
      }
    };
    loadAdmins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const api = require('../utils/api').default;
      await api.post('/tasks', formData);
      onTaskCreated();
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création de la tâche');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-paper rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="font-oswald text-xl text-text-primary uppercase">Nouvelle Tâche</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Task Type */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Type *</label>
            <select
              value={formData.task_type}
              onChange={(e) => setFormData(prev => ({ ...prev, task_type: e.target.value }))}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-text-primary focus:border-primary focus:outline-none"
              required
            >
              <option value="Bug">🐛 Bug</option>
              <option value="Amélioration">✨ Amélioration</option>
              <option value="Intégration">🔧 Intégration</option>
            </select>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Assigner à</label>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="">Non assigné</option>
              {admins.map(admin => (
                <option key={admin.id} value={admin.id}>
                  {admin.full_name} ({admin.email})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Titre *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-text-primary focus:border-primary focus:outline-none"
              placeholder="Ex: Corriger le bug de connexion"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-text-secondary text-sm font-medium mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-text-primary focus:border-primary focus:outline-none min-h-[120px]"
              placeholder="Décrivez la tâche en détail..."
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all font-medium disabled:opacity-50"
            >
              {saving ? 'Création...' : 'Créer la tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Header;
