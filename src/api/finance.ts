// Tipos baseados nos Records da API C#
import api from "@/api/client.ts";
import type {AccountListItem, CreateAccountRequest, TransactionSummary} from "@/@types/finance.ts";

export const financeApi = {
    // Accounts Endpoints
    getAccounts: async () => {
        const {data} = await api.get<AccountListItem[]>('/finance/get-accounts-user');
        return data;
    },

    getAccountDetails: async (id: string) => {
        const {data} = await api.get<AccountListItem>(`/finance/get-account-by-id/${id}`);
        return data;
    },

    createAccount: async (data: CreateAccountRequest) => {
        await api.post('/api/finance/create-account', data);
    },

    // Transactions Endpoints
    getSummary: async (startDate: string, endDate: string) => {
        const {data} = await api.get<TransactionSummary>('/finance/get-transactions-summary', {
            params: {
                startDate,
                endDate
            }
        });
        return data
    },

    getTransactions: async () => {
        const {data} = await api.get('/finance/get-transactions-user');
        return data
    }
}