import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    const { data, error } = await supabaseServerAdmin
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
      
    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
