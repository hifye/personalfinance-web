import {createBrowserRouter} from "react-router-dom";
import {LoginPage} from "../features/auth/pages/LoginPage.tsx";
import {RegisterPage} from "../features/auth/pages/RegisterPage.tsx";
//import {PrivateRoute} from "./PrivateRoute.tsx";
import {DashboardPage} from "../features/dashboard/pages/DashboardPage.tsx";
import {NotFoundPage} from "@/features/errors/pages/NotFoundPage.tsx";
import {CreateAccountPage} from "@/features/dashboard/pages/CreateAccountPage.tsx";

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage/>
    },
    {
        path: '/register',
        element: <RegisterPage/>
    },
    {
        path: '/dashboard',
        element: <DashboardPage />
    },
    {
        path: '/accounts/new',
        element: <CreateAccountPage/>
    },
    // {
    //     // Todas as rotas privadas ficam aqui dentro
    //     element: <PrivateRoute/>,
    //     children: [
    //         {
    //             path: '/dashboard',
    //             element: <DashboardPage />
    //         },
    //         // Adicione outras rotas privadas aqui
    //     ]
    // },
    {
        path: '*',
        element: <NotFoundPage/>
    }
]);