import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Server, Globe, CheckCircle2, Crosshair, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
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

// --- MAP CLICK HANDLER ---
const LocationPicker = ({ onLocationSelect, currentCoords }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return currentCoords.lat ? <Marker position={[currentCoords.lat, currentCoords.lng]} /> : null;
};

const HubManager = () => {
  const [hubs, setHubs] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: 30.9010, // Ludhiana Center
    lng: 75.8573
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
      setFormData({ name: '', address: '', lat: 30.9010, lng: 75.8573 });
      fetchHubs();
    } catch (err) {
      alert("Failed to establish Hub: " + err.message);
    }
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex items-center gap-3">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><Globe size={24} /></div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Network <span className="text-red-600">Hubs</span></h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Geospatial Infrastructure Management</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* DEPLOYMENT FORM */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-5 bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm h-fit">
            <h2 className="text-lg font-black uppercase mb-6 flex items-center gap-2"><Plus size={18} className="text-red-600"/> Establish New Node</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Facility Designation</label>
                  <input required type="text" placeholder="e.g. Model Town Central" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 font-bold text-slate-700" />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Physical Address</label>
                  <input required type="text" placeholder="e.g. 142 Ferozepur Road" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 font-bold text-slate-700" />
                </div>
              </div>

              {/* MAP PICKER */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Pinpoint Deployment Coordinate</label>
                <div className="h-64 w-full rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner z-0">
                  <MapContainer center={[30.9010, 75.8573]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
                    <LocationPicker 
                      currentCoords={{ lat: formData.lat, lng: formData.lng }}
                      onLocationSelect={(coords) => setFormData({...formData, lat: coords.lat, lng: coords.lng})}
                    />
                  </MapContainer>
                </div>
                <div className="flex justify-between items-center px-1">
                   <p className="text-[9px] font-bold text-slate-400 italic">Click map to set node coordinates.</p>
                   <p className="font-mono text-[10px] font-black text-red-600">{formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</p>
                </div>
              </div>

              <button type="button" onClick={getDeviceLocation} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 flex items-center justify-center gap-2 transition-colors">
                {isLocating ? <Crosshair className="animate-spin" size={16}/> : <MapPin size={16}/>}
                {isLocating ? "Acquiring Sat-Lock..." : "Sync to Current Location"}
              </button>

              <button type="submit" className="w-full py-5 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-100">
                Deploy Hub
              </button>
            </form>
          </motion.div>

          {/* OPERATIONAL NODES LIST */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-black uppercase mb-6 flex items-center gap-2 pl-2"><Server size={18} className="text-slate-400"/> Operational Nodes</h2>
            
            <div className="grid gap-4">
              {hubs.length === 0 ? (
                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-12 text-center text-slate-400">
                  <MapPin size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-bold uppercase tracking-widest text-xs">Zero active hubs in network</p>
                </div>
              ) : (
                hubs.map(hub => (
                  <div key={hub._id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm flex justify-between items-center group hover:border-red-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 leading-none mb-1">{hub.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{hub.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Position</p>
                      <p className="font-mono text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                        {hub.location.lat.toFixed(3)}, {hub.location.lng.toFixed(3)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default HubManager;