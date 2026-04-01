import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";
import { CreateRecurringRuleSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    const { data, error } = await supabaseServerAdmin
      .from("recurring_rules")
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
    const validatedData = CreateRecurringRuleSchema.parse(body);

    const { data, error } = await supabaseServerAdmin
      .from("recurring_rules")
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
