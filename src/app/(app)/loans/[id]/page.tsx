"use client";
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
  const { data: loan } = useSWR(`/api/loans/${id}`, fetcher);
  const { data: payments } = useSWR(`/api/loans/${id}/payments`, fetcher);

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
