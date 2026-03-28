import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center text-center mt-20 sm:mt-32 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
      >
        <Sparkles className="w-4 h-4 text-[#BF5AF2]" />
        <span className="text-sm font-medium text-gray-300">AI-Powered Summaries</span>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-2"
      >
        Summarize Any Reel
      </motion.h1>
      
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#007AFF] via-[#5E5CE6] to-[#BF5AF2] mb-6"
      >
        in Seconds
      </motion.h2>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-lg text-[#8E8E93] max-w-[500px] leading-relaxed"
      >
        Paste any Instagram or Facebook Reel link and get instant AI-powered summaries with key points and action items.
      </motion.p>
    </div>
  );
}
