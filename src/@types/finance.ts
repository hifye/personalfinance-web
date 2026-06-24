export const TransactionType = {
    None: 0,
    Income: 1,
    Expense: 2,
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const RecurringFrequency = {
    None: 0,
    Daily: 1,
    Weekly: 2,
    Monthly: 3,
    Yearly: 4,
} as const;

export type RecurringFrequency = typeof RecurringFrequency[keyof typeof RecurringFrequency];

export interface TransactionSummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    startDate?: string;
    endDate?: string;
}

export interface AccountListItem {
    id: string;
    name: string;
    type: string;
    balance: number;
}

export interface CreateAccountRequest {
    name: string;
    type: number;
    initialBalance: number;
}

export interface Transaction {
    id: string;
    accountId: string;
    categoryId: string;
    recurringId?: string;
    amount: number;
    type: TransactionType;
    description?: string;
    createdAt: string;
}

export interface RecurringTransaction {
    id: string;
    accountId: string;
    categoryId: string;
    amount: number;
    type: TransactionType;
    frequency: RecurringFrequency;
    startDate: string;
    nextOcurrence: string;
    isActive: boolean;
}

export interface CreateTransactionRequest {
    accountId: string;
    categoryId: string;
    recurringId?: string;
    amount: number;
    type: TransactionType;
    description?: string;
}

export interface CreateRecurringTransactionRequest {
    accountId: string;
    categoryId: string;
    amount: number;
    type: TransactionType;
    frequency: RecurringFrequency;
    description?: string;
}
