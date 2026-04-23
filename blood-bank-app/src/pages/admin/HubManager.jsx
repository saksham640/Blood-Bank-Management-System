import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Server, Globe, CheckCircle2, Crosshair } from 'lucide-react';
import axios from 'axios';

const HubManager = () => {
  const [hubs, setHubs] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: ''
  });

  const fetchHubs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/hubs');
      setHubs(res.data);
    } catch (err) {
      console.error("Failed to fetch hubs", err);
    }
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  // Use HTML5 Geolocation to quickly grab test coordinates
  const getDeviceLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({ ...formData, lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        (err) => {
          alert("Location access denied.");
          setIsLocating(false);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/hubs/create', {
        name: formData.name,
        address: formData.address,
        location: { lat: Number(formData.lat), lng: Number(formData.lng) }
      });
      setFormData({ name: '', address: '', lat: '', lng: '' });
      fetchHubs();
    } catch (err) {
      alert("Failed to establish Hub: " + err.message);
    }
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex items-center gap-3">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><Globe size={24} /></div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Network <span className="text-red-600">Hubs</span></h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Geospatial Infrastructure Management</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* ADD HUB FORM */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-5 bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm h-fit">
            <h2 className="text-lg font-black uppercase mb-6 flex items-center gap-2"><Plus size={18} className="text-red-600"/> Establish New Hub</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Facility Designation</label>
                <input required type="text" placeholder="e.g. Model Town Central" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 focus:ring-2 ring-red-500/20 font-bold" />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Physical Address</label>
                <input required type="text" placeholder="e.g. 142 Ferozepur Road" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 focus:ring-2 ring-red-500/20 font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Latitude</label>
                  <input required type="number" step="any" placeholder="30.9009" value={formData.lat} onChange={(e) => setFormData({...formData, lat: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-mono text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Longitude</label>
                  <input required type="number" step="any" placeholder="75.8572" value={formData.lng} onChange={(e) => setFormData({...formData, lng: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-mono text-sm" />
                </div>
              </div>

              <button type="button" onClick={getDeviceLocation} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 flex items-center justify-center gap-2 transition-colors">
                {isLocating ? <Crosshair className="animate-spin" size={16}/> : <MapPin size={16}/>}
                {isLocating ? "Acquiring Sat-Lock..." : "Auto-Fill Current GPS Location"}
              </button>

              <button type="submit" className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl mt-4">
                Deploy Hub
              </button>
            </form>
          </motion.div>

          {/* ACTIVE HUBS LIST */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-7 space-y-4">
            <h2 className="text-lg font-black uppercase mb-6 flex items-center gap-2 pl-2"><Server size={18} className="text-slate-400"/> Operational Nodes</h2>
            
            {hubs.length === 0 ? (
              <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-12 text-center text-slate-400">
                <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                <p className="font-bold uppercase tracking-widest text-xs">No active network hubs deployed</p>
              </div>
            ) : (
              hubs.map(hub => (
                <div key={hub._id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm flex justify-between items-center group hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">{hub.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{hub.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coordinates</p>
                    <p className="font-mono text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 mt-1">
                      {hub.location.lat.toFixed(4)}, {hub.location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default HubManager;