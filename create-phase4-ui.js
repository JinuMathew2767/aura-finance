const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'src', 'app', '(app)');

function mk(...segments) {
  const target = path.join(appDir, ...segments);
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
  return target;
}

// 1. BUDGETS UPDATE (Real Logic)
const budgetsPath = mk('budgets');
fs.writeFileSync(path.join(budgetsPath, 'page.tsx'), `"use client";
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
                      <div className={\`h-full \${colorCls} transition-all duration-1000\`} style={{ width: \`\${usage}%\` }}></div>
                   </div>
                   <div className="flex justify-between items-center mt-2">
                     <p className={\`text-xs font-semibold \${isOver ? 'text-rose-500' : 'text-(--muted-foreground)'}\`}>
                       {usage.toFixed(0)}% Utilized
                     </p>
                     <p className="text-xs font-medium text-(--muted-foreground)">
                       {isOver ? \`Over by \${formatCurrency(spent - budget.amount)}\` : \`\${formatCurrency(budget.amount - spent)} remaining\`}
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
`);


// 2. LOANS
const loansPath = mk('loans');
fs.writeFileSync(path.join(loansPath, 'page.tsx'), `"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Car, Landmark } from "lucide-react";
import Link from "next/link";

export default function Loans() {
  const { data: loans } = useSWR("/api/loans", fetcher);

  return (
    <div className="space-y-6 animate-in fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Active Loans</h1>
      
      {!loans ? <div className="flex justify-center p-12"><Spinner /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {loans.map((loan: any) => (
            <Link href={\`/loans/\${loan.id}\`} key={loan.id}>
              <Card className="glass shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                   <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-(--primary)/10 text-(--primary) rounded-[0.8rem]">
                        {loan.vehicle_id ? <Car size={20} /> : <Landmark size={20} />}
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-(--secondary) rounded-full">
                        {loan.interest_rate}% APR
                      </span>
                   </div>
                   <CardTitle className="text-xl leading-tight">{loan.name}</CardTitle>
                   <CardDescription>Target: {formatCurrency(loan.monthly_payment)} /mo</CardDescription>
                   
                   <div className="mt-6">
                     <p className="text-sm text-(--muted-foreground) mb-1">Principal Liability</p>
                     <div className="font-bold text-2xl tracking-tight text-(--foreground)">{formatCurrency(loan.total_amount)}</div>
                   </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
          {loans.length === 0 && <div className="p-8 col-span-full text-center text-(--muted-foreground)">No active loans found.</div>}
        </div>
      )}
    </div>
  );
}
`);

// 3. LOANS Detail
const loanIdPath = mk('loans', '[id]');
fs.writeFileSync(path.join(loanIdPath, 'page.tsx'), `"use client";
import { use } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Landmark, Calendar, Banknote } from "lucide-react";
import Link from "next/link";

export default function LoanDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params).id;
  const { data: loan } = useSWR(\`/api/loans/\${id}\`, fetcher);
  const { data: payments } = useSWR(\`/api/loans/\${id}/payments\`, fetcher);

  if (!loan) return <div className="p-12 flex justify-center"><Spinner /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <Link href="/loans" className="inline-flex items-center text-sm font-medium text-(--primary) hover:underline mb-2">
         <ArrowLeft size={16} className="mr-1" /> Back to Loans
      </Link>
      
      <Card className="glass border-0 ring-1 ring-(--border)/50 shadow-lg overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <CardHeader className="pb-2">
           <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold mb-2">{loan.name}</CardTitle>
                <div className="flex items-center gap-4 text-sm font-medium text-(--muted-foreground) bg-(--secondary)/50 inline-flex px-3 py-1 rounded-full">
                  <span className="flex items-center gap-1"><Calendar size={14} /> Ends {loan.end_date || 'N/A'}</span>
                  <span>{loan.interest_rate}% APR</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm text-(--muted-foreground) font-medium">Monthly Target</span>
                <span className="text-2xl font-bold tracking-tight">{formatCurrency(loan.monthly_payment)}</span>
              </div>
           </div>
        </CardHeader>
        <CardContent className="mt-4 border-t border-(--border)/50 p-6 bg-(--card)">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div><span className="block text-xs text-(--muted-foreground) mb-1 uppercase tracking-wider font-semibold">Principal Target</span> <span className="font-semibold text-lg">{formatCurrency(loan.total_amount)}</span></div>
             <div><span className="block text-xs text-(--muted-foreground) mb-1 uppercase tracking-wider font-semibold">Start Date</span> <span className="font-semibold text-lg">{loan.start_date || 'N/A'}</span></div>
             <div><span className="block text-xs text-(--muted-foreground) mb-1 uppercase tracking-wider font-semibold">Status</span> <span className="font-semibold text-emerald-500">Active</span></div>
             <div><span className="block text-xs text-(--muted-foreground) mb-1 uppercase tracking-wider font-semibold">Vehicle Link</span> <span className="font-semibold truncate">{loan.vehicle_id ? "Linked" : "None"}</span></div>
           </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Banknote size={20} /> Payment History</h3>
        
        {!payments ? <Spinner className="ml-2" /> : payments.length === 0 ? (
          <div className="p-10 border border-dashed border-(--border) rounded-2xl bg-(--card)/50 text-center flex flex-col items-center">
             <Landmark size={32} className="text-(--muted-foreground) mb-3 opacity-50" />
             <p className="text-(--muted-foreground) font-medium">No recorded loan payments yet.</p>
             <p className="text-xs text-(--muted-foreground)/70 mt-1">Payments must map explicitly to this loan log.</p>
          </div>
        ) : (
          <Card className="overflow-hidden shadow-sm">
            <div className="divide-y divide-(--border)/50">
              {payments.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center p-5 hover:bg-(--muted)/30 transition-colors">
                  <div>
                    <div className="font-semibold text-base mb-1">{formatDate(p.payment_date)}</div>
                    <div className="text-sm font-medium text-(--muted-foreground)">Principal: {formatCurrency(p.principal_amount)} &bull; Interest: {formatCurrency(p.interest_amount)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">-{formatCurrency((Number(p.principal_amount)||0) + (Number(p.interest_amount)||0))}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
`);

// 4. VEHICLES
const vehiclesPath = mk('vehicles');
fs.writeFileSync(path.join(vehiclesPath, 'page.tsx'), `"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Car, Wrench } from "lucide-react";
import Link from "next/link";

export default function Vehicles() {
  const { data: vehicles } = useSWR("/api/vehicles", fetcher);

  return (
    <div className="space-y-6 animate-in fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Household Fleet</h1>
      
      {!vehicles ? <div className="flex justify-center p-12"><Spinner /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {vehicles.map((v: any) => (
            <Link href={\`/vehicles/\${v.id}\`} key={v.id}>
              <Card className="glass shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                   <div className="flex justify-between items-start mb-2">
                     <div className="p-3 bg-(--primary)/10 text-(--primary) rounded-full">
                       <Car size={24} />
                     </div>
                   </div>
                   <CardTitle className="text-2xl leading-tight">{v.year ? \`\${v.year} \` : ''}{v.make} {v.model}</CardTitle>
                   <CardDescription className="flex items-center gap-2 mt-2">
                     <span className="font-medium px-2 py-0.5 bg-(--secondary) rounded text-(--foreground) text-xs">Plate: {v.license_plate || 'N/A'}</span>
                     <span className="text-xs">Owner: {v.owner_type}</span>
                   </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
          {vehicles.length === 0 && <div className="p-8 col-span-full text-center text-(--muted-foreground)">No vehicles registered.</div>}
        </div>
      )}
    </div>
  );
}
`);

// 5. VEHICLE Detail
const vehicleIdPath = mk('vehicles', '[id]');
fs.writeFileSync(path.join(vehicleIdPath, 'page.tsx'), `"use client";
import { use } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Car, PenTool } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VehicleDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params).id;
  const { data: vehicle } = useSWR(\`/api/vehicles/\${id}\`, fetcher);
  const { data: maintenance } = useSWR(\`/api/vehicles/\${id}/maintenance\`, fetcher);

  if (!vehicle) return <div className="p-12 flex justify-center"><Spinner /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <Link href="/vehicles" className="inline-flex items-center text-sm font-medium text-(--primary) hover:underline mb-2">
         <ArrowLeft size={16} className="mr-1" /> Back to Vehicles
      </Link>
      
      <Card className="glass border-0 ring-1 ring-(--border)/50 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Car size={140} />
        </div>
        <CardHeader className="pb-6">
           <CardDescription>Vehicle Profile</CardDescription>
           <CardTitle className="text-4xl font-bold">{vehicle.year ? \`\${vehicle.year} \` : ''}{vehicle.make} {vehicle.model}</CardTitle>
           <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 bg-(--secondary) border border-(--border) rounded-full font-mono text-xs">{vehicle.license_plate || 'UNREGISTERED'}</span>
           </div>
        </CardHeader>
      </Card>

      <div className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2"><PenTool size={20} /> Service Log</h3>
          <Button size="sm" className="rounded-full shadow-md gap-2"><PenTool size={14}/> Log Service</Button>
        </div>
        
        {!maintenance ? <Spinner className="ml-2" /> : maintenance.length === 0 ? (
          <div className="p-10 border border-dashed border-(--border) rounded-2xl bg-(--card)/50 text-center">
             <PenTool size={32} className="text-(--muted-foreground) mb-3 opacity-50 mx-auto" />
             <p className="text-(--muted-foreground) font-medium">No maintenance logs found.</p>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-(--border) before:to-transparent">
            {maintenance.map((m: any, idx: number) => {
              const overdue = m.next_service_date && new Date(m.next_service_date) < new Date();
              return (
                <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={\`flex items-center justify-center w-10 h-10 rounded-full border-4 border-(--background) \${overdue ? 'bg-rose-500 text-white' : 'bg-(--card) text-(--primary) shadow-sm ring-1 ring-(--border)'} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10\`}>
                     <Wrench size={16} />
                  </div>
                  
                  <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm">{formatDate(m.service_date)}</span>
                        {m.cost && <span className="font-bold text-(--foreground)">{formatCurrency(m.cost)}</span>}
                      </div>
                      <CardTitle className="text-base leading-tight mt-1">{m.description}</CardTitle>
                      {m.next_service_date && (
                        <div className={\`mt-3 text-xs font-semibold px-2 py-1 inline-flex rounded \${overdue ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-600'}\`}>
                           Next Due: {formatDate(m.next_service_date)}
                        </div>
                      )}
                    </CardHeader>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
`);

// 6. NOTIFICATIONS
const notesPath = mk('notifications');
fs.writeFileSync(path.join(notesPath, 'page.tsx'), `"use client";
import useSWR from "swr";
import { fetcher, fetchWithBody } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Bell, BellDot, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Notifications() {
  const { data, mutate } = useSWR("/api/notifications", fetcher);

  const markAsRead = async (id: string) => {
    try {
      await fetchWithBody(\`/api/notifications/\${id}/read\`, "PUT", {});
      mutate();
    } catch(err: any) { alert(err.message); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Activity Alerts</h1>
      </div>
      
      {!data ? <div className="flex justify-center p-12"><Spinner /></div> : (
        <div className="space-y-4">
          {data.map((note: any) => (
            <Card key={note.id} className={\`transition-all border-l-4 \${note.is_read ? 'border-l-(--border) opacity-80' : 'border-l-(--primary) shadow-md bg-(--card)'}\`}>
               <div className="flex items-start justify-between p-5">
                 <div className="flex gap-4 items-start">
                   <div className={\`mt-1 \${note.is_read ? 'text-(--muted-foreground)' : 'text-(--primary)'}\`}>
                     {note.is_read ? <Bell size={20} /> : <BellDot size={20} className="animate-pulse" />}
                   </div>
                   <div>
                     <h4 className={\`text-base \${note.is_read ? 'font-medium' : 'font-bold'}\`}>{note.message}</h4>
                     <p className="text-xs text-(--muted-foreground) mt-1 uppercase font-semibold">
                       {formatDistanceToNow(new Date(note.created_at), {addSuffix: true})} &bull; {note.type}
                     </p>
                   </div>
                 </div>
                 
                 {!note.is_read && (
                   <Button variant="ghost" size="icon" onClick={() => markAsRead(note.id)} className="text-(--muted-foreground) hover:text-emerald-500" title="Mark Read">
                     <CheckCircle2 size={24} />
                   </Button>
                 )}
               </div>
            </Card>
          ))}
          {data.length === 0 && <div className="p-12 text-center text-(--muted-foreground) border rounded-xl bg-(--card)">No notifications available.</div>}
        </div>
      )}
    </div>
  );
}
`);

console.log("Phase 4 Files Scaffolding Complete!");
