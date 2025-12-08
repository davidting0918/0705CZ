// Product type definition
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

// Cart item extends Product with quantity
export interface CartItem extends Product {
  quantity: number;
}

// Carousel image type definition
export interface CarouselImage {
  id: number;
  url: string;
  alt: string;
}

// Auth context value type
export interface AuthContextValue {
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
}

// Cart context value type
export interface CartContextValue {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  openCart: () => void;
  closeCart: () => void;
}

// Delivery method type
export type DeliveryMethod = 'home' | 'convenience_store';

// Convenience store chain type
export type ConvenienceStoreChain = 'FAMI' | 'UNIMART';

// Store selection interface
export interface StoreSelection {
  CVSStoreID: string;
  CVSStoreName: string;
  CVSAddress: string;
  CVSTelephone?: string;
  CVSOpenTime?: string;
  LogisticsSubType: ConvenienceStoreChain;
}

// ECPay global type declaration
declare global {
  interface Window {
    ECPay?: {
      Logistics: {
        Map: (config: {
          MerchantID: string;
          LogisticsType: string;
          LogisticsSubType: string;
          IsCollection: string;
          ServerReplyURL: string;
          ExtraData?: string;
          Device?: number;
        }) => void;
      };
    };
  }
}

