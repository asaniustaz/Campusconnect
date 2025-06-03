
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserRole } from "@/lib/constants";
import { TERMS } from "@/lib/constants"; // Using TERMS from constants
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
  termAverage?: number; // Optional term Average
}

interface StudentOverallResult {
  studentId: string;
  studentName: string;
  overallAverage: number; // Changed from CGPA
  termResults: TermResult[];
}

// Mock Data (Expanded for terms, K-12 subjects)
const mockStudentResults: StudentOverallResult = {
  studentId: "std001",
  studentName: "Alice Wonderland",
  overallAverage: 88.5, // Example average
  termResults: [
    {
      term: "First Term",
      termAverage: 88.5,
      results: [
        { subjectCode: "PRI_ENG", subjectName: "English Language (Primary)", grade: "A", marks: 92, totalMarks: 100 },
        { subjectCode: "PRI_MTH", subjectName: "Mathematics (Primary)", grade: "B+", marks: 85, totalMarks: 100 },
      ],
    },
    {
      term: "Second Term",
      termAverage: 89,
      results: [
        { subjectCode: "PRI_ENG", subjectName: "English Language (Primary)", grade: "A-", marks: 88, totalMarks: 100 },
        { subjectCode: "PRI_MTH", subjectName: "Mathematics (Primary)", grade: "A", marks: 90, totalMarks: 100 },
      ],
    },
  ],
};

const mockStaffSubjectResults: { [subjectId: string]: { term: string, studentResults: Omit<StudentOverallResult, 'termResults' | 'overallAverage'> & { subjectResult: SubjectResult }[] }[] } = {
  PRI_ENG: [
    {
      term: "First Term",
      studentResults: [
        { studentId: "std001", studentName: "Alice Wonderland", subjectResult: { subjectCode: "PRI_ENG", subjectName: "English Language (Primary)", grade: "A", marks: 92, totalMarks: 100 } },
        { studentId: "std002", studentName: "Bob The Builder", subjectResult: { subjectCode: "PRI_ENG", subjectName: "English Language (Primary)", grade: "B", marks: 85, totalMarks: 100 } },
      ]
    }
  ],
  JSS_MTH: [
     {
      term: "Second Term",
      studentResults: [
        { studentId: "std001", studentName: "Alice Wonderland", subjectResult: { subjectCode: "JSS_MTH", subjectName: "Mathematics (JSS)", grade: "A-", marks: 88, totalMarks: 100 } },
        { studentId: "std003", studentName: "Charlie Brown", subjectResult: { subjectCode: "JSS_MTH", subjectName: "Mathematics (JSS)", grade: "C+", marks: 72, totalMarks: 100 } },
      ]
    }
  ],
};

const mockSubjectsForStaffView = [ // K-12 subjects
  { id: "PRI_ENG", name: "English Language (Primary)" },
  { id: "JSS_MTH", name: "Mathematics (JSS)" },
  { id: "SSS_BIO_S", name: "Biology (SSS Science)" },
];


export default function ResultsPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string | undefined>(TERMS[0]);
  const [selectedSubjectForStaff, setSelectedSubjectForStaff] = useState<string | undefined>(mockSubjectsForStaffView[0]?.id);


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
    if (userName.toLowerCase().includes("test student")) {
        studentData = {
            studentId: "teststd001",
            studentName: "Test Student",
            overallAverage: 82.0,
            termResults: [
                { term: "First Term", termAverage: 84, results: [{ subjectCode: "PRI_ENG", subjectName: "English Language (Primary)", grade: "B+", marks: 84, totalMarks: 100 }]},
                { term: "Second Term", termAverage: 80, results: [{ subjectCode: "PRI_MTH", subjectName: "Mathematics (Primary)", grade: "B", marks: 80, totalMarks: 100 }]},
            ]
        };
    } else if (!userName.toLowerCase().includes("alice")) { // For other generic students
        studentData = { ...mockStudentResults, studentName: userName, overallAverage: 0, termResults: mockStudentResults.termResults.map(tr => ({...tr, termAverage: 0, results: tr.results.map(r => ({...r, grade: "N/A", marks: 0}))})) };
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
              <CardDescription className="text-right">Overall Average: <span className="font-semibold text-primary">{studentData.overallAverage.toFixed(1)}%</span></CardDescription>
            </div>
            {currentTermData && currentTermData.termAverage !== undefined && (
              <CardDescription>
                {currentTermData.term} Average: <span className="font-semibold text-primary">{currentTermData.termAverage.toFixed(1)}%</span>
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
  const subjectResultsForSelectedTerm = selectedSubjectForStaff ? 
    (mockStaffSubjectResults[selectedSubjectForStaff]?.find(ct => ct.term === selectedTerm)?.studentResults || []) 
    : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Student Results</h1>
        <p className="text-muted-foreground">View collective results by subject and term.</p>
      </header>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSpreadsheet/> Results Overview</CardTitle>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Select value={selectedSubjectForStaff} onValueChange={setSelectedSubjectForStaff}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {mockSubjectsForStaffView.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
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
          {selectedSubjectForStaff && subjectResultsForSelectedTerm.length > 0 ? (
            <>
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              {mockSubjectsForStaffView.find(s => s.id === selectedSubjectForStaff)?.name} - {selectedTerm}
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
                {subjectResultsForSelectedTerm.map((studentResult) => (
                  <TableRow key={studentResult.studentId + studentResult.subjectResult.subjectCode}>
                    <TableCell>{studentResult.studentId}</TableCell>
                    <TableCell>{studentResult.studentName}</TableCell>
                    <TableCell>{studentResult.subjectResult.grade}</TableCell>
                    <TableCell className="text-right">{studentResult.subjectResult.marks}/{studentResult.subjectResult.totalMarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </>
          ) : selectedSubjectForStaff ? (
             <p className="text-muted-foreground p-4 text-center">No results found for the selected subject and term.</p>
          ) : (
             <p className="text-muted-foreground p-4 text-center">Please select a subject and term to view results.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    