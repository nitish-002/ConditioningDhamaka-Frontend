import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BackendOrder } from '../types';

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
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Please Login</h2>
        <p className="text-gray-600 mt-2">You must be logged in to view your orders.</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">No orders yet</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">Order #{order._id}</h3>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    order.status === 'paid' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'delivered' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">
                  Total: ${(order.product_id.price * order.quantity).toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-2">Order Details</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <img
                    src={order.product_id.image} // This now uses the image URL from the API
                    alt={order.product_id.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="ml-4">
                    <p className="font-medium">{order.product_id.title}</p>
                    <p className="text-sm text-gray-600">
                      {order.quantity}x | Color: {order.selected_color} | Size: {order.selected_size}
                    </p>
                    <p className="text-sm font-medium">
                      ${(order.product_id.price * order.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}