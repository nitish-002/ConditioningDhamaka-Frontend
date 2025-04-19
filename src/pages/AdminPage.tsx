import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { BackendOrder, BackendRider } from '../types';

export default function AdminPage() {
  const { currentUser } = useStore();
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [riders, setRiders] = useState<BackendRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const RIDER_IDS = ['6802a6791b36d59f6fc56866', '6802a6841b36d59f6fc5686b'];

  useEffect(() => {
    fetchOrders();
    fetchRiders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/orders', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      console.log('Orders from backend:', data);
      setOrders(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    try {
      const response = await fetch('http://localhost:5000/users/riders', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch riders');
      }

      const data = await response.json();
      console.log('Riders from backend:', data);
      setRiders(data.data);
    } catch (err) {
      console.error('Error fetching riders:', err);
      // Don't set error state here to avoid blocking the entire page
    }
  };

  const getRandomAvailableRider = () => {
    // Filter out riders that are already delivering
    const availableRiderIds = RIDER_IDS.filter(riderId => 
      !orders.some(order => 
        order.assigned_rider === riderId && 
        order.status === 'shipped'
      )
    );

    if (availableRiderIds.length === 0) {
      return RIDER_IDS[Math.floor(Math.random() * RIDER_IDS.length)]; // Return random rider even if all are busy
    }

    // Get random rider from available riders
    const randomIndex = Math.floor(Math.random() * availableRiderIds.length);
    return availableRiderIds[randomIndex];
  };

  const assignToRider = async (orderId: string) => {
    try {
      const randomRiderId = getRandomAvailableRider();
      
      if (!randomRiderId) {
        alert('No riders available at the moment');
        return;
      }

      const response = await fetch(`http://localhost:5000/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          riderId: randomRiderId,
          status: 'shipped'  // Changed from 'out for delivery' to 'shipped'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to assign rider');
      }

      // Refresh orders and riders data
      await Promise.all([fetchOrders(), fetchRiders()]);

    } catch (err) {
      console.error('Error assigning rider:', err);
      alert(err instanceof Error ? err.message : 'Failed to assign rider');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-slate-800">Access Denied</h2>
        <p className="text-slate-600 mt-2">You must be logged in as an admin to view this page.</p>
      </div>
    );
  }

  // Sort orders to show paid orders first
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.status === 'paid' && b.status !== 'paid') return -1;
    if (a.status !== 'paid' && b.status === 'paid') return 1;
    return 0;
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4 mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-indigo-50 mt-2">Manage orders and track deliveries</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders Management Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold mb-6 text-slate-800">Orders Management</h2>
              
              {sortedOrders.length === 0 ? (
                <p className="text-slate-600">No orders found.</p>
              ) : (
                <div className="space-y-4">
                  {sortedOrders.map(order => (
                    <div key={order._id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-slate-800">Order #{order._id}</h3>
                            <span className={`text-sm px-3 py-1 rounded-full ${
                              order.status === 'paid' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-indigo-100 text-indigo-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-600">
                              <span className="text-slate-500">Product:</span> {order.product_id.title}
                            </p>
                            <p className="text-slate-600">
                              <span className="text-slate-500">Quantity:</span> {order.quantity}
                            </p>
                            <p className="text-slate-600">
                              <span className="text-slate-500">Size:</span> {order.selected_size}
                            </p>
                            <p className="text-slate-600">
                              <span className="text-slate-500">Color:</span> {order.selected_color}
                            </p>
                          </div>
                        </div>
                        {order.status === 'paid' && (
                          <button
                            onClick={() => assignToRider(order._id)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Assign Rider
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Riders Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold mb-6 text-slate-800">Assigned Riders</h2>
              
              {riders.map(rider => {
                const assignedOrder = orders.find(order => 
                  order.assigned_rider === rider._id && 
                  order.status === 'shipped'
                );

                return (
                  <div key={rider._id} className="border border-slate-200 rounded-lg p-4 mb-4 last:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold">
                        {rider.name.charAt(0)}
                      </span>
                      <div>
                        <h3 className="font-medium text-slate-800">{rider.name}</h3>
                        <p className="text-sm text-slate-500">{rider.email}</p>
                      </div>
                    </div>
                    {assignedOrder ? (
                      <div className="mt-3 text-sm">
                        <span className="text-slate-500">Assigned to Order:</span>
                        <span className="ml-2 text-indigo-600 font-medium">#{assignedOrder._id}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-emerald-600 mt-3">Available for delivery</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}