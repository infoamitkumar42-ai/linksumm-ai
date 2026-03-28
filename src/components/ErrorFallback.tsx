import { AlertCircle, Upload, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorFallbackProps {
  error: string;
  onUploadClick: () => void;
}

export default function ErrorFallback({ error, onUploadClick }: ErrorFallbackProps) {
  const isInstagramError = error.toLowerCase().includes('instagram') || error.toLowerCase().includes('upload');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mt-6 max-w-[680px] mx-auto text-center"
    >
      <div className="flex justify-center mb-4">
        <div className="bg-red-500/20 p-3 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">Download Failed</h3>
      <p className="text-red-200/80 text-sm mb-6 max-w-md mx-auto">
        {error}
      </p>

      {isInstagramError && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              // Scroll to top or focus input
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#30D158]/10 hover:bg-[#30D158]/20 border border-[#30D158]/30 text-[#30D158] transition-colors text-sm font-medium"
          >
            <Youtube className="w-4 h-4" />
            Try YouTube Shorts Instead
          </button>
          
          <button
            onClick={onUploadClick}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            Upload Video File
          </button>
        </div>
      )}
    </motion.div>
  );
}
