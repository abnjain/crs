import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../utils/validation.js";
import { useAuth } from "../context/AuthProvider.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Label from "../components/ui/Label.jsx";

const Register = () => {
  const { register: signup } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data) => signup(data);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <Card.Header className="text-center">
          <Card.Title className="text-2xl">Create Account</Card.Title>
          <p className="text-sm text-muted-foreground mt-1">Register to access {import.meta.env.VITE_APP_NAME} Central</p>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" size="xs">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your full name (ex - John Doe)" 
                {...register("name")} 
              />
              {errors.name && (
                <p className="text-sm text-danger text-center mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" size="xs">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="Enter your phone number (ex - 1234567890)" 
                {...register("phone")} 
              />
              {errors.phone && (
                <p className="text-sm text-danger text-center mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" size="xs">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email (ex - abc@gmail.com)" 
                {...register("email")} 
              />
              {errors.email && (
                <p className="text-sm text-danger text-center mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" size="xs">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password  " 
                {...register("password")} 
              />
              {errors.password && (
                <p className="text-sm text-danger text-center mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" size="xs">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                placeholder="Confirm your password" 
                {...register("confirmPassword")} 
              />
              {errors.confirmPassword && (
                <p className="text-sm text-danger text-center mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

          <Button type="submit" className="w-full text-white">
            Register
          </Button>
        </form>
      </Card.Content>
    </Card>
  </div>
);
};
export default Register;