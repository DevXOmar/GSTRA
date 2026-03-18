"use client";

import { useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { LanguageCode, sendChat } from "@/lib/api";

type ChatMessage = {
  role: "user" | "assistant";
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
  "Explain GSTR-3B filing"
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Namaste. I am your GST assistant. Ask me about GST registration, filing, rates, ITC, and compliance."
    }
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [turnover, setTurnover] = useState("2000000");
  const [sector, setSector] = useState("Retail");
  const [state, setState] = useState("Telangana");
  const [gstNumber, setGstNumber] = useState("");

  const mutation = useMutation({
    mutationFn: sendChat,
    onSuccess: (resp) => {
      setMessages((prev) => [...prev, { role: "assistant", content: resp.data.answer }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I could not process that request right now. Please try again."
        }
      ]);
    }
  });

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
    <div className="grid gap-4 p-4 md:grid-cols-[320px_1fr] md:p-6">
      <aside className="rounded-2xl border border-[#7B1C1C]/20 bg-[#fff7f2] p-4">
        <h2 className="text-lg font-bold text-[#7B1C1C]">Business Profile</h2>
        <p className="text-sm text-[#7B1C1C]/80">Personalize GST guidance by sharing your details.</p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="w-full rounded-lg border border-[#7B1C1C]/30 bg-white px-3 py-2"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm">Turnover (INR)</span>
            <input
              value={turnover}
              onChange={(e) => setTurnover(e.target.value)}
              className="w-full rounded-lg border border-[#7B1C1C]/30 bg-white px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm">Sector</span>
            <input
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full rounded-lg border border-[#7B1C1C]/30 bg-white px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm">State</span>
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-lg border border-[#7B1C1C]/30 bg-white px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm">GST Number (Optional)</span>
            <input
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className="w-full rounded-lg border border-[#7B1C1C]/30 bg-white px-3 py-2"
            />
          </label>
        </div>
      </aside>

      <section className="flex h-[78vh] flex-col overflow-hidden rounded-2xl border border-[#7B1C1C]/20 bg-[#fffaf6]">
        <div className="border-b border-[#7B1C1C]/10 p-4">
          <p className="font-semibold text-[#7B1C1C]">Suggested Prompts</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => submitMessage(prompt)}
                className="rounded-full border border-[#7B1C1C]/25 bg-white px-3 py-1 text-sm hover:bg-[#ffe9dc]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((msg, idx) => (
            <div key={`${msg.role}-${idx}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === "user" ? "bg-[#7B1C1C] text-[#fff7f2]" : "bg-white text-[#2A1616]"
                }`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}

          {mutation.isPending && (
            <div className="flex justify-start">
              <div className="skeleton max-w-[65%] rounded-2xl bg-white px-4 py-3 text-sm text-[#7B1C1C]">
                Typing GST guidance...
              </div>
            </div>
          )}
        </div>

        <form
          className="flex gap-2 border-t border-[#7B1C1C]/10 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            submitMessage(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your GST question..."
            className="flex-1 rounded-xl border border-[#7B1C1C]/20 bg-white px-3 py-2"
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-xl bg-[#7B1C1C] px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
