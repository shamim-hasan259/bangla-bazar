export interface AllProductProps {
  products: any[];
}

export interface Product {
  id: string;
  name: string;
  photo?: string | string[];
  price: number;
  mrp: number;
  sellerId?: string;
  seller?: {
    id?: string;
    email?: string;
    phone?: string;
    name?: string;
    [key: string]: any;
  };
  store?: {
    id?: string;
    sellerId?: string;
    email?: string;
    phone?: string;
    name?: string;
    [key: string]: any;
  };
  rating?: number | string;
  reviews?: number | string;
  [key: string]: any;
}

export interface ProductProps {
  product: Product;
}

export interface CartProductTypes {
  id: string;
  mrp: number;
  name: string;
  photo: string;
  price: number;
  productId: string;
  quantity: number;
  total: number;
}

export interface CartProducts {
  map(
    arg0: (product: CartProductTypes) => import("react").JSX.Element
  ): import("react").ReactNode;
  product: CartProductTypes;
}

export interface SubtotalProps {
  totalPrice: number;
  totalQuantity: number;
  className?: string;
}
export interface ShoppingCartProps extends SubtotalProps {
  cartProducts: CartProducts;
}

export interface ProductCategory {
  id: string;
  name: string;
  photo?: string;
  code?: string;
  parentId?: string | null;
  subcategories?: ProductCategory[];
  _count?: {
    products: number;
    subcategories?: number;
  };
}

export interface Suggestions {
  id: string;
  name: string;
}
