import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { ShoppingBag, Filter, Search, Star, ChevronRight, Check } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'Tous les produits' },
  { id: 'Mittens', name: 'Mittens' },
  { id: 'Gants de Combat', name: 'Gants de Combat' },
  { id: 'Casques', name: 'Casques' },
  { id: 'Protections', name: 'Protections' },
  { id: 'Kimonos', name: 'Kimonos' },
  { id: 'Accessoires', name: 'Accessoires' },
];

const ProductCard = ({ product, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, 1, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-paper rounded-2xl border border-white/5 overflow-hidden hover:border-primary/30 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-background">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
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
      <div className="p-5">
        <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">
          {product.category}
        </p>
        <h3 className="font-oswald text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-text-muted text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-text-muted mb-2">Taille</p>
            <div className="flex flex-wrap gap-1">
              {product.sizes.slice(0, 4).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    selectedSize === size
                      ? 'bg-primary text-white border-primary'
                      : 'border-white/10 text-text-secondary hover:border-primary/50'
                  }`}
                >
                  {size}
                </button>
              ))}
              {product.sizes.length > 4 && (
                <span className="px-2 py-1 text-xs text-text-muted">+{product.sizes.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <p className="font-oswald text-2xl font-bold text-primary">
            {product.price.toFixed(2)}€
          </p>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || added}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:cursor-not-allowed ${
              added 
                ? 'bg-green-500 text-white' 
                : 'bg-primary text-white hover:bg-primary-dark disabled:opacity-50'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                Ajouté !
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

const ShopPage = () => {
  const { addItem, getItemCount, openCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const cartCount = getItemCount();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = selectedCategory !== 'all' ? `?category=${encodeURIComponent(selectedCategory)}` : '';
      const response = await api.get(`/products${params}`);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6 bg-gradient-to-b from-paper to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center relative">
            <h1 className="font-oswald text-4xl md:text-5xl font-bold text-text-primary uppercase tracking-wide mb-4">
              Boutique Officielle
            </h1>
            <p className="text-text-secondary font-manrope text-lg max-w-2xl mx-auto">
              Équipement professionnel certifié Académie Jacques Levinet
            </p>
            
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="absolute right-0 top-0 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline">Panier</span>
              {cartCount > 0 && (
                <span className="w-6 h-6 bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-paper border border-white/10 rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Categories */}
                <div className="bg-paper rounded-xl border border-white/5 p-4">
                  <h3 className="font-oswald text-sm font-bold text-text-primary uppercase mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
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

                {/* Premium Banner */}
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl p-4 border border-primary/20">
                  <p className="font-oswald text-sm font-bold text-primary uppercase mb-2">
                    Membre Premium ?
                  </p>
                  <p className="text-text-secondary text-xs mb-3">
                    Bénéficiez de 10% de remise sur tous les produits !
                  </p>
                  <Link
                    to="/member/dashboard"
                    className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline"
                  >
                    En savoir plus <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <main className="flex-1">
              {/* Results count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-text-muted font-manrope">
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                </p>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-text-muted">Chargement...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-paper rounded-2xl border border-white/5">
                  <ShoppingBag className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted">Aucun produit trouvé</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={addItem} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default ShopPage;
