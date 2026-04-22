import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalIcon, Clock, CheckCircle, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const BookingModal = ({ isOpen, onClose, user }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  // Overkill Date Generator (Next 7 days)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      num: d.getDate()
    };
  });

  const slots = ["09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM", "05:30 PM"];

  const handleBook = async () => {
  // 1. Safety Check: If the user isn't logged in correctly, stop here.
  if (!user || !user._id) {
    console.error("User data is missing:", user);
    return alert("Session Error: Please log out and log back in to refresh your ID.");
  }

  const payload = {
    userId: user._id, // This was the missing link!
    donorName: user.name || "Anonymous Donor",
    date: selectedDate,
    timeSlot: selectedSlot
  };

  setIsBooking(true);
  try {
    const res = await axios.post('http://localhost:5000/api/appointments/book', payload);
    
    if (res.data.success) {
      alert("✅ APPOINTMENT LOCKED IN!");
      onClose();
    }
  } catch (err) {
    // Show the actual error message from the backend
    alert(`Booking Failed: ${err.response?.data?.message || "Unknown Error"}`);
  } finally {
    setIsBooking(false);
  }
};

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-8 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                  Reserve <span className="text-red-600">Slot</span>
                </h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Select your donation window</p>
              </div>
              <button onClick={onClose} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 pt-0 space-y-8">
              {/* Horizontal Date Picker */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <CalIcon size={14} /> Available Dates
                </label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {dates.map((d) => (
                    <button
                      key={d.full}
                      onClick={() => setSelectedDate(d.full)}
                      className={`flex-shrink-0 w-20 py-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-1 ${selectedDate === d.full ? 'bg-black border-black text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                    >
                      <span className="text-[10px] font-black uppercase">{d.day}</span>
                      <span className="text-xl font-black">{d.num}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} /> Select Time
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-4 rounded-2xl border-2 font-bold text-sm transition-all ${selectedSlot === slot ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Safety Banner */}
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex gap-3">
                <ShieldCheck className="text-green-600 shrink-0" size={18} />
                <p className="text-[10px] font-bold text-green-700 leading-tight uppercase">
                  Confirmed slots include a pre-donation health screening and 15-minute post-care recovery.
                </p>
              </div>

              {/* Action */}
              <button 
                onClick={handleBook}
                disabled={isBooking || !selectedDate || !selectedSlot}
                className="w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:hover:bg-black"
              >
                {isBooking ? "Confirming..." : "Confirm Appointment"} <CheckCircle size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;