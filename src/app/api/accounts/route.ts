import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";
import { CreateAccountSchema } from "@/lib/validators";
import { processDueLoanInstallments } from "@/lib/loan-automation";

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    try {
      await processDueLoanInstallments();
    } catch (automationError) {
      console.error("Loan EMI sync failed in /api/accounts", automationError);
    }
    const { data, error } = await supabaseServerAdmin
      .from("accounts")
      .select("*")
      // Example basic filter that could be applied if table supports user_id
      // .eq("user_id", userId) 
      .order("created_at", { ascending: false });

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
    const validatedData = CreateAccountSchema.parse(body);

    const { data, error } = await supabaseServerAdmin
      .from("accounts")
      .insert([validatedData])
      .select()
      .single();

    if (error) throw error;
    return successResponse(data, 201);
  } catch (err: any) {
    if (err.name === 'ZodError') return errorResponse("Validation error", 400, err.errors);
    return errorResponse(err.message, 500);
  }
}
