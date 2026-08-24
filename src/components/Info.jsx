import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Komponen penghitung angka otomatis saat di-scroll
const Counter = ({ end, duration = 2, suffix = "", prefix = "", decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);

  useEffect(() => {
    const obj = { val: 0 };
    
    const st = ScrollTrigger.create({
      trigger: counterRef.current,
      start: "top 85%", // Mulai animasi saat elemen mencapai 85% dari layar
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: end,
          duration: duration,
          ease: "power2.out",
          onUpdate: () => {
            setCount(obj.val);
          }
        });
      }
    });

    return () => st.kill();
  }, [end, duration]);

  return (
    <span ref={counterRef}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
};

const Info = () => {
  return (
    <section id="info" className="py-24 relative z-10 overflow-hidden pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row items-center">
          {/* Space for the 3D Earth on the left */}
          <div className="w-full md:w-1/2 min-h-[400px]"></div>
          
          {/* Text Content on the Right */}
          <div className="w-full md:w-1/2 mt-12 md:mt-0 flex flex-col gap-4 relative z-10 pointer-events-auto">
            {/* Box 1: Description */}
            <div className="glass-card p-6 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/30"></div>
              <h2 className="text-4xl font-display font-bold text-white mb-1">FAROSA</h2>
              <h3 className="text-xl font-bold text-primary mb-4">Koneksi Tanpa Batas</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Kami hadir untuk menghubungkan seluruh pelosok Indonesia dengan kecepatan internet yang stabil dan andal. Dengan teknologi satelit dan fiber optik terbaru, kami memastikan pengalaman digital Anda selalu maksimal.
              </p>
            </div>
            
            {/* Box 2-5: Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 flex flex-col justify-center items-center text-center hover:border-primary/50 hover:bg-white/5 transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-3xl font-extrabold text-white mb-1">
                  <Counter end={1.5} decimals={1} suffix="M+" />
                </p>
                <p className="text-xs text-gray-400 font-medium">Pengguna Aktif</p>
              </div>
              <div className="glass-card p-4 flex flex-col justify-center items-center text-center hover:border-primary/50 hover:bg-white/5 transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-3xl font-extrabold text-white mb-1">
                  <Counter end={182} decimals={0} />
                </p>
                <p className="text-xs text-gray-400 font-medium">Kota Terjangkau</p>
              </div>
              <div className="glass-card p-4 flex flex-col justify-center items-center text-center hover:border-primary/50 hover:bg-white/5 transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-3xl font-extrabold text-white mb-1">
                  <Counter end={99.9} decimals={1} suffix="%" />
                </p>
                <p className="text-xs text-gray-400 font-medium">Uptime Jaringan</p>
              </div>
              <div className="glass-card p-4 flex flex-col justify-center items-center text-center hover:border-primary/50 hover:bg-white/5 transition-all duration-300 transform hover:-translate-y-1">
                <p className="text-3xl font-extrabold text-white mb-1">
                  <Counter end={24} decimals={0} suffix="/7" />
                </p>
                <p className="text-xs text-gray-400 font-medium">Dukungan Teknis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Info;
