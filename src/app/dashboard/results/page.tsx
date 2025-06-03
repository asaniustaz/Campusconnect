
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserRole } from "@/lib/constants";
import { BarChart3, FileSpreadsheet } from "lucide-react";

interface SubjectResult {
  subjectCode: string;
  subjectName: string;
  grade: string;
  marks: number;
  totalMarks: number;
}

interface StudentOverallResult {
  studentId: string;
  studentName: string;
  cgpa: number;
  results: SubjectResult[];
}

const mockStudentResults: StudentOverallResult = {
  studentId: "std001",
  studentName: "Alice Wonderland",
  cgpa: 3.8,
  results: [
    { subjectCode: "CS101", subjectName: "Intro to Programming", grade: "A", marks: 92, totalMarks: 100 },
    { subjectCode: "MA101", subjectName: "Calculus I", grade: "A-", marks: 88, totalMarks: 100 },
    { subjectCode: "PHY101", subjectName: "Physics I", grade: "B+", marks: 82, totalMarks: 100 },
  ],
};

const mockStaffCourseResults: { [courseId: string]: StudentOverallResult[] } = {
  CS101: [
    { studentId: "std001", studentName: "Alice Wonderland", cgpa: 0, results: [{ subjectCode: "CS101", subjectName: "Intro to Programming", grade: "A", marks: 92, totalMarks: 100 }] },
    { studentId: "std002", studentName: "Bob The Builder", cgpa: 0, results: [{ subjectCode: "CS101", subjectName: "Intro to Programming", grade: "B", marks: 85, totalMarks: 100 }] },
  ],
  MA202: [
    { studentId: "std001", studentName: "Alice Wonderland", cgpa: 0, results: [{ subjectCode: "MA202", subjectName: "Calculus II", grade: "A-", marks: 88, totalMarks: 100 }] },
    { studentId: "std003", studentName: "Charlie Brown", cgpa: 0, results: [{ subjectCode: "MA202", subjectName: "Calculus II", grade: "C+", marks: 72, totalMarks: 100 }] },
  ],
};

const mockCourses = [
  { id: "CS101", name: "Introduction to Programming" },
  { id: "MA202", name: "Calculus II" },
];

export default function ResultsPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(mockCourses[0]?.id);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const name = localStorage.getItem("userName");
    setUserRole(role);
    setUserName(name);
  }, []);

  if (!userRole || !userName) {
    return <div className="text-center p-10">Loading results...</div>;
  }

  if (userRole === "student") {
    // For student view, we find their specific results.
    let studentData = mockStudentResults;
    if (userName.toLowerCase().includes("test student")) { // Example for "Test Student"
        studentData = {
            studentId: "teststd001",
            studentName: "Test Student",
            cgpa: 3.5,
            results: [
                { subjectCode: "CS101", subjectName: "Intro to Programming", grade: "B+", marks: 84, totalMarks: 100 },
                { subjectCode: "MA101", subjectName: "Calculus I", grade: "A", marks: 90, totalMarks: 100 },
            ],
        };
    } else if (!userName.toLowerCase().includes("alice")) { // For any other student not Alice
        studentData = { ...mockStudentResults, studentName: userName, results: mockStudentResults.results.map(r => ({...r, grade: "N/A", marks: 0})) };
    }


    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold font-headline text-foreground">My Results</h1>
          <p className="text-muted-foreground">View your academic performance.</p>
        </header>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{studentData.studentName}</CardTitle>
            <CardDescription>Overall CGPA: {studentData.cgpa.toFixed(2)}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Code</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentData.results.map((result) => (
                  <TableRow key={result.subjectCode}>
                    <TableCell>{result.subjectCode}</TableCell>
                    <TableCell>{result.subjectName}</TableCell>
                    <TableCell>{result.grade}</TableCell>
                    <TableCell>{result.marks}/{result.totalMarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Staff or Admin View
  const currentCourseResults = selectedCourse ? mockStaffCourseResults[selectedCourse] || [] : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Student Results</h1>
        <p className="text-muted-foreground">View collective results by course.</p>
      </header>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSpreadsheet/> Results Overview</CardTitle>
          <div className="mt-2">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {mockCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedCourse && currentCourseResults.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCourseResults.map((studentResult) => (
                  studentResult.results.map(res => ( // Assuming one result per student for selected course
                  <TableRow key={studentResult.studentId + res.subjectCode}>
                    <TableCell>{studentResult.studentId}</TableCell>
                    <TableCell>{studentResult.studentName}</TableCell>
                    <TableCell>{res.grade}</TableCell>
                    <TableCell>{res.marks}/{res.totalMarks}</TableCell>
                  </TableRow>
                  ))
                ))}
              </TableBody>
            </Table>
          ) : selectedCourse ? (
             <p className="text-muted-foreground p-4 text-center">No results found for the selected course.</p>
          ) : (
             <p className="text-muted-foreground p-4 text-center">Please select a course to view results.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
