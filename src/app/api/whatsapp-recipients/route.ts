import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";
import { CreateWhatsappRecipientSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    const { data, error } = await supabaseServerAdmin
      .from("whatsapp_recipients")
      .select("*")
      .eq("user_id", userId);
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
    const validatedData = CreateWhatsappRecipientSchema.parse(body);
    const { data, error } = await supabaseServerAdmin
      .from("whatsapp_recipients")
      .insert([{ user_id: userId, ...validatedData }])
      .select().single();
    if (error) throw error;
    return successResponse(data, 201);
  } catch (err: any) {
    return errorResponse(err.message, err.name === 'ZodError' ? 400 : 500, err.errors);
  }
}