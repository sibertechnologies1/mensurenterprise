import React, { createContext, useContext, useState, useCallback } from "react";

// ─── Context ───────────────────────────────────────────────────────────────────

export const WishlistContext = createContext(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("wishlist");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const persist = (next) => {
    setItems(next);
    try { localStorage.setItem("wishlist", JSON.stringify(next)); } catch {}
  };

  const addItem = useCallback((product) => {
    setItems(prev => {
      if (prev.some(i => i.id === product.id)) return prev; // already saved
      const next = [...prev, product];
      try { localStorage.setItem("wishlist", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      try { localStorage.setItem("wishlist", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const toggleItem = useCallback((product) => {
    setItems(prev => {
      const exists = prev.some(i => i.id === product.id);
      const next   = exists ? prev.filter(i => i.id !== product.id) : [...prev, product];
      try { localStorage.setItem("wishlist", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearAll = useCallback(() => persist([]), []);

  const hasItem = useCallback((id) => items.some(i => i.id === id), [items]);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggleItem, clearAll, hasItem }}>
      {children}
    </WishlistContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}