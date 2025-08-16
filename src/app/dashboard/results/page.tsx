
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserRole, SchoolClass, Student, StaffMember, Subject } from "@/lib/constants";
import { TERMS, mockSchoolClasses as defaultClasses, defaultNigerianCurriculumSubjects, combineName } from "@/lib/constants"; 
import { FileSpreadsheet, Printer, BookOpen, AlertTriangle, FileText, CheckCircle, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Data Structures ---
interface SubjectResult {
  subjectId: string;
  subjectName: string;
  grade: string;
  score: number;
}

interface StudentTermResult {
  studentId: string;
  studentName: string;
  results: SubjectResult[];
  termAverage: number;
  termPosition: string; // e.g., "1st", "2nd"
}

// --- MOCK DATA GENERATION ---
const generateMockResults = (allStudents: Student[], allClasses: SchoolClass[], allSubjects: Subject[]): Record<string, StudentTermResult[]> => {
  const allResults: Record<string, StudentTermResult[]> = {};

  TERMS.forEach(term => {
    allClasses.forEach(cls => {
        const studentsInClass = allStudents.filter(s => s.classId === cls.id);
        if (studentsInClass.length === 0) return;

        const subjectsForClass = allSubjects.filter(sub => sub.schoolSection === cls.section);
        if (subjectsForClass.length === 0) return;

        const studentTermResults: StudentTermResult[] = studentsInClass.map(student => {
            let totalScore = 0;
            const results: SubjectResult[] = subjectsForClass.map(subject => {
                const score = Math.floor(Math.random() * 61) + 40; // Score between 40 and 100
                totalScore += score;
                let grade = "F";
                if (score >= 75) grade = "A";
                else if (score >= 65) grade = "B";
                else if (score >= 50) grade = "C";
                else if (score >= 45) grade = "D";
                else if (score >= 40) grade = "E";
                return { subjectId: subject.id, subjectName: subject.title, score, grade };
            });
            const termAverage = totalScore / subjectsForClass.length;
            return { studentId: student.id, studentName: combineName(student), results, termAverage, termPosition: "N/A" };
        });

        // Calculate positions
        studentTermResults.sort((a, b) => b.termAverage - a.termAverage);
        studentTermResults.forEach((result, index) => {
            const pos = index + 1;
            let suffix = "th";
            if (pos === 1) suffix = "st";
            else if (pos === 2) suffix = "nd";
            else if (pos === 3) suffix = "rd";
            result.termPosition = `${pos}${suffix}`;
        });
        
        const key = `${cls.id}-${term}`;
        allResults[key] = studentTermResults;
    });
  });
  return allResults;
};

const getStudentSpecificResults = (studentId: string, allMockResults: Record<string, StudentTermResult[]>) => {
    const studentResults: Record<string, { term: string; className: string; results: SubjectResult[]; termAverage: number; termPosition: string }> = {};
    for (const key in allMockResults) {
        const [classId, term] = key.split('-');
        const termResults = allMockResults[key];
        const studentResult = termResults.find(r => r.studentId === studentId);
        if (studentResult) {
            studentResults[key] = {
                term,
                className: classId,
                results: studentResult.results,
                termAverage: studentResult.termAverage,
                termPosition: studentResult.termPosition,
            };
        }
    }
    return studentResults;
}


export default function ResultsPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  
  // Data State
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allMockResults, setAllMockResults] = useState<Record<string, StudentTermResult[]>>({});

  // Student State
  const [studentResults, setStudentResults] = useState<Record<string, any> | null>(null);
  const [selectedTermForStudent, setSelectedTermForStudent] = useState<string | undefined>(TERMS[0]);

  // Staff/Admin State
  const [managedClasses, setManagedClasses] = useState<SchoolClass[]>([]);
  const [selectedClassIdForStaff, setSelectedClassIdForStaff] =useState<string | undefined>();
  const [selectedTermForStaff, setSelectedTermForStaff] = useState<string | undefined>(TERMS[0]);
  
  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const userId = localStorage.getItem("userId");
    setUserRole(role);

    // --- Load all necessary data from localStorage ---
    const storedUsersStr = localStorage.getItem('managedUsers') || '[]';
    const allUsers: (Student | StaffMember)[] = JSON.parse(storedUsersStr);
    const allStudents: Student[] = allUsers.filter(u => u.role === 'student') as Student[];
    
    const storedClassesStr = localStorage.getItem('schoolClasses');
    const currentClasses: SchoolClass[] = storedClassesStr ? JSON.parse(storedClassesStr) : defaultClasses;
    setAllClasses(currentClasses);

    const storedSubjectsStr = localStorage.getItem('schoolSubjectsData');
    const currentSubjects: Subject[] = storedSubjectsStr ? JSON.parse(storedSubjectsStr) : defaultNigerianCurriculumSubjects;
    setAllSubjects(currentSubjects);

    // --- Generate mock results based on loaded data ---
    const mockResults = generateMockResults(allStudents, currentClasses, currentSubjects);
    setAllMockResults(mockResults);

    // --- Role-specific setup ---
    if (role === 'student' && userId) {
      setStudentResults(getStudentSpecificResults(userId, mockResults));

    } else if (role === 'staff' && userId) {
        const staffUser = allUsers.find(u => u.id === userId) as StaffMember | undefined;
        if(staffUser?.assignedClasses) {
            const assigned = currentClasses.filter(c => staffUser.assignedClasses!.includes(c.id));
            setManagedClasses(assigned);
            if (assigned.length > 0) setSelectedClassIdForStaff(assigned[0].id);
        }
    } else if (role === 'admin' || role === 'head_of_section') {
        let visibleClasses = currentClasses;
        if(role === 'head_of_section') {
            const hosUser = allUsers.find(u => u.id === userId) as StaffMember | undefined;
            if (hosUser?.section) {
                visibleClasses = currentClasses.filter(c => c.section === hosUser.section);
            }
        }
        setManagedClasses(visibleClasses);
        if (visibleClasses.length > 0) setSelectedClassIdForStaff(visibleClasses[0].id);
    }
  }, []);

  const handlePrint = () => window.print();

  // --- RENDER STUDENT VIEW ---
  if (userRole === 'student') {
    if (!studentResults) return <div className="text-center p-10">Loading results...</div>;

    const studentTermData = Object.values(studentResults).find(res => res.term === selectedTermForStudent);
    const studentClassName = studentTermData ? (allClasses.find(c=> c.id === studentTermData.className)?.name || studentTermData.className) : "N/A";

    return (
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center print:hidden">
          <div>
            <h1 className="text-3xl font-bold font-headline text-foreground">My Results</h1>
            <p className="text-muted-foreground">View your academic performance by term.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
            <Select value={selectedTermForStudent} onValueChange={setSelectedTermForStudent}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                {TERMS.map(term => (<SelectItem key={term} value={term}>{term}</SelectItem>))}
              </SelectContent>
            </Select>
             <Button onClick={handlePrint} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!studentTermData}>
                <Printer className="mr-2 h-4 w-4" /> Print Results
            </Button>
          </div>
        </header>

        <Card className="shadow-xl printable-area print:shadow-none print:border-none print:p-0">
          <CardHeader className="print:text-center">
            <CardTitle className="text-2xl">Results for {selectedTermForStudent}</CardTitle>
            <CardDescription>Class: {studentClassName}</CardDescription>
          </CardHeader>
          <CardContent>
            {studentTermData ? (
                <>
                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Term Average</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{studentTermData.termAverage.toFixed(1)}%</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Class Position</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{studentTermData.termPosition}</div>
                        </CardContent>
                    </Card>
                 </div>
                 <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentTermData.results.map((res: SubjectResult) => (
                        <TableRow key={res.subjectId}>
                          <TableCell className="font-medium">{res.subjectName}</TableCell>
                          <TableCell className="text-center">{res.score}/100</TableCell>
                          <TableCell className="text-center font-semibold">{res.grade}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
            ) : (
                <p className="text-muted-foreground text-center py-10">No results found for {selectedTermForStudent}.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- RENDER STAFF/ADMIN VIEW ---
  const resultsKey = `${selectedClassIdForStaff}-${selectedTermForStaff}`;
  const broadsheetResults = allMockResults[resultsKey] || [];
  const subjectsForBroadsheet = selectedClassIdForStaff 
    ? allSubjects.filter(s => s.schoolSection === allClasses.find(c => c.id === selectedClassIdForStaff)?.section)
    : [];

  return (
    <div className="space-y-6 print:hidden">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Class Broadsheet</h1>
        <p className="text-muted-foreground">View and manage comprehensive results for classes.</p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSpreadsheet/> Broadsheet Filters</CardTitle>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select value={selectedClassIdForStaff} onValueChange={setSelectedClassIdForStaff}>
              <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
              <SelectContent>
                {managedClasses.length > 0 ? managedClasses.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name} ({cls.section})</SelectItem>
                )) : <SelectItem value="no-class" disabled>No classes available/assigned</SelectItem>}
              </SelectContent>
            </Select>
            <Select value={selectedTermForStaff} onValueChange={setSelectedTermForStaff}>
              <SelectTrigger><SelectValue placeholder="Select Term" /></SelectTrigger>
              <SelectContent>
                {TERMS.map(term => (<SelectItem key={term} value={term}>{term}</SelectItem>))}
              </SelectContent>
            </Select>
             <Button onClick={handlePrint} className="w-full lg:w-auto" disabled={broadsheetResults.length === 0}>
                <Printer className="mr-2 h-4 w-4" /> Print Broadsheet
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {broadsheetResults.length > 0 ? (
            <div className="overflow-x-auto">
                <Table className="min-w-full">
                <TableHeader>
                    <TableRow>
                    <TableHead className="sticky left-0 bg-card z-10">Student Name</TableHead>
                    {subjectsForBroadsheet.map(sub => <TableHead key={sub.id} className="text-center">{sub.code}</TableHead>)}
                    <TableHead className="text-center font-bold text-primary">Avg.</TableHead>
                    <TableHead className="text-center font-bold text-primary">Pos.</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {broadsheetResults.map(studentResult => (
                    <TableRow key={studentResult.studentId}>
                        <TableCell className="font-medium sticky left-0 bg-card z-10">{studentResult.studentName}</TableCell>
                        {subjectsForBroadsheet.map(sub => {
                            const result = studentResult.results.find(r => r.subjectId === sub.id);
                            return <TableCell key={sub.id} className="text-center">{result ? result.score : '-'}</TableCell>
                        })}
                        <TableCell className="text-center font-semibold">{studentResult.termAverage.toFixed(1)}%</TableCell>
                        <TableCell className="text-center font-semibold">{studentResult.termPosition}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
          ) : (
            <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Results Found</h3>
                <p className="text-muted-foreground mt-1">There are no results available for the selected class and term.</p>
                <Button variant="outline" className="mt-4" asChild>
                    <Link href="/dashboard/results/upload">Upload Results</Link>
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    