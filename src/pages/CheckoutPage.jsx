import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { package: selectedPackage } = location.state || {};
  const { user } = useContext(AuthContext);
  
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQris, setShowQris] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  // Jika tidak ada paket yang dipilih, kembalikan ke home
  useEffect(() => {
    if (!selectedPackage) {
      navigate('/');
    }
  }, [selectedPackage, navigate]);

  if (!selectedPackage) return null;

  const handlePaymentClick = () => {
    if (paymentMethod === 'QRIS') {
      setShowQris(true);
    } else {
      processPayment();
    }
  };

  const processPayment = () => {
    setShowQris(false);
    setIsProcessing(true);
    // Simulasi proses pembayaran 2 detik
    setTimeout(() => {
      setIsProcessing(false);
      setShowReceipt(true); // Tampilkan struk
    }, 2000);
  };

  const handleContinueToCS = () => {
    // Pindah ke Beranda dengan instruksi membuka chatbot
    navigate('/', { state: { openChatbotWithOrder: selectedPackage } });
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedPrice = typeof selectedPackage.price === 'number' 
    ? selectedPackage.price.toLocaleString('id-ID') 
    : selectedPackage.price;

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Khusus untuk print struk */}
      <style>
        {`
          @media print {
            @page { margin: 20mm; }
            body { background: white !important; }
            body * { visibility: hidden; }
            #receipt-card, #receipt-card * { visibility: visible; }
            #receipt-card { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%; 
              max-width: 100%;
              box-shadow: none !important; 
              border: none !important;
              padding: 0 !important;
            }
            .no-print { display: none !important; }
          }
        `}
      </style>

      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen no-print"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[150px] pointer-events-none no-print"></div>

      <div className="no-print"><Navbar /></div>
      
      <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4 relative z-10">
        
        {!showQris && !showReceipt ? (
          /* 1. Checkout Card (Animasi Fade In) */
          <div className="max-w-md w-full glass-card bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl animate-fadeIn no-print">
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">Selesaikan Pembayaran</h2>
              <p className="text-gray-400 text-sm">Anda akan membeli langganan paket internet Farosa.</p>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Ringkasan Pesanan</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">{selectedPackage.name} {selectedPackage.speed ? `(${selectedPackage.speed} Mbps)` : ''}</span>
                <span className="text-accent font-bold">Rp {formattedPrice}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4 pb-4 border-b border-white/10">
                <span>Biaya Instalasi</span>
                <span>Gratis</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Total Pembayaran</span>
                <span className="text-xl font-bold text-primary">Rp {formattedPrice}</span>
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Metode Pembayaran</h3>
              <div className="grid grid-cols-3 gap-3">
                {['Bank', 'E-Wallet', 'QRIS'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all border ${
                      paymentMethod === method 
                        ? 'border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                        : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handlePaymentClick}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                isProcessing ? 'bg-primary/50 cursor-wait' : 'bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:-translate-y-1'
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Memproses...
                </>
              ) : (
                <>
                  Bayar Rp {formattedPrice}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </>
              )}
            </button>
            
            <p className="text-center text-xs text-gray-500 mt-4">Setelah pembayaran berhasil, Anda akan dialihkan untuk konfirmasi data.</p>
          </div>
        ) : showQris && !showReceipt ? (
          
          /* 2. QRIS Simulation Modal */
          <div className="max-w-md w-full glass-card bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl animate-fadeIn no-print text-center">
            <h2 className="text-2xl font-display font-bold text-white mb-2">Scan QRIS</h2>
            <p className="text-gray-400 text-sm mb-8">Silakan scan kode QR di bawah menggunakan aplikasi E-Wallet atau M-Banking Anda.</p>
            
            <div className="bg-white p-4 rounded-2xl inline-block mb-8">
              {/* Fake QR Code Image (Placeholder) */}
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FarosaWifiSimulation" 
                alt="QRIS Code" 
                className="w-48 h-48 mx-auto"
              />
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-200">
                Karena ini adalah simulasi, Anda tidak perlu benar-benar membayar. Klik tombol di bawah untuk melanjutkan pura-pura sukses bayar. 😉
              </p>
            </div>

            <button 
              onClick={processPayment}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                isProcessing ? 'bg-primary/50 cursor-wait' : 'bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]'
              }`}
            >
              {isProcessing ? 'Memproses...' : 'Lanjut (Simulasi Sukses)'}
            </button>
            <button 
              onClick={() => setShowQris(false)}
              disabled={isProcessing}
              className="w-full mt-4 py-3 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Kembali
            </button>
          </div>
          
        ) : (
          
          /* 3. Struk Pembelian Profesional */
          <div id="receipt-card" className="max-w-lg w-full bg-white text-gray-900 rounded-2xl p-0 shadow-2xl relative animate-fadeIn transform transition-all overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary to-accent no-print"></div>
            
            {/* Header Struk */}
            <div className="p-8 pb-4 border-b border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">FAROSA<span className="text-primary">WIFI</span></h1>
                  <p className="text-xs text-gray-500 mt-1">PT Farosa Internet Digital<br/>Jl. Teknologi No. 45, Jakarta Selatan</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    LUNAS
                  </div>
                  <p className="text-xs text-gray-500 font-mono">INV-{Math.floor(Math.random() * 1000000)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4 flex justify-between border border-gray-100">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Ditagihkan Kepada:</p>
                  <p className="text-sm font-bold text-gray-800">{user ? user.name : 'Pelanggan Farosa'}</p>
                  <p className="text-xs text-gray-600">{user ? user.email : '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Tanggal Bayar:</p>
                  <p className="text-sm font-bold text-gray-800">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-xs text-gray-600">Metode: {paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Rincian Produk */}
            <div className="p-8 py-6">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3 border-b border-gray-200 pb-2">Rincian Layanan</p>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-base font-bold text-gray-900">{selectedPackage.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Kategori: {selectedPackage.category} &bull; Kecepatan: {selectedPackage.speed ? `${selectedPackage.speed} Mbps` : 'Up to 1 Gbps'}</p>
                  <ul className="mt-3 space-y-1.5">
                    <li className="text-xs text-gray-600 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Biaya Registrasi & Instalasi (Gratis)</li>
                    <li className="text-xs text-gray-600 flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Peminjaman Modem Router (Gratis)</li>
                  </ul>
                </div>
                <p className="text-sm font-bold text-gray-900">Rp {formattedPrice}</p>
              </div>

              {/* Total Calculation */}
              <div className="border-t border-gray-200 pt-3 mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-800">Rp {formattedPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">PPN (11%)</span>
                  <span className="font-medium text-gray-800">Sudah Termasuk</span>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-300">
                  <span className="font-bold text-gray-900 uppercase text-xs tracking-wider">Total Pembayaran</span>
                  <span className="text-2xl font-black text-primary">Rp {formattedPrice}</span>
                </div>
              </div>
            </div>

            {/* Ketentuan */}
            <div className="bg-gray-50 p-8 py-5 text-[10px] text-gray-500 leading-relaxed border-t border-gray-100">
              <p className="font-bold text-gray-700 mb-1.5 text-xs">Syarat & Ketentuan Layanan:</p>
              <ul className="list-disc pl-3 space-y-1">
                <li>Pembayaran ini merupakan biaya berlangganan untuk bulan pertama.</li>
                <li>Invoice ini sah dan diterbitkan secara otomatis oleh sistem Farosa WiFi.</li>
                <li>Biaya yang sudah dibayarkan tidak dapat dikembalikan (non-refundable) apabila pembatalan dilakukan sepihak oleh pelanggan setelah teknisi tiba di lokasi pemasangan.</li>
                <li>Layanan internet akan aktif selambat-lambatnya 2x24 jam setelah proses konfirmasi Customer Service selesai.</li>
              </ul>
              <p className="mt-4 text-center text-gray-400">Terima kasih telah mempercayakan koneksi digital Anda kepada Farosa WiFi.</p>
            </div>

            {/* Actions (Hidden on Print) */}
            <div className="p-6 bg-white border-t border-gray-100 flex gap-3 no-print">
              <button 
                onClick={handlePrint}
                className="w-14 h-14 rounded-xl flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors shrink-0"
                title="Print Struk"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              </button>
              
              <button 
                onClick={handleContinueToCS}
                className="flex-1 py-4 rounded-xl font-bold text-white bg-gray-900 hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Lanjutkan Konfirmasi CS
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="relative z-10 border-t border-white/10 py-6 bg-black/20 backdrop-blur-md no-print">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Farosa WiFi. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CheckoutPage;
