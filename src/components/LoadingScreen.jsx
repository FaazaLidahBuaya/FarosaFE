import React, { useEffect, useState } from 'react';

const LoadingScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => onFinish(), 600);
          }, 300);
          return 100;
        }
        // Accelerating progress
        const increment = prev < 60 ? 3 : prev < 90 ? 2 : 1;
        return Math.min(prev + increment, 100);
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[200] bg-[#070709] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[120px]"></div>
      
      {/* Logo */}
      <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-8 font-display relative z-10">
        Farosa
      </h1>
      
      {/* Loading bar */}
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative z-10">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Loading text */}
      <p className="text-gray-500 text-xs mt-4 relative z-10 tracking-widest uppercase">
        {progress < 100 ? 'Memuat...' : 'Selamat Datang'}
      </p>
    </div>
  );
};

export default LoadingScreen;