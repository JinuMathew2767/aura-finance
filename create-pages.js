const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'src', 'app', '(app)');

function mk(...segments) {
  const target = path.join(appDir, ...segments);
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
  return target;
}

// 1. Dashboard Page
const dashboardPath = mk();
fs.writeFileSync(path.join(dashboardPath, 'page.tsx'), `"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Wallet, CreditCard, PlusCircle } from "lucide-react";

export default function Dashboard() {
  const { data: accounts, error: aErr } = useSWR("/api/accounts", fetcher);
  const { data: cards, error: cErr } = useSWR("/api/cards", fetcher);
  const { data: transactions, error: tErr } = useSWR("/api/transactions?limit=5", fetcher);

  const loading = !accounts || !cards || !transactions;

  if (loading && !aErr) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  const totalBalances = accounts?.reduce((acc: number, item: any) => acc + (Number(item.current_balance) || 0), 0) || 0;
  const totalOutstandings = cards?.filter((c: any) => c.type === 'CREDIT').reduce((acc: number, item: any) => acc + (Number(item.outstanding_balance) || 0), 0) || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-(--muted-foreground)">Your household snapshot</p>
        </div>
        <Link href="/transactions/new">
          <Button className="rounded-full shadow-lg shadow-blue-500/20 gap-2"><PlusCircle size={18} /> Add</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Liquidity */}
        <Card className="glass border-0 shadow-lg bg-gradient-to-br from-indigo-500/10 to-blue-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 font-medium text-emerald-600"><Wallet size={16} /> Total Balance</CardDescription>
            <CardTitle className="text-4xl font-bold">{formatCurrency(totalBalances)}</CardTitle>
          </CardHeader>
        </Card>

        {/* Total Debt */}
        <Card className="glass border-0 shadow-lg bg-gradient-to-br from-rose-500/10 to-orange-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 font-medium text-rose-600"><CreditCard size={16} /> Outstanding Credit</CardDescription>
            <CardTitle className="text-4xl font-bold text-rose-600/90">{formatCurrency(totalOutstandings)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Link href="/transactions" className="text-sm font-medium text-(--primary) hover:underline">View All</Link>
        </div>
        
        <Card className="overflow-hidden border-(--border)/50 shadow-md">
          <div className="divide-y divide-(--border)/50">
            {transactions?.slice(0, 5).map((tx: any) => (
              <Link href={\`/transactions/\${tx.id}\`} key={tx.id} className="flex items-center justify-between p-4 hover:bg-(--muted)/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={\`p-3 rounded-full flex-shrink-0 \${tx.transaction_type === "INCOME" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}\`}>
                    {tx.transaction_type === "INCOME" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-(--foreground)">{tx.title}</h4>
                    <p className="text-xs text-(--muted-foreground)">{formatDate(tx.transaction_date)} &bull; {tx.payment_method}</p>
                  </div>
                </div>
                <div className={\`font-semibold \${tx.transaction_type === "INCOME" ? "text-emerald-500" : "text-(--foreground)"}\`}>
                  {tx.transaction_type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                </div>
              </Link>
            ))}
            {transactions?.length === 0 && <div className="p-8 text-center text-(--muted-foreground)">No recent transactions.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
`);

// 2. Transactions List
const txPath = mk('transactions');
fs.writeFileSync(path.join(txPath, 'page.tsx'), `"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, PlusCircle } from "lucide-react";

export default function TransactionsList() {
  const { data: transactions, error } = useSWR("/api/transactions?limit=50", fetcher);

  if (error) return <div className="p-8 text-rose-500">Failed to load transactions.</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        </div>
        <Link href="/transactions/new" className="bg-(--primary) text-white h-10 px-4 rounded-xl font-medium flex items-center gap-2 shadow-sm hover:opacity-90">
          <PlusCircle size={18} /> Add
        </Link>
      </div>

      {!transactions ? (
        <div className="flex justify-center p-12"><Spinner /></div>
      ) : (
        <Card className="overflow-hidden shadow-sm">
          <div className="divide-y divide-(--border)/50">
            {transactions.map((tx: any) => (
              <Link href={\`/transactions/\${tx.id}\`} key={tx.id} className="flex items-center justify-between p-4 hover:bg-(--muted)/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={\`p-3 rounded-full flex-shrink-0 \${tx.transaction_type === "INCOME" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}\`}>
                    {tx.transaction_type === "INCOME" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-(--foreground)">{tx.title}</h4>
                    <p className="text-xs text-(--muted-foreground)">{formatDate(tx.transaction_date)} &bull; {tx.payment_method || 'Unknown'}</p>
                  </div>
                </div>
                <div className={\`font-semibold \${tx.transaction_type === "INCOME" ? "text-emerald-500" : "text-(--foreground)"}\`}>
                  {tx.transaction_type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
`);

// 3. Transactions New (Form)
const txNewPath = mk('transactions', 'new');
fs.writeFileSync(path.join(txNewPath, 'page.tsx'), `"use client";
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTransactionSchema } from "@/lib/validators";
import { z } from "zod";
import { fetchWithBody, fetcher } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import useSWR from 'swr';

type FormData = z.infer<typeof CreateTransactionSchema>;

export default function NewTransaction() {
  const router = useRouter();
  const { data: accounts } = useSWR("/api/accounts", fetcher);
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      transaction_date: new Date().toISOString(),
      owner_type: "SHARED",
      transaction_type: "EXPENSE",
      payment_method: "BANK",
      amount: 0,
      title: ""
    }
  });

  const watchType = watch("transaction_type");
  
  const onSubmit = async (data: FormData) => {
    try {
      await fetchWithBody("/api/transactions", "POST", data);
      router.push("/transactions");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
       <h1 className="text-3xl font-bold tracking-tight">Add Transaction</h1>
       
       <Card className="border-(--border) shadow-md overflow-hidden">
         <CardContent className="p-6">
           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
             
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Type</Label>
                 <select {...register("transaction_type")} className="flex h-11 w-full rounded-xl border border-(--border) bg-transparent px-3">
                   <option value="EXPENSE">Expense</option>
                   <option value="INCOME">Income</option>
                   <option value="TRANSFER">Transfer</option>
                   <option value="CC_PAYMENT">CC Payment</option>
                 </select>
               </div>
               
               <div className="space-y-2">
                 <Label>Payment Method</Label>
                 <select {...register("payment_method")} className="flex h-11 w-full rounded-xl border border-(--border) bg-transparent px-3">
                   {watchType !== "CC_PAYMENT" && (
                     <>
                      <option value="BANK">Bank</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="CASH">Cash</option>
                     </>
                   )}
                   {watchType === "CC_PAYMENT" && <option value="">None (NULL)</option>}
                 </select>
               </div>
             </div>

             <div className="space-y-2">
               <Label>Title</Label>
               <Input {...register("title")} placeholder="Groceries, Rent, Salary..." />
               {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
             </div>
             
             <div className="space-y-2">
               <Label>Amount (AED)</Label>
               <Input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
               {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
             </div>
             
             <div className="space-y-2">
               <Label>Account</Label>
               <select {...register("account_id")} className="flex h-11 w-full rounded-xl border border-(--border) bg-transparent px-3">
                 <option value="">Select Account...</option>
                 {accounts?.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.owner_type})</option>)}
               </select>
             </div>

             <div className="space-y-2">
               <Label>Date</Label>
               <Input type="datetime-local" {...register("transaction_date")} />
             </div>
             
             <Button type="submit" disabled={isSubmitting} className="w-full mt-4 h-12 text-base">
               {isSubmitting ? "Saving..." : "Save Transaction"}
             </Button>
           </form>
         </CardContent>
       </Card>
    </div>
  );
}
`);

// 4. Accounts Page
const accountsPath = mk('accounts');
fs.writeFileSync(path.join(accountsPath, 'page.tsx'), `"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Wallet } from "lucide-react";

export default function Accounts() {
  const { data, error } = useSWR("/api/accounts", fetcher);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
      {!data ? <div className="flex justify-center p-12"><Spinner /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((acc: any) => (
            <Card key={acc.id} className="glass shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                 <div className="flexitems-center gap-2 mb-2 text-(--primary)">
                    <Wallet size={20} />
                 </div>
                 <CardTitle className="text-xl">{acc.name}</CardTitle>
                 <CardDescription>{acc.type} &bull; {acc.owner_type}</CardDescription>
                 <div className="mt-4 font-bold text-2xl tracking-tight text-(--foreground)">
                   {formatCurrency(acc.current_balance)}
                 </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// 5. Cards Page
const cardsPath = mk('cards');
fs.writeFileSync(path.join(cardsPath, 'page.tsx'), `"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CreditCard } from "lucide-react";

export default function Cards() {
  const { data, error } = useSWR("/api/cards", fetcher);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Cards</h1>
      {!data ? <div className="flex justify-center p-12"><Spinner /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((card: any) => (
            <Card key={card.id} className="overflow-hidden shadow-md">
              <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardHeader>
                 <div className="flex items-center justify-between mb-4">
                    <CreditCard size={24} className="text-(--primary)" />
                    <span className="text-xs font-semibold px-2 py-1 bg-(--primary)/10 text-(--primary) rounded-full">{card.type}</span>
                 </div>
                 <CardTitle className="text-xl leading-tight">{card.name}</CardTitle>
                 <CardDescription>{card.owner_type}</CardDescription>
                 
                 {card.type === 'CREDIT' ? (
                   <div className="mt-6">
                     <p className="text-sm text-(--muted-foreground) mb-1">Outstanding</p>
                     <div className="font-bold text-2xl text-rose-600">{formatCurrency(card.outstanding_balance)}</div>
                     <p className="text-xs text-(--muted-foreground) mt-2">Limit: {formatCurrency(card.credit_limit)}</p>
                   </div>
                 ) : (
                   <div className="mt-6 text-sm text-(--muted-foreground)">
                      Linked Account binding active.
                   </div>
                 )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// 6. Tx Detail Page
const txDetailPath = mk('transactions', '[id]');
fs.writeFileSync(path.join(txDetailPath, 'page.tsx'), `"use client";
import { use } from "react";
import useSWR from "swr";
import { fetcher, fetchWithBody } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TransactionDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { data: tx, mutate: mutateTx } = useSWR(\`/api/transactions/\${id}\`, fetcher);
  const { data: comments, mutate: mutateComments } = useSWR(\`/api/transactions/\${id}/comments\`, fetcher);
  
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await fetchWithBody(\`/api/transactions/\${id}/comments\`, "POST", { comment: commentText });
      setCommentText("");
      mutateComments();
    } catch (err: any) {
      alert("Failed to post comment: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!tx) return <div className="p-12 flex justify-center"><Spinner /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/transactions" className="inline-flex items-center text-sm font-medium text-(--primary) hover:underline mb-2">
         <ArrowLeft size={16} className="mr-1" /> Back
      </Link>
      
      <Card className="shadow-lg border-0 glass overflow-hidden">
        <div className={\`h-3 w-full \${tx.transaction_type === "INCOME" ? "bg-emerald-500" : "bg-rose-500"}\`}></div>
        <CardHeader>
           <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold mb-1">{tx.title}</CardTitle>
                <CardDescription className="text-base">{formatDate(tx.transaction_date)} &bull; {tx.payment_method || 'Unknown'}</CardDescription>
              </div>
              <div className={\`text-3xl font-bold tracking-tight \${tx.transaction_type === "INCOME" ? "text-emerald-500" : "text-(--foreground)"}\`}>
                 {tx.transaction_type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
              </div>
           </div>
        </CardHeader>
        <CardContent className="bg-(--muted)/30 rounded-xl m-6 mt-0 p-4 border border-(--border)/50">
           <div className="grid grid-cols-2 gap-y-4 text-sm">
             <div><span className="text-(--muted-foreground) block">Type</span> <span className="font-medium">{tx.transaction_type}</span></div>
             <div><span className="text-(--muted-foreground) block">Owner</span> <span className="font-medium">{tx.owner_type}</span></div>
             {tx.description && <div className="col-span-2"><span className="text-(--muted-foreground) block">Notes</span> <span className="font-medium">{tx.description}</span></div>}
           </div>
        </CardContent>
      </Card>

      <div className="pt-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><MessageSquare size={18} /> Remarks & Info</h3>
        
        <div className="space-y-4">
          {comments?.map((c: any) => (
             <div key={c.id} className="bg-(--card) border border-(--border) p-4 rounded-2xl shadow-sm text-sm">
                <div className="font-medium text-(--foreground) mb-1">{c.comment}</div>
                <div className="text-xs text-(--muted-foreground)">{formatDate(c.created_at)}</div>
             </div>
          ))}
          {comments?.length === 0 && <p className="text-(--muted-foreground) text-sm italic">No comments yet</p>}
        </div>

        <form onSubmit={handlePostComment} className="mt-6 flex items-center gap-3">
           <Input 
             value={commentText} 
             onChange={(e) => setCommentText(e.target.value)} 
             placeholder="Add an update or note..." 
             className="flex-1 bg-(--card)"
           />
           <Button type="submit" disabled={submitting || !commentText.trim()}>Post</Button>
        </form>
      </div>
    </div>
  );
}
`);

console.log("Pages Scaffolding Complete.");
