import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { detectUserCountry, loadRazorpayScript } from '../lib/payment';
import { supabase } from '../lib/supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://linksumm-backend.onrender.com";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<string>('US');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  useEffect(() => {
    if (isOpen) {
      detectUserCountry().then(setCountry);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    setStatus('processing');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please login to continue');
      }

      if (country === 'IN') {
        // Razorpay Flow
        const res = await loadRazorpayScript();
        if (!res) {
          throw new Error('Razorpay SDK failed to load. Are you online?');
        }

        const response = await fetch(`${BACKEND_URL}/api/create-razorpay-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: session.user.id,
            user_email: session.user.email
          })
        });

        if (!response.ok) throw new Error('Failed to create subscription');
        const data = await response.json();

        const options = {
          key: data.key_id,
          subscription_id: data.subscription_id,
          name: 'LinkSumm AI',
          description: 'Premium Subscription',
          handler: function (response: any) {
            setStatus('success');
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 2000);
          },
          prefill: {
            email: session.user.email,
          },
          theme: {
            color: '#f59e0b'
          }
        };

        // @ts-ignore
        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response: any) {
          setError(response.error.description);
          setStatus('failed');
        });
        paymentObject.open();
      } else {
        // PayPal Flow
        const response = await fetch(`${BACKEND_URL}/api/create-paypal-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: session.user.id,
            user_email: session.user.email,
            return_url: `${window.location.origin}/account?paypal=success`,
            cancel_url: `${window.location.origin}/pricing?paypal=cancel`
          })
        });

        if (!response.ok) throw new Error('Failed to create PayPal subscription');
        const data = await response.json();
        
        // Redirect to PayPal approval URL
        window.location.href = data.approval_url;
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Complete Payment
            </h2>
            
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              {country === 'IN' ? '₹99/month via Razorpay' : '$4.99/month via PayPal'}
            </p>

            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-4 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-12 h-12 mb-2" />
                <p className="font-medium">Payment Successful!</p>
              </div>
            ) : status === 'failed' ? (
              <div className="flex flex-col items-center justify-center py-4 text-red-600 dark:text-red-400">
                <AlertCircle className="w-12 h-12 mb-2" />
                <p className="font-medium">{error}</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-sm underline hover:text-red-700"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay {country === 'IN' ? '₹99' : '$4.99'}
                  </>
                )}
              </button>
            )}
            
            <p className="text-xs text-center text-gray-500 mt-4">
              Secure payment processing. Cancel anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
