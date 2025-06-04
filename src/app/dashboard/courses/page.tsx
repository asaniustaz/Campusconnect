
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, Users, CalendarDays, PlusCircle, Edit, Trash2 } from "lucide-react";
import type { UserRole, SchoolLevel, SubjectCategory, Subject } from "@/lib/constants";
import { SCHOOL_LEVELS, SUBJECT_CATEGORIES, subjectCategoryIcons, defaultNigerianCurriculumSubjects } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const subjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  code: z.string().min(3, "Code must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  instructor: z.string().min(2, "Instructor name is required"), // Default/Coordinating Instructor
  schedule: z.string().min(3, "Schedule is required"),
  schoolLevel: z.custom<SchoolLevel>((val) => SCHOOL_LEVELS.includes(val as SchoolLevel), "Please select a school level"),
  subjectCategory: z.custom<SubjectCategory>((val) => SUBJECT_CATEGORIES.includes(val as SubjectCategory), "Please select a subject category"),
  sssStream: z.enum(['Core', 'Science', 'Art', 'Commercial', 'Trade']).optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface StaffAllocation {
  [staffId: string]: string[]; // Array of subject IDs
}

interface StaffDetail {
  id: string;
  name: string;
}

export default function SubjectsPage() {
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | "all">("all");
  const [selectedSssStream, setSelectedSssStream] = useState<'Core' | 'Science' | 'Art' | 'Commercial' | 'Trade' | 'all'>("all");
  
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [allocatedSubjectIdsForStaff, setAllocatedSubjectIdsForStaff] = useState<string[]>([]);
  const [allStaffAllocations, setAllStaffAllocations] = useState<StaffAllocation>({});
  const [allStaffDetails, setAllStaffDetails] = useState<StaffDetail[]>([]);
  const [pageDescription, setPageDescription] = useState("Browse available subjects. Filter by school level, subject category, and SSS stream.");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const { toast } = useToast();

  const subjectForm = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      title: "", code: "", description: "", instructor: "", schedule: "",
      schoolLevel: undefined, subjectCategory: undefined, sssStream: undefined,
    },
  });

  // Effect to load all base data from localStorage on mount
  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole | null;
    setUserRole(role);

    let currentSubjects: Subject[] = defaultNigerianCurriculumSubjects;
    if (typeof window !== 'undefined') {
        const storedSubjects = localStorage.getItem('schoolSubjectsData');
        if (storedSubjects) {
            try {
                currentSubjects = JSON.parse(storedSubjects);
            } catch (e) {
                console.error("Failed to parse subjects from localStorage, using defaults.", e);
                localStorage.setItem('schoolSubjectsData', JSON.stringify(defaultNigerianCurriculumSubjects));
            }
        } else {
            localStorage.setItem('schoolSubjectsData', JSON.stringify(defaultNigerianCurriculumSubjects));
        }
    }
    setAllSubjects(currentSubjects);

    let loadedStaffAllocations: StaffAllocation = {};
    if (typeof window !== 'undefined') {
        const storedAllocationsStr = localStorage.getItem('staffCourseAllocations');
        if (storedAllocationsStr) {
            try {
                loadedStaffAllocations = JSON.parse(storedAllocationsStr);
            } catch (e) {
                console.error("Failed to parse staff allocations from localStorage", e);
            }
        }
    }
    setAllStaffAllocations(loadedStaffAllocations);
    
    let loadedStaffDetails: StaffDetail[] = [];
    if (typeof window !== 'undefined') {
        const storedUsersString = localStorage.getItem('managedUsers');
        if (storedUsersString) {
            try {
                const allManagedUsers: Array<{ id: string; name: string; role: UserRole }> = JSON.parse(storedUsersString);
                loadedStaffDetails = allManagedUsers
                    .filter(u => u.role === 'staff' || u.role === 'admin')
                    .map(u => ({ id: u.id, name: u.name }));
            } catch (e) {
                console.error("Failed to parse managed users for staff names", e);
            }
        }
    }
    setAllStaffDetails(loadedStaffDetails);

    if (role !== 'staff') {
        setPageDescription("Browse available subjects. Filter by school level, subject category, and SSS stream.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Effect to determine allocated subjects for the current staff user and update page description
  useEffect(() => {
    const role = userRole; // Use state version of userRole for dependency
    const currentUserId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;

    if (role === 'staff' && currentUserId && Object.keys(allStaffAllocations).length > 0) {
        const staffAllocationsForThisUser = allStaffAllocations[currentUserId];
        if (staffAllocationsForThisUser && staffAllocationsForThisUser.length > 0) {
            setAllocatedSubjectIdsForStaff(staffAllocationsForThisUser);
            setPageDescription("Browse your allocated subjects. Filter by school level, subject category, and SSS stream.");
        } else {
            setPageDescription("You currently have no subjects allocated. Contact an administrator.");
            setAllocatedSubjectIdsForStaff([]); 
        }
    } else if (role === 'staff') { 
        // Handles cases where staff is logged in but allocations might still be loading or are empty
        setPageDescription("You currently have no subjects allocated or allocations are still loading. Contact an administrator if this persists.");
        setAllocatedSubjectIdsForStaff([]);
    }
    // No need to explicitly setPageDescription for student/admin here, as it's handled by the initial load or the default state.
  }, [userRole, allStaffAllocations]); // This effect runs when userRole or allStaffAllocations state changes


  const saveSubjectsToLocalStorage = (subjects: Subject[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('schoolSubjectsData', JSON.stringify(subjects));
    }
    setAllSubjects(subjects); // Update state to reflect changes immediately
  };

  const handleOpenDialog = (subject: Subject | null = null) => {
    setEditingSubject(subject);
    if (subject) {
      subjectForm.reset({ ...subject });
    } else {
      subjectForm.reset({
        title: "", code: "", description: "", instructor: "", schedule: "",
        schoolLevel: undefined, subjectCategory: undefined, sssStream: undefined,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubjectSubmit: SubmitHandler<SubjectFormData> = (data) => {
    if (editingSubject) { 
      const updatedSubjects = allSubjects.map(sub => 
        sub.id === editingSubject.id ? { ...editingSubject, ...data } : sub
      );
      saveSubjectsToLocalStorage(updatedSubjects);
      toast({ title: "Subject Updated", description: `${data.title} has been updated.` });
    } else { 
      const newSubject: Subject = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // More unique ID
        ...data,
      };
      saveSubjectsToLocalStorage([...allSubjects, newSubject]);
      toast({ title: "Subject Added", description: `${data.title} has been added.` });
    }
    setIsDialogOpen(false);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (typeof window !== 'undefined' && window.confirm("Are you sure you want to delete this subject? This action cannot be undone.")) {
      const updatedSubjects = allSubjects.filter(sub => sub.id !== subjectId);
      saveSubjectsToLocalStorage(updatedSubjects);
      
      if (typeof window !== 'undefined') {
        const storedAllocations = localStorage.getItem('staffCourseAllocations');
        if (storedAllocations) {
          try {
            const allocations: StaffAllocation = JSON.parse(storedAllocations);
            const newAllocations: StaffAllocation = {};
            for (const staffId in allocations) {
              newAllocations[staffId] = allocations[staffId].filter(subId => subId !== subjectId);
            }
            localStorage.setItem('staffCourseAllocations', JSON.stringify(newAllocations));
            setAllStaffAllocations(newAllocations); 
          } catch (e) {
            console.error("Error updating staff allocations after subject deletion:", e);
          }
        }
      }
      toast({ title: "Subject Deleted", variant: "destructive" });
    }
  };


  const getFilteredSubjects = () => {
    let subjectsToDisplay = [...allSubjects];

    if (userRole === 'staff') {
      if (allocatedSubjectIdsForStaff.length > 0) {
        subjectsToDisplay = subjectsToDisplay.filter(subject => allocatedSubjectIdsForStaff.includes(subject.id));
      } else {
        // If staff has no allocated subjects (either none set or still loading), show an empty list.
        // The pageDescription state will inform them.
        return [];
      }
    }

    subjectsToDisplay = subjectsToDisplay.filter(subject => 
      (selectedLevel === "all" || subject.schoolLevel === selectedLevel) &&
      (selectedCategory === "all" || subject.subjectCategory === selectedCategory)
    );
    
    if (selectedLevel === "Secondary" && selectedSssStream !== "all") {
      subjectsToDisplay = subjectsToDisplay.filter(subject => {
        if (selectedSssStream === "Core") return subject.sssStream === "Core";
        return subject.sssStream === selectedSssStream || subject.sssStream === "Core"; 
      });
    }
    return subjectsToDisplay.sort((a,b) => a.title.localeCompare(b.title));
  };

  const filteredSubjects = getFilteredSubjects();

  const getCategoryIcon = (category: SubjectCategory) => {
    const Icon = subjectCategoryIcons[category] || Layers; 
    return <Icon className="h-4 w-4 mr-1" />;
  };
  
  const getInstructorNamesForSubject = (subjectId: string): string => {
    const assignedStaffIds: string[] = [];
    // Use the allStaffAllocations state which is populated from localStorage
    for (const staffId in allStaffAllocations) {
      if (allStaffAllocations[staffId] && allStaffAllocations[staffId].includes(subjectId)) {
        assignedStaffIds.push(staffId);
      }
    }

    const subject = allSubjects.find(s => s.id === subjectId);
    const defaultInstructor = subject?.instructor || "Not Assigned";

    if (assignedStaffIds.length === 0) {
      return defaultInstructor;
    }

    const instructorNames = assignedStaffIds
      .map(staffId => {
        const staffMember = allStaffDetails.find(staff => staff.id === staffId);
        return staffMember ? staffMember.name : null; 
      })
      .filter(name => name !== null) 
      .join(', ');

    return instructorNames || defaultInstructor; 
  };

  const sssStreams: Array<'Core' | 'Science' | 'Art' | 'Commercial' | 'Trade'> = ['Core', 'Science', 'Art', 'Commercial', 'Trade'];

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
            <h1 className="text-3xl font-bold font-headline text-foreground">Subjects</h1>
            <p className="text-muted-foreground">{pageDescription}</p>
        </div>
        {userRole === 'admin' && (
            <Button onClick={() => handleOpenDialog(null)} className="mt-2 sm:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Subject
            </Button>
        )}
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={selectedLevel} onValueChange={(value) => {setSelectedLevel(value as SchoolLevel | "all"); if (value !== "Secondary") setSelectedSssStream("all");}}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="School Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {SCHOOL_LEVELS.map(level => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as SubjectCategory | "all")}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Subject Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {SUBJECT_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
         {selectedLevel === "Secondary" && (
          <Select value={selectedSssStream} onValueChange={(value) => setSelectedSssStream(value as 'Core' | 'Science' | 'Art' | 'Commercial' | 'Trade' | 'all')}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="SSS Stream" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All SSS Streams</SelectItem>
              {sssStreams.map(stream => (
                <SelectItem key={stream} value={stream}>{stream}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      {filteredSubjects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subject) => (
            <Card key={subject.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{subject.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="secondary" className="flex items-center">
                    <Layers className="h-3 w-3 mr-1" /> {subject.schoolLevel}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center">
                    {getCategoryIcon(subject.subjectCategory)} {subject.subjectCategory}
                  </Badge>
                   {subject.sssStream && subject.schoolLevel === "Secondary" && (
                     <Badge variant="outline" className="capitalize">{subject.sssStream}</Badge>
                   )}
                </div>
                <CardDescription>{subject.code}</CardDescription> 
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-foreground mb-3">{subject.description}</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" /> Instructor(s): {getInstructorNamesForSubject(subject.id)}
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2" /> Schedule: {subject.schedule}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                {userRole === 'admin' && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleOpenDialog(subject)} aria-label={`Edit ${subject.title}`}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteSubject(subject.id)} aria-label={`Delete ${subject.title}`}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <p className="text-center text-muted-foreground col-span-full py-10">
            {userRole === 'staff' && allocatedSubjectIdsForStaff.length === 0 && allSubjects.length > 0 && Object.keys(allStaffAllocations).length > 0
                ? "You currently have no subjects allocated. Please contact an administrator."
                : userRole === 'staff' && allSubjects.length > 0
                ? "No allocated subjects match the current filters, or allocations are still being processed."
                : "No subjects match the selected filters, or no subjects have been added yet."
            }
        </p>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={subjectForm.handleSubmit(onSubjectSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-3">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...subjectForm.register("title")} />
              {subjectForm.formState.errors.title && <p className="text-sm text-destructive mt-1">{subjectForm.formState.errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="code">Subject Code</Label>
              <Input id="code" {...subjectForm.register("code")} disabled={!!editingSubject} />
              {subjectForm.formState.errors.code && <p className="text-sm text-destructive mt-1">{subjectForm.formState.errors.code.message}</p>}
               {!!editingSubject && <p className="text-xs text-muted-foreground mt-1">Subject code cannot be changed after creation.</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...subjectForm.register("description")} />
              {subjectForm.formState.errors.description && <p className="text-sm text-destructive mt-1">{subjectForm.formState.errors.description.message}</p>}
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="instructor">Default/Coordinating Instructor</Label>
                    <Input id="instructor" {...subjectForm.register("instructor")} />
                    {subjectForm.formState.errors.instructor && <p className="text-sm text-destructive mt-1">{subjectForm.formState.errors.instructor.message}</p>}
                </div>
                <div>
                    <Label htmlFor="schedule">Schedule</Label>
                    <Input id="schedule" {...subjectForm.register("schedule")} />
                    {subjectForm.formState.errors.schedule && <p className="text-sm text-destructive mt-1">{subjectForm.formState.errors.schedule.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="schoolLevel">School Level</Label>
                    <Controller
                        name="schoolLevel"
                        control={subjectForm.control}
                        render={({ field }) => (
                        <Select onValueChange={(value) => field.onChange(value as SchoolLevel)} value={field.value || ""}>
                            <SelectTrigger id="schoolLevel"><SelectValue placeholder="Select school level" /></SelectTrigger>
                            <SelectContent>
                            {SCHOOL_LEVELS.map(level => (<SelectItem key={level} value={level}>{level}</SelectItem>))}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {subjectForm.formState.errors.schoolLevel && <p className="text-sm text-destructive mt-1">{subjectForm.formState.errors.schoolLevel.message}</p>}
                </div>
                <div>
                    <Label htmlFor="subjectCategory">Subject Category</Label>
                     <Controller
                        name="subjectCategory"
                        control={subjectForm.control}
                        render={({ field }) => (
                        <Select onValueChange={(value) => field.onChange(value as SubjectCategory)} value={field.value || ""}>
                            <SelectTrigger id="subjectCategory"><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>
                            {SUBJECT_CATEGORIES.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {subjectForm.formState.errors.subjectCategory && <p className="text-sm text-destructive mt-1">{subjectForm.formState.errors.subjectCategory.message}</p>}
                </div>
            </div>
            {subjectForm.watch("schoolLevel") === "Secondary" && (
                 <div>
                    <Label htmlFor="sssStream">SSS Stream (For Secondary: 'Core' for JSS & SSS core, specific for SSS electives)</Label>
                     <Controller
                        name="sssStream"
                        control={subjectForm.control}
                        render={({ field }) => (
                        <Select onValueChange={(value) => field.onChange(value as Subject['sssStream'] | undefined)} value={field.value || ""}>
                            <SelectTrigger id="sssStream"><SelectValue placeholder="Select SSS stream if applicable" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None (or general secondary)</SelectItem>
                                {sssStreams.map(stream => (<SelectItem key={stream} value={stream}>{stream}</SelectItem>))}
                            </SelectContent>
                        </Select>
                        )}
                    />
                     <p className="text-xs text-muted-foreground mt-1">
                        Select 'Core' for subjects common to all JSS/SSS students or general secondary subjects.
                        Select 'Science', 'Art', etc., for SSS elective streams.
                    </p>
                     {subjectForm.formState.errors.sssStream && <p className="text-sm text-destructive mt-1">{subjectForm.formState.errors.sssStream.message}</p>}
                </div>
            )}
            <DialogFooter className="pt-4">
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">{editingSubject ? "Save Changes" : "Add Subject"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    