"use client";

import { useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect } from "react";
import { sendChat } from "@/lib/api";
import { Send, Settings2, Sparkles, User, Bot, AlertCircle, Mic, Link as LinkIcon, Share, FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type ChatMessage = {
  role: "user" | "assistant" | "error";
  content: string;
  citations?: { title: string; excerpt: string }[];
};

const SUGGESTED_PROMPTS = [
  "What is my GST liability?",
  "Am I eligible for composition scheme?",
  "Explain GSTR-3B filing",
  "How to claim ITC?"
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Namaste! I am your GST assistant. I can help you with registration, filing returns, rates, and ITC. How can I help your business today?",
      citations: [
        { title: "GST Circular 12/2023", excerpt: "Under Section 22 of the CGST Act..." }
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [turnover, setTurnover] = useState("2000000");
  const [sector, setSector] = useState("Retail");
  const [state, setState] = useState("Telangana");
  const [gstMode, setGstMode] = useState("Regular");
  const [customerType, setCustomerType] = useState("B2B & B2C");
  const [showSettings, setShowSettings] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeCitation, setActiveCitation] = useState<{ title: string; excerpt: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: sendChat,
    onSuccess: (resp) => {
      if (resp.status === "error") {
        toast.error(resp.data.answer || "Failed to get a response.");
        setMessages((prev) => [...prev, { role: "error", content: resp.data.answer || "An error occurred." }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: resp.data.answer }]);
      }
    },
    onError: (err: any) => {
      toast.error("Failed to connect to the assistant.");
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          content: "I could not process that request right now. Please check your internet or try again later."
        }
      ]);
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mutation.isPending]);

  const submitMessage = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || mutation.isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");

    mutation.mutate({
      message: trimmed,
      language: "en",
      business_type: sector,
      // Pass the extra profile context to backend if supported
      metadata: { turnover, state, gstMode, customerType } 
    } as any); // Casting since api.ts may not have metadata defined yet
  };

  const handleExportCA = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to generate the PDF.");
      return;
    }
    
    // Convert markdown to HTML for the print view since we don't have React components there
    const makeHtml = (text: string) => {
      let html = text
        .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
        .replace(/\\n/g, '<br/>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
      
      // Simple list handling
      html = html.replace(/(?:^|<br\/>)\s*[-*]\s+(.*)/g, '<li>$1</li>');
      html = html.replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>');
      return html;
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GSTRA Advisory Summary - ${new Date().toLocaleDateString()}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            :root {
              --primary: #e11d48;
              --primary-light: #fff1f2;
              --text-main: #0f172a;
              --text-muted: #64748b;
              --bg-page: #f8fafc;
              --border-color: #e2e8f0;
            }
            body { 
              font-family: 'Inter', system-ui, -apple-system, sans-serif; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px; 
              color: var(--text-main); 
              line-height: 1.6;
              background-color: white;
            }
            .header {
              border-bottom: 2px solid var(--primary);
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .header-content h1 { 
              color: var(--primary); 
              margin: 0 0 5px 0; 
              font-size: 28px; 
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            .header-content p {
              margin: 0;
              color: var(--text-muted);
              font-size: 14px;
            }
            .watermark {
              font-size: 12px;
              font-weight: 600;
              color: #cbd5e1;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .profile-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              background: var(--bg-page);
              border: 1px solid var(--border-color);
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 40px;
            }
            .profile-item {
              display: flex;
              flex-direction: column;
            }
            .profile-label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 600;
              color: var(--text-muted);
              margin-bottom: 4px;
            }
            .profile-value {
              font-size: 15px;
              font-weight: 500;
              color: var(--text-main);
            }
            .qa-section {
              margin-bottom: 40px;
            }
            .session-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 20px;
              color: var(--text-main);
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .session-title::before {
              content: '';
              display: inline-block;
              width: 4px;
              height: 18px;
              background: var(--primary);
              border-radius: 2px;
            }
            .message { 
              margin-bottom: 20px; 
              padding: 20px; 
              border-radius: 8px; 
              page-break-inside: avoid; 
            }
            .user { 
              background: #ffffff; 
              border: 1px solid var(--border-color); 
              border-left: 4px solid var(--text-muted);
              margin-left: 20px; 
            }
            .assistant { 
              background: var(--primary-light); 
              border: 1px solid #ffe4e6; 
              border-left: 4px solid var(--primary);
              margin-right: 20px;
            }
            .role { 
              font-weight: 600; 
              font-size: 12px; 
              text-transform: uppercase; 
              margin-bottom: 8px; 
              letter-spacing: 0.5px;
            }
            .user .role { color: var(--text-muted); }
            .assistant .role { color: var(--primary); }
            
            .content { 
              font-size: 14px; 
            }
            .content p { margin-top: 0; }
            .content strong { color: #000; }
            .content ul { padding-left: 20px; margin: 10px 0; }
            .content li { margin-bottom: 5px; }
            .content code {
              background: rgba(0,0,0,0.05);
              padding: 2px 4px;
              border-radius: 3px;
              font-family: monospace;
              font-size: 13px;
            }
            
            .citations { 
              margin-top: 15px; 
              padding-top: 15px; 
              border-top: 1px dashed rgba(0,0,0,0.1); 
            }
            .citation-title {
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              color: var(--text-muted);
              margin-bottom: 8px;
            }
            .citation-item {
              background: white;
              border: 1px solid var(--border-color);
              padding: 8px 12px;
              border-radius: 6px;
              margin-bottom: 8px;
              font-size: 12px;
            }
            .citation-item strong {
              display: block;
              color: var(--text-main);
              margin-bottom: 3px;
            }
            .citation-item span {
              color: var(--text-muted);
              font-style: italic;
            }
            
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid var(--border-color);
              text-align: center;
              font-size: 12px;
              color: var(--text-muted);
              page-break-inside: avoid;
            }
            
            @media print {
              body { padding: 0; background: white; }
              @page { margin: 2cm; }
              .user, .assistant { border: 1px solid #ccc; background: transparent !important; }
              .assistant { border-left: 4px solid var(--primary); }
              .user { border-left: 4px solid var(--text-muted); }
              .profile-grid { background: transparent !important; border: 1px solid #ccc; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-content">
              <h1>GSTRA Tax Advisory</h1>
              <p>Automated CA Consultation Report</p>
            </div>
            <div class="watermark">CONFIDENTIAL</div>
          </div>
          
          <div class="profile-grid">
            <div class="profile-item">
              <span class="profile-label">Date Generated</span>
              <span class="profile-value">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Business Sector</span>
              <span class="profile-value">${sector}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Annual Turnover</span>
              <span class="profile-value">₹${(Number(turnover) / 100000).toFixed(1)} Lakhs</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">State Jurisdiction</span>
              <span class="profile-value">${state}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">GST Mode</span>
              <span class="profile-value">${gstMode}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Customer Typology</span>
              <span class="profile-value">${customerType}</span>
            </div>
          </div>
          
          <div class="qa-section">
            <div class="session-title">Consultation Transcript</div>
            ${messages.filter(m => m.role !== 'error').map(m => `
              <div class="message ${m.role}">
                <div class="role">${m.role === 'user' ? 'Client Query' : 'GSTRA Advisor'}</div>
                <div class="content">${makeHtml(m.content)}</div>
                ${m.citations && m.citations.length > 0 ? `
                  <div class="citations">
                    <div class="citation-title">Referenced Authorities</div>
                    ${m.citations.map(c => `
                      <div class="citation-item">
                        <strong>${c.title}</strong>
                        <span>"${c.excerpt}"</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p>This document is auto-generated by GSTRA's AI Tax Assistant.<br>It does not constitute legally binding advice. Please consult a certified professional before making final decisions.</p>
          </div>
          <script>
            window.onload = () => { 
                // Give it a moment to render fonts
                setTimeout(() => {
                  window.print(); 
                }, 300);
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success("Summary ready for PDF export!");
  };

  const toggleListen = () => {
    if (isListening) {
      setIsListening(false);
      setInput((prev) => prev + " (Transcribed speech...)");
      toast.success("Audio transcribed.");
    } else {
      setIsListening(true);
      toast("Listening...", { icon: <Mic className="text-rose-500 animate-pulse" /> });
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] flex-col md:flex-row gap-4">
      {/* Context Panel Modal/Sidebar for Mobile, Always Visible on Desktop if wide enough, or collapsible */}
      <div className={`md:w-80 flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all ${showSettings ? 'block' : 'hidden md:flex'}`}>
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Settings2 size={16} className="text-rose-600" /> Business Profile
          </h2>
          <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setShowSettings(false)}>
            Close
          </button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          <label className="block">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Annual Turnover</span>
              <span className="text-xs font-bold text-rose-700">₹{(Number(turnover) / 100000).toFixed(1)}L</span>
            </div>
            <input
              type="range"
              min={100000}
              max={50000000}
              step={100000}
              value={turnover}
              onChange={(e) => setTurnover(e.target.value)}
              className="w-full accent-rose-600 mb-1"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>₹1L</span>
              <span>₹5Cr</span>
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">State</span>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
              >
                <option>Telangana</option>
                <option>Tamil Nadu</option>
                <option>Karnataka</option>
                <option>Maharashtra</option>
                <option>Delhi</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sector</span>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
              >
                <option>Retail</option>
                <option>Manufacturing</option>
                <option>Services</option>
                <option>E-com</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">GST Status</span>
              <select
                value={gstMode}
                onChange={(e) => setGstMode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
              >
                <option>Regular</option>
                <option>Composition</option>
                <option>Unregistered</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">B2B / B2C</span>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
              >
                <option>Both</option>
                <option>B2B Only</option>
                <option>B2C Only</option>
              </select>
            </label>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-rose-500" /> Instant Profile Insights
            </h3>
            <div className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {Number(turnover) >= 2000000 && state === 'Telangana' ? (
                  <motion.div
                    key="reg-mandatory"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    ⚠️ Registration Mandatory
                  </motion.div>
                ) : (
                  <motion.div
                    key="reg-optional"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    ✅ Below Threshold
                  </motion.div>
                )}

                {Number(turnover) <= 15000000 && sector === 'Retail' && (
                  <motion.div
                    key="comp-eligible"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    ✅ Composition Scheme Eligible
                  </motion.div>
                )}

                {gstMode === 'Regular' && (
                  <motion.div
                    key="filing-freq"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex gap-2"
                  >
                    <span className="px-2.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold tracking-wider uppercase shadow-sm">
                      Requires GSTR-1 & GSTR-3B
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <section className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        {/* Mobile toggler & Desktop Export Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-white">
          <span className="font-semibold text-slate-800 text-sm md:hidden">GSTRA Chat</span>
          <span className="hidden md:flex font-semibold text-slate-800 text-sm items-center gap-2">
            <Sparkles size={16} className="text-rose-600" /> AI Tax Associate
          </span>
          <div className="flex items-center gap-2">
            <button onClick={handleExportCA} className="hidden md:flex text-slate-600 hover:text-slate-900 text-sm items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full transition-colors">
              <Download size={14} /> Export Summary
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="md:hidden text-slate-500 text-sm flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full">
              <Settings2 size={14} /> Profile
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-slate-50 bg-white shadow-sm z-10 relative">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => submitMessage(prompt)}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors flex items-center gap-1.5"
              >
                <Sparkles size={12} className="text-rose-500" /> {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              const isError = msg.role === "error";
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`${msg.role}-${idx}`}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${isUser ? "flex-row-reverse" : ""}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                      isUser ? 'bg-rose-600 text-white' : isError ? 'bg-red-100 text-red-600' : 'bg-white border border-slate-200 text-rose-600'
                    }`}>
                      {isUser ? <User size={16} /> : isError ? <AlertCircle size={16} /> : <Bot size={16} />}
                    </div>
                    
                    <div
                      className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                        isUser 
                          ? "bg-rose-600 text-white rounded-tr-sm" 
                          : isError
                            ? "bg-red-50 text-red-800 border border-red-100 rounded-tl-sm"
                            : "bg-white text-slate-800 border border-slate-200 rounded-tl-sm"
                      }`}
                    >
                      <div className={`prose prose-sm max-w-none ${isUser ? "prose-invert" : "prose-slate"} 
                        prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-2 prose-strong:font-semibold`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100/10 flex flex-wrap gap-2">
                          <span className="text-xs font-semibold text-slate-400 w-full mb-1">Sources</span>
                          {msg.citations.map((cite, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveCitation(cite)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[11px] font-medium border border-rose-200 hover:bg-rose-100 transition-colors"
                            >
                              <LinkIcon size={10} /> {cite.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {mutation.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 text-rose-400 flex items-center justify-center shadow-sm">
                  <Bot size={16} />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white text-slate-500 border border-slate-200 rounded-tl-sm flex items-center gap-2 shadow-sm">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="p-3 bg-white border-t border-slate-200"
          onSubmit={(e) => {
            e.preventDefault();
            submitMessage(input);
          }}
        >
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={toggleListen}
              className={`flex-shrink-0 p-3 rounded-full transition-all ${isListening ? 'bg-rose-100 text-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600'}`}
            >
              {isListening ? (
                <div className="relative">
                  <Mic size={20} className="animate-pulse" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                </div>
              ) : (
                <Mic size={20} />
              )}
            </button>
            <div className="relative flex-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask about GST registrations, rates, or returns..."}
                className="w-full rounded-full border border-slate-300 bg-slate-50 pl-4 pr-12 py-3 text-sm focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                disabled={mutation.isPending || isListening}
              />
              <button
                type="submit"
                disabled={mutation.isPending || !input.trim()}
                className="absolute right-1 top-1 p-2 rounded-full text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </form>

        {/* Legal Proof Drawer */}
        <AnimatePresence>
          {activeCitation && (
            <motion.div 
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-full md:w-80 bg-white border-l border-slate-200 shadow-2xl flex flex-col z-50"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="font-bold flex items-center gap-2 text-slate-800 text-sm">
                  <FileText size={16} className="text-rose-600" /> Source Verifier
                </span>
                <button 
                  onClick={() => setActiveCitation(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 bg-white rounded-md border border-slate-200"
                >
                  Close
                </button>
              </div>
              <div className="p-5 flex-1 overflow-y-auto">
                <h3 className="font-bold text-lg text-slate-900 mb-4">{activeCitation.title}</h3>
                <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl">
                  <p className="text-sm text-rose-900 font-medium leading-relaxed italic">
                    "{activeCitation.excerpt}"
                  </p>
                </div>
                <div className="mt-6 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  This excerpt is pulled directly from official government circulars via our RAG architecture to ensure accurate, hallucination-free advice.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </section>
    </div>
  );
}
