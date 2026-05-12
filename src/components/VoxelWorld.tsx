/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { KeyboardControls, Stars } from '@react-three/drei';
import { VoxelNumber } from './VoxelNumber.tsx';
import { VoxelPlayer } from './VoxelPlayer.tsx';
import { Environment } from './Environment.tsx';
import { VoxelItem } from './VoxelItem.tsx';
import { VoxelCoin } from './VoxelCoin.tsx';
import { FireworksEffect } from './FireworksEffect.tsx';
import { StartScreen } from './StartScreen.tsx';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';

const ITEMS_DATA = [
  { id: '10', pos: [20, 2, 20], color: '#ff00ff', stage: 10 },
  { id: '9', pos: [-25, 2, 15], color: '#00ff00', stage: 9 },
  { id: '8', pos: [15, 2, -30], color: '#0000ff', stage: 8 },
  { id: '7', pos: [-20, 2, -25], color: '#ffff00', stage: 7 },
  { id: '6', pos: [35, 2,  0], color: '#ff8800', stage: 6 },
  { id: '5', pos: [-35, 2, -5], color: '#ff0000', stage: 5 },
  { id: '4', pos: [0, 2, -40], color: '#00ffff', stage: 4 },
  { id: '3', pos: [40, 2, 40], color: '#ffffff', stage: 3 },
  { id: '2', pos: [-40, 2, 40], color: '#ff00ff', stage: 2 },
  { id: '1', pos: [0, 2, 30], color: '#00ffff', stage: 1 },
];

const HIDDEN_COINS = [
  { id: 'c1-1', pos: [30, 2, -10], stage: 10 },
  { id: 'c1-2', pos: [-30, 2, 25], stage: 10 },
  { id: 'c2-1', pos: [-15, 2, -40], stage: 9 },
  { id: 'c2-2', pos: [20, 2, 10], stage: 9 },
  { id: 'c3-1', pos: [45, 2, 45], stage: 8 },
  { id: 'c3-2', pos: [-20, 2, -30], stage: 8 },
  { id: 'c4-1', pos: [-45, 2, -15], stage: 7 },
  { id: 'c4-2', pos: [10, 2, 40], stage: 7 },
  { id: 'c5-1', pos: [0, 2, 50], stage: 6 },
  { id: 'c5-2', pos: [-50, 2, 15], stage: 6 },
  { id: 'c6-1', pos: [-50, 2, 0], stage: 5 },
  { id: 'c6-2', pos: [40, 2, -20], stage: 5 },
  { id: 'c7-1', pos: [20, 2, 45], stage: 4 },
  { id: 'c7-2', pos: [-40, 2, -40], stage: 4 },
  { id: 'c8-1', pos: [-30, 2, -50], stage: 3 },
  { id: 'c8-2', pos: [50, 2, 20], stage: 3 },
  { id: 'c9-1', pos: [55, 2, -55], stage: 2 },
  { id: 'c9-2', pos: [-55, 2, 5], stage: 2 },
  { id: 'c10-1', pos: [5, 2, -60], stage: 1 },
  { id: 'c10-2', pos: [-45, 2, 45], stage: 1 },
];

const TIMER_LIMIT = 180;

const CameraRotator: React.FC<{ active: boolean }> = ({ active }) => {
  useFrame((state) => {
    if (active) {
      const time = state.clock.getElapsedTime();
      const radius = 40;
      state.camera.position.x = Math.sin(time * 0.4) * radius;
      state.camera.position.z = Math.cos(time * 0.4) * radius;
      state.camera.position.y = 15 + Math.sin(time * 0.2) * 5;
      state.camera.lookAt(0, 5, 0);
    }
  });
  return null;
};

export const VoxelWorld: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isExploding, setIsExploding] = useState(false);
  const [isFinale, setIsFinale] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showFinalScreen, setShowFinalScreen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_LIMIT);
  const [showFlash, setShowFlash] = useState(false);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const [collectedCoins, setCollectedCoins] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isCarrying, setIsCarrying] = useState(false);
  const playerPosRef = useRef(new THREE.Vector3(0, 1.5, 15));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Level Timer Logic
  useEffect(() => {
    if (!gameStarted || isComplete || isGameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, isComplete, isGameOver, countdown]);

  const handleCollect = (id: string) => {
    setIsCarrying(true);
  };

  const handleCollectCoin = (id: string) => {
    setCollectedCoins(prev => [...prev, id]);
    setScore(prev => prev + 100); 
    setStatusMessage("+100 GOLD");
    setTimeout(() => setStatusMessage(null), 1500);
  };

  const restartGame = () => {
    setCountdown(10);
    setIsFinale(false);
    setIsComplete(false);
    setShowFinalScreen(false);
    setIsGameOver(false);
    setTimeLeft(TIMER_LIMIT);
    setCollectedItems([]);
    setCollectedCoins([]);
    setScore(0);
    setIsCarrying(false);
    playerPosRef.current.set(0, 1.5, 15);
  };

  const handleDeliver = (id: string) => {
    if (collectedItems.includes(id)) return;
    
    // Scoring logic
    const levelIndex = 11 - countdown;
    const levelBonus = levelIndex * 100;
    const timeBonus = timeLeft * 10;
    const roundTotal = levelBonus + timeBonus;
    
    setScore(prev => prev + roundTotal);
    setCollectedItems(prev => [...prev, id]);
    setIsCarrying(false);
    setStatusMessage(`+${roundTotal}`);
    
    // Trigger Explosion & Next Level
    setIsExploding(true);
    
    if (countdown > 1) {
      setTimeout(() => {
        setIsExploding(false);
        setCountdown(prev => prev - 1);
      }, 2000);
    } else {
      setShowFlash(true);
      setTimeout(() => {
        setIsExploding(false);
        setCountdown(10); // Restore to 10 for finale
        setIsFinale(true);
        setIsComplete(true); // Shows fireworks
        setShowFlash(false);
        
        // Show final screen after some camera rotation
        setTimeout(() => {
          setShowFinalScreen(true);
        }, 8000);
      }, 500); // 0.5s flash for final transformation
    }
    
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const getRating = () => {
    if (score > 12000) return { stars: 5, title: "Master" };
    if (score > 9000) return { stars: 4, title: "Speedrunner" };
    if (score > 6000) return { stars: 3, title: "Explorer" };
    if (score > 3000) return { stars: 2, title: "Beginner" };
    return { stars: 1, title: "Rookie" };
  };

  const rating = getRating();

  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
  ];

  const onPointerDown = (e: any) => {
    (window as any).isMouseDown = true;
  };
  
  const onPointerUp = (e: any) => {
    (window as any).isMouseDown = false;
  };

  if (!gameStarted) {
    return <StartScreen onStart={() => setGameStarted(true)} />;
  }

  return (
    <div 
        className="w-full h-screen relative bg-[#87CEEB] overflow-hidden font-sans cursor-crosshair"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onContextMenu={(e) => e.preventDefault()} // Prevent context menu for smoother right-click jumping
    >
      {/* Aesthetic Voxel Clouds */}
      <div className="absolute top-20 left-20 w-32 h-12 bg-white opacity-80 voxel-shadow pointer-events-none" />
      <div className="absolute top-32 left-40 w-24 h-10 bg-white opacity-60 voxel-shadow pointer-events-none" />
      <div className="absolute top-16 right-32 w-40 h-16 bg-white opacity-90 voxel-shadow pointer-events-none" />

      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [0, 5, 20], fov: 60 }}>
          <Environment countdown={countdown} />
          <CameraRotator active={isFinale && !showFinalScreen} />
          
          {!isFinale && (
            <VoxelNumber 
              number={countdown} 
              color="#FFD700" 
              position={[0, 10, 0]} 
              isExploding={isExploding}
            />
          )}

          {/* Render Item for current stage */}
          {ITEMS_DATA.map(item => (
            countdown === item.stage && !collectedItems.includes(item.id) && (
              <VoxelItem 
                key={item.id}
                id={item.id}
                position={item.pos as [number, number, number]}
                playerPosRef={playerPosRef}
                onCollect={() => handleCollect(item.id)}
                onDeliver={() => handleDeliver(item.id)}
                color={item.color}
              />
            )
          ))}

          {/* Hidden Coins */}
          {HIDDEN_COINS.map(coin => (
            countdown === coin.stage && !collectedCoins.includes(coin.id) && (
              <VoxelCoin 
                key={coin.id}
                id={coin.id}
                position={coin.pos as [number, number, number]}
                playerPosRef={playerPosRef}
                onCollect={() => handleCollectCoin(coin.id)}
              />
            )
          ))}

          <VoxelPlayer playerPosRef={playerPosRef} cameraActive={!isFinale} />
          
          {isComplete && <FireworksEffect />}

          {countdown < 5 && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
        </Canvas>
      </KeyboardControls>

      {/* HUD Design */}
      <div className={`absolute inset-x-0 top-0 p-8 pointer-events-none z-20 flex justify-between items-start transition-opacity duration-1000 ${isFinale && !showFinalScreen ? 'opacity-0' : 'opacity-100'}`}>
        {/* Left Side: Stage */}
        <div className="bg-black/40 backdrop-blur-md px-10 py-3 border-l-4 border-yellow-400">
            <div className="text-xs text-yellow-400 font-bold uppercase tracking-widest mb-1">Stage</div>
            <div className="text-4xl font-black text-white tracking-[0.1em]">{isFinale ? "Finale" : countdown}</div>
        </div>

        {/* Center: Timer Bar */}
        <div className="flex flex-col items-center gap-2 mt-2">
            <div className="flex items-end gap-1">
                <span className={`text-4xl font-mono font-black ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {Math.floor(timeLeft / 60)}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
                </span>
            </div>
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                    animate={{ width: `${(timeLeft / TIMER_LIMIT) * 100}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full ${timeLeft < 30 ? 'bg-red-500' : 'bg-yellow-400'}`}
                />
            </div>
        </div>

        {/* Right Side: Score */}
        <div className="bg-black/40 backdrop-blur-md px-10 py-3 border-r-4 border-cyan-400 text-right">
            <div className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-1">Score</div>
            <div className="text-4xl font-black text-white tracking-[0.05em]">{score.toLocaleString()}</div>
        </div>
      </div>

      {/* Collection Prompt at Bottom */}
      <div className="absolute bottom-12 inset-x-0 flex justify-center pointer-events-none px-12">
          {isCarrying && countdown === 10 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-cyan-500 text-black font-black uppercase italic px-8 py-3 voxel-shadow flex items-center gap-4"
              >
                  <div className="w-3 h-3 bg-white animate-ping rounded-full" />
                  RETURN TO PEDESTAL
              </motion.div>
          )}
      </div>

      {/* Status Cue (Smaller floating toast) */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          >
            <div className="bg-white/10 backdrop-blur-md px-8 py-3 border-b-4 border-cyan-400">
                <span className="text-white font-black text-sm uppercase tracking-widest">{statusMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#87CEEB] z-50 pointer-events-auto px-6 text-center overflow-hidden"
          >
            {/* Playful Background Voxel Patterns with theme from start screen */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               {[...Array(15)].map((_, i) => (
                 <motion.div
                   key={i}
                   initial={{ 
                     y: (Math.random() * (window.innerHeight + 400)) - 200, 
                     x: Math.random() * window.innerWidth,
                     rotate: 0,
                     scale: Math.random() * 0.5 + 0.8
                   }}
                   animate={{ 
                     y: window.innerHeight + 200,
                     rotate: 360,
                   }}
                   transition={{ 
                     duration: 12 + Math.random() * 8, 
                     repeat: Infinity,
                     ease: "linear",
                   }}
                   className="absolute w-12 h-12 bg-white/20 voxel-shadow flex items-center justify-center text-white/40 font-black text-2xl"
                 >
                    {Math.floor(Math.random() * 10) + 1}
                 </motion.div>
               ))}
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                filter: [
                  "drop-shadow(0 0 10px rgba(34,211,238,0.2))",
                  "drop-shadow(0 0 25px rgba(34,211,238,0.5))",
                  "drop-shadow(0 0 10px rgba(34,211,238,0.2))"
                ]
              }}
              transition={{ 
                type: "spring", 
                damping: 15, 
                stiffness: 100,
                filter: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative z-10"
            >
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-[0.2em] leading-tight flex flex-col items-center relative">
                {/* Shine Overlay */}
                <motion.div 
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                  className="absolute inset-0 z-10 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] pointer-events-none"
                />
                <span className="bg-gradient-to-b from-white via-white to-cyan-200 bg-clip-text text-transparent">Time's</span>
                <span className="bg-gradient-to-b from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent opacity-90">Up!</span>
              </h2>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-row items-center justify-center gap-10 md:gap-16 relative z-10 px-8 py-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl"
            >
              <div className="text-center group">
                <p className="text-white/60 font-black uppercase text-[10px] tracking-[0.4em] mb-4 transition-colors group-hover:text-white/90">Stage Reached</p>
                <p className="text-white font-black text-5xl md:text-6xl tracking-tight leading-none group-hover:scale-105 transition-transform">
                  {countdown}
                </p>
              </div>
              <div className="w-px h-16 bg-white/20" />
              <div className="text-center group">
                <p className="text-white/60 font-black uppercase text-[10px] tracking-[0.4em] mb-4 transition-colors group-hover:text-white/90">Final Score</p>
                <p className="text-white font-black text-5xl md:text-6xl tracking-tight leading-none group-hover:scale-105 transition-transform">
                  {score.toLocaleString()}
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-12 w-full max-w-xs z-10"
            >
              <motion.button 
                  whileHover={{ 
                    scale: 1.02, 
                    backgroundColor: "rgb(255, 255, 255)",
                    boxShadow: "0 0 20px rgba(253, 224, 71, 0.4)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={restartGame}
                  className="w-full bg-white text-black font-black uppercase tracking-[0.2em] text-lg py-5 transition-all shadow-xl rounded-sm"
              >
                  Try Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-[200] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFinalScreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#87CEEB] z-[100] pointer-events-auto px-6 text-center overflow-hidden"
          >
            {/* New Dimension Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               {[...Array(20)].map((_, i) => (
                 <motion.div
                   key={i}
                   initial={{ 
                     y: (Math.random() * (window.innerHeight + 400)) - 200, 
                     x: Math.random() * window.innerWidth,
                     rotate: 0,
                     scale: Math.random() * 0.5 + 0.8
                   }}
                   animate={{ 
                     y: window.innerHeight + 200,
                     rotate: 720,
                   }}
                   transition={{ 
                     duration: 8 + Math.random() * 6, 
                     repeat: Infinity,
                     ease: "linear",
                   }}
                   className="absolute w-8 h-8 bg-white/40 voxel-shadow flex items-center justify-center text-white/60 font-black text-xl shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                 >
                    {Math.floor(Math.random() * 10) + 1}
                 </motion.div>
               ))}
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                filter: [
                  "drop-shadow(0 0 10px rgba(34,211,238,0.2))",
                  "drop-shadow(0 0 25px rgba(34,211,238,0.5))",
                  "drop-shadow(0 0 10px rgba(34,211,238,0.2))"
                ]
              }}
              transition={{ 
                type: "spring", 
                damping: 15, 
                stiffness: 100,
                filter: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative z-10"
            >
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-[0.2em] leading-tight flex flex-col items-center mb-8 relative">
                {/* Shine Overlay */}
                <motion.div 
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                  className="absolute inset-0 z-10 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] pointer-events-none"
                />
                <span className="bg-gradient-to-b from-white via-white to-cyan-200 bg-clip-text text-transparent">You</span>
                <span className="bg-gradient-to-b from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent opacity-90">Win!</span>
              </h2>
              <div className="flex flex-col items-center gap-4">
                <div className="text-[10px] text-white/60 font-black uppercase tracking-[0.4em]">Performance Rating</div>
                <div className="flex gap-2 text-3xl">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < rating.stars ? "text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]" : "text-white/20"}>
                      ★
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-white font-black uppercase tracking-[0.4em] bg-white/10 backdrop-blur-sm px-6 py-2 border border-white/20 mt-2">{rating.title}</div>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.3 }}
               className="mt-10 flex flex-row items-center justify-center gap-10 md:gap-16 relative z-10 px-8 py-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl"
            >
              <div className="text-center group">
                <p className="text-white/60 font-black uppercase text-[10px] tracking-[0.4em] mb-4 transition-colors group-hover:text-white/90">Final Score</p>
                <p className="text-white font-black text-5xl md:text-6xl tracking-tight leading-none group-hover:scale-105 transition-transform">
                  {score.toLocaleString()}
                </p>
              </div>
              <div className="w-px h-20 bg-white/20" />
              <div className="text-center group">
                <p className="text-white/60 font-black uppercase text-[10px] tracking-[0.4em] mb-4 transition-colors group-hover:text-white/90">Time Remaining</p>
                <p className="text-white font-black text-5xl md:text-6xl tracking-tight leading-none group-hover:scale-105 transition-transform">
                   {Math.floor(timeLeft / 60)}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="mt-12 w-full max-w-xs z-10"
            >
              <motion.button 
                  whileHover={{ 
                    scale: 1.02, 
                    backgroundColor: "rgb(255, 255, 255)",
                    boxShadow: "0 0 25px rgba(253, 224, 71, 0.5)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={restartGame}
                  className="w-full bg-white text-black font-black uppercase tracking-[0.2em] text-lg py-5 transition-all shadow-xl rounded-sm"
              >
                  Play Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aesthetic frame */}
      <div className="absolute inset-0 border-[24px] border-black/10 pointer-events-none z-0" />
    </div>
  );
};
