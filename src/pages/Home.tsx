import { useState, useRef } from 'react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import LinkInput from '../components/LinkInput';
import LoadingState from '../components/LoadingState';
import SummaryCard from '../components/SummaryCard';
import FeaturesSection from '../components/FeaturesSection';
import Footer from '../components/Footer';
import ErrorFallback from '../components/ErrorFallback';
import { useFreemium } from '../hooks/useFreemium';
import { QuotaExceededModal } from '../components/QuotaExceededModal';
import { AdBanner } from '../components/AdBanner';
import { supabase } from '../lib/supabase';

// ✅ Backend URL configuration
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://linksumm-backend.onrender.com";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState('');
  const [quotaReason, setQuotaReason] = useState('');

  const { checkQuota, incrementUsage, isPremium } = useFreemium();

  // Debug: Log backend URL on mount
  console.log('🔧 Backend URL configured:', BACKEND_URL);

  const handleSummarize = async (url: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    // Check quota first
    const quota = await checkQuota();
    if (quota && !quota.can_summarize) {
      setQuotaMessage(quota.message || "You've reached your daily limit.");
      setQuotaReason(quota.reason);
      setIsQuotaModalOpen(true);
      setIsLoading(false);
      return;
    }

    console.log('📡 Calling API:', `${BACKEND_URL}/api/summarize`);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const response = await fetch(`${BACKEND_URL}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, user_id: userId })
      });
      
      console.log('📥 Response status:', response.status);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to process video');
      }
      
      console.log('✅ Summary received:', data);
      setResult(data);
      toast.success('Summary generated successfully!');
      await incrementUsage();

      // Save to history if logged in
      if (userId) {
        try {
          await fetch(`${BACKEND_URL}/api/save-summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              source_url: data.source_url,
              platform: data.platform,
              transcript: data.transcript,
              summary: data.summary,
              word_count: data.word_count,
              processing_time: data.processing_time
            })
          });
          toast.success('Summary saved to history');
        } catch (err) {
          console.error('❌ Failed to save summary:', err);
        }
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to process video');
      toast.error('Download failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    // Check quota first
    const quota = await checkQuota();
    if (quota && !quota.can_summarize) {
      setQuotaMessage(quota.message || "You've reached your daily limit.");
      setQuotaReason(quota.reason);
      setIsQuotaModalOpen(true);
      setIsLoading(false);
      return;
    }

    console.log('📡 Calling API:', `${BACKEND_URL}/api/summarize-upload`);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      let uploadUrl = `${BACKEND_URL}/api/summarize-upload`;
      if (userId) {
        uploadUrl += `?user_id=${userId}`;
      }

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to process uploaded file');
      }

      console.log('✅ File summarized successfully:', data);
      setResult(data);
      toast.success('File summarized successfully!');
      await incrementUsage();
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to process uploaded file');
      toast.error('Upload failed');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#007AFF]/30 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col relative z-10">
        <HeroSection />
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="video/*,audio/*" 
          className="hidden" 
        />

        {!isLoading && !result && (
          <>
            <LinkInput 
              onSubmit={handleSummarize} 
              onUploadClick={triggerFileUpload}
              isLoading={isLoading} 
            />
            {error && (
              <ErrorFallback 
                error={error} 
                onUploadClick={triggerFileUpload} 
              />
            )}
          </>
        )}

        {isLoading && <LoadingState />}

        {result && !isLoading && (
          <>
            <SummaryCard 
              summary={result.summary}
              transcript={result.transcript}
              sourceUrl={result.source_url}
              platform={result.platform}
              wordCount={result.word_count}
              processingTime={result.processing_time}
              onReset={() => {
                setResult(null);
                setError(null);
              }}
            />
            {!isPremium && <AdBanner slotId="YOUR_AD_SLOT_ID" />}
          </>
        )}

        <FeaturesSection />
      </main>

      <Footer />
      <QuotaExceededModal 
        isOpen={isQuotaModalOpen} 
        onClose={() => setIsQuotaModalOpen(false)} 
        message={quotaMessage} 
        reason={quotaReason}
      />
    </div>
  );
}
