"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/lib/constants";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
}

interface AttendanceRecord {
  [studentId: string]: boolean; // true for present, false for absent
}

const mockStudents: Student[] = [
  { id: "std001", name: "Alice Wonderland", rollNumber: "S001" },
  { id: "std002", name: "Bob The Builder", rollNumber: "S002" },
  { id: "std003", name: "Charlie Brown", rollNumber: "S003" },
  { id: "std004", name: "Diana Prince", rollNumber: "S004" },
  { id: "std005", name: "Edward Scissorhands", rollNumber: "S005" },
];

const mockCourses = [
  { id: "CS101", name: "Introduction to Programming" },
  { id: "MA202", name: "Calculus II" },
];

export default function AttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(mockCourses[0]?.id);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    setUserRole(role);
    // Initialize attendance: all present by default for the selected course
    const initialAttendance: AttendanceRecord = {};
    mockStudents.forEach(student => initialAttendance[student.id] = true);
    setAttendance(initialAttendance);
  }, []);

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendance(prev => ({ ...prev, [studentId]: isPresent }));
  };

  const handleSaveAttendance = () => {
    // Mock saving attendance
    console.log("Attendance for", selectedCourse, "on", selectedDate, ":", attendance);
    toast({
      title: "Attendance Saved",
      description: `Attendance for ${mockCourses.find(c=>c.id === selectedCourse)?.name || 'course'} on ${selectedDate ? format(selectedDate, "PPP") : ''} has been recorded.`,
    });
  };
  
  if (userRole !== 'staff') {
     return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="text-2xl text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription>This page is only accessible to staff members.</CardDescription>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Mark Attendance</h1>
        <p className="text-muted-foreground">Select course and date to mark student attendance.</p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Attendance Sheet</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {mockCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full sm:w-[250px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll Number</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead className="text-center">Present</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={attendance[student.id] || false}
                      onCheckedChange={(checked) => handleAttendanceChange(student.id, !!checked)}
                      aria-label={`Mark ${student.name} as ${attendance[student.id] ? 'absent' : 'present'}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveAttendance} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Save className="mr-2 h-4 w-4"/> Save Attendance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
