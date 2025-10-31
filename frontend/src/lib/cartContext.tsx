"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./authContext";
import { getCartItemsApi, setCartItemsApi } from "./cart.service";

export interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [initiated, setInitiated] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  const prevUserRef = useRef<typeof user>(null);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      const parsed = JSON.parse(stored);
      const validItems = parsed.filter(
        (item: CartItem) => item.id && item.title && item.price && item.image,
      );
      setItems(validItems);
    }
  }, []);

  useEffect(() => {
    if (user) {
      getCartItemsApi()
        .then((apiItems) => {
          setItems(apiItems);
          setInitiated(true);
        })
        .catch((err) => {
          console.error("Failed to fetch cart items from API:", err);
          if (retryCount < 3) {
            setRetryCount((prev) => prev + 1);
            return;
          } else {
            setInitiated(true);
          }
        });
    }
    setInitiated(true);
  }, [user, retryCount]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
    let timeoutId: NodeJS.Timeout | undefined;
    if (initiated && user) {
      timeoutId = setTimeout(() => {
        setCartItemsApi(items).catch((err) => {
          console.error("Failed to update cart items to API:", err);
        });
      }, 2000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [items, user, initiated]);

  useEffect(() => {
    if (initiated && user === null && prevUserRef.current !== null) {
      clearCart();
      localStorage.removeItem("cart");
    }
    prevUserRef.current = user;
  }, [user, initiated]);

  const addItem = (
    product: Omit<CartItem, "quantity">,
    quantity: number = 1,
  ) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
