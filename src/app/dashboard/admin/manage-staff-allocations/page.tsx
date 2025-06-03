
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
  subjectCategory: SubjectCategory; // Added for context
}

// Mock data - in a real app, this would come from a database
const mockStaffList: StaffMember[] = [
  { id: "staff001", name: "Dr. Eleanor Vance" },
  { id: "staff002", name: "Mr. Samuel Green" },
  { id: "staff003", name: "Ms. Olivia Chen" },
  { id: "staff004", name: "Prof. Robert Downy" },
  { id: "staff005", name: "Mrs. Daisy Fields" },
  { id: "staff006", name: "Ms. Bola (Nursery Eng/Math)"},
  { id: "staff007", name: "Mr. David (Primary Eng)"},
  { id: "staff008", name: "Mrs. Esther (Primary Math)"},
  { id: "staff009", name: "Ms. Johnson (JSS Eng)"},
  { id: "staff010", name: "Mr. Adebayo (JSS Math)"},
  { id: "staff011", name: "Prof. Wole (SSS Eng)"},
  { id: "staff012", name: "Dr. Funmi (SSS Math)"},
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
  { id: "PRI_SOS", name: "Social Studies (Primary)", schoolLevel: "Primary", subjectCategory: "Social & Humanities" },
  // JSS (Secondary Level)
  { id: "JSS_ENG", name: "English Studies (JSS)", schoolLevel: "Secondary", subjectCategory: "Languages" },
  { id: "JSS_MTH", name: "Mathematics (JSS)", schoolLevel: "Secondary", subjectCategory: "Mathematics" },
  { id: "JSS_BSC", name: "Basic Science (JSS)", schoolLevel: "Secondary", subjectCategory: "Sciences" },
  { id: "JSS_BT", name: "Basic Technology (JSS)", schoolLevel: "Secondary", subjectCategory: "Technology" },
  { id: "JSS_BUS", name: "Business Studies (JSS)", schoolLevel: "Secondary", subjectCategory: "Business & Vocational" },
  // SSS (Secondary Level) - Core
  { id: "SSS_ENG_C", name: "English Language (SSS Core)", schoolLevel: "Secondary", subjectCategory: "Languages" },
  { id: "SSS_MTH_C", name: "Mathematics (SSS Core)", schoolLevel: "Secondary", subjectCategory: "Mathematics" },
  { id: "SSS_CIV_C", name: "Civic Education (SSS Core)", schoolLevel: "Secondary", subjectCategory: "Social & Humanities" },
  // SSS - Science
  { id: "SSS_BIO_S", name: "Biology (SSS Science)", schoolLevel: "Secondary", subjectCategory: "Sciences" },
  { id: "SSS_CHM_S", name: "Chemistry (SSS Science)", schoolLevel: "Secondary", subjectCategory: "Sciences" },
  { id: "SSS_PHY_S", name: "Physics (SSS Science)", schoolLevel: "Secondary", subjectCategory: "Sciences" },
  // SSS - Art
  { id: "SSS_LIT_A", name: "Literature-in-English (SSS Art)", schoolLevel: "Secondary", subjectCategory: "Languages" },
  { id: "SSS_GOV_A", name: "Government (SSS Art)", schoolLevel: "Secondary", subjectCategory: "Social & Humanities" },
  // SSS - Commercial
  { id: "SSS_ECON_C", name: "Economics (SSS Commercial)", schoolLevel: "Secondary", subjectCategory: "Business & Vocational" },
  { id: "SSS_ACC_C", name: "Accounting (SSS Commercial)", schoolLevel: "Secondary", subjectCategory: "Business & Vocational" },
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
    // Mock initial allocations (e.g., Dr. Vance teaches SSS_ENG_C)
    setAllocations({ "staff001": ["SSS_ENG_C"] });
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
    // In a real app, this data would be saved to a database
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
        <p className="text-muted-foreground">Assign courses and subject mastery to staff members.</p>
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
              <Label htmlFor="levelFilter">Filter Courses by Level</Label>
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
              <h3 className="text-lg font-medium">Available Courses for {staffMemberDetails.name}:</h3>
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
                <p className="text-muted-foreground text-center py-4">No courses match the selected level filter.</p>
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
