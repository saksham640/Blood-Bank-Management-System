import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Hospital, Droplet, Mail, Lock, MapPin, 
  ShieldCheck, ArrowRight, Activity, Crosshair, X 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import confetti from 'canvas-confetti';
import axios from 'axios';

// --- LEAFLET ASSET FIX ---
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- VALIDATION SCHEMA ---
const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["donor", "hospital"]),
  address: z.string().min(5, "Physical address is required"),
  bloodGroup: z.string().optional(),
  licenseId: z.string().optional(),
  coords: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional()
});

// --- MAP HELPER COMPONENT ---
const LocationPicker = ({ onLocationSelect, currentCoords }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return currentCoords ? <Marker position={[currentCoords.lat, currentCoords.lng]} /> : null;
};

const Register = () => {
  const [role, setRole] = useState('donor');
  const [pickedCoords, setPickedCoords] = useState({ lat: 30.9010, lng: 75.8573 }); // Ludhiana Center

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      role: 'donor', 
      bloodGroup: 'O+',
      coords: { lat: 30.9010, lng: 75.8573 } 
    }
  });

  const onSubmit = async (data) => {
    try {
      // Ensure hospital gets the exact coordinates from the map
      const payload = {
        ...data,
        role,
        coords: role === 'hospital' ? pickedCoords : undefined
      };

      const response = await axios.post('http://localhost:5000/api/auth/register', payload);

      if (response.data.success) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#dc2626', '#000000', '#ffffff']
        });

        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed. Check your connection.");
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center bg-[#f8fafc] px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden"
      >
        
        {/* LEFT PANEL: VISUAL BRANDING */}
        <div className="bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden hidden lg:flex">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] -mr-20 -mt-20" />
          
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Activity className="text-red-500" size={32} />
              <span className="text-3xl font-black italic uppercase tracking-tighter">Nexus</span>
            </div>
            <h2 className="text-5xl font-black leading-[0.9] uppercase italic mb-6">
              Join the <br/> <span className="text-red-500">Live Grid.</span>
            </h2>
            <p className="text-slate-400 font-medium text-lg max-w-sm">
              {role === 'donor' 
                ? "Register as a verified donor and track your life-saving impact across the network." 
                : "Connect your medical facility to our geospatial blood supply chain for instant requisitions."}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-red-500/20 transition-colors">
                <ShieldCheck className="text-red-500" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-300">Biometric Verification</span>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-red-500/20 transition-colors">
                <MapPin className="text-red-500" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-300">Real-time Routing</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: REGISTRATION FORM */}
        <div className="p-8 md:p-14 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <header className="mb-10">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h3>
            <p className="text-slate-400 font-bold text-sm">Synchronize with the Nexus ecosystem</p>
          </header>

          {/* ROLE SWITCHER */}
          <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] mb-10 relative border border-slate-200">
            <motion.div 
              animate={{ x: role === 'donor' ? 0 : '100%' }}
              className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm z-0 border border-slate-100"
            />
            <button 
              type="button" onClick={() => setRole('donor')}
              className={`flex-1 py-3 text-xs font-black uppercase z-10 transition-colors flex items-center justify-center gap-2 ${role === 'donor' ? 'text-red-600' : 'text-slate-400'}`}
            >
              <User size={16}/> Donor
            </button>
            <button 
              type="button" onClick={() => setRole('hospital')}
              className={`flex-1 py-3 text-xs font-black uppercase z-10 transition-colors flex items-center justify-center gap-2 ${role === 'hospital' ? 'text-red-600' : 'text-slate-400'}`}
            >
              <Hospital size={16}/> Hospital
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Full Name" icon={<User size={18}/>} register={register("name")} error={errors.name} />
              <InputField label="Email Address" icon={<Mail size={18}/>} register={register("email")} error={errors.email} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Secret Password" type="password" icon={<Lock size={18}/>} register={register("password")} error={errors.password} />
              <InputField label="Physical Address" icon={<MapPin size={18}/>} register={register("address")} error={errors.address} />
            </div>

            <AnimatePresence mode="wait">
              {role === 'donor' ? (
                <motion.div 
                  key="donor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                  <select {...register("bloodGroup")} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold outline-none focus:border-red-500 transition-all cursor-pointer">
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </motion.div>
              ) : (
                <motion.div 
                  key="hospital" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <InputField label="Facility License ID" icon={<ShieldCheck size={18}/>} register={register("licenseId")} />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Crosshair size={14} className="text-red-600" /> Precise GPS Pinpoint
                    </label>
                    <div className="h-64 w-full rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner z-0">
                      <MapContainer center={[30.9010, 75.8573]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
                        <LocationPicker 
                          currentCoords={pickedCoords} 
                          onLocationSelect={(c) => { setPickedCoords(c); setValue("coords", c); }} 
                        />
                      </MapContainer>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 italic">Click map to set facility coordinates.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              className="w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-3 mt-4"
            >
              Initialize Node <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// --- REUSABLE INPUT ---
const InputField = ({ label, icon, register, error, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">
        {icon}
      </div>
      <input 
        type={type} {...register}
        className={`w-full bg-slate-50 border-2 ${error ? 'border-red-500' : 'border-slate-100'} rounded-[1.5rem] pl-14 pr-6 py-4 outline-none focus:border-red-500/50 focus:bg-white font-bold text-slate-700 transition-all`}
        placeholder={`Enter ${label}...`}
      />
    </div>
    {error && <p className="text-red-500 text-[10px] font-bold uppercase ml-2">{error.message}</p>}
  </div>
);

export default Register;