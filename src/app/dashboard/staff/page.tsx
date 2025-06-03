"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Briefcase } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone?: string;
  avatarUrl: string;
  aiHint: string;
}

const mockStaff: StaffMember[] = [
  {
    id: "staff001",
    name: "Dr. Eleanor Vance",
    title: "Professor & Head of Department",
    department: "Computer Science",
    email: "evance@campus.edu",
    phone: "123-555-0101",
    avatarUrl: "https://placehold.co/150x150.png",
    aiHint: "professor portrait",
  },
  {
    id: "staff002",
    name: "Mr. Samuel Green",
    title: "Admissions Officer",
    department: "Student Affairs",
    email: "sgreen@campus.edu",
    avatarUrl: "https://placehold.co/150x150.png",
    aiHint: "administrator friendly",
  },
  {
    id: "staff003",
    name: "Ms. Olivia Chen",
    title: "Librarian",
    department: "Library Services",
    email: "ochen@campus.edu",
    phone: "123-555-0103",
    avatarUrl: "https://placehold.co/150x150.png",
    aiHint: "librarian smiling",
  },
   {
    id: "staff004",
    name: "Prof. Robert Downy",
    title: "Associate Professor",
    department: "Physics",
    email: "rdowney@campus.edu",
    phone: "123-555-0104",
    avatarUrl: "https://placehold.co/150x150.png",
    aiHint: "scientist lecture",
  },
];

export default function StaffDirectoryPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Staff Directory</h1>
        <p className="text-muted-foreground">Find contact information for faculty and staff members.</p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockStaff.map((staff) => (
          <Card key={staff.id} className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary">
              <AvatarImage src={staff.avatarUrl} alt={staff.name} data-ai-hint={staff.aiHint} />
              <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardHeader className="p-0 mb-2">
              <CardTitle className="font-headline text-xl text-primary">{staff.name}</CardTitle>
              <CardDescription>{staff.title}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1 p-0">
              <div className="flex items-center justify-center">
                <Briefcase className="h-4 w-4 mr-2" /> {staff.department}
              </div>
              <div className="flex items-center justify-center">
                <Mail className="h-4 w-4 mr-2" /> {staff.email}
              </div>
              {staff.phone && (
                <div className="flex items-center justify-center">
                  <Phone className="h-4 w-4 mr-2" /> {staff.phone}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
