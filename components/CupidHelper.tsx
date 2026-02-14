import React, { useState } from 'react';
import { Heart, Sparkles, MessageCircle, X } from 'lucide-react';
import { getCupidHint } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface CupidHelperProps {
  context: string;
}

export const CupidHelper: React.FC<CupidHelperProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const askCupid = async () => {
    setLoading(true);
    const response = await getCupidHint(context);
    setHint(response);
    setLoading(false);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white p-3 rounded-full shadow-lg border-2 border-pink-400 text-pink-500 hover:bg-pink-50 z-50"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border-2 border-pink-300 w-72 md:w-80 origin-top-right"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-pink-600 flex items-center gap-2">
                <Sparkles size={18} /> Cupidon AI
              </h3>
            </div>
            
            <div className="min-h-[60px] text-gray-700 text-sm">
              {loading ? (
                <div className="flex items-center gap-2 text-pink-400 animate-pulse">
                  <Heart size={16} fill="currentColor" />
                  <span>Se consultă stelele...</span>
                </div>
              ) : hint ? (
                <p className="italic">"{hint}"</p>
              ) : (
                <p>Te-ai blocat? Cere-mi un indiciu și te voi ajuta cu drag! 🏹</p>
              )}
            </div>

            <button
              onClick={askCupid}
              disabled={loading}
              className="mt-3 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {hint ? "Alt indiciu?" : "Cere indiciu"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};