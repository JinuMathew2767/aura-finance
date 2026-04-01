-- Migration: Financial Math Triggers for Aura Finance

CREATE OR REPLACE FUNCTION process_transaction()
RETURNS TRIGGER AS $$
DECLARE
    card_type_val TEXT;
    linked_acc_id UUID;
    acc_type_val TEXT;
    chk_avail NUMERIC;
    chk_limit NUMERIC;
    chk_out NUMERIC;
    c_id UUID;
BEGIN
    -- 1. REVERSE OLD EFFECTS (IF UPDATE OR DELETE)
    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        IF OLD.transaction_type = 'EXPENSE' AND OLD.card_id IS NOT NULL THEN
            SELECT type INTO card_type_val FROM cards WHERE id = OLD.card_id;
            IF card_type_val = 'DEBIT' THEN
                UPDATE accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
            ELSIF card_type_val = 'CREDIT' THEN
                UPDATE cards SET outstanding_balance = outstanding_balance - OLD.amount, available_credit = available_credit + OLD.amount WHERE id = OLD.card_id;
            END IF;
        ELSIF OLD.transaction_type = 'EXPENSE' AND OLD.account_id IS NOT NULL THEN
            UPDATE accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
        ELSIF OLD.transaction_type = 'INCOME' AND OLD.account_id IS NOT NULL THEN
            UPDATE accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.account_id;
        ELSIF OLD.transaction_type = 'CC_PAYMENT' THEN
            IF OLD.account_id IS NOT NULL THEN
                UPDATE accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
            END IF;
            IF OLD.card_id IS NOT NULL THEN
                UPDATE cards SET outstanding_balance = outstanding_balance + OLD.amount, available_credit = available_credit - OLD.amount WHERE id = OLD.card_id;
            END IF;
        END IF;
    END IF;

    -- 2. APPLY NEW EFFECTS & VALIDATE (IF INSERT OR UPDATE)
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        
        -- Validation: CC_PAYMENT
        IF NEW.transaction_type = 'CC_PAYMENT' THEN
            IF NEW.account_id IS NULL OR NEW.card_id IS NULL THEN
                RAISE EXCEPTION 'CC_PAYMENT requires both account_id and card_id';
            END IF;
            IF NEW.payment_method IS NOT NULL THEN
                RAISE EXCEPTION 'CC_PAYMENT must have payment_method IS NULL';
            END IF;
            SELECT type INTO card_type_val FROM cards WHERE id = NEW.card_id;
            IF card_type_val != 'CREDIT' THEN
                RAISE EXCEPTION 'Target card for CC_PAYMENT must be a CREDIT card';
            END IF;
        END IF;

        -- Validation: EXPENSE via CARD
        IF NEW.transaction_type = 'EXPENSE' AND NEW.card_id IS NOT NULL THEN
            SELECT type, linked_account_id INTO card_type_val, linked_acc_id FROM cards WHERE id = NEW.card_id;
            
            IF card_type_val = 'DEBIT' THEN
                IF NEW.payment_method IS DISTINCT FROM 'DEBIT_CARD'::payment_method_enum THEN
                    RAISE EXCEPTION 'Debit card expense must use payment_method = DEBIT_CARD';
                END IF;
                IF linked_acc_id IS NULL THEN
                    RAISE EXCEPTION 'Debit card being used does not have a linked_account_id';
                END IF;
                IF NEW.account_id IS NOT NULL AND NEW.account_id != linked_acc_id THEN
                    RAISE EXCEPTION 'Provided account_id does not match the debit card linked_account_id';
                END IF;
                -- Route to the true source account for consistency
                NEW.account_id := linked_acc_id;

            ELSIF card_type_val = 'CREDIT' THEN
                IF NEW.payment_method IS DISTINCT FROM 'CREDIT_CARD'::payment_method_enum THEN
                    RAISE EXCEPTION 'Credit card expense must use payment_method = CREDIT_CARD';
                END IF;
                IF NEW.account_id IS NOT NULL THEN
                    RAISE EXCEPTION 'Credit card expense must not specify an account_id';
                END IF;
            END IF;
        END IF;

        -- Validation: EXPENSE via direct ACCOUNT
        IF NEW.transaction_type = 'EXPENSE' AND NEW.card_id IS NULL AND NEW.account_id IS NOT NULL THEN
            SELECT type INTO acc_type_val FROM accounts WHERE id = NEW.account_id;
            IF acc_type_val = 'BANK' THEN
                IF NEW.payment_method IS DISTINCT FROM 'BANK'::payment_method_enum THEN
                    RAISE EXCEPTION 'Direct bank expense must use payment_method = BANK';
                END IF;
            ELSIF acc_type_val IN ('CASH', 'SHARED_WALLET') THEN
                IF NEW.payment_method IS DISTINCT FROM 'CASH'::payment_method_enum THEN
                    RAISE EXCEPTION 'Cash or Shared Wallet expense must use payment_method = CASH';
                END IF;
            END IF;
        END IF;

        -- Apply Effects
        IF NEW.transaction_type = 'EXPENSE' AND NEW.card_id IS NOT NULL THEN
            IF card_type_val = 'DEBIT' THEN
                UPDATE accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
            ELSIF card_type_val = 'CREDIT' THEN
                UPDATE cards SET outstanding_balance = outstanding_balance + NEW.amount, available_credit = available_credit - NEW.amount WHERE id = NEW.card_id;
            END IF;
        ELSIF NEW.transaction_type = 'EXPENSE' AND NEW.account_id IS NOT NULL THEN
            UPDATE accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
        ELSIF NEW.transaction_type = 'INCOME' AND NEW.account_id IS NOT NULL THEN
            UPDATE accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.account_id;
        ELSIF NEW.transaction_type = 'CC_PAYMENT' THEN
            UPDATE accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
            UPDATE cards SET outstanding_balance = outstanding_balance - NEW.amount, available_credit = available_credit + NEW.amount WHERE id = NEW.card_id;
        END IF;
    END IF;

    -- 3. POST-APPLICATION INTEGRITY CHECKS (Runs for INSERT, UPDATE, DELETE)
    IF TG_OP = 'DELETE' THEN
        c_id := OLD.card_id;
    ELSE
        c_id := NEW.card_id;
    END IF;

    IF c_id IS NOT NULL THEN
        SELECT available_credit, credit_limit, outstanding_balance 
        INTO chk_avail, chk_limit, chk_out 
        FROM cards WHERE id = c_id;

        IF chk_out < 0 THEN
            RAISE EXCEPTION 'Invalid transaction: outstanding_balance (%) cannot go below zero.', chk_out;
        END IF;
        IF chk_avail > chk_limit THEN
            RAISE EXCEPTION 'Invalid transaction: available_credit (%) cannot exceed credit_limit (%).', chk_avail, chk_limit;
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS transaction_trigger ON transactions;
CREATE TRIGGER transaction_trigger
BEFORE INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION process_transaction();
