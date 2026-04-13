import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

export default function LoadingScreen({ step }: { step: 'text' | 'images' }) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white font-sans">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-8"
      >
        {step === 'text' ? (
          <Sparkles className="w-16 h-16 text-indigo-400" />
        ) : (
          <ImageIcon className="w-16 h-16 text-purple-400" />
        )}
      </motion.div>
      <h2 className="text-2xl font-bold mb-2">
        {step === 'text' ? 'Generating presentation structure...' : 'Painting beautiful images...'}
      </h2>
      <p className="text-slate-400">
        {step === 'text' ? 'Gemini 1.5 Flash is writing your slides.' : 'Stable Diffusion XL is generating visuals.'}
      </p>
    </div>
  );
}
