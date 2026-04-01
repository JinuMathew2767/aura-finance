import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";
import { CreateMaintenanceSchema } from "@/lib/validators";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    const { id } = await params;
    const { data, error } = await supabaseServerAdmin
      .from("vehicle_maintenance")
      .select("*")
      .eq("vehicle_id", id)
      .order("service_date", { ascending: false });
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
    const validatedData = CreateMaintenanceSchema.parse(body);
    
    const { data, error } = await supabaseServerAdmin
      .from("vehicle_maintenance")
      .insert([{ vehicle_id: id, ...validatedData }])
      .select().single();
      
    if (error) throw error;
    return successResponse(data, 201);
  } catch (err: any) {
    return errorResponse(err.message, err.name === 'ZodError' ? 400 : 500, err.errors);
  }
}