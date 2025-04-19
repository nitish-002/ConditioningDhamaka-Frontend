import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BackendOrder } from '../types';
import BackButton from '../components/BackButton';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { currentUser } = useStore();
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchMyOrders();
    }
  }, [currentUser]);

  const fetchMyOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/orders/me', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      console.log('My orders:', data);
      setOrders(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  if (!currentUser) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-[1500px] mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600">You must be logged in to view your orders.</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-[1500px] mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">No orders yet</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-2 rounded-lg font-medium"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-r from-cyan-800 to-blue-900 text-white py-8 px-6 w-full">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-3">My Orders</h1>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <BackButton />
        <h1 className="text-2xl font-medium text-gray-900 mb-6">Your Orders</h1>
        
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">Order #{order._id}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    order.status === 'paid' ? 'bg-cyan-100 text-cyan-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Total: ₹{(order.product_id.price * order.quantity).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <img
                  src={order.product_id.image}
                  alt={order.product_id.title}
                  className="w-20 h-20 object-contain"
                />
                <div className="ml-4">
                  <p className="font-medium text-gray-900">{order.product_id.title}</p>
                  <p className="text-sm text-gray-600">
                    {order.quantity}x | Color: {order.selected_color} | Size: {order.selected_size}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}