import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, ResponsiveContainer, XAxis, Tooltip 
} from 'recharts';
import { 
  History, Plus, Droplets, Zap, ShieldCheck, Navigation, MapPin, Heart, Activity 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import BookingModal from "../user/BookingModal";

const UserPortal = () => {
  // --- 1. STATE & AUTH ---
  const { user, login } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState({ totalPints: 0, livesSaved: 0, history: [] });
  const [isLoading, setIsLoading] = useState(true);

  // --- 2. THE SYNC ENGINE ---
  // This function fetches fresh data from BOTH the User model and the Inventory records
  const refreshEverything = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      // A. Sync User Profile (Gets the latest donationsCount and bloodGroup)
      const userRes = await axios.get(`http://localhost:5000/api/auth/me/${user._id}`);
      if (userRes.data.success) {
        const freshUser = userRes.data.user;
        const currentToken = localStorage.getItem('token');
        // Update AuthContext so header/profile stays in sync
        login(freshUser, currentToken); 
      }

      // B. Sync Donation History (Gets the actual units for the graph/logs)
      const historyRes = await axios.get(`http://localhost:5000/api/inventory/user/${user._id}`);
      const historyData = historyRes.data;

      // C. Update Local Stats State
      setStats({
        totalPints: historyData.length,
        livesSaved: historyData.length * 3,
        history: historyData
      });
      
      console.log("🚀 Portal Synced with Atlas");
    } catch (err) {
      console.error("❌ Sync Engine Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, login]);

  // --- 3. EFFECTS ---
  useEffect(() => {
    refreshEverything();
    
    // Optional: Auto-refresh every 60 seconds in case Admin confirms while user is idle
    const interval = setInterval(refreshEverything, 60000);
    return () => clearInterval(interval);
  }, [refreshEverything]);

  // --- 4. DATA TRANSFORMATIONS ---
  const chartData = stats.history.length > 0 
    ? stats.history.reduce((acc, curr) => {
        const month = new Date(curr.collectionDate).toLocaleString('default', { month: 'short' });
        const existing = acc.find(item => item.month === month);
        if (existing) existing.count += 1;
        else acc.push({ month, count: 1 });
        return acc;
      }, []).reverse()
    : [{ month: 'N/A', count: 0 }];

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <motion.h1 
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="text-4xl font-black tracking-tight italic uppercase"
            >
              User<span className="text-red-600">.Hub</span>
            </motion.h1>
            <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">
              Identity: <span className="text-black">{user?.name || "Donor"}</span> | 
              Group: <span className="text-red-600">{user?.bloodGroup || "N/A"}</span>
            </p>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="bg-black text-white px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all flex items-center gap-2 shadow-xl"
          >
            <Plus size={18} /> BOOK APPOINTMENT
          </button>
        </header>

        {/* --- BENTO STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group"
          >
            <div className="relative z-10">
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-4">Total Impact</p>
              <div className="flex items-end gap-2">
                <h2 className="text-7xl font-black tracking-tighter">
                  {isLoading ? "..." : stats.totalPints}
                </h2>
                <span className="text-2xl font-black text-red-600 mb-2 italic underline decoration-4">Units</span>
              </div>
              <p className="mt-4 text-slate-500 font-bold leading-tight">
                Your contributions have directly supported the recovery of 
                <span className="text-black ml-1 font-black">{stats.livesSaved} lives</span>.
              </p>
            </div>
            <Droplets className="absolute -right-8 -bottom-8 w-48 h-48 text-red-50 opacity-[0.08]" />
          </motion.div>

          <div className="bg-red-600 text-white rounded-[2.5rem] p-8 flex flex-col justify-between group cursor-pointer relative overflow-hidden shadow-xl shadow-red-200">
            <Heart className="group-hover:scale-125 transition-transform z-10" />
            <div className="z-10">
              <h3 className="text-xl font-black uppercase mb-1">Impact Level</h3>
              <p className="text-red-100 text-[10px] font-black uppercase tracking-wider">Ludhiana Guardian</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          </div>

          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 flex flex-col justify-between">
            <ShieldCheck className="text-green-400" />
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Status</p>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Verified</h3>
            </div>
          </div>
        </div>

        {/* --- CHARTS & LOGS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div className="md:col-span-3 bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm h-80">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Contribution Pulse</h3>
            </div>
            <div className="h-full pb-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', fontWeight: '900' }} 
                  />
                  <Area type="step" dataKey="count" stroke="#ef4444" strokeWidth={5} fillOpacity={0.1} fill="#ef4444" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col h-80 overflow-y-auto scrollbar-hide">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <History size={16}/> Logs
            </h3>
            <div className="space-y-6">
              {stats.history.length > 0 ? stats.history.map((log, i) => (
                <div key={i} className="border-l-4 border-red-500 pl-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase">
                    {new Date(log.collectionDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-black uppercase italic text-slate-800 tracking-tight">
                    {log.bloodGroup} Collected
                  </p>
                </div>
              )) : (
                <p className="text-xs font-bold text-slate-400 italic">No records yet.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* --- MAP SECTION --- */}
        <motion.div className="md:col-span-4 bg-slate-100 rounded-[3rem] h-[400px] relative overflow-hidden border-8 border-white shadow-2xl">
          <div className="absolute top-8 left-8 z-10">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-white shadow-xl flex items-center gap-4">
              <Navigation className="text-red-600 animate-pulse" />
              <div>
                <h4 className="text-xs font-black uppercase italic">Network Telemetry</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precision Logistics Active</p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-[#e5e7eb] flex items-center justify-center">
            <div className="w-full h-full opacity-50 bg-[radial-gradient(#cbd5e1_2px,transparent_2px)] [background-size:32px_32px]" />
            <div className="absolute w-6 h-6 bg-red-500/20 rounded-full animate-ping" />
            <div className="absolute w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-2xl" />
          </div>
        </motion.div>

      </div>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        user={user} 
        onSuccess={refreshEverything} 
      />
    </div>
  );
};

export default UserPortal;