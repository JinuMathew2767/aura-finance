import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";
import { CreateLoanSchema } from "@/lib/validators";
import { processDueLoanInstallments } from "@/lib/loan-automation";

function isLoanUpgradeMissing(message: string) {
  return [
    "total_profit_amount",
    "amount_paid_to_date",
    "principal_paid_to_date",
    "profit_paid_to_date",
    "payment_account_id",
    "next_payment_date",
    "auto_create_emi",
  ].some((column) => message.includes(column));
}

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    try {
      await processDueLoanInstallments();
    } catch (automationError) {
      console.error("Loan EMI sync failed in /api/loans", automationError);
    }
    const { data, error } = await supabaseServerAdmin
      .from("loans")
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
    const validatedData = CreateLoanSchema.parse(body);

    const { data, error } = await supabaseServerAdmin
      .from("loans")
      .insert([validatedData])
      .select()
      .single();

    if (error) throw error;
    return successResponse(data, 201);
  } catch (err: any) {
    if (err.name === 'ZodError') return errorResponse("Validation error", 400, err.errors);
    if (err.message && isLoanUpgradeMissing(err.message)) {
      return errorResponse("Loan upgrade SQL is not applied yet. Run the latest Supabase migration for EMI tracking first.", 500);
    }
    return errorResponse(err.message, 500);
  }
}
