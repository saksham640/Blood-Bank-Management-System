import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Droplet, User } from 'lucide-react';
import axios from 'axios';

const IntakeModal = ({ isOpen, onClose, appointment, onComplete }) => {
  const [bloodData, setBloodData] = useState({
    bloodGroup: 'O+',
    volume: 450,
    component: 'Whole Blood'
  });

  const handleConfirm = async () => {
    try {
      // Ensure we are passing everything the Matrix and User Stats need
      const payload = {
        appointmentId: appointment._id,
        userId: appointment.userId,
        donorName: appointment.donorName,
        bloodGroup: bloodData.bloodGroup,
        volume: Number(bloodData.volume), // Convert slider string to Number
        component: bloodData.component
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
          
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl">
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
              {/* Group Selection */}
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

              {/* Volume Slider */}
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
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
                className="w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-3"
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