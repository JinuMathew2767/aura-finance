import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";
import { CreateExportSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    const { data, error } = await supabaseServerAdmin
      .from("exports")
      .select("*")
      .eq("user_id", userId)
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
    const validatedData = CreateExportSchema.parse(body);
    const { data, error } = await supabaseServerAdmin
      .from("exports")
      .insert([{ user_id: userId, type: validatedData.type, status: 'PENDING' }])
      .select().single();
    if (error) throw error;
    return successResponse(data, 201);
  } catch (err: any) {
    return errorResponse(err.message, err.name === 'ZodError' ? 400 : 500, err.errors);
  }
}