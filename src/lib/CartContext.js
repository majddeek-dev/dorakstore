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
        { id: product.id, name: product.name, categoryId: product.categoryId || null, price: product.price, imageUrl: product.imageUrl || null, qty: 1 }
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

  function chooseGift(offerId, product) {
    setItems(prev => {
      const existing = prev.find(i => i.isGift && i.giftOfferId === offerId && i.realProductId === product.id);
      if (existing) {
         return prev.map(i => i.id === existing.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [
        ...prev,
        { 
          id: offerId + "_gift_" + product.id,
          realProductId: product.id,
          name: product.name, 
          categoryId: product.categoryId || null, 
          price: product.price, 
          imageUrl: product.imageUrl || null, 
          qty: 1,
          isGift: true,
          giftOfferId: offerId
        }
      ];
    });
  }

  function clearCart() {
    setItems([]);
  }

  // Calculate computed items with applied rules
  const computedItems = items.map(item => {
    let effectivePrice = item.price;
    let appliedRule = null;
    let discountReason = null;

    if (item.isGift) {
       return { ...item, effectivePrice: 0, appliedRule: 'giftChoice', discountReason: 'هدية مجانية (اختيارك)' };
    }

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
  const pendingGiftsList = [];
  
  if (offers.giftOffers) {
    offers.giftOffers.forEach(go => {
      // Find all items that satisfy the offer
      const matchingItems = finalItems.filter(i => {
        if (i.isGift) return false; // Prevent gifts from triggering more gifts
        let matches = false;
        
        if (go.buyProductId) {
          matches = (i.id === go.buyProductId);
        } else {
          // If no specific product, check category and/or price
          let catMatch = go.buyCategoryId ? (i.categoryId === go.buyCategoryId) : true;
          let priceMatch = go.minPrice ? (i.price >= go.minPrice) : true;
          
          if (!go.buyCategoryId && !go.minPrice) {
            matches = false; // Invalid offer condition
          } else {
            matches = catMatch && priceMatch;
          }
        }
        return matches;
      });

      if (matchingItems.length > 0) {
        // Add the gift item
        const totalQty = matchingItems.reduce((sum, item) => sum + item.qty, 0);
        
        if (go.getProductId && go.getProduct) {
           const existingGift = finalItems.find(i => i.id === go.getProductId && i.isGift && i.giftOfferId === go.id);
           if (!existingGift) {
             finalItems.push({
               id: go.getProduct.id,
               name: go.getProduct.name,
               price: go.getProduct.price,
               effectivePrice: 0,
               imageUrl: go.getProduct.imageUrl || null,
               qty: totalQty,
               isGift: true,
               giftOfferId: go.id,
               discountReason: 'هدية مجانية'
             });
           } else {
             existingGift.qty = totalQty; // sync qty
           }
        } else if (go.getCategoryId) {
           const chosenGiftsForOffer = finalItems.filter(i => i.isGift && i.giftOfferId === go.id);
           const chosenQty = chosenGiftsForOffer.reduce((sum, item) => sum + item.qty, 0);

           if (chosenQty < totalQty) {
              pendingGiftsList.push({
                 offer: go,
                 qtyRemaining: totalQty - chosenQty
              });
           } else if (chosenQty > totalQty) {
              let excess = chosenQty - totalQty;
              for (let cg of chosenGiftsForOffer) {
                 if (excess <= 0) break;
                 if (cg.qty <= excess) {
                     excess -= cg.qty;
                     const idx = finalItems.indexOf(cg);
                     if (idx !== -1) finalItems.splice(idx, 1);
                 } else {
                     cg.qty -= excess;
                     excess = 0;
                 }
              }
           }
        }
      } else {
        // Condition not met, strip any chosen gifts for this offer
        for (let i = finalItems.length - 1; i >= 0; i--) {
            if (finalItems[i].isGift && finalItems[i].giftOfferId === go.id) {
                finalItems.splice(i, 1);
            }
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
      items, computedItems: finalItems, addItem, removeItem, updateQty, clearCart, chooseGift,
      subtotal, memberDiscount, memberDiscountPercent, total, count, user, pendingGifts: pendingGiftsList
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
