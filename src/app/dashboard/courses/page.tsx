
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { BookText, Users, CalendarDays, Layers, Microscope, Palette } from "lucide-react";
import type { SchoolLevel, SubjectCategory } from "@/lib/constants";
import { SCHOOL_LEVELS, SUBJECT_CATEGORIES } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
  schoolLevel: SchoolLevel;
  subjectCategory: SubjectCategory;
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
    schoolLevel: "Secondary",
    subjectCategory: "Science",
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
    schoolLevel: "Secondary",
    subjectCategory: "Science",
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
    schoolLevel: "Secondary",
    subjectCategory: "Art",
  },
  {
    id: "KIDART101",
    title: "Fun with Colors",
    code: "ART-K101",
    description: "Exploring basic colors and shapes through fun activities.",
    instructor: "Ms. Lily Pad",
    credits: 1,
    schedule: "Tue 09:00 - 09:45 AM",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "kids art",
    schoolLevel: "Kindergarten",
    subjectCategory: "Art",
  },
  {
    id: "PRIMSCI101",
    title: "Nature Wonders",
    code: "SCI-P101",
    description: "Discovering the world of plants and animals around us.",
    instructor: "Mr. David Attenborough Jr.",
    credits: 2,
    schedule: "Thu 10:00 - 11:00 AM",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "nature discovery",
    schoolLevel: "Primary",
    subjectCategory: "Science",
  },
];

export default function CoursesPage() {
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | "all">("all");

  const filteredCourses = mockCourses.filter(course => 
    (selectedLevel === "all" || course.schoolLevel === selectedLevel) &&
    (selectedCategory === "all" || course.subjectCategory === selectedCategory)
  );

  const getCategoryIcon = (category: SubjectCategory) => {
    if (category === "Science") return <Microscope className="h-4 w-4 mr-1" />;
    if (category === "Art") return <Palette className="h-4 w-4 mr-1" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Courses</h1>
        <p className="text-muted-foreground">Browse available courses and their details. Filter by school level and subject category.</p>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={selectedLevel} onValueChange={(value) => setSelectedLevel(value as SchoolLevel | "all")}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="School Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {SCHOOL_LEVELS.map(level => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as SubjectCategory | "all")}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Subject Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {SUBJECT_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {filteredCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
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
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="secondary" className="flex items-center">
                    <Layers className="h-3 w-3 mr-1" /> {course.schoolLevel}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center">
                    {getCategoryIcon(course.subjectCategory)} {course.subjectCategory}
                  </Badge>
                </div>
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
      ) : (
        <p className="text-center text-muted-foreground col-span-full">No courses match the selected filters.</p>
      )}
    </div>
  );
}
