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
import type {ApiResult} from "@/@types/result.ts";

export const financeApi = {
    // Accounts Endpoints
    getAccounts: async () => {
        const { data } = await api.get<ApiResult<AccountListItem[]>>('/finance/get-accounts-user');
        return Array.isArray(data) ? data : data.value;
    },

    getAccountDetails: async (id: string) => {
        const { data } = await api.get<ApiResult<AccountListItem>>(`/finance/get-account-details/${id}`);
        return data.value;
    },

    createAccount: async (data: CreateAccountRequest) => {
        await api.post('finance/create-account', data);
    },

    // Transactions Endpoints
    getSummary: async (startDate: string, endDate: string) => {
        const { data } = await api.get<ApiResult<TransactionSummary>>('/finance/get-transactions-summary', {
            params: { startDate, endDate }
        });
        return data.value
    },

    getTransactions: async () => {
        const { data } = await api.get<ApiResult<Transaction[]>>('/finance/get-transactions-user');
        return Array.isArray(data) ? data : data.value;
    },

    getTransactionDetails: async (id: string) => {
        const {data} = await api.get<ApiResult<Transaction>>(`finance/get-transaction-details/${id}`);
        if (data.value) return data.value;
        return data;
    },

    createTransaction: async (data: CreateTransactionRequest) => {
        await api.post('finance/create-transaction', data);
    },

    patchTransaction: async (id: string, data: Partial<CreateTransactionRequest>) => {
        await api.patch(`finance/patch-transaction/${id}`, data);
    },

    deleteTransaction: async (id: string) => {
        await api.delete(`finance/delete-transaction/${id}`);
    },

    // Recurring Transactions
    getRecurringTransactions: async () => {
        const {data} = await api.get<RecurringTransaction[]>('finance/get-recurring-transactions-user');
        return data;
    },

    getRecurringTransactionDetails: async (id: string) => {
        const {data} = await api.get<RecurringTransaction>(`finance/get-recurring-transaction-details/${id}`);
        return data;
    },

    createRecurringTransaction: async (data: CreateRecurringTransactionRequest) => {
        const { data: response } = await api.post<ApiResult<string>>('/finance/create-recurring-transaction', data);
        return response.value;
    },

    patchRecurringTransaction: async (id: string, data: Partial<CreateRecurringTransactionRequest>) => {
        await api.patch(`finance/patch-recurring-transaction/${id}`, data);
    },

    deleteRecurringTransaction: async (id: string) => {
        await api.delete(`finance/delete-recurring-transaction/${id}`);
    }
}