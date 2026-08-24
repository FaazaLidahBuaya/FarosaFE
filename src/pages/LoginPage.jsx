import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PageTransition from '../components/PageTransition';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [valErrors, setValErrors] = useState({});
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!email) errors.email = true;
    if (!password) errors.password = true;
    if (Object.keys(errors).length > 0) {
      setValErrors(errors);
      return;
    }
    setValErrors({});
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Coba lagi.');
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]"></div>

      <div className="glass-card p-10 w-full max-w-md relative z-10">
        <h2 className="text-3xl font-display font-bold mb-6 text-center">Masuk</h2>
        {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-5" noValidate autoComplete="off">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              autoComplete="new-password"
              onChange={(e) => { setEmail(e.target.value); setValErrors({...valErrors, email: false}); }}
              className={`w-full bg-white/5 border rounded-lg p-3 text-white focus:outline-none ${valErrors.email ? 'border-red-500' : 'border-white/10 focus:border-primary'}`}
            />
            {valErrors.email && <p className="text-red-500 text-xs mt-1">wajib isi informasi ini</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              autoComplete="new-password"
              onChange={(e) => { setPassword(e.target.value); setValErrors({...valErrors, password: false}); }}
              className={`w-full bg-white/5 border rounded-lg p-3 text-white focus:outline-none ${valErrors.password ? 'border-red-500' : 'border-white/10 focus:border-primary'}`}
            />
            {valErrors.password && <p className="text-red-500 text-xs mt-1">wajib isi informasi ini</p>}
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-primary to-accent py-3 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all">
            Masuk Sekarang
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Belum punya akun? <Link to="/register" className="text-primary hover:text-accent transition-colors">Daftar di sini</Link>
        </p>
        <Link to="/" className="block text-center text-xs text-gray-500 mt-4 hover:text-white">
          &larr; Kembali ke Beranda
        </Link>
      </div>
    </div>
    </PageTransition>
  );
};

export default LoginPage;