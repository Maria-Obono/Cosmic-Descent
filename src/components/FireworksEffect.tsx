/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';

const Particle: React.FC<{ color: string; position: [number, number, number]; velocity: THREE.Vector3 }> = ({ color, position, velocity }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => new THREE.Vector3(...position), [position]);
  const vel = useMemo(() => velocity.clone(), [velocity]);

  useFrame(() => {
    if (!meshRef.current) return;
    pos.add(vel);
    vel.y -= 0.005; // gravity
    meshRef.current.position.copy(pos);
    meshRef.current.rotation.x += 0.1;
    meshRef.current.rotation.y += 0.1;
    
    // Fade out
    if (meshRef.current.material instanceof THREE.Material) {
        meshRef.current.material.opacity -= 0.01;
    }
  });

  return (
    <Box ref={meshRef} args={[0.2, 0.2, 0.2]} position={position}>
      <meshStandardMaterial color={color} transparent opacity={1} emissive={color} emissiveIntensity={2} />
    </Box>
  );
};

const Firework: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  const particles = useMemo(() => {
    const p = [];
    for (let i = 0; i < 30; i++) {
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.2) * 0.5,
        (Math.random() - 0.5) * 0.4
      );
      p.push({ id: i, velocity });
    }
    return p;
  }, []);

  return (
    <group>
      {particles.map((p) => (
        <Particle key={p.id} color={color} position={position} velocity={p.velocity} />
      ))}
    </group>
  );
};

export const FireworksEffect: React.FC = () => {
    const fireworks = useMemo(() => {
        const f = [];
        for (let i = 0; i < 8; i++) {
            f.push({
                id: i,
                position: [(Math.random() - 0.5) * 30, 5 + Math.random() * 10, (Math.random() - 0.5) * 30] as [number, number, number],
                color: ["#ff00ff", "#00ffff", "#ffff00", "#ff0000", "#ffffff"][Math.floor(Math.random() * 5)],
                delay: i * 500
            });
        }
        return f;
    }, []);

    const [visibleCount, setVisibleCount] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setVisibleCount(prev => (prev < fireworks.length ? prev + 1 : prev));
        }, 800);
        return () => clearInterval(interval);
    }, [fireworks.length]);

    return (
        <group>
            {fireworks.slice(0, visibleCount).map((f) => (
                <Firework key={f.id} position={f.position} color={f.color} />
            ))}
        </group>
    );
};
