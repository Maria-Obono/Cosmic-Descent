/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Float } from '@react-three/drei';
import * as THREE from 'three';

interface VoxelCoinProps {
  position: [number, number, number];
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  onCollect: () => void;
  id: string;
}

export const VoxelCoin: React.FC<VoxelCoinProps> = ({ 
  position, 
  playerPosRef, 
  onCollect,
  id 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [isCollected, setIsCollected] = useState(false);
  const itemPos = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((_, delta) => {
    if (isCollected || !meshRef.current) return;

    // Fast spin - frame-rate independent
    meshRef.current.rotation.y += 5 * delta;

    // Proximity Detection
    const distance = itemPos.distanceTo(playerPosRef.current);

    if (distance < 1.8) {
      setIsCollected(true);
      onCollect();
    }
  });

  if (isCollected) return null;

  return (
    <group ref={meshRef} position={position}>
      <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Voxel Coin Shape (Gold) */}
        <Box args={[0.8, 0.8, 0.2]}>
          <meshStandardMaterial color="#FFD700" emissive="#FFA500" emissiveIntensity={1} />
        </Box>
        {/* Inner detail */}
        <Box args={[0.4, 0.4, 0.25]} position={[0, 0, 0]}>
           <meshStandardMaterial color="#FFFACD" />
        </Box>
      </Float>
    </group>
  );
};
