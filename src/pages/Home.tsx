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

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSummarize = async (url: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to process video');
      }
      
      setResult(data);
      toast.success('Summary generated successfully!');
    } catch (err: any) {
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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/summarize-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to process uploaded file');
      }

      setResult(data);
      toast.success('File summarized successfully!');
    } catch (err: any) {
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
        )}

        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
}
