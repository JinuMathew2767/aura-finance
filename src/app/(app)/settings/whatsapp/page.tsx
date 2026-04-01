"use client";
import React, { useState } from 'react';
import useSWR from "swr";
import { fetcher, fetchWithBody } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Trash2, Plus, Info, Shield } from "lucide-react";

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
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this WhatsApp recipient?")) return;
    try {
      await fetchWithBody(`/api/whatsapp-recipients/${id}`, "DELETE", {});
      mutate();
    } catch(err: any) { alert(err.message); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 8px 30px rgba(37,211,102,0.25)' }}
        >
          <MessageCircle size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">WhatsApp Reminders</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Manage recipients for scheduled financial digests.</p>
        </div>
      </div>

      {/* Info banner */}
      <div
        className="flex gap-3 p-4 rounded-xl text-sm"
        style={{
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          color: 'var(--accent-amber)'
        }}
      >
        <Info size={18} className="shrink-0 mt-0.5" />
        <p><strong>Note:</strong> This UI configures recipients in the database. Actual dispatch requires an external cron worker (e.g. Twilio API).</p>
      </div>

      {/* Add Form */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} style={{ color: 'var(--primary)' }} />
          <h3 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>Register New Device</h3>
        </div>
        <form onSubmit={handleAdd} className="flex gap-3 items-end">
          <div className="space-y-1.5 flex-1">
            <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Phone Number</label>
            <Input placeholder="+971501234567" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <Button type="submit" disabled={submitting} className="h-11 px-5 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 4px 14px rgba(37,211,102,0.3)' }}
          >
            {submitting ? <Spinner className="w-4 h-4 text-white" /> : <Plus size={18} />}
          </Button>
        </form>
      </Card>

      {/* List */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm px-1" style={{ color: 'var(--foreground)' }}>Registered Numbers</h3>
        {!recipients ? <div className="flex justify-center p-8"><Spinner /></div> : (
          <div className="space-y-3 stagger-children">
            {recipients.map((r: any) => (
              <Card key={r.id} className="p-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-sm font-mono tracking-tight" style={{ color: 'var(--foreground)' }}>{r.phone_number}</span>
                  <span
                    className="text-[10px] font-bold uppercase mt-1 w-fit px-2 py-0.5 rounded-full"
                    style={{
                      background: r.is_verified ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: r.is_verified ? 'var(--success)' : 'var(--accent-amber)'
                    }}
                  >
                    {r.is_verified ? "Verified" : "Pending Verification"}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}
                  className="hover:bg-red-500/10"
                  style={{ color: 'var(--destructive)' }}
                >
                  <Trash2 size={16} />
                </Button>
              </Card>
            ))}
            {recipients.length === 0 && (
              <div className="glass-card rounded-2xl p-10 text-center">
                <div className="h-12 w-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <MessageCircle size={20} style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>No WhatsApp numbers configured.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
