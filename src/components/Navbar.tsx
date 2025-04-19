import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import LoginModal from './LoginModal';
import LogoutConfirmDialog from './LogoutConfirmDialog';
import CustomerLoginModal from './CustomerLoginModal';

export default function Navbar() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCustomerLoginModal, setShowCustomerLoginModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { cart, currentUser, setCurrentUser, clearCart } = useStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      navigate('/admin');
    } else if (currentUser?.role === 'rider') {
      navigate('/rider');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    if (currentUser?.role === 'customer') {
      clearCart();
    }
    setCurrentUser(null);
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const handleLoginClick = () => {
    setShowCustomerLoginModal(true);
  };

  const handleSwitchToStaff = () => {
    setShowCustomerLoginModal(false);
    setShowLoginModal(true);
  };

  const handleSwitchToCustomer = () => {
    setShowLoginModal(false);
    setShowCustomerLoginModal(true);
  };
  
  return (
    <>
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                ConditioningDhamaka
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser?.role === 'customer' && (
                <Link to="/my-orders" className="text-gray-600 hover:text-gray-800">
                  My Orders
                </Link>
              )}
              {(!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'rider')) && (
                <Link to="/cart" className="relative">
                  <ShoppingCart className="h-6 w-6 text-gray-600" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cart.length}
                    </span>
                  )}
                </Link>
              )}
              
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to={currentUser.role === 'admin' ? '/admin' : currentUser.role === 'rider' ? '/rider' : '/'}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                >
                  <User className="h-6 w-6" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {showCustomerLoginModal && (
          <CustomerLoginModal 
            onClose={() => setShowCustomerLoginModal(false)}
            onSwitchToStaff={handleSwitchToStaff}
          />
        )}
        
        {showLoginModal && (
          <LoginModal 
            onClose={() => setShowLoginModal(false)} 
            onSwitchToCustomer={handleSwitchToCustomer}
          />
        )}
      </nav>
      {showLogoutConfirm && (
        <LogoutConfirmDialog
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}