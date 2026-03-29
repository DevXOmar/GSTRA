"use client";

import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { checkCompliance, LanguageCode } from "@/lib/api";
import { toast } from "sonner";
import { ShieldCheck, CalendarClock, AlertCircle, TrendingUp, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { motion } from "framer-motion";

const penaltyData = [
  { delay: "1 month", amount: 1500 },
  { delay: "3 months", amount: 4500 },
  { delay: "6 months", amount: 9000 },
  { delay: "12+ months", amount: 18000 }
];

export default function DashboardPage() {
  const [turnover, setTurnover] = useState(2000000);
  const [sector, setSector] = useState("Retail");
  const [state, setState] = useState("Telangana");
  const [language, setLanguage] = useState<LanguageCode>("en");

  const mutation = useMutation({
    mutationFn: checkCompliance,
    onSuccess: (res) => {
        if (res.status === 'error') {
            toast.error("Failed to check compliance. Please try again.");
        } else {
            toast.success("Compliance profile updated successfully.");
        }
    },
    onError: () => {
        toast.error("Network error while checking compliance.");
    }
  });

  // Automatically check on mount
  useEffect(() => {
    mutation.mutate({
      turnover,
      sector: `${sector} in ${state}`,
      filing_type: "regular",
      language
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = () => {
      mutation.mutate({
        turnover,
        sector: `${sector} in ${state}`,
        filing_type: "regular",
        language
      });
  };

  const getArray = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [String(val)];
  };

  const getStatusClass = (status: string) => {
    const s = String(status || "").toLowerCase();
    if (s.includes('yes') || s.includes('required')) return 'bg-amber-50 border-amber-200';
    return 'bg-green-50 border-green-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Activity className="text-rose-700" /> Compliance Tracker
            </h2>
            <p className="text-sm text-slate-500 mt-1">Keep track of your filing status, deadlines, and penalty risks.</p>
          </div>
          <button 
             onClick={handleUpdate} 
             disabled={mutation.isPending}
             className="bg-rose-700 hover:bg-rose-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
             <ShieldCheck size={18} /> Update Profile
          </button>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4">
        <label className="space-y-2 col-span-2 md:col-span-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Turnover: ₹{(turnover / 100000).toFixed(1)} Lakhs</span>
          <input
            type="range"
            min={100000}
            max={10000000}
            step={100000}
            value={turnover}
            onChange={(e) => setTurnover(Number(e.target.value))}
            className="w-full accent-rose-700"
          />
        </label>

        <label className="space-y-1 col-span-2 md:col-span-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sector</span>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-rose-500 outline-none"
          >
            <option>Retail</option>
            <option>Manufacturing</option>
            <option>Services</option>
            <option>E-commerce</option>
          </select>
        </label>

        <label className="space-y-1 col-span-2 md:col-span-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">State</span>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-rose-500 outline-none"
          >
            <option>Telangana</option>
            <option>Tamil Nadu</option>
            <option>Karnataka</option>
            <option>Maharashtra</option>
            <option>West Bengal</option>
          </select>
        </label>

        <label className="space-y-1 col-span-2 md:col-span-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-rose-500 outline-none"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="te">Telugu</option>
            <option value="ta">Tamil</option>
            <option value="bn">Bengali</option>
          </select>
        </label>
      </div>

      {mutation.isPending && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
             <div className="skeleton h-24 rounded-2xl bg-slate-200" />
             <div className="skeleton h-24 rounded-2xl bg-slate-200" />
             <div className="skeleton h-24 rounded-2xl bg-slate-200" />
          </div>
          <div className="skeleton h-48 rounded-2xl bg-slate-200" />
        </div>
      )}

      {mutation.data && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <article className={`rounded-2xl border p-5 shadow-sm ${getStatusClass(mutation.data.data.registration_required)}`}>
              <div className="flex items-center gap-2 mb-2">
                 {String(mutation.data.data.registration_required || "").toLowerCase().includes('yes') || String(mutation.data.data.registration_required || "").toLowerCase().includes('required') ? <AlertCircle className="text-amber-600" size={18} /> : <CheckCircle2 className="text-green-600" size={18} />}
                 <p className="text-sm font-semibold text-slate-700">Registration</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{mutation.data.data.registration_required}</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                 <ShieldCheck className="text-rose-700" size={18} />
                 <p className="text-sm font-semibold text-slate-700">Required Forms</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                 {getArray(mutation.data.data.applicable_forms).map((form: string) => (
                    <span key={form} className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2 py-1 rounded">{form}</span>
                 ))}
                 {getArray(mutation.data.data.applicable_forms).length === 0 && <span className="text-sm text-slate-500">N/A</span>}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                 <TrendingUp className="text-rose-700" size={18} />
                 <p className="text-sm font-semibold text-slate-700">Composition Scheme</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{mutation.data.data.composition_eligible}</p>
            </article>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><CalendarClock size={18} className="text-rose-700" /> Upcoming Deadlines</h3>
              </div>
              <div className="p-0 flex-1">
                {getArray(mutation.data.data.due_dates).length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {getArray(mutation.data.data.due_dates).map((date: string, idx: number) => (
                        <div key={`${date}-${idx}`} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{date}</p>
                        </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-500 text-sm">No immediate deadlines found.</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
              <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><AlertCircle size={18} className="text-red-500" /> Action Required & Notes</h3>
              </div>
              <div className="p-4 flex-1 space-y-3">
                  {getArray(mutation.data.data.notes).map((note: string, idx: number) => (
                      <div key={`note-${idx}`} className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-sm text-amber-900">
                          <ChevronRight size={16} className="text-amber-500 shrink-0 mt-0.5" />
                          <p>{note}</p>
                      </div>
                  ))}
                  {getArray(mutation.data.data.penalties).map((penalty: string, idx: number) => (
                      <div key={`pen-${idx}`} className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-sm text-red-900">
                          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                          <p>{penalty}</p>
                      </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-800 text-sm uppercase tracking-wider">Estimated Late Fee Impact (GSTR-3B)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={penaltyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="delay" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip 
                    cursor={{ fill: '#F1F5F9' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="amount" fill="#be123c" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
