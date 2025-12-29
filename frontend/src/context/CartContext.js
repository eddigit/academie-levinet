import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('ajl_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        localStorage.removeItem('ajl_cart');
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('ajl_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1, size = null) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.size === size
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, { product, quantity, size }];
    });
    setIsOpen(true); // Open cart drawer when adding
  };

  const removeItem = (productId, size = null) => {
    setItems(prev => prev.filter(
      item => !(item.product.id === productId && item.size === size)
    ));
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.product.id === productId && item.size === size) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('ajl_cart');
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getTotal = (applyDiscount = false) => {
    const subtotal = getSubtotal();
    return applyDiscount ? subtotal * 0.9 : subtotal;
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(prev => !prev);

  return (
    <CartContext.Provider value={{
      items,
      isOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount,
      getSubtotal,
      getTotal,
      openCart,
      closeCart,
      toggleCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
