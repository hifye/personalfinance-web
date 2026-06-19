import {Link, useNavigate} from "react-router-dom";
import {z} from "zod";
import {useAuth} from "../AuthContext.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation} from "@tanstack/react-query";
import {login} from "../../../api/auth.ts";

const schema = z.object({
    email: z.string().email('invalid email'),
    password: z.string().min(1, 'password is required'),
});

type formData = z.infer<typeof schema>;

export function LoginPage() {
    const navigate = useNavigate();
    const {signIn} = useAuth();

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<formData>({
        resolver: zodResolver(schema),
    });

    const {mutate, isPending, error} = useMutation({
        mutationFn: login,
        onSuccess: (tokens) => {
            signIn(tokens);
            navigate('/dashboard');
        },
    });

    return (
        <div>

        </div>
    )
}