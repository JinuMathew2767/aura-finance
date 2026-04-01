import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category_id");
    
    let query = supabaseServerAdmin
      .from("subcategories")
      .select("*")
      .order("name", { ascending: true });
      
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
      
    const { data, error } = await query;
      
    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
