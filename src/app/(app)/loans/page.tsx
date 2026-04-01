"use client";

import React from "react";
import useSWR from "swr";
import { fetchWithBody, fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";
import { CreateLoanSchema } from "@/lib/validators";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Car, Landmark, PlusCircle, X, CalendarClock, Wallet } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type LoanFormValues = z.input<typeof CreateLoanSchema>;
type LoanFormData = z.output<typeof CreateLoanSchema>;

type AccountSummary = {
  id: string;
  name: string;
  type: string;
};

type LoanSummary = {
  id: string;
  vehicle_id?: string | null;
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
};

function toNumber(value: number | string | null | undefined) {
  return Number(value) || 0;
}

export default function Loans() {
  const [showForm, setShowForm] = React.useState(false);
  const { data: loans, mutate } = useSWR<LoanSummary[]>("/api/loans", fetcher);
  const { data: accounts } = useSWR<AccountSummary[]>("/api/accounts", fetcher);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<LoanFormValues, unknown, LoanFormData>({
    resolver: zodResolver(CreateLoanSchema),
    defaultValues: {
      vehicle_id: null,
      name: "",
      total_amount: 0,
      total_profit_amount: 0,
      amount_paid_to_date: 0,
      principal_paid_to_date: 0,
      profit_paid_to_date: 0,
      interest_rate: 0,
      monthly_payment: 0,
      payment_account_id: null,
      next_payment_date: null,
      auto_create_emi: true,
      start_date: null,
      end_date: null,
      owner_type: "SHARED",
    },
  });

  const autoCreateEmi = watch("auto_create_emi");

  const resetForm = () => {
    reset({
      vehicle_id: null,
      name: "",
      total_amount: 0,
      total_profit_amount: 0,
      amount_paid_to_date: 0,
      principal_paid_to_date: 0,
      profit_paid_to_date: 0,
      interest_rate: 0,
      monthly_payment: 0,
      payment_account_id: null,
      next_payment_date: null,
      auto_create_emi: true,
      start_date: null,
      end_date: null,
      owner_type: "SHARED",
    });
  };

  const onSubmit = async (formData: LoanFormData) => {
    try {
      if (formData.auto_create_emi && (!formData.payment_account_id || !formData.next_payment_date)) {
        alert("To auto-create EMI expenses, please select a payment account and next EMI date.");
        return;
      }

      const payload = {
        ...formData,
        vehicle_id: formData.vehicle_id || null,
        payment_account_id: formData.payment_account_id || null,
        next_payment_date: formData.next_payment_date || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      await fetchWithBody("/api/loans", "POST", payload);
      await mutate();
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const onInvalid = (formErrors: FieldErrors<LoanFormValues>) => {
    const firstError = Object.values(formErrors)[0];
    const message =
      firstError && typeof firstError === "object" && "message" in firstError && typeof firstError.message === "string"
        ? firstError.message
        : "Please review the highlighted fields.";

    alert(message);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Loans</h1>
          <p className="text-sm mt-1 text-(--muted-foreground)">
            Track financed amount, statement values, and automatic EMI deductions from your chosen account.
          </p>
        </div>
        <Button type="button" className="gap-2" onClick={() => setShowForm((value) => !value)}>
          {showForm ? <X size={16} /> : <PlusCircle size={16} />}
          {showForm ? "Close" : "Add Loan"}
        </Button>
      </div>

      {showForm && (
        <Card className="border-(--border) shadow-md overflow-hidden glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} style={{ color: "var(--primary)" }} />
                <h2 className="text-lg font-bold text-(--foreground)">Add Loan</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-(--foreground)">Loan Snapshot</h3>
                  <p className="text-xs text-(--muted-foreground)">Use the values from your latest finance statement.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Loan Name</Label>
                    <Input {...register("name")} placeholder="Toyota Auto Loan" className="bg-(--card)" />
                    {errors.name && <p className="text-sm text-(--destructive)">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Owner</Label>
                    <select {...register("owner_type")} className="flex h-11 w-full rounded-xl border border-(--border) bg-(--card) px-3 outline-none focus-visible:ring-1 focus-visible:ring-(--ring)">
                      <option value="SHARED">Shared</option>
                      <option value="SELF">Self</option>
                      <option value="SPOUSE">Spouse</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Original Finance Amount</Label>
                    <Input type="number" step="0.01" {...register("total_amount", { valueAsNumber: true })} className="bg-(--card)" />
                    {errors.total_amount && <p className="text-sm text-(--destructive)">{errors.total_amount.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Total Interest / Profit</Label>
                    <Input type="number" step="0.01" {...register("total_profit_amount", { valueAsNumber: true })} className="bg-(--card)" />
                    {errors.total_profit_amount && <p className="text-sm text-(--destructive)">{errors.total_profit_amount.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Amount Paid So Far</Label>
                    <Input type="number" step="0.01" {...register("amount_paid_to_date", { valueAsNumber: true })} className="bg-(--card)" />
                    {errors.amount_paid_to_date && <p className="text-sm text-(--destructive)">{errors.amount_paid_to_date.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Principal Paid So Far</Label>
                    <Input type="number" step="0.01" {...register("principal_paid_to_date", { valueAsNumber: true })} className="bg-(--card)" />
                    {errors.principal_paid_to_date && <p className="text-sm text-(--destructive)">{errors.principal_paid_to_date.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Profit Paid So Far</Label>
                    <Input type="number" step="0.01" {...register("profit_paid_to_date", { valueAsNumber: true })} className="bg-(--card)" />
                    {errors.profit_paid_to_date && <p className="text-sm text-(--destructive)">{errors.profit_paid_to_date.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Interest Rate (%)</Label>
                    <Input type="number" step="0.01" {...register("interest_rate", { valueAsNumber: true })} className="bg-(--card)" />
                    {errors.interest_rate && <p className="text-sm text-(--destructive)">{errors.interest_rate.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Monthly EMI</Label>
                    <Input type="number" step="0.01" {...register("monthly_payment", { valueAsNumber: true })} className="bg-(--card)" />
                    {errors.monthly_payment && <p className="text-sm text-(--destructive)">{errors.monthly_payment.message}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-(--foreground)">EMI Automation</h3>
                  <p className="text-xs text-(--muted-foreground)">
                    When enabled, the app simply posts the EMI as an expense and deducts it from the chosen account balance.
                  </p>
                </div>

                <label className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--card) px-4 py-3">
                  <input type="checkbox" {...register("auto_create_emi")} className="h-4 w-4 rounded border-(--border)" />
                  <div>
                    <div className="text-sm font-semibold text-(--foreground)">Auto-create EMI expense</div>
                    <div className="text-xs text-(--muted-foreground)">The next due EMI will be posted as an expense automatically.</div>
                  </div>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Pay EMI From Account</Label>
                    <select
                      {...register("payment_account_id")}
                      disabled={!autoCreateEmi}
                      className="flex h-11 w-full rounded-xl border border-(--border) bg-(--card) px-3 outline-none focus-visible:ring-1 focus-visible:ring-(--ring) disabled:opacity-50"
                    >
                      <option value="">Select Account...</option>
                      {accounts?.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} ({account.type})
                        </option>
                      ))}
                    </select>
                    {errors.payment_account_id && <p className="text-sm text-(--destructive)">{errors.payment_account_id.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Next EMI Date</Label>
                    <Input type="date" {...register("next_payment_date")} disabled={!autoCreateEmi} className="bg-(--card) disabled:opacity-50" />
                    {errors.next_payment_date && <p className="text-sm text-(--destructive)">{errors.next_payment_date.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" {...register("start_date")} className="bg-(--card)" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" {...register("end_date")} className="bg-(--card)" />
                  </div>

                  <div className="space-y-2">
                    <Label>Vehicle Link (Optional UUID)</Label>
                    <Input {...register("vehicle_id")} placeholder="Vehicle ID if linked" className="bg-(--card)" />
                    {errors.vehicle_id && <p className="text-sm text-(--destructive)">{errors.vehicle_id.message}</p>}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
                <PlusCircle size={16} />
                {isSubmitting ? "Saving..." : "Add Loan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!loans ? <div className="flex justify-center p-12"><Spinner /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {loans.map((loan) => {
            const financeAmount = toNumber(loan.total_amount);
            const totalProfit = toNumber(loan.total_profit_amount);
            const paid = toNumber(loan.amount_paid_to_date);
            const outstanding = Math.max(financeAmount + totalProfit - paid, 0);
            const paymentAccount = accounts?.find((account) => account.id === loan.payment_account_id);

            return (
              <Link href={`/loans/${loan.id}`} key={loan.id}>
                <Card className="glass shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-(--primary)/10 text-(--primary) rounded-[0.8rem]">
                        {loan.vehicle_id ? <Car size={20} /> : <Landmark size={20} />}
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-(--secondary) rounded-full">
                        {toNumber(loan.interest_rate).toFixed(2)}% rate
                      </span>
                    </div>
                    <CardTitle className="text-xl leading-tight">{loan.name}</CardTitle>
                    <CardDescription>EMI: {formatCurrency(toNumber(loan.monthly_payment))} /mo</CardDescription>

                    <div className="mt-6 space-y-3">
                      <div>
                        <p className="text-sm text-(--muted-foreground) mb-1">Outstanding Balance</p>
                        <div className="font-bold text-2xl tracking-tight text-(--foreground)">{formatCurrency(outstanding)}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-(--muted-foreground)">Finance</p>
                          <p className="font-semibold">{formatCurrency(financeAmount)}</p>
                        </div>
                        <div>
                          <p className="text-(--muted-foreground)">Profit</p>
                          <p className="font-semibold">{formatCurrency(totalProfit)}</p>
                        </div>
                        <div>
                          <p className="text-(--muted-foreground)">Paid</p>
                          <p className="font-semibold">{formatCurrency(paid)}</p>
                        </div>
                        <div>
                          <p className="text-(--muted-foreground)">Next EMI</p>
                          <p className="font-semibold">{loan.next_payment_date || "Not set"}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-(--muted-foreground) pt-2 border-t border-(--border)">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock size={14} />
                          {loan.auto_create_emi ? "Auto EMI on" : "Manual loan"}
                        </span>
                        <span className="inline-flex items-center gap-1 truncate">
                          <Wallet size={14} />
                          {paymentAccount?.name || "No payment account"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
          {loans.length === 0 && <div className="p-8 col-span-full text-center text-(--muted-foreground)">No active loans found.</div>}
        </div>
      )}
    </div>
  );
}
