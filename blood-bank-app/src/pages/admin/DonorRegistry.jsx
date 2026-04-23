import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Trash2, ShieldAlert, Droplet, 
  Mail, MapPin, Calendar, ArrowUpRight, Filter 
} from 'lucide-react';
import axios from 'axios';

const DonorRegistry = () => {
  const [donors, setDonors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchDonors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/donors');
      setDonors(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Registry Sync Error", err);
    }
  };

  useEffect(() => { fetchDonors(); }, []);

  const deleteDonor = async (id) => {
    if (window.confirm("CRITICAL: Terminating this account will erase all historical impact data. Proceed?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
        setDonors(prev => prev.filter(d => d._id !== id));
      } catch (err) { alert("Action Failed."); }
    }
  };

  const filteredDonors = donors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    
    <div className="min-h-screen bg-[#f8fafc] p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER & STATS --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Donor <span className="text-red-600">Registry</span></h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Personnel Management & Impact Tracking</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by Name or Email..." 
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-red-600/20 focus:ring-4 ring-red-600/5 font-bold transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* --- DONOR DATA TABLE --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Identity</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Group</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Impact Stats</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {filteredDonors.map((donor) => (
                    <motion.tr 
                      key={donor._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Identity Column */}
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-lg italic shadow-lg">
                            {donor.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 uppercase italic tracking-tight">{donor.name}</p>
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1"><Mail size={12}/> {donor.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Blood Group Column */}
                      <td className="p-6 text-center">
                        <span className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-sm border border-red-100">
                          {donor.bloodGroup}
                        </span>
                      </td>

                      {/* Impact Stats */}
                      <td className="p-6">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Units</p>
                            <p className="font-black text-slate-700">{donor.donationsCount || 0}</p>
                          </div>
                          <div className="h-8 w-px bg-slate-100" />
                          <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Total Vol</p>
                            <p className="font-black text-slate-700">{donor.totalVolume || 0}ml</p>
                          </div>
                        </div>
                      </td>

                      {/* Date Column */}
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                          <Calendar size={14} className="text-slate-300" />
                          {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'No Records'}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                           <button className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                             <ArrowUpRight size={18} />
                           </button>
                           <button 
                             onClick={() => deleteDonor(donor._id)}
                             className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                           >
                             <Trash2 size={18} />
                           </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {filteredDonors.length === 0 && !isLoading && (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <div className="p-6 bg-slate-50 rounded-full text-slate-200"><Users size={48} /></div>
                <p className="font-black uppercase tracking-widest text-slate-400 text-xs">No personnel found matching criteria</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DonorRegistry;