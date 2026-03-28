import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://linksumm-backend.onrender.com";

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

  const checkAnonymousQuota = (): QuotaStatus => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('ls_date');
    const savedCount = parseInt(localStorage.getItem('ls_count') || '0');
    
    if (savedDate !== today) {
      localStorage.setItem('ls_date', today);
      localStorage.setItem('ls_count', '0');
      return { can_summarize: true, remaining: 2, reason: 'unauthenticated' };
    }
    
    const remaining = Math.max(0, 2 - savedCount);
    return { 
      can_summarize: remaining > 0, 
      remaining, 
      reason: 'unauthenticated',
      message: remaining === 0 ? "You've used your 2 free summaries today." : undefined
    };
  };

  const incrementAnonymousUsage = () => {
    const count = parseInt(localStorage.getItem('ls_count') || '0');
    localStorage.setItem('ls_count', (count + 1).toString());
  };

  const checkQuota = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const status = checkAnonymousQuota();
        setQuotaStatus(status);
        setIsLoading(false);
        return status;
      }

      // Use BACKEND_URL for consistency with Home.tsx
      const response = await fetch(`${BACKEND_URL}/api/check-quota`, {
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

  const incrementUsage = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      incrementAnonymousUsage();
    }
  };

  useEffect(() => {
    checkQuota();
  }, []);

  return { quotaStatus, checkQuota, incrementUsage, isLoading, isPremium };
};
