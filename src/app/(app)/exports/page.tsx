"use client";
import React, { useState } from 'react';
import useSWR from "swr";
import { fetcher, fetchWithBody } from "@/lib/api-client";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, FileIcon, Loader2 } from "lucide-react";

export default function Exports() {
  const { data: exports, mutate } = useSWR("/api/exports", fetcher);
  const [submitting, setSubmitting] = useState(false);
  const [format, setFormat] = useState("PDF");

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Matches CreateExportSchema dynamically expecting { type: "PDF"|"EXCEL"|"WORD" }
      await fetchWithBody("/api/exports", "POST", { type: format });
      mutate();
    } catch(err: any) { alert(err.message); }
    finally { setSubmitting(false); }
  }

  const getFormatIcon = (fmt: string) => {
    switch(fmt) {
      case "PDF": return <FileText size={18} className="text-rose-500" />;
      case "EXCEL": return <FileSpreadsheet size={18} className="text-emerald-500" />;
      case "WORD": return <FileIcon size={18} className="text-blue-500" />;
      default: return <Download size={18} />;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Data Export Engine</h1>
      <p className="text-(--muted-foreground)">Generate securely downloadable statements and tax-ready spreadsheets.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        
        {/* TRIGGER FORM */}
        <Card className="glass shadow-lg border-0 ring-1 ring-(--border)/50 md:col-span-1">
          <CardHeader>
            <CardTitle>New Export</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExport} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format Structure</label>
                <select value={format} onChange={e=>setFormat(e.target.value)} className="flex h-11 w-full rounded-xl border border-(--border) bg-(--card) px-3 outline-none focus-visible:ring-1">
                  <option value="PDF">PDF Document</option>
                  <option value="EXCEL">Excel Spreadsheet</option>
                  <option value="WORD">Word Document</option>
                </select>
                <p className="text-xs text-(--muted-foreground) mt-1">Schedules a job extracting your core ledger parameters structurally native to the database constraints.</p>
              </div>
              
              <Button type="submit" disabled={submitting} className="w-full h-11 shadow-md gap-2 mt-2">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                {submitting ? "Processing..." : "Schedule Generation"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* LOGS */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-semibold text-lg">Export Artifacts History</h3>
          {!exports ? <div className="flex justify-center p-8"><Spinner /></div> : (
            <div className="space-y-3">
              {exports.map((exp: any) => (
                <Card key={exp.id} className="p-4 flex items-center justify-between hover:bg-(--muted)/30 transition-colors shadow-sm ring-1 ring-(--border)/30 border-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-(--background) p-2 rounded-lg border border-(--border)/50">
                       {getFormatIcon(exp.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Full Transaction Ledger</h4>
                      <p className="text-xs text-(--muted-foreground)">{new Date(exp.requested_at || exp.created_at).toLocaleString()} &bull; {exp.type}</p>
                    </div>
                  </div>
                  <div>
                    {exp.status === 'COMPLETED' ? (
                      <Button variant="outline" size="sm" className="h-8 gap-2 text-emerald-600 bg-emerald-500/10 border-0 shadow-none hover:bg-emerald-500/20">
                        <Download size={14}/> Ready
                      </Button>
                    ) : (
                      <span className="text-xs font-semibold px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full inline-flex items-center gap-1">
                         <Loader2 size={10} className="animate-spin"/> Pending
                      </span>
                    )}
                  </div>
                </Card>
              ))}
              {exports.length === 0 && <div className="p-8 text-center border-dashed border border-(--border) rounded-xl text-(--muted-foreground)">No exports scheduled yet.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
