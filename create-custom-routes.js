const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'src', 'app', 'api');

function writeRoute(routePath, content) {
  const fullPath = path.join(apiDir, routePath, 'route.ts');
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content);
}

// 1. Transactions Comments
writeRoute('transactions/[id]/comments', `import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";
import { CreateCommentSchema } from "@/lib/validators";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    const { id } = await params;
    const { data, error } = await supabaseServerAdmin
      .from("transaction_comments")
      .select("*")
      .eq("transaction_id", id)
      .order("created_at", { ascending: true });
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
    const validatedData = CreateCommentSchema.parse(body);
    
    const { data, error } = await supabaseServerAdmin
      .from("transaction_comments")
      .insert([{ transaction_id: id, user_id: userId, comment: validatedData.comment }])
      .select().single();
      
    if (error) throw error;
    return successResponse(data, 201);
  } catch (err: any) {
    return errorResponse(err.message, err.name === 'ZodError' ? 400 : 500, err.errors);
  }
}`);

// 2. Vehicle Maintenance Nested
writeRoute('vehicles/[id]/maintenance', `import { NextRequest } from "next/server";
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
}`);

// 3. Maintenance Item
writeRoute('maintenance/[id]', `import { NextRequest } from "next/server";
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
}`);

// Notifications
writeRoute('notifications', `import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    const { data, error } = await supabaseServerAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}`);

// Notifications Read
writeRoute('notifications/[id]/read', `import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    const { id } = await params;
    const { data, error } = await supabaseServerAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", userId)
      .select().single();
    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}`);

// WhatsApp Recipients
writeRoute('whatsapp-recipients', `import { NextRequest } from "next/server";
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
}`);

writeRoute('whatsapp-recipients/[id]', `import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    const { id } = await params;
    const { error } = await supabaseServerAdmin
      .from("whatsapp_recipients")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
    return successResponse({ deleted: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}`);

// Exports
writeRoute('exports', `import { NextRequest } from "next/server";
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
}`);

console.log("Custom routes generated successfully.");
