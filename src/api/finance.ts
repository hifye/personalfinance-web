import type {ApiResult} from "@/@types/result.ts";
import type {
    AccountListItem,
    CreateAccountRequest,
    CreateRecurringTransactionRequest,
    CreateTransactionRequest,
    RecurringTransaction,
    Transaction,
    TransactionSummary,
} from "@/@types/finance.ts";
import api from "@/api/client.ts";

type MaybeApiResult<T> = T | ApiResult<T>;

function isApiResult<T>(data: MaybeApiResult<T>): data is ApiResult<T> {
    return typeof data === "object" && data !== null && "value" in data;
}

function unwrapValue<T>(data: MaybeApiResult<T>): T {
    if (isApiResult(data)) {
        return data.value;
    }

    return data;
}

export const financeApi = {
    getAccounts: async (): Promise<AccountListItem[]> => {
        const {data} = await api.get<AccountListItem[]>("finance/get-accounts-user");
        return data;
    },

    getAccountDetails: async (id: string): Promise<AccountListItem> => {
        const {data} = await api.get<AccountListItem>(`finance/get-account-by-id/${id}`);
        return data;
    },

    createAccount: async (data: CreateAccountRequest): Promise<void> => {
        await api.post("finance/create-account", data);
    },

    deleteAccount: async (id: string): Promise<void> => {
        await api.delete(`finance/delete-account/${id}`);
    },

    getSummary: async (startDate: string, endDate: string): Promise<TransactionSummary> => {
        const {data} = await api.get<TransactionSummary>("finance/get-transactions-summary", {
            params: {
                startDate,
                endDate,
            },
        });
        return data;
    },

    getTransactions: async (): Promise<Transaction[]> => {
        const {data} = await api.get<Transaction[]>("finance/get-transactions-user");
        return data;
    },

    getTransactionDetails: async (id: string): Promise<Transaction> => {
        const {data} = await api.get<Transaction>(`finance/get-transaction-details/${id}`);
        return data;
    },

    createTransaction: async (data: CreateTransactionRequest): Promise<void> => {
        await api.post("finance/create-transaction", data);
    },

    patchTransaction: async (id: string, data: Partial<CreateTransactionRequest>): Promise<void> => {
        await api.patch(`finance/patch-transaction/${id}`, data);
    },

    deleteTransaction: async (id: string): Promise<void> => {
        await api.delete(`finance/delete-transaction/${id}`);
    },

    getRecurringTransactions: async (): Promise<RecurringTransaction[]> => {
        const {data} = await api.get<RecurringTransaction[]>("finance/get-recurring-transactions-user");
        return data;
    },

    getRecurringTransactionDetails: async (id: string): Promise<RecurringTransaction> => {
        const {data} = await api.get<RecurringTransaction>(`finance/get-recurring-transaction-details/${id}`);
        return data;
    },

    createRecurringTransaction: async (data: CreateRecurringTransactionRequest): Promise<string> => {
        const {data: response} = await api.post<MaybeApiResult<string>>("finance/create-recurring-transaction", data);
        return unwrapValue(response);
    },

    patchRecurringTransaction: async (id: string, data: Partial<CreateRecurringTransactionRequest>): Promise<void> => {
        await api.patch(`finance/patch-recurring-transaction/${id}`, data);
    },

    deleteRecurringTransaction: async (id: string): Promise<void> => {
        await api.delete(`finance/delete-recurring-transaction/${id}`);
    },
};
