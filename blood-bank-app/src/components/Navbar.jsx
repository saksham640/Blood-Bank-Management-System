import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplet, LayoutDashboard, History, LogOut, Menu, X, Bell, 
  Users, Building2, Server, Activity, Inbox, ShieldAlert, 
  Calendar, Trophy, Send, Network, HeartPulse, Stethoscope
} from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // --- AUTH STATE ---
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || null;

  // --- LIVE TELEMETRY STATE (For Admin Badges) ---
  const [reqCount, setReqCount] = useState(0);
  const [inReqCount, setInReqCount] = useState(0); // Placeholder for inbound intakes

  useEffect(() => {
    if (role === 'admin') {
      const fetchTelemetry = async () => {
        try {
          const reqRes = await axios.get('http://localhost:5000/api/requests');
          setReqCount(reqRes.data.length);
          // Simulate inbound requests for the UI
          setInReqCount(Math.floor(Math.random() * 5) + 1); 
        } catch (err) { console.error("Nav Telemetry Error"); }
      };
      fetchTelemetry();
      // Optional: Set an interval here to ping every 30 seconds for live updates
    }
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- DYNAMIC ROLE-BASED LINKS ---
  const navLinks = {
    admin: [
      { name: 'Matrix', path: '/admin/matrix', icon: <Server size={16} /> },
      { name: 'Donors', path: '/admin/donor-database', icon: <Users size={16} /> },
      { name: 'Hospitals', path: '/admin/hospital-database', icon: <Building2 size={16} /> },
      { name: 'Hubs', path: '/admin#hubs', icon: <Network size={16} /> },
      { name: 'OUT.REQ', path: '/admin', icon: <Activity size={16} />, badge: reqCount, badgeColor: 'bg-red-500' },
      { name: 'IN.REQ', path: '/admin', icon: <Inbox size={16} />, badge: inReqCount, badgeColor: 'bg-orange-500' },
    ],
    hospital: [
      { name: 'Command', path: '/hospital', icon: <LayoutDashboard size={16} /> },
      { name: 'Requisitions', path: '/hospital', icon: <Send size={16} /> },
      { name: 'Local Stock', path: '/hospital', icon: <Server size={16} /> },
      { name: 'Emergency', path: '/hospital', icon: <ShieldAlert size={16} /> },
    ],
    donor: [
      { name: 'Impact Hub', path: '/donor', icon: <HeartPulse size={16} /> },
      { name: 'Schedule', path: '/donor', icon: <Calendar size={16} /> },
      { name: 'History', path: '/donor', icon: <History size={16} /> },
    ]
  };

  const activeLinks = role ? navLinks[role] : [];

  return (
    <nav className="fixed top-4 inset-x-0 z-[100] flex justify-center px-4 font-sans pointer-events-none">
      {/* Main Glass Container */}
      <motion.div 
        initial={{ y: -100 }} animate={{ y: 0 }}
        className="w-full max-w-7xl bg-white/80 backdrop-blur-2xl border border-slate-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] px-4 py-3 flex items-center justify-between pointer-events-auto"
      >
        {/* --- LEFT: LOGO SECTION --- */}
        <Link to={role ? `/${role}` : '/'} className="group flex items-center gap-2 pr-4 border-r border-slate-200">
          <div className="relative">
            <Droplet className="text-red-600 h-8 w-8 transition-transform group-hover:scale-110 group-hover:-rotate-12 duration-300" fill="currentColor" />
            <div className="absolute inset-0 bg-red-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase italic text-slate-900 hidden lg:block">
            Blood<span className="text-red-600">Link</span>
          </span>
        </Link>

        {/* --- CENTER: DYNAMIC NAVIGATION --- */}
        <div className="hidden md:flex items-center gap-1.5 px-2">
          {!role && (
            <NavLink to="/" currentPath={location.pathname} icon={<LayoutDashboard size={16}/>}>Home</NavLink>
          )}
          
          {activeLinks.map((link) => (
            // For hash links (like #hubs), we use a standard <a> tag approach if it's on the same page, 
            // or just let React Router handle it.
            <NavLink 
              key={link.name} 
              to={link.path} 
              currentPath={location.pathname} 
              icon={link.icon}
              badge={link.badge}
              badgeColor={link.badgeColor}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* --- RIGHT: ACTIONS & PROFILE --- */}
        <div className="hidden md:flex items-center gap-4 pl-4 border-l border-slate-200">
          {!role ? (
            <Link to="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-colors shadow-lg">
              System Login
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button className="relative p-2 text-slate-400 hover:text-slate-900">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
              </button>

              {/* Fancy Avatar & User Info */}
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 py-1.5 pl-1.5 pr-4 rounded-[1.5rem] shadow-sm">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center text-white font-black text-lg border-2 border-white shadow-md">
                  {user?.name ? user.name.charAt(0).toUpperCase() : (role === 'hospital' ? <Stethoscope size={16}/> : 'A')}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-black text-slate-900 leading-none uppercase max-w-[100px] truncate">{user?.name}</p>
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-0.5">{role}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout} 
                className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                title="Disconnect Session"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>

        {/* --- MOBILE TOGGLE --- */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-800 bg-slate-100 rounded-xl pointer-events-auto">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.div>

      {/* --- MOBILE DRAWER --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-24 inset-x-4 bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 p-6 shadow-2xl md:hidden pointer-events-auto"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                 <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-black text-xl">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 uppercase">{user?.name || "Guest Access"}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{role || "Unregistered"}</p>
                  </div>
              </div>

              {activeLinks.map(link => (
                <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 text-slate-700 font-bold uppercase text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-red-500">{link.icon}</span> {link.name}
                  </div>
                  {link.badge > 0 && <span className={`px-2 py-1 rounded-full text-white text-[10px] font-black ${link.badgeColor}`}>{link.badge}</span>}
                </Link>
              ))}
              
              {!role ? (
                <Link to="/login" className="bg-slate-900 text-white text-center py-4 rounded-2xl font-black uppercase tracking-widest mt-4 shadow-xl">System Login</Link>
              ) : (
                <button onClick={handleLogout} className="bg-red-50 text-red-600 text-center py-4 rounded-2xl font-black uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                  <LogOut size={18}/> Disconnect
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- CUSTOM PILL NAVIGATION COMPONENT ---
const NavLink = ({ to, children, currentPath, icon, badge, badgeColor }) => {
  // Check if active (handle hash links and exact paths)
  const isActive = currentPath === to || (to.includes('#') && currentPath === to.split('#')[0]);

  return (
    <Link 
      to={to} 
      // If it's a hash link, scroll to it smoothly
      onClick={(e) => {
        if(to.includes('#')) {
          const id = to.split('#')[1];
          const element = document.getElementById(id);
          if (element) {
            e.preventDefault();
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }}
      className={`relative px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl flex items-center gap-2 group ${
        isActive ? 'text-red-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-700 transition-colors'}`}>
        {icon}
        {children}
        
        {/* THE NOTIFICATION BADGE */}
        {badge !== undefined && badge > 0 && (
          <span className={`ml-1 px-1.5 py-0.5 rounded-md text-white text-[9px] font-black shadow-sm ${badgeColor || 'bg-red-500'}`}>
            {badge}
          </span>
        )}
      </span>
      
      {/* ACTIVE PILL BACKGROUND ANIMATION */}
      {isActive && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute inset-0 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-slate-100"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          style={{ zIndex: 0 }}
        />
      )}
    </Link>
  );
};

export default Navbar;