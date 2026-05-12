/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Box, Sky, Float } from '@react-three/drei';
import * as THREE from 'three';

interface EnvironmentProps {
  countdown: number;
}

export const Environment: React.FC<EnvironmentProps> = ({ countdown }) => {
  // Theme selection based on countdown
  const theme = useMemo(() => {
    switch(countdown) {
      case 10: return { ground: "#567d46", decorations: "forest", sky: "day", fog: "#87CEEB" }; // Grassland
      case 9: return { ground: "#E3C985", decorations: "desert", sky: "sunset", fog: "#f4a460" }; // Desert
      case 8: return { ground: "#ffffff", decorations: "snow", sky: "day", fog: "#e0f6ff" }; // Snow
      case 7: return { ground: "#1d4a23", decorations: "dense-forest", sky: "day", fog: "#0a2a12" }; // Forest
      case 6: return { ground: "#332211", decorations: "cave", sky: "night", fog: "#000000" }; // Cave
      case 5: return { ground: "#0077be", decorations: "island", sky: "twilight", fog: "#48cae4" }; // Ocean
      case 4: return { ground: "#222222", decorations: "lava", sky: "final", fog: "#631d1d" }; // Volcanic
      case 3: return { ground: "#111111", decorations: "city", sky: "night", fog: "#00ffff" }; // Futuristic City
      case 2: return { ground: "#050505", decorations: "space", sky: "night", fog: "#000000" }; // Space
      case 1: return { ground: "#4815AA", decorations: "mystical", sky: "twilight", fog: "#ff00ff" }; // Final Mystical
      default: return { ground: "#567d46", decorations: "forest", sky: "day", fog: "#87CEEB" };
    }
  }, [countdown]);

  // Generate random static trees/rocks only once, but filter based on theme later
  const decorPositions = useMemo(() => {
    const items = [];
    for (let i = 0; i < 60; i++) {
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 80;
        if (Math.abs(x) > 10 || Math.abs(z) > 10) {
            items.push({ 
                x, 
                z, 
                type: Math.random() > 0.6 ? 'tree' : 'rock',
                size: 0.5 + Math.random() * 1.5
            });
        }
    }
    return items;
  }, []);

  // Theme specific decorations memoization
  const cityBuildings = useMemo(() => {
    return Array.from({ length: 15 }).map(() => ({
      args: [2, 10 + Math.random() * 20, 2] as [number, number, number],
      position: [(Math.random() - 0.5) * 60, 0, (Math.random() - 0.5) * 60] as [number, number, number]
    }));
  }, []);

  const asteroids = useMemo(() => {
    return Array.from({ length: 10 }).map(() => ({
      position: [(Math.random() - 0.5) * 40, 5 + Math.random() * 10, (Math.random() - 0.5) * 40] as [number, number, number]
    }));
  }, []);

  const mysticalParticles = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      position: [(Math.random() - 0.5) * 40, Math.random() * 20, (Math.random() - 0.5) * 40] as [number, number, number]
    }));
  }, []);

  return (
    <group>
      <fog attach="fog" args={[theme.fog, 20, 100]} />
      {/* Voxel Sun/Moon */}
      <group position={[100, 80, 50]}>
         <Box args={[10, 10, 10]}>
            <meshStandardMaterial 
                color={theme.decorations === 'space' ? '#ffffff' : '#fff000'} 
                emissive={theme.decorations === 'space' ? '#888888' : '#ffcc00'} 
                emissiveIntensity={5} 
            />
         </Box>
      </group>
      
      {/* Dynamic Sky */}
      <Sky 
        sunPosition={
            theme.sky === 'day' ? [100, 20, 100] : 
            theme.sky === 'sunset' ? [100, 2, 10] : 
            theme.sky === 'night' ? [0, -100, 0] : 
            [100, 100, 100]
        }
        turbidity={theme.sky === 'night' ? 10 : 0.1}
        rayleigh={theme.sky === 'night' ? 0.2 : 0.5}
      />
      
      {/* Ambient and Sunlight */}
      <ambientLight intensity={theme.sky === 'night' ? 0.2 : 0.8} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />

      {/* Main Ground */}
      <Box args={[120, 1, 120]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color={theme.ground} />
      </Box>

      {/* Central Pedestal */}
      <group position={[0, 0, 0]}>
        <Box args={[8, 0.4, 8]} position={[0, 0.2, 0]}>
          <meshStandardMaterial color="#222222" />
        </Box>
        <Box args={[6, 0.2, 6]} position={[0, 0.5, 0]}>
          <meshStandardMaterial color={theme.decorations === 'mystical' ? '#ff00ff' : '#444444'} />
        </Box>
        {/* Glow indicator */}
        <Box args={[5.8, 0.1, 5.8]} position={[0, 0.65, 0]}>
          <meshStandardMaterial color={theme.decorations === 'mystical' ? '#00ffff' : '#ffcc00'} emissive={theme.decorations === 'mystical' ? '#00ffff' : '#ffcc00'} emissiveIntensity={2} transparent opacity={0.5} />
        </Box>
      </group>

      {/* Grid helper for voxel feel */}
      <gridHelper args={[120, 60, 0x000000, 0x000000]} position={[0, 0.01, 0]}>
        <meshBasicMaterial attach="material" transparent opacity={0.05} />
      </gridHelper>

      {/* Theme specific decorations */}
      {decorPositions.map((pos, i) => {
        // Simple culling based on stage
        if (theme.decorations === 'lava' && pos.type === 'tree') return null;
        if (theme.decorations === 'space' && pos.type === 'tree') return null;
        
        return (
          <group key={`decor-${i}`} position={[pos.x, 0, pos.z]}>
            {pos.type === 'tree' ? (
              <group scale={pos.size}>
                <Box args={[0.5, 2, 0.5]} position={[0, 1, 0]}>
                    <meshStandardMaterial color="#4a2f1b" />
                </Box>
                <Box args={[2, 2, 2]} position={[0, 2.5, 0]}>
                    <meshStandardMaterial 
                        color={
                            theme.decorations === 'snow' ? '#ffffff' : 
                            theme.decorations === 'mystical' ? '#ff00ff' : '#1d4a23'
                        } 
                    />
                </Box>
              </group>
            ) : (
                <Box args={[pos.size, pos.size * 0.5, pos.size]} position={[0, pos.size * 0.25, 0]}>
                    <meshStandardMaterial 
                        color={
                            theme.decorations === 'lava' ? '#ff4400' : 
                            theme.decorations === 'city' ? '#00ffff' :
                            theme.decorations === 'mystical' ? '#ffffff' : '#888888'
                        } 
                        emissive={theme.decorations === 'city' ? '#00ffff' : '#000000'}
                        emissiveIntensity={theme.decorations === 'city' ? 2 : 0}
                    />
                </Box>
            )}
          </group>
        );
      })}

      {/* Futuristic City / Tower Accents */}
      {theme.decorations === 'city' && (
          <group>
              {cityBuildings.map((b, i) => (
                  <Box 
                    key={`building-${i}`} 
                    args={b.args} 
                    position={b.position}
                  >
                      <meshStandardMaterial color="#222" emissive="#00ffff" emissiveIntensity={0.1} />
                  </Box>
              ))}
          </group>
      )}

      {/* Space Gravity feel */}
      {theme.decorations === 'space' && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
           {asteroids.map((a, i) => (
               <Box 
                key={`asteroid-${i}`}
                args={[2, 2, 2]} 
                position={a.position}
               >
                   <meshStandardMaterial color="#333" />
               </Box>
           ))}
        </Float>
      )}

      {/* Final stage mystical particles */}
      {theme.decorations === 'mystical' && (
         <group>
            {mysticalParticles.map((p, i) => (
                <Float key={`particle-${i}`} speed={5} floatIntensity={4}>
                    <Box 
                        args={[0.3, 0.3, 0.3]} 
                        position={p.position}
                    >
                        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={5} />
                    </Box>
                </Float>
            ))}
         </group>
      )}
    </group>
  );
};
