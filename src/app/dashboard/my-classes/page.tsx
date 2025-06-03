
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, BookOpen, CalendarCheck, FileText, Presentation, AlertTriangle } from "lucide-react";
import type { UserRole, SchoolClass } from "@/lib/constants";
import { mockSchoolClasses, mockStaffListSimpleForClassMaster } from "@/lib/constants";

interface StaffMemberSimple {
  id: string;
  name: string;
  avatarUrl?: string;
}

export default function MyClassesPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // Assuming staff ID is stored
  const [assignedClasses, setAssignedClasses] = useState<SchoolClass[]>([]);
  const [staffDetails, setStaffDetails] = useState<StaffMemberSimple | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    setUserRole(role);

    // Mocking staff ID. In a real app, this would come from auth context.
    // For demo, if user is "Test Staff", use staff001, else try to find a staff member from mock list
    const userName = localStorage.getItem("userName");
    let currentUserId: string | undefined;
    let currentStaffDetails: StaffMemberSimple | undefined;

    if (userName === "Test Staff") {
        currentUserId = "staff001"; // Default for Test Staff
    } else if (role === 'staff' && userName) {
        const matchedStaff = mockStaffListSimpleForClassMaster.find(s => s.name === userName);
        if (matchedStaff) {
            currentUserId = matchedStaff.id;
        } else {
            // Fallback if name doesn't match, assign a default for demo if no direct match
            // This part is tricky with mock data, ideally IDs are consistent
            const staffIndex = mockStaffListSimpleForClassMaster.findIndex(s => s.name.includes("Teacher") || s.name.includes("Staff"));
            currentUserId = mockStaffListSimpleForClassMaster[staffIndex > -1 ? staffIndex : 0]?.id;
        }
    }
     // If admin, they don't have specific "assigned" classes in this view, but could see all.
     // For now, if admin and no specific staff ID context, show no classes or a message.

    if (currentUserId) {
        setUserId(currentUserId);
        currentStaffDetails = mockStaffListSimpleForClassMaster.find(s => s.id === currentUserId);
        if(currentStaffDetails) setStaffDetails(currentStaffDetails);

        const classesForStaff = mockSchoolClasses.filter(
        (cls) => cls.classMasterId === currentUserId
        );
        setAssignedClasses(classesForStaff);
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
  
  if (userRole === 'staff' && !userId) {
     return <div className="text-center p-10">Loading class master information...</div>;
  }

  const staffName = staffDetails?.name || "Staff Member";
  const staffInitials = staffDetails?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'S';

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        {staffDetails && (
             <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarImage src={staffDetails.avatarUrl || `https://placehold.co/100x100.png?text=${staffInitials}`} alt={staffDetails.name} data-ai-hint="teacher avatar" />
              <AvatarFallback className="text-xl">{staffInitials}</AvatarFallback>
            </Avatar>
        )}
        <div>
            <h1 className="text-3xl font-bold font-headline text-foreground">My Assigned Classes</h1>
            <p className="text-muted-foreground">Overview of classes managed by {staffName}.</p>
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
                {/* Placeholder for student list or other class details */}
                <p className="text-sm text-muted-foreground italic">
                  Further class details and student lists will be available here.
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
                {userRole === 'admin' ? "As an admin, you can view all classes via 'School Overview'. This page is for specific class master assignments." : "You are not currently assigned as a class master to any classes."}
            </CardDescription>
          </CardHeader>
           {userRole === 'admin' && (
             <CardContent className="text-center">
                <Button asChild>
                    <Link href="/dashboard/school-overview">Go to School Overview</Link>
                </Button>
             </CardContent>
           )}
        </Card>
      )}
    </div>
  );
}

