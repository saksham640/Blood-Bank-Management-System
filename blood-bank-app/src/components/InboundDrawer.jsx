import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Droplet, Calendar, Hash, Save, ShieldCheck, MapPin, User } from 'lucide-react';
import axios from 'axios';

const InboundDrawer = ({ isOpen, onClose, refreshData }) => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [hubs, setHubs] = useState([]);

  // Fetch Hubs so we can assign the unit to a location
  useEffect(() => {
    if (isOpen) {
      const fetchHubs = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/hubs');
          setHubs(res.data);
          // Auto-select first hub if available
          if (res.data.length > 0) setValue("hubId", res.data[0]._id);
        } catch (err) {
          console.error("Failed to fetch hubs", err);
        }
      };
      fetchHubs();
    }
  }, [isOpen, setValue]);

  const onSubmit = async (data) => {
    try {
      // Ensure numeric conversion for safety if your backend expects it
      const payload = {
        ...data,
        status: 'testing' // Manual inbound usually goes to testing first
      };

      await axios.post('http://localhost:5000/api/inventory/add', payload);
      refreshData(); 
      reset();
      onClose();
    } catch (err) {
      console.error("Failed to add unit", err);
      alert("Registration failed. Ensure all fields (including Hub) are selected.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[60]"
          />

          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[70] p-8 flex flex-col overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Inbound <span className="text-red-600">Unit</span></h2>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Manual Inventory Entry</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6">
              
              {/* HUB SELECTOR (Crucial for Map Integration) */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={14} className="text-red-500" /> Storage Hub
                </label>
                <select 
                  {...register("hubId", { required: true })}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-red-600/30 font-bold text-gray-800"
                >
                  <option value="">Select a Location...</option>
                  {hubs.map(hub => (
                    <option key={hub._id} value={hub._id}>{hub.name}</option>
                  ))}
                </select>
              </div>

              {/* DONOR NAME */}
              <DrawerInput 
                label="Donor Name" 
                icon={<User />} 
                register={register("donorName", { required: true })} 
                placeholder="Full Name (e.g. Saksham Aneja)" 
              />

              {/* BLOOD GROUP SELECTOR */}
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Droplet size={14} className="text-red-500" /> Blood Group
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((type) => (
                    <label key={type} className="relative cursor-pointer group">
                      <input type="radio" value={type} {...register("bloodGroup", { required: true })} className="peer sr-only" />
                      <div className="p-3 text-center rounded-xl border-2 border-gray-100 font-black text-gray-400 peer-checked:border-red-600 peer-checked:bg-red-50 peer-checked:text-red-600 group-hover:border-gray-200 transition-all">
                        {type}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* UNIT DETAILS */}
              <div className="space-y-4">
                <DrawerInput label="Unit ID (Barcode)" icon={<Hash />} register={register("unitId", { required: true })} placeholder="NEX-XXXX-XXXX" />
                <div className="grid grid-cols-2 gap-4">
                  <DrawerInput label="Collection" type="date" icon={<Calendar />} register={register("collectionDate", { required: true })} />
                  <DrawerInput label="Expiry" type="date" icon={<Calendar />} register={register("expiryDate", { required: true })} />
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                <ShieldCheck className="text-amber-600 shrink-0" />
                <p className="text-[10px] font-bold text-amber-700 leading-tight uppercase">
                  Units registered manually are marked for <span className="underline">Testing</span>. They will appear in the Matrix but are restricted from immediate Hospital Dispatch.
                </p>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                Deploy Unit to Matrix <Save size={20} />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Reusable Input Component
const DrawerInput = ({ label, icon, register, type = "text", placeholder }) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
      {React.cloneElement(icon, { size: 14, className: "text-gray-400" })} {label}
    </label>
    <input 
      type={type} 
      {...register}
      placeholder={placeholder}
      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-red-600/30 focus:bg-white transition-all font-bold text-gray-800"
    />
  </div>
);

export default InboundDrawer;