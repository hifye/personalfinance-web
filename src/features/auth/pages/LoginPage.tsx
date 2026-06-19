import {Link, useNavigate} from "react-router-dom";
import {z} from "zod";
import {useAuth} from "../AuthContext.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation} from "@tanstack/react-query";
import {login} from "@/api/auth.ts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import {Button} from "@/components/ui/button.tsx";

const schema = z.object({
    email: z.string().email('invalid email'),
    password: z.string().min(1, 'password is required'),
});

type formData = z.infer<typeof schema>;

export function LoginPage() {
    const navigate = useNavigate();
    const {signIn} = useAuth();

    const form = useForm<formData>({
        resolver: zodResolver(schema),
        defaultValues: {email: '', password: ''}
    });

    const {mutate, isPending, error} = useMutation({
        mutationFn: login,
        onSuccess: (tokens) => {
            signIn(tokens);
            navigate('/dashboard');
        },
    })

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">Log-in</CardTitle>
                    <CardDescription className="text-sm">
                        Access your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-3">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="seu@email.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password" {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        Email or password is incorrect.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? 'Logging in...' : 'Log-in'}
                            </Button>
                        </form>
                    </Form>

                    <p className="mt-4 text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-foreground underline">
                            Sign-up
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}