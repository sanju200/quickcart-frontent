import React, { createContext, useContext } from 'react';

export type Screen = 'HOME' | 'CATEGORY_PRODUCTS' | 'CATEGORIES' | 'ORDERS' | 'CART' | 'PROFILE' | 'PAYMENTS' | 'LOGIN' | 'SIGNUP' | 'NOT_FOUND';

interface NavigationContextType {
  currentScreen: Screen;
  categoryData: any;
  navigate: (screen: Screen, data?: any) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface CartContextType {
  cartItems: any[];
  cartCount: number;
  refreshCartCount: () => Promise<void>;
  resetCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCartCount = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCartCount must be used within CartProvider');
  return context;
};

export const useAppNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useAppNavigation must be used within NavigationProvider');
  return context;
};
