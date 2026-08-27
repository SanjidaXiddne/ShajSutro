"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type FavoritesContextType = {
  favorites: Set<string>;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => boolean; // returns next state
  clearFavorites: () => void;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = "favorites_product_ids";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const ids = JSON.parse(raw) as string[];
      if (Array.isArray(ids)) setFavorites(new Set(ids));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: Set<string>) => {
    setFavorites(new Set(next));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favorites.has(productId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (productId: string) => {
      const next = new Set(favorites);
      if (next.has(productId)) {
        next.delete(productId);
        persist(next);
        return false;
      }
      next.add(productId);
      persist(next);
      return true;
    },
    [favorites, persist],
  );

  const clearFavorites = useCallback(() => {
    persist(new Set());
  }, [persist]);

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, clearFavorites }),
    [favorites, isFavorite, toggleFavorite, clearFavorites],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}

