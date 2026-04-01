-- Migration: Seed Data for Aura Finance

-- 1. Insert 2 Users
INSERT INTO users (id, name) VALUES 
('11111111-1111-1111-1111-111111111111', 'John Doe'),
('22222222-2222-2222-2222-222222222222', 'Jane Doe')
ON CONFLICT DO NOTHING;

-- 2. Insert Basic Accounts
INSERT INTO accounts (id, name, type, current_balance, owner_type) VALUES 
('33333333-3333-3333-3333-333333333333', 'Joint Bank Account', 'BANK', 50000.00, 'SHARED'),
('44444444-4444-4444-4444-444444444444', 'John Personal Savings', 'BANK', 10000.00, 'SELF'),
('55555555-5555-5555-5555-555555555555', 'Jane Cash Wallet', 'CASH', 500.00, 'SPOUSE')
ON CONFLICT DO NOTHING;

-- 3. Insert Basic Cards
INSERT INTO cards (id, name, type, linked_account_id, credit_limit, available_credit, outstanding_balance, statement_day, due_day, owner_type) VALUES 
('66666666-6666-6666-6666-666666666666', 'John Debit Card', 'DEBIT', '44444444-4444-4444-4444-444444444444', 0, 0, 0, NULL, NULL, 'SELF'),
('77777777-7777-7777-7777-777777777777', 'Joint Credit Card', 'CREDIT', NULL, 20000.00, 20000.00, 0, 1, 25, 'SHARED')
ON CONFLICT DO NOTHING;

-- 4. Insert Default Categories
INSERT INTO categories (id, name, type, icon) VALUES 
('88888888-8888-8888-8888-888888888888', 'Housing', 'EXPENSE', 'home'),
('99999999-9999-9999-9999-999999999999', 'Transportation', 'EXPENSE', 'car'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Salary', 'INCOME', 'briefcase'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Food', 'EXPENSE', 'utensils'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Personal', 'EXPENSE', 'user')
ON CONFLICT DO NOTHING;

-- 5. Insert Subcategories
INSERT INTO subcategories (id, category_id, name) VALUES 
('dddddddd-dddd-dddd-dddd-dddddddddddd', '88888888-8888-8888-8888-888888888888', 'Rent'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '88888888-8888-8888-8888-888888888888', 'Bills'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '99999999-9999-9999-9999-999999999999', 'Fuel'),
('00000000-0000-0000-0000-000000000001', '99999999-9999-9999-9999-999999999999', 'Car Loan'),
('00000000-0000-0000-0000-000000000002', '99999999-9999-9999-9999-999999999999', 'Car Maintenance'),
('00000000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Monthly Salary'),
('00000000-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Groceries'),
('00000000-0000-0000-0000-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Dining'),
('00000000-0000-0000-0000-000000000006', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Shopping')
ON CONFLICT DO NOTHING;

-- 6. Insert Sample Budget
INSERT INTO budgets (id, category_id, amount, month, year, owner_type) VALUES
('00000000-0000-0000-0000-000000000010', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2000.00, 10, 2023, 'SHARED')
ON CONFLICT DO NOTHING;

-- 7. Insert Sample Vehicle
INSERT INTO vehicles (id, make, model, year, license_plate, owner_type) VALUES
('00000000-0000-0000-0000-000000000011', 'Toyota', 'Camry', 2022, 'ABC-123', 'SHARED')
ON CONFLICT DO NOTHING;

-- 8. Insert Sample Loan
INSERT INTO loans (id, vehicle_id, name, total_amount, interest_rate, monthly_payment, start_date, end_date, owner_type) VALUES
('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000011', 'Toyota Auto Loan', 60000.00, 4.5, 1200.00, '2023-01-01', '2027-01-01', 'SHARED')
ON CONFLICT DO NOTHING;

-- 9. Insert Sample Recurring Rule
INSERT INTO recurring_rules (id, title, transaction_type, frequency, interval_count, start_date, next_run_date, auto_create, is_active) VALUES
('00000000-0000-0000-0000-000000000013', 'Monthly Salary Deposit', 'INCOME', 'MONTHLY', 1, '2023-01-01', '2023-11-01', TRUE, TRUE)
ON CONFLICT DO NOTHING;
