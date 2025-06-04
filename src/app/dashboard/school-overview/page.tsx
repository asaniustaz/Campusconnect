
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, Users, HelpCircle, Eye } from "lucide-react";
import type { UserRole, SchoolClass, Student } from "@/lib/constants"; 
import { mockSchoolClasses } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManagedUserForDisplay {
  id: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  assignedClasses?: string[]; // Staff member's assigned class IDs
}

export default function SchoolOverviewPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [allStaff, setAllStaff] = useState<ManagedUserForDisplay[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]); 

  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [selectedClassForStudentList, setSelectedClassForStudentList] = useState<SchoolClass | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    setUserRole(role);

    if (typeof window !== 'undefined') {
      const storedUsersString = localStorage.getItem('managedUsers');
      if (storedUsersString) {
        try {
          const allManagedUsers: (ManagedUserForDisplay | Student)[] = JSON.parse(storedUsersString);
          const staffUsers = allManagedUsers.filter(u => u.role === 'staff' || u.role === 'admin') as ManagedUserForDisplay[];
          // Ensure students also get avatarUrl if present
          const studentUsers = allManagedUsers.filter(u => u.role === 'student').map(u => ({
            ...u,
            avatarUrl: (u as Student).avatarUrl || `https://placehold.co/40x40.png?text=${u.name[0]}`,
          })) as Student[];
          setAllStaff(staffUsers);
          setAllStudents(studentUsers);
        } catch (e) {
          console.error("Failed to parse users from localStorage", e);
          setAllStaff([]);
          setAllStudents([]);
        }
      }
    }
  }, []);

  if (userRole !== 'admin' && userRole !== 'staff') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="text-2xl text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription>This page is only accessible to admin or staff members.</CardDescription>
        </Card>
      </div>
    );
  }

  const getClassMasterForClass = (classId: string): ManagedUserForDisplay | undefined => {
    return allStaff.find(staff => staff.assignedClasses && staff.assignedClasses.includes(classId));
  };

  const getStudentCountForClass = (classId: string): number => {
    return allStudents.filter(student => student.classId === classId).length;
  };

  const handleOpenStudentDialog = (classItem: SchoolClass) => {
    setSelectedClassForStudentList(classItem);
    setIsStudentDialogOpen(true);
  };

  const studentsInSelectedClass = selectedClassForStudentList 
    ? allStudents.filter(student => student.classId === selectedClassForStudentList.id)
    : [];


  const displayLevels: SchoolClass['displayLevel'][] = ['Kindergarten', 'Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary'];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">School Overview</h1>
        <p className="text-muted-foreground">View class distributions, student counts, assigned class masters, and student details.</p>
      </header>

      {displayLevels.map((displayLevel) => {
        const classesForLevel = mockSchoolClasses.filter(cls => cls.displayLevel === displayLevel);
        if (classesForLevel.length === 0) return null;

        return (
          <Card key={displayLevel} className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-primary">
                <Building className="mr-3 h-7 w-7" /> {displayLevel} Section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead className="text-center">Student Count</TableHead>
                    <TableHead>Class Master</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classesForLevel.map((cls) => {
                    const classMaster = getClassMasterForClass(cls.id);
                    const studentCount = getStudentCountForClass(cls.id);
                    const masterInitials = classMaster ? classMaster.name.split(' ').map(n=>n[0]).join('') : '?';
                    const masterAvatar = classMaster?.avatarUrl || `https://placehold.co/40x40.png?text=${masterInitials}`;

                    return (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            {studentCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          {classMaster ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={masterAvatar} alt={classMaster.name} data-ai-hint="teacher avatar" />
                                <AvatarFallback>{masterInitials}</AvatarFallback>
                              </Avatar>
                              <span>{classMaster.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-muted-foreground">
                               <HelpCircle className="h-4 w-4 mr-2"/> Not Assigned
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="outline" size="sm" onClick={() => handleOpenStudentDialog(cls)}>
                            <Eye className="mr-2 h-4 w-4" /> View Students
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Students in {selectedClassForStudentList?.name || "Class"}</DialogTitle>
            <DialogDescription>
              List of students enrolled in {selectedClassForStudentList?.displayLevel} - {selectedClassForStudentList?.name}.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-4">
            {studentsInSelectedClass.length > 0 ? (
              <div className="space-y-3 pr-2">
                {studentsInSelectedClass.map(student => {
                  const studentInitials = student.name.split(' ').map(n=>n[0]).join('').toUpperCase() || 'S';
                  const studentAvatar = student.avatarUrl || `https://placehold.co/40x40.png?text=${studentInitials}`;
                  return (
                    <div key={student.id} className="flex items-center gap-3 p-3 border rounded-md bg-secondary/30 hover:bg-secondary/50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={studentAvatar} alt={student.name} data-ai-hint="student avatar" />
                        <AvatarFallback>{studentInitials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">No students found in this class.</p>
            )}
          </ScrollArea>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="mt-4">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
