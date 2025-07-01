import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { Product } from '../types';
import Toast from '../components/Toast';
import { Star, Truck } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const addToCart = useStore(state => state.addToCart);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`hhttps://conditioningdhamakabackend.onrender.com/products/${id}`);
      const data = await response.json();
      setProduct(data.data);
      setSelectedColor(data.data.colors[0]);
      setSelectedSize(data.data.sizes[0]);
    } catch (err) {
      setError('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, selectedColor, selectedSize);
      setShowToast(true);
    }
  };

  const handleCheckout = () => {
    if (product) {
      addToCart(product, selectedColor, selectedSize);
      navigate('/checkout');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-r from-cyan-800 to-blue-900 text-white py-8 px-6 w-full">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-3">Product Details</h1>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <BackButton />
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-square bg-white p-4">
              <img 
                src={product.image}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-2xl font-medium text-gray-900 mb-2">{product.title}</h1>
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center">
                  <div className="flex items-center text-cyan-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">4.5</span>
                  </div>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-sm text-gray-600">150 reviews</span>
                </div>
              </div>

              <div className="py-4 border-b border-gray-200">
                <div className="flex items-baseline">
                  <span className="text-3xl font-medium text-gray-900">₹{product.price}</span>
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    ₹{(product.price * 1.2).toFixed(2)}
                  </span>
                  <span className="ml-2 text-sm text-green-600">20% off</span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <Truck className="h-4 w-4 mr-1 text-green-600" />
                  Free Delivery by Tomorrow
                </div>
              </div>

              {/* Color Selection */}
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
                <div className="flex gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-full border ${
                        selectedColor === color
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-300 hover:border-yellow-500'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
                <div className="flex gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full border ${
                        selectedSize === size
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-300 hover:border-yellow-500'
                      } flex items-center justify-center`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-medium"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium mt-3"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast 
          message="Added to cart successfully!"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
