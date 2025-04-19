import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import CustomerLoginModal from '../components/CustomerLoginModal';

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
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">No items to checkout</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {cart.map((item) => (
          <div
            key={`${item.product._id}-${item.selectedColor}-${item.selectedSize}`}
            className="flex justify-between py-2"
          >
            <span>
              {item.product.title} x {item.quantity}
              <span className="text-gray-600 text-sm">
                ({item.selectedColor}, {item.selectedSize})
              </span>
            </span>
            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t mt-4 pt-4">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}
        
        <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
        
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
              className="w-full px-3 py-2 border rounded"
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
              className="w-full px-3 py-2 border rounded"
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
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        {/* Add Payment Information Section */}
        <div className="border-t mt-8 pt-8">
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
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
                className="w-full px-3 py-2 border rounded font-mono"
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
                  className="w-full px-3 py-2 border rounded font-mono"
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
                  className="w-full px-3 py-2 border rounded font-mono"
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
                className="w-full px-3 py-2 border rounded font-mono"
              />
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="border-t mt-8 pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mt-6 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>

      {showCustomerLoginModal && (
        <CustomerLoginModal 
          onClose={() => setShowCustomerLoginModal(false)}
          onSwitchToStaff={() => {}} // Empty function since we don't need staff login here
        />
      )}
    </div>
  );
}