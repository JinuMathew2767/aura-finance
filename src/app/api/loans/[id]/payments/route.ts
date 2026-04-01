import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    const { id } = await params;
    const { data, error } = await supabaseServerAdmin
      .from("loan_payments")
      .select("*, transactions:transaction_id(title, amount)")
      .eq("loan_id", id)
      .order("payment_date", { ascending: false });
      
    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
