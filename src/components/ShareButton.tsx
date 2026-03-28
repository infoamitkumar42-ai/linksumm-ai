import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Link2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// ✅ Backend URL configuration
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://linksumm-backend.onrender.com";

interface ShareButtonProps {
  summary: string;
  transcript: string;
  sourceUrl: string;
  platform: string;
  wordCount: number;
}

export default function ShareButton({ summary, transcript, sourceUrl, platform, wordCount }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  const handleShareClick = async () => {
    if (shareUrl) {
      setIsOpen(true);
      return;
    }

    setIsGenerating(true);
    console.log('📡 Calling API:', `${BACKEND_URL}/api/save-public-summary`);

    try {
      const response = await fetch(`${BACKEND_URL}/api/save-public-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary,
          transcript,
          source_url: sourceUrl,
          platform,
          word_count: wordCount
        })
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to generate share link');
      
      console.log('✅ Share URL received:', data.share_url);
      setShareUrl(data.share_url);
      setViewCount(0);
      setIsOpen(true);
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to generate share link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const encodedText = encodeURIComponent("Check out this AI summary of a Reel! 🎬✨");
  const oneLineSummary = summary.split('\n').find(l => l.trim().length > 0)?.replace(/[#*]/g, '') || 'Summary';
  const encodedTextWithUrl = encodeURIComponent(`🎬 AI Summary of a Reel:\n\n${oneLineSummary}\n\nFull summary: ${shareUrl}`);

  return (
    <>
      <button
        onClick={handleShareClick}
        disabled={isGenerating}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium text-white transition-all disabled:opacity-50"
      >
        {isGenerating ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Share2 className="w-4 h-4" />}
        <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Share'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 w-full max-w-[440px] shadow-2xl pointer-events-auto relative"
              >
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-full bg-[#007AFF]/20 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-[#007AFF]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Share This Summary</h3>
                    <p className="text-sm text-[#8E8E93]">Choose how you want to share</p>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 block">Direct Link</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={shareUrl}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none"
                    />
                    <button
                      onClick={handleCopy}
                      className={`px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${isCopied ? 'bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}
                    >
                      {isCopied ? <CheckCircle2 className="w-4 h-4" /> : 'Copy'}
                      {isCopied ? 'Copied!' : 'Link'}
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 block">Share to</label>
                  <div className="grid grid-cols-2 gap-3">
                    <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.03] active:scale-[0.97] transition-all">
                      <span className="text-xl">𝕏</span>
                      <span className="text-sm font-medium text-white">Twitter / X</span>
                    </a>
                    <a href={`https://wa.me/?text=${encodedTextWithUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.03] active:scale-[0.97] transition-all">
                      <span className="text-xl">📱</span>
                      <span className="text-sm font-medium text-white">WhatsApp</span>
                    </a>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.03] active:scale-[0.97] transition-all">
                      <span className="text-xl">💼</span>
                      <span className="text-sm font-medium text-white">LinkedIn</span>
                    </a>
                    <a href={`https://t.me/share/url?url=${shareUrl}&text=${encodedText}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-[1.03] active:scale-[0.97] transition-all">
                      <span className="text-xl">✈️</span>
                      <span className="text-sm font-medium text-white">Telegram</span>
                    </a>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <span className="text-xs text-[#636366]">👁️ {viewCount} views</span>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
