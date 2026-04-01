-- Enhance loans with live-finance fields and EMI automation support

ALTER TABLE loans
ADD COLUMN IF NOT EXISTS total_profit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_profit_amount >= 0),
ADD COLUMN IF NOT EXISTS amount_paid_to_date NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (amount_paid_to_date >= 0),
ADD COLUMN IF NOT EXISTS principal_paid_to_date NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (principal_paid_to_date >= 0),
ADD COLUMN IF NOT EXISTS profit_paid_to_date NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (profit_paid_to_date >= 0),
ADD COLUMN IF NOT EXISTS payment_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS next_payment_date DATE,
ADD COLUMN IF NOT EXISTS auto_create_emi BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE loan_payments
ADD COLUMN IF NOT EXISTS auto_created BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'loan_payments_loan_id_payment_date_key'
    ) THEN
        ALTER TABLE loan_payments
        ADD CONSTRAINT loan_payments_loan_id_payment_date_key UNIQUE (loan_id, payment_date);
    END IF;
END $$;
