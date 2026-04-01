"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, PlusCircle, Search } from "lucide-react";

export default function TransactionsList() {
  const { data: transactions, error } = useSWR("/api/transactions?limit=50", fetcher);

  if (error) return (
    <div className="p-10 text-center animate-in">
      <div className="h-12 w-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
        <ArrowDownRight size={20} style={{ color: 'var(--destructive)' }} />
      </div>
      <p className="text-sm font-semibold" style={{ color: 'var(--destructive)' }}>Failed to load transactions.</p>
      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Check your database connection.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Transactions</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {transactions?.length || 0} entries
          </p>
        </div>
        <Link href="/transactions/new">
          <Button className="rounded-full gap-2 text-sm">
            <PlusCircle size={16} /> Add
          </Button>
        </Link>
      </div>

      {!transactions ? (
        <div className="flex justify-center p-16"><Spinner /></div>
      ) : transactions.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="h-14 w-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <Search size={22} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>No transactions yet</p>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Start tracking your finances by adding your first entry.
          </p>
          <Link href="/transactions/new">
            <Button className="rounded-full gap-2 text-sm">
              <PlusCircle size={14} /> Add Transaction
            </Button>
          </Link>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {transactions.map((tx: any, i: number) => (
              <Link
                href={`/transactions/${tx.id}`}
                key={tx.id}
                className="flex items-center justify-between p-4 transition-all duration-200 group hover:bg-(--muted)"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                    style={{
                      background: tx.transaction_type === "INCOME" ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                      color: tx.transaction_type === "INCOME" ? 'var(--success)' : 'var(--destructive)',
                    }}
                  >
                    {tx.transaction_type === "INCOME" ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{tx.title}</h4>
                    <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                      {formatDate(tx.transaction_date)} · {tx.payment_method || 'N/A'}
                    </p>
                  </div>
                </div>
                <div
                  className="font-bold text-sm"
                  style={{ color: tx.transaction_type === "INCOME" ? 'var(--success)' : 'var(--foreground)' }}
                >
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
