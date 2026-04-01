import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";
import { CreateCommentSchema } from "@/lib/validators";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    const { id } = await params;
    const { data, error } = await supabaseServerAdmin
      .from("transaction_comments")
      .select("*")
      .eq("transaction_id", id)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    const { id } = await params;
    const body = await req.json();
    const validatedData = CreateCommentSchema.parse(body);
    
    // Check existence first
    const { data: tx, error: checkErr } = await supabaseServerAdmin
      .from("transactions")
      .select("id")
      .eq("id", id)
      .single();
      
    if (checkErr || !tx) {
      return errorResponse("Transaction not found", 404);
    }
    
    const { data, error } = await supabaseServerAdmin
      .from("transaction_comments")
      .insert([{ transaction_id: id, user_id: userId, comment: validatedData.comment }])
      .select().single();
      
    if (error) throw error;
    return successResponse(data, 201);
  } catch (err: any) {
    return errorResponse(err.message, err.name === 'ZodError' ? 400 : 500, err.errors);
  }
}