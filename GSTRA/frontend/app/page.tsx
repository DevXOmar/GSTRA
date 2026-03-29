"use client";

import { useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { useState, useRef, useEffect } from "react";
import { LanguageCode, sendChat } from "@/lib/api";
import { Send, Settings2, Sparkles, User, Bot, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type ChatMessage = {
  role: "user" | "assistant" | "error";
  content: string;
};

const LANGUAGE_OPTIONS: { label: string; value: LanguageCode }[] = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Telugu", value: "te" },
  { label: "Tamil", value: "ta" },
  { label: "Bengali", value: "bn" }
];

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
        "Namaste! I am your GST assistant. I can help you with registration, filing returns, rates, and ITC. How can I help your business today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [turnover, setTurnover] = useState("2000000");
  const [sector, setSector] = useState("Retail");
  const [showSettings, setShowSettings] = useState(false);
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
      language,
      business_type: sector
    });
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
            <span className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wider">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wider">Turnover (INR)</span>
            <input
              type="number"
              value={turnover}
              onChange={(e) => setTurnover(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wider">Sector</span>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
            >
              <option value="Retail">Retail & Shopkeepers</option>
              <option value="Service">Services & Freelancers</option>
              <option value="Manufacturing">Manufacturing</option>
            </select>
          </label>
          
          <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100">
            <p className="text-xs text-rose-800 leading-relaxed">
              Your profile helps GSTRA personalize the advice to your specific business compliance needs.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <section className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        {/* Mobile toggler */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-100 bg-white">
          <span className="font-semibold text-slate-800 text-sm">GSTRA Chat</span>
          <button onClick={() => setShowSettings(!showSettings)} className="text-slate-500 text-sm flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full">
            <Settings2 size={14} /> Profile
          </button>
        </div>

        <div className="p-4 border-b border-slate-50 bg-white">
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
          <div className="relative flex items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about GST registrations, rates, or returns..."
              className="w-full rounded-full border border-slate-300 bg-slate-50 pl-4 pr-12 py-3.5 text-sm focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
              disabled={mutation.isPending}
            />
            <button
              type="submit"
              disabled={mutation.isPending || !input.trim()}
              className="absolute right-2 p-2 rounded-full text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
