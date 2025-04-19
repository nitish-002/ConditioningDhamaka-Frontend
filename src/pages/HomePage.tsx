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
    <div className="bg-white min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-cyan-800 to-blue-900 text-white py-6 px-4">
        <div className="max-w-[1500px] mx-auto">
          <h1 className="text-3xl font-bold mb-2">Welcome to ConditioningDhamaka</h1>
          <p className="text-lg opacity-90">Feel the Breeze of Amazing Deals</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <div className="flex gap-4">
          {/* Filters Sidebar */}
          <div className="w-64 shrink-0">
            <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
              <h3 className="text-lg font-medium mb-4 text-gray-900">Filters</h3>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2 text-gray-700">Price</h4>
                <input 
                  type="range" 
                  className="w-full accent-cyan-500" 
                  min="0" 
                  max={maxPrice} 
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>₹0</span>
                  <span>₹{priceRange}</span>
                </div>
              </div>

              {/* Colors */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2 text-gray-700">Colors</h4>
                <div className="space-y-2">
                  {allColors.map(color => (
                    <label key={color} className="flex items-center gap-2 text-gray-600 hover:text-cyan-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color)}
                        onChange={() => setSelectedColors(prev =>
                          prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                        )}
                        className="accent-cyan-500"
                      />
                      {color}
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-gray-700">Sizes</h4>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSizes(prev =>
                        prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                      )}
                      className={`px-3 py-1 rounded border ${
                        selectedSizes.includes(size)
                          ? 'bg-cyan-600 text-white border-cyan-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-cyan-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>

            {/* Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div 
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow group"
                >
                  <div className="relative pb-[100%]">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="absolute inset-0 w-full h-full object-contain p-4"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="font-medium text-gray-900 group-hover:text-cyan-600 line-clamp-2">
                      {product.title}
                    </h2>
                    <div className="flex items-center mt-2 mb-1">
                      <div className="flex items-center text-cyan-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 text-sm text-gray-600">4.5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                        <span className="ml-2 text-sm text-gray-500 line-through">₹{(product.price * 1.2).toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg font-medium transition-colors"
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