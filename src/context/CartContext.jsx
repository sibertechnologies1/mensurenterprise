import { createContext, useState, useEffect } from "react";

// CartContext with helpers and persistence
export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cart");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
      // notify other parts of the app (admin inspector, etc.)
      try { window.dispatchEvent(new Event('cartUpdate')); } catch (e) {}
    } catch (e) {
      // ignore
    }
  }, [cart]);

  const addToCart = (item, qty = 1) => {
    setCart((prev) => {
      const normalized = { ...item };
      // ensure numeric price is stored as priceNum
      const parsed = parseFloat(String(item.price).replace(/[^0-9.-]+/g, ""));
      normalized.priceNum = Number.isFinite(parsed) ? parsed : 0;

      const found = prev.find((p) => p.id === normalized.id);
      if (found) {
        return prev.map((p) => (p.id === normalized.id ? { ...p, quantity: p.quantity + qty } : p));
      }
      return [...prev, { ...normalized, quantity: qty }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((p) => p.id !== id));

  const updateQuantity = (id, quantity) =>
    setCart((prev) => prev.map((p) => (p.id === id ? { ...p, quantity } : p)));

  const clearCart = () => setCart([]);

  const value = { cart, addToCart, removeFromCart, updateQuantity, clearCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
