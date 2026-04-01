const fs = require('fs');
const path = require('path');

const resources = [
  { name: 'accounts', schemaPrefix: 'Account', table: 'accounts' },
  { name: 'cards', schemaPrefix: 'Card', table: 'cards' },
  { name: 'transactions', schemaPrefix: 'Transaction', table: 'transactions' },
  { name: 'budgets', schemaPrefix: 'Budget', table: 'budgets' },
  { name: 'vehicles', schemaPrefix: 'Vehicle', table: 'vehicles' },
  { name: 'loans', schemaPrefix: 'Loan', table: 'loans' },
  { name: 'recurring-rules', schemaPrefix: 'RecurringRule', table: 'recurring_rules' },
];

const apiDir = path.join(__dirname, 'src', 'app', 'api');

function createCollectionRoute(res) {
  const content = `import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";
import { Create${res.schemaPrefix}Schema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    const { data, error } = await supabaseServerAdmin
      .from("${res.table}")
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
    const validatedData = Create${res.schemaPrefix}Schema.parse(body);

    const { data, error } = await supabaseServerAdmin
      .from("${res.table}")
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
`;
  return content;
}

function createItemRoute(res) {
  const content = `import { NextRequest } from "next/server";
import { supabaseServerAdmin } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/auth-server";
import { Update${res.schemaPrefix}Schema } from "@/lib/validators";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = requireUserId(req);
    const { id } = await params;

    const { data, error } = await supabaseServerAdmin
      .from("${res.table}")
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
    const validatedData = Update${res.schemaPrefix}Schema.parse(body);

    const { data, error } = await supabaseServerAdmin
      .from("${res.table}")
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
      .from("${res.table}")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return successResponse({ deleted: true });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
`;
  return content;
}

for (const res of resources) {
  const resDir = path.join(apiDir, res.name);
  const itemDir = path.join(resDir, '[id]');
  
  if (!fs.existsSync(resDir)) fs.mkdirSync(resDir, { recursive: true });
  if (!fs.existsSync(itemDir)) fs.mkdirSync(itemDir, { recursive: true });

  fs.writeFileSync(path.join(resDir, 'route.ts'), createCollectionRoute(res));
  fs.writeFileSync(path.join(itemDir, 'route.ts'), createItemRoute(res));
}

console.log('Main routes generated.');
