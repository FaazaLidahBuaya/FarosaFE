import React, { useState, useEffect } from 'react';

const PackageDetailModal = ({ isOpen, onClose, pkg, onSelect }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
      setIsTermsOpen(false); // Selalu reset tutup saat dibuka
      document.body.style.overflow = 'hidden'; // Kunci scroll halaman belakang
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset'; // Buka kunci scroll
    }

    return () => {
      document.body.style.overflow = 'unset'; // Pastikan scroll kembali normal saat komponen hancur
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 400);
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  // Kalkulasi estimasi jumlah perangkat berdasarkan kecepatan
  const getDeviceEstimate = (speed) => {
    if (speed <= 50) return "3-5 Perangkat";
    if (speed <= 100) return "5-10 Perangkat";
    if (speed <= 200) return "10-15 Perangkat";
    return ">15 Perangkat";
  };

  if (!isOpen || !pkg) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#070709]/80 backdrop-blur-md p-4 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Modal Container */}
      <div className={`glass-card rounded-[24px] w-full max-w-lg bg-[#0c0c10]/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(79,70,229,0.2)] flex flex-col max-h-[75vh] transition-all duration-500 transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        
        {/* Header Section */}
        <div className="p-5 pb-3 border-b border-white/10 relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <p className="text-gray-400 text-[11px] mb-1">{pkg.category}</p>
          <h2 className="text-lg font-bold text-white mb-3 pr-8 leading-tight">{pkg.name}</h2>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-extrabold text-white">{pkg.speed} <span className="text-sm text-primary">Mbps</span></p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-accent">{formatRupiah(pkg.price)}</p>
              <p className="text-[11px] text-gray-500">/bulan</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Info Perangkat */}
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <div className="flex items-center text-gray-300">
              <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <span className="font-semibold text-xs">Jumlah Perangkat Ideal</span>
            </div>
            <span className="font-bold text-white text-xs">{getDeviceEstimate(pkg.speed)}</span>
          </div>

          {/* Keuntungan Ekstra */}
          {pkg.features && pkg.features.length > 0 && (
            <div className="py-3 border-b border-white/10">
              <h3 className="font-semibold text-white mb-2 text-xs">Layanan Tambahan</h3>
              <ul className="space-y-1.5">
                {pkg.features.map((feat, i) => (
                  <li key={i} className="flex items-start text-xs text-gray-300">
                    <svg className="w-3.5 h-3.5 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Syarat & Ketentuan Accordion */}
          <div className="py-3">
            <button 
              className="flex justify-between items-center w-full text-left font-semibold text-white text-xs group"
              onClick={() => setIsTermsOpen(!isTermsOpen)}
            >
              <span>Syarat dan Ketentuan</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:text-white ${isTermsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${isTermsOpen ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
              <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-gray-400">
                <li>Harga yang tercantum belum termasuk Pajak Pertambahan Nilai (PPN) 11%.</li>
                <li>Kecepatan internet yang didapatkan adalah *up to* (maksimal) dan bergantung pada kondisi jaringan di lokasi.</li>
                <li>Pelanggan dikenakan Biaya Pemasangan Baru (PSB) sesuai dengan ketentuan promo yang berlaku, dibayarkan setelah proses pemasangan selesai.</li>
                <li>Ketersediaan paket dan harga dapat berbeda di setiap kota sesuai dengan kebijakan zonasi.</li>
                <li>Modem dan perangkat pendukung berstatus dipinjamkan dan wajib dikembalikan jika berhenti berlangganan.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-5 pt-3 border-t border-white/10 bg-black/20 rounded-b-[24px]">
          <button 
            onClick={() => onSelect(pkg)}
            className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-2.5 text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transform hover:-translate-y-1"
          >
            Pilih Paket
          </button>
        </div>

      </div>
    </div>
  );
};

export default PackageDetailModal;
