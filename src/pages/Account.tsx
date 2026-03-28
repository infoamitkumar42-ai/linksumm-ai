import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, CreditCard, Calendar, LogOut, Crown, AlertTriangle, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useFreemium } from '../hooks/useFreemium';
import { PaymentModal } from '../components/PaymentModal';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://linksumm-backend.onrender.com";

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const { quotaStatus, isLoading: quotaLoading, isPremium } = useFreemium();
  const [user, setUser] = useState<any>(null);
  const [subStatus, setSubStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    const fetchUserAndStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      setUser(session.user);

      try {
        // Check if returning from PayPal
        const urlParams = new URLSearchParams(window.location.search);
        const paypalSuccess = urlParams.get('paypal');
        const token = urlParams.get('token');
        
        if (paypalSuccess === 'success' && token) {
          setLoading(true);
          const execRes = await fetch(`${BACKEND_URL}/api/execute-paypal-subscription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token,
              user_id: session.user.id
            })
          });
          
          if (execRes.ok) {
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            alert('Subscription activated successfully!');
          }
        }

        const response = await fetch(`${BACKEND_URL}/api/subscription-status/${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setSubStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndStatus();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your premium subscription?')) return;
    
    setCanceling(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          subscription_id: subStatus.subscription_id // Assuming we have it, or backend handles it
        })
      });
      
      if (response.ok) {
        alert('Subscription cancelled successfully.');
        window.location.reload();
      } else {
        alert('Failed to cancel subscription.');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('An error occurred while canceling.');
    } finally {
      setCanceling(false);
    }
  };

  const handleDownloadInvoice = () => {
    const invoiceContent = `
INVOICE
-----------------------------
Date: ${new Date().toLocaleDateString()}
Customer: ${user?.email || 'Valued Customer'}
Plan: Premium Subscription
Amount: $4.99 / ₹99
Status: Paid
-----------------------------
Thank you for using LinkSumm AI!
    `.trim();
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading || quotaLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold">
                {user?.email?.charAt(0).toUpperCase() || <User />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.user_metadata?.full_name || 'My Account'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-indigo-500" />
              Subscription Details
            </h3>

            {isPremium ? (
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-900/50 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Crown className="w-6 h-6 text-amber-500" />
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">Premium Plan</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      You have unlimited access to all features and zero ads.
                    </p>
                    
                    {subStatus?.subscription_expires && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        Renews on: {new Date(subStatus.subscription_expires).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-amber-200/50 dark:border-amber-900/30 flex justify-between items-center">
                  <button 
                    onClick={handleDownloadInvoice}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 text-sm font-medium flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download Invoice
                  </button>
                  
                  {subStatus?.can_cancel && (
                    <button 
                      onClick={handleCancelSubscription}
                      disabled={canceling}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center disabled:opacity-50"
                    >
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {canceling ? 'Canceling...' : 'Cancel Subscription'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Free Plan</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {quotaStatus?.remaining !== undefined 
                        ? `You have ${quotaStatus.remaining} free summaries remaining today.`
                        : 'Ad-supported experience with limited daily summaries.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-md flex items-center"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Premium
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        onSuccess={() => {
          window.location.reload();
        }} 
      />
    </div>
  );
};
