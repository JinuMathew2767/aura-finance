"use client";
import React from "react";
import useSWR from "swr";
import { fetchWithBody, fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CreateLoanSchema } from "@/lib/validators";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Car, Landmark, PlusCircle, X } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type LoanFormData = z.infer<typeof CreateLoanSchema>;

export default function Loans() {
  const [showForm, setShowForm] = React.useState(false);
  const { data: loans, mutate } = useSWR("/api/loans", fetcher);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LoanFormData>({
    resolver: zodResolver(CreateLoanSchema),
    defaultValues: {
      vehicle_id: null,
      name: "",
      total_amount: 0,
      interest_rate: 0,
      monthly_payment: 0,
      start_date: null,
      end_date: null,
      owner_type: "SHARED",
    },
  });

  const onSubmit = async (formData: LoanFormData) => {
    try {
      const payload = {
        ...formData,
        vehicle_id: formData.vehicle_id || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      await fetchWithBody("/api/loans", "POST", payload);
      await mutate();
      reset({
        vehicle_id: null,
        name: "",
        total_amount: 0,
        interest_rate: 0,
        monthly_payment: 0,
        start_date: null,
        end_date: null,
        owner_type: "SHARED",
      });
      setShowForm(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Active Loans</h1>
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
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loan Name</Label>
                <Input {...register("name")} placeholder="Car Loan, Personal Loan..." className="bg-(--card)" />
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Principal Amount</Label>
                <Input type="number" step="0.01" {...register("total_amount", { valueAsNumber: true })} className="bg-(--card)" />
                {errors.total_amount && <p className="text-sm text-(--destructive)">{errors.total_amount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Interest Rate</Label>
                <Input type="number" step="0.01" {...register("interest_rate", { valueAsNumber: true })} className="bg-(--card)" />
                {errors.interest_rate && <p className="text-sm text-(--destructive)">{errors.interest_rate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Monthly Payment</Label>
                <Input type="number" step="0.01" {...register("monthly_payment", { valueAsNumber: true })} className="bg-(--card)" />
                {errors.monthly_payment && <p className="text-sm text-(--destructive)">{errors.monthly_payment.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" {...register("start_date")} className="bg-(--card)" />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" {...register("end_date")} className="bg-(--card)" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {loans.map((loan: any) => (
            <Link href={`/loans/${loan.id}`} key={loan.id}>
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
