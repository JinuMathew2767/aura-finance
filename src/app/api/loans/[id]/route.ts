import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";
import { UpdateLoanSchema } from "@/lib/validators";
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    try {
      await processDueLoanInstallments();
    } catch (automationError) {
      console.error("Loan EMI sync failed in /api/loans/[id]", automationError);
    }
    const { id } = await params;

    const { data, error } = await supabaseServerAdmin
      .from("loans")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return errorResponse("Not found", 404);
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    const { id } = await params;
    const body = await req.json();
    const validatedData = UpdateLoanSchema.parse(body);

    const { data, error } = await supabaseServerAdmin
      .from("loans")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    if (err.name === 'ZodError') return errorResponse("Validation error", 400, err.errors);
    if (err.message && isLoanUpgradeMissing(err.message)) {
      return errorResponse("Loan upgrade SQL is not applied yet. Run the latest Supabase migration for EMI tracking first.", 500);
    }
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    const { id } = await params;

    const { error } = await supabaseServerAdmin
      .from("loans")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return successResponse({ deleted: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
