export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  sizes: string[];
  colors: string[];
  available_quantity: number;
  createdAt: string;
  category?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: 'paid' | 'shipped' | 'delivered';
  totalAmount: number;
  customerInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  riderId?: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface User {
  createdAt: string | number | Date;
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'rider';
}

export interface customerInfo {
  name: string;
  address: string;
  phone: string;
}

export interface BackendOrder {
  _id: string;
  user_id: string;
  product_id: {
    _id: string;
    title: string;
    price: number;
    image: string;
  };
  quantity: number;
  selected_size: string;
  selected_color: string;
  status: 'paid' | 'assigned' | 'shipped' | 'delivered';
  assigned_rider?: string;
  shipping_details: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export interface BackendRider {
  _id: string;
  name: string;
  email: string;
  photo?: string;
}