
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { UserRole, SchoolLevel, SchoolClass, Student } from "@/lib/constants";
import { SCHOOL_LEVELS, mockSchoolClasses } from "@/lib/constants";
import { UserPlus, Users, Briefcase, Edit, Trash2, ListChecks, GraduationCap } from "lucide-react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Student Schema for Add/Edit
const studentSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  schoolLevel: z.custom<SchoolLevel>((val) => SCHOOL_LEVELS.includes(val as SchoolLevel), "Please select a school level"),
  classId: z.string().optional(), 
  password: z.string().min(6, "Password must be at least 6 characters for new students.").optional(), 
  rollNumber: z.string().optional(),
});
type StudentFormData = z.infer<typeof studentSchema>;

// Staff Schema for Add/Edit
const staffSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(2, "Department is required"),
  title: z.string().min(2, "Job title is required"),
  password: z.string().min(6, "Password must be at least 6 characters for new staff.").optional(),
  assignedClasses: z.array(z.string()).optional(),
});
type StaffFormData = z.infer<typeof staffSchema>;


interface StaffMember {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
  password?: string; // Storing actual password for prototype login
  assignedClasses?: string[];
  role: UserRole; // Added role
}

const initialMockStaff: StaffMember[] = []; // Emptied for real user management


export default function ManageUsersPage() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const studentForm = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
        name: "",
        email: "",
        schoolLevel: undefined,
        classId: undefined,
        password: "",
        rollNumber: ""
    }
  });

  const staffForm = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
        name: "",
        email: "",
        department: "",
        title: "",
        password: "",
        assignedClasses: []
    }
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    setUserRole(role);

    // Load users from localStorage
    if (typeof window !== 'undefined') {
      const storedUsersString = localStorage.getItem('managedUsers');
      if (storedUsersString) {
        try {
          const allStoredUsers: (Student | StaffMember)[] = JSON.parse(storedUsersString);
          setStudentList(allStoredUsers.filter(u => u.role === 'student') as Student[]);
          setStaffList(allStoredUsers.filter(u => u.role === 'staff' || u.role === 'admin') as StaffMember[]);
        } catch (e) {
          console.error("Failed to parse users from localStorage", e);
          setStudentList([]);
          setStaffList([]);
        }
      } else {
        setStudentList([]);
        setStaffList([]);
      }
    }
  }, []);


  useEffect(() => {
    if (editingStudent) {
      studentForm.reset({
        name: editingStudent.name,
        email: editingStudent.email,
        schoolLevel: editingStudent.schoolLevel,
        classId: editingStudent.classId,
        password: "", // Clear password field on edit
        rollNumber: editingStudent.rollNumber,
      });
    } else {
      studentForm.reset({ name: "", email: "", schoolLevel: undefined, classId: undefined, password: "", rollNumber: "" });
    }
  }, [editingStudent, studentForm]);

  useEffect(() => {
    if (editingStaff) {
      staffForm.reset({
        name: editingStaff.name,
        email: editingStaff.email,
        department: editingStaff.department,
        title: editingStaff.title,
        password: "", // Clear password field on edit
        assignedClasses: editingStaff.assignedClasses || [],
      });
    } else {
      staffForm.reset({ name: "", email: "", department: "", title: "", password: "", assignedClasses: [] });
    }
  }, [editingStaff, staffForm]);

  const saveUsersToLocalStorage = (updatedStudents: Student[], updatedStaff: StaffMember[]) => {
    if (typeof window !== 'undefined') {
      const allUsers = [...updatedStudents, ...updatedStaff];
      localStorage.setItem('managedUsers', JSON.stringify(allUsers));
    }
  };

  const onStudentSubmit: SubmitHandler<StudentFormData> = (data) => {
    let newStudentList = [...studentList];
    if (editingStudent) {
      if (!data.password && !editingStudent.password) { 
         studentForm.setError("password", { type: "manual", message: "Password is required if not previously set or to change it."});
         return;
      }
      const updatedStudentData: Student = {
        ...editingStudent,
        name: data.name,
        email: data.email,
        schoolLevel: data.schoolLevel!,
        classId: data.classId, 
        rollNumber: data.rollNumber,
        password: data.password ? data.password : editingStudent.password, // Store actual password for prototype
        role: 'student',
      };
      newStudentList = studentList.map(s => s.id === editingStudent.id ? updatedStudentData : s);
      setStudentList(newStudentList);
      toast({ title: "Student Updated", description: `${data.name}'s details have been updated.` });
      setEditingStudent(null);
    } else {
      if (!data.password || data.password.length < 6) {
        studentForm.setError("password", { type: "manual", message: "Password must be at least 6 characters for new students."});
        return;
      }
      const newStudentData: Student = {
        id: `stud-${Date.now()}`,
        name: data.name,
        email: data.email,
        schoolLevel: data.schoolLevel!,
        classId: data.classId, 
        rollNumber: data.rollNumber,
        password: data.password, // Store actual password for prototype
        role: 'student',
      };
      newStudentList.push(newStudentData);
      setStudentList(newStudentList);
      toast({ title: "Student Added", description: `${data.name} has been added.` });
    }
    saveUsersToLocalStorage(newStudentList, staffList);
    studentForm.reset({ name: "", email: "", schoolLevel: undefined, classId: undefined, password: "", rollNumber: ""});
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    studentForm.clearErrors("password"); // Clear password error when starting edit
  };

  const handleCancelStudentEdit = () => {
    setEditingStudent(null);
    studentForm.reset({ name: "", email: "", schoolLevel: undefined, classId: undefined, password: "", rollNumber: ""});
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
        name: data.name,
        email: data.email,
        department: data.department,
        title: data.title,
        password: data.password ? data.password : editingStaff.password, // Store actual password
        assignedClasses: data.assignedClasses || [],
        role: editingStaff.role || 'staff', // Preserve role or default to staff
      };
      newStaffList = staffList.map(staff => staff.id === editingStaff.id ? updatedStaff : staff);
      setStaffList(newStaffList);
      toast({ title: "Staff Updated", description: `${data.name}'s details have been updated.` });
      setEditingStaff(null);
    } else {
      if (!data.password || data.password.length < 6) {
        staffForm.setError("password", { type: "manual", message: "Password must be at least 6 characters for new staff."});
        return;
      }
      const newStaffMember: StaffMember = {
        id: `staff-${Date.now()}`,
        name: data.name,
        email: data.email,
        department: data.department,
        title: data.title,
        password: data.password, // Store actual password
        assignedClasses: data.assignedClasses || [],
        role: 'staff', // Default new staff to 'staff' role
      };
      newStaffList.push(newStaffMember);
      setStaffList(newStaffList);
      toast({ title: "Staff Added", description: `${data.name} has been added as a staff member.` });
    }
    saveUsersToLocalStorage(studentList, newStaffList);
    staffForm.reset({ name: "", email: "", department: "", title: "", password: "", assignedClasses: [] });
  };

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    staffForm.clearErrors("password");
  };

  const handleCancelStaffEdit = () => {
    setEditingStaff(null);
    staffForm.reset({ name: "", email: "", department: "", title: "", password: "", assignedClasses: [] });
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

  const groupedStaff = staffList.reduce((acc, staffMember) => {
    const department = staffMember.department || "Uncategorized";
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(staffMember);
    return acc;
  }, {} as Record<string, StaffMember[]>);
  
  if (userRole !== 'admin') {
     return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="text-2xl text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription>This page is only accessible to admin members.</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Manage Users</h1>
        <p className="text-muted-foreground">Add new students or manage staff members.</p>
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
                {studentList.length > 0 ? (
                  <ScrollArea className="max-h-[500px]">
                    <Accordion type="multiple" collapsible className="w-full">
                      {mockSchoolClasses.map(cls => {
                        const studentsInThisClass = studentList.filter(s => s.classId === cls.id);
                        if (studentsInThisClass.length === 0) return null;
                        return (
                          <AccordionItem value={cls.id} key={cls.id}>
                            <AccordionTrigger>
                              <h3 className="text-lg font-semibold text-primary">{cls.name} ({cls.displayLevel}) - {studentsInThisClass.length} Student(s)</h3>
                            </AccordionTrigger>
                            <AccordionContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>School Level</TableHead>
                                    <TableHead>Roll No.</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {studentsInThisClass.map((student) => (
                                    <TableRow key={student.id}>
                                      <TableCell>{student.name}</TableCell>
                                      <TableCell>{student.email}</TableCell>
                                      <TableCell>{student.schoolLevel}</TableCell>
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
                        const unassignedStudents = studentList.filter(s => !s.classId || !mockSchoolClasses.some(c => c.id === s.classId));
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
                                    <TableHead>School Level</TableHead>
                                    <TableHead>Roll No.</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {unassignedStudents.map((student) => (
                                    <TableRow key={student.id}>
                                      <TableCell>{student.name}</TableCell>
                                      <TableCell>{student.email}</TableCell>
                                      <TableCell>{student.schoolLevel}</TableCell>
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

            <Card className="shadow-xl max-w-lg mx-auto">
              <CardHeader>
                <CardTitle>{editingStudent ? "Edit Student" : "Add New Student"}</CardTitle>
                <CardDescription>{editingStudent ? `Update details for ${editingStudent.name}.` : "Fill in the details to register a new student."}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="studentName">Full Name</Label>
                    <Input id="studentName" {...studentForm.register("name")} />
                    {studentForm.formState.errors.name && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="studentEmail">Email Address</Label>
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
                      <Label htmlFor="schoolLevel">School Level</Label>
                      <Controller
                        name="schoolLevel"
                        control={studentForm.control}
                        render={({ field }) => (
                          <Select 
                            onValueChange={(value) => {
                                field.onChange(value);
                                studentForm.setValue("classId", undefined); 
                            }} 
                            value={field.value || ""}
                          >
                            <SelectTrigger id="schoolLevel">
                              <SelectValue placeholder="Select school level" />
                            </SelectTrigger>
                            <SelectContent>
                              {SCHOOL_LEVELS.map(level => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {studentForm.formState.errors.schoolLevel && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.schoolLevel.message}</p>}
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
                              {mockSchoolClasses
                                .filter(cls => !studentForm.getValues("schoolLevel") || cls.level === studentForm.getValues("schoolLevel")) 
                                .map(cls => (
                                <SelectItem key={cls.id} value={cls.id}>{cls.name} ({cls.displayLevel})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {studentForm.formState.errors.classId && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.classId.message}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="studentPassword">Password</Label>
                    <Input 
                        id="studentPassword" 
                        type="password" 
                        {...studentForm.register("password")} 
                        placeholder={editingStudent ? "Leave blank to keep current" : "Min. 6 characters"} 
                    />
                    {studentForm.formState.errors.password && <p className="text-sm text-destructive mt-1">{studentForm.formState.errors.password.message}</p>}
                  </div>
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
                {staffList.length > 0 ? (
                   <ScrollArea className="max-h-[500px]">
                     <Accordion type="multiple" collapsible className="w-full">
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
                                          <TableHead>Email</TableHead>
                                          <TableHead>Title</TableHead>
                                          <TableHead>Assigned Classes (Master)</TableHead>
                                          <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {members.map((staff) => (
                                          <TableRow key={staff.id}>
                                            <TableCell>{staff.name}</TableCell>
                                            <TableCell>{staff.email}</TableCell>
                                            <TableCell>{staff.title}</TableCell>
                                            <TableCell>
                                                {staff.assignedClasses && staff.assignedClasses.length > 0
                                                ? staff.assignedClasses.map(classId => mockSchoolClasses.find(c => c.id === classId)?.name || classId).join(', ')
                                                : "None"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                              <Button variant="ghost" size="icon" onClick={() => handleEditStaff(staff)} className="mr-2">
                                                <Edit className="h-4 w-4" />
                                              </Button>
                                              <Button variant="ghost" size="icon" onClick={() => handleDeleteStaff(staff.id)} className="text-destructive hover:text-destructive/80">
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
                <CardDescription>{editingStaff ? `Update details for ${editingStaff.name}.` : "Fill in the details to register a new staff member."}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={staffForm.handleSubmit(onStaffSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="staffName">Full Name</Label>
                    <Input id="staffName" {...staffForm.register("name")} />
                    {staffForm.formState.errors.name && <p className="text-sm text-destructive mt-1">{staffForm.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="staffEmail">Email Address</Label>
                    <Input id="staffEmail" type="email" {...staffForm.register("email")} />
                    {staffForm.formState.errors.email && <p className="text-sm text-destructive mt-1">{staffForm.formState.errors.email.message}</p>}
                  </div>
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
                          {mockSchoolClasses.map((cls) => (
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
                                {cls.name} <span className="text-xs text-muted-foreground">({cls.displayLevel})</span>
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
