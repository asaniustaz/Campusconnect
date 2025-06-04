
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, BookOpen, CalendarCheck, FileText, Presentation, AlertTriangle } from "lucide-react";
import type { UserRole, SchoolClass } from "@/lib/constants";
import { mockSchoolClasses } from "@/lib/constants";

interface ManagedUserForDisplay {
  id: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
}

export default function MyClassesPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<SchoolClass[]>([]);
  const [staffDetails, setStaffDetails] = useState<ManagedUserForDisplay | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const storedUserName = localStorage.getItem("userName"); // This is the logged-in user's name
    // We need the ID of the logged-in user. Assuming email is used as ID for simplicity from AuthForm.
    const storedUserEmailAsId = localStorage.getItem("userId"); 

    setUserRole(role);

    if (typeof window !== 'undefined' && (role === 'staff' || role === 'admin')) {
      const storedUsersString = localStorage.getItem('managedUsers');
      if (storedUsersString) {
        try {
          const allManagedUsers: ManagedUserForDisplay[] = JSON.parse(storedUsersString);
          
          let foundStaff: ManagedUserForDisplay | undefined;
          if (storedUserEmailAsId) { // Prioritize ID if available
            foundStaff = allManagedUsers.find(u => u.id === storedUserEmailAsId && (u.role === 'staff' || u.role === 'admin'));
          } else if (storedUserName) { // Fallback to name match if ID not found (less reliable)
             foundStaff = allManagedUsers.find(u => u.name === storedUserName && (u.role === 'staff' || u.role === 'admin'));
          }

          if (foundStaff) {
            setCurrentUserId(foundStaff.id);
            setStaffDetails(foundStaff);
            const classesForStaff = mockSchoolClasses.filter(
              (cls) => cls.classMasterId === foundStaff!.id // Use the ID of the found staff
            );
            setAssignedClasses(classesForStaff);
          } else if (role === 'admin' && !foundStaff) {
            // Admin might not have a specific "staff" entry for themselves if they are the super admin
            // But they can still view this page. Classes assigned to an "admin ID" might not be typical.
            // For now, if admin and no direct match, they'll see the "no classes assigned" message unless
            // some mockSchoolClasses.classMasterId matches an admin's ID.
            setStaffDetails({id: storedUserEmailAsId || "admin_user", name: storedUserName || "Admin", role: "admin"});
          }

        } catch (e) {
          console.error("Failed to parse users from localStorage for staff list", e);
        }
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
  
  if (userRole === 'staff' && !currentUserId && !staffDetails) { // Check both to avoid brief "Loading" if admin
     return <div className="text-center p-10">Loading class master information...</div>;
  }

  const displayName = staffDetails?.name || "Staff Member";
  const displayInitials = staffDetails?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'S';
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
                  <span>{cls.studentCount} Students</span>
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
                {userRole === 'admin' ? "As an admin, you can view all classes via 'School Overview'. Staff subject allocations are managed separately." : "You are not currently assigned as a class master to any classes. Contact an administrator."}
            </CardDescription>
          </CardHeader>
           {userRole === 'admin' && (
             <CardContent className="text-center">
                <Button asChild>
                    <Link href="/dashboard/admin/manage-staff-allocations">Manage Staff Allocations</Link>
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

