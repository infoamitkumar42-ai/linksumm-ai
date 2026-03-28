import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface LinkInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function LinkInput({ onSubmit, isLoading }: LinkInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    // Basic validation
    const isInstagram = url.includes('instagram.com/reel') || url.includes('instagram.com/p');
    const isFacebook = url.includes('facebook.com/reel') || url.includes('fb.watch') || url.includes('facebook.com/share');
    
    if (!isInstagram && !isFacebook) {
      toast.error('Please paste a valid Instagram or Facebook Reel link');
      return;
    }
    
    onSubmit(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full max-w-[680px] mx-auto mt-10 px-4"
    >
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-2 sm:p-3 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Instagram or Facebook Reel link here..."
            className="flex-1 bg-white/5 border-1.5 border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-[#636366] focus:outline-none focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/20 transition-all text-base"
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="bg-gradient-to-br from-[#007AFF] to-[#5E5CE6] text-white font-semibold rounded-2xl px-8 py-4 flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(0,122,255,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none whitespace-nowrap"
          >
            {isLoading ? 'Processing...' : (
              <>
                Summarize <Sparkles className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400">
          <Instagram className="w-3.5 h-3.5" />
          Instagram Reels
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400">
          <Facebook className="w-3.5 h-3.5" />
          Facebook Reels
        </div>
      </div>
    </motion.div>
  );
}
