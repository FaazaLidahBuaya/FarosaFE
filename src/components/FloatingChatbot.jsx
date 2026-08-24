import { API_BASE_URL } from '../config';
import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [csMode, setCsMode] = useState(false);
  
  const messagesEndRef = useRef(null);
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil guestId dari localStorage atau buat baru
  const [hasUnread, setHasUnread] = useState(false);

  const getGuestId = () => {
    let gid = localStorage.getItem('guestId');
    if (!gid) {
      gid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guestId', gid);
    }
    return gid;
  };

  const fetchChatHistory = async (background = false) => {
    if (!user) return;
    try {
      const url = `${API_BASE_URL}/api/chat?userId=${user._id}`;
      const res = await axios.get(url);
      
      if (res.data) {
        if (res.data.messages && res.data.messages.length > 0) {
          const newMessages = res.data.messages;
          setMessages(prev => {
            if (background && !isOpen && newMessages.length > prev.length) {
              const lastNewMsg = newMessages[newMessages.length - 1];
              if (lastNewMsg.sender === 'bot' || lastNewMsg.sender === 'cs') {
                setHasUnread(true);
              }
            }
            return newMessages;
          });
        }
        if (res.data.csMode !== undefined) setCsMode(res.data.csMode);
      } else if (!background) {
        setMessages([{
          _id: Date.now().toString(),
          sender: 'bot',
          text: `Halo ${user.name || ''}! 👋 Saya asisten virtual Farosa WiFi. Ada yang bisa saya bantu hari ini?`
        }]);
      }
    } catch (err) {
      console.error("Gagal mengambil histori chat:", err);
    }
  };

  const processedOrderRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      fetchChatHistory();
    }
    const interval = setInterval(() => {
      fetchChatHistory(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, user]);

  // Cek jika datang dari Checkout
  useEffect(() => {
    if (location.state?.openChatbotWithOrder && !processedOrderRef.current) {
      processedOrderRef.current = true;
      const pkg = location.state.openChatbotWithOrder;
      setIsOpen(true);
      setPendingOrder(pkg);
      
      // Bersihkan state router terlebih dahulu agar aman jika terjadi remount
      navigate(location.pathname, { replace: true, state: {} });
      
      // Amankan formatting
      const formattedPrice = typeof pkg.price === 'number' ? `Rp ${pkg.price.toLocaleString('id-ID')}` : pkg.price;
      const formattedSpeed = pkg.speed ? `(${pkg.speed} Mbps)` : '';
      const finalPriceStr = String(formattedPrice).startsWith('Rp') ? formattedPrice : `Rp ${formattedPrice}`;
      
      const confirmMsgText = `Mohon konfirmasi pesanan Anda:\n\nPaket: ${pkg.name} ${formattedSpeed}\nHarga: ${finalPriceStr}/bulan\nAlamat: ${user && user.address ? user.address : 'Belum diisi lengkap'}\n\nApakah data sudah benar? Ketik "benar" jika iya.`;
      
      const sendInitialOrderMsg = async () => {
        const guestId = getGuestId();
        const payloadBase = user ? { userId: user._id } : { guestId };
        setIsTyping(true);
        try {
          const res = await axios.post(`${API_BASE_URL}/api/chat`, { ...payloadBase, sender: 'bot', text: confirmMsgText });
          setMessages(prev => [...prev, res.data.addedMessage || res.data]);
          if (res.data.csMode !== undefined) setCsMode(res.data.csMode);
        } catch (e) {
          setMessages(prev => [...prev, { _id: Date.now().toString(), sender: 'bot', text: confirmMsgText }]);
        }
        setIsTyping(false);
      };
      
      setTimeout(sendInitialOrderMsg, 1000);
    }
  }, [location.state, navigate, user]);

  const scrollToBottom = () => {
    if (messagesEndRef.current && messagesEndRef.current.parentElement) {
      messagesEndRef.current.parentElement.scrollTo({
        top: messagesEndRef.current.parentElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      scrollToBottom();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessageText = inputText.trim();
    setMessages(prev => [...prev, { _id: Date.now().toString(), sender: 'user', text: userMessageText }]);
    setInputText('');
    setIsTyping(true);

    const guestId = getGuestId();
    const payloadBase = user ? { userId: user._id } : { guestId };

    try {
      await axios.post(`${API_BASE_URL}/api/chat`, { ...payloadBase, sender: 'user', text: userMessageText });
      
      if (csMode) {
        setIsTyping(false);
        return;
      }
      
      // Jika user sedang dalam proses konfirmasi order dan mengetik "benar"
      if (pendingOrder && userMessageText.toLowerCase() === 'benar') {
        const installationData = {
          userId: user ? user._id : undefined,
          fullName: user ? user.name : 'Pelanggan Baru',
          email: user ? user.email : 'customer@farosa.com',
          phoneNumber: user ? user.phone : '08123456789',
          fullAddress: user && user.address ? user.address : 'Alamat belum diisi lengkap',
          selectedPackage: pendingOrder.name || 'Custom',
          packagePrice: pendingOrder.price || 0,
          status: 'Pending'
        };

        await axios.post(`${API_BASE_URL}/api/installations`, installationData);
        
        setTimeout(async () => {
          const botReplyText = 'Terima kasih! ✅ Pesanan Anda telah berhasil masuk ke sistem kami.\n\nManager kami akan segera memproses dan mengonfirmasi pesanan Anda beserta jadwal pemasangan. Anda akan mendapatkan notifikasi di chat ini saat pesanan sudah dikonfirmasi.\n\nMohon ditunggu ya! 🙏';
          const res = await axios.post(`${API_BASE_URL}/api/chat`, { ...payloadBase, sender: 'bot', text: botReplyText });
          setMessages(prev => [...prev, res.data.addedMessage || res.data]);
          setIsTyping(false);
          setPendingOrder(null);
        }, 1500);

      } else if (!pendingOrder && userMessageText.toLowerCase() === 'iya') {
        await axios.put(`${API_BASE_URL}/api/chat/mode`, { ...payloadBase, csMode: true });
        setCsMode(true);
        setTimeout(async () => {
          const botReplyText = 'Baik, mohon tunggu sebentar. Customer Service kami akan segera membalas pesan Anda.';
          const res = await axios.post(`${API_BASE_URL}/api/chat`, { ...payloadBase, sender: 'bot', text: botReplyText });
          setMessages(prev => [...prev, res.data.addedMessage || res.data]);
          setIsTyping(false);
        }, 1000);
      } else {
        setTimeout(async () => {
          let botReplyText = 'Apakah anda ingin menghubungi CS? ketik "iya" jika benar.';
          if (pendingOrder) {
            botReplyText = 'Jika ada data yang salah, mohon hubungi call center kami. Untuk melanjutkan pesanan saat ini, ketik "benar".';
          }
          const res = await axios.post(`${API_BASE_URL}/api/chat`, { ...payloadBase, sender: 'bot', text: botReplyText });
          setMessages(prev => [...prev, res.data.addedMessage || res.data]);
          setIsTyping(false);
        }, 1500);
      }

    } catch (err) {
      console.error("Gagal mengirim pesan", err);
      setTimeout(() => {
        setMessages(prev => [...prev, { _id: Date.now().toString(), sender: 'bot', text: 'Mohon maaf, terjadi kesalahan pada server. Silakan coba lagi.' }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #111115;
          border-radius: 10px;
        }
      `}</style>

      {/* Floating Button */}
        <button 
          onClick={() => { setIsOpen(true); setHasUnread(false); }}
          className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          title="Bantuan Live Chat"
        >
          {hasUnread && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-[#070709] rounded-full animate-bounce shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
          )}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        </button>

      {/* Fullscreen Overlay Chatbot */}
      <div 
        className="fixed inset-0 z-50 transition-all duration-[1200ms] ease-in-out"
        style={{
          clipPath: isOpen ? 'circle(150% at calc(100% - 3.25rem) calc(100% - 3.25rem))' : 'circle(0px at calc(100% - 3.25rem) calc(100% - 3.25rem))',
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      >
        {/* Background Layers */}
        <div className="absolute inset-0 bg-[#070709]/95 backdrop-blur-xl -z-10"></div>
        <div 
          className="absolute inset-0 bg-gradient-to-r from-primary to-accent -z-10 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: isOpen ? 0 : 1 }}
        ></div>

        {/* Chat UI Content (Fades in slightly after opening) */}
        <div className={`flex flex-col h-full text-white transition-opacity duration-[1000ms] ease-in-out ${isOpen ? 'opacity-100 delay-300' : 'opacity-0'}`}>
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 bg-black/40 flex justify-between items-center px-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 relative">
                <span className="text-xl font-display font-bold text-primary">F</span>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#070709]"></div>
              </div>
              <div>
                <h2 className="font-bold text-lg">Farosa Support</h2>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all duration-300 transform hover:rotate-90"
              title="Tutup Chat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* Chat Messages Body */}
          {user ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 max-w-4xl w-full mx-auto">
              {messages.map(msg => (
                <div key={msg._id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-white rounded-tr-sm shadow-[0_5px_15px_rgba(79,70,229,0.3)]' 
                      : 'bg-white/10 text-gray-200 rounded-tl-sm border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-2xl rounded-tl-sm p-4 border border-white/5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mb-4 shadow-[0_0_25px_rgba(79,70,229,0.3)]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Login Diperlukan</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Silakan masuk ke akun Farosa Anda terlebih dahulu untuk menggunakan fitur Live Chat dengan Customer Service & Asisten AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button 
                  onClick={() => navigate('/login')}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg text-sm"
                >
                  Masuk Sekarang
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all border border-white/10 text-sm"
                >
                  Daftar Akun
                </button>
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="p-4 border-t border-white/10 bg-black/40">
            {user ? (
              <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl w-full mx-auto">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Tulis pertanyaan Anda..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-colors placeholder-gray-500 text-sm"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="bg-primary hover:bg-primary-dark text-white px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                >
                  <svg className="w-6 h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                </button>
              </form>
            ) : (
              <div className="py-2 text-center">
                <button 
                  onClick={() => navigate('/login')}
                  className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                >
                  🔒 Anda belum masuk. <span className="text-primary font-bold underline">Klik di sini untuk login</span>
                </button>
              </div>
            )}
          </div>
        
        </div>
      </div>
    </>
  );
};

export default FloatingChatbot;
