import React from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

const Hero = () => {
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    gsap.to(window, { 
      duration: 1.5,
      scrollTo: { y: `#${targetId}`, offsetY: 0 }, 
      ease: "power3.inOut" 
    });
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-20 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center">
        
        <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight leading-tight mb-6">
          Internet Cepat, <br />
          <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Tanpa Batas</span>
        </h1>
        <p className="text-gray-200 text-base md:text-lg mb-8 max-w-lg mx-auto font-medium drop-shadow-md leading-relaxed">
          Rasakan pengalaman menjelajah dunia digital dengan kecepatan cahaya dan stabilitas tinggi bersama Farosa WiFi.
        </p>
        
        <div className="flex gap-4 mb-24">
          <a href="#pricing" onClick={(e) => handleSmoothScroll(e, 'pricing')} className="bg-white text-black px-8 py-3 rounded-full font-medium transition-all hover:bg-gray-200">
            Mulai Berlangganan
          </a>
        </div>

        {/* Floating Badges */}
        <div className="absolute top-[60%] left-[10%] md:left-[5%] glass-card p-6 md:p-7 rounded-2xl max-w-[220px] text-left border border-white/10 bg-black/40 backdrop-blur-xl">
          <p className="text-sm text-gray-400 mb-2 flex justify-between items-center">
            Low Latency
            <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs">&#8599;</span>
          </p>
          <p className="text-white font-bold text-2xl">{'<'} 10ms</p>
          <p className="text-xs text-gray-400 mt-2">Koneksi gaming stabil</p>
        </div>

        <div className="absolute top-[70%] right-[10%] md:right-[5%] glass-card p-5 rounded-2xl max-w-[200px] text-left border border-white/10 bg-black/40 backdrop-blur-xl">
          <p className="text-xs text-gray-400 mb-2 flex justify-between">
            Ultra Speed
            <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">&#8599;</span>
          </p>
          <p className="text-white font-bold text-xl">Up to 1Gbps</p>
          <div className="w-full bg-white/10 h-1 mt-3 rounded-full overflow-hidden">
            <div className="bg-white w-[96%] h-full"></div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
