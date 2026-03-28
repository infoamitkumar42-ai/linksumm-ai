import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, ExternalLink, Instagram, Facebook, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import { getRelativeTime } from '../lib/utils';
import ConfirmationDialog from '../components/ConfirmationDialog';
import ShareButton from '../components/ShareButton';
import { Link } from 'react-router-dom';
import { useFreemium } from '../hooks/useFreemium';
import { AdBanner } from '../components/AdBanner';

export default function History() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState<string | null>(null);
  const { isPremium } = useFreemium();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchSummaries();
  }, [debouncedSearch]);

  const fetchSummaries = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let query = supabase
        .from('summaries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (debouncedSearch) {
        query = query.or(`summary.ilike.%${debouncedSearch}%,source_url.ilike.%${debouncedSearch}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSummaries(data || []);
    } catch (error: any) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase.from('summaries').delete().eq('id', deleteId);
      if (error) throw error;
      
      setSummaries(summaries.filter(s => s.id !== deleteId));
      toast.success('Summary deleted ✅');
    } catch (error: any) {
      toast.error('Failed to delete summary');
    } finally {
      setDeleteId(null);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(id);
      toast.success('Summary copied to clipboard');
      setTimeout(() => setIsCopied(null), 2000);
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-24 pb-20">
        {!isPremium && <AdBanner slotId="YOUR_AD_SLOT_ID" />}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">📚 Your Summaries</h1>
              <span className="px-3 py-1 rounded-full bg-white/10 text-sm font-medium text-gray-300">
                {summaries.length} summaries
              </span>
            </div>
            <p className="text-[#8E8E93] mt-2">All your past summaries in one place</p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
            <input
              type="text"
              placeholder="🔍 Search your summaries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-[#636366] focus:outline-none focus:border-[#007AFF] transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full bg-white/5 border border-white/10 rounded-[20px] p-5 animate-pulse flex flex-col gap-4">
                <div className="flex justify-between">
                  <div className="h-6 bg-white/10 rounded-full w-32"></div>
                  <div className="h-4 bg-white/10 rounded w-20"></div>
                </div>
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                <div className="flex justify-between mt-2">
                  <div className="h-4 bg-white/10 rounded w-32"></div>
                  <div className="h-8 bg-white/10 rounded-xl w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : summaries.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-[24px] p-10 max-w-[400px] text-center"
            >
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="text-[72px] mb-4"
              >
                {searchQuery ? "🔍" : "📭"}
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {searchQuery ? "No results found" : "No summaries yet"}
              </h3>
              <p className="text-[#8E8E93] mb-8">
                {searchQuery ? "Try a different search term" : "Start by summarizing your first Instagram or Facebook Reel!"}
              </p>
              {searchQuery ? (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                  Clear Search
                </button>
              ) : (
                <Link 
                  to="/"
                  className="inline-block px-6 py-3 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5E5CE6] text-white font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  ✨ Summarize Your First Reel
                </Link>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {summaries.map((summary, index) => {
                const isExpanded = expandedId === summary.id;
                const oneLineSummary = summary.summary.split('\n').find((l: string) => l.trim().length > 0)?.replace(/[#*]/g, '') || 'Summary';

                return (
                  <motion.div
                    key={summary.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-[20px] overflow-hidden hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="p-5 flex flex-col gap-4">
                      {/* Top Row */}
                      <div className="flex justify-between items-center">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${summary.platform === 'instagram' ? 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040]' : 'bg-gradient-to-r from-[#1877F2] to-[#0E5EC8]'}`}>
                          {summary.platform === 'instagram' ? <Instagram className="w-3.5 h-3.5" /> : <Facebook className="w-3.5 h-3.5" />}
                          <span className="capitalize">{summary.platform} Reel</span>
                        </div>
                        <span className="text-xs text-[#8E8E93]">
                          {getRelativeTime(summary.created_at)}
                        </span>
                      </div>

                      {/* Middle Row */}
                      <div>
                        <p className="text-base text-white font-medium line-clamp-2">
                          {oneLineSummary}
                        </p>
                      </div>

                      {/* Bottom Row */}
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-[#8E8E93]">
                          📝 {summary.word_count} words • ⚡ {summary.processing_time}s
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : summary.id)}
                            className="text-sm font-medium text-[#007AFF] hover:text-[#5E5CE6] transition-colors"
                          >
                            {isExpanded ? 'Collapse ↑' : 'View Full →'}
                          </button>
                          <button
                            onClick={() => setDeleteId(summary.id)}
                            className="p-2 rounded-xl hover:bg-[#FF453A]/20 text-transparent hover:text-[#FF453A] transition-colors group"
                          >
                            <span className="text-lg opacity-50 group-hover:opacity-100">🗑️</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-5 pb-5 pt-2 border-t border-white/10"
                        >
                          <div className="prose prose-invert max-w-none prose-sm mt-4">
                            <ReactMarkdown>{summary.summary}</ReactMarkdown>
                          </div>

                          {/* Transcript Toggle */}
                          <div className="mt-6 pt-4 border-t border-white/10">
                            <button
                              onClick={() => setShowTranscript(showTranscript === summary.id ? null : summary.id)}
                              className="flex items-center gap-2 text-sm font-medium text-[#8E8E93] hover:text-white transition-colors"
                            >
                              {showTranscript === summary.id ? 'Hide Transcript' : 'Show Transcript'}
                            </button>
                            
                            {showTranscript === summary.id && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 text-sm text-gray-400 max-h-60 overflow-y-auto"
                              >
                                {summary.transcript}
                              </motion.div>
                            )}
                          </div>

                          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                            <a 
                              href={summary.source_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm font-medium text-[#007AFF] hover:text-[#5E5CE6] transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Original Video
                            </a>

                            <div className="flex items-center gap-2">
                              <ShareButton 
                                summary={summary.summary}
                                transcript={summary.transcript}
                                sourceUrl={summary.source_url}
                                platform={summary.platform}
                                wordCount={summary.word_count}
                              />
                              <button
                                onClick={() => handleCopy(summary.id, summary.summary)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium text-white transition-all"
                              >
                                {isCopied === summary.id ? <CheckCircle2 className="w-4 h-4 text-[#30D158]" /> : <Copy className="w-4 h-4" />}
                                <span className="hidden sm:inline">{isCopied === summary.id ? 'Copied' : 'Copy Summary'}</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />

      <ConfirmationDialog 
        isOpen={!!deleteId}
        title="Delete Summary"
        description="Are you sure you want to delete this summary? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

