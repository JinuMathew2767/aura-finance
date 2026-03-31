-- Migration: Seed Data for Aura Finance

-- 1. Insert 2 Users
INSERT INTO users (id, name, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'John Doe', 'ADMIN'),
('22222222-2222-2222-2222-222222222222', 'Jane Doe', 'USER')
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
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Salary', 'INCOME', 'briefcase')
ON CONFLICT DO NOTHING;

-- 5. Insert Subcategories
INSERT INTO subcategories (category_id, name) VALUES 
('88888888-8888-8888-8888-888888888888', 'Rent'),
('88888888-8888-8888-8888-888888888888', 'Utilities'),
('99999999-9999-9999-9999-999999999999', 'Fuel'),
('aaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Monthly Salary')
ON CONFLICT DO NOTHING;
