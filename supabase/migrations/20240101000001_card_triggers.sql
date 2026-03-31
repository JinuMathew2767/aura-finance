-- Migration: Financial Math Triggers for Aura Finance

CREATE OR REPLACE FUNCTION process_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. EXPENSE via CARD
    IF NEW.transaction_type = 'EXPENSE' AND NEW.card_id IS NOT NULL THEN
        
        -- A. DEBIT CARD EXPENSE
        IF EXISTS (SELECT 1 FROM cards WHERE id = NEW.card_id AND type = 'DEBIT') THEN
            UPDATE accounts 
            SET current_balance = current_balance - NEW.amount
            WHERE id = (SELECT linked_account_id FROM cards WHERE id = NEW.card_id);
            
            -- Keep account_id in sync if not already provided
            IF NEW.account_id IS NULL THEN
                NEW.account_id := (SELECT linked_account_id FROM cards WHERE id = NEW.card_id);
            END IF;
        
        -- B. CREDIT CARD EXPENSE
        ELSIF EXISTS (SELECT 1 FROM cards WHERE id = NEW.card_id AND type = 'CREDIT') THEN
            UPDATE cards 
            SET outstanding_balance = outstanding_balance + NEW.amount,
                available_credit = available_credit - NEW.amount
            WHERE id = NEW.card_id;
        END IF;

    -- 2. EXPENSE via direct ACCOUNT
    ELSIF NEW.transaction_type = 'EXPENSE' AND NEW.account_id IS NOT NULL THEN
        UPDATE accounts 
        SET current_balance = current_balance - NEW.amount
        WHERE id = NEW.account_id;

    -- 3. INCOME
    ELSIF NEW.transaction_type = 'INCOME' AND NEW.account_id IS NOT NULL THEN
        UPDATE accounts 
        SET current_balance = current_balance + NEW.amount
        WHERE id = NEW.account_id;

    -- 4. CREDIT CARD BILL PAYMENT
    ELSIF NEW.transaction_type = 'CC_PAYMENT' THEN
        -- Decrease bank balance
        IF NEW.account_id IS NOT NULL THEN
            UPDATE accounts 
            SET current_balance = current_balance - NEW.amount
            WHERE id = NEW.account_id;
        END IF;
        
        -- Decrease credit card debt, restore available limit
        IF NEW.card_id IS NOT NULL THEN
            UPDATE cards 
            SET outstanding_balance = outstanding_balance - NEW.amount,
                available_credit = available_credit + NEW.amount
            WHERE id = NEW.card_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_trigger
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION process_transaction();
