import React, { useState, useEffect } from 'react';
import NetworkRadar  from '../../components/NetworkRadar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Activity, Trash2, MapPin, ShieldAlert, Clock, Crosshair, Building,
  Network
} from 'lucide-react';
import axios from 'axios';

const HospitalPortal = () => {
  // --- 1. GET AUTHENTICATED USER DATA ---
  const user = JSON.parse(localStorage.getItem('user')); 
  const hospitalName = user?.name || "Facility Unknown";
  const hospitalCoords = user?.coords; // { lat, lng } from registration

  const [bloodGroup, setBloodGroup] = useState('O+');
  const [urgency, setUrgency] = useState('Critical');
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hospitalName) {
      fetchRequests();
    }
  }, [hospitalName]);

  // --- 2. FETCH ONLY THIS HOSPITAL'S REQUESTS ---
  const fetchRequests = async () => {
    try {
      // Changed endpoint to fetch specific hospital data from the backend
      const res = await axios.get(`http://localhost:5000/api/requests/hospital/${hospitalName}`);
      setRequests(res.data);
    } catch (err) { 
      console.error("Sync Error", err); 
    }
  };

  // --- 3. CREATE REQUEST USING REGISTERED COORDS ---
  const handleRequest = async () => {
    if (!hospitalCoords) {
      return alert("Geospatial Error: No registered coordinates found for this facility.");
    }
    
    setIsLoading(true);
    try {
        await axios.post('http://localhost:5000/api/requests/create', {
          hospitalName: hospitalName,
          bloodGroup,
          urgency,
          // FIX: Now using the static coordinates from the database, not the browser GPS
          location: { lat: hospitalCoords.lat, lng: hospitalCoords.lng }, 
          status: 'pending'
        });
        fetchRequests();
    } catch (err) {
        alert("Transmission Failed: " + (err.response?.data?.message || "Server Error"));
    } finally {
        setIsLoading(false);
    }
  };

  const cancelRequest = async (id) => {
    setRequests(prev => prev.filter(r => r._id !== id));
    try {
      await axios.delete(`http://localhost:5000/api/requests/${id}`);
    } catch (err) {
      fetchRequests();
      alert("Failed to cancel request.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- DYNAMIC HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <motion.h1 
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="text-4xl font-black tracking-tight italic uppercase flex items-center gap-3"
            >
              <Activity className="text-red-600" size={36} />
              Hospital<span className="text-red-600">.Hub</span>
            </motion.h1>
            <p className="text-slate-500 font-bold text-sm tracking-widest uppercase mt-1 flex items-center gap-2">
              <Building size={14} /> {hospitalName}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Facility Online</span>
          </div>
        </header>

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="md:col-span-8 bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden"
          >
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Send size={20} className="text-red-600" /> New Blood Requisition
            </h2>

            <div className="grid grid-cols-4 gap-3 mb-8">
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                <button 
                  key={type} onClick={() => setBloodGroup(type)}
                  className={`py-4 rounded-2xl font-black transition-all border-2 ${
                    bloodGroup === type 
                      ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200' 
                      : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Urgency Level</label>
              <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                {['Routine', 'High', 'Critical'].map(level => (
                  <button 
                    key={level} onClick={() => setUrgency(level)}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${
                      urgency === level 
                        ? level === 'Critical' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleRequest} disabled={isLoading}
              className="w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 bg-black text-white hover:bg-red-600 shadow-xl disabled:opacity-50"
            >
              {isLoading ? 'Transmitting...' : 'Send Requisition'}
              <Send size={20} className={isLoading ? "animate-pulse" : ""} />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="md:col-span-4 bg-white border-2 border-slate-100 rounded-[2.5rem] p-1 shadow-sm relative overflow-hidden min-h-[300px] flex flex-col"
          >
             <div className="absolute top-6 left-6 z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-100 flex items-center gap-2 shadow-sm">
                <MapPin size={12} className="text-red-600" /> Facility Pin
              </h3>
             </div>

             {hospitalCoords ? (
               <div className="w-full h-full min-h-[300px] rounded-[2.2rem] overflow-hidden">
                 <iframe 
                   title="Hospital Location Map"
                   width="100%" 
                   height="100%" 
                   frameBorder="0" 
                   src={`https://www.openstreetmap.org/export/embed.html?bbox=${hospitalCoords.lng - 0.01},${hospitalCoords.lat - 0.01},${hospitalCoords.lng + 0.01},${hospitalCoords.lat + 0.01}&layer=mapnik&marker=${hospitalCoords.lat},${hospitalCoords.lng}`}
                   className="pointer-events-none"
                 />
               </div>
             ) : (
               <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                 <p className="text-xs font-black text-slate-400 uppercase">Awaiting GPS Uplink...</p>
               </div>
             )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="md:col-span-12 bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col"
          >
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                <Clock size={20} className="text-red-600" /> My Requisitions
              </h2>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {requests.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <ShieldAlert size={48} className="mb-4 opacity-50" />
                    <p className="font-bold uppercase tracking-widest text-xs">No active transmissions</p>
                  </div>
                ) : (
                  requests.map(req => (
                    <motion.div 
                      key={req._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm">
                          <span className="text-xl font-black text-red-600">{req.bloodGroup}</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID: {req._id.substring(req._id.length - 6)}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-slate-800 uppercase italic">Status: {req.status}</span>
                            <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                              req.urgency === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {req.urgency}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => cancelRequest(req._id)}
                        className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 flex items-center justify-center transition-all shadow-sm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>
      <div className="mt-12">
        <NetworkRadar />
      </div>
    </div>
  );
};

export default HospitalPortal;