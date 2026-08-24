import React, { useRef, useEffect, Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, Stars, SpotLight } from '@react-three/drei';
import RocketModel from './RocketModel';
import EarthModel from './EarthModel';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useFrame } from '@react-three/fiber';

gsap.registerPlugin(ScrollTrigger);

const BackgroundStars = () => {
  const starsRef = useRef();
  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y -= delta * 0.02;
      starsRef.current.rotation.x -= delta * 0.01;
    }
  });
  return (
    <group ref={starsRef}>
      <Stars radius={100} depth={50} count={400} factor={4} saturation={0} fade speed={1.5} />
    </group>
  );
};

const Scene = ({ showRocket = true }) => {
  const ctxRef = useRef(null);
  const [rocketObj, setRocketObj] = useState(null);
  const [earthObj, setEarthObj] = useState(null);

  useEffect(() => {
    if (rocketObj && earthObj) {
      if (ctxRef.current) return;
      
      const mm = gsap.matchMedia();
      ctxRef.current = mm;

      // --- MOBILE (HP) ROCKET ANIMATIONS ---
      mm.add("(max-width: 767px)", () => {
        // 1. HERO -> PAKET UNGGULAN (Sedikit ke Kiri)
        gsap.timeline({
          scrollTrigger: { trigger: "#pricing", start: "top bottom", end: "top 20%", scrub: 1.5 }
        })
        .fromTo(rocketObj.position, { x: 0, y: -1, z: 3 }, { x: -1.1, y: -2, z: 4, ease: "power2.inOut" }, 0)
        .fromTo(rocketObj.rotation, { x: 0.5, y: -1.2, z: 0.3 }, { x: -0.2, y: -0.8, z: 0.3, ease: "power2.inOut" }, 0);

        // 1.5. PAKET UNGGULAN -> PILIHAN PAKET (Ke Kanan yang Pas)
        gsap.timeline({
          scrollTrigger: { trigger: "#pilihan-paket", start: "top 95%", end: "top 5%", scrub: 1.5 }
        })
        .fromTo(rocketObj.position, { x: -1.1, y: -2, z: 4 }, { x: 1.5, y: -0.5, z: 3.5, ease: "power2.inOut", immediateRender: false }, 0)
        .fromTo(rocketObj.rotation, { x: -0.2, y: -0.8, z: 0.3 }, { x: 0.3, y: 0.8, z: -0.3, ease: "power2.inOut", immediateRender: false }, 0);

        // 2. PILIHAN PAKET -> INFO
        gsap.timeline({
          scrollTrigger: { trigger: "#info", start: "top 95%", end: "center center", scrub: 1.5 }
        })
        .fromTo(rocketObj.position, { x: 1.5, y: -0.5, z: 3.5 }, { x: 3.5, y: 2, z: 2, ease: "power2.inOut", immediateRender: false }, 0)
        .fromTo(rocketObj.rotation, { x: 0.3, y: 0.8, z: -0.3 }, { x: 0.5, y: -0.5, z: 0.2, ease: "power2.inOut", immediateRender: false }, 0);
      });

      // --- DESKTOP ROCKET ANIMATIONS ---
      mm.add("(min-width: 768px)", () => {
        // 1. HERO -> PRICING
        gsap.timeline({
          scrollTrigger: { trigger: "#pricing", start: "top bottom", end: "top 20%", scrub: 1.5 }
        })
        .fromTo(rocketObj.position, { x: 0, y: -1, z: 3 }, { x: 3, y: -2, z: 4, ease: "power2.inOut" }, 0)
        .fromTo(rocketObj.rotation, { x: 0.5, y: -1.2, z: 0.3 }, { x: -0.2, y: 1.2, z: -0.5, ease: "power2.inOut" }, 0);

        // 1.5. PRICING -> PILIHAN PAKET
        gsap.timeline({
          scrollTrigger: { trigger: "#pilihan-paket", start: "top 95%", end: "top 5%", scrub: 1.5 }
        })
        .fromTo(rocketObj.position, { x: 3, y: -2, z: 4 }, { x: -3, y: 0, z: 3, ease: "power2.inOut", immediateRender: false }, 0)
        .fromTo(rocketObj.rotation, { x: -0.2, y: 1.2, z: -0.5 }, { x: 0.4, y: 0.3, z: 0.2, ease: "power2.inOut", immediateRender: false }, 0);

        // 2. PILIHAN PAKET -> INFO
        gsap.timeline({
          scrollTrigger: { trigger: "#info", start: "top 95%", end: "center center", scrub: 1.5 }
        })
        .fromTo(rocketObj.position, { x: -3, y: 0, z: 3 }, { x: 5, y: 2, z: 2, ease: "power2.inOut", immediateRender: false }, 0)
        .fromTo(rocketObj.rotation, { x: 0.4, y: 0.3, z: 0.2 }, { x: 0.5, y: -0.5, z: 0.2, ease: "power2.inOut", immediateRender: false }, 0);
      });

      // --- EARTH ANIMATIONS (All Screens) ---
      gsap.timeline({
        scrollTrigger: { trigger: "#info", start: "top bottom", end: "center center", scrub: 1.5 }
      })
      .fromTo(earthObj.position, { x: -30, y: 0, z: -5 }, { x: -5, y: 0, z: 0, ease: "power2.out" }, 0);
    }

    return () => {
      if (ctxRef.current) {
        ctxRef.current.revert();
        ctxRef.current = null;
      }
    };
  }, [rocketObj, earthObj]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const t1 = setTimeout(refresh, 500);
    const t2 = setTimeout(refresh, 1500);
    const t3 = setTimeout(refresh, 3000);

    return () => {
      window.removeEventListener('load', refresh);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <fog attach="fog" args={['#070709', 5, 20]} />
        <ambientLight intensity={0.1} />

        <SpotLight position={[-10, 10, 5]} angle={1.2} penumbra={1} intensity={15} distance={40} color="#ffffff" castShadow volumetric={true} attenuation={15} anglePower={5} opacity={0.5} />
        <directionalLight position={[10, -5, -5]} intensity={1.5} color="#4f46e5" />

        <BackgroundStars />

        <group ref={setRocketObj}>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Suspense fallback={null}>
              {showRocket && <RocketModel />}
            </Suspense>
          </Float>
        </group>

        <group ref={setEarthObj}>
          <Float speed={1} rotationIntensity={0.1} floatIntensity={0.5}>
            <Suspense fallback={null}>
              <EarthModel />
            </Suspense>
          </Float>
        </group>

        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};

export default Scene;

