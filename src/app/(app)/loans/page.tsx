"use client";
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
