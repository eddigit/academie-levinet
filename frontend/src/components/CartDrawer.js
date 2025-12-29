import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  X, ShoppingBag, Trash2, Plus, Minus, Tag, 
  CreditCard, AlertCircle, Loader2 
} from 'lucide-react';

const CartDrawer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    items, isOpen, closeCart, removeItem, 
    updateQuantity, getSubtotal, getTotal, clearCart, getItemCount 
  } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is premium (you can adapt this based on your user model)
  const isPremium = user?.is_premium || false;
  const discount = isPremium ? 0.10 : 0;

  const handleCheckout = async () => {
    if (!user) {
      closeCart();
      navigate('/login?redirect=/member/boutique');
      return;
    }

    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const cartItems = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size
      }));

      const response = await api.post('/payments/shop/checkout', {
        items: cartItems,
        origin_url: window.location.origin,
        apply_premium_discount: isPremium
      });

      // Redirect to Stripe checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.detail || 'Erreur lors du paiement');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const total = getTotal(isPremium);
  const savings = subtotal - total;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-paper z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h2 className="font-oswald text-xl font-bold text-text-primary uppercase">
              Panier ({getItemCount()})
            </h2>
          </div>
          <button 
            onClick={closeCart}
            className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">Votre panier est vide</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div 
                  key={`${item.product.id}-${item.size}-${index}`}
                  className="flex gap-4 p-3 bg-background rounded-lg border border-white/5"
                >
                  {/* Product Image */}
                  <img 
                    src={item.product.image_url} 
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg bg-paper"
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary text-sm truncate">
                      {item.product.name}
                    </h3>
                    {item.size && (
                      <p className="text-xs text-text-muted">Taille: {item.size}</p>
                    )}
                    <p className="font-oswald text-primary font-bold mt-1">
                      {item.product.price.toFixed(2)}€
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="p-1 bg-white/5 hover:bg-white/10 rounded text-text-muted hover:text-text-primary transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-text-primary font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="p-1 bg-white/5 hover:bg-white/10 rounded text-text-muted hover:text-text-primary transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.product.id, item.size)}
                      className="p-1 text-text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="font-oswald font-bold text-text-primary">
                      {(item.product.price * item.quantity).toFixed(2)}€
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Summary & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-white/10 p-4 space-y-4">
            {/* Premium Discount Banner */}
            {!isPremium && (
              <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-500 font-semibold">
                    Passez Premium pour -10% sur votre commande !
                  </span>
                </div>
              </div>
            )}

            {isPremium && (
              <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500 font-semibold">
                    Réduction Premium -10% appliquée !
                  </span>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-text-secondary">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)}€</span>
              </div>
              {isPremium && savings > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Réduction Premium (-10%)</span>
                  <span>-{savings.toFixed(2)}€</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-white/5">
                <span>Total</span>
                <span className="font-oswald text-primary">{total.toFixed(2)}€</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-500">{error}</span>
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-oswald uppercase leading-none tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Passer commande
                </>
              )}
            </button>

            {/* Clear Cart */}
            <button
              onClick={clearCart}
              className="w-full py-2 text-text-muted hover:text-red-500 text-sm transition-colors"
            >
              Vider le panier
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
