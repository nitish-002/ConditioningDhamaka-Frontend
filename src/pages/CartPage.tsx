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
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div>
      <BackButton />
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {cart.map((item) => (
          <div
            key={`${item.product._id}-${item.selectedColor}-${item.selectedSize}`}
            className="flex items-center py-4 border-b last:border-b-0"
          >
            <img
              src={item.product.image} // This now uses the image URL from the API
              alt={item.product.title}
              className="w-24 h-24 object-cover rounded"
            />
            
            <div className="flex-1 ml-6">
              <h3 className="text-lg font-semibold">{item.product.title}</h3>
              <p className="text-gray-600">
                Color: {item.selectedColor}, Size: {item.selectedSize}
              </p>
              <div className="flex items-center mt-2">
                <button
                  onClick={() => updateCartItemQuantity(item.product._id, Math.max(0, item.quantity - 1))}
                  className="px-2 py-1 border rounded"
                >
                  -
                </button>
                <span className="mx-4">{item.quantity}</span>
                <button
                  onClick={() => updateCartItemQuantity(item.product._id, item.quantity + 1)}
                  className="px-2 py-1 border rounded"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="text-right ml-6">
              <p className="text-lg font-semibold">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => handleRemoveItem(item.product._id)}
                className="text-red-500 hover:text-red-700 mt-2"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
        
        <div className="mt-8 border-t pt-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-semibold">Total:</span>
            <span className="text-2xl font-bold">${total.toFixed(2)}</span>
          </div>
          
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Proceed to Checkout
          </button>
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