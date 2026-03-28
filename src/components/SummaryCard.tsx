import { motion } from 'framer-motion';
import { Copy, ExternalLink, FileText, Bookmark, RotateCcw, CheckCircle2, Zap, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ShareButton from './ShareButton';

interface SummaryCardProps {
  summary: string;
  transcript: string;
  sourceUrl: string;
  platform: string;
  wordCount: number;
  processingTime: number;
  onReset: () => void;
}

export default function SummaryCard({
  summary,
  transcript,
  sourceUrl,
  platform,
  wordCount,
  processingTime,
  onReset
}: SummaryCardProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setIsCopied(true);
      toast.success('Summary copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('summaries').insert({
        user_id: user.id,
        source_url: sourceUrl,
        platform,
        transcript,
        summary,
        word_count: wordCount,
        processing_time: processingTime
      });

      if (error) throw error;
      setIsSaved(true);
      toast.success('Summary saved to history');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save summary');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[680px] mx-auto mt-12 px-4"
    >
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#BF5AF2]" />
            <h3 className="text-lg font-semibold text-white">Summary</h3>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-gray-300">
            <Zap className="w-3.5 h-3.5 text-[#FFD60A]" />
            {processingTime}s | {wordCount} words
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white prose-a:text-[#007AFF] hover:prose-a:text-[#5E5CE6] transition-colors">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>

          {/* Transcript Toggle */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-2 text-sm font-medium text-[#8E8E93] hover:text-white transition-colors"
            >
              {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
            </button>
            
            {showTranscript && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 text-sm text-gray-400 max-h-60 overflow-y-auto"
              >
                {transcript}
              </motion.div>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-4">
          <a 
            href={sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-[#007AFF] hover:text-[#5E5CE6] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Original Video
          </a>

          <div className="flex items-center gap-2 flex-wrap">
            <ShareButton 
              summary={summary}
              transcript={transcript}
              sourceUrl={sourceUrl}
              platform={platform}
              wordCount={wordCount}
            />

            <button
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium text-white transition-all disabled:opacity-50"
            >
              {isSaved ? (
                <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
              ) : user ? (
                <Bookmark className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isSaved ? 'Saved!' : user ? 'Save' : 'Sign in to save'}
              </span>
            </button>
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium text-white transition-all"
            >
              {isCopied ? <CheckCircle2 className="w-4 h-4 text-[#30D158]" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#007AFF] to-[#5E5CE6] text-white text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
