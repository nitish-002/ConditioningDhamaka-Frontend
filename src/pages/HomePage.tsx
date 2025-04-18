import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Truck } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Product } from '../types';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const maxPrice = Math.max(...products.map(p => p.price));
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(maxPrice || 1000);
  const [showToast, setShowToast] = useState(false);
  const addToCart = useStore(state => state.addToCart);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/products');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      setProducts(data.data);
      setPriceRange(Math.max(...data.data.map((p: Product) => p.price)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesColor = selectedColors.length === 0 || 
                        product.colors.some(color => selectedColors.includes(color));
    const matchesSize = selectedSizes.length === 0 || 
                       product.sizes.some(size => selectedSizes.includes(size));
    const matchesPrice = product.price <= priceRange;
    
    return matchesSearch && matchesColor && matchesSize && matchesPrice;
  });

  const allColors = Array.from(new Set(products.flatMap(p => p.colors)));
  const allSizes = Array.from(new Set(products.flatMap(p => p.sizes)));

  const handleAddToCart = (product: Product) => {
    const cartProduct: Product = {
      _id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.title.toLowerCase().includes('fan') ? 'fan' : 'ac',
      colors: product.colors,
      sizes: product.sizes,
      image: product.image,
      available_quantity: product.available_quantity,
      createdAt: product.createdAt
    };
    addToCart(cartProduct, product.colors[0], product.sizes[0]);
    setShowToast(true);
  };

  if (loading) {
    return <div className="text-center py-12">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Summer Collection 2024</h1>
          <p className="text-xl opacity-90">Get up to 50% off on selected items</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className="hidden md:block w-64 bg-white p-4 rounded-lg shadow-sm h-fit border border-slate-200">
            <h3 className="font-semibold mb-4 text-slate-800">Filters</h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2 text-slate-700">Price Range</h4>
              <input 
                type="range" 
                className="w-full accent-indigo-600" 
                min="0" 
                max={maxPrice} 
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
              />
              <div className="flex justify-between text-sm text-slate-600">
                <span>$0</span>
                <span>${priceRange}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2 text-slate-700">Colors</h4>
              <div className="space-y-2">
                {allColors.map(color => (
                  <label key={color} className="flex items-center gap-2 text-slate-600 hover:text-slate-800">
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color)}
                      onChange={() => setSelectedColors(prev =>
                        prev.includes(color)
                          ? prev.filter(c => c !== color)
                          : [...prev, color]
                      )}
                      className="accent-indigo-600"
                    />
                    {color}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 text-slate-700">Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {allSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSizes(prev =>
                      prev.includes(size)
                        ? prev.filter(s => s !== size)
                        : [...prev, size]
                    )}
                    className={`w-8 h-8 rounded-full border ${
                      selectedSizes.includes(size)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div 
                  key={product._id} 
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-200"
                >
                  <img
                    src={product.image} // This now uses the image URL from the API
                    alt={product.title}
                    className="w-full h-48 object-contain p-4"
                  />
                  <div className="p-4">
                    <h2 className="font-medium mb-1 text-slate-800 hover:text-indigo-600">
                      {product.title}
                    </h2>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center text-amber-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 text-sm">4.5</span>
                      </div>
                      <span className="mx-2 text-slate-200">|</span>
                      <span className="text-sm text-slate-500">150 reviews</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-xl font-bold text-slate-800">${product.price}</span>
                      <span className="ml-2 text-sm text-slate-400 line-through">${(product.price * 1.2).toFixed(2)}</span>
                      <span className="ml-2 text-sm text-emerald-600">20% off</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500 mb-3">
                      <Truck className="h-4 w-4 mr-1" />
                      Free Delivery by Tomorrow
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation when clicking add to cart
                        handleAddToCart(product);
                      }}
                      className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showToast && (
        <Toast 
          message="Item added to cart successfully!" 
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}