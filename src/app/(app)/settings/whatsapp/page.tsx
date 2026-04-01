"use client";
import React, { useState } from 'react';
import useSWR from "swr";
import { fetcher, fetchWithBody } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Trash2, Plus, Info } from "lucide-react";

export default function WhatsAppSettings() {
  const { data: recipients, mutate } = useSWR("/api/whatsapp-recipients", fetcher);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setSubmitting(true);
    try {
      await fetchWithBody("/api/whatsapp-recipients", "POST", { phone_number: phone });
      setPhone("");
      mutate();
    } catch(err: any) { alert(err.message); }
    finally { setSubmitting(false); }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this WhatsApp recipient?")) return;
    try {
      await fetchWithBody(`/api/whatsapp-recipients/${id}`, "DELETE", {});
      mutate();
    } catch(err: any) { alert(err.message); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3">
        <div className="bg-[#25D366] p-2 rounded-xl text-white shadow-md shadow-[#25D366]/20">
           <MessageCircle size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Reminders</h1>
          <p className="text-(--muted-foreground)">Manage authorized recipients for scheduled financial digests.</p>
        </div>
      </div>

      <div className="bg-amber-500/10 text-amber-700 dark:text-amber-400 p-4 rounded-xl text-sm flex gap-3 ring-1 ring-amber-500/30">
        <Info size={20} className="shrink-0" />
        <p><strong>Heads Up:</strong> This UI strictly configures the recipients database based on your schema. The actual automated dispatch of WhatsApp messages requires a Node.js backend cron worker (e.g. Twilio API) which operates external to this frontend PWA securely.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6">
        
        {/* ADD */}
        <Card className="glass shadow-md border-0 ring-1 ring-(--border)/50 p-6">
          <h3 className="font-semibold mb-4">Register New Device</h3>
          <form onSubmit={handleAdd} className="flex gap-3 items-end">
             <div className="space-y-1 flex-1">
                <label className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">Phone Number</label>
                <Input placeholder="+971501234567" value={phone} onChange={e=>setPhone(e.target.value)} className="bg-transparent" />
             </div>
             <Button type="submit" disabled={submitting} className="mb-px bg-[#25D366] text-white hover:bg-[#1DA851] shadow-md shadow-[#25D366]/20">
               {submitting ? <Spinner className="w-4 h-4 text-white"/> : <Plus size={18} />}
             </Button>
          </form>
        </Card>

        {/* LIST */}
        <div className="space-y-3">
          <h3 className="font-semibold px-1">Registered Numbers</h3>
          {!recipients ? <div className="flex justify-center p-8"><Spinner /></div> : (
            <div className="space-y-3">
              {recipients.map((r: any) => (
                <Card key={r.id} className="p-4 flex items-center justify-between shadow-sm bg-(--card) ring-1 ring-(--border)/30 border-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-base font-mono tracking-tight">{r.phone_number}</span>
                    <span className="text-xs font-semibold uppercase text-(--primary) mt-1 bg-(--primary)/10 w-fit px-2 py-0.5 rounded">
                       {r.is_verified ? "Verified" : "Pending Verification"}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} className="text-rose-500 hover:bg-rose-500/10">
                     <Trash2 size={18} />
                  </Button>
                </Card>
              ))}
              {recipients.length === 0 && <div className="p-8 text-center text-(--muted-foreground) border-dashed border border-(--border) rounded-2xl">No WhatsApp numbers configured.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
