import { useState } from 'react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import LinkInput from '../components/LinkInput';
import LoadingState from '../components/LoadingState';
import SummaryCard from '../components/SummaryCard';
import FeaturesSection from '../components/FeaturesSection';
import Footer from '../components/Footer';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSummarize = async (url: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      // In a real environment, this would call the Python backend:
      // const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/summarize`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ url })
      // });
      // const data = await response.json();
      
      // Since the Python backend isn't running in this preview environment,
      // we mock the response after a realistic delay to demonstrate the UI.
      
      await new Promise(resolve => setTimeout(resolve, 8000));
      
      const isInsta = url.includes('instagram');
      
      const mockResult = {
        summary: `
## 📌 One-Line Summary
A quick guide on how to optimize your morning routine for maximum productivity.

## 📝 Key Points
* Wake up at the same time every day to regulate your circadian rhythm.
* Hydrate immediately with a large glass of water before coffee.
* Spend 10 minutes on light stretching or meditation.
* Avoid checking your phone or social media for the first hour.

## 🎯 Action Items
* Set your alarm for 6:30 AM tomorrow.
* Place a glass of water on your nightstand tonight.

## 🏷️ Tags
\`#Productivity\` \`#MorningRoutine\` \`#SelfImprovement\` \`#Habits\`
        `,
        transcript: "Hey guys, here is a quick guide on how to optimize your morning routine for maximum productivity. First, wake up at the same time every day to regulate your circadian rhythm. Second, hydrate immediately with a large glass of water before you even think about coffee. Third, spend 10 minutes on light stretching or meditation to wake up your body. And finally, avoid checking your phone or social media for the first hour. Try this tomorrow by setting your alarm for 6:30 AM and placing a glass of water on your nightstand tonight.",
        source_url: url,
        platform: isInsta ? 'instagram' : 'facebook',
        word_count: 85,
        processing_time: 8.2
      };
      
      setResult(mockResult);
      toast.success('Summary generated successfully!');
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to process video');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#007AFF]/30 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col relative z-10">
        <HeroSection />
        
        {!isLoading && !result && (
          <LinkInput onSubmit={handleSummarize} isLoading={isLoading} />
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
            onReset={() => setResult(null)}
          />
        )}

        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
}
