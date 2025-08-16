
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
import type { UserRole, Student, StaffMember } from "@/lib/constants";
import { APP_NAME, combineName } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";

type ManagedUser = Student | StaffMember;

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
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

  const handleForgotPassword = () => {
    toast({
      title: "Password Reset",
      description: "Please contact school administration to reset your password.",
    });
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const REAL_ADMIN_EMAIL = "asaniustaz@gmail.com";
    const REAL_ADMIN_PASS = "Aa12345678@";

    let loggedIn = false;
    let userName = "User";
    let userRole: UserRole | null = null;
    let loggedInUserId: string | null = null;

    // 1. Check for the "real" admin
    if (values.email === REAL_ADMIN_EMAIL && values.password === REAL_ADMIN_PASS) {
      userRole = "admin";
      userName = "Asani Ustaz";
      loggedInUserId = `admin-${REAL_ADMIN_EMAIL}`; // Assign a unique ID for the admin
      loggedIn = true;
    }

    // 2. If not real admin, check users from localStorage
    if (!loggedIn && typeof window !== 'undefined') {
      const storedUsersString = localStorage.getItem('managedUsers');
      if (storedUsersString) {
        try {
          const managedUsers: ManagedUser[] = JSON.parse(storedUsersString);
          const matchedUser = managedUsers.find(u => u.email.toLowerCase() === values.email.toLowerCase() && u.password === values.password);
          if (matchedUser) {
            userRole = matchedUser.role;
            userName = combineName(matchedUser);
            loggedInUserId = matchedUser.id;
            loggedIn = true;
          }
        } catch (error) {
          console.error("Error parsing managedUsers from localStorage:", error);
        }
      }
    }
    
    // 3. Fallback to existing test user credentials if not logged in yet
    if (!loggedIn && values.password === "password") {
        if (values.email.startsWith("student")) {
            userRole = "student";
            userName = "Test Student";
            loggedInUserId = "test-student-id";
            loggedIn = true;
        } else if (values.email.startsWith("staff")) {
            userRole = "staff";
            userName = "Test Staff";
            loggedInUserId = "test-staff-id";
            loggedIn = true;
        } else if (values.email.startsWith("admin")) {
            userRole = "admin";
            userName = "Test Admin";
            loggedInUserId = "test-admin-id";
            loggedIn = true;
        }
    }


    if (loggedIn && userRole) {
      if (typeof window !== 'undefined') {
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("userName", userName);
        localStorage.setItem("userId", loggedInUserId || values.email);
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
        description: "Invalid email or password.",
      });
      form.setError("email", { type: "manual", message: " " }); 
      form.setError("password", { type: "manual", message: "Invalid credentials." });
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                   <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-2">
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
