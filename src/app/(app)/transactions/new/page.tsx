"use client";
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTransactionSchema } from "@/lib/validators";
import { z } from "zod";
import { fetchWithBody, fetcher } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import useSWR from 'swr';

type FormData = z.infer<typeof CreateTransactionSchema>;

export default function NewTransaction() {
  const router = useRouter();
  const { data: accounts } = useSWR("/api/accounts", fetcher);
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      transaction_date: new Date().toISOString(),
      owner_type: "SHARED",
      transaction_type: "EXPENSE",
      payment_method: "BANK",
      amount: 0,
      title: "",
      is_recurring: false
    }
  });

  const watchType = watch("transaction_type");
  const watchCategory = watch("category_id");

  // Fetch Categories & dynamically filter Subcategories based on selection
  const { data: categories } = useSWR("/api/categories", fetcher);
  const { data: subcategories } = useSWR(watchCategory ? `/api/subcategories?category_id=${watchCategory}` : null, fetcher);

  const onSubmit = async (data: FormData) => {
    try {
      // Cleanup empty strings into nulls securely for the backend
      const payload = {
         ...data,
         category_id: data.category_id || null,
         subcategory_id: data.subcategory_id || null,
         account_id: data.account_id || null,
         card_id: data.card_id || null,
         payment_method: data.payment_method || null
      };

      await fetchWithBody("/api/transactions", "POST", payload);
      router.push("/transactions");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
       <h1 className="text-3xl font-bold tracking-tight">Add Transaction</h1>
       
       <Card className="border-(--border) shadow-md overflow-hidden glass">
         <CardContent className="p-6">
           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Type & Payment Method */}
               <div className="space-y-2">
                 <Label>Type</Label>
                 <select {...register("transaction_type")} className="flex h-11 w-full rounded-xl border border-(--border) bg-(--card) px-3 outline-none focus-visible:ring-1 focus-visible:ring-(--ring)">
                   <option value="EXPENSE">Expense</option>
                   <option value="INCOME">Income</option>
                   <option value="TRANSFER">Transfer</option>
                   <option value="CC_PAYMENT">CC Payment</option>
                 </select>
               </div>
               
               <div className="space-y-2">
                 <Label>Payment Method</Label>
                 <select {...register("payment_method")} className="flex h-11 w-full rounded-xl border border-(--border) bg-(--card) px-3 outline-none focus-visible:ring-1 focus-visible:ring-(--ring)">
                   {watchType !== "CC_PAYMENT" ? (
                     <optgroup label="Select Method">
                      <option value="BANK">Bank</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="CASH">Cash</option>
                     </optgroup>
                   ) : (
                     <option value="">None (NULL)</option>
                   )}
                 </select>
               </div>
             </div>

             <div className="space-y-2">
               <Label>Title</Label>
               <Input {...register("title")} placeholder="Groceries, Rent, Salary..." className="bg-(--card)" />
               {errors.title && <p className="text-sm text-(--destructive)">{errors.title.message}</p>}
             </div>
             
             <div className="space-y-2">
               <Label>Amount (AED)</Label>
               <Input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} className="bg-(--card)" />
               {errors.amount && <p className="text-sm text-(--destructive)">{errors.amount.message}</p>}
             </div>
             
             {/* Dynamic Category Group */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select {...register("category_id")} className="flex h-11 w-full rounded-xl border border-(--border) bg-(--card) px-3 outline-none focus-visible:ring-1 focus-visible:ring-(--ring)">
                    <option value="">Select Category...</option>
                    {categories?.filter((c: any) => c.type === watchType).map((c: any) => (
                       <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Subcategory (Optional)</Label>
                  <select {...register("subcategory_id")} disabled={!watchCategory} className="flex h-11 w-full rounded-xl border border-(--border) bg-(--card) px-3 outline-none focus-visible:ring-1 focus-visible:ring-(--ring) disabled:opacity-50">
                    <option value="">Select Subcategory...</option>
                    {subcategories?.map((sc: any) => (
                       <option key={sc.id} value={sc.id}>{sc.name}</option>
                    ))}
                  </select>
                </div>
             </div>
             
             <div className="space-y-2">
               <Label>Account</Label>
               <select {...register("account_id")} className="flex h-11 w-full rounded-xl border border-(--border) bg-(--card) px-3 outline-none focus-visible:ring-1 focus-visible:ring-(--ring)">
                 <option value="">Select Account...</option>
                 {accounts?.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.owner_type})</option>)}
               </select>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Owner</Label>
                 <select {...register("owner_type")} className="flex h-11 w-full rounded-xl border border-(--border) bg-(--card) px-3 outline-none focus-visible:ring-1 focus-visible:ring-(--ring)">
                    <option value="SHARED">Shared</option>
                    <option value="SELF">Self</option>
                    <option value="SPOUSE">Spouse</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <Label>Date</Label>
                 <Input type="datetime-local" {...register("transaction_date")} className="bg-(--card)" />
               </div>
             </div>
             
             <Button type="submit" disabled={isSubmitting} className="w-full mt-6 h-12 text-base shadow-md">
               {isSubmitting ? "Saving..." : "Save Transaction"}
             </Button>
           </form>
         </CardContent>
       </Card>
    </div>
  );
}
