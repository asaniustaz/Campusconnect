
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, Users } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { UserRole, Student, SchoolClass } from "@/lib/constants";
import { mockSchoolClasses, globalMockStudents, mockStaffListSimpleForClassMaster } from "@/lib/constants";

interface AttendanceRecord {
  [studentId: string]: boolean; // true for present, false for absent
}

export default function AttendancePage() {
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // For staff to filter classes

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const storedUserId = localStorage.getItem("userId"); // Assuming userId is stored for staff
    setUserRole(role);
    if (role === 'staff' && storedUserId) {
        setUserId(storedUserId);
    } else if (role === 'staff') {
        // Fallback: try to get ID from username if `userId` not in localStorage
        const staffName = localStorage.getItem("userName");
        const matchedStaff = mockStaffListSimpleForClassMaster.find(s => s.name === staffName);
        if (matchedStaff) setUserId(matchedStaff.id);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      const students = globalMockStudents.filter(student => student.classId === selectedClassId);
      setStudentsInClass(students);
      const initialAttendance: AttendanceRecord = {};
      students.forEach(student => initialAttendance[student.id] = true); // Default to present
      setAttendance(initialAttendance);
    } else {
      setStudentsInClass([]);
      setAttendance({});
    }
  }, [selectedClassId]);


  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendance(prev => ({ ...prev, [studentId]: isPresent }));
  };

  const handleSaveAttendance = () => {
    if (!selectedClassId || !selectedDate) {
        toast({ variant: "destructive", title: "Error", description: "Please select a class and date." });
        return;
    }
    const className = mockSchoolClasses.find(c => c.id === selectedClassId)?.name;
    console.log("Attendance for class:", className, "on", format(selectedDate, "PPP"), ":", attendance);
    toast({
      title: "Attendance Saved",
      description: `Attendance for ${className || 'class'} on ${format(selectedDate, "PPP")} has been recorded.`,
    });
  };
  
  if (userRole !== 'staff' && userRole !== 'admin') {
     return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="text-2xl text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription>This page is only accessible to staff or admin members.</CardDescription>
        </Card>
      </div>
    );
  }

  const availableClassesForStaff = userRole === 'admin' 
    ? mockSchoolClasses 
    : mockSchoolClasses.filter(cls => cls.classMasterId === userId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Mark Class Attendance</h1>
        <p className="text-muted-foreground">Select class and date to mark student attendance.</p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Attendance Sheet</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {availableClassesForStaff.length > 0 ? availableClassesForStaff.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name} ({cls.displayLevel})</SelectItem>
                )) : <SelectItem value="no-class" disabled>No classes assigned/available</SelectItem>}
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
                  disabled={(date) => date.getDay() === 0 || date.getDay() === 6} // Disable weekends
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {selectedClassId && studentsInClass.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center">Present</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsInClass.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.rollNumber || 'N/A'}</TableCell>
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
          ) : selectedClassId ? (
             <p className="text-muted-foreground text-center py-10">No students found in the selected class.</p>
          ) : (
            <p className="text-muted-foreground text-center py-10">Please select a class to view the attendance sheet.</p>
          )}
          {selectedClassId && studentsInClass.length > 0 && (
            <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveAttendance} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Save className="mr-2 h-4 w-4"/> Save Attendance
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    