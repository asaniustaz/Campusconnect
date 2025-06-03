
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { UserRole, SchoolLevel, SubjectCategory } from "@/lib/constants";
import { BookUser, Save } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
}

interface CourseForAllocation {
  id: string;
  name: string;
  schoolLevel: SchoolLevel;
  subjectCategory: SubjectCategory; 
}

// K-12 Focused Mock Staff List
const mockStaffList: StaffMember[] = [
  { id: "staff001", name: "Mrs. Eleanor Vance (Senior Science Teacher)" },
  { id: "staff002", name: "Mr. Samuel Green (Admin Officer)" },
  { id: "staff003", name: "Ms. Olivia Chen (Librarian)" },
  { id: "staff004", name: "Mr. Robert Adewale (Math Teacher)" },
  { id: "staff005", name: "Mrs. Daisy Fields (KG Teacher)" },
  { id: "staff006", name: "Ms. Bola Aderibigbe (Nursery Teacher)"},
  { id: "staff007", name: "Mr. David Okon (Primary English Teacher)"},
  { id: "staff008", name: "Mrs. Esther Musa (Primary Math Teacher)"},
  { id: "staff009", name: "Ms. Johnson Chioma (JSS English Teacher)"},
  { id: "staff010", name: "Mr. Adebayo Bello (JSS Math Teacher)"},
  { id: "staff011", name: "Mr. Wole Soyinka (SSS English Teacher)"}, // Placeholder famous name
  { id: "staff012", name: "Dr. Funmi Kuti (SSS Math Teacher)"}, // Placeholder
];

// This list should ideally be dynamically fetched or consistent with courses page
// For now, a representative subset from the nigerianCurriculumCourses
const mockCourseListForAllocation: CourseForAllocation[] = [
  // Kindergarten
  { id: "KG_LIT", name: "Literacy (KG)", schoolLevel: "Kindergarten", subjectCategory: "Languages" },
  { id: "KG_NUM", name: "Numeracy (KG)", schoolLevel: "Kindergarten", subjectCategory: "Mathematics" },
  // Nursery (Primary Level)
  { id: "NUR_ENG", name: "English Language (Nursery)", schoolLevel: "Primary", subjectCategory: "Languages" },
  { id: "NUR_MTH", name: "Mathematics (Nursery)", schoolLevel: "Primary", subjectCategory: "Mathematics" },
  { id: "NUR_BSC", name: "Basic Science (Nursery)", schoolLevel: "Primary", subjectCategory: "Sciences" },
  // Primary
  { id: "PRI_ENG", name: "English Language (Primary)", schoolLevel: "Primary", subjectCategory: "Languages" },
  { id: "PRI_MTH", name: "Mathematics (Primary)", schoolLevel: "Primary", subjectCategory: "Mathematics" },
  { id: "PRI_BST", name: "Basic Science & Tech (Primary)", schoolLevel: "Primary", subjectCategory: "Sciences" },
  // JSS (Secondary Level)
  { id: "JSS_ENG", name: "English Studies (JSS)", schoolLevel: "Secondary", subjectCategory: "Languages" },
  { id: "JSS_MTH", name: "Mathematics (JSS)", schoolLevel: "Secondary", subjectCategory: "Mathematics" },
  { id: "JSS_BSC", name: "Basic Science (JSS)", schoolLevel: "Secondary", subjectCategory: "Sciences" },
  // SSS (Secondary Level) - Core
  { id: "SSS_ENG_C", name: "English Language (SSS Core)", schoolLevel: "Secondary", subjectCategory: "Languages" },
  { id: "SSS_MTH_C", name: "Mathematics (SSS Core)", schoolLevel: "Secondary", subjectCategory: "Mathematics" },
  // SSS - Science
  { id: "SSS_BIO_S", name: "Biology (SSS Science)", schoolLevel: "Secondary", subjectCategory: "Sciences" },
  { id: "SSS_CHM_S", name: "Chemistry (SSS Science)", schoolLevel: "Secondary", subjectCategory: "Sciences" },
];


interface StaffAllocation {
  [staffId: string]: string[]; // Array of course IDs
}

export default function ManageStaffAllocationsPage() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | undefined>();
  const [allocations, setAllocations] = useState<StaffAllocation>({});
  const [filteredCourses, setFilteredCourses] = useState<CourseForAllocation[]>(mockCourseListForAllocation);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<SchoolLevel | "all">("all");

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    setUserRole(role);
    setAllocations({ "staff001": ["SSS_CHM_S"] }); // Example allocation
  }, []);

  useEffect(() => {
    if (selectedLevelFilter === "all") {
      setFilteredCourses(mockCourseListForAllocation);
    } else {
      setFilteredCourses(mockCourseListForAllocation.filter(course => course.schoolLevel === selectedLevelFilter));
    }
  }, [selectedLevelFilter]);

  const handleCourseToggle = (courseId: string) => {
    if (!selectedStaff) return;
    setAllocations(prev => {
      const currentCourses = prev[selectedStaff] || [];
      const newCourses = currentCourses.includes(courseId)
        ? currentCourses.filter(id => id !== courseId)
        : [...currentCourses, courseId];
      return { ...prev, [selectedStaff]: newCourses };
    });
  };

  const handleSaveChanges = () => {
    if (!selectedStaff) {
      toast({ variant: "destructive", title: "Error", description: "Please select a staff member." });
      return;
    }
    console.log("Saving allocations for", selectedStaff, ":", allocations[selectedStaff]);
    toast({
      title: "Allocations Saved",
      description: `Subject allocations for ${mockStaffList.find(s => s.id === selectedStaff)?.name} have been updated.`,
    });
  };

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

  const staffCourses = selectedStaff ? (allocations[selectedStaff] || []) : [];
  const staffMemberDetails = mockStaffList.find(s => s.id === selectedStaff);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Manage Staff Allocations</h1>
        <p className="text-muted-foreground">Assign subjects and class mastery to staff members.</p>
      </header>

      <Card className="shadow-xl max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookUser /> Subject Allocation</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="staffSelect">Select Staff Member</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger id="staffSelect" className="w-full">
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {mockStaffList.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="levelFilter">Filter Subjects by Level</Label>
              <Select value={selectedLevelFilter} onValueChange={(value) => setSelectedLevelFilter(value as SchoolLevel | "all")}>
                <SelectTrigger id="levelFilter" className="w-full">
                  <SelectValue placeholder="Filter by school level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {(["Kindergarten", "Primary", "Secondary"] as SchoolLevel[]).map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedStaff && staffMemberDetails ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Available Subjects for {staffMemberDetails.name}:</h3>
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2 border rounded-md">
                  {filteredCourses.map(course => (
                    <div key={course.id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary/50 border">
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={staffCourses.includes(course.id)}
                        onCheckedChange={() => handleCourseToggle(course.id)}
                        aria-label={`Allocate ${course.name} to ${staffMemberDetails.name}`}
                      />
                      <Label htmlFor={`course-${course.id}`} className="flex flex-col cursor-pointer">
                        <span>{course.name}</span>
                        <span className="text-xs text-muted-foreground">{course.schoolLevel} - {course.subjectCategory}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No subjects match the selected level filter.</p>
              )}
              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveChanges} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Save className="mr-2 h-4 w-4"/> Save Changes for {staffMemberDetails.name}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Please select a staff member and level filter to manage their allocations.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    