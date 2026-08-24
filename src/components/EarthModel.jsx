import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function EarthModel(props) {
  const { scene } = useGLTF('/earthfix.glb');
  const earthTexture = useTexture('/earthfix_texture.jpg');
  const earthRef = useRef();

  // State untuk drag manual
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          map: earthTexture,
          color: new THREE.Color(0.3, 0.3, 0.3) 
        });
        
        earthTexture.colorSpace = THREE.SRGBColorSpace;
        earthTexture.flipY = false;
        // Membalik tekstur secara horizontal karena petanya ter-mirror (timur jadi barat)
        earthTexture.wrapS = THREE.RepeatWrapping;
        earthTexture.repeat.x = -1;
        earthTexture.offset.x = 1;
      }
    });
  }, [scene, earthTexture]);

  useFrame((state, delta) => {
    if (earthRef.current) {
      if (!isDragging) {
        // Rotasi otomatis saat tidak di-drag
        earthRef.current.rotation.y += delta * 0.02; 
        
        // Sinkronisasi target rotation agar saat mulai drag tidak loncat
        setTargetRotation({
          x: earthRef.current.rotation.x,
          y: earthRef.current.rotation.y
        });
      } else {
        // Rotasi manual dengan lerp agar mulus (easing) - HANYA SUMBU Y (Kiri-Kanan)
        earthRef.current.rotation.y += (targetRotation.y - earthRef.current.rotation.y) * 0.1;
      }
    }
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      e.stopPropagation();
      const deltaX = e.clientX - lastPos.x;
      // deltaY diabaikan karena tidak boleh putar atas-bawah
      
      setTargetRotation(prev => ({
        ...prev,
        y: prev.y + deltaX * 0.01
      }));
      
      setLastPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <group 
      {...props} 
      dispose={null} 
      ref={earthRef} 
      scale={[0.05, 0.05, 0.05]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOut={handlePointerUp}
    >
      <primitive object={scene} rotation={[0, 0, Math.PI]} />
    </group>
  );
}

useGLTF.preload('/earthfix.glb');
useTexture.preload('/earthfix_texture.jpg');
