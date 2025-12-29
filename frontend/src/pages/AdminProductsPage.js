import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import { 
  Package, Plus, Edit2, Trash2, Search, AlertTriangle,
  DollarSign, Archive, TrendingUp, X
} from 'lucide-react';

const CATEGORIES = ['Mittens', 'Gants de Combat', 'Casques', 'Protections', 'Kimonos', 'Accessoires'];

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState(product || {
    name: '',
    description: '',
    price: '',
    category: 'Mittens',
    image_url: '',
    stock: 0,
    sizes: '',
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      sizes: typeof formData.sizes === 'string' 
        ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean)
        : formData.sizes
    };
    
    try {
      if (product?.id) {
        await api.put(`/admin/products/${product.id}`, data);
      } else {
        await api.post('/admin/products', data);
      }
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="font-oswald text-xl font-bold text-text-primary uppercase">
            {product?.id ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-text-secondary mb-2">Nom du produit</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-text-secondary mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Prix (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">Tailles (séparées par ,)</label>
              <input
                type="text"
                value={Array.isArray(formData.sizes) ? formData.sizes.join(', ') : formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                placeholder="S, M, L, XL"
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-text-secondary mb-2">URL de l'image</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div className="col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded border-white/20 bg-background text-primary focus:ring-primary"
              />
              <label htmlFor="is_active" className="text-text-secondary">Produit actif (visible en boutique)</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-text-secondary hover:text-text-primary transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : (product?.id ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, statsRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/shop/stats')
      ]);
      setProducts(productsRes.data.products || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    
    try {
      await api.delete(`/admin/products/${productId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleModalSave = () => {
    handleModalClose();
    fetchData();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-oswald text-3xl font-bold text-text-primary uppercase tracking-wide">
              Gestion Boutique
            </h1>
            <p className="text-text-secondary font-manrope mt-1">
              Gérez vos produits et stocks
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau Produit
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-oswald text-2xl font-bold text-text-primary">{stats.total_products}</p>
                  <p className="text-text-muted text-sm">Produits total</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="font-oswald text-2xl font-bold text-text-primary">{stats.active_products}</p>
                  <p className="text-text-muted text-sm">Produits actifs</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-oswald text-2xl font-bold text-text-primary">{stats.total_orders}</p>
                  <p className="text-text-muted text-sm">Commandes</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="font-oswald text-2xl font-bold text-text-primary">{stats.low_stock_products?.length || 0}</p>
                  <p className="text-text-muted text-sm">Stock faible</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Low Stock Alert */}
        {stats?.low_stock_products?.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="font-oswald text-orange-500 uppercase font-bold">Stock Faible</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.low_stock_products.map(p => (
                <span key={p.id} className="px-3 py-1 bg-orange-500/20 text-orange-300 text-sm rounded-full">
                  {p.name} ({p.stock} restants)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-paper border border-white/10 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
        </div>

        {/* Products Table */}
        <div className="stat-card overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-text-muted">Chargement...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-4 px-4 font-oswald text-sm uppercase text-text-secondary">Produit</th>
                    <th className="text-left py-4 px-4 font-oswald text-sm uppercase text-text-secondary">Catégorie</th>
                    <th className="text-left py-4 px-4 font-oswald text-sm uppercase text-text-secondary">Prix</th>
                    <th className="text-left py-4 px-4 font-oswald text-sm uppercase text-text-secondary">Stock</th>
                    <th className="text-left py-4 px-4 font-oswald text-sm uppercase text-text-secondary">Statut</th>
                    <th className="text-right py-4 px-4 font-oswald text-sm uppercase text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-background"
                          />
                          <div>
                            <p className="font-semibold text-text-primary">{product.name}</p>
                            <p className="text-xs text-text-muted truncate max-w-xs">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-oswald text-lg text-text-primary">{product.price.toFixed(2)}€</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-bold ${
                          product.stock === 0 ? 'text-red-500' :
                          product.stock < 5 ? 'text-orange-500' :
                          'text-green-500'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          product.is_active 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {product.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-primary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-white/10 rounded-lg text-text-muted hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminProductsPage;
