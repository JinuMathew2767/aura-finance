"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { PieChart, PlusCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Budgets() {
  const { data: budgets } = useSWR("/api/budgets", fetcher);
  const { data: categories } = useSWR("/api/categories", fetcher);
  const { data: transactions } = useSWR("/api/transactions?limit=1000", fetcher); // Adjust limit practically in prod

  const loading = !budgets || !categories || !transactions;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
           <p className="text-(--muted-foreground)">Track spending ceilings effectively.</p>
        </div>
        <Button className="bg-(--primary) text-white h-10 px-4 rounded-xl font-medium flex items-center gap-2 shadow-sm hover:opacity-90">
          <PlusCircle size={18} /> New Budget
        </Button>
      </div>

      {loading ? <div className="flex justify-center p-12"><Spinner /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {budgets?.map((budget: any) => {
            const cat = categories?.find((c: any) => c.id === budget.category_id);
            
            // Calculate real spending against this budget
            const spent = transactions
              ? transactions.filter((tx: any) => 
                  tx.transaction_type === "EXPENSE" &&
                  tx.category_id === budget.category_id && 
                  new Date(tx.transaction_date).getMonth() + 1 === budget.month &&
                  new Date(tx.transaction_date).getFullYear() === budget.year
                ).reduce((acc: number, tx: any) => acc + (Number(tx.amount) || 0), 0)
              : 0;

            const usage = Math.min((spent / budget.amount) * 100, 100);
            const isOver = spent >= budget.amount;
            const isWarning = usage > 80 && !isOver;
            
            let colorCls = "bg-emerald-500";
            if (isWarning) colorCls = "bg-orange-500";
            if (isOver) colorCls = "bg-rose-500";

            return (
              <Card key={budget.id} className="glass shadow-md hover:shadow-lg transition-all overflow-hidden border-0 border-t border-white/10 ring-1 ring-(--border)/50">
                <CardHeader className="pb-2">
                   <div className="flex items-start justify-between">
                     <div className="flex items-center gap-3 mb-2 text-(--primary)">
                        <div className="p-2 bg-(--primary)/10 rounded-[0.8rem]">
                          <PieChart size={20} />
                        </div>
                        <span className="font-semibold">{cat?.name || "Unknown"}</span>
                     </div>
                     {isOver && <AlertCircle size={18} className="text-rose-500" />}
                   </div>
                   <CardDescription className="uppercase tracking-widest text-[10px] font-bold">
                     Limits &bull; {budget.month}/{budget.year}
                   </CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="flex items-baseline gap-2">
                     <span className="font-bold text-3xl tracking-tight text-(--foreground)">{formatCurrency(spent)}</span>
                     <span className="text-sm font-medium text-(--muted-foreground)">/ {formatCurrency(budget.amount)}</span>
                   </div>
                   <div className="mt-5 h-2 w-full bg-(--secondary) rounded-full overflow-hidden">
                      <div className={`h-full ${colorCls} transition-all duration-1000`} style={{ width: `${usage}%` }}></div>
                   </div>
                   <div className="flex justify-between items-center mt-2">
                     <p className={`text-xs font-semibold ${isOver ? 'text-rose-500' : 'text-(--muted-foreground)'}`}>
                       {usage.toFixed(0)}% Utilized
                     </p>
                     <p className="text-xs font-medium text-(--muted-foreground)">
                       {isOver ? `Over by ${formatCurrency(spent - budget.amount)}` : `${formatCurrency(budget.amount - spent)} remaining`}
                     </p>
                   </div>
                </CardContent>
              </Card>
            );
          })}
          
          {budgets?.length === 0 && (
             <div className="col-span-full p-8 text-center text-(--muted-foreground) bg-(--card) rounded-2xl ring-1 ring-(--border)">
                No active budgets mapped for this period.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
