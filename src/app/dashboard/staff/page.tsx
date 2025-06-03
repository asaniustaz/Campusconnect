
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Briefcase, BookOpen, Layers } from "lucide-react";
import type { SchoolLevel } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface StaffMember {
  id: string;
  name: string;
  title: string; // e.g., Teacher, Head of Department, Librarian
  department: string; // e.g., Mathematics Department, Early Years, Administration
  email: string;
  phone?: string;
  avatarUrl: string;
  aiHint: string;
  schoolLevel: SchoolLevel[]; // Levels they are associated with
  subjectsTaught: string[]; // Subjects or key responsibilities
}

// K-12 Focused Mock Staff
const mockStaff: StaffMember[] = [
  {
    id: "staff001",
    name: "Mrs. Eleanor Vance",
    title: "Senior Science Teacher",
    department: "Science Department",
    email: "evance@campus.edu",
    phone: "123-555-0101",
    avatarUrl: "https://placehold.co/150x150.png",
    aiHint: "teacher smiling",
    schoolLevel: ["Secondary"],
    subjectsTaught: ["Physics", "Chemistry"],
  },
  {
    id: "staff002",
    name: "Mr. Samuel Green",
    title: "Admin Officer",
    department: "Administration",
    email: "sgreen@campus.edu",
    avatarUrl: "https://placehold.co/150x150.png",
    aiHint: "administrator friendly",
    schoolLevel: ["Kindergarten", "Primary", "Secondary"],
    subjectsTaught: ["School Records", "Parent Liason"],
  },
  {
    id: "staff003",
    name: "Ms. Olivia Chen",
    title: "Librarian",
    department: "Library Services",
    email: "ochen@campus.edu",
    phone: "123-555-0103",
    avatarUrl: "https://placehold.co/150x150.png",
    aiHint: "librarian books",
    schoolLevel: ["Primary", "Secondary"],
    subjectsTaught: ["Reading Programs", "Resource Management"],
  },
   {
    id: "staff004",
    name: "Mr. Robert Adewale",
    title: "Mathematics Teacher",
    department: "Mathematics Department",
    email: "radewale@campus.edu",
    phone: "123-555-0104",
    avatarUrl: "https://placehold.co/150x150.png",
    aiHint: "teacher writing_board",
    schoolLevel: ["Secondary"],
    subjectsTaught: ["JSS Mathematics", "SSS Mathematics"],
  },
  {
    id: "staff005",
    name: "Mrs. Daisy Fields",
    title: "Kindergarten Teacher",
    department: "Early Years Education",
    email: "dfields@campus.edu",
    avatarUrl: "https://placehold.co/150x150.png",
    aiHint: "teacher kindergarten",
    schoolLevel: ["Kindergarten"],
    subjectsTaught: ["Literacy", "Numeracy", "Play Activities"],
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
            <CardContent className="text-sm text-muted-foreground space-y-2 p-0">
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
              <div className="flex items-center justify-center">
                 <Layers className="h-4 w-4 mr-2" /> 
                 {staff.schoolLevel.join(', ')}
              </div>
              <div className="pt-2">
                <h4 className="font-medium text-foreground mb-1">Subjects/Responsibilities:</h4>
                <div className="flex flex-wrap gap-1 justify-center">
                  {staff.subjectsTaught.map(subject => (
                    <Badge key={subject} variant="outline" className="text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />{subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

    