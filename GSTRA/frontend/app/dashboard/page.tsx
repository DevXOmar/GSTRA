"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { checkCompliance, LanguageCode } from "@/lib/api";

const penaltyData = [
  { delay: "Up to 1 month", amount: 5000 },
  { delay: "1 to 3 months", amount: 10000 },
  { delay: "3 to 6 months", amount: 25000 },
  { delay: "6+ months", amount: 50000 }
];

export default function DashboardPage() {
  const [turnover, setTurnover] = useState(2000000);
  const [sector, setSector] = useState("Retail");
  const [state, setState] = useState("Telangana");
  const [language, setLanguage] = useState<LanguageCode>("en");

  const mutation = useMutation({
    mutationFn: checkCompliance
  });

  return (
    <div className="space-y-4 p-4 md:p-6">
      <h2 className="text-xl font-bold text-[#7B1C1C]">Compliance Dashboard</h2>

      <div className="grid gap-4 rounded-2xl border border-[#7B1C1C]/20 bg-[#fff7f2] p-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm">Turnover: INR {turnover.toLocaleString("en-IN")}</span>
          <input
            type="range"
            min={100000}
            max={10000000}
            step={100000}
            value={turnover}
            onChange={(e) => setTurnover(Number(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm">Sector</span>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full rounded-lg border border-[#7B1C1C]/30 bg-white px-3 py-2"
          >
            <option>Retail</option>
            <option>Manufacturing</option>
            <option>Services</option>
            <option>E-commerce</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm">State</span>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-lg border border-[#7B1C1C]/30 bg-white px-3 py-2"
          >
            <option>Telangana</option>
            <option>Tamil Nadu</option>
            <option>Karnataka</option>
            <option>Maharashtra</option>
            <option>West Bengal</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm">Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="w-full rounded-lg border border-[#7B1C1C]/30 bg-white px-3 py-2"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="te">Telugu</option>
            <option value="ta">Tamil</option>
            <option value="bn">Bengali</option>
          </select>
        </label>

        <button
          onClick={() =>
            mutation.mutate({
              turnover,
              sector: `${sector} in ${state}`,
              filing_type: "regular",
              language
            })
          }
          className="self-end rounded-xl bg-[#7B1C1C] px-4 py-2 font-semibold text-white"
        >
          Run Compliance Check
        </button>
      </div>

      {mutation.isPending && (
        <div className="space-y-3">
          <div className="skeleton h-16 rounded-xl bg-[#f5d7d1]" />
          <div className="skeleton h-16 rounded-xl bg-[#f5d7d1]" />
          <div className="skeleton h-72 rounded-xl bg-[#f5d7d1]" />
        </div>
      )}

      {mutation.data && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-[#7B1C1C]/20 bg-white p-4">
              <p className="text-sm text-[#7B1C1C]/70">Registration Requirement</p>
              <p className="mt-2 font-semibold">{mutation.data.data.registration_required}</p>
            </article>

            <article className="rounded-xl border border-[#7B1C1C]/20 bg-white p-4">
              <p className="text-sm text-[#7B1C1C]/70">Applicable Forms</p>
              <p className="mt-2 font-semibold">{mutation.data.data.applicable_forms.join(", ") || "N/A"}</p>
            </article>

            <article className="rounded-xl border border-[#7B1C1C]/20 bg-white p-4">
              <p className="text-sm text-[#7B1C1C]/70">Penalty Risk Meter</p>
              <p className="mt-2 font-semibold text-[#AA3A2A]">Moderate to High if non-filing continues</p>
            </article>
          </div>

          <div className="rounded-xl border border-[#7B1C1C]/20 bg-white p-4">
            <h3 className="mb-2 font-semibold text-[#7B1C1C]">Filing Calendar (Due Dates)</h3>
            <ul className="list-disc pl-5 text-sm">
              {mutation.data.data.due_dates.map((date, idx) => (
                <li key={`${date}-${idx}`}>{date}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-[#7B1C1C]/20 bg-white p-4">
            <h3 className="mb-3 font-semibold text-[#7B1C1C]">Penalty by Delay Period</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={penaltyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="delay" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#7B1C1C" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
