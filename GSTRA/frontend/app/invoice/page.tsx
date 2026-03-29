"use client";

import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { analyzeInvoice, LanguageCode } from "@/lib/api";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, FileSearch, Sparkles, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function InvoicePage() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<LanguageCode>("en");

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  const mutation = useMutation({
    mutationFn: ({ selectedFile, lang }: { selectedFile: File; lang: LanguageCode }) =>
      analyzeInvoice(selectedFile, lang),
    onSuccess: (res) => {
      if (res.status === "error") {
        toast.error("Analysis failed. Please check the invoice and try again.");
      } else {
        toast.success("Invoice analyzed successfully!");
      }
    },
    onError: () => {
      toast.error("Could not upload the invoice to our servers. Try again.");
    }
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "application/pdf": [".pdf"]
    },
    onDropAccepted: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      mutation.reset();
    },
    onDropRejected: () => {
      toast.error("Invalid file type. Please upload an image or PDF.");
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileSearch className="text-rose-600" /> Invoice Analyzer
          </h2>
          <p className="text-sm text-slate-500 mt-1">Upload a bill to check HSN codes, rates, and find errors automatically.</p>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageCode)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none w-full sm:w-auto"
        >
          <option value="en">English (Report)</option>
          <option value="hi">Hindi (Report)</option>
          <option value="te">Telugu (Report)</option>
          <option value="ta">Tamil (Report)</option>
          <option value="bn">Bengali (Report)</option>
        </select>
      </div>

      {!file && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[300px]
              ${isDragActive ? "border-rose-500 bg-rose-50" : "border-slate-300 bg-white hover:border-rose-400 hover:bg-slate-50"}`}
          >
            <input {...getInputProps()} />
            <div className={`p-4 rounded-full ${isDragActive ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"}`}>
              <UploadCloud size={40} />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-700">Drag and drop your invoice here</p>
              <p className="text-sm text-slate-500 mt-1">Supports JPG, PNG, WEBP, and PDF up to 10MB</p>
            </div>
            <button className="mt-2 px-6 py-2.5 bg-rose-50 text-rose-700 font-medium rounded-full hover:bg-rose-100 transition-colors">
              Browse files
            </button>
          </div>
        </motion.div>
      )}

      {file && (
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Left Pane: Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center">
             <div className="w-full bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <FileText size={16} /> <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                </div>
                <button
                  onClick={() => { setFile(null); mutation.reset(); }}
                  className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 rounded hover:bg-red-50"
                  disabled={mutation.isPending}
                >
                  Change File
                </button>
             </div>
             <div className="p-4 w-full bg-slate-100 flex justify-center items-center min-h-[400px]">
                {file.type.includes("image") ? (
                  <img src={previewUrl} alt="invoice preview" className="max-h-[500px] rounded object-contain shadow-sm bg-white" />
                ) : (
                  <iframe title="invoice preview" src={previewUrl} className="h-[500px] w-full rounded shadow-sm bg-white" />
                )}
             </div>
          </div>

          {/* Right Pane: Analysis Context & Results */}
          <div className="flex flex-col gap-4">
            {!mutation.data && !mutation.isPending && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 flex flex-col items-center text-center justify-center min-h-[400px]">
                  <div className="bg-rose-100 p-4 rounded-full text-rose-600 mb-4">
                    <Sparkles size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-rose-900 mb-2">Ready to Analyze</h3>
                  <p className="text-sm text-rose-700 mb-6 max-w-[280px]">
                    Our AI will scan your invoice to verify GST compliance, check HSN rates, and flag hidden errors.
                  </p>
                  <button
                    onClick={() => mutation.mutate({ selectedFile: file, lang: language })}
                    className="rounded-full bg-rose-600 px-8 py-3 font-semibold text-white shadow-md hover:bg-rose-700 transition-all flex items-center gap-2"
                  >
                    Analyze Now
                  </button>
              </div>
            )}

            {mutation.isPending && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-slate-50 rounded-2xl p-12 flex flex-col items-center justify-center border border-slate-200 min-h-[400px]">
                    <Loader2 className="animate-spin text-rose-500 mb-4" size={40} />
                    <p className="font-semibold text-slate-700">Reading Invoice...</p>
                    <p className="text-sm text-slate-500 mt-1">Extracting Line Items and Tax Totals</p>
                </div>
              </div>
            )}

            {mutation.data && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Detected HSN</p>
                    <p className="text-2xl font-black text-slate-800">{mutation.data.data.hsn || "N/A"}</p>
                  </article>

                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">GST Rate</p>
                    <p className="text-2xl font-black text-slate-800">{mutation.data.data.gst_rate || "N/A"}</p>
                  </article>
                </div>

                <article className={`rounded-2xl border p-5 shadow-sm ${mutation.data.data.errors?.length > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {mutation.data.data.errors?.length > 0 ? (
                      <><AlertTriangle className="text-red-500" size={20} /> <p className="font-bold text-red-800 text-lg">Compliance Issues Found</p></>
                    ) : (
                      <><CheckCircle2 className="text-green-600" size={20} /> <p className="font-bold text-green-800 text-lg">No Errors Detected</p></>
                    )}
                  </div>
                  {mutation.data.data.errors?.length > 0 && (
                     <ul className="space-y-2">
                       {mutation.data.data.errors.map((item, idx) => (
                         <li key={idx} className="flex gap-2 items-start text-sm text-red-700 bg-white/60 p-2 rounded border border-red-100">
                           <span className="mt-0.5">•</span> {item}
                         </li>
                       ))}
                     </ul>
                  )}
                </article>

                <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="text-amber-600" size={20} /> <p className="font-bold text-amber-800 text-lg">AI Suggestions</p>
                  </div>
                  <ul className="space-y-2">
                    {mutation.data.data.suggestions?.length > 0 ? (
                      mutation.data.data.suggestions.map((item, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-sm text-amber-800 bg-white/60 p-2 rounded border border-amber-100">
                           <span className="mt-0.5">•</span> {item}
                        </li>
                      ))
                    ) : (
                      <p className="text-sm text-amber-700">No suggestions needed.</p>
                    )}
                  </ul>
                </article>
                
                {mutation.data.status === 'error' && (
                   <p className="text-xs text-red-500 font-medium px-2">* Note: Our agent experienced an error during final validation.</p>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
