import React, { useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';

export default function RocketModel(props) {
  const { nodes, materials } = useGLTF('/rocket.glb');
  const [scale, setScale] = useState([2, 2, 2]);

  // Responsive scale based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        // Much smaller on mobile
        setScale([0.9, 0.9, 0.9]);
      } else if (window.innerWidth < 1024) {
        // Medium on tablet
        setScale([1.3, 1.3, 1.3]);
      } else {
        // Full size on desktop
        setScale([2, 2, 2]);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
    <group {...props} dispose={null} scale={props.scale || scale}>
      <primitive object={nodes.Scene || nodes.scene} />
    </group>
  );
}

useGLTF.preload('/rocket.glb');
