import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { Plus, Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${API_URL}/api`;

const NewsPage = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentNews, setCurrentNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Événement',
    status: 'Brouillon',
    image_url: ''
  });

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

  const handleAddNews = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/news`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Actualité créée avec succès');
      setIsAddModalOpen(false);
      resetForm();
      fetchNews();
    } catch (error) {
      console.error('Error creating news:', error);
      toast.error('Erreur lors de la création');
    }
  };

  const handleEditNews = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/news/${currentNews.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Actualité mise à jour');
      setIsEditModalOpen(false);
      resetForm();
      fetchNews();
    } catch (error) {
      console.error('Error updating news:', error);
      toast.error('Erreur lors de la mise à jour');
    }
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

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'Événement',
      status: 'Brouillon',
      image_url: ''
    });
    setCurrentNews(null);
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
    totalViews: newsList.reduce((sum, n) => sum + n.views, 0)
  };

  const NewsForm = ({ onSubmit, isEdit }) => (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div>
        <Label className="text-text-secondary">Titre *</Label>
        <Input
          data-testid="input-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="bg-background border-border text-text-primary"
          placeholder="Titre de l'actualité"
        />
      </div>

      <div>
        <Label className="text-text-secondary">Extrait *</Label>
        <Input
          data-testid="input-excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          required
          className="bg-background border-border text-text-primary"
          placeholder="Court résumé (150 caractères max)"
          maxLength={150}
        />
      </div>

      <div>
        <Label className="text-text-secondary">Contenu *</Label>
        <textarea
          data-testid="input-content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
          rows={6}
          className="w-full px-4 py-3 bg-background border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-manrope"
          placeholder="Contenu complet de l'actualité"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-text-secondary">Catégorie</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger data-testid="select-category" className="bg-background border-border text-text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-paper border-border">
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
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger data-testid="select-status" className="bg-background border-border text-text-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-paper border-border">
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
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          className="bg-background border-border text-text-primary"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <Button 
        type="submit" 
        data-testid="submit-news-button"
        className="w-full bg-primary hover:bg-primary-dark text-white font-oswald uppercase"
      >
        {isEdit ? 'Mettre à jour' : 'Créer l\'actualité'}
      </Button>
    </form>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="news-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-oswald text-4xl font-bold text-text-primary uppercase tracking-wide" data-testid="news-title">
              Gestion des News
            </h1>
            <p className="text-text-secondary font-manrope mt-2">{newsList.length} actualités</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-news-button" className="bg-primary hover:bg-primary-dark text-white font-oswald uppercase">
                <Plus className="w-4 h-4 mr-2" /> Nouvelle Actualité
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-paper border-border max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="add-news-modal">
              <DialogHeader>
                <DialogTitle className="font-oswald text-2xl text-text-primary uppercase">Nouvelle Actualité</DialogTitle>
              </DialogHeader>
              <NewsForm onSubmit={handleAddNews} isEdit={false} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-manrope">Total</p>
                <p className="text-2xl font-oswald font-bold text-text-primary">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-manrope">Publiées</p>
                <p className="text-2xl font-oswald font-bold text-text-primary">{stats.published}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-text-muted/20 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-text-muted" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-manrope">Brouillons</p>
                <p className="text-2xl font-oswald font-bold text-text-primary">{stats.draft}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-text-secondary font-manrope">Vues Total</p>
                <p className="text-2xl font-oswald font-bold text-text-primary">{stats.totalViews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="news-grid">
          {loading ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-text-secondary font-manrope">Chargement...</p>
            </div>
          ) : newsList.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-text-secondary font-manrope">Aucune actualité</p>
            </div>
          ) : (
            newsList.map((news, index) => (
              <div key={news.id} className="stat-card group hover:scale-105 transition-transform duration-300" data-testid={`news-card-${index}`}>
                {news.image_url && (
                  <div className="w-full h-48 overflow-hidden rounded-lg mb-4">
                    <img 
                      src={news.image_url} 
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex gap-2 mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-manrope font-medium ${getCategoryColor(news.category)}`}>
                    {news.category}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-manrope font-medium ${getStatusColor(news.status)}`}>
                    {news.status}
                  </span>
                </div>
                <h3 className="font-oswald text-xl font-bold text-text-primary uppercase mb-2 line-clamp-2">
                  {news.title}
                </h3>
                <p className="text-text-secondary font-manrope text-sm mb-4 line-clamp-3">
                  {news.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-text-muted font-manrope mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" strokeWidth={1.5} />
                    <span>{news.author_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" strokeWidth={1.5} />
                    <span>{news.views} vues</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    data-testid={`edit-news-${index}`}
                    onClick={() => openEditModal(news)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-border text-text-secondary hover:text-text-primary"
                  >
                    <Edit className="w-4 h-4 mr-2" strokeWidth={1.5} /> Modifier
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

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-paper border-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-oswald text-2xl text-text-primary uppercase">Modifier l'Actualité</DialogTitle>
            </DialogHeader>
            <NewsForm onSubmit={handleEditNews} isEdit={true} />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default NewsPage;
