
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
import type { UserRole, SchoolLevel } from "@/lib/constants";
import { SCHOOL_LEVELS } from "@/lib/constants";
import { Edit3, School, Layers } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  department: z.string().optional(), // Relevant for staff/admin, major for student
  schoolLevel: z.custom<SchoolLevel>().optional(), // For students primarily
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
    const name = localStorage.getItem("userName") || "User";
    const role = (localStorage.getItem("userRole") as UserRole) || "student";
    const email = `${name.toLowerCase().replace(/[^a-z0-9.]/g, "").split(" ").join(".")}@campus.edu`;
    
    let departmentLabel = "Major";
    let departmentValue = "Software Engineering";
    let schoolLevelValue: SchoolLevel = "Secondary";

    if (role === "student") {
      // Could fetch this from a more specific source or assign based on ID/email pattern
      if (name.toLowerCase().includes("kinder")) schoolLevelValue = "Kindergarten";
      else if (name.toLowerCase().includes("primary")) schoolLevelValue = "Primary";
    } else if (role === "staff") {
      departmentLabel = "Department";
      departmentValue = "Computer Science";
      schoolLevelValue = "Secondary"; // Staff might be associated with a primary level
    } else if (role === "admin") {
      departmentLabel = "Role Description";
      departmentValue = "System Administrator";
       schoolLevelValue = "Secondary"; // Admin oversees all
    }
    
    const profileData: UserProfile = {
      id: role === "admin" ? "adm001" : (role === "staff" ? "stf001" : "std001"),
      name,
      email,
      role,
      phone: "123-456-7890",
      department: departmentValue,
      schoolLevel: schoolLevelValue,
      avatarUrl: `https://placehold.co/150x150.png?text=${name[0]}`,
    };
    setUserProfile(profileData);
    form.reset(profileData);
  }, [form]);

  const onSubmit: SubmitHandler<ProfileFormData> = (data) => {
    setUserProfile(prev => prev ? { ...prev, ...data } : null);
    if (localStorage.getItem("userName") !== data.name) {
       localStorage.setItem("userName", data.name); 
    }
    toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    setIsEditing(false);
  };

  if (!userProfile) {
    return <div className="text-center p-10">Loading profile...</div>;
  }
  
  const userInitials = userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() || userProfile.email[0].toUpperCase();
  
  let departmentFieldLabel = "Major";
  if (userProfile.role === "staff") departmentFieldLabel = "Department";
  if (userProfile.role === "admin") departmentFieldLabel = "Role Description";


  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center">
          <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
            <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} data-ai-hint="user avatar passport" />
            <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-headline">{userProfile.name}</CardTitle>
          <CardDescription>
            {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)} - ID: {userProfile.id}
            {userProfile.schoolLevel && (
              <span className="block mt-1 text-xs">
                <School className="inline-block h-3 w-3 mr-1" /> Level: {userProfile.schoolLevel}
              </span>
            )}
          </CardDescription>
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
              <Label htmlFor="department">{departmentFieldLabel}</Label>
              <Input id="department" {...form.register("department")} defaultValue={userProfile.department} disabled={!isEditing || userProfile.role === 'admin'} />
            </div>
             {userProfile.role === 'student' && (
              <div>
                <Label htmlFor="schoolLevel">School Level</Label>
                {isEditing ? (
                  <Controller
                    name="schoolLevel"
                    control={form.control}
                    defaultValue={userProfile.schoolLevel}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="schoolLevel">
                          <SelectValue placeholder="Select school level" />
                        </SelectTrigger>
                        <SelectContent>
                          {SCHOOL_LEVELS.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <Input id="schoolLevel" value={userProfile.schoolLevel} disabled />
                )}
              </div>
            )}

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
