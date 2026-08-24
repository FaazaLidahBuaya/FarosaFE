import React, { useState, useEffect, useContext, Suspense, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { Canvas } from '@react-three/fiber';
import { Environment, Float, SpotLight } from '@react-three/drei';
import RocketModel from '../components/RocketModel';
import FarosaLogo from '../assets/Farosa.jpeg';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [activeTab, setActiveTab] = useState('');
  const [showRevenueDetails, setShowRevenueDetails] = useState(false);
  const [showBandwidthDetails, setShowBandwidthDetails] = useState(false);
  
  // States for Requests panel
  const [requests, setRequests] = useState([]);
  const [loadingReq, setLoadingReq] = useState(true);

  // States for Confirm Modal
  const [confirmModal, setConfirmModal] = useState(null);
  const [installDate, setInstallDate] = useState('');
  const [assignedTeam, setAssignedTeam] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  // States for Mock Users panel
  const [users, setUsers] = useState([]);

  // States for Employees panel
  const [employees, setEmployees] = useState([]);
  const [overviewStats, setOverviewStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [empForm, setEmpForm] = useState({ id: '', name: '', email: '', phone: '', role: 'cs', password: '' });

  // States for Packages panel
  const [dbPackages, setDbPackages] = useState([]);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [newPackage, setNewPackage] = useState({ name: '', speed: '', price: '', category: 'Internet', badge: '', features: '' });

  // State for Custom Notifications (Toast)
  const [toast, setToast] = useState(null);

  // States for Custom Dropdowns
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
  const [openTeamDropdown, setOpenTeamDropdown] = useState(false);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState(false);
  const [openBadgeDropdown, setOpenBadgeDropdown] = useState(false);

  // States for Chat
  const [allChats, setAllChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatInput, setChatInput] = useState('');

  // States for Staff Chat
  const [staffMessages, setStaffMessages] = useState([]);
  const [staffChatInput, setStaffChatInput] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [unreadStaffStats, setUnreadStaffStats] = useState([]);
  
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current && messagesEndRef.current.parentElement) {
      messagesEndRef.current.parentElement.scrollTo({
        top: messagesEndRef.current.parentElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat, staffMessages, allChats]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (user.role === 'user') {
        navigate('/');
      } else {
        if (!activeTab) {
          if (user.role === 'cs') setActiveTab('chat');
          else if (user.role === 'manager') setActiveTab('requests');
          else setActiveTab('overview');
        }
      }
    }
  }, [user, authLoading, navigate, activeTab]);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    }
    if (activeTab === 'chat') {
      fetchAllChats();
      fetchUnreadStaffStats();
    }
    if (activeTab === 'staffChat') {
      fetchStaffMessages();
    }
    if (activeTab === 'overview') {
      fetchOverviewStats();
    }
    if (activeTab === 'audit' && (user?.role === 'owner' || user?.role === 'admin')) {
      fetchLogs();
    }
    if (activeTab === 'users' && (user?.role === 'owner' || user?.role === 'admin')) {
      fetchUsers();
    }
    if ((activeTab === 'employees' || activeTab === 'chat') && (user?.role === 'owner' || user?.role === 'admin' || user?.role === 'cs' || user?.role === 'manager')) {
      fetchEmployees();
    }
    if (activeTab === 'packages' && (user?.role === 'manager' || user?.role === 'owner' || user?.role === 'admin')) {
      fetchDbPackages();
    }
    
    let interval;
    if (activeTab === 'chat') {
      interval = setInterval(() => {
        fetchAllChats();
        fetchUnreadStaffStats();
      }, 5000);
    }
    return () => { if(interval) clearInterval(interval); }
  }, [activeTab, user]);

  const fetchStaffMessages = async () => {
    // Legacy global staff chat, can be removed, but we keep the state setStaffMessages
  };

  const fetchUnreadStaffStats = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/staff-chat/unread?userId=${user._id}`);
      setUnreadStaffStats(response.data);
    } catch (error) {
      console.error("Error fetching unread staff stats", error);
    }
  };

  useEffect(() => {
    if (selectedChat && selectedChat.type === 'staff' && user) {
      const fetchDirectMessages = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/staff-chat?userId=${user._id}&otherId=${selectedChat.id}`);
          setStaffMessages(res.data);
          // Refresh unread stats after reading
          fetchUnreadStaffStats();
        } catch (error) {
          console.error("Error fetching direct messages", error);
        }
      };
      fetchDirectMessages();
    }
  }, [selectedChat, user?._id]);

  const fetchAllChats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/chat/all');
      setAllChats(response.data);
    } catch (error) {
      console.error("Error fetching chats", error);
    }
  };

  const fetchDbPackages = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/packages');
      setDbPackages(res.data);
    } catch (error) {
      console.error("Error fetching packages", error);
    }
  };

  const handleAddPackage = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...newPackage, 
        features: typeof newPackage.features === 'string' ? newPackage.features.split(',').map(f => f.trim()).filter(f => f) : newPackage.features,
        speed: parseInt(newPackage.speed),
        price: parseInt(newPackage.price)
      };
      if (newPackage._id) {
        await axios.put(`http://localhost:5000/api/packages/${newPackage._id}`, payload);
        showToast('Paket/Promo berhasil diperbarui!');
      } else {
        await axios.post('http://localhost:5000/api/packages', payload);
        showToast('Paket/Promo berhasil ditambahkan!');
      }
      setShowPackageModal(false);
      setNewPackage({ name: '', speed: '', price: '', category: 'Internet', badge: '', features: '' });
      fetchDbPackages();
    } catch (error) {
      console.error("Error saving package", error);
      showToast('Gagal menyimpan paket', 'error');
    }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Yakin ingin menghapus paket/promo ini?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/packages/${id}`);
      fetchDbPackages();
      showToast('Paket/Promo berhasil dihapus!');
    } catch (error) {
      console.error("Error deleting package", error);
      showToast('Gagal menghapus paket', 'error');
    }
  };

  const fetchRequests = async () => {
    try {
      setLoadingReq(true);
      const response = await axios.get('http://localhost:5000/api/installations');
      setRequests(response.data.data);
      setLoadingReq(false);
    } catch (error) {
      console.error("Error fetching data", error);
      setLoadingReq(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching logs", error);
    }
  };

  const fetchOverviewStats = async () => {
    try {
      // Fetching concurrent data
      const [resUsers, resInst, resPack] = await Promise.all([
        axios.get('http://localhost:5000/api/auth/users?role=user'),
        axios.get('http://localhost:5000/api/installations', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get('http://localhost:5000/api/packages')
      ]);
      const totalUsers = resUsers.data.length;
      const recentUsers = resUsers.data.slice(0, 10).length; // Simulate recent
      const totalInst = resInst.data.length;
      
      // Calculate simple revenue estimate (users * average package price)
      const avgPrice = resPack.data.reduce((acc, curr) => acc + curr.price, 0) / (resPack.data.length || 1);
      const revenue = (totalUsers * avgPrice) || 45800000;
      
      setOverviewStats({ totalUsers, recentUsers, totalInst, revenue });
    } catch (error) {
      console.error("Error fetching overview stats", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users?role=user');
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const [resCS, resMg, resOwn, resAdmin] = await Promise.all([
        axios.get('http://localhost:5000/api/auth/users?role=cs'),
        axios.get('http://localhost:5000/api/auth/users?role=manager'),
        axios.get('http://localhost:5000/api/auth/users?role=owner'),
        axios.get('http://localhost:5000/api/auth/users?role=admin')
      ]);
      setEmployees([...resCS.data, ...resMg.data, ...resOwn.data, ...resAdmin.data]);
    } catch (error) {
      console.error("Error fetching employees", error);
    }
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (empForm.id) {
        await axios.put(`http://localhost:5000/api/users/${empForm.id}`, empForm, config);
      } else {
        await axios.post('http://localhost:5000/api/users', empForm, config);
      }
      setShowEmpModal(false);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan pegawai');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if(!window.confirm('Yakin ingin menghapus pegawai ini?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus pegawai');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/installations/${id}/status`, { status: newStatus });
      fetchRequests();
    } catch (error) {
      console.error("Error updating status", error);
      showToast('Gagal update status', 'error');
    }
  };

  const handleConfirm = async () => {
    if (!installDate || !assignedTeam) {
      showToast('Harap isi tanggal pemasangan dan pilih tim!', 'error');
      return;
    }
    setConfirmLoading(true);
    try {
      await axios.patch(`http://localhost:5000/api/installations/${confirmModal._id}/confirm`, {
        installationDate: installDate,
        assignedTeam: assignedTeam,
        confirmedBy: user.name
      });
      setConfirmModal(null);
      setInstallDate('');
      setAssignedTeam('');
      fetchRequests();
      showToast('Pesanan berhasil dikonfirmasi! Notifikasi telah dikirim ke pelanggan.');
    } catch (error) {
      console.error("Error confirming", error);
      showToast("Gagal konfirmasi: " + (error.response?.data?.message || error.message), 'error');
    }
    setConfirmLoading(false);
  };

  if (authLoading || !user) {
    return <div className="min-h-screen bg-[#070709] flex items-center justify-center text-white">Loading...</div>;
  }

  // Define tabs based on role
  let availableTabs = [];
  
  if (user.role === 'owner' || user.role === 'admin') {
    availableTabs.push({ id: 'overview', label: 'Overview', icon: (
      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    ) });
  }

  if (['cs', 'owner', 'admin', 'manager'].includes(user.role)) {
    availableTabs.push({ id: 'chat', label: 'Chats', icon: (
      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
    ) });
  }

  if (user.role === 'manager' || user.role === 'owner' || user.role === 'admin') {
    availableTabs.push({ id: 'requests', label: 'Pengajuan Pasang', icon: (
      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    ) });
    availableTabs.push({ id: 'packages', label: 'Paket & Promo', icon: (
      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
    ) });
  }

  if (user.role === 'owner' || user.role === 'admin') {
    availableTabs.push({ id: 'users', label: 'Data Pengguna', icon: (
      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    ) });
    availableTabs.push({ id: 'employees', label: 'Data Pegawai', icon: (
      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.64-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
    ) });
    availableTabs.push({ id: 'audit', label: 'Log Aktivitas', icon: (
      <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    ) });
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedChat) return;
    
    try {
      if (selectedChat.type === 'customer') {
        const payloadBase = selectedChat.data.userId ? { userId: selectedChat.data.userId._id || selectedChat.data.userId } : { guestId: selectedChat.data.guestId };
        const res = await axios.post('http://localhost:5000/api/chat', { 
          ...payloadBase, 
          sender: 'bot', 
          text: chatInput 
        });
        
        setChatInput('');
        const updatedMessages = [...selectedChat.data.messages, res.data.addedMessage];
        setSelectedChat({...selectedChat, data: {...selectedChat.data, messages: updatedMessages}});
        setAllChats(prev => prev.map(c => c._id === selectedChat.id ? {...c, messages: updatedMessages} : c));
      } else if (selectedChat.type === 'staff') {
        const res = await axios.post('http://localhost:5000/api/staff-chat', { 
          senderId: user._id,
          receiverId: selectedChat.id,
          text: chatInput
        });
        
        setChatInput('');
        setStaffMessages(prev => [...prev, res.data]);
      }
    } catch (error) {
      console.error("Error sending message", error);
      showToast('Gagal mengirim pesan', 'error');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[85vh]">
            {/* Left Big Panel: Network & 3D Rocket */}
            <div className="lg:w-1/3 bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between group/panel">
              {/* Glows */}
              <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl font-display font-light mb-1 leading-tight text-white/90">Network &<br/><span className="font-bold text-white">Operations</span></h2>
              </div>

              {/* 3D Canvas Background */}
              <div className="absolute inset-0 z-0 opacity-80 pointer-events-none group-hover/panel:opacity-100 transition-opacity duration-1000">
                <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
                  <ambientLight intensity={0.5} />
                  <SpotLight position={[-10, 10, 5]} angle={1.2} penumbra={1} intensity={10} distance={40} color="#ffffff" castShadow volumetric={true} attenuation={15} anglePower={5} />
                  <directionalLight position={[10, -5, -5]} intensity={1.5} color="#4f46e5" />
                  <Suspense fallback={null}>
                    <Float speed={2} rotationIntensity={0.8} floatIntensity={1}>
                       {/* Rotasi sedikit agar terlihat bagus */}
                       <RocketModel rotation={[0.5, -0.5, 0.2]} scale={[1.2, 1.2, 1.2]} />
                    </Float>
                  </Suspense>
                  <Environment preset="studio" />
                </Canvas>
              </div>

              <div className="relative z-10 flex-1 flex flex-col justify-center pointer-events-none">
                {/* Floating Metric 1 */}
                <div className="absolute top-[20%] right-[5%] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#4ade80]"></div>
                  <div className="text-xs text-gray-300">
                    <span className="text-xl font-bold text-white block">99.9%</span>
                    Uptime
                  </div>
                </div>

                {/* Floating Metric 2 */}
                <div className="absolute bottom-[20%] left-[5%] flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-300 text-right">
                      <span className="text-xl font-bold text-white block">15ms</span>
                      Latency
                    </div>
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_#4f46e5]"></div>
                  </div>
                  <span className="text-[10px] text-gray-500">Optimal</span>
                </div>
              </div>

                            {/* Bottom Timeline/Bar (Replaced with Clock) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative z-10">
                <div className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 flex justify-center items-center shadow-inner">
                  <span className="text-4xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 drop-shadow-md">
                    {currentTime.toLocaleTimeString('id-ID', { hour12: false })}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Bento Grid */}
            <div className="lg:w-2/3 grid grid-cols-2 grid-rows-3 gap-6 h-full">
              
              {/* Tall Card */}
              <div className="col-span-1 row-span-2 bg-gradient-to-br from-green-500/20 to-primary/20 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-300">Active Users</span>
                    <span className="text-xs text-gray-400 bg-black/30 px-2 py-1 rounded-full">Bulan ini</span>
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">{overviewStats ? overviewStats.totalUsers : 0}</div>
                  <div className="text-sm text-green-300">+{overviewStats ? overviewStats.recentUsers : 0} users</div>
                </div>
                
                {/* Abstract Line Art */}
                <div className="relative w-full h-32 mt-4 flex items-center justify-center opacity-70">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-green-400" fill="none" stroke="currentColor" strokeWidth="0.5">
                    <ellipse cx="50" cy="50" rx="40" ry="20" />
                    <ellipse cx="50" cy="50" rx="30" ry="40" />
                    <circle cx="50" cy="50" r="3" fill="currentColor" className="animate-ping" />
                  </svg>
                </div>
                
                <div className="flex justify-between text-xs text-gray-400 mt-4 px-2">
                  <span>Low</span>
                  <span>Avg</span>
                  <span className="text-white">Peak</span>
                </div>
              </div>

              {/* Top Right Card */}
              <div className="col-span-1 row-span-1 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-300">Revenue</span>
                  <button onClick={() => setShowRevenueDetails(true)} className="hover:text-white transition-colors cursor-pointer focus:outline-none">
                    <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l9.2-9.2M17 17V7H7" /></svg>
                  </button>
                </div>
                <div className="text-3xl font-bold text-white">Rp {overviewStats ? (overviewStats.revenue / 1000000).toFixed(1) : 0} Jt</div>
                
                {/* Revenue Chart (Mini) */}
                <div className="w-full h-16 mt-2 relative">
                  <svg viewBox="0 0 120 45" className="w-full h-full text-yellow-500 overflow-visible">
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    <path d="M5,38 Q30,22 55,28 T90,12 T115,6 L115,42 L5,42 Z" fill="url(#revGrad)" />
                    <path d="M5,38 Q30,22 55,28 T90,12 T115,6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="115" cy="6" r="2.5" fill="currentColor" className="animate-pulse" />
                  </svg>
                </div>
              </div>

              {/* Middle Right Card */}
              <div className="col-span-1 row-span-1 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-300">Bandwidth Load</span>
                  <button onClick={() => setShowBandwidthDetails(true)} className="hover:text-white transition-colors cursor-pointer focus:outline-none">
                    <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17l9.2-9.2M17 17V7H7" /></svg>
                  </button>
                </div>
                <div className="text-3xl font-bold text-white">0.5 <span className="text-lg font-normal text-gray-400">TB</span></div>
                
                {/* Bandwidth Chart (Mini) */}
                <div className="w-full h-16 mt-2 relative">
                  <svg viewBox="0 0 120 45" className="w-full h-full text-cyan-400 overflow-visible">
                    <defs>
                      <linearGradient id="bwGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    <path d="M5,40 Q25,18 50,30 T85,12 T115,18 L115,42 L5,42 Z" fill="url(#bwGrad)" />
                    <path d="M5,40 Q25,18 50,30 T85,12 T115,18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="115" cy="18" r="2.5" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Bottom Small Cards */}
              <div className="col-span-2 row-span-1 grid grid-cols-1 gap-6">
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-white/10 rounded-3xl p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400">Pemasangan Baru</div>
                    <span className="text-[10px] text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">Live</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <div className="text-3xl font-black text-white">+{overviewStats ? overviewStats.totalInst : 0}</div>
                    <div className="text-xs text-gray-400 font-medium">Permintaan aktif</div>
                  </div>
                  {/* Minimalist Sparkline Activity */}
                  <div className="w-full h-8 mt-2">
                    <svg viewBox="0 0 100 24" className="w-full h-full text-orange-400 overflow-visible">
                      <path d="M2,18 L15,16 L30,20 L45,10 L60,14 L75,6 L90,12 L98,4" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="98" cy="4" r="2" fill="currentColor" className="animate-ping" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      case 'chat': {
        const contacts = [];
        
        if (['admin', 'cs'].includes(user.role)) {
          (Array.isArray(allChats) ? allChats : []).forEach(c => {
            const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
            const name = c.userId ? c.userId.name : `Guest (${c.guestId?.substring(0,6)})`;
            contacts.push({
              id: c._id,
              type: 'customer',
              name: name,
              email: c.userId ? c.userId.email : c.guestId,
              phone: c.userId ? c.userId.phone : '-',
              address: c.userId && c.userId.address ? c.userId.address : '-',
              role: 'Customer',
              lastMessage: lastMsg ? lastMsg.text : 'Memulai obrolan...',
              time: lastMsg ? new Date(lastMsg.timestamp).getTime() : 0,
              isUnread: lastMsg && lastMsg.sender === 'user',
              csMode: c.csMode,
              data: c,
              initial: (name || '?').charAt(0).toUpperCase()
            });
          });
        }

        (Array.isArray(employees) ? employees : []).forEach(emp => {
          if (emp._id !== user._id) {
            const unreadData = Array.isArray(unreadStaffStats) ? unreadStaffStats.find(u => u._id === emp._id) : null;
            contacts.push({
              id: emp._id,
              type: 'staff',
              name: emp.name,
              email: emp.email,
              phone: emp.phone || '-',
              role: emp.role,
              lastMessage: unreadData ? unreadData.lastMessage : 'Internal Staff',
              time: unreadData ? new Date(unreadData.time).getTime() : 0,
              isUnread: !!unreadData,
              csMode: false,
              data: emp,
              initial: (emp.name || '?').charAt(0).toUpperCase()
            });
          }
        });

        contacts.sort((a, b) => b.time - a.time);

        const filteredContacts = contacts.filter(c => 
          c.name.toLowerCase().includes(chatSearch.toLowerCase()) || 
          c.email.toLowerCase().includes(chatSearch.toLowerCase()) || 
          c.role.toLowerCase().includes(chatSearch.toLowerCase())
        );

        return (
          <div className="w-full h-full flex bg-black/40 text-white overflow-hidden">
            
              {/* Left Col: Sidebar List */}
              <div className="w-[320px] border-r border-white/10 flex flex-col bg-black/20">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-2xl font-bold mb-4">Chats</h2>
                  <input 
                    type="text" 
                    placeholder="Search chats..." 
                    value={chatSearch}
                    onChange={e => setChatSearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary text-white" 
                  />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredContacts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Belum ada obrolan</div>
                  ) : (
                    filteredContacts.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => setSelectedChat(c)}
                        className={`p-4 border-b border-white/5 cursor-pointer transition-colors flex gap-3 items-center ${selectedChat?.id === c.id ? 'bg-primary/20' : 'hover:bg-white/5'} ${c.isUnread ? 'bg-white/5' : ''}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg relative">
                          {c.initial}
                          {c.type === 'staff' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>}
                          {c.isUnread && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-black rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className={`font-bold text-sm truncate ${c.isUnread ? 'text-white' : 'text-gray-300'}`}>{c.name}</h3>
                            {c.type === 'customer' && c.csMode && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold ml-1 flex-shrink-0">CS</span>}
                          </div>
                          <p className={`text-xs truncate ${c.isUnread ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                            {c.lastMessage}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Middle Col: Chat View */}
              <div className="flex-1 flex flex-col">
                {selectedChat ? (
                  <>
                    <div className="p-4 border-b border-white/10 bg-black/40 flex justify-between items-center h-[72px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                          {selectedChat.initial}
                        </div>
                        <div>
                          <h3 className="font-bold">{selectedChat.name}</h3>
                          <p className="text-xs text-gray-400 capitalize">{selectedChat.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {selectedChat.type === 'customer' && !selectedChat.csMode && (
                          <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">Bot Mode</span>
                        )}
                        {selectedChat.type === 'customer' && selectedChat.csMode && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">CS Mode</span>
                        )}
                        {selectedChat.type === 'staff' && (
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Internal</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {selectedChat.type === 'customer' && selectedChat.data.messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[80%] p-3 rounded-xl text-sm shadow-md ${msg.sender === 'user' ? 'bg-white/10 text-white rounded-tl-none' : 'bg-primary text-white rounded-tr-none'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      
                      {selectedChat.type === 'staff' && staffMessages.length === 0 && (
                        <div className="text-center text-gray-500 mt-10 text-sm">Belum ada obrolan dengan {selectedChat.name}.</div>
                      )}
                      
                      {selectedChat.type === 'staff' && staffMessages.map((msg, i) => {
                        const isMe = msg.sender && msg.sender._id === user._id;
                        return (
                          <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl text-sm shadow-md ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    <div ref={messagesEndRef} />
                      </div>
                      
                      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-black/20 flex gap-2">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white" 
                        placeholder="Ketik pesan..." 
                      />
                      <button type="submit" disabled={!chatInput.trim()} className="bg-primary hover:bg-indigo-500 w-11 h-11 rounded-full flex items-center justify-center font-bold disabled:opacity-50 transition-colors">
                        <svg className="w-5 h-5 translate-x-[-1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    <p>Pilih kontak untuk mulai ngobrol</p>
                  </div>
                )}
              </div>

              {/* Right Col: User Info Profile */}
              {selectedChat && (
                <div className="w-[280px] border-l border-white/10 bg-black/20 p-6 flex flex-col items-center overflow-y-auto">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold shadow-xl mb-4">
                    {selectedChat.initial}
                  </div>
                  <h3 className="text-xl font-bold text-center mb-1">{selectedChat.name}</h3>
                  <p className="text-sm text-gray-400 capitalize mb-6">{selectedChat.role}</p>

                  <div className="w-full space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-sm font-medium break-all">{selectedChat.email}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <p className="text-xs text-gray-500 mb-1">No. Telepon</p>
                      <p className="text-sm font-medium">{selectedChat.phone}</p>
                    </div>
                    {selectedChat.type === 'customer' && (
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <p className="text-xs text-gray-500 mb-1">Alamat</p>
                        <p className="text-sm font-medium leading-relaxed">{selectedChat.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        );
      }
      case 'requests': {
        const statusColors = {
          'Pending': 'bg-yellow-500/20 text-yellow-300',
          'Dikonfirmasi': 'bg-cyan-500/20 text-cyan-300',
          'Survey Lokasi': 'bg-blue-500/20 text-blue-300',
          'Proses Pasang': 'bg-purple-500/20 text-purple-300',
          'Aktif': 'bg-green-500/20 text-green-300',
          'Ditolak': 'bg-red-500/20 text-red-300',
        };
        return (
          <>
          <div className="glass-card">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Daftar Pengajuan Pasang</h2>
              <button onClick={fetchRequests} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors flex items-center gap-2" title="Refresh">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Refresh
              </button>
            </div>
            <div className="w-full relative pb-24">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="p-4 font-semibold text-gray-300">Pelanggan</th>
                    <th className="p-4 font-semibold text-gray-300">Kontak</th>
                    <th className="p-4 font-semibold text-gray-300">Paket & Alamat</th>
                    <th className="p-4 font-semibold text-gray-300">Status</th>
                    <th className="p-4 font-semibold text-gray-300">Jadwal & Tim</th>
                    <th className="p-4 font-semibold text-gray-300 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingReq ? (
                    <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr>
                  ) : requests.map(req => (
                    <tr key={req._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{req.fullName}</div>
                        <div className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString('id-ID')}</div>
                      </td>
                      <td className="p-4 text-gray-400">
                        <div>{req.phoneNumber}</div>
                        <div className="text-xs">{req.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-accent font-medium">{req.selectedPackage}</div>
                        {req.packagePrice > 0 && <div className="text-xs text-gray-400">Rp {req.packagePrice.toLocaleString('id-ID')}/bln</div>}
                        <div className="text-xs text-gray-500 max-w-[200px] truncate" title={req.fullAddress}>{req.fullAddress}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border border-white/10 whitespace-nowrap ${statusColors[req.status] || 'bg-gray-500/20 text-gray-300'}`}>{req.status}</span>
                      </td>
                      <td className="p-4">
                        {req.installationDate ? (
                          <div className="space-y-1.5">
                            <div className="text-xs text-cyan-300 flex items-center">
                              <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                              {new Date(req.installationDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center">
                              <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                              {req.assignedTeam}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === 'Pending' && (
                            <button 
                              onClick={() => setConfirmModal(req)}
                              className="bg-green-500/20 text-green-300 hover:bg-green-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                              Konfirmasi
                            </button>
                          )}
                          <div className="relative">
                            <button
                              onClick={() => setOpenStatusDropdown(openStatusDropdown === req._id ? null : req._id)}
                              onBlur={() => setTimeout(() => setOpenStatusDropdown(null), 200)}
                              className="bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary flex items-center justify-between min-w-[130px] transition-colors hover:bg-white/5"
                            >
                              <span>{req.status}</span>
                              <svg className={`w-4 h-4 ml-2 transition-transform ${openStatusDropdown === req._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            
                            <div className={`absolute right-0 top-full mt-1 w-full min-w-[140px] bg-[#0f172a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 transition-all duration-200 origin-top ${openStatusDropdown === req._id ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                              {['Pending', 'Dikonfirmasi', 'Survey Lokasi', 'Proses Pasang', 'Aktif', 'Ditolak'].map((s) => (
                                <div 
                                  key={s}
                                  onClick={() => {
                                    handleStatusChange(req._id, s);
                                    setOpenStatusDropdown(null);
                                  }}
                                  className={`px-4 py-2.5 text-sm text-left cursor-pointer transition-colors hover:bg-primary/80 ${req.status === s ? 'bg-primary/20 text-white font-medium' : 'text-gray-200'}`}
                                >
                                  {s}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loadingReq && requests.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">Belum ada pengajuan pemasangan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Konfirmasi */}
          {confirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <h3 className="text-xl font-bold mb-1">Konfirmasi Pemasangan</h3>
                <p className="text-sm text-gray-400 mb-6">Atur jadwal dan tim untuk pesanan berikut.</p>

                <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Pelanggan</span>
                    <span className="text-white font-medium">{confirmModal.fullName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Paket</span>
                    <span className="text-accent font-medium">{confirmModal.selectedPackage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Alamat</span>
                    <span className="text-white text-right max-w-[200px] truncate" title={confirmModal.fullAddress}>{confirmModal.fullAddress}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="flex items-center text-sm text-gray-400 mb-1.5">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      Tanggal Pemasangan
                    </label>
                    <input 
                      type="date" 
                      value={installDate} 
                      onChange={(e) => setInstallDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm text-gray-400 mb-1.5">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      Pilih Tim Teknisi
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setOpenTeamDropdown(!openTeamDropdown)}
                        onBlur={() => setTimeout(() => setOpenTeamDropdown(false), 200)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors flex items-center justify-between hover:bg-white/5"
                      >
                        <span className={assignedTeam ? 'text-white' : 'text-gray-400'}>
                          {assignedTeam || 'Pilih Tim Teknisi'}
                        </span>
                        <svg className={`w-4 h-4 ml-2 transition-transform ${openTeamDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>

                      <div className={`absolute left-0 top-full mt-1 w-full bg-[#0f172a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 transition-all duration-200 origin-top ${openTeamDropdown ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        {['Tim A - Andi & Rudi', 'Tim B - Budi & Slamet', 'Tim C - Doni & Heru'].map((team) => (
                          <div 
                            key={team}
                            onClick={() => {
                              setAssignedTeam(team);
                              setOpenTeamDropdown(false);
                            }}
                            className={`px-4 py-3 text-sm text-left cursor-pointer transition-colors hover:bg-primary/80 ${assignedTeam === team ? 'bg-primary/20 text-white font-medium' : 'text-gray-200'}`}
                          >
                            {team}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => { setConfirmModal(null); setInstallDate(''); setAssignedTeam(''); }}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleConfirm}
                    disabled={confirmLoading}
                    className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition-all disabled:opacity-50"
                  >
                    {confirmLoading ? 'Memproses...' : 'Konfirmasi & Kirim Notif'}
                  </button>
                </div>
              </div>
            </div>
          )}
          </>
          );
        }
      case 'promo':
        return (
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">Manajemen Promo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="font-semibold text-accent mb-2">Promo Merdeka</h3>
                <p className="text-sm text-gray-400 mb-4">Diskon 17% pemasangan baru selama bulan Agustus.</p>
                <div className="flex gap-2">
                  <button className="bg-primary/20 text-primary px-3 py-1 rounded text-sm hover:bg-primary hover:text-white transition-colors">Edit</button>
                  <button className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-500 hover:text-white transition-colors">Hapus</button>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 border-dashed flex flex-col items-center justify-center text-gray-400 hover:bg-white/10 transition-colors cursor-pointer min-h-[150px]">
                <span className="text-3xl mb-2">+</span>
                <p>Tambah Promo Baru</p>
              </div>
            </div>
          </div>
        );
      case 'packages':
        return (
          <>
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manajemen Paket & Promo</h2>
              <button 
                onClick={() => {
                  setNewPackage({ name: '', speed: '', price: '', category: 'Internet', badge: '', features: '' });
                  setShowPackageModal(true);
                }}
                className="bg-primary hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                + Tambah Baru
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dbPackages.map((pkg) => (
                <div key={pkg._id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group">
                  {pkg.badge && pkg.badge !== '' && (
                    <div className={`absolute top-0 right-0 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg ${pkg.badge === 'Paling Populer' ? 'bg-primary' : pkg.badge === 'Paling Murah' ? 'bg-green-500' : 'bg-orange-500'}`}>
                      {pkg.badge.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs px-2 py-1 rounded border ${pkg.category === 'Promo' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-white/10 text-gray-300 border-white/20'}`}>
                        {pkg.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-white mt-2">{pkg.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{pkg.speed} Mbps</p>
                    <p className="text-xl font-bold text-accent mt-3">Rp {pkg.price.toLocaleString('id-ID')}</p>
                    <ul className="mt-4 space-y-2 mb-6">
                      {pkg.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="text-xs text-gray-400 flex gap-2"><span className="text-primary">✓</span> {feat}</li>
                      ))}
                      {pkg.features.length > 3 && <li className="text-xs text-gray-500 italic">+{pkg.features.length - 3} fitur lainnya</li>}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setNewPackage({...pkg, features: pkg.features.join(', ')});
                        setShowPackageModal(true);
                      }} 
                      className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDeletePackage(pkg._id)} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg text-sm transition-colors">Hapus</button>
                  </div>
                </div>
              ))}
              {dbPackages.length === 0 && <div className="col-span-full text-center text-gray-400 py-8">Belum ada paket/promo.</div>}
            </div>
          </div>

          {showPackageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h3 className="text-xl font-bold mb-4">{newPackage._id ? 'Edit Paket/Promo' : 'Tambah Paket/Promo'}</h3>
                <form onSubmit={handleAddPackage} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nama Paket/Promo</label>
                    <input required type="text" value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Kecepatan (Mbps)</label>
                      <input required type="number" value={newPackage.speed} onChange={e => setNewPackage({...newPackage, speed: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" style={{ MozAppearance: 'textfield' }} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Harga (Rp)</label>
                      <input required type="number" value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" style={{ MozAppearance: 'textfield' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm text-gray-400 mb-1">Kategori</label>
                      <button
                        type="button"
                        onClick={() => setOpenCategoryDropdown(!openCategoryDropdown)}
                        onBlur={() => setTimeout(() => setOpenCategoryDropdown(false), 200)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary flex items-center justify-between transition-colors hover:bg-white/5"
                      >
                        <span>{newPackage.category || 'Pilih Kategori'}</span>
                        <svg className={`w-4 h-4 ml-2 transition-transform ${openCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                      
                      <div className={`absolute left-0 top-full mt-1 w-full bg-[#0f172a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 transition-all duration-200 origin-top ${openCategoryDropdown ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        {['Internet', 'Promo', 'Internet + Movie', 'Internet + Game', 'Internet + TV'].map((cat) => (
                          <div 
                            key={cat}
                            onClick={() => {
                              setNewPackage({...newPackage, category: cat});
                              setOpenCategoryDropdown(false);
                            }}
                            className={`px-4 py-2.5 text-sm text-left cursor-pointer transition-colors hover:bg-primary/80 ${newPackage.category === cat ? 'bg-primary/20 text-white font-medium' : 'text-gray-200'}`}
                          >
                            {cat}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm text-gray-400 mb-1">Label / Badge</label>
                      <button
                        type="button"
                        onClick={() => setOpenBadgeDropdown(!openBadgeDropdown)}
                        onBlur={() => setTimeout(() => setOpenBadgeDropdown(false), 200)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary flex items-center justify-between transition-colors hover:bg-white/5"
                      >
                        <span>{newPackage.badge || 'Tidak Ada'}</span>
                        <svg className={`w-4 h-4 ml-2 transition-transform ${openBadgeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                      
                      <div className={`absolute left-0 top-full mt-1 w-full bg-[#0f172a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 transition-all duration-200 origin-top ${openBadgeDropdown ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        {['', 'Paling Populer', 'Paling Murah', 'Paling Bervalue'].map((b, i) => (
                          <div 
                            key={i}
                            onClick={() => {
                              setNewPackage({...newPackage, badge: b});
                              setOpenBadgeDropdown(false);
                            }}
                            className={`px-4 py-2.5 text-sm text-left cursor-pointer transition-colors hover:bg-primary/80 ${newPackage.badge === b ? 'bg-primary/20 text-white font-medium' : 'text-gray-200'}`}
                          >
                            {b === '' ? 'Tidak Ada' : b}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Fitur (pisahkan dengan koma)</label>
                    <textarea required value={newPackage.features} onChange={e => setNewPackage({...newPackage, features: e.target.value})} placeholder="Unlimited Kuota, Free Router..." className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary h-20"></textarea>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setShowPackageModal(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors">Batal</button>
                    <button type="submit" className="flex-1 py-2 rounded-lg bg-primary hover:bg-indigo-500 text-white font-bold transition-colors">Simpan</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          </>
        );
      case 'users':
        return (
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-4">Database Pelanggan</h2>
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u._id}>
                    <td className="p-3 text-white">{u.name}</td>
                    <td className="p-3 text-gray-400">{u.email}</td>
                    <td className="p-3"><span className="px-2 py-1 bg-white/10 rounded text-xs">{u.role}</span></td>
                    <td className="p-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'employees':
        return (
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Data Pegawai</h2>
              <button onClick={() => { setEmpForm({ id: '', name: '', email: '', phone: '', role: 'cs', password: '' }); setShowEmpModal(true); }} className="bg-primary hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">+ Tambah Pegawai</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {employees.map(emp => (
                <div key={emp._id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl uppercase ${
                    emp.role === 'cs' ? 'bg-blue-500/20 text-blue-400' :
                    emp.role === 'manager' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {emp.role.substring(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-white capitalize">{emp.name}</div>
                    <div className="text-xs text-gray-400">{emp.email} • {emp.phone}</div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => { setEmpForm({ id: emp._id, name: emp.name, email: emp.email, phone: emp.phone, role: emp.role, password: '' }); setShowEmpModal(true); }} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white">Edit</button>
                    {user.role === 'owner' && <button onClick={() => handleDeleteEmployee(emp._id)} className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 px-2 py-1 rounded">Hapus</button>}
                  </div>
                </div>
              ))}
              {employees.length === 0 && <div className="text-gray-400 text-sm">Belum ada pegawai.</div>}
            </div>
          </div>
        );
      case 'audit':
        return (
          <div className="glass-card p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-6">Log Aktivitas Sistem</h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {logs.length === 0 ? (
                <div className="text-gray-400 text-sm">Belum ada aktivitas tercatat.</div>
              ) : (
                logs.map(log => (
                  <div key={log._id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-start gap-4">
                    <div className="bg-primary/20 text-primary p-2 rounded-lg mt-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-white text-sm capitalize">{log.user ? log.user.name : 'System'} <span className="text-xs text-gray-500 ml-1">({log.user ? log.user.role : 'bot'})</span></span>
                        <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="text-sm">
                        <span className={`text-xs px-2 py-0.5 rounded mr-2 ${log.action === 'MEMBUAT' ? 'bg-green-500/20 text-green-400' : log.action === 'MENGHAPUS' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{log.action}</span>
                        <span className="text-gray-400 mr-2">[{log.target}]</span>
                        <span className="text-gray-200">{log.details}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'staffChat':
        return (
          <div className="glass-card p-6 h-[75vh] flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Internal Staff Chat</h2>
            <div className="flex-1 flex flex-col bg-black/20 border border-white/10 rounded-xl overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {staffMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">Belum ada obrolan staff.</div>
                ) : (
                  staffMessages.map(msg => {
                    const isMe = msg.sender && msg.sender._id === user._id;
                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] text-gray-400 mb-1 ml-1">
                            {msg.sender ? `${msg.sender.name} (${msg.sender.role})` : 'Unknown Staff'}
                          </span>
                          <div className={`p-3 rounded-lg ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={handleSendStaffMessage} className="p-4 border-t border-white/10 bg-black/20 flex gap-2">
                <input 
                  type="text" 
                  value={staffChatInput}
                  onChange={e => setStaffChatInput(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary text-white" 
                  placeholder="Kirim pesan ke staff lain..." 
                />
                <button type="submit" disabled={!staffChatInput.trim()} className="bg-primary hover:bg-indigo-500 px-6 py-2 rounded-lg font-bold disabled:opacity-50 transition-colors">
                  Kirim
                </button>
              </form>
            </div>
          </div>
        );
      default:
        return <div className="text-gray-400">Pilih menu di sidebar.</div>;
    }
  };

  return (
    <PageTransition>
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-2xl backdrop-blur-md flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
          toast.type === 'error' ? 'bg-red-500/90 text-white border border-red-500' : 'bg-green-500/90 text-white border border-green-500'
        }`}>
          {toast.type === 'error' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="min-h-screen bg-[#070709] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Expanding Sidebar (Hover to Expand) - Absolute positioned to prevent Canvas resize layout thrashing */}
        <div className="absolute top-0 left-0 h-full group w-20 hover:w-64 bg-black/80 backdrop-blur-md border-r border-white/10 p-4 flex flex-col z-30 transition-all duration-500 ease-in-out overflow-hidden shadow-2xl">
          {/* Logo Section */}
          <div className="mb-10 flex items-center gap-4 h-12 overflow-hidden">
            <div className="flex-shrink-0 w-12 flex justify-center">
              <img src={FarosaLogo} alt="Farosa WiFi" className="h-10 w-10 object-cover rounded-md" />
            </div>
            
            {/* Tulisan lengkap saat di-hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap flex flex-col justify-center">
              <p className="text-lg font-bold text-white tracking-wide">Farosa Admin</p>
              <p className="text-xs text-gray-500 mt-0.5 capitalize">Role: {user.role}</p>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2">
            {availableTabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group/btn relative overflow-hidden w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 text-left border ${
                  activeTab === tab.id 
                    ? 'text-white border-primary/50 shadow-[0_0_15px_rgba(79,70,229,0.2)]' 
                    : 'text-gray-400 hover:text-white border-transparent'
                }`}
                title={tab.label}
              >
                {/* Animated Background Sweep */}
                <div className={`absolute inset-0 z-0 origin-left transition-transform duration-500 ease-in-out ${
                  activeTab === tab.id ? 'scale-x-100 bg-primary/30' : 'scale-x-0 group-hover/btn:scale-x-100 bg-primary/40'
}`}></div>
                
                <span className="relative z-10 flex-shrink-0 w-6 flex items-center justify-center">{tab.icon}</span>
                <span className="relative z-10 font-medium text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150">{tab.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="pt-6 border-t border-white/10">
            <button onClick={() => navigate('/')} className="group/btn relative overflow-hidden w-full flex items-center gap-4 px-3 py-3 rounded-xl text-gray-400 hover:text-white transition-colors text-left border border-transparent" title="Kembali ke Web">
               {/* Animated Background Sweep */}
               <div className="absolute inset-0 z-0 origin-left scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500 ease-in-out bg-white/10"></div>
               
              <span className="relative z-10 flex-shrink-0 w-6 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              </span>
              <span className="relative z-10 font-medium text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150">Kembali ke Web</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`relative z-10 h-screen w-full flex flex-col ${activeTab === 'chat' ? 'pl-20' : 'pl-24 pr-8 py-8 overflow-y-auto'}`}>
          <div className="w-full h-full">
            {renderContent()}
          </div>
        </div>
      </div>
      
      {/* Employee Form Modal */}
      {showEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowEmpModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h3 className="text-2xl font-bold mb-6 text-white">{empForm.id ? 'Edit Pegawai' : 'Tambah Pegawai'}</h3>
            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nama Lengkap</label>
                <input required type="text" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input required type="email" value={empForm.email} onChange={e => setEmpForm({...empForm, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">No HP</label>
                <input required type="text" value={empForm.phone} onChange={e => setEmpForm({...empForm, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role</label>
                <select value={empForm.role} onChange={e => setEmpForm({...empForm, role: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary">
                  <option value="cs">CS (Customer Service)</option>
                  <option value="manager">Manager</option>
                  {user.role === 'owner' && <option value="admin">Admin</option>}
                  {user.role === 'owner' && <option value="owner">Owner</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">{empForm.id ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'}</label>
                <input type="password" required={!empForm.id} minLength="6" value={empForm.password} onChange={e => setEmpForm({...empForm, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary" />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-indigo-500 text-white py-3 rounded-lg font-bold transition-all">Simpan</button>
            </form>
          </div>
        </div>
      )}
      {showRevenueDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setShowRevenueDetails(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h3 className="text-2xl font-bold mb-6 text-white">Detail Pendapatan</h3>
              <div className="w-full h-64">
                <div className="w-full h-full flex flex-col justify-end relative">
                  <svg viewBox="0 0 100 50" className="w-full h-full text-yellow-500 overflow-visible">
                    {/* Grid */}
                    <line x1="5" y1="12.5" x2="95" y2="12.5" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1="5" y1="25" x2="95" y2="25" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1="5" y1="37.5" x2="95" y2="37.5" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="0.5" strokeDasharray="2 2" />
                    
                    {/* Area */}
                    <path d="M8,42 L32,28 L62,18 L92,6 L92,48 L8,48 Z" fill="currentColor" opacity="0.08" />
                    {/* Minimal Line */}
                    <path d="M8,42 L32,28 L62,18 L92,6" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="8" cy="42" r="1.8" fill="currentColor" />
                    <circle cx="32" cy="28" r="1.8" fill="currentColor" />
                    <circle cx="62" cy="18" r="1.8" fill="currentColor" />
                    <circle cx="92" cy="6" r="2.2" fill="currentColor" className="animate-pulse" />
                  </svg>
                  <div className="flex justify-between text-xs text-gray-400 mt-3 px-2">
                    <span>Minggu 1</span>
                    <span>Minggu 2</span>
                    <span>Minggu 3</span>
                    <span>Minggu 4</span>
                  </div>
                </div>
              </div>
          </div>
        </div>
      )}

      {showBandwidthDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setShowBandwidthDetails(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h3 className="text-2xl font-bold mb-6 text-white">Detail Bandwidth Load</h3>
            <div className="w-full h-64">
              <div className="w-full h-full flex flex-col justify-end relative">
                <svg viewBox="0 0 100 50" className="w-full h-full text-cyan-400 overflow-visible">
                  {/* Grid */}
                  <line x1="5" y1="12.5" x2="95" y2="12.5" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="5" y1="25" x2="95" y2="25" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="5" y1="37.5" x2="95" y2="37.5" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="0.5" strokeDasharray="2 2" />
                  
                  {/* Area */}
                  <path d="M5,42 Q25,18 45,30 T80,10 T95,15 L95,48 L5,48 Z" fill="currentColor" opacity="0.08" />
                  {/* Minimal Line */}
                  <path d="M5,42 Q25,18 45,30 T80,10 T95,15" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                  <circle cx="95" cy="15" r="2" fill="currentColor" />
                </svg>
                <div className="flex justify-between text-xs text-gray-400 mt-3 px-2">
                  <span>00:00</span>
                  <span>04:00</span>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                  <span>20:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </PageTransition>
  );
};

export default AdminDashboard;

