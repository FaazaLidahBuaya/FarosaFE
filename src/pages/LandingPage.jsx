import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Pricing from '../components/Pricing';
import Info from '../components/Info';
import Scene from '../components/Scene';
import LocationModal from '../components/LocationModal';
import FloatingChatbot from '../components/FloatingChatbot';

const LandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userCity, setUserCity] = useState(null);
  const [showRocket, setShowRocket] = useState(true);
  const [isShockwaving, setIsShockwaving] = useState(false);

  useEffect(() => {
    // Tampilkan modal jika user belum pernah memilih kota
    const savedCity = localStorage.getItem('userCity');
    if (!savedCity) {
      setIsModalOpen(true);
    } else {
      setUserCity(JSON.parse(savedCity));
    }
  }, []);

  const handleCitySelected = (city) => {
    setUserCity(city);
    setIsModalOpen(false);
  };

  return (
    <div className="relative">
      <style>{`
        @keyframes shockwave {
          0% { transform: scale(1); opacity: 1; border-width: 20px; }
          100% { transform: scale(100); opacity: 0; border-width: 0px; }
        }
      `}</style>
      <LocationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCitySelected={handleCitySelected}
      />
      <Scene showRocket={showRocket} />
      <Navbar userCity={userCity} onOpenModal={() => setIsModalOpen(true)} />
      <Hero />
      <Pricing />
      <Info />
      
      <FloatingChatbot />

      {/* Shockwave Effect Layer */}
      {isShockwaving && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-4 h-4 rounded-full border-[20px] border-primary/80 animate-[shockwave_0.8s_ease-out_forwards]"></div>
        </div>
      )}

      {/* Rocket Toggle Button */}
      <button 
        onClick={() => {
          if (showRocket) {
            setIsShockwaving(true);
            setTimeout(() => {
              setShowRocket(false);
              setIsShockwaving(false);
            }, 600);
          } else {
            setShowRocket(true);
          }
        }}
        className="fixed bottom-6 right-[5.5rem] z-40 w-12 h-12 rounded-full bg-black/60 border border-white/20 text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-black/80 group"
        title={showRocket ? "Sembunyikan Roket 3D" : "Tampilkan Roket 3D"}
      >
        <svg className={`w-5 h-5 transition-colors group-hover:text-primary ${showRocket ? "text-gray-300" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
      </button>

      <footer className="relative z-10 border-t border-white/10 py-8 bg-[#070709]">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          &copy; {new Date().getFullYear()} Farosa WiFi. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

