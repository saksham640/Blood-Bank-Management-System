import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Heart, Building2, Activity, ShieldCheck, 
  Smartphone, Zap, Globe, Database, Droplet, MapPin, Navigation
} from 'lucide-react';

// --- ANIMATION VARIANTS ---
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const Home = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-red-200 overflow-hidden">
      
      {/* --- 1. NAVBAR --- */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-red-600" size={28} />
            <span className="text-2xl font-black italic tracking-tighter uppercase">Nexus</span>
          </div>
          <div className="hidden md:flex gap-4">
            <Link to="/login">
              <button className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Sign In</button>
            </Link>
            <Link to="/register">
              <button className="px-6 py-2.5 text-sm font-black bg-black text-white rounded-full hover:bg-red-600 transition-colors shadow-lg">Get Started</button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <section className="relative pt-40 pb-20 px-6 min-h-[90vh] flex flex-col justify-center items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className="inline-block mb-6 px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 font-bold text-xs uppercase tracking-widest">
            Geospatial Blood Logistics
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            Synchronizing <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-400 italic">Supply & Demand.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Nexus is a real-time telemetry ecosystem. We use algorithmic distance-matching to connect verified donors and physical network hubs directly to critical hospital requisitions.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=donor">
              <button className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl flex items-center justify-center gap-2 group">
                Become a Donor <Heart size={18} className="group-hover:scale-110 transition-transform" />
              </button>
            </Link>
            <Link to="/register?role=hospital">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-[2rem] font-black uppercase tracking-widest hover:border-slate-400 transition-all flex items-center justify-center gap-2">
                Register Hospital <Building2 size={18} />
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* --- 3. THE ECOSYSTEM (The Location Cycle) --- */}
      <section className="py-32 px-6 bg-slate-900 text-white rounded-t-[4rem]">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">A Geospatial <span className="text-red-500 italic">Ecosystem.</span></h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">How we route life-saving resources based on physical proximity.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}
              className="bg-slate-800/50 border border-slate-700 p-10 rounded-[3rem] relative overflow-hidden group hover:bg-slate-800 transition-colors"
            >
              <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mb-8 border border-red-500/30">
                <MapPin size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4">1. GPS Tagging</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                Admins establish physical "Network Hubs." When a donor provides blood, the unit is barcode-verified and locked to the exact GPS coordinates of that specific collection hub.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} transition={{ delay: 0.2 }}
              className="bg-slate-800/50 border border-slate-700 p-10 rounded-[3rem] relative overflow-hidden group hover:bg-slate-800 transition-colors"
            >
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/30">
                <Activity size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4">2. Emergency Uplink</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                Medical facilities broadcast critical requisitions. The Hospital Portal automatically embeds the facility's live GPS coordinates into the encrypted network request.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} transition={{ delay: 0.4 }}
              className="bg-slate-800/50 border border-slate-700 p-10 rounded-[3rem] relative overflow-hidden group hover:bg-slate-800 transition-colors"
            >
              <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/30">
                <Navigation size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4">3. Smart Triage</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                Our algorithm runs real-time distance calculations, scanning all active hubs to match the hospital with the closest available blood unit, drastically cutting transit times.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- 4. FEATURE DEEP DIVE (Bento Style) --- */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-32">
          
          {/* FOR DONORS */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
              className="lg:w-1/2 space-y-6"
            >
              <div className="flex items-center gap-2 text-red-600 font-black uppercase tracking-widest text-xs">
                <Heart size={16} /> For Donors
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">See Your <span className="italic text-red-600">Impact.</span></h2>
              <p className="text-lg text-slate-500 font-medium">
                Donating blood shouldn't feel like throwing a bottle into the ocean. With Nexus, you get a beautiful dashboard that tracks exactly how many units you've given, which hubs you've supplied, and how many lives you've directly impacted.
              </p>
              <ul className="space-y-4 pt-4">
                {['Live Contribution Pulse Graph', 'Location-based Appointment Booking', 'Digital Verification Status'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                    <CheckCircle /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="lg:w-1/2 w-full bg-slate-100 rounded-[3rem] p-8 md:p-12 border-8 border-white shadow-2xl relative"
            >
               <div className="bg-white rounded-3xl p-6 shadow-sm mb-4 flex justify-between items-center">
                 <div>
                   <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Total Impact</p>
                   <p className="text-4xl font-black">12 <span className="text-red-600 text-sm">UNITS</span></p>
                 </div>
                 <Droplet className="text-red-100" size={48} />
               </div>
               <div className="bg-white rounded-3xl p-6 shadow-sm h-32 flex items-end">
                 <div className="w-full h-1/2 bg-gradient-to-t from-red-100 to-transparent border-t-2 border-red-500 rounded-t-lg"></div>
               </div>
            </motion.div>
          </div>

          {/* GEOSPATIAL ROUTING (The Million Dollar Feature) */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
              className="lg:w-1/2 space-y-6"
            >
              <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-xs">
                <Globe size={16} /> Geospatial Intelligence
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Proximity-Based <span className="italic text-slate-500">Logistics.</span></h2>
              <p className="text-lg text-slate-500 font-medium">
                When seconds matter, you don't have time to manually search inventory. Our master matrix uses coordinate geometry to instantly route requested blood types from the closest physical hub to the requesting hospital.
              </p>
              <ul className="space-y-4 pt-4">
                {['Haversine Distance Calculations', 'Live Facility Mapping', 'Automated Smart-Triage Matching'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                    <CheckCircle /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="lg:w-1/2 w-full bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:24px_24px]"></div>
               <div className="bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-700 relative z-10">
                 <div className="flex justify-between items-center mb-6">
                   <p className="text-xs font-black text-white uppercase tracking-widest">Closest Match Found</p>
                   <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                     <MapPin size={10} /> 2.4 KM
                   </span>
                 </div>
                 <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-700">
                      <span className="text-slate-400 text-xs font-bold uppercase">Source:</span>
                      <span className="text-white text-xs font-black uppercase">Model Town Hub</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-700">
                      <span className="text-slate-400 text-xs font-bold uppercase">Transit ETA:</span>
                      <span className="text-red-400 text-xs font-black uppercase">~12 Minutes</span>
                    </div>
                 </div>
                 <button className="w-full py-4 bg-white text-black font-black uppercase rounded-2xl flex items-center justify-center gap-2">
                   Dispatch Unit <ArrowRight size={16} />
                 </button>
               </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* --- 5. CTA FOOTER --- */}
      <section className="py-32 px-6">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="max-w-5xl mx-auto bg-black text-white rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
          
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 relative z-10">Join the <span className="italic text-red-500">Network.</span></h2>
          <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto mb-10 relative z-10">
            Whether you are an individual looking to track your impact, or a medical facility needing a reliable supply chain, Nexus is ready.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link to="/register?role=donor">
              <button className="w-full sm:w-auto px-10 py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl shadow-red-600/20">
                Register as Donor
              </button>
            </Link>
            <Link to="/register?role=hospital">
              <button className="w-full sm:w-auto px-10 py-5 bg-slate-800 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                Partner Facility
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

// Mini internal component for clean code
const CheckCircle = () => (
  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  </div>
);

export default Home;