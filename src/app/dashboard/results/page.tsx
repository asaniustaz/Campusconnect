
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserRole, SchoolClass } from "@/lib/constants";
import { TERMS, mockSchoolClasses as defaultClasses } from "@/lib/constants"; 
import { FileSpreadsheet, Printer, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubjectResult {
  subjectCode: string;
  subjectName: string;
  grade: string;
  marks: number;
  totalMarks: number;
}

interface TermResult {
  term: string;
  classId: string; 
  className: string; 
  results: SubjectResult[];
  termAverage?: number; 
}

interface StudentOverallResult {
  studentId: string;
  studentName: string;
  overallAverage: number; 
  termResults: TermResult[];
}

const mockStudentResults: StudentOverallResult = {
  studentId: "std001",
  studentName: "Alice Wonderland",
  overallAverage: 88.5,
  termResults: [
    {
      term: "First Term",
      classId: "jss1",
      className: "JSS 1",
      termAverage: 88.5,
      results: [
        { subjectCode: "JSS_ENG", subjectName: "English Studies (JSS)", grade: "A", marks: 92, totalMarks: 100 },
        { subjectCode: "JSS_MTH", subjectName: "Mathematics (JSS)", grade: "B+", marks: 85, totalMarks: 100 },
      ],
    },
    {
      term: "Second Term",
      classId: "jss1",
      className: "JSS 1",
      termAverage: 89,
      results: [
        { subjectCode: "JSS_ENG", subjectName: "English Studies (JSS)", grade: "A-", marks: 88, totalMarks: 100 },
        { subjectCode: "JSS_MTH", subjectName: "Mathematics (JSS)", grade: "A", marks: 90, totalMarks: 100 },
      ],
    },
     {
      term: "Third Term",
      classId: "jss1",
      className: "JSS 1",
      termAverage: 87,
      results: [
        { subjectCode: "JSS_ENG", subjectName: "English Studies (JSS)", grade: "B+", marks: 86, totalMarks: 100 },
        { subjectCode: "JSS_MTH", subjectName: "Mathematics (JSS)", grade: "B+", marks: 88, totalMarks: 100 },
      ],
    },
    {
      term: "First Term", // New academic year
      classId: "jss2",
      className: "JSS 2",
      termAverage: 90.5,
      results: [
        { subjectCode: "JSS_ENG", subjectName: "English Studies (JSS)", grade: "A", marks: 95, totalMarks: 100 },
        { subjectCode: "JSS_MTH", subjectName: "Mathematics (JSS)", grade: "A-", marks: 86, totalMarks: 100 },
      ],
    },
  ],
};

// Adjusted to reflect K-12 subject structure and mock classes
const mockStaffSubjectResults: { [subjectId: string]: { term: string, classId: string, className: string, studentResults: Omit<StudentOverallResult, 'termResults' | 'overallAverage'> & { subjectResult: SubjectResult }[] }[] } = {
  PRI_ENG: [
    {
      term: "First Term",
      classId: "pri1", 
      className: "Primary 1",
      studentResults: [
        { studentId: "std001", studentName: "Alice Wonderland", subjectResult: { subjectCode: "PRI_ENG", subjectName: "English Language (Primary)", grade: "A", marks: 92, totalMarks: 100 } },
        { studentId: "std002", studentName: "Bob The Builder", subjectResult: { subjectCode: "PRI_ENG", subjectName: "English Language (Primary)", grade: "B", marks: 85, totalMarks: 100 } },
      ]
    }
  ],
  JSS_MTH: [
     {
      term: "Second Term",
      classId: "jss1",
      className: "JSS 1",
      studentResults: [
        { studentId: "std001", studentName: "Alice Wonderland", subjectResult: { subjectCode: "JSS_MTH", subjectName: "Mathematics (JSS)", grade: "A-", marks: 88, totalMarks: 100 } },
        { studentId: "std003", studentName: "Charlie Brown", subjectResult: { subjectCode: "JSS_MTH", subjectName: "Mathematics (JSS)", grade: "C+", marks: 72, totalMarks: 100 } },
      ]
    }
  ],
};

// Staff now select a CLASS they are master of, then a SUBJECT taught in that class, then a TERM
interface StaffClassSubjectInfo {
  classId: string;
  className: string;
  subjects: { id: string; name: string }[]; // Subjects taught by this staff in this class
}


export default function ResultsPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  // Student state
  const [studentData, setStudentData] = useState<StudentOverallResult | null>(null);
  const [availableClassesForStudent, setAvailableClassesForStudent] = useState<{id: string; name: string}[]>([]);
  const [selectedClassIdForStudent, setSelectedClassIdForStudent] = useState<string | undefined>();
  const [selectedTermForStudent, setSelectedTermForStudent] = useState<string | undefined>(TERMS[0]);

  // Staff/Admin state
  const [selectedSubjectIdForStaff, setSelectedSubjectIdForStaff] = useState<string | undefined>();
  const [selectedClassIdForStaff, setSelectedClassIdForStaff] = useState<string | undefined>();
  const [selectedTermForStaff, setSelectedTermForStaff] = useState<string | undefined>(TERMS[0]);
  const [subjectsInSelectedClassForStaff, setSubjectsInSelectedClassForStaff] = useState<{id: string; name: string}[]>([]);
  const [staffAllocatedClasses, setStaffAllocatedClasses] = useState<SchoolClass[]>([]);
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);


  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const name = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId");
    setUserRole(role);
    setUserName(name);

    let currentClasses: SchoolClass[] = [];
    if (typeof window !== 'undefined') {
        const storedClassesString = localStorage.getItem('schoolClasses');
        if (storedClassesString) {
            try {
                currentClasses = JSON.parse(storedClassesString);
            } catch (e) {
                currentClasses = defaultClasses;
            }
        } else {
            currentClasses = defaultClasses;
        }
    }
    setAllClasses(currentClasses);

    if (role === "student") {
      let data = mockStudentResults;
      // Basic name matching for demo, in real app this would be fetched by ID
      if (name && name.toLowerCase().includes("test student")) {
          data = {
              studentId: "teststd001", studentName: "Test Student", overallAverage: 82.0,
              termResults: [
                  { term: "First Term", classId: "pri1", className: "Primary 1", termAverage: 84, results: [{ subjectCode: "PRI_ENG", subjectName: "English Language (Primary)", grade: "B+", marks: 84, totalMarks: 100 }]},
                  { term: "Second Term", classId: "pri1", className: "Primary 1", termAverage: 80, results: [{ subjectCode: "PRI_MTH", subjectName: "Mathematics (Primary)", grade: "B", marks: 80, totalMarks: 100 }]},
              ]
          };
      } else if (name && !name.toLowerCase().includes("alice")) {
          data = { ...mockStudentResults, studentName: name, overallAverage: 75, termResults: mockStudentResults.termResults.map(tr => ({...tr, termAverage: 75, results: tr.results.map(r => ({...r, grade: "C", marks: 70}))})) };
      }
      setStudentData(data);
      
      const uniqueClasses = Array.from(new Set(data.termResults.map(tr => JSON.stringify({id: tr.classId, name: tr.className}))))
                                .map(s => JSON.parse(s));
      setAvailableClassesForStudent(uniqueClasses);
      if (uniqueClasses.length > 0) {
        setSelectedClassIdForStudent(uniqueClasses[0].id);
      }

    } else if (role === "staff" || role === "admin") {
        let assignedClasses = currentClasses;
        if (role === 'staff' && userId) {
            const storedUsersString = localStorage.getItem('managedUsers');
            if (storedUsersString) {
                const allManagedUsers = JSON.parse(storedUsersString);
                const staffUser = allManagedUsers.find((u: any) => u.id === userId && u.role === 'staff');
                if (staffUser && staffUser.assignedClasses) {
                    assignedClasses = currentClasses.filter(cls => staffUser.assignedClasses.includes(cls.id));
                } else {
                    assignedClasses = []; // No classes assigned to this staff
                }
            } else {
                 assignedClasses = [];
            }
        }
        setStaffAllocatedClasses(assignedClasses);
        if (assignedClasses.length > 0) {
            setSelectedClassIdForStaff(assignedClasses[0].id);
        }
    }
  }, [userRole, userName]);

  // Effect to update subjects when staff selects a class
  useEffect(() => {
    if ((userRole === 'staff' || userRole === 'admin') && selectedClassIdForStaff) {
        const classDetails = allClasses.find(c => c.id === selectedClassIdForStaff);
        if (classDetails) {
            let MOCK_SUBJECTS_IN_CLASS = [
                { id: "JSS_ENG", name: "English (JSS)" }, { id: "JSS_MTH", name: "Math (JSS)" },
                { id: "SSS_BIO_S", name: "Biology (SSS Science)" },
                { id: "ISL_QUR", name: "Quran" }, { id: "ISL_ARB", name: "Arabic" },
                { id: "TAH_MEM", name: "Memorization" },
            ];
            
            setSubjectsInSelectedClassForStaff(MOCK_SUBJECTS_IN_CLASS);
            if (MOCK_SUBJECTS_IN_CLASS.length > 0) {
                 setSelectedSubjectIdForStaff(MOCK_SUBJECTS_IN_CLASS[0].id);
            } else {
                 setSelectedSubjectIdForStaff(undefined);
            }
        }
    }
  }, [selectedClassIdForStaff, userRole, allClasses]);

  const handlePrint = () => {
    window.print();
  };

  if (!userRole || !userName) {
    return <div className="text-center p-10 print:hidden">Loading results...</div>;
  }

  if (userRole === "student") {
    if (!studentData) return <div className="text-center p-10 print:hidden">Loading student data...</div>;
    
    const filteredTermResultsForClass = studentData.termResults.filter(tr => tr.classId === selectedClassIdForStudent);
    const currentTermData = filteredTermResultsForClass.find(tr => tr.term === selectedTermForStudent);

    return (
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center print:hidden">
          <div>
            <h1 className="text-3xl font-bold font-headline text-foreground">My Results</h1>
            <p className="text-muted-foreground">View your academic performance by class and term.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
            <Select value={selectedClassIdForStudent} onValueChange={setSelectedClassIdForStudent}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {availableClassesForStudent.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTermForStudent} onValueChange={setSelectedTermForStudent}>
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
        </header>

        <Card className="shadow-xl printable-area print:shadow-none print:border-none print:p-0">
          <CardHeader className="print:text-center">
            <div className="flex justify-between items-center print:flex-col print:items-center">
              <CardTitle className="text-2xl">{studentData.studentName}</CardTitle>
              <CardDescription className="text-right print:text-center print:mt-1">
                Overall Average: <span className="font-semibold text-primary">{studentData.overallAverage.toFixed(1)}%</span>
              </CardDescription>
            </div>
            {currentTermData && (
              <CardDescription className="mt-1 print:text-center">
                Results for: <span className="font-semibold text-primary">{currentTermData.className}</span> - <span className="font-semibold text-primary">{currentTermData.term}</span>
                {currentTermData.termAverage !== undefined && (
                  <> (Term Average: <span className="font-semibold text-primary">{currentTermData.termAverage.toFixed(1)}%</span>)</>
                )}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="print:p-0">
            {currentTermData && currentTermData.results.length > 0 ? (
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
              <p className="text-muted-foreground text-center py-4">No results found for the selected class and term.</p>
            )}
          </CardContent>
           {currentTermData && currentTermData.results.length > 0 && (
            <CardContent className="pt-6 print:hidden">
                 <Button onClick={handlePrint} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Printer className="mr-2 h-4 w-4" /> Print Results
                </Button>
            </CardContent>
           )}
        </Card>
      </div>
    );
  }

  // Staff or Admin View
  const staffResultsForClassSubjectTerm = (selectedClassIdForStaff && selectedSubjectIdForStaff && selectedTermForStaff) ? 
    (mockStaffSubjectResults[selectedSubjectIdForStaff]?.find(
        ct => ct.term === selectedTermForStaff && ct.classId === selectedClassIdForStaff
    )?.studentResults || []) 
    : [];


  return (
    <div className="space-y-6 print:hidden">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Student Results</h1>
        <p className="text-muted-foreground">View collective results by class, subject, and term.</p>
      </header>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSpreadsheet/> Results Overview</CardTitle>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select value={selectedClassIdForStaff} onValueChange={setSelectedClassIdForStaff}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                    {staffAllocatedClasses.length > 0 ? staffAllocatedClasses.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name} ({cls.section})</SelectItem>
                    )) : <SelectItem value="no-class" disabled>No classes available/assigned</SelectItem>}
                </SelectContent>
            </Select>

            <Select value={selectedSubjectIdForStaff} onValueChange={setSelectedSubjectIdForStaff} disabled={!selectedClassIdForStaff || subjectsInSelectedClassForStaff.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                 {subjectsInSelectedClassForStaff.length > 0 ? subjectsInSelectedClassForStaff.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                )) : <SelectItem value="no-subject" disabled>No subjects for this class</SelectItem>}
              </SelectContent>
            </Select>

            <Select value={selectedTermForStaff} onValueChange={setSelectedTermForStaff}>
              <SelectTrigger>
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
          {selectedClassIdForStaff && selectedSubjectIdForStaff && staffResultsForClassSubjectTerm.length > 0 ? (
            <>
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              {allClasses.find(c=>c.id === selectedClassIdForStaff)?.name} - {subjectsInSelectedClassForStaff.find(s => s.id === selectedSubjectIdForStaff)?.name} - {selectedTermForStaff}
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
                {staffResultsForClassSubjectTerm.map((studentResult) => (
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
          ) : selectedClassIdForStaff && selectedSubjectIdForStaff ? (
             <p className="text-muted-foreground p-4 text-center">No results found for the selected class, subject, and term.</p>
          ) : (
             <p className="text-muted-foreground p-4 text-center">Please select a class, subject and term to view results.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    

    
