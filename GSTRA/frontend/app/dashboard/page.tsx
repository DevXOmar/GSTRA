"use client";

import { 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  Settings2,
  X,
  FileText,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function DashboardPage() {
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showLegalDetails, setShowLegalDetails] = useState<{title: string, text: string} | null>(null);

  // Profile State
  const [turnover, setTurnover] = useState("2000000");
  const [sector, setSector] = useState("Retail");
  const [state, setState] = useState("Telangana");
  
  // Smart Logics
  const numTurnover = Number(turnover);
  const isRegistrationRequired = numTurnover >= 2000000;
  const isCompositionEligible = numTurnover <= 15000000 && sector === "Retail";
  
  const currentDay = new Date().getDate();
  const isGstr1Urgent = currentDay >= 8 && currentDay <= 11;
  const isGstr3bUrgent = currentDay >= 17 && currentDay <= 20;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      
      {/* Header & Read-Only Profile Bar */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Compliance Center</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Real-time GST risk assessment and deadlines.</p>
        </div>
        
        {/* Sleek Read-Only Profile Pill */}
        <div className="flex bg-slate-900 text-white rounded-xl p-1 shadow-lg shadow-slate-900/10">
          <div className="flex items-center gap-3 px-4 py-2 border-r border-slate-700/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-sm font-semibold tracking-wide">
              ₹{(numTurnover/100000).toFixed(1)}L • {sector} • {state}
            </p>
          </div>
          <button 
            onClick={() => setShowProfileDrawer(true)}
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors rounded-lg flex items-center gap-2"
          >
            <Settings2 size={16} /> Edit
          </button>
        </div>
      </header>

      {/* Professional Penalty-Free Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-slate-900/10 border border-slate-800"
      >
        <div className="flex items-center gap-6 mb-4 md:mb-0">
          <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full"></div>
              <div className="relative bg-slate-800 p-4 rounded-full border border-slate-700">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">Penalty-Free Status Active</h2>
            <p className="text-slate-400 text-sm mt-1">
              You have maintained full compliance for <span className="text-emerald-400 font-bold">142 Days</span>.
            </p>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center min-w-[200px]">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Total Risk Avoided</p>
            <p className="text-2xl font-black text-white">₹14,500</p>
        </div>
      </motion.div>

      {/* Top 2 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Next Deadline Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group flex flex-col"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-6 relative">
            <div className="bg-red-100 text-red-700 p-3 rounded-xl border border-red-200">
                <Clock size={20} />
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${currentDay > 20 ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
               {currentDay > 20 ? 'NORMAL' : 'URGENT'}
            </span>
          </div>
          <div className="mt-auto">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Upcoming Deadline</h3>
            <p className="text-3xl font-black text-slate-900 mb-2">{currentDay > 20 ? "Next Month" : "Few Days"}</p>
            <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
               <Clock size={14} className="text-slate-400" /> Plan ahead for next return.
            </p>
          </div>
        </motion.div>

        {/* Financial Risk Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group flex flex-col"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-6 relative">
            <div className="bg-rose-100 text-rose-700 p-3 rounded-xl border border-rose-200">
                <AlertTriangle size={20} />
            </div>
            <span className="text-rose-600 text-xs font-bold rounded-full bg-rose-50 px-3 py-1 border border-rose-200">
               PROJECTED
            </span>
          </div>
          <div className="mt-auto">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Estimated Penalty Risk</h3>
            <p className="text-3xl font-black text-slate-900 mb-2">₹1,500</p>
            <p className="text-sm font-medium text-slate-600">
               If returns are delayed by 30 days (+₹50/day).
            </p>
          </div>
        </motion.div>
      </div>

      {/* Informational Status Cards - Redesigned Smart Status Indicators */}
      <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mt-10">Smart Status & Next Steps</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Registration Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
             <h3 className="text-slate-800 font-bold flex items-center gap-2">
               <BookOpen size={18} className={isRegistrationRequired ? "text-red-500" : "text-emerald-500"} /> 
               Registration
             </h3>
             {isRegistrationRequired ? (
               <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                 Required
               </span>
             ) : (
               <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                 Exempt
               </span>
             )}
          </div>
          <p className="text-sm text-slate-600 font-medium mb-6 flex-1">
            {isRegistrationRequired 
              ? `Your turnover of ₹${(numTurnover/100000).toFixed(1)}L exceeds the ₹20 Lakh threshold for ${state}. You must register for GST.` 
              : `Your turnover of ₹${(numTurnover/100000).toFixed(1)}L is below the ₹20 Lakh threshold. GST registration is optional.`}
          </p>
          <div className="mt-auto pt-4 border-t border-slate-100">
             <a 
               href={isRegistrationRequired ? "https://reg.gst.gov.in/registration/" : "https://www.gst.gov.in/help"} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-lg border border-slate-200 transition-colors"
             >
               {isRegistrationRequired ? "Apply on GST Portal" : "Learn about voluntary"}
               <ExternalLink size={14} />
             </a>
          </div>
        </div>

        {/* Composition Scheme Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
             <h3 className="text-slate-800 font-bold flex items-center gap-2">
               <TrendingUp size={18} className={isCompositionEligible ? "text-emerald-500" : "text-slate-400"} /> 
               Composition
             </h3>
             {isCompositionEligible ? (
               <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                 Eligible
               </span>
             ) : (
               <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                 Not Eligible
               </span>
             )}
          </div>
          <p className="text-sm text-slate-600 font-medium mb-6 flex-1">
            {isCompositionEligible
              ? "You can opt for this scheme to pay a flat 1% tax and file quarterly instead of monthly."
              : `Your profile (${(numTurnover/100000).toFixed(1)}L / ${sector}) exceeds limit of ₹1.5 Cr or sector rules.`}
          </p>
          <div className="mt-auto pt-4 border-t border-slate-100">
            {isCompositionEligible ? (
               <a 
                 href="https://www.gst.gov.in/help/composition" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold rounded-lg border border-emerald-200 transition-colors"
               >
                 How to Opt-in <ExternalLink size={14} />
               </a>
            ) : (
                <button 
                  onClick={() => setShowLegalDetails({
                     title: "Composition Scheme Rules",
                     text: "To be eligible, turnover must be under ₹1.5 Cr and operations must match rules (e.g. Retail/Manufacturing, no inter-state supply)."
                  })}
                  className="w-full flex justify-center items-center gap-1 px-4 py-2 text-slate-500 hover:text-slate-900 text-sm font-bold rounded-lg transition-colors border border-transparent hover:border-slate-200"
                >
                  Eligibility Rules <ChevronRight size={14} />
                </button>
            )}
          </div>
        </div>

        {/* Required Forms Card Redesigned */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
             <h3 className="text-white font-bold flex items-center gap-2">
               <FileText size={18} className="text-slate-400" /> Required Forms
             </h3>
          </div>
          
          <div className="space-y-3 relative z-10 flex-1">
            <div className={`p-3 rounded-xl border transition-colors ${isGstr1Urgent ? 'bg-red-500/20 border-red-500/50' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`font-bold ${isGstr1Urgent ? 'text-red-400' : 'text-slate-200'}`}>GSTR-1</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${isGstr1Urgent ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  Due 11th
                </span>
              </div>
              <p className="text-xs text-slate-400">Outward Supplies Detail</p>
            </div>

            <div className={`p-3 rounded-xl border transition-colors ${isGstr3bUrgent ? 'bg-red-500/20 border-red-500/50' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`font-bold ${isGstr3bUrgent ? 'text-red-400' : 'text-slate-200'}`}>GSTR-3B</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${isGstr3bUrgent ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  Due 20th
                </span>
              </div>
              <p className="text-xs text-slate-400">Monthly Summary Return</p>
            </div>
          </div>
        </div>

      </div>

      {/* Editor Drawer */}
      <AnimatePresence>
        {showProfileDrawer && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
               className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
               onClick={() => setShowProfileDrawer(false)}
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-slate-900">Update Profile</h3>
                <button onClick={() => setShowProfileDrawer(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Annual Turnover</label>
                  <p className="text-2xl font-black text-rose-600 mb-4">₹{(Number(turnover)/100000).toFixed(1)} Lakhs</p>
                  <input
                    type="range" min={100000} max={50000000} step={100000}
                    value={turnover}
                    onChange={(e) => setTurnover(e.target.value)}
                    className="w-full accent-rose-600"
                  />
                  <p className="text-xs text-slate-500 mt-2 text-right">Max: ₹500 Lakhs</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Sector</label>
                  <select
                    value={sector} onChange={(e) => setSector(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
                  >
                    <option>Retail</option>
                    <option>Manufacturing</option>
                    <option>Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Registered State</label>
                  <select
                    value={state} onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
                  >
                    <option>Telangana</option>
                    <option>Maharashtra</option>
                    <option>Karnataka</option>
                    <option>Delhi</option>
                  </select>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                 <button 
                   onClick={() => setShowProfileDrawer(false)}
                   className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
                 >
                   Save Active Profile
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Legal Text Modal */}
      <AnimatePresence>
        {showLegalDetails && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
               className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
               onClick={() => setShowLegalDetails(null)}
            >
               <motion.div 
                 initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                 onClick={(e) => e.stopPropagation()}
                 className="bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden"
               >
                 <div className="bg-slate-900 p-5 flex justify-between items-center">
                    <h4 className="text-white font-bold flex items-center gap-2">
                       <BookOpen size={18} className="text-rose-500" /> Legal Context
                    </h4>
                    <button onClick={() => setShowLegalDetails(null)} className="text-slate-400 hover:text-white">
                      <X size={20} />
                    </button>
                 </div>
                 <div className="p-6">
                    <h5 className="font-bold text-slate-800 mb-3">{showLegalDetails.title}</h5>
                    <div className="bg-slate-50 border-l-4 border-slate-300 p-4 rounded-r-xl">
                      <p className="text-sm text-slate-600 leading-relaxed font-serif">
                        "{showLegalDetails.text}"
                      </p>
                    </div>
                 </div>
               </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}