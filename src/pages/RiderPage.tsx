import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { BackendOrder } from '../types';
import { X, Package, User, MapPin, Phone } from 'lucide-react';

export default function RiderPage() {
  const { currentUser } = useStore();
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      const response = await fetch('https://conditioningdhamakabackend.onrender.com/orders/assigned', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      console.log('Assigned orders:', data);
      setOrders(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string) => {
    try {
      const response = await fetch(`https://conditioningdhamakabackend.onrender.com/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'delivered' })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders after status update
      fetchAssignedOrders();
    } catch (err) {
      console.error('Error updating order:', err);
      alert(err instanceof Error ? err.message : 'Failed to update order');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  if (!currentUser || currentUser.role !== 'rider') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-medium text-gray-900">Access Denied</h2>
        <p className="text-gray-600">You must be logged in as a rider to view this page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-800 to-blue-900 text-white py-8 px-6 w-full">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-3 truncate">Rider Dashboard</h1>
          <p className="text-xl opacity-90">Manage your deliveries</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-medium text-gray-900 mb-6">Assigned Orders</h2>
          
          {orders.length === 0 ? (
            <p className="text-gray-600">No orders assigned to you yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Order ID and Status */}
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">Order #{order._id}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${
                          order.status === 'assigned' ? 'bg-cyan-100 text-cyan-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>

                      {/* Product Details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 whitespace-nowrap text-sm">Product:</span>
                          <span className="text-gray-900 truncate text-sm">{order.product_id.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 whitespace-nowrap text-sm">Quantity:</span>
                          <span className="text-gray-900 text-sm">{order.quantity}</span>
                        </div>
                      </div>

                      {/* Size and Color */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 whitespace-nowrap text-sm">Size:</span>
                          <span className="text-gray-900 text-sm">{order.selected_size}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 whitespace-nowrap text-sm">Color:</span>
                          <span className="text-gray-900 text-sm">{order.selected_color}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 min-w-[200px]">
                      {order.status !== 'delivered' && (
                        <button
                          onClick={() => updateOrderStatus(order._id)}
                          className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium text-sm"
                        >
                          Mark as Delivered
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-medium text-gray-900 truncate pr-4">
                Order Details #{selectedOrder._id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Product Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 whitespace-nowrap">Name:</span>
                      <span className="text-gray-900 break-words">{selectedOrder.product_id.title}</span>
                    </div>
                    <p className="flex items-start gap-2">
                      <span className="text-gray-500 whitespace-nowrap">Price:</span>
                      <span className="text-gray-900">₹{selectedOrder.product_id.price}</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-gray-500 whitespace-nowrap">Quantity:</span>
                      <span className="text-gray-900">{selectedOrder.quantity}</span>
                    </p>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Shipping Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 whitespace-nowrap">Name:</span>
                      <span className="text-gray-900 break-words">{selectedOrder.shipping_details.name}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 whitespace-nowrap">Address:</span>
                      <span className="text-gray-900 break-words">{selectedOrder.shipping_details.address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 whitespace-nowrap">Phone:</span>
                      <span className="text-gray-900">{selectedOrder.shipping_details.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}