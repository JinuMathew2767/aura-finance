"use client";
import { use } from "react";
import useSWR from "swr";
import { fetcher, fetchWithBody } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function TransactionDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { data: tx, mutate: mutateTx } = useSWR(`/api/transactions/${id}`, fetcher);
  const { data: comments, mutate: mutateComments } = useSWR(`/api/transactions/${id}/comments`, fetcher);
  
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await fetchWithBody(`/api/transactions/${id}/comments`, "POST", { comment: commentText });
      setCommentText("");
      mutateComments();
    } catch (err: any) {
      alert("Failed to post comment: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!tx) return <div className="p-12 flex justify-center"><Spinner /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/transactions" className="inline-flex items-center text-sm font-medium text-(--primary) hover:underline mb-2">
         <ArrowLeft size={16} className="mr-1" /> Back
      </Link>
      
      <Card className="shadow-lg border-0 glass overflow-hidden">
        <div className={`h-3 w-full ${tx.transaction_type === "INCOME" ? "bg-emerald-500" : "bg-rose-500"}`}></div>
        <CardHeader>
           <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold mb-1">{tx.title}</CardTitle>
                <CardDescription className="text-base">{formatDate(tx.transaction_date)} &bull; {tx.payment_method || 'Unknown'}</CardDescription>
              </div>
              <div className={`text-3xl font-bold tracking-tight ${tx.transaction_type === "INCOME" ? "text-emerald-500" : "text-(--foreground)"}`}>
                 {tx.transaction_type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
              </div>
           </div>
        </CardHeader>
        <CardContent className="bg-(--muted)/30 rounded-xl m-6 mt-0 p-4 border border-(--border)/50">
           <div className="grid grid-cols-2 gap-y-4 text-sm">
             <div><span className="text-(--muted-foreground) block">Type</span> <span className="font-medium">{tx.transaction_type}</span></div>
             <div><span className="text-(--muted-foreground) block">Owner</span> <span className="font-medium">{tx.owner_type}</span></div>
             {tx.description && <div className="col-span-2"><span className="text-(--muted-foreground) block">Notes</span> <span className="font-medium">{tx.description}</span></div>}
           </div>
        </CardContent>
      </Card>

      <div className="pt-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><MessageSquare size={18} /> Remarks & Info</h3>
        
        <div className="space-y-4">
          {comments?.map((c: any) => (
             <div key={c.id} className="bg-(--card) border border-(--border) p-4 rounded-2xl shadow-sm text-sm">
                <div className="font-medium text-(--foreground) mb-1">{c.comment}</div>
                <div className="text-xs text-(--muted-foreground)">{formatDate(c.created_at)}</div>
             </div>
          ))}
          {comments?.length === 0 && <p className="text-(--muted-foreground) text-sm italic">No comments yet</p>}
        </div>

        <form onSubmit={handlePostComment} className="mt-6 flex items-center gap-3">
           <Input 
             value={commentText} 
             onChange={(e) => setCommentText(e.target.value)} 
             placeholder="Add an update or note..." 
             className="flex-1 bg-(--card)"
           />
           <Button type="submit" disabled={submitting || !commentText.trim()}>Post</Button>
        </form>
      </div>
    </div>
  );
}
