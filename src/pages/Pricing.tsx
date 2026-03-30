import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown } from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';

export const Pricing: React.FC = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <div className="flex justify-center items-center gap-4">
            <span className={currency === 'INR' ? 'text-white' : 'text-gray-500'}>₹ INR</span>
            <button 
              onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
              className="w-12 h-6 bg-gray-700 rounded-full p-1 transition-all"
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${currency === 'USD' ? 'ml-6' : ''}`} />
            </button>
            <span className={currency === 'USD' ? 'text-white' : 'text-gray-500'}>$ USD</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col">
            <h2 className="text-2xl font-bold mb-2">Free Plan</h2>
            <p className="text-gray-400 mb-6">Perfect for trying out LinkSumm AI</p>
            <div className="text-4xl font-bold mb-8">₹0 <span className="text-lg text-gray-400">/ Free forever</span></div>
            <ul className="space-y-4 mb-8 flex-1">
              {['2 summaries per day', 'YouTube + Instagram + Facebook support', 'File upload', 'Share summaries'].map(feature => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-xl bg-gray-700 text-gray-300 font-medium cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white/5 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-8 flex flex-col relative">
            <div className="absolute -top-3 right-8 bg-blue-600 text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
            <h2 className="text-2xl font-bold mb-2">Premium Plan</h2>
            <p className="text-gray-400 mb-6">For power users who need more</p>
            <div className="text-4xl font-bold mb-8">{currency === 'INR' ? '₹99' : '$4.99'} <span className="text-lg text-gray-400">/ month</span></div>
            <ul className="space-y-4 mb-8 flex-1">
              {['Unlimited summaries', 'No ads', 'All platforms', 'Priority processing', 'Full history', 'Early access to new features'].map(feature => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all"
            >
              Coming Soon
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">Payment integration coming soon</p>
          </div>
        </div>
      </div>
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onSuccess={() => {}} />
    </div>
  );
};
