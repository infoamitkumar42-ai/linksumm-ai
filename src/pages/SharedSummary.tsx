import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Loader2, Sparkles, Instagram, Facebook, Link2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SharedSummary() {
  const { shareId } = useParams();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSharedSummary = async () => {
      try {
        const response = await fetch(`/api/shared/${shareId}`);
        
        if (!response.ok) throw new Error('Failed to fetch shared summary');
        
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedSummary();
    }
  }, [shareId]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center pt-24 pb-20 px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <Loader2 className="w-8 h-8 text-[#007AFF] animate-spin mb-4" />
            <p className="text-[#8E8E93]">Loading shared summary...</p>
          </div>
        ) : error || !summary ? (
          <div className="text-center mt-20 bg-white/5 border border-white/10 rounded-[24px] p-10 max-w-md w-full">
            <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[#636366]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Summary not found</h3>
            <p className="text-[#8E8E93] mb-6">This link might be invalid or has expired.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
              Go to Homepage
            </Link>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[680px]"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] overflow-hidden shadow-2xl mb-8">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Shared Summary</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium text-gray-300">
                  {summary.platform === 'instagram' ? <Instagram className="w-3.5 h-3.5 text-[#E1306C]" /> : <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />}
                  <span className="capitalize">{summary.platform} Reel</span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white prose-a:text-[#007AFF] hover:prose-a:text-[#5E5CE6] transition-colors">
                  <ReactMarkdown>{summary.summary}</ReactMarkdown>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
                <a 
                  href={summary.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-[#007AFF] hover:text-[#5E5CE6] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Original Video
                </a>
                <span className="text-xs text-[#636366]">
                  {new Date(summary.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link 
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#5E5CE6] text-white font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(0,122,255,0.3)]"
              >
                <Sparkles className="w-5 h-5" />
                Try LinkSumm AI — Summarize your own Reels!
              </Link>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
