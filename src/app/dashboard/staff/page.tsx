
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Briefcase, BookOpen, Layers, Users } from "lucide-react";
import type { SchoolSection, UserRole } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface StaffMemberDisplay {
  id: string;
  name: string;
  title: string;
  department: string;
  email?: string;
  phone?: string;
  avatarUrl: string;
  aiHint: string;
  schoolSections: SchoolSection[];
  subjectsTaught: string[];
}

// This is the typical structure of a user stored in localStorage by ManageUsersPage
interface ManagedUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  department?: string;
  title?: string;
  // other fields like password, assignedClasses might exist but are not directly used for display here
}


export default function StaffDirectoryPage() {
  const [displayedStaff, setDisplayedStaff] = useState<StaffMemberDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsersString = localStorage.getItem('managedUsers');
      let staffToDisplay: StaffMemberDisplay[] = [];
      if (storedUsersString) {
        try {
          const allManagedUsers: ManagedUser[] = JSON.parse(storedUsersString);
          const staffAndAdminUsers = allManagedUsers.filter(
            (user) => user.role === 'staff' || user.role === 'admin' || user.role === 'head_of_section'
          );

          staffToDisplay = staffAndAdminUsers.map((user) => {
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase() || (user.email ? user.email[0].toUpperCase() : 'S');
            return {
              id: user.id,
              name: user.name,
              title: user.title || (user.role === 'admin' ? 'Administrator' : 'Staff Member'),
              department: user.department || (user.role === 'admin' ? 'Administration' : 'General'),
              email: user.email,
              phone: undefined, // Phone is not typically stored in ManagedUser, can be added to profile
              avatarUrl: `https://placehold.co/150x150.png?text=${initials}`,
              aiHint: "user avatar",
              schoolSections: [], // Placeholder, as this is not in ManagedUser
              subjectsTaught: ["General Duties"], // Placeholder
            };
          });
        } catch (e) {
          console.error("Failed to parse users from localStorage", e);
        }
      }
      setDisplayedStaff(staffToDisplay);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold font-headline text-foreground">Staff Directory</h1>
          <p className="text-muted-foreground">Loading staff members...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Staff Directory</h1>
        <p className="text-muted-foreground">Find contact information for faculty and staff members.</p>
      </header>
      
      {displayedStaff.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedStaff.map((staff) => (
            <Card key={staff.id} className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
                <AvatarImage src={staff.avatarUrl} alt={staff.name} data-ai-hint={staff.aiHint} />
                <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardHeader className="p-0 mb-2">
                <CardTitle className="font-headline text-xl text-primary">{staff.name}</CardTitle>
                <CardDescription>{staff.title}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2 p-0">
                <div className="flex items-center justify-center">
                  <Briefcase className="h-4 w-4 mr-2" /> {staff.department}
                </div>
                {staff.email && (
                  <div className="flex items-center justify-center">
                    <Mail className="h-4 w-4 mr-2" /> {staff.email}
                  </div>
                )}
                {staff.phone && (
                  <div className="flex items-center justify-center">
                    <Phone className="h-4 w-4 mr-2" /> {staff.phone}
                  </div>
                )}
                {staff.schoolSections.length > 0 && (
                  <div className="flex items-center justify-center">
                    <Layers className="h-4 w-4 mr-2" /> 
                    {staff.schoolSections.join(', ')}
                  </div>
                )}
                {staff.subjectsTaught.length > 0 && (
                  <div className="pt-2">
                    <h4 className="font-medium text-foreground mb-1">Responsibilities:</h4>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {staff.subjectsTaught.map(subject => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />{subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="col-span-full">
           <CardHeader className="items-center text-center">
             <Users className="h-12 w-12 text-muted-foreground mb-2" />
            <CardTitle>No Staff Members Found</CardTitle>
            <CardDescription>
                No staff members are currently in the system. An administrator can add staff via the 'Manage Users' page.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
