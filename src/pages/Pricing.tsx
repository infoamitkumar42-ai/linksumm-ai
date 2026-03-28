import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Crown, Zap, Shield, HelpCircle } from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';

export const Pricing: React.FC = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('paypal') === 'cancel') {
      alert('PayPal subscription was cancelled.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for trying out LinkSumm AI',
      features: [
        { name: '2 summaries per day', included: true },
        { name: 'All platforms supported', included: true },
        { name: 'Save history', included: true },
        { name: 'Share summaries publicly', included: true },
        { name: 'Ad-supported experience', included: true },
        { name: 'Unlimited summaries', included: false },
        { name: 'Zero ads', included: false },
        { name: 'Faster processing priority', included: false },
        { name: 'Priority email support', included: false },
      ],
      cta: 'Current Plan',
      highlighted: false,
    },
    {
      name: 'Premium',
      price: '$4.99',
      priceInr: '₹99',
      period: '/month',
      description: 'For power users who need more',
      features: [
        { name: 'Unlimited summaries', included: true },
        { name: 'Zero ads', included: true },
        { name: 'Faster processing priority', included: true },
        { name: 'Priority email support', included: true },
        { name: 'Save history', included: true },
        { name: 'Share summaries publicly', included: true },
        { name: 'All platforms supported', included: true },
        { name: 'Download summary as PDF (soon)', included: true },
      ],
      cta: 'Upgrade Now',
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl"
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-xl text-gray-500 dark:text-gray-400"
          >
            Choose the plan that best fits your needs. Upgrade anytime to unlock unlimited AI summaries.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={`rounded-3xl shadow-xl overflow-hidden ${
                plan.highlighted 
                  ? 'bg-gradient-to-b from-amber-500 to-orange-600 text-white transform md:-translate-y-4' 
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="p-8 sm:p-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold" id={`tier-${plan.name.toLowerCase()}`}>
                    {plan.name}
                  </h3>
                  {plan.highlighted && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white">
                      <Crown className="w-4 h-4 mr-1" />
                      Most Popular
                    </span>
                  )}
                </div>
                
                <p className={`mt-4 text-sm ${plan.highlighted ? 'text-amber-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {plan.description}
                </p>
                
                <div className="mt-8 flex items-baseline text-5xl font-extrabold">
                  {plan.price}
                  {plan.period && <span className={`ml-1 text-xl font-medium ${plan.highlighted ? 'text-amber-100' : 'text-gray-500 dark:text-gray-400'}`}>{plan.period}</span>}
                </div>
                {plan.priceInr && (
                  <p className={`mt-1 text-sm ${plan.highlighted ? 'text-amber-200' : 'text-gray-500'}`}>
                    or {plan.priceInr}{plan.period} in India
                  </p>
                )}
                
                <button
                  onClick={() => plan.highlighted && setIsPaymentModalOpen(true)}
                  className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-xl text-center font-medium text-lg transition-all ${
                    plan.highlighted
                      ? 'bg-white text-orange-600 hover:bg-gray-50 shadow-lg'
                      : 'bg-indigo-50 dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
              
              <div className={`px-8 pt-6 pb-8 sm:px-10 sm:pt-6 sm:pb-10 ${plan.highlighted ? 'bg-black/10' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-start">
                      <div className="flex-shrink-0">
                        {feature.included ? (
                          <Check className={`h-6 w-6 ${plan.highlighted ? 'text-white' : 'text-green-500'}`} />
                        ) : (
                          <X className={`h-6 w-6 ${plan.highlighted ? 'text-amber-300' : 'text-gray-300 dark:text-gray-600'}`} />
                        )}
                      </div>
                      <p className={`ml-3 text-base ${
                        feature.included 
                          ? (plan.highlighted ? 'text-white' : 'text-gray-700 dark:text-gray-300') 
                          : (plan.highlighted ? 'text-amber-200' : 'text-gray-400 dark:text-gray-500 line-through')
                      }`}>
                        {feature.name}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-12">
            Frequently asked questions
          </h2>
          <dl className="space-y-8">
            {[
              {
                q: "How does the daily quota work?",
                a: "Free users get 2 summaries per day. The quota resets at midnight UTC. Premium users have unlimited access."
              },
              {
                q: "Can I cancel my subscription?",
                a: "Yes, you can cancel your subscription at any time from your account settings. You'll retain premium access until the end of your current billing cycle."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, UPI, and net banking via Razorpay for users in India. For global users, we use PayPal."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <dt className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                  <HelpCircle className="w-5 h-5 mr-3 text-indigo-500" />
                  {faq.q}
                </dt>
                <dd className="mt-3 text-base text-gray-500 dark:text-gray-400 pl-8">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        onSuccess={() => {
          // Handle success, e.g., redirect to account or show success toast
          window.location.href = '/account';
        }} 
      />
    </div>
  );
};
