import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const LocationModal = ({ isOpen, onClose, onCitySelected }) => {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the component is mounted before setting isVisible to trigger transition
      setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden'; // Kunci scroll halaman belakang
      
      axios.get('http://localhost:5000/api/cities')
        .then(res => setCities(res.data))
        .catch(err => console.error("Gagal memuat kota", err));
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset'; // Buka kunci scroll
    }

    return () => {
      document.body.style.overflow = 'unset'; // Pastikan scroll kembali normal saat komponen hancur
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(search.toLowerCase()) || 
    city.province.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (city) => {
    setSelectedCity(city);
    setIsDropdownOpen(false);
    localStorage.setItem('userCity', JSON.stringify(city));
    
    // Mulai animasi fade-out
    setIsVisible(false);
    
    // Tunggu animasi selesai baru tutup modal sepenuhnya
    setTimeout(() => {
      if (onCitySelected) {
        onCitySelected(city);
      } else {
        onClose();
      }
    }, 400); 
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#070709]/80 backdrop-blur-md p-4 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Modal Container - Dark Glassmorphism */}
      <div className={`glass-card rounded-[32px] w-full max-w-md p-8 shadow-[0_0_50px_rgba(79,70,229,0.15)] relative border border-white/10 bg-black/40 backdrop-blur-2xl transition-all duration-500 transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        
        {/* Ikon Futuristik Pengganti Ilustrasi */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-primary/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent"></div>
            <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold font-display text-center mb-2 text-white drop-shadow-md">Atur lokasi pemasangan dulu, ya!</h2>
        <p className="text-gray-400 text-center text-sm mb-8 font-medium">
          Tentukan lokasi Anda dan dapatkan penawaran terbaiknya
        </p>

        {/* Input Form */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Kota Pemasangan<span className="text-accent ml-1">*</span>
          </label>
          
          <div 
            className="w-full border border-white/20 rounded-xl px-4 py-3 flex justify-between items-center cursor-text bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md"
            onClick={() => setIsDropdownOpen(true)}
          >
            <input 
              type="text"
              placeholder="Ketik atau pilih kota..."
              className="w-full outline-none text-white bg-transparent placeholder-gray-500 font-medium"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsDropdownOpen(true);
              }}
              onClick={() => setIsDropdownOpen(true)}
            />
            <svg className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180 text-primary' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>

          {/* Custom Dropdown List - Dark Theme */}
          {isDropdownOpen && (
            <div className="absolute w-full mt-2 bg-[#0c0c10]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-h-64 overflow-y-auto z-10 custom-scrollbar">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <div 
                    key={city._id} 
                    className="flex items-center px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-all group"
                    onClick={() => handleSelect(city)}
                  >
                    {/* Icon Pin Map */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 group-hover:bg-primary/20 flex items-center justify-center mr-4 transition-colors">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-200 group-hover:text-white text-sm transition-colors">{city.name}</p>
                      <p className="text-gray-500 group-hover:text-gray-300 text-xs transition-colors">{city.province}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  Kota tidak ditemukan
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LocationModal;
