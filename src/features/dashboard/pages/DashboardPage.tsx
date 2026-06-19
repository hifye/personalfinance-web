import {useAuth} from "../../auth/AuthContext.tsx";
import {useNavigate} from "react-router-dom";
import {useMutation} from "@tanstack/react-query";
import {logout} from "../../../api/auth.ts";

export function DashboardPage() {
    const {user, signOut} = useAuth();
    const navigate = useNavigate();

    const {mutate: handleLogout} = useMutation({
        mutationFn: logout,
        onSettled: () => {
            signOut();
            navigate('/login');
        }
    });

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome, {user?.name}!</p>
            <button onClick={() => handleLogout}>Logout</button>
        </div>
    )
}