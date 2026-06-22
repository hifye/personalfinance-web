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