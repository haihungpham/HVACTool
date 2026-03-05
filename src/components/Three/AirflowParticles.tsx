'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Scenario } from '@/store/useProjectStore';

export const AirflowParticles = ({ scenario }: { scenario: Scenario }) => {
    const { length, width, height, diffusers } = scenario.geometry;
    const count = 500;

    const meshRef = useRef<THREE.Points>(null!);

    const [positions, velocities] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const vel = new Float32Array(count * 3);

        // Start particles at diffusers
        for (let i = 0; i < count; i++) {
            const diffuser = diffusers[i % diffusers.length] || { position: { x: 2.5, y: 2.8, z: 2 } };
            pos[i * 3] = diffuser.position.x - length / 2;
            pos[i * 3 + 1] = diffuser.position.y;
            pos[i * 3 + 2] = diffuser.position.z - width / 2;

            vel[i * 3] = (Math.random() - 0.5) * 0.02;
            vel[i * 3 + 1] = -0.05 - Math.random() * 0.05; // Air goes down from ceiling
            vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
        }
        return [pos, vel];
    }, [diffusers, count]);

    // The geometry is already dynamic as its attributes are updated in useFrame
    // and needsUpdate is set to true.
    const geometry = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return g;
    }, [positions]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const posAttr = meshRef.current.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < count; i++) {
            posAttr.array[i * 3] += velocities[i * 3];
            posAttr.array[i * 3 + 1] += velocities[i * 3 + 1];
            posAttr.array[i * 3 + 2] += velocities[i * 3 + 2];

            // Reset particles if they hit the floor or go out of bounds
            if (posAttr.array[i * 3 + 1] < 0 || Math.abs(posAttr.array[i * 3]) > length / 2 || Math.abs(posAttr.array[i * 3 + 2]) > width / 2) {
                const diffuser = diffusers[i % diffusers.length] || { position: { x: 2.5, y: 2.8, z: 2 } };
                posAttr.array[i * 3] = diffuser.position.x - length / 2;
                posAttr.array[i * 3 + 1] = diffuser.position.y;
                posAttr.array[i * 3 + 2] = diffuser.position.z - width / 2;
            }
        }
        posAttr.needsUpdate = true;
    });

    return (
        <points ref={meshRef} geometry={geometry}>
            <pointsMaterial
                size={0.05}
                color="#06b6d4"
                transparent
                opacity={0.4}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    );
};
