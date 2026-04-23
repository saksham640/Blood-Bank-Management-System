import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Droplet, MapPin, Clock } from 'lucide-react';

const RecentInventory = ({ inventory }) => {
  const navigate = useNavigate();

  // Get the last 7 units added to the system
  const recentUnits = [...inventory]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 7);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden mt-8"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Recent Inventory Acquisitions</h3>
          <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">Last 7 Telemetry Logs</p>
        </div>
        <button 
          onClick={() => navigate('/admin/matrix')}
          className="text-[10px] font-black uppercase text-red-600 hover:underline"
        >
          View Full Matrix
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit ID</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Group</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Hub</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Donor</th>
              <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recentUnits.map((unit) => (
              <tr key={unit._id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-4">
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                    {unit.unitId}
                  </span>
                </td>
                <td className="py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Droplet size={12} className="text-red-600" fill="currentColor" />
                    <span className="font-black text-sm">{unit.bloodGroup}</span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin size={12} />
                    <span className="text-xs font-bold truncate max-w-[120px]">
                      {unit.hubId?.name || "Unassigned"}
                    </span>
                  </div>
                </td>
                <td className="py-4">
                  <p className="text-xs font-black text-slate-700 uppercase italic">
                    {unit.donorName || "Walk-in"}
                  </p>
                </td>
                <td className="py-4 text-right">
                  <button 
                    onClick={() => navigate('/admin/matrix')}
                    className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-all shadow-sm"
                    title="Deep Dive in Matrix"
                  >
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default RecentInventory;