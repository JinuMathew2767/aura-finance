"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Wallet, TrendingUp } from "lucide-react";

export default function Accounts() {
  const { data, error } = useSWR("/api/accounts", fetcher);

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Accounts</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Manage your bank accounts and wallets
        </p>
      </div>

      {!data ? (
        <div className="flex justify-center p-16"><Spinner /></div>
      ) : data.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="h-14 w-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <Wallet size={22} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>No accounts configured</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Connect your database to see your bank accounts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {data.map((account: any) => (
            <div key={account.id} className="card-glow-blue rounded-2xl p-6 group">
              <div className="flex items-center justify-between mb-5">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(var(--primary-rgb), 0.12)' }}
                >
                  <Wallet size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}
                >
                  {account.owner_type}
                </span>
              </div>
              <h3 className="font-bold text-base mb-1" style={{ color: 'var(--foreground)' }}>{account.name}</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>{account.type}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>Balance</p>
                  <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(account.current_balance)}
                  </p>
                </div>
                <TrendingUp size={16} style={{ color: 'var(--success)' }} className="opacity-50" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
