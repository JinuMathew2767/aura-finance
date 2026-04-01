"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Car, Wrench } from "lucide-react";
import Link from "next/link";

export default function Vehicles() {
  const { data: vehicles } = useSWR("/api/vehicles", fetcher);

  return (
    <div className="space-y-6 animate-in fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Household Fleet</h1>
      
      {!vehicles ? <div className="flex justify-center p-12"><Spinner /></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {vehicles.map((v: any) => (
            <Link href={`/vehicles/${v.id}`} key={v.id}>
              <Card className="glass shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                   <div className="flex justify-between items-start mb-2">
                     <div className="p-3 bg-(--primary)/10 text-(--primary) rounded-full">
                       <Car size={24} />
                     </div>
                   </div>
                   <CardTitle className="text-2xl leading-tight">{v.year ? `${v.year} ` : ''}{v.make} {v.model}</CardTitle>
                   <CardDescription className="flex items-center gap-2 mt-2">
                     <span className="font-medium px-2 py-0.5 bg-(--secondary) rounded text-(--foreground) text-xs">Plate: {v.license_plate || 'N/A'}</span>
                     <span className="text-xs">Owner: {v.owner_type}</span>
                   </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
          {vehicles.length === 0 && <div className="p-8 col-span-full text-center text-(--muted-foreground)">No vehicles registered.</div>}
        </div>
      )}
    </div>
  );
}
