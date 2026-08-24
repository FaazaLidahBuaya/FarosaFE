import { API_BASE_URL } from '../config';
﻿import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PackageDetailModal from './PackageDetailModal';

gsap.registerPlugin(ScrollToPlugin);



const Pricing = () => {
  const [packages, setPackages] = useState([]);
  const [category, setCategory] = useState('Semua');
  const [userCity, setUserCity] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [priceFilter, setPriceFilter] = useState(null);
  const [selectedSpeeds, setSelectedSpeeds] = useState([]);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCity = localStorage.getItem('userCity');
    if (savedCity) {
      setUserCity(JSON.parse(savedCity));
    }
    axios.get(`${API_BASE_URL}/api/packages`)
      .then(res => setPackages(res.data))
      .catch(err => console.error("Gagal memuat paket", err));
  }, []);

  const categories = ['Semua', 'Promo', 'Internet', 'Internet + Movie', 'Internet + Game', 'Internet + TV'];

  const filteredPackages = packages.filter(pkg => {
    // 1. Kategori Filter
    if (category !== 'Semua' && pkg.category !== category) return false;
    
    // 2. Filter Kecepatan (Multi-select)
    if (selectedSpeeds.length > 0 && !selectedSpeeds.includes(pkg.speed)) return false;

    // 3. Filter Harga
    if (priceFilter) {
      if (priceFilter === '< Rp300.000' && pkg.price >= 300000) return false;
      if (priceFilter === 'Rp300.000 - Rp499.999' && (pkg.price < 300000 || pkg.price >= 500000)) return false;
      if (priceFilter === 'Rp500.000 - Rp1.000.000' && (pkg.price < 500000 || pkg.price > 1000000)) return false;
      if (priceFilter === '> Rp1.000.000' && pkg.price <= 1000000) return false;
    }

    return true;
  });

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const handlePackageSelectFromModal = (pkg) => {
    if (!user) {
      alert("Silakan masuk (login) terlebih dahulu untuk membeli paket.");
      navigate('/login');
      return;
    }
    setSelectedPackage(null);
    
    // Arahkan ke halaman checkout
    navigate('/checkout', { state: { package: pkg } });
  };

  const toggleSpeed = (speedStr) => {
    const speedVal = parseInt(speedStr);
    if (selectedSpeeds.includes(speedVal)) {
      setSelectedSpeeds(selectedSpeeds.filter(s => s !== speedVal));
    } else {
      setSelectedSpeeds([...selectedSpeeds, speedVal]);
    }
  };

  return (
    <section id="pricing" className="py-20 relative z-10">
      
      {/* Modal Detail Paket */}
      <PackageDetailModal 
        isOpen={!!selectedPackage}
        pkg={selectedPackage}
        onClose={() => setSelectedPackage(null)}
        onSelect={handlePackageSelectFromModal}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BAGIAN 1: 3 Paket Standar (Highlight) */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 font-display text-white">Paket Internet Unggulan</h2>
          <p className="text-gray-400">Pilihan paket terfavorit yang paling banyak digunakan pelanggan kami.</p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-24">
          {packages.filter(p => p.badge && p.badge !== '').slice(0, 3).map((pkg, idx) => (
            <div key={pkg._id} className={`glass-card p-6 relative border-primary shadow-[0_0_30px_rgba(79,70,229,0.2)] transform md:-translate-y-4`}>
              <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${pkg.badge === 'Paling Populer' ? 'bg-gradient-to-r from-primary to-accent' : pkg.badge === 'Paling Murah' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
                {pkg.badge}
              </div>
              <h3 className="text-xl font-bold mb-1 text-white">{pkg.name}</h3>
              <div className="text-2xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                {formatRupiah(pkg.price)} <span className="text-xs text-gray-500 font-normal">/bulan</span>
              </div>
              <div className="text-sm text-primary font-bold mb-6">{pkg.speed} Mbps</div>
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feat, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-300">
                    <svg className="w-4 h-4 mr-3 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <button onClick={() => handlePackageSelectFromModal(pkg)} className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]">
                Pilih Paket
              </button>
            </div>
          ))}
          {packages.filter(p => p.badge && p.badge !== "").length === 0 && (
            <div className="col-span-3 text-center py-8 text-gray-400">
              Belum ada paket unggulan yang tersedia saat ini.
            </div>
          )}
        </div>

        {/* BAGIAN 2: Filter Paket Lengkap */}
        <div id="pilihan-paket" className="text-center mb-12 scroll-mt-24 pt-8">
          <h2 className="text-3xl font-bold mb-4 font-display text-white">Eksplorasi Semua Pilihan Paket</h2>
          <p className="text-gray-400">Pilih kecepatan dan layanan tambahan yang sesuai dengan gaya hidup digital Anda.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT SIDEBAR: Filters (Versi Dark Mode Glassmorphism) */}
          <div className="lg:w-1/4 w-full">
            <div className="glass-card p-6 border border-white/10 bg-black/40 backdrop-blur-md rounded-2xl sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Filter Paket</h3>
                {(priceFilter || selectedSpeeds.length > 0) && (
                  <button onClick={() => { setPriceFilter(null); setSelectedSpeeds([]); }} className="text-xs text-primary hover:text-white transition-colors">Reset</button>
                )}
              </div>
              
              {/* Filter Harga (Tunggal / Radio) */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Harga</h4>
                <div className="space-y-3">
                  {['< Rp300.000', 'Rp300.000 - Rp499.999', 'Rp500.000 - Rp1.000.000', '> Rp1.000.000'].map((price, idx) => (
                    <label key={idx} className="flex items-center space-x-3 cursor-pointer group" onClick={() => setPriceFilter(priceFilter === price ? null : price)}>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${priceFilter === price ? 'border-primary' : 'border-gray-500 group-hover:border-primary'}`}>
                        {priceFilter === price && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                      </div>
                      <span className={`text-sm transition-colors ${priceFilter === price ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>{price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Kecepatan (Multi-select / Checkbox) */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Kecepatan</h4>
                <div className="space-y-3">
                  {['50 Mbps', '75 Mbps', '100 Mbps', '150 Mbps', '200 Mbps', '300 Mbps'].map((speed, idx) => {
                    const isSelected = selectedSpeeds.includes(parseInt(speed));
                    return (
                      <label key={idx} className="flex items-center space-x-3 cursor-pointer group" onClick={() => toggleSpeed(speed)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-gray-500 group-hover:border-primary'}`}>
                          {isSelected && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          )}
                        </div>
                        <span className={`text-sm transition-colors ${isSelected ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>{speed}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              
            </div>
          </div>

          {/* RIGHT SIDE: Packages Layout */}
          <div className="lg:w-3/4 w-full">
            
            {/* Lokasi Pemasangan Banner */}
            <div className="glass-card flex items-center justify-between p-4 px-6 mb-6 rounded-2xl border border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Atur lokasi pemasangan</p>
                  <p className="text-gray-400 text-xs">{userCity ? `${userCity.name}, ${userCity.province}` : 'Pilih kota terlebih dahulu'}</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>

            {/* Categories Menu */}
            <div className="flex space-x-3 overflow-x-auto custom-scrollbar pb-4 mb-2">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setCategory(cat)}
                  className={`relative overflow-hidden flex-shrink-0 px-6 py-2 rounded-full font-medium text-sm transition-all duration-300 group border ${
                    category === cat 
                      ? 'border-primary text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' 
                      : 'bg-white/5 border-white/10 text-gray-300'
                  }`}
                >
                  <span 
                    className={`absolute inset-0 transition-transform duration-300 ease-out origin-left ${
                      category === cat 
                        ? 'bg-primary scale-x-100' 
                        : 'bg-primary/40 scale-x-0 group-hover:scale-x-100'
                    }`}
                  ></span>
                  
                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                    {cat}
                  </span>
                </button>
              ))}
            </div>

            {/* Sorting & Result Count */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-400">
                Menampilkan <span className="text-white font-bold">{filteredPackages.length} Hasil</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Urutkan</span>
                <select className="bg-[#0f0f13] border border-white/10 text-white text-sm rounded-lg px-3 py-1 outline-none focus:border-primary">
                  <option>Paling Sesuai</option>
                  <option>Harga Terendah</option>
                  <option>Harga Tertinggi</option>
                </select>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6 flex items-start">
              <svg className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="text-sm text-blue-200">Ketersediaan dan harga paket menyesuaikan kota pemasangan. Harga belum termasuk pajak dan biaya instalasi.</p>
            </div>

            {/* Package Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <div key={pkg._id} className="glass-card rounded-2xl p-6 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">{pkg.category}</p>
                          <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-accent">{formatRupiah(pkg.price)}</p>
                          <p className="text-xs text-gray-500">/bulan</p>
                        </div>
                      </div>
                      <div className="mb-6">
                        <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-md text-sm font-bold border border-primary/30">
                          {pkg.speed} Mbps
                        </span>
                      </div>
                      
                      {pkg.features && pkg.features.length > 0 && (
                        <div className="mb-6">
                          <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Keuntungan Ekstra:</p>
                          <ul className="space-y-2">
                            {pkg.features.map((feat, i) => (
                              <li key={i} className="flex items-start text-sm text-gray-300">
                                <svg className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                {feat}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => setSelectedPackage(pkg)}
                      className="block w-full text-center py-3 rounded-xl font-medium transition-colors border border-primary text-primary hover:bg-primary hover:text-white mt-auto"
                    >
                      Lihat Detail & Pilih
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 glass-card border border-white/5 rounded-2xl">
                  <p className="text-gray-400">Belum ada paket yang tersedia untuk kategori ini.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

