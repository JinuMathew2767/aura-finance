"use client";

import { use } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Landmark, Calendar, Banknote, CalendarClock, Wallet } from "lucide-react";
import Link from "next/link";

type LoanPayment = {
  id: string;
  payment_date: string;
  principal_amount: number | string | null;
  interest_amount: number | string | null;
  auto_created?: boolean | null;
};

type LoanRecord = {
  id: string;
  name: string;
  total_amount: number | string;
  total_profit_amount?: number | string | null;
  amount_paid_to_date?: number | string | null;
  principal_paid_to_date?: number | string | null;
  profit_paid_to_date?: number | string | null;
  monthly_payment: number | string;
  interest_rate?: number | string | null;
  start_date?: string | null;
  end_date?: string | null;
  next_payment_date?: string | null;
  payment_account_id?: string | null;
  auto_create_emi?: boolean | null;
  owner_type: string;
  vehicle_id?: string | null;
};

type AccountRecord = {
  id: string;
  name: string;
};

function toNumber(value: number | string | null | undefined) {
  return Number(value) || 0;
}

export default function LoanDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params).id;
  const { data: loan } = useSWR<LoanRecord>(`/api/loans/${id}`, fetcher);
  const { data: payments } = useSWR<LoanPayment[]>(`/api/loans/${id}/payments`, fetcher);
  const { data: accounts } = useSWR<AccountRecord[]>("/api/accounts", fetcher);

  if (!loan) return <div className="p-12 flex justify-center"><Spinner /></div>;

  const financeAmount = toNumber(loan.total_amount);
  const totalProfitAmount = toNumber(loan.total_profit_amount);
  const totalPaid = toNumber(loan.amount_paid_to_date);
  const principalPaid = toNumber(loan.principal_paid_to_date);
  const profitPaid = toNumber(loan.profit_paid_to_date);
  const outstandingTotal = Math.max(financeAmount + totalProfitAmount - totalPaid, 0);
  const outstandingPrincipal = Math.max(financeAmount - principalPaid, 0);
  const outstandingProfit = Math.max(totalProfitAmount - profitPaid, 0);
  const paymentAccount = accounts?.find((account) => account.id === loan.payment_account_id);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
      <Link href="/loans" className="inline-flex items-center text-sm font-medium text-(--primary) hover:underline mb-2">
        <ArrowLeft size={16} className="mr-1" /> Back to Loans
      </Link>

      <Card className="glass border-0 ring-1 ring-(--border)/50 shadow-lg overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <CardTitle className="text-3xl font-bold mb-2">{loan.name}</CardTitle>
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-(--muted-foreground) bg-(--secondary)/50 inline-flex px-3 py-1 rounded-full">
                <span className="flex items-center gap-1"><Calendar size={14} /> Ends {loan.end_date || "N/A"}</span>
                <span>{toNumber(loan.interest_rate).toFixed(2)}% rate</span>
                <span>{loan.owner_type}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-sm text-(--muted-foreground) font-medium">Monthly EMI</span>
              <span className="text-2xl font-bold tracking-tight">{formatCurrency(toNumber(loan.monthly_payment))}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-4 border-t border-(--border)/50 p-6 bg-(--card)">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="block text-xs text-(--muted-foreground) mb-1 uppercase tracking-wider font-semibold">Original Finance</span>
              <span className="font-semibold text-lg">{formatCurrency(financeAmount)}</span>
            </div>
            <div>
              <span className="block text-xs text-(--muted-foreground) mb-1 uppercase tracking-wider font-semibold">Total Profit</span>
              <span className="font-semibold text-lg">{formatCurrency(totalProfitAmount)}</span>
            </div>
            <div>
              <span className="block text-xs text-(--muted-foreground) mb-1 uppercase tracking-wider font-semibold">Paid To Date</span>
              <span className="font-semibold text-lg">{formatCurrency(totalPaid)}</span>
            </div>
            <div>
              <span className="block text-xs text-(--muted-foreground) mb-1 uppercase tracking-wider font-semibold">Outstanding Total</span>
              <span className="font-semibold text-lg">{formatCurrency(outstandingTotal)}</span>
            </div>
            <div>
              <span className="block text-xs text-(--muted-foreground) mb-1 uppercase tracking-wider font-semibold">Principal Paid</span>
              <span className="font-semibold text-lg">{formatCurrency(principalPaid)}</span>
            </div>
            <div>
              <span className="block text-xs text-(--muted-foreground) mb-1 uppercase tracking-wider font-semibold">Profit Paid</span>
              <span className="font-semibold text-lg">{formatCurrency(profitPaid)}</span>
            </div>
            <div>
              <span className="block text-xs text-(--muted-foreground) mb-1 uppercase tracking-wider font-semibold">Outstanding Principal</span>
              <span className="font-semibold text-lg">{formatCurrency(outstandingPrincipal)}</span>
            </div>
            <div>
              <span className="block text-xs text-(--muted-foreground) mb-1 uppercase tracking-wider font-semibold">Outstanding Profit</span>
              <span className="font-semibold text-lg">{formatCurrency(outstandingProfit)}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-(--border) p-4 bg-(--background)">
              <div className="flex items-center gap-2 text-sm font-semibold text-(--foreground) mb-1">
                <CalendarClock size={16} />
                Next EMI
              </div>
              <div className="text-lg font-bold">{loan.next_payment_date || "Not set"}</div>
              <div className="text-xs text-(--muted-foreground) mt-1">
                {loan.auto_create_emi ? "Auto-post enabled" : "Manual payment tracking"}
              </div>
            </div>

          <div className="rounded-2xl border border-(--border) p-4 bg-(--background)">
            <div className="flex items-center gap-2 text-sm font-semibold text-(--foreground) mb-1">
              <Wallet size={16} />
              Payment Account
            </div>
            <div className="text-lg font-bold">{paymentAccount?.name || "Not selected"}</div>
            <div className="text-xs text-(--muted-foreground) mt-1">
              EMI will reduce this account balance when auto-posted.
            </div>
          </div>

            <div className="rounded-2xl border border-(--border) p-4 bg-(--background)">
              <div className="flex items-center gap-2 text-sm font-semibold text-(--foreground) mb-1">
                <Landmark size={16} />
                Loan Status
              </div>
              <div className="text-lg font-bold">{outstandingTotal > 0 ? "Active" : "Settled"}</div>
              <div className="text-xs text-(--muted-foreground) mt-1">
                Start {loan.start_date || "N/A"} • End {loan.end_date || "N/A"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><Banknote size={20} /> Payment History</h3>

        {!payments ? <Spinner className="ml-2" /> : payments.length === 0 ? (
          <div className="p-10 border border-dashed border-(--border) rounded-2xl bg-(--card)/50 text-center flex flex-col items-center">
            <Landmark size={32} className="text-(--muted-foreground) mb-3 opacity-50" />
            <p className="text-(--muted-foreground) font-medium">No recorded loan payments yet.</p>
            <p className="text-xs text-(--muted-foreground)/70 mt-1">Automatic EMI entries and manual linked payments will appear here.</p>
          </div>
        ) : (
          <Card className="overflow-hidden shadow-sm">
            <div className="divide-y divide-(--border)/50">
              {payments.map((payment) => {
                const principal = toNumber(payment.principal_amount);
                const interest = toNumber(payment.interest_amount);
                return (
                  <div key={payment.id} className="flex justify-between items-center p-5 hover:bg-(--muted)/30 transition-colors">
                    <div>
                      <div className="font-semibold text-base mb-1">{formatDate(payment.payment_date)}</div>
                      {payment.auto_created ? (
                        <div className="text-sm font-medium text-(--muted-foreground)">
                          EMI deducted from account balance: {formatCurrency(principal + interest)}
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-(--muted-foreground)">
                          Principal: {formatCurrency(principal)} • Profit: {formatCurrency(interest)}
                        </div>
                      )}
                      {payment.auto_created && (
                        <div className="text-xs mt-2 inline-flex px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                          Auto-created EMI
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">-{formatCurrency(principal + interest)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
