import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";
import { CreateTransactionSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    // HOUSEHOLD VISIBILITY NOTE:
    // Aura Finance is a shared-household app. We intentionally do not filter
    // queries by user_id here so that households can see shared accounts and
    // transactions. The x-user-id header is required for authenticated context.
    
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const categoryId = searchParams.get('category_id');
    const ownerType = searchParams.get('owner_type');
    const transactionType = searchParams.get('transaction_type');
    const limitParams = searchParams.get('limit');
    
    let query = supabaseServerAdmin
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (dateFrom) query = query.gte('transaction_date', dateFrom);
    if (dateTo) query = query.lte('transaction_date', dateTo);
    if (categoryId) query = query.eq('category_id', categoryId);
    if (ownerType) query = query.eq('owner_type', ownerType);
    if (transactionType) query = query.eq('transaction_type', transactionType);
    if (limitParams) query = query.limit(parseInt(limitParams, 10));

    const { data, error } = await query;
    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    const body = await req.json();
    const validatedData = CreateTransactionSchema.parse(body);

    const { data, error } = await supabaseServerAdmin
      .from("transactions")
      .insert([{ ...validatedData, created_by_user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return successResponse(data, 201);
  } catch (err: any) {
    if (err.name === 'ZodError') return errorResponse("Validation error", 400, err.errors);
    // Check if Postgres trigger raised an explicit exception (commonly trigger validations)
    if (err.message && (err.message.includes('Invalid transaction') || err.message.includes('must') || err.message.includes('requires'))) {
      return errorResponse(err.message, 400); 
    }
    return errorResponse(err.message, 500);
  }
}
