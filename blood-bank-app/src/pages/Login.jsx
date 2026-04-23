import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, LogIn, UserPlus, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', data);
      if (res.data.success) {
        login(res.data.user, res.data.token);
        if (res.data.user.role === 'donor') navigate('/donor');
        else if (res.data.user.role === 'hospital') navigate('/hospital');
        else navigate('/admin');
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 font-sans">
      <div className="w-full max-w-md space-y-6">
        
        {/* --- MAIN LOGIN CARD --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-white"
        >
          <div className="text-center mb-10">
            <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-red-600 rotate-3 border border-red-100">
              <LogIn size={36} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Blood<span className="text-red-600">Link</span></h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Secure Command Access</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Identity Endpoint (Email)</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                <input 
                  {...register("email")} 
                  type="email" 
                  placeholder="you@nexus.com" 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-red-600/30 focus:bg-white font-bold transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Access Protocol (Password)</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                <input 
                  {...register("password")} 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-red-600/30 focus:bg-white font-bold transition-all" 
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] hover:bg-red-600 transition-all flex items-center justify-center gap-3 group shadow-xl shadow-slate-200">
              Initialize Session <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </motion.div>

        {/* --- REGISTRATION FOOTER SECTION --- */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">No active credentials?</p>
          
          <div className="grid grid-cols-2 gap-4">
            <Link to="/register" className="group">
              <div className="bg-white border-2 border-slate-100 p-4 rounded-2xl hover:border-red-600/30 transition-all text-center">
                <UserPlus size={20} className="mx-auto mb-2 text-slate-400 group-hover:text-red-600 transition-colors" />
                <p className="text-[10px] font-black text-slate-900 uppercase">Join as Donor</p>
              </div>
            </Link>

            <Link to="/register" className="group">
              <div className="bg-white border-2 border-slate-100 p-4 rounded-2xl hover:border-red-600/30 transition-all text-center">
                <Building2 size={20} className="mx-auto mb-2 text-slate-400 group-hover:text-red-600 transition-colors" />
                <p className="text-[10px] font-black text-slate-900 uppercase">Join as Hospital</p>
              </div>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Login;