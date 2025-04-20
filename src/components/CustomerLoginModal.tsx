import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Mail, Lock, ArrowRight, User } from 'lucide-react';
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';

interface CustomerLoginModalProps {
  onClose: () => void;
  onSwitchToStaff: () => void;
}

export default function CustomerLoginModal({ onClose, onSwitchToStaff }: CustomerLoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCurrentUser = useStore(state => state.setCurrentUser);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create provider instance
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      // Force account selection
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Try popup first
      try {
        const result = await signInWithPopup(auth, provider);
        
        if (!result?.user) {
          throw new Error('No user data returned');
        }

        // Continue with your existing MongoDB auth logic
        const registerResponse = await fetch('http://localhost:5000/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            name: result.user.displayName || 'Google User',
            email: result.user.email,
            password: 'password123', // Using standard password for all Firebase users
            role: 'customer'
          })
        });

        // If registration fails because user exists, try logging in
        if (!registerResponse.ok) {
          const loginResponse = await fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              email: result.user.email,
              password: 'password123' // Same standard password
            })
          });

          const loginData = await loginResponse.json();
          if (loginResponse.ok) {
            setCurrentUser({
              id: loginData.data.id,
              name: loginData.data.name,
              email: loginData.data.email,
              role: 'customer'
            });
            onClose();
            return;
          }
        } else {
          // Registration successful
          const regData = await registerResponse.json();
          setCurrentUser({
            id: regData.data.id,
            name: regData.data.name,
            email: regData.data.email,
            role: 'customer'
          });
          onClose();
          return;
        }

        throw new Error('Failed to authenticate');

      } catch (popupError: any) {
        console.error('Popup error:', popupError);
        
        // Try redirect as fallback
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code.includes('cross-origin-auth')) {
          
          await signInWithRedirect(auth, provider);
          const redirectResult = await getRedirectResult(auth);
          
          if (!redirectResult?.user) {
            throw new Error('No user data returned from redirect');
          }
        } else {
          throw popupError;
        }
      }
    } catch (err) {
      console.error('Google auth error:', err);
      setError(err instanceof Error ? err.message : 'Failed to open Google sign-in');
    } finally {
      setLoading(false);
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
                className="py-2 rounded-lg text-sm font-medium transition-all bg-white text-cyan-600 shadow"
              >
                Customer Login
              </button>
              <button
                onClick={onSwitchToStaff}
                className="py-2 rounded-lg text-sm font-medium transition-all text-slate-600 hover:text-slate-800"
              >
                Email Login
              </button>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mb-4 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-6 h-6"
            />
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or continue with email</span>
            </div>
          </div>

          {/* ... existing form code ... */}
        </div>
      </div>
    </div>
  );
}
