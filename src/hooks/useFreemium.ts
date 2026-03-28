import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface QuotaStatus {
  can_summarize: boolean;
  remaining: number;
  reason: string;
  message?: string;
}

export const useFreemium = () => {
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const checkQuota = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Unauthenticated users get 0 quota, or we can allow 1 free try based on IP
        // For now, let's say they need to login
        const status = {
          can_summarize: false,
          remaining: 0,
          reason: 'unauthenticated',
          message: 'Please login to summarize reels.'
        };
        setQuotaStatus(status);
        setIsLoading(false);
        return status;
      }

      const response = await fetch(`${API_URL}/api/check-quota`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: session.user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuotaStatus(data);
        setIsPremium(data.reason === 'premium');
        return data as QuotaStatus;
      } else {
        console.error('Failed to check quota');
        return null;
      }
    } catch (error) {
      console.error('Error checking quota:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkQuota();
  }, []);

  return { quotaStatus, checkQuota, isLoading, isPremium };
};
