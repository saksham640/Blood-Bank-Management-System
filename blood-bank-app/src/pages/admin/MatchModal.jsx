import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, Package, MapPin, Zap, ChevronRight } from 'lucide-react';
import axios from 'axios';

const MatchModal = ({ isOpen, onClose, request, onDispatch }) => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && request) {
      const fetchMatches = async () => {
        setIsLoading(true);
        try {
          const res = await axios.get(`http://localhost:5000/api/requests/match/${request._id}`);
          setMatches(res.data);
        } catch (err) {
          console.error("Matching engine failure", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMatches();
    }
  }, [isOpen, request]);

  if (!request) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-end p-4">
          {/* Overlay */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          
          {/* Modal Panel */}
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-white h-full shadow-2xl rounded-l-[3rem] p-8 overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Smart.<span className="text-red-600">Triage</span></h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Finding closest {request.bloodGroup} units for {request.hospitalName}</p>
              </div>
              <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200"><X size={20}/></button>
            </div>

            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Navigation className="animate-bounce text-red-500" size={32} />
                <p className="font-black uppercase text-[10px] tracking-[0.2em]">Calculating Geospatial Proximity...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Package size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="font-bold text-slate-500">Zero stock matches in current network.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((unit, index) => (
                  <motion.div 
                    key={unit._id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer group ${
                        index === 0 ? 'border-red-600 bg-red-50/30' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-black text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">{unit.unitId}</span>
                            {index === 0 && <span className="bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full flex items-center gap-1"><Zap size={8} fill="currentColor"/> Optimal Match</span>}
                        </div>
                        <h4 className="font-black text-slate-900 uppercase italic flex items-center gap-2">
                           <MapPin size={14} className="text-red-500" /> {unit.hubId?.name || "Ludhiana Central Hub"}
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-red-600 leading-none">{unit.distance}km</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Distance</p>
                      </div>
                    </div>

                    {/* THE LINE YOU ASKED FOR */}
                    <div className="bg-white/60 p-4 rounded-2xl border border-slate-100 mb-4">
                        <p className="text-xs font-bold text-slate-600 leading-relaxed">
                            Blood unit <span className="text-slate-900 font-black">{unit.unitId}</span> is sitting in the <span className="text-slate-900 font-black">{unit.hubId?.name}</span>, 
                            which is <span className="text-red-600 font-black">{unit.distance}km</span> away from {request.hospitalName}, 
                            and will take approximately <span className="text-slate-900 font-black">{unit.estimatedTime} minutes</span> to arrive.
                        </p>
                    </div>

                    <button 
                      onClick={() => onDispatch(unit._id, request._id)}
                      className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-red-600 transition-colors"
                    >
                      Authorize Dispatch <ChevronRight size={18} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MatchModal;