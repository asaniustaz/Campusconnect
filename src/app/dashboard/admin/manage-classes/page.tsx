
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { UserRole, SchoolSection, SchoolClass, StaffMember } from "@/lib/constants";
import { SCHOOL_SECTIONS, mockSchoolClasses as defaultClasses } from "@/lib/constants";
import { PlusCircle, Edit, Trash2, School } from "lucide-react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const classSchema = z.object({
  name: z.string().min(2, "Class name is required"),
  displayLevel: z.string().min(2, "Display level is required (e.g., 'Junior Secondary 1')"),
  section: z.custom<SchoolSection>((val) => SCHOOL_SECTIONS.includes(val as SchoolSection), "Please select a school section"),
});

type ClassFormData = z.infer<typeof classSchema>;

export default function ManageClassesPage() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  
  const classForm = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const userId = localStorage.getItem("userId");
    setUserRole(role);

    if (typeof window !== 'undefined') {
      const storedClassesString = localStorage.getItem('schoolClasses');
      if (storedClassesString) {
        try {
          const storedClasses: SchoolClass[] = JSON.parse(storedClassesString);
          setAllClasses(storedClasses);
        } catch (e) {
          console.error("Failed to parse classes from localStorage", e);
          setAllClasses(defaultClasses);
          localStorage.setItem('schoolClasses', JSON.stringify(defaultClasses));
        }
      } else {
        setAllClasses(defaultClasses);
        localStorage.setItem('schoolClasses', JSON.stringify(defaultClasses));
      }

      if (userId && (role === 'admin' || role === 'head_of_section')) {
        const storedUsersString = localStorage.getItem('managedUsers');
        if (storedUsersString) {
          try {
            const allUsers: StaffMember[] = JSON.parse(storedUsersString);
            const foundUser = allUsers.find(u => u.id === userId);
            if (foundUser) {
              setCurrentUser(foundUser);
            }
          } catch (e) { console.error("Failed to parse current user", e); }
        }
      }
    }
  }, []);

  useEffect(() => {
    if (editingClass) {
      classForm.reset(editingClass);
    } else {
      classForm.reset({ name: "", displayLevel: "", section: userRole === 'head_of_section' ? currentUser?.section : undefined });
    }
  }, [editingClass, classForm, userRole, currentUser]);

  const saveClassesToLocalStorage = (updatedClasses: SchoolClass[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('schoolClasses', JSON.stringify(updatedClasses));
      setAllClasses(updatedClasses);
    }
  };

  const onClassSubmit: SubmitHandler<ClassFormData> = (data) => {
    let newClassList = [...allClasses];
    if (editingClass) {
      const updatedClassData: SchoolClass = { ...editingClass, ...data };
      newClassList = allClasses.map(c => c.id === editingClass.id ? updatedClassData : c);
      toast({ title: "Class Updated", description: `${data.name} has been updated.` });
      setEditingClass(null);
    } else {
      const newClassData: SchoolClass = {
        id: `class-${Date.now()}`,
        ...data,
      };
      newClassList.push(newClassData);
      toast({ title: "Class Added", description: `${data.name} has been added.` });
    }
    saveClassesToLocalStorage(newClassList);
    classForm.reset({ name: "", displayLevel: "", section: userRole === 'head_of_section' ? currentUser?.section : undefined });
  };

  const handleEditClass = (cls: SchoolClass) => {
    setEditingClass(cls);
  };

  const handleCancelEdit = () => {
    setEditingClass(null);
  };

  const handleDeleteClass = (classId: string) => {
    const newClassList = allClasses.filter(c => c.id !== classId);
    saveClassesToLocalStorage(newClassList);
    toast({ title: "Class Deleted", description: "The class has been removed.", variant: "destructive" });
    if (editingClass && editingClass.id === classId) {
      handleCancelEdit();
    }
  };

  const visibleClasses = userRole === 'head_of_section' && currentUser?.section 
    ? allClasses.filter(c => c.section === currentUser.section) 
    : allClasses;

  if (userRole !== 'admin' && userRole !== 'head_of_section') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="text-2xl text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription>This page is only accessible to admin and Head of Section members.</CardDescription>
        </Card>
      </div>
    );
  }

  const groupedClasses = visibleClasses.reduce((acc, cls) => {
    const section = cls.section;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(cls);
    return acc;
  }, {} as Record<SchoolSection, SchoolClass[]>);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Manage Classes</h1>
        <p className="text-muted-foreground">Add, edit, or remove classes for {userRole === 'head_of_section' ? `the ${currentUser?.section} section` : 'all school sections'}.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle>Existing Classes</CardTitle>
                    <CardDescription>All available classes, grouped by their section.</CardDescription>
                </CardHeader>
                <CardContent>
                    {visibleClasses.length > 0 ? (
                        <Accordion type="multiple" className="w-full" defaultValue={SCHOOL_SECTIONS.map(s => s.toLowerCase())}>
                            {(Object.keys(groupedClasses) as SchoolSection[]).map(section => {
                                const classesInSection = groupedClasses[section];
                                if (!classesInSection || classesInSection.length === 0) return null;
                                return (
                                    <AccordionItem value={section.toLowerCase()} key={section}>
                                        <AccordionTrigger>
                                            <h3 className="text-lg font-semibold text-primary">{section} Section - {classesInSection.length} Classes</h3>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Class Name</TableHead>
                                                        <TableHead>Display Level</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {classesInSection.map(cls => (
                                                        <TableRow key={cls.id}>
                                                            <TableCell>{cls.name}</TableCell>
                                                            <TableCell>{cls.displayLevel}</TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="icon" onClick={() => handleEditClass(cls)} className="mr-2">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                 <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This action cannot be undone. This will permanently delete the class.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => handleDeleteClass(cls.id)}>Continue</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
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
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No classes have been created yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        <Card className="shadow-xl lg:col-span-1 sticky top-20">
          <CardHeader>
            <CardTitle>{editingClass ? "Edit Class" : "Add New Class"}</CardTitle>
            <CardDescription>{editingClass ? `Update details for ${editingClass.name}.` : "Create a new class."}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={classForm.handleSubmit(onClassSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Class Name</Label>
                <Input id="name" {...classForm.register("name")} placeholder="e.g., JSS 1A" />
                {classForm.formState.errors.name && <p className="text-sm text-destructive mt-1">{classForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="displayLevel">Display Level</Label>
                <Input id="displayLevel" {...classForm.register("displayLevel")} placeholder="e.g., Junior Secondary 1" />
                {classForm.formState.errors.displayLevel && <p className="text-sm text-destructive mt-1">{classForm.formState.errors.displayLevel.message}</p>}
              </div>
              <div>
                <Label htmlFor="section">School Section</Label>
                <Controller
                  name="section"
                  control={classForm.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""} disabled={userRole === 'head_of_section'}>
                      <SelectTrigger id="section"><SelectValue placeholder="Select section" /></SelectTrigger>
                      <SelectContent>
                        {SCHOOL_SECTIONS.map(section => (
                          <SelectItem key={section} value={section} disabled={userRole === 'head_of_section' && section !== currentUser?.section}>{section}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {classForm.formState.errors.section && <p className="text-sm text-destructive mt-1">{classForm.formState.errors.section.message}</p>}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button type="submit" className="w-full sm:flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <PlusCircle className="mr-2 h-4 w-4" /> {editingClass ? "Update Class" : "Add Class"}
                </Button>
                {editingClass && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
