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

const emptyToUndefined = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined;
  if (typeof value === 'number' && Number.isNaN(value)) return undefined;
  return value;
};

const emptyToNull = (value: unknown) => {
  if (value === '' || value === undefined) return null;
  if (typeof value === 'number' && Number.isNaN(value)) return null;
  return value;
};

const nullableUuidSchema = z.preprocess(
  emptyToNull,
  z.string().uuid().nullable().optional()
);

const nullableStringSchema = z.preprocess(
  emptyToNull,
  z.string().nullable().optional()
);

const nullableUrlSchema = z.preprocess(
  emptyToNull,
  z.string().url().nullable().optional()
);

const optionalNonNegativeNumberSchema = z.preprocess(
  emptyToUndefined,
  z.number().min(0).optional()
);

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
  current_balance: z.preprocess(emptyToUndefined, z.number().optional().default(0)),
  owner_type: OwnerTypeSchema,
});
export const UpdateAccountSchema = CreateAccountSchema.partial();

// CARDS
export const CreateCardSchema = z.object({
  name: z.string().min(1),
  type: CardTypeSchema,
  linked_account_id: nullableUuidSchema,
  credit_limit: z.preprocess(emptyToUndefined, z.number().min(0).optional().default(0)),
  statement_day: z.preprocess(emptyToNull, z.number().min(1).max(31).nullable().optional()),
  due_day: z.preprocess(emptyToNull, z.number().min(1).max(31).nullable().optional()),
  owner_type: OwnerTypeSchema,
});
export const UpdateCardSchema = CreateCardSchema.partial();

// TRANSACTIONS
export const CreateTransactionSchema = z.object({
  transaction_type: TransactionTypeSchema,
  title: z.string().min(1),
  description: nullableStringSchema,
  amount: z.number().min(0.01),
  transaction_date: DateTimeInputSchema,
  category_id: nullableUuidSchema,
  subcategory_id: nullableUuidSchema,
  payment_method: PaymentMethodSchema.optional().nullable(),
  account_id: nullableUuidSchema,
  card_id: nullableUuidSchema,
  owner_type: OwnerTypeSchema,
  is_recurring: z.boolean().optional().default(false),
  receipt_url: nullableUrlSchema,
  related_transaction_id: nullableUuidSchema
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
  year: z.preprocess(emptyToNull, z.number().nullable().optional()),
  license_plate: nullableStringSchema,
  owner_type: OwnerTypeSchema,
});
export const UpdateVehicleSchema = CreateVehicleSchema.partial();

// VEHICLE MAINTENANCE
export const CreateMaintenanceSchema = z.object({
  description: z.string().min(1),
  cost: optionalNonNegativeNumberSchema,
  service_date: z.string(),
  next_service_date: nullableStringSchema,
  reminder_sent: z.boolean().optional().default(false),
});
export const UpdateMaintenanceSchema = CreateMaintenanceSchema.partial();

// LOANS
export const CreateLoanSchema = z.object({
  vehicle_id: nullableUuidSchema,
  name: z.string().min(1),
  total_amount: z.number().min(0),
  interest_rate: optionalNonNegativeNumberSchema,
  monthly_payment: z.number().min(0),
  start_date: nullableStringSchema,
  end_date: nullableStringSchema,
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
  end_date: nullableStringSchema,
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
