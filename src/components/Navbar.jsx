import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import FarosaLogo from '../assets/Farosa.jpeg';

gsap.registerPlugin(ScrollToPlugin);

const Navbar = ({ userCity, onOpenModal }) => {
  const { user, logout } = useContext(AuthContext);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [myInstallations, setMyInstallations] = useState([]);
  const [loadingInst, setLoadingInst] = useState(false);
  const [profileClosing, setProfileClosing] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);

  const openProfile = () => {
    setProfileClosing(false);
    setShowProfileModal(true);
    // Double RAF ensures browser has mounted the DOM before applying transition classes
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setProfileVisible(true);
      });
    });
  };

  const closeProfile = () => {
    setProfileClosing(true);
    setProfileVisible(false);
    setTimeout(() => {
      setShowProfileModal(false);
      setProfileClosing(false);
    }, 350);
  };

  
    useEffect(() => {
    if (showProfileModal) {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      const preventDefault = (e) => {
        const modal = document.getElementById('profile-modal-container');
        if (modal && modal.contains(e.target)) {
          return;
        }
        e.preventDefault();
      };

      window.addEventListener('wheel', preventDefault, { passive: false });
      window.addEventListener('touchmove', preventDefault, { passive: false });

      if (user) {
        const fetchMyInstallations = async () => {
          setLoadingInst(true);
          try {
            const res = await axios.get(`http://localhost:5000/api/installations?userId=${user._id}`);
            setMyInstallations(res.data.data || []);
          } catch (error) {
            console.error("Error fetching installations", error);
          }
          setLoadingInst(false);
        };
        fetchMyInstallations();
      }

      return () => {
        const top = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        window.removeEventListener('wheel', preventDefault);
        window.removeEventListener('touchmove', preventDefault);
        if (top) {
          window.scrollTo(0, -parseInt(top || '0', 10));
        }
      };
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [showProfileModal, user]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setIsUpdating(true);
    setPassMsg({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/auth/change-password', { oldPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPassMsg({ type: 'success', text: res.data.message });
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Gagal mengubah password' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    gsap.to(window, { 
      duration: 1.5,
      scrollTo: { y: `#${targetId}`, offsetY: 0 }, 
      ease: "power3.inOut"
    });
  };

  return (
    <>
    <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-[#070709]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <img src={FarosaLogo} alt="Farosa WiFi" className="h-10 md:h-12 w-10 md:w-12 object-cover rounded-md aspect-square" />
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#hero" onClick={(e) => handleSmoothScroll(e, 'hero')} className="relative group px-3 py-2 text-sm font-medium text-white hover:text-primary transition-colors">
                Beranda
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#pricing" onClick={(e) => handleSmoothScroll(e, 'pricing')} className="relative group px-3 py-2 text-sm font-medium text-white hover:text-primary transition-colors">
                Paket Unggulan
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#pilihan-paket" onClick={(e) => handleSmoothScroll(e, 'pilihan-paket')} className="relative group px-3 py-2 text-sm font-medium text-white hover:text-primary transition-colors">
                Pilihan Paket
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#info" onClick={(e) => handleSmoothScroll(e, 'info')} className="relative group px-3 py-2 text-sm font-medium text-white hover:text-primary transition-colors">
                Tentang Kami
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onOpenModal} 
              className="flex items-center space-x-2 bg-white/5 border border-white/20 hover:bg-white/10 hover:border-primary text-white px-5 py-2 rounded-full font-medium transition-all group"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm max-w-[150px] truncate">
                {userCity ? userCity.name : 'Pilih Lokasi'}
              </span>
            </button>
            
            {user ? (
                <div className="flex items-center space-x-4">
                  {user.role !== 'user' && (
                    <Link to="/admin" className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/50 hover:bg-primary hover:text-white transition-all">
                      Admin Panel
                    </Link>
                  )}
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1.5 pr-3 rounded-full transition-colors"
                    onClick={openProfile}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(79,70,229,0.3)]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-300 hidden sm:block font-medium">{user.name.split(' ')[0]}</span>
                  </div>
                  <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full">Logout</button>
                </div>
              ) : (
              <Link to="/login" className="bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] text-white px-5 py-2 rounded-full font-bold text-sm transition-all">
                Masuk
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>

      {/* Profile Modal */}
      {showProfileModal && (
        <div 
          onClick={closeProfile}
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
            profileVisible && !profileClosing ? 'bg-black/60 backdrop-blur-md opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
          }`}
        >
          {/* macOS Style Window Container */}
          <div 
            id="profile-modal-container" 
            onClick={(e) => e.stopPropagation()}
            className={`bg-[#0e0e12]/95 border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              profileVisible && !profileClosing 
                ? 'opacity-100 scale-100 translate-y-0 translate-x-0' 
                : 'opacity-0 scale-90 -translate-y-4 translate-x-8'
            }`}
            style={{ transformOrigin: 'calc(100% - 60px) 20px' }}
          >
            {/* Header Tetap / Sticky Header dengan tombol Close */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10 bg-[#0d0d12] z-20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <span className="font-bold text-white text-lg block leading-tight">Informasi Akun & WiFi</span>
                  <span className="text-xs text-gray-400">Portal Pengaturan Pelanggan</span>
                </div>
              </div>
              <button 
                onClick={closeProfile} 
                className="text-gray-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer shadow-sm border border-white/5"
                title="Tutup"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 overflow-y-auto flex flex-col md:flex-row gap-6 w-full flex-1">
              {/* Kolom Kiri: Profil & Ganti Password */}
              <div className="w-full md:w-1/2 flex flex-col">
                <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profil Saya
                </h2>
                
                <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Nama Lengkap</p>
                    <p className="text-white font-medium text-sm">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <p className="text-white font-medium text-sm">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Role Akun</p>
                    <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Ganti Password
                </h3>
                {passMsg.text && (
                  <div className={`p-3 rounded-xl mb-4 text-xs font-medium ${passMsg.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}`}>
                    {passMsg.text}
                  </div>
                )}
                <form onSubmit={handleChangePassword} className="space-y-3.5" noValidate autoComplete="off">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Password Lama</label>
                    <input 
                      type="password"
                      value={oldPassword}
                      autoComplete="new-password"
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Password Baru</label>
                    <input 
                      type="password"
                      value={newPassword}
                      autoComplete="new-password"
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                      required
                      minLength="6"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={!oldPassword || !newPassword || isUpdating}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] disabled:opacity-50 text-white py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer"
                  >
                    {isUpdating ? 'Menyimpan...' : 'Simpan Password Baru'}
                  </button>
                </form>
              </div>

              {/* Kolom Kanan: Status WiFi */}
              <div className="w-full md:w-1/2 flex flex-col border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6">
                {user?.role === 'user' ? (
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                      Status WiFi Saya
                    </h3>
                    {loadingInst ? (
                      <div className="text-gray-400 text-sm py-4">Memuat status WiFi...</div>
                    ) : myInstallations.length > 0 ? (
                      <div className="space-y-4 w-full pr-1 pb-4">
                        {myInstallations.map(inst => (
                          <div key={inst._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="text-xs text-gray-400">Paket Terpilih</div>
                                <div className="font-bold text-white text-base">{inst.selectedPackage}</div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                inst.status === 'Aktif' || inst.status === 'Selesai' ? 'bg-green-500/15 border-green-500/30 text-green-300' :
                                inst.status === 'Ditolak' ? 'bg-red-500/15 border-red-500/30 text-red-300' :
                                'bg-orange-500/15 border-orange-500/30 text-orange-300'
                              }`}>
                                {inst.status}
                              </div>
                            </div>
                            
                            <div className="mt-3 space-y-2.5">
                              <div>
                                <div className="text-[11px] text-gray-400 mb-0.5">Estimasi / Jadwal Selesai</div>
                                <div className="text-xs text-gray-200 font-medium">
                                  {inst.installationDate 
                                    ? new Date(inst.installationDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                    : (inst.status === 'Pending' || inst.status === 'Dikonfirmasi' || inst.status === 'Survey Lokasi' 
                                        ? 'Menunggu konfirmasi jadwal teknisi...' 
                                        : 'Dalam proses')}
                                </div>
                              </div>
                              
                              {/* Progress Tracker Bar */}
                              <div className="pt-2 pb-1">
                                <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(79,70,229,0.8)]" 
                                    style={{
                                      width: inst.status === 'Pending' ? '20%' :
                                             inst.status === 'Dikonfirmasi' ? '40%' :
                                             inst.status === 'Survey Lokasi' ? '65%' :
                                             inst.status === 'Proses Pasang' ? '85%' :
                                             (inst.status === 'Aktif' || inst.status === 'Selesai') ? '100%' : '0%'
                                    }}
                                  ></div>
                                </div>
                                
                                <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
                                  <span className={inst.status === 'Pending' ? 'text-primary font-bold' : ''}>Pending</span>
                                  <span className={inst.status === 'Survey Lokasi' ? 'text-primary font-bold' : ''}>Survey</span>
                                  <span className={inst.status === 'Proses Pasang' ? 'text-primary font-bold' : ''}>Pasang</span>
                                  <span className={inst.status === 'Aktif' || inst.status === 'Selesai' ? 'text-green-400 font-bold' : ''}>Aktif</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                        <div className="text-gray-400 text-sm mb-3">Belum ada pengajuan WiFi aktif untuk akun ini.</div>
                        <Link to="/checkout" onClick={closeProfile} className="inline-block bg-primary/20 text-primary border border-primary/40 hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                          Pilih & Ajukan Paket &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                    <span className="text-xs text-gray-400 block mb-2">Akun Administrator / Staf</span>
                    <p className="text-sm text-white font-medium mb-3">Anda memiliki hak akses penuh ke panel kontrol sistem.</p>
                    <Link to="/admin" onClick={closeProfile} className="inline-block bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all">
                      Buka Admin Panel &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
