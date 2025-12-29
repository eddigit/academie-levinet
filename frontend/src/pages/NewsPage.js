import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { Plus, Edit, Trash2, Eye, Calendar, User, X, Loader2, MessageCircle, ThumbsUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import NewsDetailModal from '../components/NewsDetailModal';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_URL}/api`;

// News Modal Component - Extracted outside to prevent re-renders
const NewsModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isEdit, 
  saving,
  formData,
  onFieldChange
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="font-oswald text-xl text-text-primary uppercase">
            {isEdit ? 'Modifier l\'Actualité' : 'Nouvelle Actualité'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div>
            <Label className="text-text-secondary">Titre *</Label>
            <Input
              data-testid="input-title"
              value={formData.title}
              onChange={(e) => onFieldChange('title', e.target.value)}
              required
              className="mt-1 bg-background border-white/10 text-text-primary"
              placeholder="Titre de l'actualité"
            />
          </div>

          <div>
            <Label className="text-text-secondary">Extrait *</Label>
            <Input
              data-testid="input-excerpt"
              value={formData.excerpt}
              onChange={(e) => onFieldChange('excerpt', e.target.value)}
              required
              className="mt-1 bg-background border-white/10 text-text-primary"
              placeholder="Court résumé (150 caractères max)"
              maxLength={150}
            />
          </div>

          <div>
            <Label className="text-text-secondary">Contenu *</Label>
            <textarea
              data-testid="input-content"
              value={formData.content}
              onChange={(e) => onFieldChange('content', e.target.value)}
              required
              rows={6}
              className="w-full mt-1 px-4 py-3 bg-background border border-white/10 rounded-md text-text-primary font-manrope resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Contenu complet de l'actualité"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-text-secondary">Catégorie</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => onFieldChange('category', value)}
              >
                <SelectTrigger data-testid="select-category" className="mt-1 bg-background border-white/10 text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-paper border-white/10">
                  <SelectItem value="Événement" className="text-text-primary">Événement</SelectItem>
                  <SelectItem value="Résultat" className="text-text-primary">Résultat</SelectItem>
                  <SelectItem value="Formation" className="text-text-primary">Formation</SelectItem>
                  <SelectItem value="Annonce" className="text-text-primary">Annonce</SelectItem>
                  <SelectItem value="Réussite" className="text-text-primary">Réussite</SelectItem>
                  <SelectItem value="Technique" className="text-text-primary">Technique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-text-secondary">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => onFieldChange('status', value)}
              >
                <SelectTrigger data-testid="select-status" className="mt-1 bg-background border-white/10 text-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-paper border-white/10">
                  <SelectItem value="Brouillon" className="text-text-primary">Brouillon</SelectItem>
                  <SelectItem value="Publié" className="text-text-primary">Publié</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-text-secondary">URL de l'image (optionnel)</Label>
            <Input
              data-testid="input-image"
              type="url"
              value={formData.image_url}
              onChange={(e) => onFieldChange('image_url', e.target.value)}
              className="mt-1 bg-background border-white/10 text-text-primary"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/10"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              data-testid="submit-news-button"
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-oswald uppercase"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</>
              ) : (
                isEdit ? 'Mettre à jour' : 'Créer l\'actualité'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const initialFormData = {
  title: '',
  excerpt: '',
  content: '',
  category: 'Événement',
  status: 'Brouillon',
  image_url: ''
};

const NewsPage = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentNews, setCurrentNews] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [saving, setSaving] = useState(false);

  // Single form state object to prevent re-renders
  const [formData, setFormData] = useState(initialFormData);
  
  // Handler to update a single field - memoized to prevent re-renders
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API}/news`);
      setNewsList(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Erreur lors du chargement des news');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentNews(null);
  }, []);

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const openEditModal = (news) => {
    setCurrentNews(news);
    setFormData({
      title: news.title,
      excerpt: news.excerpt,
      content: news.content,
      category: news.category,
      status: news.status,
      image_url: news.image_url || ''
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    resetForm();
  };

  const openDetailModal = (news) => {
    setSelectedNews(news);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedNews(null);
  };

  const handleAddNews = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.excerpt || !formData.content) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/news`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Actualité créée avec succès');
      closeAddModal();
      fetchNews();
    } catch (error) {
      console.error('Error creating news:', error);
      toast.error('Erreur lors de la création');
    }
    setSaving(false);
  };

  const handleEditNews = async (e) => {
    e.preventDefault();
    if (!currentNews) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/news/${currentNews.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Actualité mise à jour');
      closeEditModal();
      fetchNews();
    } catch (error) {
      console.error('Error updating news:', error);
      toast.error('Erreur lors de la mise à jour');
    }
    setSaving(false);
  };

  const handleDelete = async (newsId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette actualité?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API}/news/${newsId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Actualité supprimée');
        fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const getStatusColor = (status) => {
    return status === 'Publié' ? 'bg-primary/20 text-primary' : 'bg-text-muted/20 text-text-muted';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Événement': 'bg-accent/20 text-accent',
      'Résultat': 'bg-primary/20 text-primary',
      'Formation': 'bg-secondary/20 text-secondary',
      'Annonce': 'bg-text-primary/20 text-text-primary',
      'Réussite': 'bg-green-500/20 text-green-500',
      'Technique': 'bg-purple-500/20 text-purple-500'
    };
    return colors[category] || 'bg-text-muted/20 text-text-muted';
  };

  const stats = {
    total: newsList.length,
    published: newsList.filter(n => n.status === 'Publié').length,
    draft: newsList.filter(n => n.status === 'Brouillon').length,
    totalViews: newsList.reduce((sum, n) => sum + (n.views || 0), 0)
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8" data-testid="news-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-oswald text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary uppercase tracking-wide" data-testid="news-title">
              Gestion des News
            </h1>
            <p className="text-text-secondary font-manrope mt-1 text-sm md:text-base">{newsList.length} actualités</p>
          </div>
          <Button 
            onClick={openAddModal}
            data-testid="add-news-button" 
            className="bg-primary hover:bg-primary-dark text-white font-oswald uppercase w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Nouvelle Actualité
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="stat-card p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs md:text-sm text-text-secondary font-manrope">Total</p>
                <p className="text-xl md:text-2xl font-oswald font-bold text-text-primary">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="stat-card p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 md:w-6 md:h-6 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs md:text-sm text-text-secondary font-manrope">Publiées</p>
                <p className="text-xl md:text-2xl font-oswald font-bold text-text-primary">{stats.published}</p>
              </div>
            </div>
          </div>
          <div className="stat-card p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-text-muted/20 rounded-lg flex items-center justify-center">
                <Edit className="w-5 h-5 md:w-6 md:h-6 text-text-muted" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs md:text-sm text-text-secondary font-manrope">Brouillons</p>
                <p className="text-xl md:text-2xl font-oswald font-bold text-text-primary">{stats.draft}</p>
              </div>
            </div>
          </div>
          <div className="stat-card p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 md:w-6 md:h-6 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs md:text-sm text-text-secondary font-manrope">Vues Total</p>
                <p className="text-xl md:text-2xl font-oswald font-bold text-text-primary">{stats.totalViews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" data-testid="news-grid">
          {loading ? (
            <div className="col-span-3 text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-text-secondary font-manrope">Chargement...</p>
            </div>
          ) : newsList.length === 0 ? (
            <div className="col-span-3 text-center py-12 bg-paper rounded-xl border border-white/10">
              <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary font-manrope">Aucune actualité</p>
              <Button onClick={openAddModal} className="mt-4 bg-primary hover:bg-primary-dark">
                <Plus className="w-4 h-4 mr-2" /> Créer une actualité
              </Button>
            </div>
          ) : (
            newsList.map((news, index) => (
              <div key={news.id} className="stat-card p-4 md:p-6 group hover:border-primary/30 transition-colors" data-testid={`news-card-${index}`}>
                {news.image_url && (
                  <div className="w-full h-48 overflow-hidden rounded-lg mb-4">
                    <img 
                      src={news.image_url} 
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-manrope font-medium ${getCategoryColor(news.category)}`}>
                    {news.category}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-manrope font-medium ${getStatusColor(news.status)}`}>
                    {news.status}
                  </span>
                </div>
                <h3 className="font-oswald text-lg md:text-xl font-bold text-text-primary uppercase mb-2 line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-text-secondary font-manrope text-sm mb-4 line-clamp-3">
                  {news.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-text-muted font-manrope mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" strokeWidth={1.5} />
                      <span>{news.author_name || 'Anonyme'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" strokeWidth={1.5} />
                      <span>{news.reactions_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" strokeWidth={1.5} />
                      <span>{news.comments_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" strokeWidth={1.5} />
                    <span>{news.views || 0} vues</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => openDetailModal(news)}
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white"
                  >
                    <Eye className="w-4 h-4 mr-1 md:mr-2" strokeWidth={1.5} />
                    <span className="hidden sm:inline">Voir</span>
                  </Button>
                  <Button
                    data-testid={`edit-news-${index}`}
                    onClick={() => openEditModal(news)}
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-text-secondary hover:text-text-primary"
                  >
                    <Edit className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                  <Button
                    data-testid={`delete-news-${index}`}
                    onClick={() => handleDelete(news.id)}
                    variant="outline"
                    size="sm"
                    className="border-secondary/50 text-secondary hover:bg-secondary/10"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Modal */}
        <NewsModal 
          isOpen={isAddModalOpen} 
          onClose={closeAddModal} 
          onSubmit={handleAddNews}
          isEdit={false}
          saving={saving}
          formData={formData}
          onFieldChange={handleFieldChange}
        />

        {/* Edit Modal */}
        <NewsModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleEditNews}
          isEdit={true}
          saving={saving}
          formData={formData}
          onFieldChange={handleFieldChange}
        />

        {/* Detail Modal */}
        <NewsDetailModal
          news={selectedNews}
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          onUpdate={fetchNews}
        />
      </div>
    </DashboardLayout>
  );
};

export default NewsPage;
