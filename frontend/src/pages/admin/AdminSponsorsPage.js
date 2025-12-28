import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import api from '../../utils/api';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  MousePointerClick, 
  TrendingUp,
  Calendar,
  ExternalLink
} from 'lucide-react';

const AdminSponsorsPage = () => {
  const [sponsors, setSponsors] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    position: 'left',
    active: true,
    start_date: '',
    end_date: '',
    priority: 1
  });

  useEffect(() => {
    fetchSponsors();
    fetchStats();
  }, []);

  const fetchSponsors = async () => {
    try {
      const res = await api.get('/admin/sponsors');
      const sponsorData = res.data.sponsors || res.data;
      setSponsors(Array.isArray(sponsorData) ? sponsorData : []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      setSponsors([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/sponsors/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Nettoyer les données avant l'envoi
      const submitData = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };
      
      if (editingSponsor) {
        await api.put(`/admin/sponsors/${editingSponsor.id}`, submitData);
      } else {
        await api.post('/admin/sponsors', submitData);
      }
      setShowForm(false);
      setEditingSponsor(null);
      resetForm();
      fetchSponsors();
      fetchStats();
    } catch (error) {
      console.error('Error saving sponsor:', error);
      alert('Erreur lors de l\'enregistrement du sponsor');
    }
  };

  const handleEdit = (sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      logo_url: sponsor.logo_url,
      website_url: sponsor.website_url,
      position: sponsor.position,
      active: sponsor.active,
      start_date: sponsor.start_date || '',
      end_date: sponsor.end_date || '',
      priority: sponsor.priority
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce sponsor ?')) return;
    
    try {
      await api.delete(`/admin/sponsors/${id}`);
      fetchSponsors();
      fetchStats();
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      website_url: '',
      position: 'left',
      active: true,
      start_date: '',
      end_date: '',
      priority: 1
    });
  };

  const calculateCTR = (impressions, clicks) => {
    if (impressions === 0) return '0.00';
    return ((clicks / impressions) * 100).toFixed(2);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide">
            Gestion des Sponsors
          </h1>
          <p className="text-text-secondary font-manrope mt-2">
            Gérez les espaces publicitaires et suivez les performances
          </p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setEditingSponsor(null);
            setShowForm(true);
          }}
          className="bg-primary hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Sponsor
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-paper rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm">Total Sponsors</p>
                <p className="font-oswald text-2xl text-text-primary mt-1">
                  {stats.total_sponsors}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {stats.active_sponsors} actifs
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-paper rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm">Impressions</p>
                <p className="font-oswald text-2xl text-text-primary mt-1">
                  {stats.total_impressions.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Affichages totaux
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-paper rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm">Clics</p>
                <p className="font-oswald text-2xl text-text-primary mt-1">
                  {stats.total_clicks.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Interactions totales
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <MousePointerClick className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-paper rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm">Taux de Clic (CTR)</p>
                <p className="font-oswald text-2xl text-text-primary mt-1">
                  {stats.ctr_percentage}%
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Performance globale
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Performers */}
      {stats && stats.top_performers && Array.isArray(stats.top_performers) && stats.top_performers.length > 0 && (
        <div className="bg-paper rounded-xl border border-white/5 p-6 mb-8">
          <h2 className="font-oswald text-xl text-text-primary uppercase mb-4">
            Top 5 Performers
          </h2>
          <div className="space-y-3">
            {stats.top_performers.map((sponsor, idx) => (
              <div key={sponsor.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-oswald text-primary font-bold">#{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-oswald text-text-primary">{sponsor.name}</p>
                  <p className="text-xs text-text-muted">
                    {sponsor.impressions.toLocaleString()} impressions • {sponsor.clicks} clics
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-oswald text-lg text-primary">
                    {calculateCTR(sponsor.impressions, sponsor.clicks)}%
                  </p>
                  <p className="text-xs text-text-muted">CTR</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sponsor Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-paper rounded-xl border border-white/5 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="font-oswald text-2xl text-text-primary uppercase mb-6">
              {editingSponsor ? 'Modifier le Sponsor' : 'Nouveau Sponsor'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-text-muted text-sm mb-2">Nom du Sponsor *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-text-muted text-sm mb-2 font-semibold">🖼️ Image/Bannière Publicitaire (URL) *</label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary"
                  placeholder="https://exemple.com/votre-banniere.png"
                  required
                />
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-400 font-medium mb-1">💡 Comment ajouter votre image :</p>
                  <p className="text-xs text-text-muted">1. Uploadez votre image sur un service (Imgur, Cloudinary, etc.)</p>
                  <p className="text-xs text-text-muted">2. Copiez l'URL directe de l'image</p>
                  <p className="text-xs text-text-muted">3. Collez-la dans le champ ci-dessus</p>
                  <p className="text-xs text-primary mt-2">📏 Taille recommandée: 400x200px (ratio 2:1)</p>
                </div>
                {formData.logo_url && (
                  <div className="mt-3">
                    <p className="text-xs text-text-muted mb-2">Aperçu :</p>
                    <img 
                      src={formData.logo_url} 
                      alt="Aperçu" 
                      className="w-48 h-auto border border-white/10 rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-text-muted text-sm mb-2">Site Web du Sponsor *</label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary"
                  placeholder="https://exemple.com"
                  required
                />
              </div>

              <div>
                <label className="block text-text-muted text-sm mb-2">Position *</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary"
                >
                  <option value="left">Gauche</option>
                  <option value="right">Droite</option>
                  <option value="both">Les deux</option>
                </select>
              </div>

              <div>
                <label className="block text-text-muted text-sm mb-2">Priorité</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary"
                  min="1"
                />
                <p className="text-xs text-text-muted mt-1">
                  Plus la valeur est élevée, plus le sponsor est affiché en haut
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-muted text-sm mb-2">Date de début</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-muted text-sm mb-2">Date de fin</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-text-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-text-muted text-sm">
                  Actif (visible sur le site)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary-dark">
                  {editingSponsor ? 'Mettre à jour' : 'Créer'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSponsor(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sponsors List */}
      <div className="bg-paper rounded-xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="font-oswald text-xl text-text-primary uppercase">
            Liste des Sponsors
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-oswald uppercase text-text-muted">Sponsor</th>
                <th className="px-6 py-3 text-left text-xs font-oswald uppercase text-text-muted">Position</th>
                <th className="px-6 py-3 text-left text-xs font-oswald uppercase text-text-muted">Période</th>
                <th className="px-6 py-3 text-left text-xs font-oswald uppercase text-text-muted">Impressions</th>
                <th className="px-6 py-3 text-left text-xs font-oswald uppercase text-text-muted">Clics</th>
                <th className="px-6 py-3 text-left text-xs font-oswald uppercase text-text-muted">CTR</th>
                <th className="px-6 py-3 text-left text-xs font-oswald uppercase text-text-muted">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-oswald uppercase text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sponsors.map((sponsor) => (
                <tr key={sponsor.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={sponsor.logo_url} 
                        alt={sponsor.name}
                        className="w-12 h-12 object-contain rounded"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23374151" width="48" height="48"/%3E%3C/svg%3E';
                        }}
                      />
                      <div>
                        <p className="font-oswald text-text-primary">{sponsor.name}</p>
                        <a 
                          href={sponsor.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          {new URL(sponsor.website_url).hostname}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-oswald uppercase ${
                      sponsor.position === 'left' ? 'bg-blue-500/20 text-blue-500' :
                      sponsor.position === 'right' ? 'bg-purple-500/20 text-purple-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {sponsor.position === 'left' ? 'Gauche' :
                       sponsor.position === 'right' ? 'Droite' : 'Les deux'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-muted text-sm">
                    {sponsor.start_date ? new Date(sponsor.start_date).toLocaleDateString('fr-FR') : '-'}
                    {' → '}
                    {sponsor.end_date ? new Date(sponsor.end_date).toLocaleDateString('fr-FR') : '∞'}
                  </td>
                  <td className="px-6 py-4 font-oswald text-text-primary">
                    {sponsor.impressions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-oswald text-text-primary">
                    {sponsor.clicks}
                  </td>
                  <td className="px-6 py-4 font-oswald text-primary">
                    {calculateCTR(sponsor.impressions, sponsor.clicks)}%
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-oswald uppercase ${
                      sponsor.active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {sponsor.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(sponsor)}
                        className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(sponsor.id)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {sponsors.length === 0 && (
            <div className="p-8 text-center text-text-muted">
              <p>Aucun sponsor pour le moment</p>
              <Button 
                onClick={() => setShowForm(true)}
                variant="ghost"
                className="mt-4 text-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer votre premier sponsor
              </Button>
            </div>
          )}
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSponsorsPage;
