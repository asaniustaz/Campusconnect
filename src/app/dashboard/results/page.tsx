
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserRole } from "@/lib/constants";
import { TERMS } from "@/lib/constants";
import { FileSpreadsheet, TrendingUp } from "lucide-react";

interface SubjectResult {
  subjectCode: string;
  subjectName: string;
  grade: string;
  marks: number;
  totalMarks: number;
}

interface TermResult {
  term: string;
  results: SubjectResult[];
  termGpa?: number; // Optional term GPA
}

interface StudentOverallResult {
  studentId: string;
  studentName: string;
  cgpa: number;
  termResults: TermResult[];
}

// Mock Data (Expanded for terms)
const mockStudentResults: StudentOverallResult = {
  studentId: "std001",
  studentName: "Alice Wonderland",
  cgpa: 3.8,
  termResults: [
    {
      term: "First Term",
      termGpa: 3.7,
      results: [
        { subjectCode: "CS101", subjectName: "Intro to Programming", grade: "A", marks: 92, totalMarks: 100 },
        { subjectCode: "MA101", subjectName: "Calculus I", grade: "B+", marks: 85, totalMarks: 100 },
      ],
    },
    {
      term: "Second Term",
      termGpa: 3.9,
      results: [
        { subjectCode: "CS102", subjectName: "Data Structures", grade: "A-", marks: 88, totalMarks: 100 },
        { subjectCode: "PHY101", subjectName: "Physics I", grade: "A", marks: 90, totalMarks: 100 },
      ],
    },
  ],
};

const mockStaffCourseResults: { [courseId: string]: { term: string, studentResults: Omit<StudentOverallResult, 'termResults' | 'cgpa'> & { courseResult: SubjectResult }[] }[] } = {
  CS101: [
    {
      term: "First Term",
      studentResults: [
        { studentId: "std001", studentName: "Alice Wonderland", courseResult: { subjectCode: "CS101", subjectName: "Intro to Programming", grade: "A", marks: 92, totalMarks: 100 } },
        { studentId: "std002", studentName: "Bob The Builder", courseResult: { subjectCode: "CS101", subjectName: "Intro to Programming", grade: "B", marks: 85, totalMarks: 100 } },
      ]
    }
  ],
  MA202: [
     {
      term: "Second Term",
      studentResults: [
        { studentId: "std001", studentName: "Alice Wonderland", courseResult: { subjectCode: "MA202", subjectName: "Calculus II", grade: "A-", marks: 88, totalMarks: 100 } },
        { studentId: "std003", studentName: "Charlie Brown", courseResult: { subjectCode: "MA202", subjectName: "Calculus II", grade: "C+", marks: 72, totalMarks: 100 } },
      ]
    }
  ],
};

const mockCourses = [
  { id: "CS101", name: "Introduction to Programming" },
  { id: "MA202", name: "Calculus II" },
];


export default function ResultsPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string | undefined>(TERMS[0]);
  const [selectedCourseForStaff, setSelectedCourseForStaff] = useState<string | undefined>(mockCourses[0]?.id);


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
    let studentData = mockStudentResults;
    // Customize for "Test Student" or other generic students
    if (userName.toLowerCase().includes("test student")) {
        studentData = {
            studentId: "teststd001",
            studentName: "Test Student",
            cgpa: 3.5,
            termResults: [
                { term: "First Term", termGpa: 3.6, results: [{ subjectCode: "CS101", subjectName: "Intro to Programming", grade: "B+", marks: 84, totalMarks: 100 }]},
                { term: "Second Term", termGpa: 3.4, results: [{ subjectCode: "MA101", subjectName: "Calculus I", grade: "B", marks: 80, totalMarks: 100 }]},
            ]
        };
    } else if (!userName.toLowerCase().includes("alice")) {
        studentData = { ...mockStudentResults, studentName: userName, cgpa: 0, termResults: mockStudentResults.termResults.map(tr => ({...tr, results: tr.results.map(r => ({...r, grade: "N/A", marks: 0}))})) };
    }
    
    const currentTermData = studentData.termResults.find(tr => tr.term === selectedTerm);

    return (
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold font-headline text-foreground">My Results</h1>
            <p className="text-muted-foreground">View your academic performance by term.</p>
          </div>
           <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="w-full sm:w-[200px] mt-2 sm:mt-0">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                {TERMS.map(term => (
                  <SelectItem key={term} value={term}>{term}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </header>
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{studentData.studentName}</CardTitle>
              <CardDescription className="text-right">Overall CGPA: <span className="font-semibold text-primary">{studentData.cgpa.toFixed(2)}</span></CardDescription>
            </div>
            {currentTermData && currentTermData.termGpa && (
              <CardDescription>
                {currentTermData.term} GPA: <span className="font-semibold text-primary">{currentTermData.termGpa.toFixed(2)}</span>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {currentTermData ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTermData.results.map((result) => (
                    <TableRow key={result.subjectCode}>
                      <TableCell>{result.subjectCode}</TableCell>
                      <TableCell>{result.subjectName}</TableCell>
                      <TableCell>{result.grade}</TableCell>
                      <TableCell className="text-right">{result.marks}/{result.totalMarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">No results found for {selectedTerm}.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Staff or Admin View
  const courseResultsForSelectedTerm = selectedCourseForStaff ? 
    (mockStaffCourseResults[selectedCourseForStaff]?.find(ct => ct.term === selectedTerm)?.studentResults || []) 
    : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Student Results</h1>
        <p className="text-muted-foreground">View collective results by course and term.</p>
      </header>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSpreadsheet/> Results Overview</CardTitle>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Select value={selectedCourseForStaff} onValueChange={setSelectedCourseForStaff}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {mockCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                {TERMS.map(term => (
                  <SelectItem key={term} value={term}>{term}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedCourseForStaff && courseResultsForSelectedTerm.length > 0 ? (
            <>
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              {mockCourses.find(c => c.id === selectedCourseForStaff)?.name} - {selectedTerm}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseResultsForSelectedTerm.map((studentResult) => (
                  <TableRow key={studentResult.studentId + studentResult.courseResult.subjectCode}>
                    <TableCell>{studentResult.studentId}</TableCell>
                    <TableCell>{studentResult.studentName}</TableCell>
                    <TableCell>{studentResult.courseResult.grade}</TableCell>
                    <TableCell className="text-right">{studentResult.courseResult.marks}/{studentResult.courseResult.totalMarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </>
          ) : selectedCourseForStaff ? (
             <p className="text-muted-foreground p-4 text-center">No results found for the selected course and term.</p>
          ) : (
             <p className="text-muted-foreground p-4 text-center">Please select a course and term to view results.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
