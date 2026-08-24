import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

export default function RocketModel(props) {
  const { nodes, materials } = useGLTF('/rocket.glb');
  
  // Memaksa material roket agar mengkilap (bisa memantulkan cahaya)
  useEffect(() => {
    if (materials) {
      Object.values(materials).forEach((material) => {
        // Semakin mendekati 0, semakin licin/kaca (memantulkan cahaya)
        material.roughness = 0.1;
        // Semakin mendekati 1, semakin bersifat logam
        material.metalness = 0.8;
        material.needsUpdate = true;
      });
    }
  }, [materials]);

  return (
    <group {...props} dispose={null} scale={[2, 2, 2]}>
      <primitive object={nodes.Scene || nodes.scene} />
    </group>
  );
}

useGLTF.preload('/rocket.glb');

