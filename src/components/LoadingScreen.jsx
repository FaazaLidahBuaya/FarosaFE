import React, { useEffect, useState } from 'react';

const LoadingScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Quick, smooth transition
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => onFinish && onFinish(), 500);
    }, 800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[999] bg-[#070709]/80 backdrop-blur-2xl flex flex-col items-center justify-center transition-all duration-500 pointer-events-none select-none ${
        fadeOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      <style>{`
        @keyframes lightSweep {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(250%) skewX(-25deg); }
        }
      `}</style>

      {/* Ambient background glow */}
      <div className="absolute w-72 h-72 bg-primary/25 rounded-full blur-[100px] animate-pulse"></div>

      {/* Glass card with sweeping light beam */}
      <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-8 px-10 shadow-2xl flex flex-col items-center gap-4">
        {/* The Sweeping Light Beam */}
        <div 
          className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
          style={{ animation: 'lightSweep 1.5s infinite ease-in-out' }}
        />

        {/* Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-xl shadow-[0_0_20px_rgba(79,70,229,0.5)]">
            F
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-display">
            Farosa <span className="text-primary font-normal">WiFi</span>
          </span>
        </div>

        {/* Minimalist Shimmer Bar */}
        <div className="w-36 h-1 bg-white/10 rounded-full overflow-hidden relative z-10 mt-1">
          <div 
            className="w-full h-full bg-gradient-to-r from-primary via-cyan-400 to-accent rounded-full"
            style={{ animation: 'lightSweep 1.2s infinite ease-in-out' }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;