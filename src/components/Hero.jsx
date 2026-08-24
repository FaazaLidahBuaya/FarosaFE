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

        {/* Floating Badges - Compact & Non-overlapping on Mobile & Desktop */}
        <div className="absolute top-[66%] sm:top-[58%] md:top-[60%] left-2 sm:left-6 md:left-8 glass-card p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl max-w-[125px] sm:max-w-[170px] md:max-w-[210px] text-left border border-white/10 bg-black/50 backdrop-blur-xl shadow-xl z-20 transition-transform duration-300 hover:scale-105">
          <p className="text-[10px] sm:text-xs text-gray-400 mb-1 flex justify-between items-center font-medium">
            <span className="truncate">Low Latency</span>
            <span className="bg-white/20 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[9px] sm:text-xs flex-shrink-0 ml-1">&#8599;</span>
          </p>
          <p className="text-white font-bold text-base sm:text-xl md:text-2xl leading-tight">{'<'} 10ms</p>
          <p className="text-[9px] sm:text-[11px] text-gray-400 mt-1 truncate">Gaming lancar & stabil</p>
        </div>

        <div className="absolute top-[78%] sm:top-[70%] md:top-[70%] right-2 sm:right-6 md:right-8 glass-card p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl max-w-[125px] sm:max-w-[170px] md:max-w-[200px] text-left border border-white/10 bg-black/50 backdrop-blur-xl shadow-xl z-20 transition-transform duration-300 hover:scale-105">
          <p className="text-[10px] sm:text-xs text-gray-400 mb-1 flex justify-between items-center font-medium">
            <span className="truncate">Ultra Speed</span>
            <span className="bg-white/20 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[9px] sm:text-xs flex-shrink-0 ml-1">&#8599;</span>
          </p>
          <p className="text-white font-bold text-sm sm:text-lg md:text-xl leading-tight">Up to 1Gbps</p>
          <div className="w-full bg-white/15 h-1 sm:h-1.5 mt-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-accent w-[96%] h-full rounded-full"></div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
