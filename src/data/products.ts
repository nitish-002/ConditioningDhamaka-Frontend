import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Ceiling Fan',
    description: 'High-performance ceiling fan with remote control',
    price: 299.99,
    category: 'fan',
    colors: ['white', 'brown', 'black'],
    sizes: ['48"', '52"', '56"'],
    image: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    name: 'Smart Split AC',
    description: '1.5 Ton Inverter Split AC with Wi-Fi',
    price: 899.99,
    category: 'ac',
    colors: ['white'],
    sizes: ['1 Ton', '1.5 Ton', '2 Ton'],
    image: 'https://images.unsplash.com/photo-1631083215283-b1e563随机字符?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    name: 'Portable Fan',
    description: 'Rechargeable portable fan with adjustable speed',
    price: 49.99,
    category: 'fan',
    colors: ['blue', 'white', 'pink'],
    sizes: ['8"', '12"', '16"'],
    image: 'https://images.unsplash.com/photo-1625007387168-c4648ba74bad?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    name: 'Window AC',
    description: 'Energy-efficient window AC unit',
    price: 499.99,
    category: 'ac',
    colors: ['white'],
    sizes: ['0.75 Ton', '1 Ton', '1.5 Ton'],
    image: 'https://images.unsplash.com/photo-1631083214044-c62519b9f240?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '5',
    name: 'Industrial Fan',
    description: 'Heavy-duty industrial fan for large spaces',
    price: 399.99,
    category: 'fan',
    colors: ['gray', 'black'],
    sizes: ['24"', '30"', '36"'],
    image: 'https://images.unsplash.com/photo-1625007387168-c4648ba74bad?auto=format&fit=crop&q=80&w=800'
  }
];