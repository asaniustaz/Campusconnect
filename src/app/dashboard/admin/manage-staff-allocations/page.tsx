
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { UserRole, SchoolLevel, SubjectCategory } from "@/lib/constants";
import { SCHOOL_LEVELS } from "@/lib/constants"; // Import SCHOOL_LEVELS
import { BookUser, Save } from "lucide-react";

// ManagedUser is a user from localStorage, could be student, staff, or admin
interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Staff-specific fields, might be optional if user is admin without these set
  department?: string;
  title?: string;
}


interface CourseForAllocation {
  id: string;
  name: string;
  schoolLevel: SchoolLevel;
  subjectCategory: SubjectCategory;
}

// This list should ideally be dynamically fetched or consistent with courses page
// For now, a representative subset from the nigerianCurriculumCourses
const mockCourseListForAllocation: CourseForAllocation[] = [
  // Kindergarten
  { id: "KG_LIT", name: "Literacy (KG)", schoolLevel: "Kindergarten", subjectCategory: "Languages" },
  { id: "KG_NUM", name: "Numeracy (KG)", schoolLevel: "Kindergarten", subjectCategory: "Mathematics" },
  // Nursery
  { id: "NUR_ENG", name: "English Language (Nursery)", schoolLevel: "Nursery", subjectCategory: "Languages" },
  { id: "NUR_MTH", name: "Mathematics (Nursery)", schoolLevel: "Nursery", subjectCategory: "Mathematics" },
  { id: "NUR_BSC", name: "Basic Science (Nursery)", schoolLevel: "Nursery", subjectCategory: "Sciences" },
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
  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>();
  const [allocations, setAllocations] = useState<StaffAllocation>({});
  const [filteredCourses, setFilteredCourses] = useState<CourseForAllocation[]>(mockCourseListForAllocation);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<SchoolLevel | "all">("all");
  const [availableStaff, setAvailableStaff] = useState<ManagedUser[]>([]);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    setUserRole(role);

    // Load staff from localStorage
    if (typeof window !== 'undefined') {
      const storedUsersString = localStorage.getItem('managedUsers');
      if (storedUsersString) {
        try {
          const allStoredUsers: ManagedUser[] = JSON.parse(storedUsersString);
          // Filter for users who are staff or admin, as admins might also be assigned subjects
          const staffUsers = allStoredUsers.filter(u => u.role === 'staff' || u.role === 'admin');
          setAvailableStaff(staffUsers);
        } catch (e) {
          console.error("Failed to parse users from localStorage", e);
          setAvailableStaff([]); // Fallback to empty if parsing fails
        }
      } else {
        setAvailableStaff([]); // No users in localStorage
      }

       // Load allocations from localStorage
      const storedAllocations = localStorage.getItem('staffCourseAllocations');
      if (storedAllocations) {
        try {
          setAllocations(JSON.parse(storedAllocations));
        } catch (e) {
          console.error("Failed to parse allocations from localStorage", e);
          setAllocations({}); // Fallback to empty if parsing fails
        }
      } else {
        setAllocations({}); // No allocations in localStorage yet
      }
    }
  }, []);

  useEffect(() => {
    if (selectedLevelFilter === "all") {
      setFilteredCourses(mockCourseListForAllocation);
    } else {
      setFilteredCourses(mockCourseListForAllocation.filter(course => course.schoolLevel === selectedLevelFilter));
    }
  }, [selectedLevelFilter]);

  const handleCourseToggle = (courseId: string) => {
    if (!selectedStaffId) return;
    setAllocations(prev => {
      const currentCourses = prev[selectedStaffId] || [];
      const newCourses = currentCourses.includes(courseId)
        ? currentCourses.filter(id => id !== courseId)
        : [...currentCourses, courseId];
      return { ...prev, [selectedStaffId]: newCourses };
    });
  };

  const handleSaveChanges = () => {
    if (!selectedStaffId) {
      toast({ variant: "destructive", title: "Error", description: "Please select a staff member." });
      return;
    }
    // Save to localStorage
     if (typeof window !== 'undefined') {
        localStorage.setItem('staffCourseAllocations', JSON.stringify(allocations));
     }
    const staffMemberName = availableStaff.find(s => s.id === selectedStaffId)?.name || "Selected Staff";
    console.log("Saving allocations for", staffMemberName, ":", allocations[selectedStaffId]);
    toast({
      title: "Allocations Saved",
      description: `Subject allocations for ${staffMemberName} have been updated.`,
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

  const staffCourses = selectedStaffId ? (allocations[selectedStaffId] || []) : [];
  const staffMemberDetails = availableStaff.find(s => s.id === selectedStaffId);

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
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger id="staffSelect" className="w-full">
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {availableStaff.length > 0 ? availableStaff.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>{staff.name} ({staff.title || staff.role})</SelectItem>
                  )) : <SelectItem value="no-staff" disabled>No staff available</SelectItem>}
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
                  {SCHOOL_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedStaffId && staffMemberDetails ? (
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
    

    
