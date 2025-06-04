
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookText, Layers, Users, CalendarDays, PlusCircle, Edit, Trash2 } from "lucide-react";
import type { UserRole, SchoolLevel, SubjectCategory } from "@/lib/constants";
import { SCHOOL_LEVELS, SUBJECT_CATEGORIES, subjectCategoryIcons } from "@/lib/constants";
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

interface Subject {
  id: string;
  title: string;
  code: string;
  description: string;
  instructor: string; // Default/Coordinating Instructor
  schedule: string;
  schoolLevel: SchoolLevel;
  subjectCategory: SubjectCategory;
  sssStream?: 'Core' | 'Science' | 'Art' | 'Commercial' | 'Trade';
}

const subjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  code: z.string().min(3, "Code must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  instructor: z.string().min(2, "Instructor name is required"),
  schedule: z.string().min(3, "Schedule is required"),
  schoolLevel: z.custom<SchoolLevel>((val) => SCHOOL_LEVELS.includes(val as SchoolLevel), "Please select a school level"),
  subjectCategory: z.custom<SubjectCategory>((val) => SUBJECT_CATEGORIES.includes(val as SubjectCategory), "Please select a subject category"),
  sssStream: z.enum(['Core', 'Science', 'Art', 'Commercial', 'Trade']).optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

const defaultNigerianCurriculumSubjects: Subject[] = [
  {
    id: "KG_LIT", title: "Literacy (Pre-Reading & Pre-Writing)", schoolLevel: "Kindergarten", subjectCategory: "Languages",
    code: "KGLAN001", description: "Developing pre-reading and pre-writing skills.", instructor: "Mrs. Adaobi", schedule: "Daily 9:00 AM",
  },
  {
    id: "KG_NUM", title: "Numeracy (Basic Numbers & Counting)", schoolLevel: "Kindergarten", subjectCategory: "Mathematics",
    code: "KMAT002", description: "Introduction to numbers and counting.", instructor: "Mrs. Adaobi", schedule: "Daily 10:00 AM",
  },
  {
    id: "NUR_ENG", title: "English Language (Nursery)", schoolLevel: "Nursery", subjectCategory: "Languages",
    code: "NLAN001", description: "Foundational English skills for nursery.", instructor: "Ms. Bola", schedule: "Daily 9:00 AM",
  },
  {
    id: "NUR_MTH", title: "Mathematics (Nursery)", schoolLevel: "Nursery", subjectCategory: "Mathematics",
    code: "NMAT002", description: "Basic mathematical concepts for nursery.", instructor: "Ms. Bola", schedule: "Daily 10:00 AM",
  },
  {
    id: "PRI_ENG", title: "English Language (Primary)", schoolLevel: "Primary", subjectCategory: "Languages",
    code: "PLAN001", description: "Developing reading, writing, and speaking skills.", instructor: "Mr. David", schedule: "Daily 9:00 AM",
  },
  {
    id: "PRI_MTH", title: "Mathematics (Primary)", schoolLevel: "Primary", subjectCategory: "Mathematics",
    code: "PMAT002", description: "Core mathematical concepts and problem-solving.", instructor: "Mrs. Esther", schedule: "Daily 10:00 AM",
  },
  {
    id: "JSS_ENG", title: "English Studies (JSS)", schoolLevel: "Secondary", subjectCategory: "Languages",
    code: "SLAN001", description: "Advanced English language and literature.", instructor: "Ms. Johnson", schedule: "Daily 8:00 AM", sssStream: "Core"
  },
  {
    id: "JSS_MTH", title: "Mathematics (JSS)", schoolLevel: "Secondary", subjectCategory: "Mathematics",
    code: "SMAT002", description: "Core mathematics for junior secondary.", instructor: "Mr. Adebayo", schedule: "Daily 9:00 AM", sssStream: "Core"
  },
  {
    id: "SSS_BIO_S", title: "Biology (SSS Science)", schoolLevel: "Secondary", subjectCategory: "Sciences", sssStream: "Science",
    code: "SSCI001", description: "Advanced biology for science students.", instructor: "Dr. Evelyn", schedule: "Mon/Wed/Fri 11:00 AM",
  },
];

interface StaffAllocation {
  [staffId: string]: string[]; // Array of subject IDs
}

interface StaffDetail { // Simplified for fetching names
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

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole | null;
    const userId = localStorage.getItem("userId");
    setUserRole(role);

    // Load subjects
    const storedSubjects = localStorage.getItem('schoolSubjectsData');
    if (storedSubjects) {
      try {
        setAllSubjects(JSON.parse(storedSubjects));
      } catch (e) {
        console.error("Failed to parse subjects from localStorage, using defaults.", e);
        setAllSubjects(defaultNigerianCurriculumSubjects);
        localStorage.setItem('schoolSubjectsData', JSON.stringify(defaultNigerianCurriculumSubjects));
      }
    } else {
      setAllSubjects(defaultNigerianCurriculumSubjects);
      localStorage.setItem('schoolSubjectsData', JSON.stringify(defaultNigerianCurriculumSubjects));
    }

    // Load all staff allocations
    const storedAllocationsStr = localStorage.getItem('staffCourseAllocations');
    if (storedAllocationsStr) {
        try {
            setAllStaffAllocations(JSON.parse(storedAllocationsStr));
        } catch (e) {
            console.error("Failed to parse staff allocations from localStorage", e);
            setAllStaffAllocations({});
        }
    }

    // Load all staff details for names
    const storedUsersString = localStorage.getItem('managedUsers');
    if (storedUsersString) {
        try {
            const allManagedUsers: Array<{ id: string; name: string; role: UserRole }> = JSON.parse(storedUsersString);
            const staffUsers = allManagedUsers
                .filter(u => u.role === 'staff' || u.role === 'admin')
                .map(u => ({ id: u.id, name: u.name }));
            setAllStaffDetails(staffUsers);
        } catch (e) {
            console.error("Failed to parse managed users for staff names", e);
            setAllStaffDetails([]);
        }
    }


    if (role === 'staff' && userId && storedAllocationsStr) { // Check storedAllocationsStr to ensure allStaffAllocations is populated
      try {
        const allocations: StaffAllocation = JSON.parse(storedAllocationsStr); // Re-parse for this specific logic part
        if (allocations[userId] && allocations[userId].length > 0) {
          setAllocatedSubjectIdsForStaff(allocations[userId]);
          setPageDescription("Browse your allocated subjects. Filter by school level, subject category, and SSS stream.");
        } else {
          setPageDescription("You currently have no subjects allocated. Contact an administrator.");
          setAllocatedSubjectIdsForStaff([]); 
        }
      } catch (e) {
        console.error("Failed to parse staff allocations for current staff member", e);
        setAllocatedSubjectIdsForStaff([]);
        setPageDescription("Could not load your allocated subjects. Contact an administrator.");
      }
    } else if (role === 'staff' && userId && !storedAllocationsStr) { // No allocations file yet
        setPageDescription("You currently have no subjects allocated. Contact an administrator.");
        setAllocatedSubjectIdsForStaff([]);
    } else if (role === 'student' || role === 'admin') {
       setPageDescription("Browse available subjects. Filter by school level, subject category, and SSS stream.");
    }
  }, [userRole]); 

  const saveSubjectsToLocalStorage = (subjects: Subject[]) => {
    localStorage.setItem('schoolSubjectsData', JSON.stringify(subjects));
    setAllSubjects(subjects);
  };

  const handleOpenDialog = (subject: Subject | null = null) => {
    setEditingSubject(subject);
    if (subject) {
      subjectForm.reset({
        ...subject,
      });
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
        id: `sub-${Date.now()}`, 
        ...data,
      };
      saveSubjectsToLocalStorage([...allSubjects, newSubject]);
      toast({ title: "Subject Added", description: `${data.title} has been added.` });
    }
    setIsDialogOpen(false);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (window.confirm("Are you sure you want to delete this subject? This action cannot be undone.")) {
      const updatedSubjects = allSubjects.filter(sub => sub.id !== subjectId);
      saveSubjectsToLocalStorage(updatedSubjects);
      const storedAllocations = localStorage.getItem('staffCourseAllocations');
      if (storedAllocations) {
        try {
          const allocations: StaffAllocation = JSON.parse(storedAllocations);
          const newAllocations: StaffAllocation = {};
          for (const staffId in allocations) {
            newAllocations[staffId] = allocations[staffId].filter(subId => subId !== subjectId);
          }
          localStorage.setItem('staffCourseAllocations', JSON.stringify(newAllocations));
          setAllStaffAllocations(newAllocations); // Update state as well
        } catch (e) {
          console.error("Error updating staff allocations after subject deletion:", e);
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
    return subjectsToDisplay;
  };

  const filteredSubjects = getFilteredSubjects();

  const getCategoryIcon = (category: SubjectCategory) => {
    const Icon = subjectCategoryIcons[category] || BookText; 
    return <Icon className="h-4 w-4 mr-1" />;
  };
  
  const getInstructorNamesForSubject = (subjectId: string): string => {
    const assignedStaffIds: string[] = [];
    for (const staffId in allStaffAllocations) {
      if (allStaffAllocations[staffId].includes(subjectId)) {
        assignedStaffIds.push(staffId);
      }
    }

    if (assignedStaffIds.length === 0) {
      const subject = allSubjects.find(s => s.id === subjectId);
      return subject?.instructor || "Not Assigned"; // Fallback to default instructor if none allocated
    }

    const instructorNames = assignedStaffIds
      .map(staffId => {
        const staffMember = allStaffDetails.find(staff => staff.id === staffId);
        return staffMember ? staffMember.name : null; // Return null if not found
      })
      .filter(name => name !== null) // Filter out nulls
      .join(', ');

    return instructorNames || "Not Assigned"; // If all lookups failed but IDs were present
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
              <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between">
                <Button variant="outline" className="w-full sm:w-auto">
                  <BookText className="mr-2 h-4 w-4" /> View Details
                </Button>
                {userRole === 'admin' && (
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="icon" onClick={() => handleOpenDialog(subject)} className="flex-1 sm:flex-none">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteSubject(subject.id)} className="flex-1 sm:flex-none">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <p className="text-center text-muted-foreground col-span-full">
            {userRole === 'staff' && allocatedSubjectIdsForStaff.length === 0
                ? "You currently have no subjects allocated. Please contact an administrator."
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
                    <Label htmlFor="sssStream">SSS Stream (Optional, for Secondary)</Label>
                     <Controller
                        name="sssStream"
                        control={subjectForm.control}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                            <SelectTrigger id="sssStream"><SelectValue placeholder="Select SSS stream if applicable" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {sssStreams.map(stream => (<SelectItem key={stream} value={stream}>{stream}</SelectItem>))}
                            </SelectContent>
                        </Select>
                        )}
                    />
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
