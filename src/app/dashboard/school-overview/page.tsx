
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, Users, UserCheck, HelpCircle } from "lucide-react";
import type { UserRole, SchoolClass } from "@/lib/constants";
import { mockSchoolClasses } from "@/lib/constants";
// Assuming mockStaff is available or can be imported if needed for full details
// For now, we'll just use the classMasterId and try to find the name from a staff list if available
// We need the staff list to get names
// Let's import staff list similar to how staff directory page does it for consistency
// This is a simplified mock staff list for this page's purpose
interface StaffMemberSimple {
  id: string;
  name: string;
  avatarUrl?: string;
}
const mockStaffListSimple: StaffMemberSimple[] = [
  { id: "staff001", name: "Dr. Eleanor Vance", avatarUrl: "https://placehold.co/40x40.png" },
  { id: "staff002", name: "Mr. Samuel Green", avatarUrl: "https://placehold.co/40x40.png" },
  { id: "staff003", name: "Ms. Olivia Chen", avatarUrl: "https://placehold.co/40x40.png" },
  { id: "staff004", name: "Prof. Robert Downy", avatarUrl: "https://placehold.co/40x40.png" },
  { id: "staff005", name: "Mrs. Daisy Fields", avatarUrl: "https://placehold.co/40x40.png" },
  { id: "staff006", name: "Ms. Bola (Nursery Eng/Math)", avatarUrl: "https://placehold.co/40x40.png"},
  { id: "staff007", name: "Mr. David (Primary Eng)", avatarUrl: "https://placehold.co/40x40.png"},
  { id: "staff008", name: "Mrs. Esther (Primary Math)", avatarUrl: "https://placehold.co/40x40.png"},
  { id: "staff009", name: "Ms. Johnson (JSS Eng)", avatarUrl: "https://placehold.co/40x40.png"},
  { id: "staff010", name: "Mr. Adebayo (JSS Math)", avatarUrl: "https://placehold.co/40x40.png"},
  { id: "staff011", name: "Prof. Wole (SSS Eng)", avatarUrl: "https://placehold.co/40x40.png"},
  { id: "staff012", name: "Dr. Funmi (SSS Math)", avatarUrl: "https://placehold.co/40x40.png"},
];


export default function SchoolOverviewPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    setUserRole(role);
  }, []);

  if (userRole !== 'admin' && userRole !== 'staff') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="text-2xl text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription>This page is only accessible to admin or staff members.</CardDescription>
        </Card>
      </div>
    );
  }

  const getStaffMemberById = (staffId: string): StaffMemberSimple | undefined => {
    return mockStaffListSimple.find(staff => staff.id === staffId);
  };

  const displayLevels: SchoolClass['displayLevel'][] = ['Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary'];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">School Overview</h1>
        <p className="text-muted-foreground">View class distributions, student counts, and assigned class masters.</p>
      </header>

      {displayLevels.map((displayLevel) => {
        const classesForLevel = mockSchoolClasses.filter(cls => cls.displayLevel === displayLevel);
        if (classesForLevel.length === 0) return null;

        return (
          <Card key={displayLevel} className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-primary">
                <Building className="mr-3 h-7 w-7" /> {displayLevel} Section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead className="text-center">Student Count</TableHead>
                    <TableHead>Class Master</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classesForLevel.map((cls) => {
                    const classMaster = cls.classMasterId ? getStaffMemberById(cls.classMasterId) : undefined;
                    const masterInitials = classMaster ? classMaster.name.split(' ').map(n=>n[0]).join('') : '?';
                    return (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            {cls.studentCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          {classMaster ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={classMaster.avatarUrl || `https://placehold.co/40x40.png?text=${masterInitials}`} alt={classMaster.name} data-ai-hint="teacher avatar" />
                                <AvatarFallback>{masterInitials}</AvatarFallback>
                              </Avatar>
                              <span>{classMaster.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-muted-foreground">
                               <HelpCircle className="h-4 w-4 mr-2"/> Not Assigned
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
