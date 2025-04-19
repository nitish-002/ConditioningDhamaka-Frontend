import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import CustomerLoginModal from '../components/CustomerLoginModal';
import BackButton from '../components/BackButton';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, currentUser, placeOrder } = useStore();
  const [showCustomerLoginModal, setShowCustomerLoginModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const createOrder = async (item: any) => {
    try {
      // Log the data being sent
      console.log('Customer Info:', customerInfo);
      
      const requestBody = {
        product_id: item.product._id,
        quantity: item.quantity,
        selected_size: item.selectedSize,
        selected_color: item.selectedColor,
        shipping_details: {
          name: customerInfo.name,
          address: customerInfo.address,
          phone: customerInfo.phone,
          email: customerInfo.email || currentUser?.email
        }
      };
      
      console.log('Sending order data:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('http://localhost:5000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Order creation response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      return data;
    } catch (err) {
      console.error('Order creation error:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setShowCustomerLoginModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check authentication status first
      const authCheck = await fetch('http://localhost:5000/auth/me', {
        credentials: 'include'
      });
      const authData = await authCheck.json();
      
      if (!authData.authenticated) {
        setShowCustomerLoginModal(true);
        throw new Error('Please log in again');
      }

      // Create orders for each cart item
      await Promise.all(cart.map(item => createOrder(item)));
      
      // Clear cart and redirect
      placeOrder(customerInfo);
      navigate('/my-orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-6 py-12 text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">No items to checkout</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-2 rounded-lg font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-800 to-blue-900 text-white py-8 px-6 w-full">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-3">Checkout</h1>
          <p className="text-xl opacity-90">Complete your purchase</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-medium text-gray-900 mb-6">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Address
                    </label>
                    <textarea
                      required
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-medium text-gray-900 mb-6">Payment Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      value={paymentDetails.cardNumber}
                      onChange={(e) => {
                        const formatted = e.target.value
                          .replace(/\s/g, '')
                          .match(/.{1,4}/g)?.join(' ') || '';
                        setPaymentDetails({
                          ...paymentDetails,
                          cardNumber: formatted
                        });
                      }}
                      className="w-full px-3 py-2 border rounded font-mono focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={paymentDetails.expiryDate}
                        onChange={(e) => {
                          const formatted = e.target.value
                            .replace(/\D/g, '')
                            .match(/(\d{0,2})(\d{0,2})/);
                          if (formatted) {
                            setPaymentDetails({
                              ...paymentDetails,
                              expiryDate: formatted[2] 
                                ? `${formatted[1]}/${formatted[2]}`
                                : formatted[1]
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border rounded font-mono focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        maxLength={3}
                        placeholder="123"
                        value={paymentDetails.cvv}
                        onChange={(e) => setPaymentDetails({
                          ...paymentDetails,
                          cvv: e.target.value.replace(/\D/g, '')
                        })}
                        className="w-full px-3 py-2 border rounded font-mono focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Card Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="JOHN DOE"
                      value={paymentDetails.cardName}
                      onChange={(e) => setPaymentDetails({
                        ...paymentDetails,
                        cardName: e.target.value.toUpperCase()
                      })}
                      className="w-full px-3 py-2 border rounded font-mono focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Order Summary</h2>
              <div className="divide-y">
                {cart.map((item) => (
                  <div
                    key={`${item.product._id}-${item.selectedColor}-${item.selectedSize}`}
                    className="py-3"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.product.title}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity}x | {item.selectedColor}, {item.selectedSize}
                        </p>
                      </div>
                      <span className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-medium text-gray-900 pt-2">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-medium"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCustomerLoginModal && (
        <CustomerLoginModal 
          onClose={() => setShowCustomerLoginModal(false)}
          onSwitchToStaff={() => {}}
        />
      )}
    </div>
  );
}