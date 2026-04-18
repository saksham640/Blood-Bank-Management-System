import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Droplet, Calendar, Hash, Save, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const InboundDrawer = ({ isOpen, onClose, refreshData }) => {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      // Simple logic: POST to your backend
      await axios.post('http://localhost:5000/api/inventory/add', data);
      refreshData(); // Refresh the dashboard list
      reset();
      onClose();
    } catch (err) {
      console.error("Failed to add unit", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[60]"
          />

          {/* Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[70] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Inbound <span className="text-red-600">Unit</span></h2>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Inventory Registration</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-8">
              {/* Overkill Input: Blood Group Selector */}
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Droplet size={14} className="text-red-500" /> Blood Group
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((type) => (
                    <label key={type} className="relative cursor-pointer group">
                      <input type="radio" value={type} {...register("bloodGroup")} className="peer sr-only" />
                      <div className="p-3 text-center rounded-xl border-2 border-gray-100 font-black text-gray-400 peer-checked:border-red-600 peer-checked:bg-red-50 peer-checked:text-red-600 group-hover:border-gray-200 transition-all">
                        {type}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Standard Inputs with Overkill Styling */}
              <div className="space-y-6">
                <DrawerInput label="Unit ID (Barcode)" icon={<Hash />} register={register("unitId")} placeholder="NEX-XXXX-XXXX" />
                <DrawerInput label="Collection Date" type="date" icon={<Calendar />} register={register("collectionDate")} />
                <DrawerInput label="Expiry Date" type="date" icon={<Calendar />} register={register("expiryDate")} />
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                <ShieldCheck className="text-blue-600 shrink-0" />
                <p className="text-xs font-bold text-blue-700 leading-relaxed uppercase tracking-tight">
                  Unit will be marked as <span className="underline">Testing</span> until verified by the laboratory protocol.
                </p>
              </div>

              {/* Action Button */}
              <button 
                type="submit" 
                className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-gray-200 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                Register Inbound Unit <Save size={20} />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

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