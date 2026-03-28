import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const steps = [
  { id: 1, text: '🔗 Link detected...', delay: 1000 },
  { id: 2, text: '🎵 Extracting audio...', delay: 3000 },
  { id: 3, text: '📝 Transcribing speech...', delay: 5000 },
  { id: 4, text: '🤖 Generating summary...', delay: 7000 },
];

export default function LoadingState() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = steps.map((step, index) => {
      return setTimeout(() => {
        setActiveStep(index + 1);
      }, step.delay);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[680px] mx-auto mt-12 px-4"
    >
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 sm:p-8 shadow-2xl">
        <div className="space-y-6">
          {/* Skeleton Cards */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-white/5 rounded"></div>
                  <div className="h-3 bg-white/5 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = activeStep > index;
              const isActive = activeStep === index;
              const isPending = activeStep < index;

              return (
                <div key={step.id} className="flex items-center gap-3">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#30D158]" />
                    </motion.div>
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-[#007AFF] animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-white/10" />
                  )}
                  <span className={`text-sm font-medium ${isCompleted ? 'text-white' : isActive ? 'text-[#007AFF]' : 'text-[#636366]'}`}>
                    {step.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
