-- Initial Schema for Aura Finance PWA

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACCOUNTS
CREATE TYPE owner_type_enum AS ENUM ('SELF', 'SPOUSE', 'SHARED');
CREATE TYPE account_type_enum AS ENUM ('CASH', 'BANK', 'SHARED_WALLET');

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type account_type_enum NOT NULL,
    current_balance NUMERIC(12, 2) DEFAULT 0.00,
    owner_type owner_type_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CARDS
CREATE TYPE card_type_enum AS ENUM ('DEBIT', 'CREDIT');

CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type card_type_enum NOT NULL,
    linked_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL, -- DEBIT ONLY
    credit_limit NUMERIC(12, 2) DEFAULT 0.00 CHECK (credit_limit >= 0),
    available_credit NUMERIC(12, 2) DEFAULT 0.00 CHECK (available_credit >= 0),
    outstanding_balance NUMERIC(12, 2) DEFAULT 0.00 CHECK (outstanding_balance >= 0),
    statement_day INTEGER CHECK (statement_day >= 1 AND statement_day <= 31),
    due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
    owner_type owner_type_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CATEGORIES
CREATE TYPE category_type_enum AS ENUM ('INCOME', 'EXPENSE');

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type category_type_enum NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, name)
);

-- TRANSACTIONS
CREATE TYPE transaction_type_enum AS ENUM ('EXPENSE', 'INCOME', 'CC_PAYMENT', 'TRANSFER');
CREATE TYPE payment_method_enum AS ENUM ('CASH', 'BANK', 'DEBIT_CARD', 'CREDIT_CARD');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type transaction_type_enum NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    payment_method payment_method_enum,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    owner_type owner_type_enum NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    receipt_url TEXT,
    related_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transaction_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RECURRING RULES (Templates)
CREATE TYPE frequency_enum AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

CREATE TABLE recurring_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    transaction_type transaction_type_enum NOT NULL,
    frequency frequency_enum NOT NULL, 
    interval_count INTEGER DEFAULT 1 CHECK (interval_count >= 1),
    start_date DATE NOT NULL,
    end_date DATE,
    next_run_date DATE NOT NULL,
    auto_create BOOLEAN DEFAULT FALSE,
    reminder_days_before INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    template_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BUDGETS
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    owner_type owner_type_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, month, year, owner_type)
);

-- VEHICLES & MAINTENANCE
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    license_plate TEXT,
    owner_type owner_type_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vehicle_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    cost NUMERIC(12, 2) CHECK (cost >= 0),
    service_date DATE NOT NULL,
    next_service_date DATE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LOANS
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    interest_rate NUMERIC(5, 2) CHECK (interest_rate >= 0),
    monthly_payment NUMERIC(12, 2) NOT NULL CHECK (monthly_payment >= 0),
    start_date DATE,
    end_date DATE,
    owner_type owner_type_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE loan_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    principal_amount NUMERIC(12, 2) CHECK (principal_amount >= 0),
    interest_amount NUMERIC(12, 2) CHECK (interest_amount >= 0),
    payment_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTIFICATIONS & EXPORTS
CREATE TYPE notification_type_enum AS ENUM ('IN_APP', 'WHATSAPP', 'BOTH');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type_enum NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    delivery_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE whatsapp_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, phone_number)
);

CREATE TYPE export_type_enum AS ENUM ('PDF', 'EXCEL', 'WORD');

CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type export_type_enum NOT NULL,
    status TEXT DEFAULT 'PENDING',
    file_url TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
