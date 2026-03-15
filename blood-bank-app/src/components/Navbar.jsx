import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, LayoutDashboard, History, Settings, LogOut, Menu, X, Bell } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Simulation of user state (We'll replace this with real Auth later)
  // Options: 'donor', 'admin', 'hospital', or null
  const [role, setRole] = useState('donor'); 

  const navLinks = {
    donor: [
      { name: 'Dashboard', path: '/donor', icon: <LayoutDashboard size={18} /> },
      { name: 'My History', path: '/donor/history', icon: <History size={18} /> },
    ],
    admin: [
      { name: 'Inventory', path: '/admin/inventory', icon: <Droplet size={18} /> },
      { name: 'Approvals', path: '/admin/approvals', icon: <Bell size={18} /> },
    ],
    hospital: [
      { name: 'Requests', path: '/hospital/requests', icon: <Bell size={18} /> },
      { name: 'Blood Stock', path: '/hospital/stock', icon: <Droplet size={18} /> },
    ]
  };

  const activeLinks = role ? navLinks[role] : [];

  return (
    <nav className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      {/* Main Glass Container */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="w-full max-w-6xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(255,0,0,0.1)] rounded-2xl px-6 py-3 flex items-center justify-between"
      >
        {/* Logo Section */}
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative">
            <Droplet className="text-red-600 h-8 w-8 transition-transform group-hover:scale-110 group-hover:rotate-12" fill="currentColor" />
            <div className="absolute inset-0 bg-red-400 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
          </div>
          <span className="font-black text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent tracking-tighter">
            BLOOD<span className="text-red-600">LINK</span>
          </span>
        </Link>

        {/* Desktop Navigation - The "Slish Slash" Logic */}
        <div className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl">
          <NavLink to="/" currentPath={location.pathname}>Home</NavLink>
          
          {activeLinks.map((link) => (
            <NavLink key={link.path} to={link.path} currentPath={location.pathname}>
              <span className="flex items-center gap-2">
                {link.icon} {link.name}
              </span>
            </NavLink>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {!role ? (
            <Link to="/login" className="relative px-6 py-2 font-bold text-white group">
              <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-2 -translate-y-2 bg-red-400 group-hover:translate-x-0 group-hover:translate-y-0 rounded-lg"></span>
              <span className="absolute inset-0 w-full h-full border-2 border-gray-900 rounded-lg"></span>
              <span className="relative text-gray-900 group-hover:text-white">Login</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-red-600 to-orange-400 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
                S
              </div>
              <button onClick={() => setRole(null)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-800">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </motion.div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 inset-x-4 bg-white/95 backdrop-blur-2xl rounded-2xl border border-gray-100 p-6 shadow-2xl md:hidden"
          >
            <div className="flex flex-col gap-4">
              <Link to="/" onClick={() => setIsOpen(false)} className="text-xl font-bold border-b pb-2">Home</Link>
              {activeLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-700">
                  {link.icon} {link.name}
                </Link>
              ))}
              {!role && <Link to="/login" className="bg-red-600 text-white text-center py-3 rounded-xl font-bold">Get Started</Link>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Helper Component for Animated Links
const NavLink = ({ to, children, currentPath }) => {
  const isActive = currentPath === to;
  return (
    <Link to={to} className="relative px-4 py-2 text-sm font-bold transition-colors">
      <span className={`relative z-10 ${isActive ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'}`}>
        {children}
      </span>
      {isActive && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
};

export default Navbar;