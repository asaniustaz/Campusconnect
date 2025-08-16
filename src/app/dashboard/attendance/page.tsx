
"use client";

import { useState, useEffect } from "react";
import Link from "next/link"; // Import Link
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
import type { UserRole, Student, SchoolClass } from "@/lib/constants";
import { mockSchoolClasses as defaultClasses, globalMockStudents, combineName } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AttendanceRecord {
  [studentId: string]: boolean; // true for present, false for absent
}

interface ManagedUserForAttendance { // Minimal interface for staff details
  id: string;
  firstName: string;
  surname: string;
  middleName?: string;
  role: UserRole;
  assignedClasses?: string[];
}

export default function AttendancePage() {
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentStaff, setCurrentStaff] = useState<ManagedUserForAttendance | null>(null);
  const [availableClassesForStaff, setAvailableClassesForStaff] = useState<SchoolClass[]>([]);
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const storedUserId = localStorage.getItem("userId");
    setUserRole(role);

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

    if (role === 'admin') {
      setAvailableClassesForStaff(currentClasses);
    } else if (role === 'staff' && storedUserId && typeof window !== 'undefined') {
      const storedUsersString = localStorage.getItem('managedUsers');
      if (storedUsersString) {
        try {
          const allManagedUsers: (ManagedUserForAttendance | Student)[] = JSON.parse(storedUsersString);
          const staffUser = allManagedUsers.find(u => u.id === storedUserId && u.role === 'staff') as ManagedUserForAttendance | undefined;
          if (staffUser) {
            setCurrentStaff(staffUser);
            const staffAssignedClassIds = staffUser.assignedClasses || [];
            const classesForStaff = currentClasses.filter(cls => 
              staffAssignedClassIds.includes(cls.id)
            );
            setAvailableClassesForStaff(classesForStaff);
          } else {
            setAvailableClassesForStaff([]); // Staff not found or no assigned classes
          }
        } catch (e) {
          console.error("Failed to parse users from localStorage for attendance", e);
          setAvailableClassesForStaff([]);
        }
      } else {
         setAvailableClassesForStaff([]); // No managed users in local storage
      }
    } else {
      setAvailableClassesForStaff([]); // Not admin or staff, or no user ID
    }
  }, [userRole]);

  useEffect(() => {
    if (selectedClassId) {
      let currentStudents: Student[] = [];
      if (typeof window !== 'undefined') {
        const storedUsersString = localStorage.getItem('managedUsers');
        if (storedUsersString) {
          try {
            const allManagedUsers: Student[] = JSON.parse(storedUsersString);
            currentStudents = allManagedUsers.filter((u: Student) => u.role === 'student' && u.classId === selectedClassId);
          } catch (e) {
            console.error("Failed to parse students from localStorage for attendance", e);
            currentStudents = globalMockStudents.filter(student => student.classId === selectedClassId);
          }
        } else {
           currentStudents = globalMockStudents.filter(student => student.classId === selectedClassId);
        }
      } else {
         currentStudents = globalMockStudents.filter(student => student.classId === selectedClassId);
      }
      
      setStudentsInClass(currentStudents);
      const initialAttendance: AttendanceRecord = {};
      currentStudents.forEach(student => initialAttendance[student.id] = true); // Default to present
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
    const className = allClasses.find(c => c.id === selectedClassId)?.name;
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
                  <SelectItem key={cls.id} value={cls.id}>{cls.name} ({cls.section})</SelectItem>
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
                  disabled={(date) => date.getDay() === 0 || date.getDay() === 6 || date > new Date()} // Disable weekends and future dates
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
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center">Present</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsInClass.map((student) => {
                  const name = combineName(student);
                  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase() || 'S';
                  const avatarSrc = student.avatarUrl || `https://placehold.co/40x40.png?text=${initials}`;
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Link href={`/dashboard/student/${student.id}/profile`} passHref>
                          <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                            <AvatarImage src={avatarSrc} alt={name} data-ai-hint="student avatar" />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                        </Link>
                      </TableCell>
                      <TableCell>{student.rollNumber || 'N/A'}</TableCell>
                      <TableCell>{name}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={attendance[student.id] || false}
                          onCheckedChange={(checked) => handleAttendanceChange(student.id, !!checked)}
                          aria-label={`Mark ${name} as ${attendance[student.id] ? 'absent' : 'present'}`}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : selectedClassId ? (
             <p className="text-muted-foreground text-center py-10">No students found in the selected class. Ensure students are assigned to this class via 'Manage Users'.</p>
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
    

    
