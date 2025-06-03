
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { UserRole, SchoolLevel } from "@/lib/constants";
import { SCHOOL_LEVELS } from "@/lib/constants";
import { UserPlus, Users, Briefcase } from "lucide-react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const studentSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  schoolLevel: z.custom<SchoolLevel>((val) => SCHOOL_LEVELS.includes(val as SchoolLevel), "Please select a school level"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type StudentFormData = z.infer<typeof studentSchema>;

const staffSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(2, "Department is required"),
  title: z.string().min(2, "Job title is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type StaffFormData = z.infer<typeof staffSchema>;

export default function ManageUsersPage() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const studentForm = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const staffForm = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: "", email: "", department: "", title: "", password: "" },
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    setUserRole(role);
  }, []);

  const onStudentSubmit: SubmitHandler<StudentFormData> = (data) => {
    console.log("New Student Data:", data);
    // Mock adding student
    toast({
      title: "Student Added",
      description: `${data.name} has been added as a student.`,
    });
    studentForm.reset();
  };

  const onStaffSubmit: SubmitHandler<StaffFormData> = (data) => {
    console.log("New Staff Data:", data);
    // Mock adding staff
    toast({
      title: "Staff Added",
      description: `${data.name} has been added as a staff member.`,
    });
    staffForm.reset();
  };
  
  if (userRole !== 'admin') {
     return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="text-2xl text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription>This page is only accessible to admin members.</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Manage Users</h1>
        <p className="text-muted-foreground">Add new students or staff members to the system.</p>
      </header>

      <Tabs defaultValue="add-student" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="add-student"><Users className="mr-2"/> Add Student</TabsTrigger>
          <TabsTrigger value="add-staff"><Briefcase className="mr-2"/> Add Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="add-student">
          <Card className="shadow-xl max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Add New Student</CardTitle>
              <CardDescription>Fill in the details to register a new student.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="studentName">Full Name</Label>
                  <Input id="studentName" {...studentForm.register("name")} />
                  {studentForm.formState.errors.name && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="studentEmail">Email Address</Label>
                  <Input id="studentEmail" type="email" {...studentForm.register("email")} />
                  {studentForm.formState.errors.email && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.email.message}</p>}
                </div>
                 <div>
                  <Label htmlFor="schoolLevel">School Level</Label>
                   <Controller
                    name="schoolLevel"
                    control={studentForm.control}
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
                  {studentForm.formState.errors.schoolLevel && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.schoolLevel.message}</p>}
                </div>
                <div>
                  <Label htmlFor="studentPassword">Password</Label>
                  <Input id="studentPassword" type="password" {...studentForm.register("password")} />
                  {studentForm.formState.errors.password && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <UserPlus className="mr-2 h-4 w-4"/> Add Student
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="add-staff">
          <Card className="shadow-xl max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Add New Staff Member</CardTitle>
              <CardDescription>Fill in the details to register a new staff member.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={staffForm.handleSubmit(onStaffSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="staffName">Full Name</Label>
                  <Input id="staffName" {...staffForm.register("name")} />
                   {staffForm.formState.errors.name && <p className="text-sm text-destructive mt-1">{staffForm.formState.errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="staffEmail">Email Address</Label>
                  <Input id="staffEmail" type="email" {...staffForm.register("email")} />
                  {staffForm.formState.errors.email && <p className="text-sm text-destructive mt-1">{staffForm.formState.errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" {...staffForm.register("department")} />
                  {staffForm.formState.errors.department && <p className="text-sm text-destructive mt-1">{staffForm.formState.errors.department.message}</p>}
                </div>
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" {...staffForm.register("title")} />
                  {staffForm.formState.errors.title && <p className="text-sm text-destructive mt-1">{staffForm.formState.errors.title.message}</p>}
                </div>
                <div>
                  <Label htmlFor="staffPassword">Password</Label>
                  <Input id="staffPassword" type="password" {...staffForm.register("password")} />
                  {staffForm.formState.errors.password && <p className="text-sm text-destructive mt-1">{staffForm.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <UserPlus className="mr-2 h-4 w-4"/> Add Staff Member
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

