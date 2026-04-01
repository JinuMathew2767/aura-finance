import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";
import { UpdateMaintenanceSchema } from "@/lib/validators";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    const { id } = await params;
    const body = await req.json();
    const validatedData = UpdateMaintenanceSchema.parse(body);
    
    const { data, error } = await supabaseServerAdmin
      .from("vehicle_maintenance")
      .update(validatedData)
      .eq("id", id)
      .select().single();
      
    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message, err.name === 'ZodError' ? 400 : 500, err.errors);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    const { id } = await params;
    const { error } = await supabaseServerAdmin
      .from("vehicle_maintenance")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return successResponse({ deleted: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}