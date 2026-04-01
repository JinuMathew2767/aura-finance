"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { TrendingUp, TrendingDown, PieChart, CreditCard, Landmark } from "lucide-react";

export default function Reports() {
  const { data: transactions } = useSWR("/api/transactions?limit=2000", fetcher);
  const { data: cards } = useSWR("/api/cards", fetcher);
  const { data: loans } = useSWR("/api/loans", fetcher);
  const { data: categories } = useSWR("/api/categories", fetcher);
  
  // Maintenance tracking explicitly deferred from Reports scope securely for Phase 5.

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
            <span className={`text-3xl font-bold tracking-tight ${netFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
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
                        <div className="h-full bg-rose-500" style={{ width: `${percentage}%` }}></div>
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
                 <span className="text-sm font-semibold flex items-center gap-2 text-(--muted-foreground)"><Landmark size={14}/> Original Loan Principal</span>
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
