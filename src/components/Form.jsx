import { API_BASE_URL } from '../config';
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Form = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    fullAddress: '',
    selectedPackage: '20 Mbps',
    notes: ''
  });
  
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phoneNumber: user.phone || '',
        fullAddress: user.address || ''
      }));
    }
  }, [user]);

  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Silakan masuk (login) terlebih dahulu untuk mengajukan pemasangan.");
      navigate('/login');
      return;
    }
    
    setStatus({ loading: true, error: null, success: false });
    try {
      await axios.post(`${API_BASE_URL}/api/installations`, formData);
      setStatus({ loading: false, error: null, success: true });
      setFormData({ fullName: '', phoneNumber: '', email: '', fullAddress: '', selectedPackage: '20 Mbps', notes: '' });
    } catch (error) {
      setStatus({ loading: false, error: error.response?.data?.message || 'Terjadi kesalahan', success: false });
    }
  };

  return (
    <section id="form" className="py-20 relative z-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Formulir Pemasangan</h2>
            <p className="text-gray-400">Isi data diri Anda, tim kami akan segera menghubungi.</p>
          </div>

          {status.success && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-300 p-4 rounded-xl mb-6 text-center">
              Pengajuan berhasil dikirim! Tim kami akan segera menghubungi Anda.
            </div>
          )}
          {status.error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-xl mb-6 text-center">
              {status.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="Cth: Budi Santoso" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nomor Telepon / WhatsApp</label>
                <input required type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="Cth: 081234567890" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="Cth: budi@email.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Alamat Pemasangan Lengkap</label>
              <textarea required name="fullAddress" value={formData.fullAddress} onChange={handleChange} rows="3" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pilih Paket</label>
              <select name="selectedPackage" value={formData.selectedPackage} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none">
                <option value="20 Mbps">20 Mbps - Rp 250.000/bln</option>
                <option value="50 Mbps">50 Mbps - Rp 350.000/bln</option>
                <option value="100 Mbps">100 Mbps - Rp 500.000/bln</option>
                <option value="Custom">Paket Bisnis / Kustom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Catatan Tambahan (Opsional)</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="Misal: Patokan rumah warna merah"></textarea>
            </div>

            <button type="submit" disabled={status.loading} className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50">
              {status.loading ? 'Mengirim...' : 'Kirim Pengajuan Pemasangan'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Form;
