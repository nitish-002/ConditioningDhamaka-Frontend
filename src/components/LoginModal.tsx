import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Mail, Lock, ArrowRight, User } from 'lucide-react';
import { registerWithMongoDB } from '../services/auth';
import { apiConfig, apiCall } from '../config/api';

interface LoginModalProps {
  onClose: () => void;
  onSwitchToCustomer?: () => void;  // Add this prop
}

export default function LoginModal({ onClose, onSwitchToCustomer }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isStaffLogin, setIsStaffLogin] = useState(false);
  const [role, setRole] = useState<'admin' | 'rider'>('admin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCurrentUser = useStore(state => state.setCurrentUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isLogin) {
        // Registration logic
        if (password !== confirmPassword) {
          throw new Error("Passwords don't match");
        }

        const response = await registerWithMongoDB({
          name,
          email,
          password,
          role: isStaffLogin ? role : 'customer'
        });

        setCurrentUser({
          id: response.data.id || response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role,
          createdAt: response.data.createdAt || new Date().toISOString()
        });
      } else {
        // Staff credentials validation
        if (isStaffLogin) {
          if (role === 'admin' && email !== 'admin@example.com') {
            throw new Error('Admin login must use admin@example.com');
          }
          if (role === 'rider' && !email.startsWith('rider')) {
            throw new Error('Rider login must use rider1@example.com or rider2@example.com');
          }
        }

        const data = await apiCall(apiConfig.endpoints.login, {
          method: 'POST',
          body: JSON.stringify({ 
            email, 
            password,
            role: isStaffLogin ? role : 'customer' // Add role to login request
          })
        });

        console.log('Login response:', data);

        // Check if login was successful based on response data
        if (!data.success || !data.data) {
          throw new Error(data.message || 'Login failed');
        }

        // Verify the user role matches
        if (isStaffLogin && data.data.role !== role) {
          throw new Error(`This email is not registered as ${role}`);
        }

        if (!isStaffLogin && (data.data.role === 'admin' || data.data.role === 'rider')) {
          throw new Error('Please use staff login for admin/rider accounts');
        }

        setCurrentUser({
          id: data.data.id || data.data._id,
          name: data.data.name,
          email: data.data.email,
          role: data.data.role,
          createdAt: data.data.createdAt || new Date().toISOString()
        });

        console.log('Login successful:', data.data);
        onClose();
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Authentication failed';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Provide helpful hints for common issues
        if (errorMessage.includes('Invalid credentials')) {
          if (isStaffLogin) {
            errorMessage += '. Note: Staff accounts may need to be pre-registered by an administrator.';
          } else {
            errorMessage += '. For testing, you can register a new customer account.';
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirect = () => {
    if (onSwitchToCustomer) {
      onSwitchToCustomer();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-cyan-100 mt-1">
                {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
              </p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Login Type Selector */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setIsStaffLogin(false)}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${
                  !isStaffLogin
                    ? 'bg-white text-cyan-600 shadow'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Customer Login
              </button>
              <button
                onClick={() => setIsStaffLogin(true)}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${
                  isStaffLogin
                    ? 'bg-white text-cyan-600 shadow'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Staff Login
              </button>
            </div>
          </div>

          {/* Staff Role Selector - Only show for staff login */}
          {isStaffLogin && (
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
                {(['admin', 'rider'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      role === r
                        ? 'bg-white text-cyan-600 shadow'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 flex items-center justify-center gap-2 font-medium ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>

            {/* Only show account toggle for non-staff login */}
            {!isStaffLogin && (
              <div className="text-center text-sm text-slate-600 space-y-2">
                <p>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
                <p className="text-gray-500">or</p>
                <button
                  type="button"
                  onClick={handleGoogleRedirect}
                  className="text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  Sign in with Google
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}