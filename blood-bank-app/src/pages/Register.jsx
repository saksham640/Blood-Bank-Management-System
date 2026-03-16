import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Hospital, Droplet, Mail, Lock, MapPin, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import axios from 'axios'

// --- OVERKILL VALIDATION SCHEMA ---
const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["donor", "hospital"]),
  // Conditional fields
  bloodGroup: z.string().optional(),
  licenseId: z.string().optional(),
  location: z.string().min(5, "Please provide a valid Ludhiana address or area"),
});

const Register = () => {
  const [role, setRole] = useState('donor');
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'donor' }
  });

  const onSubmit = async (data) => {
  try {
    // 1. Send the data to your Node.js server
    const response = await axios.post('http://localhost:5000/api/auth/register', data);
    
    if (response.data.success) {
      // 2. Trigger the overkill celebration
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#dc2626', '#000000', '#ffffff']
      });

      // 3. Simple Redirect to Login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login'; 
        // Or use navigate('/login') if you have the hook set up
      }, 2000);
    }
  } catch (err) {
    // 4. Alert the error message from your Backend (e.g., "User already exists")
    const errorMsg = err.response?.data?.message || "Registration Failed";
    alert(errorMsg);
    console.error("Registration Failed:", errorMsg);
  }
};

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-red-50 via-white to-gray-100">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden"
      >
        
        {/* Left Side: Dynamic Visuals */}
        <div className="relative hidden lg:block bg-gray-900 p-12 overflow-hidden">
          <motion.div 
            animate={{ rotate: [0, 10, 0] }} 
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-red-600/20 rounded-full blur-3xl" 
          />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-4xl font-black text-white leading-tight">
                JOIN THE <br /> <span className="text-red-500 underline decoration-white/20">LIFE-SAVING</span> <br /> NETWORK.
              </h2>
              <p className="mt-6 text-gray-400 text-lg">
                {role === 'donor' 
                  ? "Every drop counts. Your one donation can save up to three lives in Punjab." 
                  : "Streamline your hospital's blood requirements with real-time inventory tracking."}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-white/70">
                <ShieldCheck className="text-red-500" />
                <span>SECURE & ENCRYPTED DATA</span>
              </div>
              <div className="flex items-center gap-4 text-white/70">
                <Activity className="text-red-500" />
                <span>REAL-TIME NOTIFICATIONS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The Form */}
        <div className="p-8 md:p-12">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800">Create Account</h3>
            <p className="text-gray-500">Select your role to get started</p>
          </div>

          {/* Role Switcher */}
          <div className="flex p-1 bg-gray-100 rounded-2xl mb-8 relative">
            <motion.div 
              animate={{ x: role === 'donor' ? 0 : '100%' }}
              className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-md z-0"
            />
            <button 
              type="button"
              onClick={() => setRole('donor')}
              className={`flex-1 py-3 text-sm font-bold z-10 flex items-center justify-center gap-2 transition-colors ${role === 'donor' ? 'text-red-600' : 'text-gray-500'}`}
            >
              <User size={18} /> Donor
            </button>
            <button 
              type="button"
              onClick={() => setRole('hospital')}
              className={`flex-1 py-3 text-sm font-bold z-10 flex items-center justify-center gap-2 transition-colors ${role === 'hospital' ? 'text-red-600' : 'text-gray-500'}`}
            >
              <Hospital size={18} /> Hospital
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Full Name" icon={<User />} register={register("name")} error={errors.name} />
              <InputField label="Email Address" icon={<Mail />} register={register("email")} error={errors.email} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Password" type="password" icon={<Lock />} register={register("password")} error={errors.password} />
              <InputField label="Location (Ludhiana)" icon={<MapPin />} register={register("location")} error={errors.location} />
            </div>

            <AnimatePresence mode="wait">
              {role === 'donor' ? (
                <motion.div 
                  key="donor-fields"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                >
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Blood Group</label>
                  <select {...register("bloodGroup")} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-red-500/20 focus:border-red-500 transition-all">
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                    <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                  </select>
                </motion.div>
              ) : (
                <motion.div 
                  key="hospital-fields"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                >
                  <InputField label="Hospital License ID" icon={<ShieldCheck />} register={register("licenseId")} />
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              Initialize Account <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// Reusable Overkill Input Component
const InputField = ({ label, icon, register, error, type = "text" }) => (
  <div className="flex flex-col gap-1.5">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <input 
        type={type}
        {...register}
        className={`w-full bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-4 ring-red-500/10 focus:border-red-500 transition-all`}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
    {error && <span className="text-red-500 text-xs font-medium ml-1">{error.message}</span>}
  </div>
);

export default Register;