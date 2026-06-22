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
import {Button} from "@/components/ui/button.tsx";
import {Loader2, LogIn} from "lucide-react";

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

    const {mutate, isPending} = useMutation({
        mutationFn: login,
        onSuccess: (tokens) => {
            signIn(tokens);
            navigate('/dashboard');
        },
        onError: (error) => {
            console.error('Login failed:', error);
            form.setError('root', {message: 'Invalid email or password. Please try again.'})
        }
    })

    function onSubmit(values: formData) {
        mutate(values);
    }

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
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="name@example.com"{...field}/>
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
                                            <Input type="password" placeholder="••••••••" {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            {form.formState.errors.root && (
                                <p className="text-sm font-medium text-destructive text-center">
                                    {form.formState.errors.root.message}
                                </p>
                            )}

                            <Button type="submit" className="w-full gap-2" disabled={isPending}>
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                                Sign In
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