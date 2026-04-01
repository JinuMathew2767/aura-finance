"use client";
import useSWR from "swr";
import { fetcher, fetchWithBody } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Bell, BellDot, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Notifications() {
  const { data, mutate } = useSWR("/api/notifications", fetcher);

  const markAsRead = async (id: string) => {
    try {
      await fetchWithBody(`/api/notifications/${id}/read`, "PUT", {});
      mutate();
    } catch(err: any) { alert(err.message); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Activity Alerts</h1>
      </div>
      
      {!data ? <div className="flex justify-center p-12"><Spinner /></div> : (
        <div className="space-y-4">
          {data.map((note: any) => (
            <Card key={note.id} className={`transition-all border-l-4 ${note.is_read ? 'border-l-(--border) opacity-80' : 'border-l-(--primary) shadow-md bg-(--card)'}`}>
               <div className="flex items-start justify-between p-5">
                 <div className="flex gap-4 items-start">
                   <div className={`mt-1 ${note.is_read ? 'text-(--muted-foreground)' : 'text-(--primary)'}`}>
                     {note.is_read ? <Bell size={20} /> : <BellDot size={20} className="animate-pulse" />}
                   </div>
                   <div>
                     <h4 className={`text-base ${note.is_read ? 'font-medium' : 'font-bold'}`}>{note.message}</h4>
                     <p className="text-xs text-(--muted-foreground) mt-1 uppercase font-semibold">
                       {formatDistanceToNow(new Date(note.created_at), {addSuffix: true})} &bull; {note.type}
                     </p>
                   </div>
                 </div>
                 
                 {!note.is_read && (
                   <Button variant="ghost" size="icon" onClick={() => markAsRead(note.id)} className="text-(--muted-foreground) hover:text-emerald-500" title="Mark Read">
                     <CheckCircle2 size={24} />
                   </Button>
                 )}
               </div>
            </Card>
          ))}
          {data.length === 0 && <div className="p-12 text-center text-(--muted-foreground) border rounded-xl bg-(--card)">No notifications available.</div>}
        </div>
      )}
    </div>
  );
}
