/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Float } from '@react-three/drei';
import * as THREE from 'three';

interface VoxelItemProps {
  position: [number, number, number];
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  onCollect: () => void;
  onDeliver: () => void;
  color?: string;
  id: string;
}

export const VoxelItem: React.FC<VoxelItemProps> = ({ 
  position, 
  playerPosRef, 
  onCollect, 
  onDeliver,
  color = "#00ffff",
  id 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [state, setState] = useState<'world' | 'carrying' | 'delivered'>('world');
  const itemPos = useMemo(() => new THREE.Vector3(...position), [position]);
  const centerPos = useMemo(() => new THREE.Vector3(0, 1.5, 0), []);

  useFrame((_, delta) => {
    if (state === 'delivered' || !meshRef.current) return;

    if (state === 'world') {
      // Simple collision detection for pickup
      const distance = itemPos.distanceTo(playerPosRef.current);

      if (distance < 1.5) {
        setState('carrying');
        onCollect();
      }
      meshRef.current.rotation.y += 3 * delta;
    } else if (state === 'carrying') {
      // Follow player with offset
      meshRef.current.position.copy(playerPosRef.current);
      meshRef.current.position.y += 2.5; 
      meshRef.current.rotation.y += 6 * delta;

      // Delivery check (near center [0, 0, 0])
      const distanceToCenter = playerPosRef.current.distanceTo(centerPos);
      if (distanceToCenter < 3) {
        setState('delivered');
        onDeliver();
      }
    }
  });

  if (state === 'delivered') return null;

  return (
    <group ref={meshRef} position={state === 'world' ? position : [0, 0, 0]}>
      <Float speed={5} rotationIntensity={1} floatIntensity={2}>
        {/* Core Jewel */}
        <Box args={[0.5, 0.5, 0.5]}>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </Box>
        {/* Outer Glow frame */}
        <Box args={[0.8, 0.8, 0.8]}>
          <meshStandardMaterial color={color} transparent opacity={0.2} />
        </Box>
      </Float>
    </group>
  );
};
