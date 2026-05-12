/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Box } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type VoxelMap = number[][];

// 5x7 voxel grid for each number
const DIGITS: Record<number, VoxelMap> = {
  0: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  1: [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  2: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  3: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  4: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
  ],
  5: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  6: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  7: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
  ],
  8: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  9: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
};

interface VoxelNumberProps {
  number: number;
  color?: string;
  position?: [number, number, number];
  isExploding?: boolean;
}

const ExplodingVoxel: React.FC<{ 
  position: [number, number, number], 
  color: string, 
  isExploding: boolean 
}> = ({ position, color, isExploding }) => {
  const meshRef = React.useRef<THREE.Group>(null);
  const velocity = useMemo(() => new THREE.Vector3(
    (Math.random() - 0.5) * 0.4,
    (Math.random() - 0.2) * 0.4,
    (Math.random() - 0.5) * 0.4
  ), []);

  useFrame(() => {
    if (isExploding && meshRef.current) {
      meshRef.current.position.add(velocity);
      meshRef.current.rotation.x += 0.1;
      meshRef.current.rotation.y += 0.1;
      // Gravity simulation
      velocity.y -= 0.005;
    } else if (!isExploding && meshRef.current) {
        // Reset position if not exploding (or keep as is if we swap components)
        // Usually handled by parent re-render
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial color={color} />
      </Box>
    </group>
  );
};

export const VoxelNumber: React.FC<VoxelNumberProps> = ({ number, color = "#FFD700", position = [0, 0, 0], isExploding = false }) => {
  const renderDigit = (digit: number, offset: number) => {
    const map = DIGITS[digit] || DIGITS[0];
    const voxels: any[] = [];
    
    map.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val === 1) {
          const actualY = 6 - y;
          voxels.push(
            <ExplodingVoxel 
              key={`voxel-${digit}-${offset}-${x}-${y}`}
              position={[x + offset, actualY, 0]}
              color={color}
              isExploding={isExploding}
            />
          );
        }
      });
    });
    return voxels;
  };

  const digits = number.toString().split('').map(Number);
  const spacing = 6;

  return (
    <group position={position}>
      {digits.map((digit, i) => (
        <group key={`digit-group-${i}`} position={[i * spacing - (digits.length * spacing) / 2 + 0.5, 0, 0]}>
          {renderDigit(digit, 0)}
        </group>
      ))}
    </group>
  );
};
