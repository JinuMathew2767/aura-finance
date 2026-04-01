"use client";
import React from "react";
import useSWR from "swr";
import { fetchWithBody, fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";
import { CreateCardSchema } from "@/lib/validators";
import { Spinner } from "@/components/ui/spinner";
import { CreditCard, PlusCircle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type CardFormValues = z.input<typeof CreateCardSchema>;
type CardFormData = z.output<typeof CreateCardSchema>;

export default function Cards() {
  const [showForm, setShowForm] = React.useState(false);
  const { data, mutate } = useSWR("/api/cards", fetcher);
  const { data: accounts } = useSWR("/api/accounts", fetcher);
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<CardFormValues, unknown, CardFormData>({
    resolver: zodResolver(CreateCardSchema),
    defaultValues: {
      name: "",
      type: "DEBIT",
      linked_account_id: null,
      credit_limit: 0,
      statement_day: null,
      due_day: null,
      owner_type: "SHARED",
    },
  });
  const cardType = watch("type");

  const onSubmit = async (formData: CardFormData) => {
    try {
      const payload = {
        ...formData,
        linked_account_id: formData.type === "DEBIT" ? formData.linked_account_id || null : null,
        credit_limit: formData.type === "CREDIT" ? formData.credit_limit || 0 : 0,
        statement_day: formData.type === "CREDIT" ? formData.statement_day || null : null,
        due_day: formData.type === "CREDIT" ? formData.due_day || null : null,
      };

      await fetchWithBody("/api/cards", "POST", payload);
      await mutate();
      reset({
        name: "",
        type: "DEBIT",
        linked_account_id: null,
        credit_limit: 0,
        statement_day: null,
        due_day: null,
        owner_type: "SHARED",
      });
      setShowForm(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const onInvalid = (formErrors: FieldErrors<CardFormValues>) => {
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
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Cards</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Your debit and credit cards
          </p>
        </div>
        <Button type="button" className="gap-2" onClick={() => setShowForm((value) => !value)}>
          {showForm ? <X size={16} /> : <PlusCircle size={16} />}
          {showForm ? "Close" : "Add Card"}
        </Button>
      </div>

      {showForm && (
      <Card className="border-(--border) shadow-md overflow-hidden glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <PlusCircle size={18} style={{ color: "var(--primary)" }} />
              <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Add Card</h2>
            </div>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Card Name</Label>
                <Input {...register("name")} placeholder="Mashreq Credit Card..." className="bg-(--card)" />
                {errors.name && <p className="text-sm text-(--destructive)">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Card Type</Label>
                <select {...register("type")} className="flex h-11 w-full rounded-xl border border-(--border) bg-(--card) px-3 outline-none focus-visible:ring-1 focus-visible:ring-(--ring)">
                  <option value="DEBIT">Debit</option>
                  <option value="CREDIT">Credit</option>
                </select>
              </div>
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

              {cardType === "DEBIT" ? (
                <div className="space-y-2">
                  <Label>Linked Account</Label>
                  <select {...register("linked_account_id")} className="flex h-11 w-full rounded-xl border border-(--border) bg-(--card) px-3 outline-none focus-visible:ring-1 focus-visible:ring-(--ring)">
                    <option value="">Select Account...</option>
                    {accounts?.map((account: any) => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                  {errors.linked_account_id && <p className="text-sm text-(--destructive)">{errors.linked_account_id.message}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Credit Limit</Label>
                  <Input type="number" step="0.01" {...register("credit_limit", { valueAsNumber: true })} className="bg-(--card)" />
                  {errors.credit_limit && <p className="text-sm text-(--destructive)">{errors.credit_limit.message}</p>}
                </div>
              )}
            </div>

            {cardType === "CREDIT" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Statement Day</Label>
                  <Input type="number" {...register("statement_day", { setValueAs: (v) => v === "" ? null : Number(v) })} className="bg-(--card)" />
                  {errors.statement_day && <p className="text-sm text-(--destructive)">{errors.statement_day.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Due Day</Label>
                  <Input type="number" {...register("due_day", { setValueAs: (v) => v === "" ? null : Number(v) })} className="bg-(--card)" />
                  {errors.due_day && <p className="text-sm text-(--destructive)">{errors.due_day.message}</p>}
                </div>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
              <PlusCircle size={16} />
              {isSubmitting ? "Saving..." : "Add Card"}
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
            <CreditCard size={22} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>No cards found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Connect your database to see your cards here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {data.map((card: any) => (
            <div key={card.id} className="rounded-2xl overflow-hidden group">
              {/* Top gradient strip */}
              <div
                className="h-1.5 w-full"
                style={{
                  background: card.type === 'CREDIT'
                    ? 'linear-gradient(90deg, var(--destructive), var(--accent-amber))'
                    : 'linear-gradient(90deg, var(--primary), var(--accent-purple))'
                }}
              />
              <div className="glass-card rounded-b-2xl rounded-t-none border-t-0 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(var(--primary-rgb), 0.12)' }}
                  >
                    <CreditCard size={18} style={{ color: 'var(--primary)' }} />
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      background: card.type === 'CREDIT' ? 'rgba(239,68,68,0.1)' : 'rgba(var(--primary-rgb),0.1)',
                      color: card.type === 'CREDIT' ? 'var(--destructive)' : 'var(--primary)'
                    }}
                  >
                    {card.type}
                  </span>
                </div>

                <h3 className="font-bold text-base mb-0.5" style={{ color: 'var(--foreground)' }}>{card.name}</h3>
                <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>{card.owner_type}</p>

                {card.type === 'CREDIT' ? (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--muted-foreground)' }}>Outstanding</p>
                    <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--destructive)' }}>
                      {formatCurrency(card.outstanding_balance)}
                    </p>
                    <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                      Limit: {formatCurrency(card.credit_limit)}
                    </p>
                  </div>
                ) : (
                  <div className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Linked to {accounts?.find((account: any) => account.id === card.linked_account_id)?.name || "account"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
