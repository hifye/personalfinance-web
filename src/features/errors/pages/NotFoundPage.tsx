import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import {ArrowLeft, Home} from "lucide-react";

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
            <h1 className="text-7xl font-extrabold tracking-tighter mb-2 text-primary">404</h1>
            <h2 className="text-2xl font-bold mb-4">Not found page</h2>
            <p className="text-muted-foreground max-w-md mb-8">
                Oops! It looks like the path you tried to access doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Go back
                </Button>
                <Button onClick={() => navigate('/dashboard')} className="gap-2">
                    <Home className="h-4 w-4" /> Dashboard
                </Button>
            </div>
        </div>
    )
}