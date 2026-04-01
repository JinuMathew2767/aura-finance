"use client";
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
              <Link href={`/transactions/${tx.id}`} key={tx.id} className="flex items-center justify-between p-4 hover:bg-(--muted)/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full flex-shrink-0 ${tx.transaction_type === "INCOME" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                    {tx.transaction_type === "INCOME" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-(--foreground)">{tx.title}</h4>
                    <p className="text-xs text-(--muted-foreground)">{formatDate(tx.transaction_date)} &bull; {tx.payment_method || 'Unknown'}</p>
                  </div>
                </div>
                <div className={`font-semibold ${tx.transaction_type === "INCOME" ? "text-emerald-500" : "text-(--foreground)"}`}>
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
