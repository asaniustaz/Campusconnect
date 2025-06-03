"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { BookText, Users, CalendarDays } from "lucide-react";

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  instructor: string;
  credits: number;
  schedule: string;
  imageUrl: string;
  aiHint: string;
}

const mockCourses: Course[] = [
  {
    id: "CS101",
    title: "Introduction to Programming",
    code: "CS101",
    description: "Learn the fundamentals of programming using Python. Covers variables, control flow, functions, and basic data structures.",
    instructor: "Dr. Ada Lovelace",
    credits: 3,
    schedule: "Mon/Wed/Fri 10:00 - 10:50 AM",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "programming textbook",
  },
  {
    id: "MA202",
    title: "Calculus II",
    code: "MA202",
    description: "Advanced topics in calculus including integration techniques, sequences, series, and parametric equations.",
    instructor: "Prof. Isaac Newton",
    credits: 4,
    schedule: "Tue/Thu 01:00 - 02:50 PM",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "math equations",
  },
  {
    id: "ENGL300",
    title: "Advanced Composition",
    code: "ENGL300",
    description: "Focuses on developing advanced writing skills for academic and professional contexts.",
    instructor: "Dr. Virginia Woolf",
    credits: 3,
    schedule: "Mon/Wed 02:00 - 03:15 PM",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "writing literature",
  },
];

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Courses</h1>
        <p className="text-muted-foreground">Browse available courses and their details.</p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockCourses.map((course) => (
          <Card key={course.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative w-full h-48">
              <Image 
                src={course.imageUrl} 
                alt={course.title} 
                layout="fill" 
                objectFit="cover"
                data-ai-hint={course.aiHint} 
              />
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-xl text-primary">{course.title}</CardTitle>
              <CardDescription>{course.code} - {course.credits} Credits</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-foreground mb-3">{course.description}</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" /> Instructor: {course.instructor}
                </div>
                <div className="flex items-center">
                  <CalendarDays className="h-4 w-4 mr-2" /> Schedule: {course.schedule}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <BookText className="mr-2 h-4 w-4" /> View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
