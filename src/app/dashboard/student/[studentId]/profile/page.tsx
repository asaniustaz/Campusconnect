
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Student, SchoolClass, UserRole } from "@/lib/constants";
import { mockSchoolClasses as defaultClasses, combineName } from "@/lib/constants";
import { ArrowLeft, Mail, School, GraduationCap, Hash, ShieldAlert } from "lucide-react";

// Combine relevant fields from Student and potentially other user types if needed for display consistency
interface DisplayableStudentProfile extends Student {
  className?: string;
}

export default function StudentProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [studentProfile, setStudentProfile] = useState<DisplayableStudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole | null;
    setCurrentUserRole(role);

    if (!role || (role !== 'admin' && role !== 'staff' && role !== 'head_of_section')) {
        router.push('/dashboard'); // Redirect if not authorized
        return;
    }

    if (studentId && typeof window !== "undefined") {
        let currentClasses: SchoolClass[] = [];
        const storedClassesString = localStorage.getItem('schoolClasses');
        if (storedClassesString) {
            try {
                currentClasses = JSON.parse(storedClassesString);
            } catch (e) {
                currentClasses = defaultClasses;
            }
        } else {
            currentClasses = defaultClasses;
        }

        const storedUsersString = localStorage.getItem("managedUsers");
        if (storedUsersString) {
            try {
            const allManagedUsers: Student[] = JSON.parse(storedUsersString);
            const foundStudent = allManagedUsers.find(
                (user) => user.id === studentId && user.role === "student"
            );

            if (foundStudent) {
                const classDetails = foundStudent.classId
                ? currentClasses.find((cls) => cls.id === foundStudent.classId)
                : undefined;
                const name = combineName(foundStudent);
                setStudentProfile({
                ...foundStudent,
                avatarUrl: foundStudent.avatarUrl || `https://placehold.co/150x150.png?text=${name[0]}`,
                className: classDetails?.name,
                });
            } else {
                setError("Student profile not found.");
            }
            } catch (e) {
            console.error("Failed to parse managedUsers for student profile:", e);
            setError("Error loading student data.");
            }
        } else {
            setError("No user data found in local storage.");
        }
        setIsLoading(false);
    } else {
      setIsLoading(false);
      setError("Student ID not provided.");
    }
  }, [studentId, router]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading student profile...</p></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Card className="w-full max-w-md p-8 text-center">
            <CardHeader>
                <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4"/>
                <CardTitle className="text-2xl text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={() => router.back()} className="mt-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!studentProfile) {
    // This case should ideally be caught by error state, but as a fallback:
    return <div className="flex justify-center items-center h-screen"><p>Student profile could not be loaded.</p></div>;
  }
  
  if (currentUserRole !== 'admin' && currentUserRole !== 'staff' && currentUserRole !== 'head_of_section') {
    // Final check, though useEffect should handle redirect
    return <div className="text-center p-10">Access Denied.</div>;
  }

  const studentName = combineName(studentProfile);
  const studentInitials = studentName.split(" ").map((n) => n[0]).join("").toUpperCase() || studentProfile.email[0].toUpperCase();

  return (
    <div className="space-y-6 p-4 md:p-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Overview
        </Button>
        <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader className="items-center text-center">
            <Avatar className="w-32 h-32 mb-4 border-4 border-primary shadow-md">
                <AvatarImage
                src={studentProfile.avatarUrl}
                alt={studentName}
                data-ai-hint="student avatar passport"
                />
                <AvatarFallback className="text-4xl">{studentInitials}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-headline">{studentName}</CardTitle>
            <CardDescription>Student ID: {studentProfile.id}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 p-3 border rounded-md bg-secondary/30">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{studentProfile.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded-md bg-secondary/30">
                    <School className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-xs text-muted-foreground">School Section</p>
                        <p className="font-medium">{studentProfile.schoolSection}</p>
                    </div>
                </div>
                {studentProfile.className && (
                    <div className="flex items-center gap-2 p-3 border rounded-md bg-secondary/30">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-xs text-muted-foreground">Class</p>
                            <p className="font-medium">{studentProfile.className}</p>
                        </div>
                    </div>
                )}
                {studentProfile.rollNumber && (
                    <div className="flex items-center gap-2 p-3 border rounded-md bg-secondary/30">
                        <Hash className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-xs text-muted-foreground">Roll Number</p>
                            <p className="font-medium">{studentProfile.rollNumber}</p>
                        </div>
                    </div>
                )}
            </div>
            </CardContent>
        </Card>
    </div>
  );
}

    
