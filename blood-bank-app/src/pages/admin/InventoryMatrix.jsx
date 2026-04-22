import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Search, Filter, Download, MoreHorizontal, AlertOctagon, 
  CheckCircle2, Clock, Trash2, Send, Beaker, ShieldAlert, User
} from 'lucide-react';

const InventoryMatrix = () => {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('All');
  const [selectedUnits, setSelectedUnits] = useState([]);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:5000/api/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error("Matrix Sync Failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(unit => {
    const matchesSearch = unit.unitId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (unit.donorName && unit.donorName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGroup = filterGroup === 'All' || unit.bloodGroup === filterGroup;
    return matchesSearch && matchesGroup;
  });

  const handlePurge = async (id) => {
    if (window.confirm("WARNING: Purging this unit will permanently remove it from the Atlas database. Proceed?")) {
      try {
        await axios.delete(`http://localhost:5000/api/inventory/${id}`);
        setInventory(prev => prev.filter(unit => unit._id !== id));
      } catch (err) {
        alert("Purge failed.");
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedUnits.length === filteredInventory.length) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits(filteredInventory.map(u => u._id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedUnits.includes(id)) {
      setSelectedUnits(prev => prev.filter(unitId => unitId !== id));
    } else {
      setSelectedUnits(prev => [...prev, id]);
    }
  };

  const getExpiryHealth = (collection, expiry) => {
    const total = new Date(expiry) - new Date(collection);
    const remaining = new Date(expiry) - new Date();
    const percent = Math.max(0, Math.min(100, (remaining / total) * 100));
    return percent;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans h-screen overflow-hidden">
      
      {/* MATRIX HEADER */}
      <header className="bg-white border-b border-gray-200 px-8 py-6 z-10 shrink-0">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Beaker size={20} /></div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inventory Matrix</h1>
            </div>
            <p className="text-gray-500 font-medium text-sm">Advanced telemetry and stock manipulation</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
              <Download size={18} /> Export CSV
            </button>
            {selectedUnits.length > 0 && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 flex items-center gap-2"
              >
                Bulk Dispatch ({selectedUnits.length})
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* CONTROL PANEL */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-gray-200 px-8 py-4 shrink-0 z-10">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search Unit ID or Donor Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-2.5 outline-none focus:ring-4 ring-red-500/10 focus:border-red-500 font-medium transition-all shadow-sm text-gray-800"
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Group:</span>
              <select 
                value={filterGroup} 
                onChange={(e) => setFilterGroup(e.target.value)}
                className="bg-transparent border-none text-sm font-black text-gray-800 focus:ring-0 outline-none cursor-pointer"
              >
                {['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(grp => (
                  <option key={grp} value={grp}>{grp}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* THE DATA GRID */}
      <main className="flex-1 overflow-auto p-8 relative">
        <div className="max-w-screen-2xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-20">
              <tr>
                <th className="p-5 border-b border-gray-100 w-12">
                  <input type="checkbox" onChange={toggleSelectAll} checked={selectedUnits.length === filteredInventory.length && filteredInventory.length > 0} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                </th>
                <th className="p-5 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest">Unit ID</th>
                <th className="p-5 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest">Donor Identity</th>
                <th className="p-5 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest">Blood Group</th>
                <th className="p-5 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest">Viability Timeline</th>
                <th className="p-5 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="p-5 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredInventory.map((unit) => {
                  const healthPercent = getExpiryHealth(unit.collectionDate, unit.expiryDate);
                  const isExpiring = healthPercent < 20;

                  return (
                    <motion.tr 
                      key={unit._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, backgroundColor: '#fee2e2' }}
                      className={`group transition-colors ${selectedUnits.includes(unit._id) ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="p-5">
                        <input 
                          type="checkbox" 
                          checked={selectedUnits.includes(unit._id)}
                          onChange={() => toggleSelect(unit._id)}
                          className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" 
                        />
                      </td>
                      
                      <td className="p-5">
                        <div className="font-mono text-sm font-black text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg inline-block border border-gray-200 shadow-inner">
                          {unit.unitId}
                        </div>
                      </td>

                      {/* --- DONOR NAME CELL --- */}
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <span className="text-sm font-black text-gray-700 uppercase tracking-tight">
                            {unit.donorName || "NEXUS.DONOR"}
                          </span>
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 flex items-center justify-center shadow-sm">
                          <span className="text-red-700 font-black text-xl">{unit.bloodGroup}</span>
                        </div>
                      </td>

                      <td className="p-5 min-w-[250px]">
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-gray-500">Col: {new Date(unit.collectionDate).toLocaleDateString()}</span>
                          <span className={`${isExpiring ? 'text-red-600 animate-pulse' : 'text-gray-500'}`}>
                            Exp: {new Date(unit.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isExpiring ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${healthPercent}%` }}
                          />
                        </div>
                      </td>

                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-full ${unit.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                            {unit.status === 'available' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                          </div>
                          <span className="text-sm font-bold text-gray-700 capitalize">{unit.status}</span>
                        </div>
                      </td>

                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Send size={18} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                            <ShieldAlert size={18} />
                          </button>
                          <div className="w-px h-6 bg-gray-200 self-center mx-1"></div>
                          <button 
                            onClick={() => handlePurge(unit._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          
          {!isLoading && filteredInventory.length === 0 && (
            <div className="p-16 text-center">
              <AlertOctagon size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">No matching units found</h3>
              <p className="text-gray-500">Adjust your filters or query to find what you're looking for.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default InventoryMatrix;