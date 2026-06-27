import type { Expense } from "@/types/expense";

type MutableBalance = {
  userId: string;
  userName: string;
  netCents: number;
};

export type SettlementBalance = {
  userId: string;
  userName: string;
  netCents: number;
};

export type SettlementTransfer = {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amountCents: number;
};

export type DebtCalculation = {
  balances: SettlementBalance[];
  transfers: SettlementTransfer[];
  totalExpenseCents: number;
};

function getOrCreateBalance(
  balances: Map<string, MutableBalance>,
  userId: string,
  userName: string,
): MutableBalance {
  const existingBalance = balances.get(userId);

  if (existingBalance) {
    if (userName.trim()) {
      existingBalance.userName = userName;
    }

    return existingBalance;
  }

  const nextBalance: MutableBalance = {
    userId,
    userName,
    netCents: 0,
  };

  balances.set(userId, nextBalance);

  return nextBalance;
}

export function calculateDebtSettlement(
  expenses: Expense[],
): DebtCalculation {
  const balances = new Map<string, MutableBalance>();

  for (const expense of expenses) {
    if (expense.amountCents <= 0) {
      throw new Error(`Útrata „${expense.title}“ má neplatnou cenu.`);
    }

    const shareTotal = expense.shares.reduce(
      (total, share) => total + share.amountCents,
      0,
    );

    if (shareTotal !== expense.amountCents) {
      throw new Error(
        `Útrata „${expense.title}“ nemá správně rozdělenou výslednou částku.`,
      );
    }

    const payerBalance = getOrCreateBalance(
      balances,
      expense.payerId,
      expense.payerName,
    );

    payerBalance.netCents += expense.amountCents;

    for (const share of expense.shares) {
      const participantBalance = getOrCreateBalance(
        balances,
        share.userId,
        share.userName,
      );

      participantBalance.netCents -= share.amountCents;
    }
  }

  const balanceList = Array.from(balances.values()).sort((first, second) =>
    first.userName.localeCompare(second.userName, "cs-CZ"),
  );

  const creditors = balanceList
    .filter((balance) => balance.netCents > 0)
    .map((balance) => ({
      ...balance,
      remainingCents: balance.netCents,
    }))
    .sort((first, second) => second.remainingCents - first.remainingCents);

  const debtors = balanceList
    .filter((balance) => balance.netCents < 0)
    .map((balance) => ({
      ...balance,
      remainingCents: Math.abs(balance.netCents),
    }))
    .sort((first, second) => second.remainingCents - first.remainingCents);

  const transfers: SettlementTransfer[] = [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (
    debtorIndex < debtors.length &&
    creditorIndex < creditors.length
  ) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const amountCents = Math.min(
      debtor.remainingCents,
      creditor.remainingCents,
    );

    if (amountCents > 0) {
      transfers.push({
        fromUserId: debtor.userId,
        fromUserName: debtor.userName,
        toUserId: creditor.userId,
        toUserName: creditor.userName,
        amountCents,
      });
    }

    debtor.remainingCents -= amountCents;
    creditor.remainingCents -= amountCents;

    if (debtor.remainingCents === 0) {
      debtorIndex += 1;
    }

    if (creditor.remainingCents === 0) {
      creditorIndex += 1;
    }
  }

  const totalExpenseCents = expenses.reduce(
    (total, expense) => total + expense.amountCents,
    0,
  );

  return {
    balances: balanceList,
    transfers,
    totalExpenseCents,
  };
}