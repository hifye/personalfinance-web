import {z} from "zod";
import {Link, useNavigate} from "react-router-dom";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {useMutation} from "@tanstack/react-query";
import {register as registerUser} from "../../../api/auth.ts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Form} from "@/components/ui/form.tsx";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Loader2, UserPlus} from "lucide-react";

const schema = z.object({
    name: z.string().min(1, 'name is required').max(200),
    email: z.string().email('invalid email').max(100),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^a-zA-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type formData = z.infer<typeof schema>;

export function RegisterPage() {
    const navigate = useNavigate();

    const form = useForm<formData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    })

    const {mutate, isPending} = useMutation({
        mutationFn: registerUser,
        onSuccess: () => navigate('/login'),
        onError: (error) => {
            console.error('Registration failed:', error);
            form.setError('root', {message: 'Registration failed. Please try again.'})
        }
    })

    function onSubmit(values: formData) {
        // Removemos o confirmPassword antes de enviar para a API
        const { confirmPassword: _, ...apiData } = values;
        mutate(apiData);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl">Create Account</CardTitle>
                    <CardDescription className="text-sm">
                        Sign-up
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="name@example.com"
                                                   {...field}/>
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
                                            <Input placeholder="••••••••" type="password" {...field} />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input placeholder="••••••••" type="password" {...field} />
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
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                Register
                            </Button>
                        </form>
                    </Form>

                    <p className="mt-4 text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                        <Link to="/login" className="font-medium text-foreground underline">
                            Log-in
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}