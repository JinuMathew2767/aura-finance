import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";
import { UpdateAccountSchema } from "@/lib/validators";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    const { id } = await params;

    const { data, error } = await supabaseServerAdmin
      .from("accounts")
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
    const validatedData = UpdateAccountSchema.parse(body);

    const { data, error } = await supabaseServerAdmin
      .from("accounts")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    if (err.name === 'ZodError') return errorResponse("Validation error", 400, err.errors);
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    const { id } = await params;

    const { error } = await supabaseServerAdmin
      .from("accounts")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return successResponse({ deleted: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
