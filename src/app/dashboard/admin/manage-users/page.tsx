
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { UserRole, SchoolSection, SchoolClass, Student, StaffMember } from "@/lib/constants";
import { SCHOOL_SECTIONS, mockSchoolClasses as defaultClasses, combineName } from "@/lib/constants";
import { UserPlus, Users, Briefcase, Edit, Trash2, ListChecks, GraduationCap, Upload } from "lucide-react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Papa from "papaparse";
import * as XLSX from "xlsx";

// Student Schema for Add/Edit
const studentSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  surname: z.string().min(2, "Surname is required"),
  middleName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  schoolSection: z.custom<SchoolSection>((val) => SCHOOL_SECTIONS.includes(val as SchoolSection), "Please select a school section"),
  classId: z.string().optional(), 
  password: z.string().min(6, "Password must be at least 6 characters.").optional(), 
  rollNumber: z.string().optional(),
});
type StudentFormData = z.infer<typeof studentSchema>;

// Staff Schema for Add/Edit
const staffSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  surname: z.string().min(2, "Surname is required"),
  middleName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  role: z.custom<UserRole>((val) => ['staff', 'head_of_section'].includes(val as UserRole), "Please select a valid role."),
  department: z.string().min(2, "Department is required"),
  title: z.string().min(2, "Job title is required"),
  password: z.string().min(6, "Password must be at least 6 characters for new staff.").optional(),
  assignedClasses: z.array(z.string()).optional(),
  section: z.custom<SchoolSection>().optional(),
}).refine(data => {
    if (data.role === 'head_of_section') {
        return !!data.section;
    }
    return true;
}, {
    message: "A section must be assigned for a Head of Section.",
    path: ["section"],
});

type StaffFormData = z.infer<typeof staffSchema>;


export default function ManageUsersPage() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);

  const studentForm = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
        firstName: "",
        surname: "",
        middleName: "",
        email: "",
        schoolSection: undefined,
        classId: undefined,
        password: "",
        rollNumber: ""
    }
  });

  const staffForm = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
        firstName: "",
        surname: "",
        middleName: "",
        email: "",
        department: "",
        title: "",
        password: "",
        assignedClasses: [],
        role: "staff",
        section: undefined,
    }
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const userId = localStorage.getItem("userId");
    setUserRole(role);

    if (typeof window !== 'undefined') {
      const storedUsersString = localStorage.getItem('managedUsers');
      if (storedUsersString) {
        try {
          const allStoredUsers: (Student | StaffMember)[] = JSON.parse(storedUsersString);
          setStudentList(allStoredUsers.filter(u => u.role === 'student') as Student[]);
          const staffAndAdmins = allStoredUsers.filter(u => u.role === 'staff' || u.role === 'admin' || u.role === 'head_of_section') as StaffMember[];
          setStaffList(staffAndAdmins);

          if (userId && (role === 'admin' || role === 'head_of_section')) {
            const foundUser = staffAndAdmins.find(u => u.id === userId);
            if(foundUser) setCurrentUser(foundUser);
          }
        } catch (e) {
          console.error("Failed to parse users from localStorage", e);
        }
      }
      
      const storedClassesString = localStorage.getItem('schoolClasses');
      if (storedClassesString) {
        try {
            setAllClasses(JSON.parse(storedClassesString));
        } catch (e) {
            setAllClasses(defaultClasses);
        }
      } else {
        setAllClasses(defaultClasses);
      }
    }
  }, []);


  useEffect(() => {
    if (editingStudent) {
      studentForm.reset({
        firstName: editingStudent.firstName,
        surname: editingStudent.surname,
        middleName: editingStudent.middleName,
        email: editingStudent.email,
        schoolSection: editingStudent.schoolSection,
        classId: editingStudent.classId,
        password: "", // Clear password field on edit
        rollNumber: editingStudent.rollNumber,
      });
    } else {
      studentForm.reset({ firstName: "", surname: "", middleName: "", email: "", schoolSection: userRole === 'head_of_section' ? currentUser?.section : undefined, classId: undefined, password: "", rollNumber: ""});
    }
  }, [editingStudent, studentForm, userRole, currentUser]);

  useEffect(() => {
    if (editingStaff) {
      staffForm.reset({
        firstName: editingStaff.firstName,
        surname: editingStaff.surname,
        middleName: editingStaff.middleName,
        email: editingStaff.email,
        department: editingStaff.department,
        title: editingStaff.title,
        password: "", // Clear password field on edit
        assignedClasses: editingStaff.assignedClasses || [],
        role: editingStaff.role,
        section: editingStaff.section,
      });
    } else {
      staffForm.reset({ firstName: "", surname: "", middleName: "", email: "", department: "", title: "", password: "", assignedClasses: [], role: 'staff', section: userRole === 'head_of_section' ? currentUser?.section : undefined });
    }
  }, [editingStaff, staffForm, userRole, currentUser]);

  const saveUsersToLocalStorage = (updatedStudents: Student[], updatedStaff: StaffMember[]) => {
    if (typeof window !== 'undefined') {
      const allUsers = [...updatedStudents, ...updatedStaff];
      localStorage.setItem('managedUsers', JSON.stringify(allUsers));
    }
  };

  const processImportedData = (data: any[]) => {
    const requiredFields = ["firstName", "surname", "schoolSection", "classId", "rollNumber"];
    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    if (!requiredFields.every(field => headers.includes(field))) {
      toast({ variant: "destructive", title: "Import Failed", description: `File must contain the following headers: ${requiredFields.join(", ")}` });
      return;
    }
    
    let newStudents: Student[] = [];
    let errors: string[] = [];
    data.forEach((row: any, index) => {
       if (userRole === 'head_of_section' && row.schoolSection !== currentUser?.section) {
        errors.push(`Row ${index + 2}: You can only add students to your own section (${currentUser?.section}).`);
        return;
      }
      if (!row.firstName || !row.surname) {
        errors.push(`Row ${index + 2}: Missing required firstName or surname.`);
        return;
      }
      const newStudent: Student = {
        id: `stud-${Date.now()}-${index}`,
        firstName: String(row.firstName),
        surname: String(row.surname),
        middleName: String(row.middleName || ''),
        email: String(row.email || ''),
        password: String(row.surname).toLowerCase(), // Set password to surname
        schoolSection: row.schoolSection as SchoolSection,
        classId: row.classId ? String(row.classId) : undefined,
        rollNumber: row.rollNumber ? String(row.rollNumber) : undefined,
        role: 'student',
      };
      newStudents.push(newStudent);
    });

    if (errors.length > 0) {
      toast({ variant: "destructive", title: "Import Errors", description: errors.slice(0, 5).join("\n") });
    } else {
      const updatedStudentList = [...studentList, ...newStudents];
      setStudentList(updatedStudentList);
      saveUsersToLocalStorage(updatedStudentList, staffList);
      toast({ title: "Import Successful", description: `${newStudents.length} students have been added.` });
    }
  };

  const handleStudentFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({ variant: "destructive", title: "File Error", description: "No file selected." });
      return;
    }

    const fileType = file.type;
    const reader = new FileReader();

    if (fileType === "text/csv") {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                processImportedData(results.data);
            },
            error: (error) => {
                toast({ variant: "destructive", title: "CSV Parsing Error", description: error.message });
            }
        });
    } else if (fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileType === "application/vnd.ms-excel") {
        reader.onload = (e) => {
            const data = e.target?.result;
            if(data) {
                try {
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    processImportedData(json);
                } catch (error: any) {
                     toast({ variant: "destructive", title: "Excel Parsing Error", description: error.message });
                }
            }
        };
        reader.onerror = (e) => {
             toast({ variant: "destructive", title: "File Read Error", description: "Could not read the selected file." });
        };
        reader.readAsArrayBuffer(file);
    } else {
        toast({ variant: "destructive", title: "Unsupported File Type", description: "Please upload a .csv or .xlsx file." });
    }

    event.target.value = ""; // Reset file input
  };


  const onStudentSubmit: SubmitHandler<StudentFormData> = (data) => {
    let newStudentList = [...studentList];
    if (editingStudent) {
      const updatedStudentData: Student = {
        ...editingStudent,
        firstName: data.firstName,
        surname: data.surname,
        middleName: data.middleName,
        email: data.email,
        schoolSection: data.schoolSection!,
        classId: data.classId, 
        rollNumber: data.rollNumber,
        password: data.password ? data.password : editingStudent.password,
        role: 'student',
      };
      newStudentList = studentList.map(s => s.id === editingStudent.id ? updatedStudentData : s);
      setStudentList(newStudentList);
      toast({ title: "Student Updated", description: `${combineName(data)}'s details have been updated.` });
      setEditingStudent(null);
    } else {
      const newStudentData: Student = {
        id: `stud-${Date.now()}`,
        firstName: data.firstName,
        surname: data.surname,
        middleName: data.middleName,
        email: data.email,
        schoolSection: data.schoolSection!,
        classId: data.classId, 
        rollNumber: data.rollNumber,
        password: data.surname.toLowerCase(), // Set password to surname
        role: 'student',
      };
      newStudentList.push(newStudentData);
      setStudentList(newStudentList);
      toast({ title: "Student Added", description: `${combineName(data)} has been added.` });
    }
    saveUsersToLocalStorage(newStudentList, staffList);
    studentForm.reset({ firstName: "", surname: "", middleName: "", email: "", schoolSection: userRole === 'head_of_section' ? currentUser?.section : undefined, classId: undefined, password: "", rollNumber: ""});
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    studentForm.clearErrors("password"); // Clear password error when starting edit
  };

  const handleCancelStudentEdit = () => {
    setEditingStudent(null);
    studentForm.reset({ firstName: "", surname: "", middleName: "", email: "", schoolSection: userRole === 'head_of_section' ? currentUser?.section : undefined, classId: undefined, password: "", rollNumber: ""});
  };

  const handleDeleteStudent = (studentId: string) => {
    const newStudentList = studentList.filter(s => s.id !== studentId);
    setStudentList(newStudentList);
    saveUsersToLocalStorage(newStudentList, staffList);
    toast({ title: "Student Deleted", description: "Student has been removed.", variant: "destructive" });
    if (editingStudent && editingStudent.id === studentId) {
      handleCancelStudentEdit();
    }
  };


  const onStaffSubmit: SubmitHandler<StaffFormData> = (data) => {
    let newStaffList = [...staffList];
    if (editingStaff) {
      const updatedStaff: StaffMember = {
        ...editingStaff,
        firstName: data.firstName,
        surname: data.surname,
        middleName: data.middleName,
        email: data.email,
        department: data.department,
        title: data.title,
        password: data.password ? data.password : editingStaff.password, // Store actual password
        assignedClasses: data.assignedClasses || [],
        role: data.role,
        section: data.role === 'head_of_section' ? data.section : undefined,
      };
      newStaffList = staffList.map(staff => staff.id === editingStaff.id ? updatedStaff : staff);
      setStaffList(newStaffList);
      toast({ title: "Staff Updated", description: `${combineName(data)}'s details have been updated.` });
      setEditingStaff(null);
    } else {
      if (!data.password || data.password.length < 6) {
        staffForm.setError("password", { type: "manual", message: "Password must be at least 6 characters for new staff."});
        return;
      }
      const newStaffMember: StaffMember = {
        id: `staff-${Date.now()}`,
        firstName: data.firstName,
        surname: data.surname,
        middleName: data.middleName,
        email: data.email,
        department: data.department,
        title: data.title,
        password: data.password, // Store actual password
        assignedClasses: data.assignedClasses || [],
        role: data.role,
        section: data.role === 'head_of_section' ? data.section : undefined,
      };
      newStaffList.push(newStaffMember);
      setStaffList(newStaffList);
      toast({ title: "Staff Added", description: `${combineName(data)} has been added as a staff member.` });
    }
    saveUsersToLocalStorage(studentList, newStaffList);
    staffForm.reset({ firstName: "", surname: "", middleName: "", email: "", department: "", title: "", password: "", assignedClasses: [], role: 'staff', section: userRole === 'head_of_section' ? currentUser?.section : undefined });
  };

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    staffForm.clearErrors("password");
  };

  const handleCancelStaffEdit = () => {
    setEditingStaff(null);
    staffForm.reset({ firstName: "", surname: "", middleName: "", email: "", department: "", title: "", password: "", assignedClasses: [], role: 'staff', section: userRole === 'head_of_section' ? currentUser?.section : undefined });
  };
  
  const handleDeleteStaff = (staffId: string) => {
    const newStaffList = staffList.filter(staff => staff.id !== staffId);
    setStaffList(newStaffList);
    saveUsersToLocalStorage(studentList, newStaffList);
    toast({ title: "Staff Deleted", description: "Staff member has been removed.", variant: "destructive" });
     if (editingStaff && editingStaff.id === staffId) {
      handleCancelStaffEdit();
    }
  };

  const visibleStudents = userRole === 'head_of_section' ? studentList.filter(s => s.schoolSection === currentUser?.section) : studentList;
  const visibleStaff = userRole === 'head_of_section' ? staffList.filter(s => s.section === currentUser?.section || s.department === currentUser?.section) : staffList; // Looser coupling for staff
  const visibleClasses = userRole === 'head_of_section' ? allClasses.filter(c => c.section === currentUser?.section) : allClasses;

  const groupedStaff = visibleStaff.reduce((acc, staffMember) => {
    const department = staffMember.department || "Uncategorized";
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(staffMember);
    return acc;
  }, {} as Record<string, StaffMember[]>);
  
  if (userRole !== 'admin' && userRole !== 'head_of_section') {
     return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="text-2xl text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription>This page is only accessible to admin or Head of Section.</CardDescription>
        </Card>
      </div>
    );
  }
  
  const roleForStaffForm = staffForm.watch("role");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Manage Users</h1>
        <p className="text-muted-foreground">Add new students or manage staff members {userRole === 'head_of_section' && `for the ${currentUser?.section} section`}.</p>
      </header>

      <Tabs defaultValue="manage-students" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="manage-students"><GraduationCap className="mr-2"/> Manage Students</TabsTrigger>
          <TabsTrigger value="manage-staff"><Briefcase className="mr-2"/> Manage Staff</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage-students">
          <div className="space-y-8">
             <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Existing Students by Class</CardTitle>
                <CardDescription>View, edit, or remove students, grouped by their classes. Click on a class name to expand/collapse.</CardDescription>
              </CardHeader>
              <CardContent>
                {visibleStudents.length > 0 ? (
                  <ScrollArea className="max-h-[500px]">
                    <Accordion type="multiple" className="w-full">
                      {visibleClasses.map(cls => {
                        const studentsInThisClass = visibleStudents.filter(s => s.classId === cls.id);
                        if (studentsInThisClass.length === 0) return null;
                        return (
                          <AccordionItem value={cls.id} key={cls.id}>
                            <AccordionTrigger>
                              <h3 className="text-lg font-semibold text-primary">{cls.name} ({cls.section}) - {studentsInThisClass.length} Student(s)</h3>
                            </AccordionTrigger>
                            <AccordionContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>School Section</TableHead>
                                    <TableHead>Roll No.</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {studentsInThisClass.map((student) => (
                                    <TableRow key={student.id}>
                                      <TableCell>{combineName(student)}</TableCell>
                                      <TableCell>{student.email || 'N/A'}</TableCell>
                                      <TableCell>{student.schoolSection}</TableCell>
                                      <TableCell>{student.rollNumber || 'N/A'}</TableCell>
                                      <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditStudent(student)} className="mr-2">
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id)} className="text-destructive hover:text-destructive/80">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                      
                      {(() => {
                        const unassignedStudents = visibleStudents.filter(s => !s.classId || !visibleClasses.some(c => c.id === s.classId));
                        if (unassignedStudents.length === 0) return null;

                        return (
                          <AccordionItem value="unassigned-students">
                            <AccordionTrigger>
                              <h3 className="text-lg font-semibold text-orange-600">Unassigned Students - {unassignedStudents.length} Student(s)</h3>
                            </AccordionTrigger>
                            <AccordionContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>School Section</TableHead>
                                    <TableHead>Roll No.</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {unassignedStudents.map((student) => (
                                    <TableRow key={student.id}>
                                      <TableCell>{combineName(student)}</TableCell>
                                      <TableCell>{student.email || 'N/A'}</TableCell>
                                      <TableCell>{student.schoolSection}</TableCell>
                                      <TableCell>{student.rollNumber || 'N/A'}</TableCell>
                                      <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditStudent(student)} className="mr-2">
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id)} className="text-destructive hover:text-destructive/80">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })()}
                    </Accordion>
                  </ScrollArea>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No students found. Add one below.</p>
                )}
              </CardContent>
            </Card>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle>{editingStudent ? "Edit Student" : "Add New Student"}</CardTitle>
                  <CardDescription>{editingStudent ? `Update details for ${combineName(editingStudent)}.` : "Fill in the details to register a new student."}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" {...studentForm.register("firstName")} />
                        {studentForm.formState.errors.firstName && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.firstName.message}</p>}
                        </div>
                        <div>
                        <Label htmlFor="surname">Surname</Label>
                        <Input id="surname" {...studentForm.register("surname")} />
                        {studentForm.formState.errors.surname && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.surname.message}</p>}
                        </div>
                    </div>
                    <div>
                      <Label htmlFor="middleName">Middle Name (Optional)</Label>
                      <Input id="middleName" {...studentForm.register("middleName")} />
                    </div>
                    <div>
                      <Label htmlFor="studentEmail">Email Address (Optional)</Label>
                      <Input id="studentEmail" type="email" {...studentForm.register("email")} />
                      {studentForm.formState.errors.email && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.email.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="studentRollNumber">Roll Number</Label>
                      <Input id="studentRollNumber" {...studentForm.register("rollNumber")} />
                      {studentForm.formState.errors.rollNumber && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.rollNumber.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="schoolSection">School Section</Label>
                        <Controller
                          name="schoolSection"
                          control={studentForm.control}
                          render={({ field }) => (
                            <Select 
                              onValueChange={(value) => {
                                  field.onChange(value);
                                  studentForm.setValue("classId", undefined); 
                              }} 
                              value={field.value || ""}
                              disabled={userRole === 'head_of_section'}
                            >
                              <SelectTrigger id="schoolSection">
                                <SelectValue placeholder="Select school section" />
                              </SelectTrigger>
                              <SelectContent>
                                {SCHOOL_SECTIONS.map(section => (
                                  <SelectItem key={section} value={section} disabled={userRole === 'head_of_section' && section !== currentUser?.section}>{section}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {studentForm.formState.errors.schoolSection && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.schoolSection.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="classId">Assign to Class</Label>
                        <Controller
                          name="classId"
                          control={studentForm.control}
                          render={({ field }) => (
                            <Select 
                              onValueChange={(value) => {
                                  field.onChange(value === "__UNASSIGNED__" ? undefined : value);
                              }} 
                              value={field.value ?? "__UNASSIGNED__"}
                            >
                              <SelectTrigger id="classId">
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__UNASSIGNED__">Unassigned</SelectItem>
                                {visibleClasses
                                  .filter(cls => !studentForm.getValues("schoolSection") || cls.section === studentForm.getValues("schoolSection")) 
                                  .map(cls => (
                                  <SelectItem key={cls.id} value={cls.id}>{cls.name} ({cls.section})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {studentForm.formState.errors.classId && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.classId.message}</p>}
                      </div>
                    </div>
                    {editingStudent && (
                      <div>
                        <Label htmlFor="studentPassword">Password</Label>
                        <Input 
                            id="studentPassword" 
                            type="password" 
                            {...studentForm.register("password")} 
                            placeholder={"Leave blank to keep current password"} 
                        />
                        {studentForm.formState.errors.password && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.password.message}</p>}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button type="submit" className="w-full sm:flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                        <UserPlus className="mr-2 h-4 w-4"/> {editingStudent ? "Update Student" : "Add Student"}
                      </Button>
                      {editingStudent && (
                        <Button type="button" variant="outline" onClick={handleCancelStudentEdit} className="w-full sm:w-auto">
                          Cancel Edit
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

               <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle>Import Students from File</CardTitle>
                  <CardDescription>Bulk upload students using a CSV or Excel file. Ensure the file has the correct columns.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="student-csv-upload" className="flex items-center gap-2 mb-2"><Upload/> Upload Student List</Label>
                      <Input id="student-csv-upload" type="file" accept=".csv, .xlsx, .xls" onChange={handleStudentFileUpload} />
                    </div>
                    <div className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-md">
                      <h4 className="font-semibold text-foreground mb-1">File Instructions:</h4>
                      <p>Your file must be a `.csv`, `.xlsx`, or `.xls` format and include the following headers in the first row:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li><span className="font-mono text-primary bg-primary/10 px-1 rounded">firstName</span>: First name of the student.</li>
                        <li><span className="font-mono text-primary bg-primary/10 px-1 rounded">surname</span>: Surname of the student.</li>
                        <li><span className="font-mono text-primary bg-primary/10 px-1 rounded">middleName</span>: (Optional) Middle name.</li>
                        <li><span className="font-mono text-primary bg-primary/10 px-1 rounded">email</span>: (Optional) Unique email address.</li>
                        <li><span className="font-mono text-primary bg-primary/10 px-1 rounded">schoolSection</span>: Must be one of: `College`, `Islamiyya`, `Tahfeez`.</li>
                        <li><span className="font-mono text-primary bg-primary/10 px-1 rounded">classId</span>: The ID for the class (e.g., `jss1`, `islamiyya2`). Leave empty for unassigned.</li>
                        <li><span className="font-mono text-primary bg-primary/10 px-1 rounded">rollNumber</span>: The student's roll number.</li>
                      </ul>
                       <p className="mt-2">The student's password will be automatically set to their <span className="font-semibold">surname in lowercase</span>.</p>
                       {userRole === 'head_of_section' && <p className="mt-2 font-semibold text-destructive">Note: You can only import students for the {currentUser?.section} section. Rows for other sections will be ignored.</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manage-staff">
          <div className="space-y-8">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Existing Staff Members by Department</CardTitle>
                 <CardDescription>View, edit, or remove staff members, grouped by department. Click on a department name to expand/collapse.</CardDescription>
              </CardHeader>
              <CardContent>
                {visibleStaff.length > 0 ? (
                   <ScrollArea className="max-h-[500px]">
                     <Accordion type="multiple" className="w-full">
                        {Object.entries(groupedStaff).sort(([deptA], [deptB]) => deptA.localeCompare(deptB)).map(([department, members]) => {
                            if (members.length === 0) return null;
                            return (
                                <AccordionItem value={department.toLowerCase().replace(/\s+/g, '-')} key={department}>
                                  <AccordionTrigger>
                                    <h3 className="text-lg font-semibold text-primary">{department} - {members.length} Member(s)</h3>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Name</TableHead>
                                          <TableHead>Role</TableHead>
                                          <TableHead>Title</TableHead>
                                          <TableHead>Section</TableHead>
                                          <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {members.map((staff) => (
                                          <TableRow key={staff.id}>
                                            <TableCell>{combineName(staff)}</TableCell>
                                            <TableCell className="capitalize">{staff.role.replace('_', ' ')}</TableCell>
                                            <TableCell>{staff.title}</TableCell>
                                            <TableCell>{staff.section || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                              <Button variant="ghost" size="icon" onClick={() => handleEditStaff(staff)} className="mr-2">
                                                <Edit className="h-4 w-4" />
                                              </Button>
                                              <Button variant="ghost" size="icon" onClick={() => handleDeleteStaff(staff.id)} className="text-destructive hover:text-destructive/80" disabled={staff.role === 'admin'}>
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                      </Accordion>
                   </ScrollArea>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No staff members found. Add one below.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xl max-w-lg mx-auto">
              <CardHeader>
                <CardTitle>{editingStaff ? "Edit Staff Member" : "Add New Staff Member"}</CardTitle>
                <CardDescription>{editingStaff ? `Update details for ${combineName(editingStaff)}.` : "Fill in the details to register a new staff member."}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={staffForm.handleSubmit(onStaffSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="staffFirstName">First Name</Label>
                        <Input id="staffFirstName" {...staffForm.register("firstName")} />
                        {staffForm.formState.errors.firstName && <p className="text-sm text-destructive mt-1">{staffForm.formState.errors.firstName.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="staffSurname">Surname</Label>
                        <Input id="staffSurname" {...staffForm.register("surname")} />
                        {staffForm.formState.errors.surname && <p className="text-sm text-destructive mt-1">{staffForm.formState.errors.surname.message}</p>}
                      </div>
                  </div>
                  <div>
                    <Label htmlFor="staffMiddleName">Middle Name (Optional)</Label>
                    <Input id="staffMiddleName" {...staffForm.register("middleName")} />
                  </div>
                  <div>
                    <Label htmlFor="staffEmail">Email Address (Optional)</Label>
                    <Input id="staffEmail" type="email" {...staffForm.register("email")} />
                    {staffForm.formState.errors.email && <p className="text-sm text-destructive mt-1">{staffForm.formState.errors.email.message}</p>}
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="department">Department / Subject Area</Label>
                        <Input id="department" {...staffForm.register("department")} />
                        {staffForm.formState.errors.department && <p className="text-sm text-destructive mt-1">{staffForm.formState.errors.department.message}</p>}
                      </div>
                       <div>
                        <Label htmlFor="title">Job Title (e.g., Teacher, Admin Officer)</Label>
                        <Input id="title" {...staffForm.register("title")} />
                        {staffForm.formState.errors.title && <p className="text-sm text-destructive mt-1">{staffForm.formState.errors.title.message}</p>}
                      </div>
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Controller
                        name="role"
                        control={staffForm.control}
                        render={({ field }) => (
                            <div className="space-y-1">
                                <Label>Role</Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        {userRole === 'admin' && <SelectItem value="head_of_section">Head of Section</SelectItem>}
                                    </SelectContent>
                                </Select>
                                {staffForm.formState.errors.role && <p className="text-sm text-destructive">{staffForm.formState.errors.role.message}</p>}
                            </div>
                        )}
                    />
                    {roleForStaffForm === 'head_of_section' && (
                        <Controller
                            name="section"
                            control={staffForm.control}
                            render={({ field }) => (
                                <div className="space-y-1">
                                    <Label>Assign to Section</Label>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={userRole === 'head_of_section'}>
                                        <SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger>
                                        <SelectContent>
                                            {SCHOOL_SECTIONS.map(section => (
                                                <SelectItem key={section} value={section} disabled={userRole === 'head_of_section' && section !== currentUser?.section}>{section}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {staffForm.formState.errors.section && <p className="text-sm text-destructive">{staffForm.formState.errors.section.message}</p>}
                                </div>
                            )}
                        />
                    )}
                   </div>
                  <div>
                    <Label htmlFor="staffPassword">Password</Label>
                    <Input id="staffPassword" type="password" {...staffForm.register("password")} placeholder={editingStaff ? "Leave blank to keep current password" : "Min. 6 characters"}/>
                    {staffForm.formState.errors.password && <p className="text-sm text-destructive mt-1">{staffForm.formState.errors.password.message}</p>}
                  </div>

                  <Controller
                    name="assignedClasses"
                    control={staffForm.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label className="flex items-center"><ListChecks className="mr-2 h-4 w-4 text-primary" /> Assign Classes (as Class Master)</Label>
                        <ScrollArea className="h-48 w-full rounded-md border p-3 bg-secondary/20">
                          <div className="space-y-1">
                          {visibleClasses.map((cls) => (
                            <div key={cls.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary/50">
                              <Checkbox
                                id={`class-assign-${cls.id}`}
                                checked={field.value?.includes(cls.id) || false}
                                onCheckedChange={(checked) => {
                                  const currentAssigned = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentAssigned, cls.id]);
                                  } else {
                                    field.onChange(currentAssigned.filter(id => id !== cls.id));
                                  }
                                }}
                              />
                              <Label htmlFor={`class-assign-${cls.id}`} className="font-normal cursor-pointer flex-grow">
                                {cls.name} <span className="text-xs text-muted-foreground">({cls.section})</span>
                              </Label>
                            </div>
                          ))}
                          </div>
                        </ScrollArea>
                         {staffForm.formState.errors.assignedClasses && <p className="text-sm text-destructive mt-1">{staffForm.formState.errors.assignedClasses.message}</p>}
                      </div>
                    )}
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button type="submit" className="w-full sm:flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                      <UserPlus className="mr-2 h-4 w-4"/> {editingStaff ? "Update Staff Member" : "Add Staff Member"}
                    </Button>
                    {editingStaff && (
                      <Button type="button" variant="outline" onClick={handleCancelStaffEdit} className="w-full sm:w-auto">
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
