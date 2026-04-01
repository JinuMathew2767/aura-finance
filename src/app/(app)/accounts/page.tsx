"use client";
import React from "react";
import useSWR from "swr";
import { fetchWithBody, fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";
import { CreateAccountSchema } from "@/lib/validators";
import { Spinner } from "@/components/ui/spinner";
import { Wallet, TrendingUp, PlusCircle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type AccountFormValues = z.input<typeof CreateAccountSchema>;
type AccountFormData = z.output<typeof CreateAccountSchema>;

export default function Accounts() {
  const [showForm, setShowForm] = React.useState(false);
  const { data, mutate } = useSWR("/api/accounts", fetcher);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AccountFormValues, unknown, AccountFormData>({
    resolver: zodResolver(CreateAccountSchema),
    defaultValues: {
      name: "",
      type: "BANK",
      current_balance: 0,
      owner_type: "SHARED",
    },
  });

  const onSubmit = async (formData: AccountFormData) => {
    try {
      await fetchWithBody("/api/accounts", "POST", formData);
      await mutate();
      reset({
        name: "",
        type: "BANK",
        current_balance: 0,
        owner_type: "SHARED",
      });
      setShowForm(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const onInvalid = (formErrors: FieldErrors<AccountFormValues>) => {
    const firstError = Object.values(formErrors)[0];
    const message =
      firstError && typeof firstError === "object" && "message" in firstError && typeof firstError.message === "string"
        ? firstError.message
        : "Please review the highlighted fields.";

    alert(message);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Accounts</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Manage your bank accounts and wallets
          </p>
        </div>
        <Button type="button" className="gap-2" onClick={() => setShowForm((value) => !value)}>
          {showForm ? <X size={16} /> : <PlusCircle size={16} />}
          {showForm ? "Close" : "Add Account"}
        </Button>
      </div>

      {showForm && (
      <Card className="border-(--border) shadow-md overflow-hidden glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <PlusCircle size={18} style={{ color: "var(--primary)" }} />
              <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Add Account</h2>
            </div>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input {...register("name")} placeholder="Emirates NBD, Cash Wallet..." className="bg-(--card)" />
                {errors.name && <p className="text-sm text-(--destructive)">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Opening Balance</Label>
                <Input type="number" step="0.01" {...register("current_balance", { valueAsNumber: true })} className="bg-(--card)" />
                {errors.current_balance && <p className="text-sm text-(--destructive)">{errors.current_balance.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <select {...register("type")} className="flex h-11 w-full rounded-xl border border-(--border) bg-(--card) px-3 outline-none focus-visible:ring-1 focus-visible:ring-(--ring)">
                  <option value="BANK">Bank</option>
                  <option value="CASH">Cash</option>
                  <option value="SHARED_WALLET">Shared Wallet</option>
                </select>
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

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
              <PlusCircle size={16} />
              {isSubmitting ? "Saving..." : "Add Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
      )}

      {!data ? (
        <div className="flex justify-center p-16"><Spinner /></div>
      ) : data.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="h-14 w-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <Wallet size={22} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>No accounts configured</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Connect your database to see your bank accounts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {data.map((account: any) => (
            <div key={account.id} className="card-glow-blue rounded-2xl p-6 group">
              <div className="flex items-center justify-between mb-5">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(var(--primary-rgb), 0.12)' }}
                >
                  <Wallet size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}
                >
                  {account.owner_type}
                </span>
              </div>
              <h3 className="font-bold text-base mb-1" style={{ color: 'var(--foreground)' }}>{account.name}</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>{account.type}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>Balance</p>
                  <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(account.current_balance)}
                  </p>
                </div>
                <TrendingUp size={16} style={{ color: 'var(--success)' }} className="opacity-50" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
