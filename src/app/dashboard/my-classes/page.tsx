
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, BookOpen, CalendarCheck, FileText, Presentation, AlertTriangle } from "lucide-react";
import type { UserRole, SchoolClass, Student } from "@/lib/constants"; 
import { mockSchoolClasses as defaultClasses, combineName } from "@/lib/constants";

interface ManagedUserForDisplay {
  id: string;
  firstName: string;
  surname: string;
  middleName?: string;
  avatarUrl?: string;
  role: UserRole;
  assignedClasses?: string[]; 
}

export default function MyClassesPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); 
  const [assignedClasses, setAssignedClasses] = useState<SchoolClass[]>([]);
  const [staffDetails, setStaffDetails] = useState<ManagedUserForDisplay | null>(null);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);


  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const storedUserIdFromLogin = localStorage.getItem("userId"); 
    setUserRole(role);

    if (!role || !storedUserIdFromLogin) {
        return;
    }

    let currentClasses: SchoolClass[] = [];
    if (typeof window !== 'undefined') {
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
    }
    setAllClasses(currentClasses);

    if (typeof window !== 'undefined' && (role === 'staff' || role === 'admin')) {
      const storedUsersString = localStorage.getItem('managedUsers');
      let allManagedUsers: (ManagedUserForDisplay | Student)[] = [];

      if (storedUsersString) {
        try {
          allManagedUsers = JSON.parse(storedUsersString);
        } catch (e) {
          console.error("Failed to parse users from localStorage", e);
        }
      }

      const allStudents: Student[] = allManagedUsers.filter(u => u.role === 'student') as Student[];
      const counts: Record<string, number> = {};
      currentClasses.forEach(cls => {
        counts[cls.id] = allStudents.filter(s => s.classId === cls.id).length;
      });
      setStudentCounts(counts);
      
      let foundStaff: ManagedUserForDisplay | undefined;
      foundStaff = allManagedUsers.find(u => u.id === storedUserIdFromLogin && (u.role === 'staff' || u.role === 'admin' || u.role === 'head_of_section')) as ManagedUserForDisplay;
      
      if (foundStaff) {
        setCurrentUserId(foundStaff.id);
        setStaffDetails(foundStaff);
        const staffAssignedClassIds = foundStaff.assignedClasses || [];
        const classesForStaff = currentClasses.filter(cls => 
          staffAssignedClassIds.includes(cls.id)
        );
        setAssignedClasses(classesForStaff);

      } else if (role === 'admin') {
        const adminName = localStorage.getItem("userName") || "Admin";
        setStaffDetails({
            id: storedUserIdFromLogin, 
            firstName: "Admin",
            surname: "User",
            role: "admin",
            assignedClasses: [] 
        });
        setAssignedClasses([]);
      } else if (role === 'staff') {
        console.warn("Logged in staff user ID not found in managed users list. Page will remain in loading state.");
      }
    }
  }, []);

  if (userRole !== 'staff' && userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="text-2xl text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription>This page is only accessible to staff or admin members.</CardDescription>
        </Card>
      </div>
    );
  }
  
  if (userRole === 'staff' && !staffDetails) { 
     return <div className="text-center p-10">Loading class master information...</div>;
  }
  
  if (!staffDetails && userRole === 'admin') {
    const adminNameFromStorage = localStorage.getItem("userName");
    const adminIdFromStorage = localStorage.getItem("userId");
    if (!adminNameFromStorage || !adminIdFromStorage) {
      return <div className="text-center p-10">Loading admin information...</div>;
    }
  }


  const displayName = staffDetails ? combineName(staffDetails) : "User";
  const displayInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const displayAvatar = staffDetails?.avatarUrl || `https://placehold.co/100x100.png?text=${displayInitials}`;

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <Avatar className="w-16 h-16 border-2 border-primary">
          <AvatarImage src={displayAvatar} alt={displayName} data-ai-hint="teacher avatar" />
          <AvatarFallback className="text-xl">{displayInitials}</AvatarFallback>
        </Avatar>
        <div>
            <h1 className="text-3xl font-bold font-headline text-foreground">My Assigned Classes</h1>
            <p className="text-muted-foreground">Overview of classes managed by {displayName}.</p>
        </div>
      </header>

      {assignedClasses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignedClasses.map((cls) => (
            <Card key={cls.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-primary">
                  <Presentation className="mr-2 h-6 w-6" /> {cls.name}
                </CardTitle>
                <CardDescription>{cls.displayLevel} Level</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center text-muted-foreground mb-4">
                  <Users className="mr-2 h-5 w-5" /> 
                  <span>{studentCounts[cls.id] || 0} Students</span>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  Manage attendance and results for this class.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/attendance">
                    <CalendarCheck className="mr-2 h-4 w-4" /> Mark Attendance
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/results">
                    <FileText className="mr-2 h-4 w-4" /> View Results
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="col-span-full">
          <CardHeader className="items-center text-center">
             <AlertTriangle className="h-12 w-12 text-yellow-500 mb-2" />
            <CardTitle>No Classes Assigned</CardTitle>
            <CardDescription>
                {userRole === 'admin' ? "As an admin, you are not directly assigned as a class master. Staff class master assignments are managed via 'Manage Users'." : "You are not currently assigned as a class master to any classes. Contact an administrator."}
            </CardDescription>
          </CardHeader>
           {userRole === 'admin' && (
             <CardContent className="text-center">
                <Button asChild>
                    <Link href="/dashboard/admin/manage-users">Manage Staff Assignments</Link>
                </Button>
                 <Button asChild className="ml-2">
                    <Link href="/dashboard/school-overview">Go to School Overview</Link>
                </Button>
             </CardContent>
           )}
        </Card>
      )}
    </div>
  );
}
