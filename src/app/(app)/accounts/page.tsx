"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Wallet } from "lucide-react";

export default function Accounts() {
  const { data, error } = useSWR("/api/accounts", fetcher);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
      {!data ? <div className="flex justify-center p-12"><Spinner /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((acc: any) => (
            <Card key={acc.id} className="glass shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                 <div className="flexitems-center gap-2 mb-2 text-(--primary)">
                    <Wallet size={20} />
                 </div>
                 <CardTitle className="text-xl">{acc.name}</CardTitle>
                 <CardDescription>{acc.type} &bull; {acc.owner_type}</CardDescription>
                 <div className="mt-4 font-bold text-2xl tracking-tight text-(--foreground)">
                   {formatCurrency(acc.current_balance)}
                 </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
