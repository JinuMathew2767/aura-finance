"use client";
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
              <Link href={`/transactions/${tx.id}`} key={tx.id} className="flex items-center justify-between p-4 hover:bg-(--muted)/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full flex-shrink-0 ${tx.transaction_type === "INCOME" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                    {tx.transaction_type === "INCOME" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-(--foreground)">{tx.title}</h4>
                    <p className="text-xs text-(--muted-foreground)">{formatDate(tx.transaction_date)} &bull; {tx.payment_method}</p>
                  </div>
                </div>
                <div className={`font-semibold ${tx.transaction_type === "INCOME" ? "text-emerald-500" : "text-(--foreground)"}`}>
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
