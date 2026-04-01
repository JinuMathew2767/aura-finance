"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { CreditCard } from "lucide-react";

export default function Cards() {
  const { data, error } = useSWR("/api/cards", fetcher);

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Cards</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Your debit and credit cards
        </p>
      </div>

      {!data ? (
        <div className="flex justify-center p-16"><Spinner /></div>
      ) : data.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="h-14 w-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <CreditCard size={22} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>No cards found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Connect your database to see your cards here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {data.map((card: any) => (
            <div key={card.id} className="rounded-2xl overflow-hidden group">
              {/* Top gradient strip */}
              <div
                className="h-1.5 w-full"
                style={{
                  background: card.type === 'CREDIT'
                    ? 'linear-gradient(90deg, var(--destructive), var(--accent-amber))'
                    : 'linear-gradient(90deg, var(--primary), var(--accent-purple))'
                }}
              />
              <div className="glass-card rounded-b-2xl rounded-t-none border-t-0 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(var(--primary-rgb), 0.12)' }}
                  >
                    <CreditCard size={18} style={{ color: 'var(--primary)' }} />
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      background: card.type === 'CREDIT' ? 'rgba(239,68,68,0.1)' : 'rgba(var(--primary-rgb),0.1)',
                      color: card.type === 'CREDIT' ? 'var(--destructive)' : 'var(--primary)'
                    }}
                  >
                    {card.type}
                  </span>
                </div>

                <h3 className="font-bold text-base mb-0.5" style={{ color: 'var(--foreground)' }}>{card.name}</h3>
                <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>{card.owner_type}</p>

                {card.type === 'CREDIT' ? (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>Outstanding</p>
                    <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--destructive)' }}>
                      {formatCurrency(card.outstanding_balance)}
                    </p>
                    <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                      Limit: {formatCurrency(card.credit_limit)}
                    </p>
                  </div>
                ) : (
                  <div className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Linked to account
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
