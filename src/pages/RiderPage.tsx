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
      const response = await fetch('http://localhost:5000/orders/assigned', {
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
      const response = await fetch(`http://localhost:5000/orders/${orderId}/status`, {
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
        <h2 className="text-2xl font-semibold text-slate-800">Access Denied</h2>
        <p className="text-slate-600 mt-2">You must be logged in as a rider to view this page.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Rider Dashboard</h1>
          <p className="text-indigo-50 mt-2">Manage your deliveries</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">Assigned Orders</h2>
          
          {orders.length === 0 ? (
            <p className="text-slate-600">No orders assigned to you yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-slate-800">Order #{order._id}</h3>
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          order.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="space-y-2 text-slate-600">
                        <p><span className="text-slate-500">Product:</span> {order.product_id.title}</p>
                        <p><span className="text-slate-500">Quantity:</span> {order.quantity}</p>
                        <p><span className="text-slate-500">Size:</span> {order.selected_size}</p>
                        <p><span className="text-slate-500">Color:</span> {order.selected_color}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {order.status !== 'delivered' && (
                        <button
                          onClick={() => updateOrderStatus(order._id)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Mark as Delivered
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
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
          <div className="bg-white rounded-lg w-[70%] max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-slate-800">
                Order Details #{selectedOrder._id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  selectedOrder.status === 'paid' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>

              {/* Product Details */}
              <div className="flex items-start gap-4 bg-slate-50 p-4 rounded-lg">
                <Package className="h-5 w-5 text-slate-400" />
                <div>
                  <h4 className="font-medium text-slate-800">Product Details</h4>
                  <div className="mt-2 space-y-1 text-sm text-slate-600">
                    <p>Name: {selectedOrder.product_id.title}</p>
                    <p>Price: ${selectedOrder.product_id.price}</p>
                    <p>Quantity: {selectedOrder.quantity}</p>
                    <p>Size: {selectedOrder.selected_size}</p>
                    <p>Color: {selectedOrder.selected_color}</p>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shipping Details */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <h4 className="font-medium text-slate-800">Shipping Details</h4>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>Name: {selectedOrder.shipping_details.name}</p>
                    <p>Email: {selectedOrder.shipping_details.email}</p>
                    <p>Phone: {selectedOrder.shipping_details.phone}</p>
                    <p>Address: {selectedOrder.shipping_details.address}</p>
                    <p>Order Date: {new Date(selectedOrder._id.substring(0, 8)).toLocaleDateString()}</p>
                    <p>Status: {selectedOrder.status}</p>
                  </div>
                </div>

                {/* Order Value */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-5 w-5 text-slate-400" />
                    <h4 className="font-medium text-slate-800">Order Value</h4>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>Total: ${(selectedOrder.product_id.price * selectedOrder.quantity).toFixed(2)}</p>
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