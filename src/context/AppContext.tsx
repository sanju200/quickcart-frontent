import React, { createContext, useContext } from 'react';

export type Screen = 'HOME' | 'CATEGORY_PRODUCTS' | 'FILTERED_PRODUCTS' | 'CATEGORIES' | 'ORDERS' | 'CART' | 'PROFILE' | 'EDIT_PROFILE' | 'SAVED_ADDRESSES' | 'CONTACT_DETAILS' | 'PAYMENTS' | 'LOGIN' | 'SIGNUP' | 'NOT_FOUND' | 'PREVIOUSLY_ORDERED' | 'HELP_AND_SUPPORT' | 'TRACK_ORDER' | 'INVENTORY_MANAGER' | 'LOGISTICS_PARTNER' | 'DELIVERY_PARTNER' | 'ADD_PRODUCT' | 'CATEGORY_MANAGER' | 'OFFER_MANAGER' | 'LOW_STOCK_DASHBOARD' | 'LIVE_DELIVERY_MAP' | 'PARTNER_ONBOARDING' | 'COMMISSION_MANAGER' | 'EXECUTIVE_DASHBOARD' | 'FEEDBACK_CENTER' | 'DELIVERY_ANALYTICS' | 'OPERATIONAL_CONTROL' | 'ADMIN_DASHBOARD' | 'USER_MANAGER' | 'SALES_MANAGER';

interface NavigationContextType {
  currentScreen: Screen;
  categoryData: any;
  userRole: string | null;
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
