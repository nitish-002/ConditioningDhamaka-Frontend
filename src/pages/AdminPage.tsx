import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { BackendOrder, BackendRider } from '../types';

export default function AdminPage() {
  const { currentUser } = useStore();
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [riders, setRiders] = useState<BackendRider[]>([]);
  const [riderIds, setRiderIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchRiders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('hhttps://conditioningdhamakabackend.onrender.com/orders', {
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
      const response = await fetch('hhttps://conditioningdhamakabackend.onrender.com/users/riders', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch riders');
      }

      const data = await response.json();
      console.log('Riders from backend:', data);
      setRiders(data.data);
      // Extract and store only rider IDs
      setRiderIds(data.data.map((rider: BackendRider) => rider._id));
    } catch (err) {
      console.error('Error fetching riders:', err);
    }
  };

  const getRandomAvailableRider = () => {
    // Use riderIds state instead of RIDER_IDS constant
    const availableRiderIds = riderIds.filter(riderId => 
      !orders.some(order => 
        order.assigned_rider === riderId && 
        order.status === 'shipped'
      )
    );

    if (availableRiderIds.length === 0) {
      return riderIds[Math.floor(Math.random() * riderIds.length)];
    }

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

      const response = await fetch(`hhttps://conditioningdhamakabackend.onrender.com/orders/${orderId}/assign`, {
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

  if (loading) return <div className="text-center py-12">Loading orders...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-medium text-gray-900">Access Denied</h2>
        <p className="text-gray-600">You must be logged in as an admin to view this page.</p>
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
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-800 to-blue-900 text-white py-8 px-6 w-full">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-3">Admin Dashboard</h1>
          <p className="text-xl opacity-90">Manage orders and track deliveries</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Orders Section */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Orders Management</h2>
              
              <div className="space-y-4">
                {sortedOrders.map(order => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-medium text-gray-900">Order #{order._id}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'paid' ? 'bg-cyan-100 text-cyan-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
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
                          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          Assign Rider
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Riders Section */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Available Riders</h2>
              <div className="space-y-4">
                {riders.map(rider => {
                  const assignedOrder = orders.find(order => 
                    order.assigned_rider === rider._id && 
                    order.status === 'shipped'
                  );

                  return (
                    <div key={rider._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center font-semibold">
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
                          <span className="ml-2 text-cyan-600 font-medium">#{assignedOrder._id}</span>
                        </div>
                      ) : (
                        <p className="text-sm text-emerald-600 mt-3">Rider Online</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}