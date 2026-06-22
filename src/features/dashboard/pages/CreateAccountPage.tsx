import {useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {ArrowLeft, Loader2, Wallet} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {formatCurrency} from "@/utils/formatCurrency.ts";
import {financeApi} from "@/api/finance.ts";

const accountSchema = z.object({
    name: z.string().min(1, "Account name is required").max(100),
    type: z.enum(["1", "2", "3"]).refine((val) => val !== undefined, {
        message: "Please select an account type",
    }),
    initialBalance: z.number().min(0, "Initial balance cannot be negative"),
});

type AccountFormValues = z.infer<typeof accountSchema>;

// Função utilitária para formatar moeda em tempo real

export function CreateAccountPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<AccountFormValues>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: "",
            type: undefined,
            initialBalance: 0,
        },
    });

    const {mutate, isPending} = useMutation({
        mutationFn: async (values: AccountFormValues) => {
             await financeApi.createAccount({
                 name: values.name,
                 type: parseInt(values.type),
                 initialBalance: values.initialBalance
             })
        },
        onSuccess: () => {
            // Limpa o cache para atualizar a lista no Dashboard
            queryClient.invalidateQueries({queryKey: ['accounts']});
            navigate('/dashboard');
        },
        onError: (error) => {
            console.error("Error creating account:", error);
        },
    });

    function onSubmit(values: AccountFormValues) {
        mutate(values);
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-background p-4 flex items-center justify-center">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4"/>
                        </Button>
                        <CardTitle className="text-2xl">New Account</CardTitle>
                    </div>
                    <CardDescription>
                        Register your bank accounts, wallets, or credit cards.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Account Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Nubank, Chase, Wallet" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Account Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">Checking Account</SelectItem>
                                                <SelectItem value="2">Savings Account</SelectItem>
                                                <SelectItem value="3">Credit Card</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="initialBalance"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Initial Balance</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span
                                                    className="absolute left-3 top-1.5 text-muted-foreground text-sm font-medium">R$</span>
                                                <Input
                                                    className="pl-9"
                                                    placeholder="0,00"
                                                    {...field}
                                                    value={field.value === 0 ? "" : formatCurrency(field.value)}
                                                    onChange={(e) => {
                                                        const rawValue = e.target.value.replace(/\D/g, "");
                                                        const numericValue = Number(rawValue) / 100;
                                                        field.onChange(numericValue);
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full gap-2" disabled={isPending}>
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> :
                                    <Wallet className="h-4 w-4"/>}
                                Create Account
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
