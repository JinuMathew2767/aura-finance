import { z } from 'zod';

// Shared Enums
export const OwnerTypeSchema = z.enum(['SELF', 'SPOUSE', 'SHARED']);
export const AccountTypeSchema = z.enum(['CASH', 'BANK', 'SHARED_WALLET']);
export const CardTypeSchema = z.enum(['DEBIT', 'CREDIT']);
export const CategoryTypeSchema = z.enum(['INCOME', 'EXPENSE']);
export const TransactionTypeSchema = z.enum(['EXPENSE', 'INCOME', 'CC_PAYMENT', 'TRANSFER']);
export const PaymentMethodSchema = z.enum(['CASH', 'BANK', 'DEBIT_CARD', 'CREDIT_CARD']);
export const FrequencySchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);
export const NotificationTypeSchema = z.enum(['IN_APP', 'WHATSAPP', 'BOTH']);
export const ExportTypeSchema = z.enum(['PDF', 'EXCEL', 'WORD']);

const DateTimeInputSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: 'Invalid date',
  })
  .transform((value) => new Date(value).toISOString());

// ACCOUNTS
export const CreateAccountSchema = z.object({
  name: z.string().min(1),
  type: AccountTypeSchema,
  current_balance: z.number().optional().default(0),
  owner_type: OwnerTypeSchema,
});
export const UpdateAccountSchema = CreateAccountSchema.partial();

// CARDS
export const CreateCardSchema = z.object({
  name: z.string().min(1),
  type: CardTypeSchema,
  linked_account_id: z.string().uuid().optional().nullable(),
  credit_limit: z.number().min(0).optional().default(0),
  statement_day: z.number().min(1).max(31).optional().nullable(),
  due_day: z.number().min(1).max(31).optional().nullable(),
  owner_type: OwnerTypeSchema,
});
export const UpdateCardSchema = CreateCardSchema.partial();

// TRANSACTIONS
export const CreateTransactionSchema = z.object({
  transaction_type: TransactionTypeSchema,
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  amount: z.number().min(0.01),
  transaction_date: DateTimeInputSchema,
  category_id: z.string().uuid().optional().nullable(),
  subcategory_id: z.string().uuid().optional().nullable(),
  payment_method: PaymentMethodSchema.optional().nullable(),
  account_id: z.string().uuid().optional().nullable(),
  card_id: z.string().uuid().optional().nullable(),
  owner_type: OwnerTypeSchema,
  is_recurring: z.boolean().optional().default(false),
  receipt_url: z.string().url().optional().nullable(),
  related_transaction_id: z.string().uuid().optional().nullable()
});
export const UpdateTransactionSchema = CreateTransactionSchema.partial();

// COMMENTS
export const CreateCommentSchema = z.object({
  comment: z.string().min(1)
});

// BUDGETS
export const CreateBudgetSchema = z.object({
  category_id: z.string().uuid(),
  amount: z.number().min(0),
  month: z.number().min(1).max(12),
  year: z.number(),
  owner_type: OwnerTypeSchema,
});
export const UpdateBudgetSchema = CreateBudgetSchema.partial();

// VEHICLES
export const CreateVehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().optional().nullable(),
  license_plate: z.string().optional().nullable(),
  owner_type: OwnerTypeSchema,
});
export const UpdateVehicleSchema = CreateVehicleSchema.partial();

// VEHICLE MAINTENANCE
export const CreateMaintenanceSchema = z.object({
  description: z.string().min(1),
  cost: z.number().min(0).optional(),
  service_date: z.string(),
  next_service_date: z.string().optional().nullable(),
  reminder_sent: z.boolean().optional().default(false),
});
export const UpdateMaintenanceSchema = CreateMaintenanceSchema.partial();

// LOANS
export const CreateLoanSchema = z.object({
  vehicle_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1),
  total_amount: z.number().min(0),
  interest_rate: z.number().min(0).optional(),
  monthly_payment: z.number().min(0),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  owner_type: OwnerTypeSchema,
});
export const UpdateLoanSchema = CreateLoanSchema.partial();

// RECURRING RULES
export const CreateRecurringRuleSchema = z.object({
  title: z.string().min(1),
  transaction_type: TransactionTypeSchema,
  frequency: FrequencySchema,
  interval_count: z.number().min(1).optional().default(1),
  start_date: z.string(),
  end_date: z.string().optional().nullable(),
  next_run_date: z.string(),
  auto_create: z.boolean().optional().default(false),
  reminder_days_before: z.number().optional().default(0),
  is_active: z.boolean().optional().default(true),
  template_json: z.record(z.string(), z.any()).optional().nullable(),
});
export const UpdateRecurringRuleSchema = CreateRecurringRuleSchema.partial();

// WHATSAPP
export const CreateWhatsappRecipientSchema = z.object({
  phone_number: z.string().min(1),
});

// EXPORTS
export const CreateExportSchema = z.object({
  type: ExportTypeSchema,
});
