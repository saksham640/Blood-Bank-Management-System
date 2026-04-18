import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import {
  Droplet, Activity, Users, AlertCircle, Search, Bell, Settings,
  Menu, X, Plus, Filter, MoreVertical, MapPin, TrendingUp, ShieldAlert
} from 'lucide-react';
import InboundDrawer from '../../components/InboundDrawer';
import axios from 'axios'


// --- MOCK DATA (Simple Backend, Overkill Frontend) ---
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

const recentActivity = [
  { id: 'REQ-0992', type: 'Request', hospital: 'CMC Ludhiana', group: 'O-', status: 'Critical', time: '10 mins ago' },
  { id: 'DON-4412', type: 'Donation', hospital: 'Camp Alpha', group: 'A+', status: 'Testing', time: '1 hr ago' },
  { id: 'REQ-0991', type: 'Request', hospital: 'Fortis Hospital', group: 'B+', status: 'Dispatched', time: '2 hrs ago' },
  { id: 'SYS-001', type: 'Alert', hospital: 'System', group: 'AB-', status: 'Low Stock', time: '3 hrs ago' },
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
  const [isDrawerOpen, setDrawerOpen] = useState(false); // Added state
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, donors: 0, expiring: 0 });
  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inventory');
      setInventory(res.data);

      // Simple logic to calculate stats from the array
      const total = res.data.length;
      const expiring = res.data.filter(unit => {
        const daysToExpiry = (new Date(unit.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
        return daysToExpiry > 0 && daysToExpiry < 2; // Less than 48 hours
      }).length;

      setStats(prev => ({ ...prev, total, expiring }));
      console.log(res.data)
    } catch (err) {
      console.error("Dashboard Sync Failed:", err);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex overflow-hidden font-sans">

      {/* --- 1. OVERKILL SIDEBAR --- */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-gray-900 text-white flex flex-col justify-between hidden md:flex z-20 shadow-2xl"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-12">
            <div className="relative">
              <Droplet className="text-red-500 h-10 w-10" fill="currentColor" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
            </div>
            {isSidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-black tracking-tight">
                NEXUS<span className="text-red-500">.ADMIN</span>
              </motion.span>
            )}
          </div>

          <nav className="space-y-2">
            {[
              { icon: Activity, label: 'Live Dashboard', active: true },
              { icon: Droplet, label: 'Inventory Matrix' },
              { icon: Users, label: 'Donor Database' },
              { icon: MapPin, label: 'Camp Locations' },
              { icon: ShieldAlert, label: 'Emergency Protocol' },
            ].map((item, idx) => (
              <Link to="/admin/matrix">
                <button key={idx} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                  <item.icon size={20} className={item.active ? 'text-white' : ''} />
                  {isSidebarOpen && <span className="font-semibold">{item.label}</span>}
                </button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <button className="w-full flex items-center gap-4 px-4 py-3 text-gray-400 hover:bg-white/10 hover:text-white rounded-xl transition-all">
            <Settings size={20} />
            {isSidebarOpen && <span className="font-semibold">System Settings</span>}
          </button>
        </div>
      </motion.aside>

      {/* --- 2. MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Menu size={20} className="text-gray-700" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search Unit ID, Hospital, or Donor..." className="w-96 pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-red-500/20 outline-none text-sm font-medium transition-all" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-800 to-gray-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Grid */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8">

            {/* Header & Quick Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ludhiana Hub Command</h1>
                <p className="text-gray-500 font-medium mt-1">Real-time telemetry and inventory control</p>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center gap-2">
                  <Filter size={18} /> Generate Report
                </button>
                <button
                  onClick={() => setDrawerOpen(true)} // Set to true
                  className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 group"
                >
                  <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Inbound Unit
                </button>
              </div>
            </div>

            {/* --- BENTO BOX GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

              {/* Stat Cards */}
              {[
                { title: 'Total Units Available', value: stats.total, sub: '+12% from last week', icon: Droplet, color: 'text-red-600', bg: 'bg-red-100' },
                { title: 'Pending Hospital Requests', value: '28', sub: '5 marked as critical', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
                { title: 'Registered Donors', value: '8,430', sub: '+142 new this month', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
                { title: 'Expiring < 48hrs', value: '14', sub: 'Action required immediately', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
              ].map((stat, idx) => (
                <motion.div key={idx} variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                      <stat.icon size={24} />
                    </div>
                    <button className="text-gray-400 hover:text-gray-900"><MoreVertical size={20} /></button>
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-sm font-bold text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-xs font-semibold text-gray-400">{stat.sub}</p>

                  {/* Decorative background icon */}
                  <stat.icon className={`absolute -bottom-6 -right-6 w-32 h-32 opacity-5 group-hover:scale-110 transition-transform ${stat.color}`} />
                </motion.div>
              ))}
            </div>

            {/* --- CHARTS SECTION --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* Line Chart: Supply vs Demand */}
              <motion.div variants={itemVariants} className="xl:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Supply vs Demand (7 Days)</h3>
                  <select className="bg-gray-50 border-none text-sm font-bold text-gray-600 rounded-lg focus:ring-0 cursor-pointer outline-none">
                    <option>This Week</option><option>Last Month</option>
                  </select>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={supplyData}>
                      <defs>
                        <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4b5563" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#4b5563" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="donations" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorDonations)" />
                      <Area type="monotone" dataKey="requests" stroke="#4b5563" strokeWidth={3} fillOpacity={1} fill="url(#colorRequests)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Bar Chart: Blood Group Distribution */}
              <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Current Inventory by Group</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bloodStock} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="group" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 14, fontWeight: 900 }} width={40} />
                      <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold' }} />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* --- LIVE ACTION TABLE --- */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="text-red-500" size={20} /> Live Activity Log
                </h3>
                <button className="text-sm font-bold text-red-600 hover:text-red-700">View All Data &rarr;</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white">
                    <tr>
                      <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">ID / Reference</th>
                      <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Type</th>
                      <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Blood Group</th>
                      <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                      <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Time</th>
                      <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {inventory.map((unit) => (
                      <tr key={unit._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4">
                          <div className="font-mono text-sm font-bold text-gray-900">{unit.unitId}</div>
                          <div className="text-xs text-gray-500 font-medium tracking-tight">System Log: {new Date(unit.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 uppercase">
                            Inbound
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 font-black text-lg flex items-center justify-center border border-red-100 shadow-sm">
                            {unit.bloodGroup}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${unit.status === 'available' ? 'bg-green-500' : 'bg-amber-400'}`} />
                            <span className="text-sm font-bold text-gray-700 capitalize">{unit.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-500">
                          {new Date(unit.expiryDate).toDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <button className="px-4 py-2 bg-gray-900 text-white font-bold rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-all">
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>
      <InboundDrawer
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        refreshData={fetchDashboardData}
      />
    </div>
  );
};

export default AdminDashboard;