"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from "react";
import { CartItem, CartState, CartAction, Product } from "@/types";

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "INIT_CART":
      return { ...state, items: action.payload };
    case "ADD_ITEM": {
      const { product, quantity, size, color } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.size === size &&
          item.color === color
      );
      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + quantity,
        };
        return { ...state, items: updatedItems };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM": {
      const { id, size, color } = action.payload;
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(item.product.id === id && item.size === size && item.color === color)
        ),
      };
    }
    case "UPDATE_QUANTITY": {
      const { id, size, color, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) =>
              !(item.product.id === id && item.size === size && item.color === color)
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === id && item.size === size && item.color === color
            ? { ...item, quantity }
            : item
        ),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  const isInitialized = useRef(false);

  // 1. Load persisted cart items on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shajsutro_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: "INIT_CART", payload: parsed });
        }
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      isInitialized.current = true;
    }
  }, []);

  // 2. Persist cart items whenever state.items changes
  useEffect(() => {
    if (!isInitialized.current) return;
    try {
      if (state.items.length === 0) {
        localStorage.removeItem("shajsutro_cart");
      } else {
        localStorage.setItem("shajsutro_cart", JSON.stringify(state.items));
      }
    } catch {
      // Ignore localStorage write errors
    }
  }, [state.items]);

  const addItem = useCallback(
    (product: Product, size: string, color: string, quantity = 1) => {
      dispatch({ type: "ADD_ITEM", payload: { product, quantity, size, color } });
      dispatch({ type: "OPEN_CART" });
    },
    []
  );

  const removeItem = useCallback((id: string, size: string, color: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id, size, color } });
  }, []);

  const updateQuantity = useCallback(
    (id: string, size: string, color: string, quantity: number) => {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, size, color, quantity } });
    },
    []
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const openCart = useCallback(() => dispatch({ type: "OPEN_CART" }), []);
  const closeCart = useCallback(() => dispatch({ type: "CLOSE_CART" }), []);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
