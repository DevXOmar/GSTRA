"use client";

import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { analyzeInvoice, LanguageCode } from "@/lib/api";

export default function InvoicePage() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<LanguageCode>("en");

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  const mutation = useMutation({
    mutationFn: ({ selectedFile, lang }: { selectedFile: File; lang: LanguageCode }) =>
      analyzeInvoice(selectedFile, lang)
  });

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    onDropAccepted: (acceptedFiles) => setFile(acceptedFiles[0])
  });

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-[#7B1C1C]">Invoice Analyzer</h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageCode)}
          className="rounded-lg border border-[#7B1C1C]/30 px-3 py-2"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="te">Telugu</option>
          <option value="ta">Tamil</option>
          <option value="bn">Bengali</option>
        </select>
      </div>

      <div
        {...getRootProps()}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-[#7B1C1C]/30 bg-[#fff7f2] p-8 text-center"
      >
        <input {...getInputProps()} />
        <p className="font-semibold">Drag and drop invoice image/PDF here</p>
        <p className="text-sm text-[#7B1C1C]/70">or click to browse files</p>
      </div>

      {file && (
        <div className="space-y-3 rounded-2xl border border-[#7B1C1C]/20 bg-white p-4">
          <p className="font-semibold">Preview: {file.name}</p>
          {file.type.includes("image") ? (
            <img src={previewUrl} alt="invoice preview" className="max-h-80 rounded-lg object-contain" />
          ) : (
            <iframe title="invoice preview" src={previewUrl} className="h-80 w-full rounded-lg" />
          )}
          <button
            onClick={() => mutation.mutate({ selectedFile: file, lang: language })}
            className="rounded-xl bg-[#7B1C1C] px-4 py-2 font-semibold text-white"
          >
            Analyze Invoice
          </button>
        </div>
      )}

      {mutation.isPending && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="skeleton h-24 rounded-xl bg-[#f5d7d1]" />
          <div className="skeleton h-24 rounded-xl bg-[#f5d7d1]" />
          <div className="skeleton h-24 rounded-xl bg-[#f5d7d1]" />
          <div className="skeleton h-24 rounded-xl bg-[#f5d7d1]" />
        </div>
      )}

      {mutation.data && (
        <div className="grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-[#7B1C1C]/20 bg-white p-4">
            <p className="text-sm text-[#7B1C1C]/70">HSN Code detected</p>
            <p className="text-2xl font-black text-[#7B1C1C]">{mutation.data.data.hsn}</p>
          </article>

          <article className="rounded-xl border border-[#7B1C1C]/20 bg-white p-4">
            <p className="text-sm text-[#7B1C1C]/70">GST Rate applicable</p>
            <p className="text-2xl font-black text-[#7B1C1C]">{mutation.data.data.gst_rate}</p>
          </article>

          <article className="rounded-xl border border-red-300 bg-red-50 p-4">
            <p className="font-semibold text-red-700">Errors found</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-red-800">
              {mutation.data.data.errors.length
                ? mutation.data.data.errors.map((item, idx) => <li key={`${item}-${idx}`}>{item}</li>)
                : "No errors found"}
            </ul>
          </article>

          <article className="rounded-xl border border-green-300 bg-green-50 p-4">
            <p className="font-semibold text-green-700">Suggestions</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-green-800">
              {mutation.data.data.suggestions.length
                ? mutation.data.data.suggestions.map((item, idx) => <li key={`${item}-${idx}`}>{item}</li>)
                : "No suggestions"}
            </ul>
          </article>
        </div>
      )}
    </div>
  );
}
