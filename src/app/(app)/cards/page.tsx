"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CreditCard } from "lucide-react";

export default function Cards() {
  const { data, error } = useSWR("/api/cards", fetcher);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Cards</h1>
      {!data ? <div className="flex justify-center p-12"><Spinner /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((card: any) => (
            <Card key={card.id} className="overflow-hidden shadow-md">
              <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardHeader>
                 <div className="flex items-center justify-between mb-4">
                    <CreditCard size={24} className="text-(--primary)" />
                    <span className="text-xs font-semibold px-2 py-1 bg-(--primary)/10 text-(--primary) rounded-full">{card.type}</span>
                 </div>
                 <CardTitle className="text-xl leading-tight">{card.name}</CardTitle>
                 <CardDescription>{card.owner_type}</CardDescription>
                 
                 {card.type === 'CREDIT' ? (
                   <div className="mt-6">
                     <p className="text-sm text-(--muted-foreground) mb-1">Outstanding</p>
                     <div className="font-bold text-2xl text-rose-600">{formatCurrency(card.outstanding_balance)}</div>
                     <p className="text-xs text-(--muted-foreground) mt-2">Limit: {formatCurrency(card.credit_limit)}</p>
                   </div>
                 ) : (
                   <div className="mt-6 text-sm text-(--muted-foreground)">
                      Linked Account binding active.
                   </div>
                 )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
