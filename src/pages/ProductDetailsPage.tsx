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
      const response = await fetch(`http://localhost:5000/products/${id}`);
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <BackButton />
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square">
            <img 
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="flex items-center mb-6">
              <div className="flex items-center text-amber-400">
                <Star className="h-5 w-5 fill-current" />
                <span className="ml-1">4.5</span>
              </div>
              <span className="mx-2">|</span>
              <span>150 reviews</span>
            </div>

            <div className="text-3xl font-bold mb-6">
              ${product.price}
              <span className="ml-2 text-sm text-gray-500 line-through">
                ${(product.price * 1.2).toFixed(2)}
              </span>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Color</h3>
              <div className="flex gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded ${
                      selectedColor === color
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Size</h3>
              <div className="flex gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 rounded-full ${
                      selectedSize === size
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <Truck className="h-5 w-5" />
              <span>Free Delivery by Tomorrow</span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
              >
                Add to Cart
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Buy Now
              </button>
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
