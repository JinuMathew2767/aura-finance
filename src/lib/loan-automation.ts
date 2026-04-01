import { supabaseServerAdmin } from "@/lib/supabase";

type LoanAutomationRow = {
  id: string;
  name: string;
  total_amount: number | string | null;
  total_profit_amount?: number | string | null;
  amount_paid_to_date?: number | string | null;
  principal_paid_to_date?: number | string | null;
  profit_paid_to_date?: number | string | null;
  monthly_payment: number | string | null;
  payment_account_id?: string | null;
  next_payment_date?: string | null;
  auto_create_emi?: boolean | null;
  owner_type: "SELF" | "SPOUSE" | "SHARED";
};

type AccountRow = {
  id: string;
  type: "CASH" | "BANK" | "SHARED_WALLET";
};

const roundMoney = (value: number) => Math.round(value * 100) / 100;

function addOneMonth(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const base = new Date(Date.UTC(year, month - 1, 1));
  base.setUTCMonth(base.getUTCMonth() + 1);
  const maxDay = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0)).getUTCDate();
  const next = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), Math.min(day, maxDay)));
  return next.toISOString().slice(0, 10);
}

function toIsoAtNoon(dateString: string) {
  return new Date(`${dateString}T12:00:00.000Z`).toISOString();
}

function getPaymentMethod(accountType: AccountRow["type"]) {
  return accountType === "BANK" ? "BANK" : "CASH";
}

function isMissingLoanAutomationColumns(errorMessage: string) {
  return [
    "total_profit_amount",
    "amount_paid_to_date",
    "principal_paid_to_date",
    "profit_paid_to_date",
    "payment_account_id",
    "next_payment_date",
    "auto_create_emi",
    "auto_created",
  ].some((column) => errorMessage.includes(column));
}

function splitInstallment(
  installmentAmount: number,
  principalRemaining: number,
  profitRemaining: number
) {
  if (installmentAmount <= 0) {
    return { principalComponent: 0, profitComponent: 0 };
  }

  if (principalRemaining <= 0) {
    return { principalComponent: 0, profitComponent: roundMoney(Math.min(installmentAmount, profitRemaining)) };
  }

  if (profitRemaining <= 0) {
    return { principalComponent: roundMoney(Math.min(installmentAmount, principalRemaining)), profitComponent: 0 };
  }

  const remainingTotal = principalRemaining + profitRemaining;
  const rawProfit = roundMoney((installmentAmount * profitRemaining) / remainingTotal);
  const profitComponent = roundMoney(Math.min(rawProfit, profitRemaining));
  const principalComponent = roundMoney(Math.min(installmentAmount - profitComponent, principalRemaining));
  const allocated = roundMoney(principalComponent + profitComponent);

  if (allocated === installmentAmount) {
    return { principalComponent, profitComponent };
  }

  const delta = roundMoney(installmentAmount - allocated);
  if (principalRemaining - principalComponent >= delta) {
    return {
      principalComponent: roundMoney(principalComponent + delta),
      profitComponent,
    };
  }

  return {
    principalComponent,
    profitComponent: roundMoney(profitComponent + delta),
  };
}

export async function processDueLoanInstallments() {
  const today = new Date().toISOString().slice(0, 10);

  const { data: dueLoans, error: loanQueryError } = await supabaseServerAdmin
    .from("loans")
    .select(
      "id,name,total_amount,total_profit_amount,amount_paid_to_date,principal_paid_to_date,profit_paid_to_date,monthly_payment,payment_account_id,next_payment_date,auto_create_emi,owner_type"
    )
    .eq("auto_create_emi", true)
    .not("payment_account_id", "is", null)
    .not("next_payment_date", "is", null)
    .lte("next_payment_date", today);

  if (loanQueryError) {
    if (isMissingLoanAutomationColumns(loanQueryError.message)) {
      return { processed: 0, skipped: "migration_pending" as const };
    }

    throw loanQueryError;
  }

  const loans = (dueLoans ?? []) as LoanAutomationRow[];
  if (loans.length === 0) {
    return { processed: 0, skipped: "none_due" as const };
  }

  const accountIds = [...new Set(loans.map((loan) => loan.payment_account_id).filter(Boolean))] as string[];
  const { data: accounts, error: accountsError } = await supabaseServerAdmin
    .from("accounts")
    .select("id,type")
    .in("id", accountIds);

  if (accountsError) throw accountsError;

  const accountMap = new Map((accounts ?? []).map((account) => [account.id, account as AccountRow]));

  const { data: categories } = await supabaseServerAdmin.from("categories").select("id,name");
  const transportationCategory = categories?.find((category) => /transport/i.test(category.name));

  const { data: subcategories } = await supabaseServerAdmin
    .from("subcategories")
    .select("id,name,category_id")
    .eq("category_id", transportationCategory?.id ?? "");
  const carLoanSubcategory = subcategories?.find((subcategory) => /loan/i.test(subcategory.name));

  let processed = 0;

  for (const loan of loans) {
    const paymentAccount = loan.payment_account_id ? accountMap.get(loan.payment_account_id) : undefined;
    if (!paymentAccount || !loan.next_payment_date) continue;

    let nextPaymentDate: string | null = loan.next_payment_date ?? null;
    let amountPaidToDate = Number(loan.amount_paid_to_date) || 0;
    let principalPaidToDate = Number(loan.principal_paid_to_date) || 0;
    let profitPaidToDate = Number(loan.profit_paid_to_date) || 0;
    const financeAmount = Number(loan.total_amount) || 0;
    const totalProfitAmount = Number(loan.total_profit_amount) || 0;
    const scheduledInstallment = Number(loan.monthly_payment) || 0;
    const totalRepayment = roundMoney(financeAmount + totalProfitAmount);

    let loopGuard = 0;
    let didChange = false;

    while (nextPaymentDate && nextPaymentDate <= today && loopGuard < 120) {
      loopGuard += 1;

      const remainingTotal = roundMoney(totalRepayment - amountPaidToDate);
      if (remainingTotal <= 0 || scheduledInstallment <= 0) {
        nextPaymentDate = null;
        didChange = true;
        break;
      }

      const { data: existingPayment } = await supabaseServerAdmin
        .from("loan_payments")
        .select("id")
        .eq("loan_id", loan.id)
        .eq("payment_date", nextPaymentDate)
        .maybeSingle();

      if (existingPayment?.id) {
        nextPaymentDate = addOneMonth(nextPaymentDate);
        didChange = true;
        continue;
      }

      const installmentAmount = roundMoney(Math.min(scheduledInstallment, remainingTotal));
      const principalRemaining = roundMoney(financeAmount - principalPaidToDate);
      const profitRemaining = roundMoney(totalProfitAmount - profitPaidToDate);
      const { principalComponent, profitComponent } = splitInstallment(
        installmentAmount,
        Math.max(principalRemaining, 0),
        Math.max(profitRemaining, 0)
      );

      const { data: transaction, error: transactionError } = await supabaseServerAdmin
        .from("transactions")
        .insert([
          {
            transaction_type: "EXPENSE",
            title: `${loan.name} EMI`,
            description: "Auto-created monthly loan installment",
            amount: installmentAmount,
            transaction_date: toIsoAtNoon(nextPaymentDate),
            category_id: transportationCategory?.id ?? null,
            subcategory_id: carLoanSubcategory?.id ?? null,
            payment_method: getPaymentMethod(paymentAccount.type),
            account_id: paymentAccount.id,
            card_id: null,
            created_by_user_id: null,
            owner_type: loan.owner_type,
            is_recurring: true,
            receipt_url: null,
            related_transaction_id: null,
          },
        ])
        .select("id")
        .single();

      if (transactionError) throw transactionError;

      const { error: paymentError } = await supabaseServerAdmin.from("loan_payments").insert([
        {
          loan_id: loan.id,
          transaction_id: transaction.id,
          principal_amount: principalComponent,
          interest_amount: profitComponent,
          payment_date: nextPaymentDate,
          auto_created: true,
        },
      ]);

      if (paymentError) {
        await supabaseServerAdmin.from("transactions").delete().eq("id", transaction.id);

        if (paymentError.code === "23505") {
          nextPaymentDate = addOneMonth(nextPaymentDate);
          didChange = true;
          continue;
        }

        throw paymentError;
      }

      amountPaidToDate = roundMoney(amountPaidToDate + installmentAmount);
      principalPaidToDate = roundMoney(principalPaidToDate + principalComponent);
      profitPaidToDate = roundMoney(profitPaidToDate + profitComponent);
      nextPaymentDate = addOneMonth(nextPaymentDate);
      processed += 1;
      didChange = true;
    }

    if (!didChange) continue;

    const finalRemainingTotal = roundMoney(totalRepayment - amountPaidToDate);
    const shouldKeepAuto = finalRemainingTotal > 0 && Boolean(nextPaymentDate);

    const { error: updateError } = await supabaseServerAdmin
      .from("loans")
      .update({
        amount_paid_to_date: amountPaidToDate,
        principal_paid_to_date: principalPaidToDate,
        profit_paid_to_date: profitPaidToDate,
        next_payment_date: shouldKeepAuto ? nextPaymentDate : null,
        auto_create_emi: shouldKeepAuto,
      })
      .eq("id", loan.id);

    if (updateError) throw updateError;
  }

  return { processed, skipped: null };
}
