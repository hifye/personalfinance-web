import {createBrowserRouter} from "react-router-dom";
import {LoginPage} from "../features/auth/pages/LoginPage.tsx";
import {RegisterPage} from "../features/auth/pages/RegisterPage.tsx";
import {PrivateRoute} from "./PrivateRoute.tsx";
import {DashboardPage} from "../features/dashboard/pages/DashboardPage.tsx";
import {NotFoundPage} from "@/features/errors/pages/NotFoundPage.tsx";
import {CreateAccountPage} from "@/features/dashboard/pages/CreateAccountPage.tsx";
import {CreateTransactionPage} from "@/features/dashboard/pages/CreateTransactionPage.tsx";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LoginPage/>
    },
    {
        path: '/login',
        element: <LoginPage/>
    },
    {
        path: '/register',
        element: <RegisterPage/>
    },
    {
        // Todas as rotas privadas ficam aqui dentro
        element: <PrivateRoute/>,
        children: [
            {
                path: '/dashboard',
                element: <DashboardPage />
            },
            {
                path: '/accounts/new',
                element: <CreateAccountPage/>
            },
            {
                path: '/transactions/new',
                element: <CreateTransactionPage/>
            }
        ]
    },
    {
        path: '*',
        element: <NotFoundPage/>
    }
]);