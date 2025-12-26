"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface WishlistItem {
  productId: string;
  productName: string;
  price: number;
  image: string;
  addedAt?: string;
  originalPrice?: number;
  category?: string;
  brand?: string;
  stock?: number;
  priority?: number;
  notes?: string;
  onSale?: boolean;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  updateItem: (productId: string, updates: Partial<WishlistItem>) => void;
  getItem: (productId: string) => WishlistItem | undefined;
  totalItems: number;
  addAllToCart: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const WISHLIST_STORAGE_KEY = "brandbazaar_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === item.productId)) {
        return prev;
      }
      // If item doesn't have addedAt, set it
      const itemWithTimestamp = item.addedAt 
        ? item 
        : { ...item, addedAt: new Date().toISOString() };
      return [...prev, itemWithTimestamp];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.productId === productId);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const updateItem = (productId: string, updates: Partial<WishlistItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, ...updates } : item
      )
    );
  };

  const getItem = (productId: string) => {
    return items.find((item) => item.productId === productId);
  };

  const addAllToCart = () => {
    // This will be handled by the page component that has access to cart
  };

  const totalItems = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        clearWishlist,
        updateItem,
        getItem,
        totalItems,
        addAllToCart,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

