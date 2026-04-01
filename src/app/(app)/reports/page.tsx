"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { TrendingDown, PieChart, CreditCard, Landmark } from "lucide-react";

export default function Reports() {
  const { data: transactions } = useSWR("/api/transactions?limit=2000", fetcher);
  const { data: cards } = useSWR("/api/cards", fetcher);
  const { data: loans } = useSWR("/api/loans", fetcher);
  const { data: categories } = useSWR("/api/categories", fetcher);

  // Maintenance tracking explicitly deferred from Reports scope for Phase 5.

  if (!transactions || !cards || !loans || !categories) {
    return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  }

  const income = transactions.filter((t: any) => t.transaction_type === "INCOME").reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const expense = transactions.filter((t: any) => t.transaction_type === "EXPENSE").reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const netFlow = income - expense;

  const expenseByCategory = transactions
    .filter((t: any) => t.transaction_type === "EXPENSE" && t.category_id)
    .reduce((acc: any, t: any) => {
      acc[t.category_id] = (acc[t.category_id] || 0) + Number(t.amount);
      return acc;
    }, {});

  const topCategories = Object.entries(expenseByCategory)
    .map(([id, amt]) => ({ id, amount: amt as number }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const creditCards = cards.filter((c: any) => c.type === 'CREDIT');
  const totalOutstandings = creditCards.reduce((acc: number, item: any) => acc + (Number(item.outstanding_balance) || 0), 0);
  const totalLoanLiability = loans.reduce((acc: number, item: any) => acc + (Number(item.total_amount) || 0), 0);

  return (
    <div className="space-y-8 animate-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Financial Reports</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Comprehensive overview of your finances
        </p>
      </div>

      {/* Cash Flow Summary */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <PieChart size={18} style={{ color: 'var(--primary)' }} />
          <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Cash Flow Summary</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
          <div className="card-glow-green rounded-2xl p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Total Income</p>
            <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--success)' }}>{formatCurrency(income)}</p>
          </div>
          <div className="card-glow-red rounded-2xl p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Total Expenses</p>
            <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--destructive)' }}>{formatCurrency(expense)}</p>
          </div>
          <div className="card-glow-blue rounded-2xl p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Net Flow</p>
            <p
              className="text-2xl font-bold tracking-tight"
              style={{ color: netFlow >= 0 ? 'var(--success)' : 'var(--destructive)' }}
            >
              {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Spending Categories */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={18} style={{ color: 'var(--destructive)' }} />
            <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Top Categories</h3>
          </div>
          <Card className="overflow-hidden">
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {topCategories.map((cat) => {
                const name = categories.find((c: any) => c.id === cat.id)?.name || 'Unknown';
                const percentage = expense > 0 ? (cat.amount / expense) * 100 : 0;
                return (
                  <div key={cat.id} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{name}</span>
                      <span className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          background: 'linear-gradient(90deg, var(--destructive), var(--accent-amber))'
                        }}
                      />
                    </div>
                    <p className="text-[10px] font-medium mt-1" style={{ color: 'var(--muted-foreground)' }}>{percentage.toFixed(1)}% of total</p>
                  </div>
                );
              })}
              {topCategories.length === 0 && (
                <div className="p-10 text-center" style={{ color: 'var(--muted-foreground)' }}>
                  <p className="text-sm font-medium">No expenses to chart.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Liabilities */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} style={{ color: 'var(--accent-purple)' }} />
            <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Current Liabilities</h3>
          </div>
          <Card className="p-6 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard size={14} style={{ color: 'var(--muted-foreground)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>Card Outstanding</span>
                </div>
                <span className="font-bold text-sm" style={{ color: 'var(--destructive)' }}>{formatCurrency(totalOutstandings)}</span>
              </div>
              <div className="h-2 w-full rounded-full" style={{ background: 'linear-gradient(90deg, var(--destructive), var(--accent-amber))' }} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Landmark size={14} style={{ color: 'var(--muted-foreground)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>Original Loan Principal</span>
                </div>
                <span className="font-bold text-sm" style={{ color: 'var(--accent-purple)' }}>{formatCurrency(totalLoanLiability)}</span>
              </div>
              <div className="h-2 w-full rounded-full" style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent-purple))' }} />
            </div>

            {loans.length === 0 && creditCards.length === 0 && (
              <div className="text-center p-6 rounded-xl" style={{ border: '1px dashed var(--border-solid)', color: 'var(--muted-foreground)' }}>
                <p className="text-sm font-medium">No active liabilities!</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
