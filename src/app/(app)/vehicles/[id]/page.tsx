"use client";
import { use } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Car, PenTool, Wrench } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VehicleDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params).id;
  const { data: vehicle } = useSWR(`/api/vehicles/${id}`, fetcher);
  const { data: maintenance } = useSWR(`/api/vehicles/${id}/maintenance`, fetcher);

  if (!vehicle) return <div className="p-12 flex justify-center"><Spinner /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <Link href="/vehicles" className="inline-flex items-center text-sm font-medium text-(--primary) hover:underline mb-2">
         <ArrowLeft size={16} className="mr-1" /> Back to Vehicles
      </Link>
      
      <Card className="glass border-0 ring-1 ring-(--border)/50 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Car size={140} />
        </div>
        <CardHeader className="pb-6">
           <CardDescription>Vehicle Profile</CardDescription>
           <CardTitle className="text-4xl font-bold">{vehicle.year ? `${vehicle.year} ` : ''}{vehicle.make} {vehicle.model}</CardTitle>
           <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 bg-(--secondary) border border-(--border) rounded-full font-mono text-xs">{vehicle.license_plate || 'UNREGISTERED'}</span>
           </div>
        </CardHeader>
      </Card>

      <div className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2"><PenTool size={20} /> Service Log</h3>
          <Button size="sm" className="rounded-full shadow-md gap-2"><PenTool size={14}/> Log Service</Button>
        </div>
        
        {!maintenance ? <Spinner className="ml-2" /> : maintenance.length === 0 ? (
          <div className="p-10 border border-dashed border-(--border) rounded-2xl bg-(--card)/50 text-center">
             <PenTool size={32} className="text-(--muted-foreground) mb-3 opacity-50 mx-auto" />
             <p className="text-(--muted-foreground) font-medium">No maintenance logs found.</p>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-(--border) before:to-transparent">
            {maintenance.map((m: any, idx: number) => {
              const overdue = m.next_service_date && new Date(m.next_service_date) < new Date();
              return (
                <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-(--background) ${overdue ? 'bg-rose-500 text-white' : 'bg-(--card) text-(--primary) shadow-sm ring-1 ring-(--border)'} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                     <Wrench size={16} />
                  </div>
                  
                  <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm">{formatDate(m.service_date)}</span>
                        {m.cost && <span className="font-bold text-(--foreground)">{formatCurrency(m.cost)}</span>}
                      </div>
                      <CardTitle className="text-base leading-tight mt-1">{m.description}</CardTitle>
                      {m.next_service_date && (
                        <div className={`mt-3 text-xs font-semibold px-2 py-1 inline-flex rounded ${overdue ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-600'}`}>
                           Next Due: {formatDate(m.next_service_date)}
                        </div>
                      )}
                    </CardHeader>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
