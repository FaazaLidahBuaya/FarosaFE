import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [usageType, setUsageType] = useState('rumahan');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [valErrors, setValErrors] = useState({});
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!name) errors.name = true;
    if (!email) errors.email = true;
    if (!password) errors.password = true;
    if (!phone) errors.phone = true;
    if (!address) errors.address = true;
    
    if (Object.keys(errors).length > 0) {
      setValErrors(errors);
      return;
    }
    setValErrors({});
    
    // Validasi domain email
    const allowedDomains = ['gmail.com', 'yahoo.com', 'yahoo.co.id', 'outlook.com', 'hotmail.com', 'icloud.com'];
    const emailDomain = email.split('@')[1];
    
    if (!allowedDomains.includes(emailDomain)) {
      setError('Harap gunakan email yang valid (seperti @gmail.com atau @yahoo.com)');
      return;
    }

    try {
      await register(name, email, password, phone, usageType, address, null);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Coba lagi.');
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center relative overflow-hidden py-10">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>

      <div className="glass-card p-8 w-full max-w-lg relative z-10">
        <h2 className="text-3xl font-display font-bold mb-6 text-center">Daftar Akun</h2>
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="off">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                value={name}
                autoComplete="new-password"
                onChange={(e) => {setName(e.target.value); setValErrors({...valErrors, name: false});}}
                className={`w-full bg-white/5 border rounded-lg p-2.5 text-white focus:outline-none ${valErrors.name ? 'border-red-500' : 'border-white/10 focus:border-primary'}`}
              />
              {valErrors.name && <p className="text-red-500 text-xs mt-1">wajib isi informasi ini</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nomor HP / WhatsApp</label>
              <input 
                type="text" 
                inputMode="numeric"
                value={phone}
                autoComplete="new-password"
                onChange={(e) => {setPhone(e.target.value.replace(/[^0-9]/g, '')); setValErrors({...valErrors, phone: false});}}
                className={`w-full bg-white/5 border rounded-lg p-2.5 text-white focus:outline-none ${valErrors.phone ? 'border-red-500' : 'border-white/10 focus:border-primary'}`}
                minLength="10"
                maxLength="14"
                placeholder="081234567890"
              />
              {valErrors.phone && <p className="text-red-500 text-xs mt-1">wajib isi informasi ini</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Pilih Kebutuhan Kamu<span className="text-red-400">*</span></label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'rumahan', label: 'Perumahan', icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                )},
                { value: 'apartemen', label: 'Apartemen', icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                )},
                { value: 'bisnis', label: 'Bisnis', icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.64-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                )}
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setUsageType(item.value)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer ${usageType === item.value ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}`}
                >
                  <div className={`p-2 rounded-lg transition-colors duration-300 ${usageType === item.value ? 'bg-primary/20 text-primary' : 'bg-white/10 text-gray-400'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs font-semibold transition-colors duration-300 ${usageType === item.value ? 'text-white' : 'text-gray-400'}`}>{item.label}</span>
                  {usageType === item.value && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Alamat Lengkap</label>
              <textarea 
                value={address}
                autoComplete="new-password"
                onChange={(e) => {setAddress(e.target.value); setValErrors({...valErrors, address: false});}}
                rows="2"
                className={`w-full bg-white/5 border rounded-lg p-2.5 text-white focus:outline-none resize-none ${valErrors.address ? 'border-red-500' : 'border-white/10 focus:border-primary'}`}
                placeholder="Jl. Contoh No.1, RT/RW, Kelurahan, Kecamatan"
              />
              {valErrors.address && <p className="text-red-500 text-xs mt-1">wajib isi informasi ini</p>}
            </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                autoComplete="new-password"
                onChange={(e) => {setEmail(e.target.value); setValErrors({...valErrors, email: false});}}
                className={`w-full bg-white/5 border rounded-lg p-2.5 text-white focus:outline-none ${valErrors.email ? 'border-red-500' : 'border-white/10 focus:border-primary'}`}
              />
              {valErrors.email && <p className="text-red-500 text-xs mt-1">wajib isi informasi ini</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                autoComplete="new-password"
                onChange={(e) => {setPassword(e.target.value); setValErrors({...valErrors, password: false});}}
                className={`w-full bg-white/5 border rounded-lg p-2.5 text-white focus:outline-none ${valErrors.password ? 'border-red-500' : 'border-white/10 focus:border-primary'}`}
                minLength="6"
              />
              {valErrors.password && <p className="text-red-500 text-xs mt-1">wajib isi informasi ini</p>}
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-primary to-accent py-3 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all mt-2">
            Buat Akun
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Sudah punya akun? <Link to="/login" className="text-primary hover:text-accent transition-colors">Masuk di sini</Link>
        </p>
        <Link to="/" className="block text-center text-xs text-gray-500 mt-3 hover:text-white">
          &larr; Kembali ke Beranda
        </Link>
      </div>
    </div>
    </PageTransition>
  );
};

export default RegisterPage;
