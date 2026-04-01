"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Wallet, CreditCard, PlusCircle, TrendingUp, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { data: accounts, error: aErr } = useSWR("/api/accounts", fetcher);
  const { data: cards, error: cErr } = useSWR("/api/cards", fetcher);
  const { data: transactions, error: tErr } = useSWR("/api/transactions?limit=5", fetcher);

  const loading = !accounts || !cards || !transactions;

  if (loading && !aErr) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;

  const totalOutstandings = cards?.filter((c: any) => c.type === 'CREDIT').reduce((acc: number, item: any) => acc + (Number(item.outstanding_balance) || 0), 0) || 0;

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Overview</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Your household snapshot</p>
        </div>
        <Link href="/transactions/new">
          <Button className="rounded-full gap-2 text-sm">
            <PlusCircle size={16} /> Add
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 stagger-children">
        {/* Outstanding Credit */}
        <div className="card-glow-red rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.12)' }}
              >
                <CreditCard size={18} style={{ color: 'var(--destructive)' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--destructive)' }}>Outstanding Credit</span>
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight" style={{ color: 'var(--destructive)' }}>
            {formatCurrency(totalOutstandings)}
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
            {cards?.filter((c: any) => c.type === 'CREDIT')?.length || 0} credit cards
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {[
          { label: "Transactions", href: "/transactions", icon: ArrowUpRight, color: "var(--primary)" },
          { label: "Accounts", href: "/accounts", icon: Wallet, color: "var(--success)" },
          { label: "Reports", href: "/reports", icon: TrendingUp, color: "var(--accent-purple)" },
          { label: "Budgets", href: "/budgets", icon: CreditCard, color: "var(--accent-amber)" },
        ].map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 text-center group cursor-pointer">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${action.color}15` }}
              >
                <action.icon size={18} style={{ color: action.color }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{action.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Recent Transactions</h2>
          <Link href="/transactions" className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80" style={{ color: 'var(--primary)' }}>
            View All <ArrowRight size={12} />
          </Link>
        </div>

        <Card className="overflow-hidden">
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {transactions?.slice(0, 5).map((tx: any, i: number) => (
              <Link
                href={`/transactions/${tx.id}`}
                key={tx.id}
                className="flex items-center justify-between p-4 hover:bg-(--muted) transition-all duration-200 group"
                style={{ animationDelay: `${i * 60}ms` }}
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
                      {formatDate(tx.transaction_date)} · {tx.payment_method}
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
            {transactions?.length === 0 && (
              <div className="p-10 text-center">
                <div
                  className="h-12 w-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: 'var(--muted)' }}
                >
                  <ArrowUpRight size={20} style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>No recent transactions.</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  Start by adding your first expense.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
