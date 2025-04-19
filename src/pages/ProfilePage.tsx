import React, { useState, useEffect } from 'react';
import { User } from '../types';
import BackButton from '../components/BackButton';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/users/me', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }
      
      setUser(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!user) return <div className="text-center py-12">User not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <BackButton />
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-gray-600">Name</div>
            <div>{user.name}</div>
            
            <div className="text-gray-600">Email</div>
            <div>{user.email}</div>
            
            <div className="text-gray-600">Role</div>
            <div className="capitalize">{user.role}</div>
            
            <div className="text-gray-600">Member Since</div>
            <div>{new Date(user.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
