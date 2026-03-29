"use client";

import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { analyzeInvoice, LanguageCode } from "@/lib/api";
import { UploadCloud, FileText, CheckCircle2, CheckCircle, AlertTriangle, FileSearch, Sparkles, Loader2, Info, ShieldAlert, Search, ArrowRight, XCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function InvoicePage() {
  const [file, setFile] = useState<File | null>(null);

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
                    onClick={() => mutation.mutate({ selectedFile: file, lang: "en" })}
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
                
                {/* 1. The Bottom Line (Financial Summary) */}
                <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                  <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                    <CheckCircle2 size={18} /> Financial Summary
                  </h3>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center bg-white/60 p-3 rounded-lg border border-emerald-100/50">
                      <span className="text-emerald-900 font-medium">Total Invoice Value</span>
                      <span className="text-lg font-bold text-emerald-900">₹{mutation.data.data.total_invoice_value?.toLocaleString() || "0"}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-white/60 p-3 rounded-lg border border-emerald-100/50">
                      <span className="text-emerald-900 font-medium">Total Tax Amount</span>
                      <span className="text-lg font-bold text-emerald-900">₹{mutation.data.data.total_tax_amount?.toLocaleString() || "0"}</span>
                    </div>

                    <div className="flex justify-between items-center bg-emerald-100 p-4 rounded-xl border border-emerald-300 shadow-inner">
                      <span className="text-emerald-950 font-bold">Eligible ITC</span>
                      <div className="text-right">
                        <p className="text-2xl font-black text-emerald-700">₹{mutation.data.data.eligible_itc?.toLocaleString() || "0"}</p>
                        <p className="text-xs text-emerald-800 font-bold mt-0.5">Available to Claim</p>
                      </div>
                    </div>
                  </div>
                </article>

                {/* 2. Compliance Audit Checklist */}
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-slate-500" /> Compliance Audit
                  </h3>
                  
                  <ul className="space-y-3">
                    <li className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 border border-slate-100">
                      {mutation.data.data.math_validation_status === 'valid' ? <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} /> : <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />}
                      <div>
                        <p className={`text-sm font-bold ${mutation.data.data.math_validation_status === 'valid' ? 'text-slate-800' : 'text-red-700'}`}>Math Validation</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Line item totals and tax calculations match.</p>
                      </div>
                    </li>

                    <li className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 border border-slate-100">
                       {mutation.data.data.supply_routing_status === 'valid' ? <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} /> : <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />}
                      <div>
                        <p className={`text-sm font-bold ${mutation.data.data.supply_routing_status === 'valid' ? 'text-slate-800' : 'text-red-700'}`}>Supply Routing</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          {mutation.data.data.buyer_state_code === mutation.data.data.supplier_state_code && mutation.data.data.buyer_state_code !== 'unknown' 
                            ? `Intra-state Supply Verified (State Code ${mutation.data.data.supplier_state_code} to ${mutation.data.data.buyer_state_code}). CGST & SGST applied.` 
                            : mutation.data.data.buyer_state_code !== mutation.data.data.supplier_state_code && mutation.data.data.buyer_state_code !== 'unknown' 
                            ? `Inter-state Supply Verified (State Code ${mutation.data.data.supplier_state_code} to ${mutation.data.data.buyer_state_code}). IGST applied.`
                            : "Supply routing validation based on State Codes."}
                        </p>
                      </div>
                    </li>

                    <li className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 border border-slate-100">
                      {mutation.data.data.gstin_format_status === 'valid' ? <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} /> : <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />}
                      <div>
                        <p className={`text-sm font-bold ${mutation.data.data.gstin_format_status === 'valid' ? 'text-slate-800' : 'text-red-700'}`}>GSTIN Format</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Supplier & Buyer GSTIN formats are valid.</p>
                      </div>
                    </li>
                  </ul>
                  
                  {/* Additional Actionable Alerts if any */}
                  {mutation.data.data.actionable_alerts?.length > 0 && (
                     <div className="mt-4 pt-4 border-t border-slate-100">
                       <ul className="space-y-2">
                         {mutation.data.data.actionable_alerts.map((item: string, idx: number) => (
                           <li key={idx} className="flex gap-2 items-start text-xs text-red-700 bg-red-50 p-2 rounded-lg border border-red-100 font-medium">
                             <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {item}
                           </li>
                         ))}
                       </ul>
                     </div>
                  )}
                </article>

                {/* 3. Product & Tax Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><FileSearch size={14} /> Detected HSN</p>
                    <p className="text-lg font-black text-slate-800 break-all" title={mutation.data.data.extracted_hsn?.join(", ")}>{mutation.data.data.extracted_hsn?.join(", ") || "N/A"}</p>
                  </article>

                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><FileText size={14} /> Tax Slab</p>
                    <p className="text-lg font-black text-slate-800">{mutation.data.data.effective_tax_slab || "N/A"}</p>
                  </article>
                </div>

                {/* 4. Quick Actions */}
                <div className="flex gap-3 mt-2">
                   {mutation.data.data.quick_actions?.length > 0 && mutation.data.data.quick_actions.map((action: any, idx: number) => (
                     <a 
                       key={idx}
                       href={action.url} 
                       target="_blank" 
                       rel="noreferrer" 
                       className="flex-1 flex justify-center items-center gap-2 text-sm font-bold text-slate-700 bg-white border-2 border-slate-200 px-4 py-3 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
                     >
                       <Search size={16} /> Verify GSTIN
                     </a>
                   ))}
                   
                   <button 
                     onClick={() => window.print()}
                     className="flex-1 flex justify-center items-center gap-2 text-sm font-bold text-white bg-slate-900 border-2 border-slate-900 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                   >
                     <Download size={16} /> Export Report
                   </button>
                </div>
                
                {mutation.data.status === 'error' && (
                   <p className="text-xs text-red-500 font-medium px-2 text-center mt-2">* Note: Our agent experienced an error during final validation.</p>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
