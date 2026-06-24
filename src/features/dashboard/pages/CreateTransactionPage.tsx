import {z} from "zod";
import {
    type CreateRecurringTransactionRequest,
    type CreateTransactionRequest,
    RecurringFrequency,
    TransactionType,
} from "@/@types/finance.ts";
import {CatalogType} from "@/@types/catalog.ts";
import {useNavigate} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ArrowLeft, Loader2, PlusCircle, ReceiptText} from "lucide-react";
import {financeApi} from "@/api/finance.ts";
import {catalogApi} from "@/api/catalog.ts";
import {formatCurrency} from "@/utils/formatCurrency.ts";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const transactionKindSchema = z.union([
    z.literal(TransactionType.Income),
    z.literal(TransactionType.Expense),
]);

const recurringFrequencySchema = z.union([
    z.literal(RecurringFrequency.Daily),
    z.literal(RecurringFrequency.Weekly),
    z.literal(RecurringFrequency.Monthly),
    z.literal(RecurringFrequency.Yearly),
]);

const transactionSchema = z.object({
    accountId: z.string().min(1, "Please select an account"),
    categoryId: z.string().min(1, "Please select or create a category"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    type: transactionKindSchema,
    description: z.string().max(250, "Description must be less than 250 characters"),
    isRecurring: z.boolean(),
    frequency: recurringFrequencySchema.optional(),
}).superRefine((value, context) => {
    if (value.isRecurring && value.frequency === undefined) {
        context.addIssue({
            code: "custom",
            message: "Please select a recurrence frequency",
            path: ["frequency"],
        });
    }
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

const transactionTypeOptions = [
    {value: TransactionType.Expense, label: "Expense"},
    {value: TransactionType.Income, label: "Income"},
] as const;

const frequencyOptions = [
    {value: RecurringFrequency.Daily, label: "Daily"},
    {value: RecurringFrequency.Weekly, label: "Weekly"},
    {value: RecurringFrequency.Monthly, label: "Monthly"},
    {value: RecurringFrequency.Yearly, label: "Yearly"},
] as const;

function toTransactionType(value: string): TransactionFormValues["type"] {
    return Number(value) === TransactionType.Income ? TransactionType.Income : TransactionType.Expense;
}

function toRecurringFrequency(value: string): NonNullable<TransactionFormValues["frequency"]> {
    const parsed = Number(value);

    if (parsed === RecurringFrequency.Daily) return RecurringFrequency.Daily;
    if (parsed === RecurringFrequency.Weekly) return RecurringFrequency.Weekly;
    if (parsed === RecurringFrequency.Yearly) return RecurringFrequency.Yearly;

    return RecurringFrequency.Monthly;
}

function formatAccountBalance(balance: number | undefined): string {
    return (balance ?? 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function CreateTransactionPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            accountId: "",
            categoryId: "",
            amount: 0,
            type: TransactionType.Expense,
            description: "",
            isRecurring: false,
            frequency: RecurringFrequency.Monthly,
        },
    });

    const selectedType = form.watch("type");
    const isRecurring = form.watch("isRecurring");

    const {data: accounts = [], isLoading: loadingAccounts} = useQuery({
        queryKey: ["accounts"],
        queryFn: () => financeApi.getAccounts(),
    });

    const {data: categories = [], isLoading: loadingCategories} = useQuery({
        queryKey: ["categories"],
        queryFn: () => catalogApi.getCategories(),
    });

    const filteredCategories = useMemo(() => {
        const catalogType = selectedType === TransactionType.Income ? CatalogType.Income : CatalogType.Expense;
        return categories.filter((category) => category.type === catalogType);
    }, [categories, selectedType]);

    const {mutate: createCategory, isPending: isCreatingCategory} = useMutation({
        mutationFn: async () => {
            const name = newCategoryName.trim();

            if (!name) {
                throw new Error("Category name is required");
            }

            return catalogApi.createCategory({
                name,
                type: selectedType === TransactionType.Income ? CatalogType.Income : CatalogType.Expense,
            });
        },
        onSuccess: (categoryId) => {
            form.setValue("categoryId", categoryId, {shouldValidate: true});
            setShowNewCategoryForm(false);
            setNewCategoryName("");
            queryClient.invalidateQueries({queryKey: ["categories"]});
        },
        onError: (error) => {
            console.error("Error creating category:", error);
        },
    });

    const {mutate: createRecurringTransaction, isPending: creatingRecurringTransaction} = useMutation({
        mutationFn: (data: CreateRecurringTransactionRequest) => financeApi.createRecurringTransaction(data),
        onError: (error) => {
            console.error("Error creating recurring transaction:", error);
        },
    });

    const {mutate: createTransaction, isPending: creatingTransaction} = useMutation({
        mutationFn: (data: CreateTransactionRequest) => financeApi.createTransaction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["transactions"]});
            queryClient.invalidateQueries({queryKey: ["transaction-summary"]});
            queryClient.invalidateQueries({queryKey: ["accounts"]});
            navigate("/dashboard");
        },
        onError: (error) => {
            console.error("Error creating transaction:", error);
        },
    });

    function onSubmit(values: TransactionFormValues) {
        if (values.isRecurring) {
            const recurringData: CreateRecurringTransactionRequest = {
                accountId: values.accountId,
                categoryId: values.categoryId,
                amount: values.amount,
                type: values.type,
                description: values.description,
                frequency: values.frequency ?? RecurringFrequency.Monthly,
            };

            createRecurringTransaction(recurringData, {
                onSuccess: (recurringId) => {
                    const transactionData: CreateTransactionRequest = {
                        accountId: values.accountId,
                        categoryId: values.categoryId,
                        recurringId,
                        amount: values.amount,
                        type: values.type,
                        description: values.description,
                    };

                    createTransaction(transactionData);
                },
            });
            return;
        }

        createTransaction({
            accountId: values.accountId,
            categoryId: values.categoryId,
            amount: values.amount,
            type: values.type,
            description: values.description,
        });
    }

    const isLoading = creatingTransaction || creatingRecurringTransaction || isCreatingCategory;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-background p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4"/>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">New Transaction</h1>
                        <p className="text-muted-foreground text-sm">Create a transaction or recurring payment.</p>
                    </div>
                </div>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Transaction Details</CardTitle>
                        <CardDescription>Fill in the information below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Transaction Type</FormLabel>
                                                <Select
                                                    value={String(field.value)}
                                                    onValueChange={(value) => {
                                                        field.onChange(toTransactionType(value));
                                                        form.setValue("categoryId", "", {shouldValidate: true});
                                                    }}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select transaction type"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {transactionTypeOptions.map((option) => (
                                                            <SelectItem key={option.value} value={String(option.value)}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="accountId"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Account</FormLabel>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder={loadingAccounts ? "Loading..." : "Select an account"}/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {accounts.map((account) => (
                                                            <SelectItem key={account.id} value={account.id}>
                                                                {account.name} - R$ {formatAccountBalance(account.balance)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <div className="flex gap-2">
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"}/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {filteredCategories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setShowNewCategoryForm((current) => !current)}
                                                >
                                                    <PlusCircle className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                {showNewCategoryForm && (
                                    <div className="flex gap-2 rounded-lg border p-3">
                                        <Input
                                            value={newCategoryName}
                                            onChange={(event) => setNewCategoryName(event.target.value)}
                                            placeholder="Category name"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            disabled={isCreatingCategory}
                                            onClick={() => createCategory()}
                                        >
                                            {isCreatingCategory ? <Loader2 className="h-4 w-4 animate-spin"/> : "Add"}
                                        </Button>
                                    </div>
                                )}

                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1.5 text-muted-foreground text-sm font-medium">R$</span>
                                                        <Input
                                                            className="pl-9"
                                                            placeholder="0,00"
                                                            value={field.value === 0 ? "" : formatCurrency(field.value)}
                                                            onChange={(event) => {
                                                                const rawValue = event.target.value.replace(/\D/g, "");
                                                                field.onChange(Number(rawValue) / 100);
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Optional description" {...field}/>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="isRecurring"
                                    render={({field}) => (
                                        <FormItem>
                                            <label className="flex items-center gap-2 text-sm font-medium">
                                                <input
                                                    type="checkbox"
                                                    checked={field.value}
                                                    onChange={(event) => field.onChange(event.target.checked)}
                                                    className="h-4 w-4 rounded border-input"
                                                />
                                                Recurring transaction
                                            </label>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                {isRecurring && (
                                    <FormField
                                        control={form.control}
                                        name="frequency"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Frequency</FormLabel>
                                                <Select
                                                    value={field.value === undefined ? undefined : String(field.value)}
                                                    onValueChange={(value) => field.onChange(toRecurringFrequency(value))}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select frequency"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {frequencyOptions.map((option) => (
                                                            <SelectItem key={option.value} value={String(option.value)}>
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <ReceiptText className="h-4 w-4"/>}
                                    Create Transaction
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
