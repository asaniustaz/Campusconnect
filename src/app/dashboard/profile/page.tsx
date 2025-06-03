"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/lib/constants";
import { Edit3 } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  department: z.string().optional(), // Relevant for staff, maybe major for student
});

type ProfileFormData = z.infer<typeof profileSchema>;

type UserProfile = ProfileFormData & {
  role: UserRole;
  id: string;
  avatarUrl?: string;
};

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    // Mock fetching user profile
    const name = localStorage.getItem("userName") || "User";
    const role = (localStorage.getItem("userRole") as UserRole) || "student";
    const email = `${name.toLowerCase().replace(" ", ".")}@campus.edu`;
    
    const profileData: UserProfile = {
      id: "123",
      name,
      email,
      role,
      phone: "123-456-7890",
      department: role === "staff" ? "Computer Science" : "Software Engineering",
      avatarUrl: `https://placehold.co/150x150.png?text=${name[0]}`,
    };
    setUserProfile(profileData);
    form.reset(profileData);
  }, [form]);

  const onSubmit: SubmitHandler<ProfileFormData> = (data) => {
    // Mock update
    setUserProfile(prev => prev ? { ...prev, ...data } : null);
    localStorage.setItem("userName", data.name); // Update local storage if name changes
    toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    setIsEditing(false);
  };

  if (!userProfile) {
    return <div className="text-center p-10">Loading profile...</div>;
  }
  
  const userInitials = userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() || userProfile.email[0].toUpperCase();

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center">
          <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
            <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} data-ai-hint="user avatar" />
            <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-headline">{userProfile.name}</CardTitle>
          <CardDescription>{userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)} - ID: {userProfile.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...form.register("name")} defaultValue={userProfile.name} disabled={!isEditing} />
              {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...form.register("email")} defaultValue={userProfile.email} disabled={!isEditing} />
              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...form.register("phone")} defaultValue={userProfile.phone} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="department">{userProfile.role === "staff" ? "Department" : "Major"}</Label>
              <Input id="department" {...form.register("department")} defaultValue={userProfile.department} disabled={!isEditing} />
            </div>
            {isEditing && (
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); form.reset(userProfile); }}>Cancel</Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
              </div>
            )}
          </form>
        </CardContent>
        {!isEditing && (
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
