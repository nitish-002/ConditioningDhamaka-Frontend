import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import BackButton from '../components/BackButton';

export default function CartPage() {
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartItemQuantity } = useStore();

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleRemoveItem = (productId: string) => {
    setItemToDelete(productId);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete);
      setItemToDelete(null);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="bg-gradient-to-r from-cyan-800 to-blue-900 text-white py-6 px-4">
          <div className="max-w-[1500px] mx-auto">
            <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
            <p className="text-lg opacity-90">Your cart is currently empty</p>
          </div>
        </div>

        <div className="max-w-[1500px] mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Start adding items to your cart</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-r from-cyan-800 to-blue-900 text-white py-8 px-6 w-full">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-3">Shopping Cart</h1>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <BackButton />
        <h1 className="text-2xl font-medium text-gray-900 mb-6">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg divide-y">
              {cart.map((item) => (
                <div
                  key={`${item.product._id}-${item.selectedColor}-${item.selectedSize}`}
                  className="p-4 flex"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-24 h-24 object-contain"
                  />
                  
                  <div className="flex-1 ml-4">
                    <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Color: {item.selectedColor}, Size: {item.selectedSize}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateCartItemQuantity(item.product._id, Math.max(0, item.quantity - 1))}
                          className="px-3 py-1 hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border-x">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItemQuantity(item.product._id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="space-y-4">
                <div className="flex justify-between text-base">
                  <span>Subtotal ({cart.length} items):</span>
                  <span className="font-medium">₹{total.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-medium"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {itemToDelete && (
        <DeleteConfirmDialog
          onConfirm={confirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
}