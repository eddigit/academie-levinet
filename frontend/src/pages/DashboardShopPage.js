import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { ShoppingBag, Filter, Search, Star, Tag, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'all', name: 'Tous les produits' },
  { id: 'Mittens', name: 'Mittens' },
  { id: 'Gants de Combat', name: 'Gants de Combat' },
  { id: 'Casques', name: 'Casques' },
  { id: 'Protections', name: 'Protections' },
  { id: 'Kimonos', name: 'Kimonos' },
  { id: 'Accessoires', name: 'Accessoires' },
];

const ProductCard = ({ product, isPremium, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [added, setAdded] = useState(false);
  
  const discountedPrice = isPremium ? (product.price * 0.9).toFixed(2) : null;

  const handleAddToCart = () => {
    onAddToCart(product, 1, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-paper rounded-xl border border-white/5 overflow-hidden hover:border-primary/30 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-background">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isPremium && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded flex items-center gap-1">
            <Tag className="w-3 h-3" />
            -10%
          </span>
        )}
        {product.stock < 5 && product.stock > 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
            Stock limité
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
            Rupture
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <h3 className="font-oswald text-base font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-text-muted text-xs mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {product.sizes.slice(0, 4).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                    selectedSize === size
                      ? 'bg-primary text-white border-primary'
                      : 'border-white/10 text-text-secondary hover:border-primary/50'
                  }`}
                >
                  {size}
                </button>
              ))}
              {product.sizes.length > 4 && (
                <span className="px-2 py-0.5 text-xs text-text-muted">+{product.sizes.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div>
            {isPremium ? (
              <div className="flex items-center gap-2">
                <p className="font-oswald text-xl font-bold text-primary">{discountedPrice}€</p>
                <p className="font-oswald text-sm text-text-muted line-through">{product.price.toFixed(2)}€</p>
              </div>
            ) : (
              <p className="font-oswald text-xl font-bold text-text-primary">{product.price.toFixed(2)}€</p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || added}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              added
                ? 'bg-green-500 text-white'
                : product.stock === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                Ajouté
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Ajouter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardShopPage = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isPremium = user?.is_premium || false;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      const data = response.data?.products || response.data || [];
      setProducts(Array.isArray(data) ? data.filter(p => p.is_active) : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-oswald text-2xl font-bold text-text-primary uppercase flex items-center gap-3">
              <ShoppingBag className="w-7 h-7 text-primary" />
              Boutique AJL
            </h1>
            <p className="text-text-secondary mt-1">Équipements et accessoires officiels de l'Académie</p>
          </div>
          {isAdmin && (
            <Link 
              to="/admin/products"
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Gérer les produits
            </Link>
          )}
        </div>

        {/* Premium Banner */}
        {!isPremium && (
          <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-oswald text-primary font-bold uppercase">Passez Premium</p>
                  <p className="text-text-secondary text-sm">Bénéficiez de 10% de remise sur tous les produits !</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-dark transition-colors">
                5,99€/mois
              </button>
            </div>
          </div>
        )}

        {isPremium && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-500" fill="currentColor" />
              <div>
                <p className="font-oswald text-yellow-500 font-bold uppercase">Membre Premium</p>
                <p className="text-text-secondary text-sm">Vous bénéficiez de -10% sur tous les produits !</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="w-56 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-paper border border-white/10 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
              </div>

              {/* Categories */}
              <div className="bg-paper rounded-xl border border-white/5 p-4">
                <h3 className="font-oswald text-xs font-bold text-text-primary uppercase mb-3 flex items-center gap-2">
                  <Filter className="w-3 h-3" />
                  Catégories
                </h3>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-primary text-white'
                          : 'text-text-secondary hover:bg-white/5'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-text-muted text-sm font-manrope">
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-text-muted">Chargement...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-paper rounded-xl border border-white/5">
                <ShoppingBag className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">Aucun produit trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    isPremium={isPremium}
                    onAddToCart={addItem}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardShopPage;
