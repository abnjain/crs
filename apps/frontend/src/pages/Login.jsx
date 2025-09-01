import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../utils/validation.js";
import { useAuth } from "../context/AuthProvider.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Label from "../components/ui/Label.jsx";

const Login = () => {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data) => login(data);

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface px-4 py-12">
      <Card className="w-full max-w-md bg-white shadow-xl">
        <Card.Header className="text-center">
          <Card.Title className="text-2xl">Login to {import.meta.env.VITE_APP_NAME} Central</Card.Title>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                {...register("email")} 
              />
              {errors.email && (
                <p className="text-sm text-danger text-center mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password" 
                {...register("password")} 
              />
              {errors.password && (
                <p className="text-sm text-danger text-center mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full text-white" variant="default">
              Login
            </Button>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Login;