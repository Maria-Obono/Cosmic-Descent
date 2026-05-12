/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface VoxelPlayerProps {
  playerPosRef?: React.MutableRefObject<THREE.Vector3>;
  cameraActive?: boolean;
}

export const VoxelPlayer: React.FC<VoxelPlayerProps> = ({ playerPosRef, cameraActive = true }) => {
  const meshRef = useRef<THREE.Group>(null);
  const baseSpeed = 14; // Increased slightly for better feel
  const [position] = useState(() => new THREE.Vector3(0, 1.5, 15));
  const [targetPoint] = useState(() => new THREE.Vector3(0, 1.5, 15));
  
  // Reuse objects to avoid GC pressure
  const moveDir = useMemo(() => new THREE.Vector3(), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const intersection = useMemo(() => new THREE.Vector3(), []);
  const cameraTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Mouse control logic
    if (cameraActive && (state.pointer.x !== 0 || state.pointer.y !== 0)) {
      // Find where mouse intersects ground plane
      raycaster.setFromCamera(state.pointer, state.camera);
      raycaster.ray.intersectPlane(groundPlane, intersection);

      if ((window as any).isMouseDown) { // Global flag from VoxelWorld
        targetPoint.copy(intersection);
        targetPoint.y = 1.5;
        
        moveDir.subVectors(targetPoint, position);
        if (moveDir.length() > 0.1) {
          // Frame-rate independent movement
          const moveAmount = Math.min(moveDir.length(), baseSpeed * delta);
          moveDir.normalize().multiplyScalar(moveAmount);
          position.add(moveDir);
          
          // Rotation look towards target
          const angle = Math.atan2(moveDir.x, moveDir.z);
          // Frame-rate independent rotation lerp
          meshRef.current.rotation.y = THREE.MathUtils.lerp(
            meshRef.current.rotation.y, 
            angle, 
            1 - Math.exp(-15 * delta)
          );
        }
      }
    }

    // Sync ref
    if (playerPosRef) {
      playerPosRef.current.copy(position);
    }

    meshRef.current.position.copy(position);

    // Camera follow
    if (cameraActive) {
      cameraTarget.set(position.x, position.y + 12, position.z + 18);
      // Frame-rate independent camera lerp
      state.camera.position.lerp(cameraTarget, 1 - Math.exp(-5 * delta));
      state.camera.lookAt(position.x, position.y + 1, position.z - 2);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Body */}
      <Box args={[1, 1.2, 0.6]} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#FF5733" />
      </Box>
      {/* Head */}
      <Box args={[0.8, 0.8, 0.8]} position={[0, 1.6, 0]}>
        <meshStandardMaterial color="#FFDAB9" />
      </Box>
      {/* Eyes */}
      <Box args={[0.2, 0.2, 0.1]} position={[-0.2, 1.7, 0.4]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[0.2, 0.2, 0.1]} position={[0.2, 1.7, 0.4]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      {/* Legs */}
      <Box args={[0.4, 0.8, 0.4]} position={[-0.3, 0, 0]}>
        <meshStandardMaterial color="#3498DB" />
      </Box>
      <Box args={[0.4, 0.8, 0.4]} position={[0.3, 0, 0]}>
        <meshStandardMaterial color="#3498DB" />
      </Box>
    </group>
  );
};
