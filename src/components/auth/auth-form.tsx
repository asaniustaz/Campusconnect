
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserRole } from "@/lib/constants";
import { APP_NAME } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";

// Define a type for users stored in localStorage
type ManagedUser = {
  id: string;
  name: string;
  email: string;
  password?: string; // Password stored directly for prototype
  role: UserRole;
};

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Min 1 for flexibility with potentially empty passwords from old mocks
  role: z.enum(["student", "staff", "admin"], { required_error: "Please select a role." }),
});

export default function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const REAL_ADMIN_EMAIL = "asaniustaz@gmail.com";
    const REAL_ADMIN_PASS = "Aa12345678@";

    let loggedIn = false;
    let userName = values.email.split('@')[0] || "User";
    let userRole: UserRole = values.role;

    // 1. Check for the "real" admin
    if (values.email === REAL_ADMIN_EMAIL && values.password === REAL_ADMIN_PASS) {
      userRole = "admin";
      userName = "Asani Ustaz";
      loggedIn = true;
    }

    // 2. If not real admin, check users from localStorage
    if (!loggedIn && typeof window !== 'undefined') {
      const storedUsersString = localStorage.getItem('managedUsers');
      if (storedUsersString) {
        try {
          const managedUsers: ManagedUser[] = JSON.parse(storedUsersString);
          const matchedUser = managedUsers.find(u => u.email === values.email && u.password === values.password);
          if (matchedUser) {
            userRole = matchedUser.role;
            userName = matchedUser.name;
            loggedIn = true;
          }
        } catch (error) {
          console.error("Error parsing managedUsers from localStorage:", error);
        }
      }
    }
    
    // 3. Fallback to existing test user credentials if not logged in yet
    if (!loggedIn && values.password === "password") {
      if (values.email === "student@test.com") {
        userRole = "student";
        userName = "Test Student";
        loggedIn = true;
      } else if (values.email === "staff@test.com") {
        userRole = "staff";
        userName = "Test Staff";
        loggedIn = true;
      } else if (values.email === "admin@test.com" && values.email !== REAL_ADMIN_EMAIL) { // Ensure this doesn't override real admin if password was 'password'
        userRole = "admin";
        userName = "Test Admin";
        loggedIn = true;
      }
    }

    if (loggedIn) {
      if (typeof window !== 'undefined') {
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("userName", userName);
        localStorage.setItem("userId", values.email); // Use email as a simple ID for now
      }
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userName}! Role: ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`,
      });
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email, password, or role selected.",
      });
      form.setError("email", { type: "manual", message: " " }); // Add error to field to show something is wrong
      form.setError("password", { type: "manual", message: "Invalid credentials or role mismatch." });
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center text-primary">{APP_NAME}</CardTitle>
        <CardDescription className="text-center">Sign in to access your portal</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role (Select if not using managed credentials)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
