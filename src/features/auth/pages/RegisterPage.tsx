import {z} from "zod";
import {useNavigate} from "react-router-dom";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {useMutation} from "@tanstack/react-query";
import {register as registerUser} from "../../../api/auth.ts";

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

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<formData>({
        resolver: zodResolver(schema),
    });

    const {mutate, isPending, error} = useMutation({
        mutationFn: registerUser,
        onSuccess: () => navigate('/login'),
    })

    return (
        <div>

        </div>
    )
}