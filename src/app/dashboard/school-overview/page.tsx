
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, Users, UserCheck, HelpCircle } from "lucide-react";
import type { UserRole, SchoolClass } from "@/lib/constants";
import { mockSchoolClasses } from "@/lib/constants";

interface ManagedUserForDisplay {
  id: string;
  name: string;
  avatarUrl?: string; // Assuming avatar might be set via profile page
  role: UserRole;
}

export default function SchoolOverviewPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [allStaff, setAllStaff] = useState<ManagedUserForDisplay[]>([]);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    setUserRole(role);

    if (typeof window !== 'undefined') {
      const storedUsersString = localStorage.getItem('managedUsers');
      if (storedUsersString) {
        try {
          const allManagedUsers: ManagedUserForDisplay[] = JSON.parse(storedUsersString);
          // Filter for staff or admin roles to be considered as potential class masters
          const staffUsers = allManagedUsers.filter(u => u.role === 'staff' || u.role === 'admin');
          setAllStaff(staffUsers);
        } catch (e) {
          console.error("Failed to parse users from localStorage for staff list", e);
          setAllStaff([]);
        }
      }
    }
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

  const getStaffMemberById = (staffId: string): ManagedUserForDisplay | undefined => {
    return allStaff.find(staff => staff.id === staffId);
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
                    // Attempt to get avatar from localStorage or fallback
                    const avatar = classMaster?.avatarUrl || `https://placehold.co/40x40.png?text=${masterInitials}`;

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
                                <AvatarImage src={avatar} alt={classMaster.name} data-ai-hint="teacher avatar" />
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
