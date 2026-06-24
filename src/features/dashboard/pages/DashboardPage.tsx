import { useAuth } from "../../auth/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { logout } from "@/api/auth.ts";
import { financeApi } from "@/api/finance.ts";
import {PlusCircle, ArrowUpCircle, ArrowDownCircle, LogOut, Wallet, CreditCard, History} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {AccountListItem} from "@/@types/finance.ts";
import type {ApiResult} from "@/@types/result.ts";

export function DashboardPage() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const { data: summaryRaw, isLoading: loadingSummary } = useQuery({
        queryKey: ['transaction-summary', firstDay, lastDay],
        queryFn: () => financeApi.getSummary(firstDay, lastDay),
    });

    const { data: accountsRaw, isLoading: loadingAccounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => financeApi.getAccounts(),
    });

    const { mutate: handleLogout } = useMutation({
        mutationFn: logout,
        onSettled: () => {
            signOut();
            navigate('/login');
        }
    });

    const getAccountsList = (): AccountListItem[] => {
        if (Array.isArray(accountsRaw)) return accountsRaw;

        const result = accountsRaw as unknown as ApiResult<AccountListItem[]>;
        if (result?.value && Array.isArray(result.value)) return result.value;

        return [];
    };

    const accountsList = getAccountsList();

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-background p-4 md:p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground text-sm">Welcome back, {user?.name}. Here's the summary of your balance.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={() => navigate('/transactions/new')} className="gap-2 shadow-sm">
                        <PlusCircle className="h-4 w-4" /> New transaction
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleLogout()} className="text-muted-foreground">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-primary shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Consolidated Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        {loadingSummary ? <Skeleton className="h-8 w-24" /> : (
                            <div className="text-2xl font-bold">
                                R$ {(summaryRaw?.balance ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Receipts</CardTitle>
                        <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        {loadingSummary ? <Skeleton className="h-8 w-24" /> : (
                            <div className="text-2xl font-bold text-emerald-600">
                                R$ {(summaryRaw?.totalIncome ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-destructive shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
                        <ArrowDownCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        {loadingSummary ? <Skeleton className="h-8 w-24" /> : (
                            <div className="text-2xl font-bold text-destructive">
                                R$ {(summaryRaw?.totalExpense ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-3 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="h-5 w-5" /> My Accounts
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/accounts/new')}>
                            <PlusCircle className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loadingAccounts ? (
                            <div className="space-y-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : accountsList.length > 0 ? (
                            accountsList.map((account) => (
                                <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {account.name ? account.name[0].toUpperCase() : 'A'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{account.name}</p>
                                            <p className="text-xs text-muted-foreground">{account.type}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold">
                                        R$ {(account.balance ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-xs text-muted-foreground mb-4">No accounts found.</p>
                                <Button variant="outline" className="w-full border-dashed" onClick={() => navigate('/accounts/new')}>
                                    + Add Account
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-4 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <History className="h-5 w-5" /> Recent Activity
                        </CardTitle>
                        <Button variant="link" size="sm" onClick={() => navigate('/transactions')}>View All</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Your transactions will appear here.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
