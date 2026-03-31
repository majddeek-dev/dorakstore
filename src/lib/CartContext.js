'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [memberDiscountPercent, setMemberDiscountPercent] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Load cart and session on mount
  useEffect(() => {
    setMounted(true);
    
    // Load cart
    try {
      const saved = localStorage.getItem('dk7_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}

    // Load session & dynamic settings
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json())
    ]).then(([userData, settings]) => {
      if (userData.authenticated) setUser(userData.user);
      if (settings.member_discount_percent) setMemberDiscountPercent(parseFloat(settings.member_discount_percent));
    }).catch(err => console.error("Failed to load session/settings", err));
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('dk7_cart', JSON.stringify(items));
    }
  }, [items, mounted]);

  function addItem(product) {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl || null, qty: 1 }
      ];
    });
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function updateQty(id, delta) {
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
        .filter(i => i.qty > 0)
    );
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const memberDiscount = user ? (subtotal * (memberDiscountPercent / 100)) : 0;
  const total = subtotal - memberDiscount;
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ 
      items, addItem, removeItem, updateQty, clearCart, 
      subtotal, memberDiscount, memberDiscountPercent, total, count, user 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
