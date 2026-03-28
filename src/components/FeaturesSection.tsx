import { motion } from 'framer-motion';
import { Zap, Target, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Get comprehensive summaries in under 10 seconds. No more watching 10-minute reels.',
    color: 'text-[#FFD60A]',
    bg: 'bg-[#FFD60A]/10'
  },
  {
    icon: Target,
    title: 'Highly Accurate',
    description: 'Powered by Gemini AI and Whisper for precise transcription and intelligent summarization.',
    color: 'text-[#30D158]',
    bg: 'bg-[#30D158]/10'
  },
  {
    icon: Sparkles,
    title: '100% Free',
    description: 'No subscriptions, no hidden charges. Just paste your link and get instant results.',
    color: 'text-[#BF5AF2]',
    bg: 'bg-[#BF5AF2]/10'
  }
];

export default function FeaturesSection() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-32 px-4 pb-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white tracking-tight">Why LinkSumm AI?</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-8 hover:bg-white/10 transition-colors"
          >
            <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
              <feature.icon className={`w-6 h-6 ${feature.color}`} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
            <p className="text-[#8E8E93] leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
