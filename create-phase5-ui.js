const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'src', 'app', '(app)');

function mk(...segments) {
  const target = path.join(appDir, ...segments);
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
  return target;
}

// 1. REPORTS PAGE
const reportsPath = mk('reports');
fs.writeFileSync(path.join(reportsPath, 'page.tsx'), `"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { TrendingUp, TrendingDown, PieChart, CreditCard, Landmark, Wrench } from "lucide-react";

export default function Reports() {
  const { data: transactions } = useSWR("/api/transactions?limit=2000", fetcher);
  const { data: cards } = useSWR("/api/cards", fetcher);
  const { data: loans } = useSWR("/api/loans", fetcher);
  const { data: categories } = useSWR("/api/categories", fetcher);
  
  // Need to fetch maintenance properly across all vehicles if data exists? 
  // Let's assume we rely on transactions tagged to 'VEHICLE' Category for broader reporting, 
  // or simple vehicle maintenance aggregate if explicitly fetched. For Phase 5 we summarize 
  // explicitly what is in transactions.

  if (!transactions || !cards || !loans || !categories) {
    return <div className="flex h-screen items-center justify-center -mt-20"><Spinner /></div>;
  }

  // 1. Cash Flow Summary (All time in view, typically you'd filter by month)
  const income = transactions.filter((t: any) => t.transaction_type === "INCOME").reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const expense = transactions.filter((t: any) => t.transaction_type === "EXPENSE").reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const netFlow = income - expense;

  // 2. Category Breakdown
  const expenseByCategory = transactions
    .filter((t: any) => t.transaction_type === "EXPENSE" && t.category_id)
    .reduce((acc: any, t: any) => {
      acc[t.category_id] = (acc[t.category_id] || 0) + Number(t.amount);
      return acc;
    }, {});
    
  const topCategories = Object.entries(expenseByCategory)
    .map(([id, amt]) => ({ id, amount: amt as number }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5); // top 5

  // 3. Card Outstanding
  const creditCards = cards.filter((c: any) => c.type === 'CREDIT');
  const totalOutstandings = creditCards.reduce((acc: number, item: any) => acc + (Number(item.outstanding_balance) || 0), 0);

  // 4. Loans Principal Liability
  const totalLoanLiability = loans.reduce((acc: number, item: any) => acc + (Number(item.total_amount) || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
      
      {/* CASH FLOW */}
      <h3 className="text-xl font-semibold mt-8 mb-4 flex items-center gap-2"><PieChart size={20} className="text-(--primary)"/> Cash Flow Summary</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-0 shadow-md ring-1 ring-(--border)/50 text-center">
          <CardHeader className="pb-2"><CardDescription>Total Income</CardDescription></CardHeader>
          <CardContent><span className="text-2xl font-bold tracking-tight text-emerald-500">{formatCurrency(income)}</span></CardContent>
        </Card>
        <Card className="glass border-0 shadow-md ring-1 ring-(--border)/50 text-center">
          <CardHeader className="pb-2"><CardDescription>Total Expenses</CardDescription></CardHeader>
          <CardContent><span className="text-2xl font-bold tracking-tight text-rose-500">{formatCurrency(expense)}</span></CardContent>
        </Card>
        <Card className="glass border-0 shadow-md ring-1 ring-(--border)/50 text-center col-span-2">
          <CardHeader className="pb-2"><CardDescription>Net Flow</CardDescription></CardHeader>
          <CardContent>
            <span className={\`text-3xl font-bold tracking-tight \${netFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}\`}>
              {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        
        {/* TOP SPENDING */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><TrendingDown size={20} className="text-rose-500"/> Top Categories</h3>
          <Card className="glass border-0 shadow-sm ring-1 ring-(--border)/50">
             <div className="divide-y divide-(--border)/20">
               {topCategories.map((cat, idx) => {
                 const name = categories.find((c: any) => c.id === cat.id)?.name || 'Unknown';
                 const percentage = expense > 0 ? (cat.amount / expense) * 100 : 0;
                 return (
                   <div key={cat.id} className="p-4">
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-semibold">{name}</span>
                       <span className="font-bold">{formatCurrency(cat.amount)}</span>
                     </div>
                     <div className="h-1.5 w-full bg-(--secondary) rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-rose-500" style={{ width: \`\${percentage}%\` }}></div>
                     </div>
                   </div>
                 )
               })}
               {topCategories.length === 0 && <div className="p-8 text-center text-(--muted-foreground)">No expenses found to chart.</div>}
             </div>
          </Card>
        </div>

        {/* LIABILITIES */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><CreditCard size={20} className="text-indigo-500"/> Current Liabilities</h3>
          <Card className="glass border-0 shadow-sm ring-1 ring-(--border)/50 p-6 space-y-6">
             <div>
               <div className="flex justify-between items-center mb-1">
                 <span className="text-sm font-semibold flex items-center gap-2 text-(--muted-foreground)"><CreditCard size={14}/> Card Outstanding</span>
                 <span className="font-bold text-rose-500">{formatCurrency(totalOutstandings)}</span>
               </div>
               <div className="h-2 w-full bg-gradient-to-r from-rose-500/80 to-orange-500/50 rounded-full mt-2"></div>
             </div>
             
             <div>
               <div className="flex justify-between items-center mb-1">
                 <span className="text-sm font-semibold flex items-center gap-2 text-(--muted-foreground)"><Landmark size={14}/> Loan Principal Left</span>
                 <span className="font-bold text-indigo-500">{formatCurrency(totalLoanLiability)}</span>
               </div>
               <div className="h-2 w-full bg-gradient-to-r from-indigo-500/80 to-blue-500/50 rounded-full mt-2"></div>
             </div>
             
             {loans.length === 0 && creditCards.length === 0 && (
               <div className="text-center text-(--muted-foreground) p-4 border border-dashed rounded-xl">No active liabilities found!</div>
             )}
          </Card>
        </div>
      </div>
    </div>
  );
}
`);


// 2. EXPORTS PAGE
const exportsPath = mk('exports');
fs.writeFileSync(path.join(exportsPath, 'page.tsx'), `"use client";
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
  const [exportType, setExportType] = useState("TRANSACTION_HISTORY");

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchWithBody("/api/exports", "POST", { export_type: exportType, format });
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
                <label className="text-sm font-medium">Data Type</label>
                <select value={exportType} onChange={e=>setExportType(e.target.value)} className="flex h-11 w-full rounded-xl border border-(--border) bg-(--card) px-3 outline-none focus-visible:ring-1">
                  <option value="TRANSACTION_HISTORY">Transaction History</option>
                  <option value="BUDGET_REPORT">Budget Report</option>
                  <option value="LOAN_STATEMENT">Loan Statement</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <select value={format} onChange={e=>setFormat(e.target.value)} className="flex h-11 w-full rounded-xl border border-(--border) bg-(--card) px-3 outline-none focus-visible:ring-1">
                  <option value="PDF">PDF Document</option>
                  <option value="EXCEL">Excel Spreadsheet</option>
                  <option value="WORD">Word Document</option>
                </select>
              </div>
              
              <Button type="submit" disabled={submitting} className="w-full h-11 shadow-md gap-2 mt-2">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                {submitting ? "Processing..." : "Generate File"}
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
                       {getFormatIcon(exp.format)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{exp.export_type.replace(/_/g, ' ')}</h4>
                      <p className="text-xs text-(--muted-foreground)">{new Date(exp.created_at).toLocaleString()}</p>
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
              {exports.length === 0 && <div className="p-8 text-center border-dashed border rounded-xl text-(--muted-foreground)">No exports generated yet.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`);


// 3. WHATSAPP RECIPIENTS PAGE
const waPath = mk('settings', 'whatsapp');
fs.writeFileSync(path.join(waPath, 'page.tsx'), `"use client";
import React, { useState } from 'react';
import useSWR from "swr";
import { fetcher, fetchWithBody } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Trash2, Plus, Info } from "lucide-react";

export default function WhatsAppSettings() {
  const { data: recipients, mutate } = useSWR("/api/whatsapp-recipients", fetcher);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setSubmitting(true);
    try {
      await fetchWithBody("/api/whatsapp-recipients", "POST", { name, phone_number: phone, is_active: true });
      setName(""); setPhone("");
      mutate();
    } catch(err: any) { alert(err.message); }
    finally { setSubmitting(false); }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this WhatsApp recipient?")) return;
    try {
      await fetchWithBody(\`/api/whatsapp-recipients/\${id}\`, "DELETE", {});
      mutate();
    } catch(err: any) { alert(err.message); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3">
        <div className="bg-[#25D366] p-2 rounded-xl text-white shadow-md shadow-[#25D366]/20">
           <MessageCircle size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Reminders</h1>
          <p className="text-(--muted-foreground)">Manage authorized recipients for scheduled financial digests.</p>
        </div>
      </div>

      <div className="bg-amber-500/10 text-amber-700 dark:text-amber-400 p-4 rounded-xl text-sm flex gap-3 ring-1 ring-amber-500/30">
        <Info size={20} className="shrink-0" />
        <p><strong>Heads Up:</strong> This UI strictly configures the recipients database. The actual automated dispatch of WhatsApp messages requires a Node.js backend cron worker (e.g. Twilio API) which operates external to this frontend PWA securely.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6">
        
        {/* ADD */}
        <Card className="glass shadow-md border-0 ring-1 ring-(--border)/50 p-6">
          <h3 className="font-semibold mb-4">Register New Device</h3>
          <form onSubmit={handleAdd} className="flex gap-3 items-end">
             <div className="space-y-1 flex-1">
                <label className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">Owner Name</label>
                <Input placeholder="John Doe" value={name} onChange={e=>setName(e.target.value)} className="bg-transparent" />
             </div>
             <div className="space-y-1 flex-1">
                <label className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">Phone Number</label>
                <Input placeholder="+971501234567" value={phone} onChange={e=>setPhone(e.target.value)} className="bg-transparent" />
             </div>
             <Button type="submit" disabled={submitting} className="mb-px bg-[#25D366] text-white hover:bg-[#1DA851] shadow-md shadow-[#25D366]/20">
               {submitting ? <Spinner className="w-4 h-4 text-white"/> : <Plus size={18} />}
             </Button>
          </form>
        </Card>

        {/* LIST */}
        <div className="space-y-3">
          <h3 className="font-semibold px-1">Registered Numbers</h3>
          {!recipients ? <div className="flex justify-center p-8"><Spinner /></div> : (
            <div className="space-y-3">
              {recipients.map((r: any) => (
                <Card key={r.id} className="p-4 flex items-center justify-between shadow-sm bg-(--card) ring-1 ring-(--border)/30 border-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-base">{r.name}</span>
                    <span className="text-sm text-(--muted-foreground) font-mono">{r.phone_number}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="text-rose-500 hover:bg-rose-500/10">
                     <Trash2 size={18} />
                  </Button>
                </Card>
              ))}
              {recipients.length === 0 && <div className="p-8 text-center text-(--muted-foreground) border-dashed border border-(--border) rounded-2xl">No WhatsApp numbers configured.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
`);

console.log("Phase 5 Files Scaffolding Complete.");
