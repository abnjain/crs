import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

export default function ConfirmationPage() {
    const navigate = useNavigate();

    // Auto-redirect after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/dashboard", { replace: true });
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    // Get status and message from URL params (you can pass these via router state or search params)
    // For now, we'll use static content. You can enhance this later.
    const isSuccess = true; // This could come from location.state
    const message = isSuccess
        ? "Action completed successfully!"
        : "Something went wrong. Please try again.";

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        {isSuccess ? (
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        ) : (
                            <XCircle className="h-8 w-8 text-destructive" />
                        )}
                    </div>
                    <CardTitle>{isSuccess ? "Success!" : "Oops!"}</CardTitle>
                    <CardDescription>{message}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        You will be redirected to the dashboard in 5 seconds.
                    </p>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button onClick={() => navigate("/dashboard")}>
                        Go to Dashboard Now
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}