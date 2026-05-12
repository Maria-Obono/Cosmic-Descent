/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [showHowTo, setShowHowTo] = useState(false);

  return (
    <div className="w-full h-screen relative bg-[#87CEEB] overflow-hidden font-sans flex flex-col items-center justify-center select-none">
      {/* Animated Voxel Background Background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: (Math.random() * (window.innerHeight + 400)) - 200, 
              rotate: 1 
            }}
            animate={{ 
              y: window.innerHeight + 200,
              rotate: 360,
              x: (Math.random() - 0.5) * 200 + (Math.random() * window.innerWidth)
            }}
            transition={{ 
              duration: 10 + Math.random() * 15, 
              repeat: Infinity, 
              ease: "linear",
            }}
            className="absolute w-12 h-12 bg-white/20 voxel-shadow flex items-center justify-center text-white/40 font-black text-2xl"
          >
            {Math.floor(Math.random() * 10) + 1}
          </motion.div>
        ))}
      </div>

      {/* Title Area */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 text-center mb-16 px-4"
      >
        <motion.div
           animate={{ 
             opacity: [0.9, 1, 0.9],
             filter: [
               "drop-shadow(0 0 10px rgba(34,211,238,0.2))",
               "drop-shadow(0 0 25px rgba(34,211,238,0.5))",
               "drop-shadow(0 0 10px rgba(34,211,238,0.2))"
             ]
           }}
           transition={{ 
             duration: 4, 
             repeat: Infinity, 
             ease: "easeInOut" 
           }}
           className="relative group"
        >
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-[0.25em] leading-[1.1] flex flex-col items-center relative">
              {/* Shine Overlay */}
              <motion.div 
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                className="absolute inset-0 z-10 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] pointer-events-none"
              />
              
              <span className="bg-gradient-to-b from-white via-white to-cyan-200 bg-clip-text text-transparent drop-shadow-sm">
                Cosmic
              </span>
              <span className="bg-gradient-to-b from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent opacity-90 drop-shadow-sm">
                Descent
              </span>
          </h1>
        </motion.div>
        
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100px" }}
          transition={{ delay: 0.8, duration: 1.5 }}
          className="h-1 bg-white/30 mx-auto mt-8 rounded-full"
        />
      </motion.div>

      {/* Glowing Portal effect behind buttons */}
      <motion.div 
        animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 180, 360]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute w-96 h-96 bg-white/30 rounded-full blur-3xl pointer-events-none"
      />

      {/* Buttons */}
      <div className="z-10 flex flex-col gap-4 w-full max-w-xs">
        <motion.button
          whileHover={{ 
            scale: 1.02, 
            backgroundColor: "rgb(255, 255, 255)",
            boxShadow: "0 0 20px rgba(253, 224, 71, 0.4)" 
          }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="bg-white text-black font-black uppercase tracking-[0.2em] text-lg py-5 transition-all shadow-xl rounded-sm relative overflow-hidden group"
        >
          {/* Subtle inner shine */}
          <motion.div 
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            className="absolute inset-0 z-0 w-1/2 h-full bg-gradient-to-r from-transparent via-black/5 to-transparent skew-x-[-20deg] pointer-events-none"
          />
          <span className="relative z-10">Start Game</span>
        </motion.button>
        
        <motion.button
          whileHover={{ 
            scale: 1.02, 
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderColor: "rgba(255, 255, 255, 0.6)",
            boxShadow: "0 0 20px rgba(253, 224, 71, 0.2)"
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowHowTo(true)}
          className="bg-transparent text-white font-bold uppercase tracking-[0.2em] text-sm py-4 border border-white/20 transition-all opacity-80"
        >
          How to Play
        </motion.button>
      </div>

      {/* Bottom Credits */}
      <div className="absolute bottom-12 text-white/50 text-[10px] uppercase tracking-[0.3em] font-black text-center flex flex-col gap-1">
      
        <span>Created by Maria Gloria Obono • 2026</span>
      </div>

      {/* How to Play Modal */}
      <AnimatePresence>
        {showHowTo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/95 backdrop-blur-xl w-full max-w-xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative"
            >
              <button 
                onClick={() => setShowHowTo(false)}
                className="absolute top-6 right-6 text-black/40 hover:text-black font-black text-xl transition-colors"
              >
                ✕
              </button>
              
              <h2 className="text-3xl font-black uppercase text-black mb-10 tracking-[0.1em] border-b border-black/10 pb-4">How to Play</h2>
              
              <div className="space-y-8 text-black/80">
                <div className="flex items-start gap-6">
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black shrink-0 text-sm">01</div>
                    <p className="uppercase text-xs tracking-[0.15em] leading-relaxed pt-3">Start at 10 and count your way down to 1.</p>
                </div>
                <div className="flex items-start gap-6">
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black shrink-0 text-sm">02</div>
                    <p className="uppercase text-xs tracking-[0.15em] leading-relaxed pt-3">Explore the world to find the <span className="font-black text-cyan-600">Energy Cubes</span>.</p>
                </div>
                <div className="flex items-start gap-6">
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black shrink-0 text-sm">03</div>
                    <p className="uppercase text-xs tracking-[0.15em] leading-relaxed pt-3">Bring them to the <span className="font-black text-yellow-600">Central Pedestal</span>.</p>
                </div>
                <div className="flex items-start gap-6">
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black shrink-0 text-sm">04</div>
                    <p className="uppercase text-xs tracking-[0.15em] leading-relaxed pt-3">Prevent <span className="font-black text-red-600">World Collapse</span> before time runs out.</p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-black/5">
                  <p className="text-[9px] uppercase font-black tracking-[0.3em] opacity-30 mb-2">Controls</p>
                  <p className="uppercase text-[10px] tracking-[0.2em] font-bold text-black/60">Hold and drag mouse to navigate</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(0, 0, 0, 0.9)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowHowTo(false)}
                className="mt-12 w-full bg-black text-white font-black uppercase py-5 tracking-[0.2em] text-sm transition-all"
              >
                I'm Ready
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
