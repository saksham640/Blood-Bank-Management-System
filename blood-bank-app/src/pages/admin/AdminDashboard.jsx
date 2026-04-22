import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import {
  Droplet, Activity, Users, AlertCircle, Search, Bell, Settings,
  Menu, X, Plus, Filter, MoreVertical, MapPin, TrendingUp, ShieldAlert, Clock, Calendar
} from 'lucide-react';
import axios from 'axios';

// Components
import InboundDrawer from '../../components/InboundDrawer';
import IntakeModal from '../admin/IntakeModal'; 

// --- MOCK DATA ---
const supplyData = [
  { name: 'Mon', donations: 40, requests: 24 }, { name: 'Tue', donations: 30, requests: 35 },
  { name: 'Wed', donations: 55, requests: 28 }, { name: 'Thu', donations: 45, requests: 50 },
  { name: 'Fri', donations: 60, requests: 42 }, { name: 'Sat', donations: 80, requests: 55 },
  { name: 'Sun', donations: 75, requests: 48 },
];

const bloodStock = [
  { group: 'A+', count: 142, fill: '#ef4444' }, { group: 'A-', count: 34, fill: '#f87171' },
  { group: 'B+', count: 98, fill: '#ef4444' }, { group: 'B-', count: 12, fill: '#fca5a5' },
  { group: 'O+', count: 210, fill: '#b91c1c' }, { group: 'O-', count: 45, fill: '#dc2626' },
  { group: 'AB+', count: 56, fill: '#ef4444' }, { group: 'AB-', count: 8, fill: '#fef2f2' },
];

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
};

const AdminDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, donors: 0, expiring: 0 });
  
  // Triage & Request States
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isIntakeOpen, setIntakeOpen] = useState(false);
  const [requests, setRequests] = useState([]);

  // 1. Fetch Inventory & Stats
  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inventory');
      setInventory(res.data);
      const total = res.data.length;
      const expiring = res.data.filter(unit => {
        const daysToExpiry = (new Date(unit.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
        return daysToExpiry > 0 && daysToExpiry < 2;
      }).length;
      setStats(prev => ({ ...prev, total, expiring }));
    } catch (err) {
      console.error("Dashboard Sync Failed:", err);
    }
  };

  // 2. Fetch Pending Appointments
  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/appointments');
      const pending = res.data.filter(a => a.status === 'scheduled');
      setAppointments(pending);
    } catch (err) {
      console.error("Failed to fetch triage queue", err);
    }
  };

  // 3. Fetch Hospital Requests
  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/requests');
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch hospital requests", err);
    }
  };

  // Match Logic
  const findMatch = (group) => {
    return inventory.find(unit => unit.bloodGroup === group && unit.status === 'available');
  };

  // Dispatch Logic
  const handleDispatch = async (requestId, inventoryId) => {
    try {
      await axios.delete(`http://localhost:5000/api/requests/resolve/${requestId}/${inventoryId}`);
      fetchDashboardData(); 
      fetchRequests();      
    } catch (err) { 
      alert("Dispatch failed"); 
    }
  };

  // THE FIX: Added fetchRequests to the initial load
  useEffect(() => {
    fetchDashboardData();
    fetchAppointments();
    fetchRequests(); 
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <motion.aside
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-gray-900 text-white flex flex-col justify-between hidden md:flex z-20 shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-12">
            <Droplet className="text-red-500 h-10 w-10" fill="currentColor" />
            {isSidebarOpen && (
              <span className="text-2xl font-black tracking-tight uppercase italic">
                Nexus<span className="text-red-500">.Admin</span>
              </span>
            )}
          </div>
          <nav className="space-y-2">
            {[
              { icon: Activity, label: 'Live Dashboard', active: true },
              { icon: Droplet, label: 'Inventory Matrix', path: '/admin/matrix' },
              { icon: Users, label: 'Donor Database' },
              { icon: ShieldAlert, label: 'Emergency Protocol' },
            ].map((item, idx) => (
              <Link key={idx} to={item.path || '#'}>
                <button className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                  <item.icon size={20} />
                  {isSidebarOpen && <span className="font-semibold">{item.label}</span>}
                </button>
              </Link>
            ))}
          </nav>
        </div>
      </motion.aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search Command Center..." className="w-96 pl-10 pr-4 py-2 bg-gray-100 rounded-xl outline-none text-sm font-medium" />
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-white font-bold border-2 border-white shadow-md">AD</div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ludhiana Hub Command</h1>
                <p className="text-gray-500 font-medium">Real-time telemetry and intake control</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDrawerOpen(true)} className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-600/20">
                  <Plus size={18} /> Inbound Unit
                </button>
              </div>
            </div>

            {/* --- TRIAGE SECTION: INCOMING APPOINTMENTS --- */}
            <AnimatePresence>
              {appointments.length > 0 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-900 rounded-[2.5rem] p-8 text-white overflow-hidden shadow-2xl border-b-8 border-red-600"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-black italic uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="text-red-500" size={20} /> Incoming Triage
                      </h2>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Live Donor Queue</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {appointments.map((appt) => (
                      <div key={appt._id} className="bg-slate-800/50 border border-slate-700 p-5 rounded-3xl flex justify-between items-center group hover:border-slate-500 transition-all">
                        <div>
                          <p className="font-black text-lg tracking-tight uppercase italic">{appt.donorName}</p>
                          <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase"><Clock size={12}/> {appt.timeSlot}</p>
                        </div>
                        <button onClick={() => { setSelectedAppt(appt); setIntakeOpen(true); }} className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-xl">Start Intake</button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --- HOSPITAL REQUESTS FEED --- */}
            <AnimatePresence>
              {requests.length > 0 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden"
                >
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Hospital Requisitions</h3>
                  <div className="space-y-4">
                    {requests.map(req => {
                      const match = findMatch(req.bloodGroup);
                      return (
                        <div key={req._id} className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <div>
                            <p className="font-black text-gray-900">{req.hospitalName}</p>
                            <p className="text-xs font-bold text-red-600 uppercase">Needs: {req.bloodGroup}</p>
                          </div>
                          
                          {match ? (
                            <button 
                              onClick={() => handleDispatch(req._id, match._id)}
                              className="px-6 py-3 bg-green-600 text-white font-black text-[10px] rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 uppercase"
                            >
                              Send {req.bloodGroup} (Match Found: {match.unitId})
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                              <AlertCircle size={14} /> No Matching Stock
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bento Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { title: 'Total Units Available', value: stats.total, icon: Droplet, color: 'text-red-600', bg: 'bg-red-100' },
                { title: 'Pending Hospital Requests', value: requests.length, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
                { title: 'Registered Donors', value: '8,430', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
                { title: 'Expiring < 48hrs', value: stats.expiring, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
              ].map((stat, idx) => (
                <motion.div key={idx} variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group overflow-hidden">
                  <div className={`p-3 rounded-2xl w-fit ${stat.bg} ${stat.color} mb-4`}><stat.icon size={24} /></div>
                  <h3 className="text-4xl font-black text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.title}</p>
                  <stat.icon className={`absolute -bottom-6 -right-6 w-32 h-32 opacity-5 ${stat.color} group-hover:scale-110 transition-transform`} />
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <motion.div variants={itemVariants} className="xl:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Supply vs Demand (7 Days)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={supplyData}>
                      <defs>
                        <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="donations" stroke="#dc2626" strokeWidth={3} fill="url(#colorDonations)" />
                      <Area type="monotone" dataKey="requests" stroke="#4b5563" strokeWidth={3} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Inventory by Group</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bloodStock} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="group" type="category" axisLine={false} tickLine={false} width={40} />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      <InboundDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} refreshData={fetchDashboardData} />
      
      {/* INTAKE MODAL */}
      {selectedAppt && (
        <IntakeModal 
          isOpen={isIntakeOpen}
          onClose={() => { setIntakeOpen(false); setSelectedAppt(null); }}
          appointment={selectedAppt}
          onComplete={() => { fetchDashboardData(); fetchAppointments(); }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;