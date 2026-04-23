import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, User, MapPin } from 'lucide-react';
import axios from 'axios';

const IntakeModal = ({ isOpen, onClose, appointment, onComplete }) => {
  const [hubs, setHubs] = useState([]);
  const [bloodData, setBloodData] = useState({
    bloodGroup: 'O+',
    volume: 450,
    component: 'Whole Blood',
    hubId: '' // The new state for the selected location
  });

  // Fetch active hubs when the modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchHubs = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/hubs');
          setHubs(res.data);
          // Auto-select the first hub to save time
          if (res.data.length > 0) {
            setBloodData(prev => ({ ...prev, hubId: res.data[0]._id }));
          }
        } catch (err) {
          console.error("Failed to fetch hubs", err);
        }
      };
      fetchHubs();
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    try {
      if (!bloodData.hubId) {
        return alert("Critical Error: You must assign this unit to a Network Hub.");
      }

      const payload = {
        appointmentId: appointment._id,
        userId: appointment.userId,
        donorName: appointment.donorName,
        bloodGroup: bloodData.bloodGroup,
        volume: Number(bloodData.volume),
        component: bloodData.component,
        hubId: bloodData.hubId // <--- Send the selected hub to the backend
      };

      await axios.post('http://localhost:5000/api/inventory/promote', payload);

      onComplete(); 
      onClose();
    } catch (err) {
      alert("Intake failed: " + err.message);
    }
  };

  if (!appointment) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Clinical <span className="text-red-600">Intake</span></h2>
                <div className="flex items-center gap-2 mt-2">
                   <div className="p-1 bg-red-50 text-red-600 rounded-md"><User size={12}/></div>
                   <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{appointment.donorName}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"><X size={20}/></button>
            </div>

            <div className="space-y-8">
              
              {/* --- NEW: HUB SELECTOR --- */}
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-red-600" /> Storage Location
                </label>
                {hubs.length === 0 ? (
                  <p className="text-xs font-bold text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                    No active hubs found. Please create a hub in the Hub Manager first.
                  </p>
                ) : (
                  <select 
                    value={bloodData.hubId}
                    onChange={(e) => setBloodData({...bloodData, hubId: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none font-bold text-slate-700 shadow-sm"
                  >
                    {hubs.map(hub => (
                      <option key={hub._id} value={hub._id}>{hub.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Group Selection */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Verify Blood Group</label>
                <div className="grid grid-cols-4 gap-2">
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setBloodData({...bloodData, bloodGroup: type})}
                      className={`py-3 rounded-2xl font-black text-xs border-2 transition-all ${bloodData.bloodGroup === type ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume Slider */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                  Collection Volume <span>{bloodData.volume}ml</span>
                </label>
                <input 
                  type="range" min="350" max="500" step="10"
                  value={bloodData.volume}
                  onChange={(e) => setBloodData({...bloodData, volume: e.target.value})}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600 mt-4" 
                />
              </div>

              <button 
                onClick={handleConfirm}
                disabled={hubs.length === 0} // Disable if no hubs exist
                className="w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                Confirm Collection <Check size={22}/>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default IntakeModal;