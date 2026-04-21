'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [memberDiscountPercent, setMemberDiscountPercent] = useState(0);
  const [offers, setOffers] = useState({ combos: [], priceRules: [], giftOffers: [] });
  const [mounted, setMounted] = useState(false);

  // Load cart and session on mount
  useEffect(() => {
    setMounted(true);
    
    // Load cart
    try {
      const saved = localStorage.getItem('dk7_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}

    // Load session & dynamic settings & offers
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/admin/settings').then(r => r.json()),
      fetch('/api/public/offers').then(r => r.json())
    ]).then(([userData, settings, offersData]) => {
      if (userData.authenticated) setUser(userData.user);
      if (settings.member_discount_percent) setMemberDiscountPercent(parseFloat(settings.member_discount_percent));
      if (offersData) setOffers(offersData);
    }).catch(err => console.error("Failed to load session/settings/offers", err));
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

  // Calculate computed items with applied rules
  const computedItems = items.map(item => {
    let effectivePrice = item.price;
    let appliedRule = null;
    let discountReason = null;

    // 1. Check Price Rules (Volume Discount)
    if (offers.priceRules) {
      const rule = offers.priceRules.find(r => r.productId === item.id && item.qty >= r.minQty);
      if (rule) {
        effectivePrice = rule.price;
        appliedRule = 'priceRule';
        discountReason = rule.label || `خصم الكمية`;
      }
    }

    return { ...item, effectivePrice, appliedRule, discountReason };
  });

  // 2. Check Combos
  if (offers.combos) {
    offers.combos.forEach(combo => {
      // Check if all combo items are in the cart
      const hasAllItems = combo.items.every(ci => computedItems.find(i => i.id === ci.productId && i.qty >= ci.quantity));
      if (hasAllItems) {
        // Apply combo discount to all items of the combo
        combo.items.forEach(ci => {
          const cartItem = computedItems.find(i => i.id === ci.productId);
          if (cartItem && !cartItem.appliedRule) { // Only apply if no other rule applied
            cartItem.effectivePrice = cartItem.price * (1 - (combo.discountPercent / 100));
            cartItem.appliedRule = 'combo';
            cartItem.discountReason = combo.name;
          }
        });
      }
    });
  }

  // 3. Check Gift Offers
  const finalItems = [...computedItems];
  if (offers.giftOffers) {
    offers.giftOffers.forEach(go => {
      const buyItem = computedItems.find(i => i.id === go.buyProductId);
      if (buyItem) {
        // Automatically add the gift item
        // Only add as many gifts as the product bought
        const existingGift = finalItems.find(i => i.id === go.getProductId && i.isGift);
        if (!existingGift && go.getProduct) {
          finalItems.push({
            id: go.getProduct.id,
            name: go.getProduct.name,
            price: go.getProduct.price,
            effectivePrice: 0,
            imageUrl: go.getProduct.imageUrl || null,
            qty: buyItem.qty,
            isGift: true,
            discountReason: 'هدية مجانية'
          });
        }
      }
    });
  }

  const subtotal = finalItems.reduce((sum, i) => sum + i.effectivePrice * i.qty, 0);
  const memberDiscount = user ? (subtotal * (memberDiscountPercent / 100)) : 0;
  const total = subtotal - memberDiscount;
  const count = finalItems.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ 
      items, computedItems: finalItems, addItem, removeItem, updateQty, clearCart, 
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
