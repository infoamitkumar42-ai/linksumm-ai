import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Clock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  reason?: string;
}

export const QuotaExceededModal: React.FC<QuotaExceededModalProps> = ({ isOpen, onClose, message, reason }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setUTCHours(24, 0, 0, 0); // Next midnight UTC
      
      const diff = tomorrow.getTime() - now.getTime();
      
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const isUnauthenticated = reason === 'unauthenticated' || reason === 'anonymous_quota_exceeded';

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

          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Daily Limit Reached
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {message || "You've used your 2 free summaries for today."}
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-8 border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Quota resets in</p>
              <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">{timeLeft}</p>
            </div>

            <div className="space-y-3">
              {isUnauthenticated && (
                <button
                  onClick={() => {
                    onClose();
                    navigate('/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#007AFF] hover:bg-[#0056b3] text-white font-semibold rounded-xl transition-all shadow-lg"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In (Get 2 more free)
                </button>
              )}
              
              <button
                onClick={() => {
                  onClose();
                  navigate('/pricing');
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/25"
              >
                <Crown className="w-5 h-5" />
                Upgrade to Premium
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-3 px-4 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Come back tomorrow
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

