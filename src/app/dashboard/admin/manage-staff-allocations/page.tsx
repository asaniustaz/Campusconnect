
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { UserRole, SchoolSection, SubjectCategory, StaffMember } from "@/lib/constants";
import { SCHOOL_SECTIONS, combineName } from "@/lib/constants"; 
import { BookUser, Save } from "lucide-react";

interface CourseForAllocation {
  id: string;
  name: string;
  schoolSection: SchoolSection;
  subjectCategory: SubjectCategory;
}

const mockCourseListForAllocation: CourseForAllocation[] = [
  // College
  { id: "JSS_ENG", name: "English Studies (JSS)", schoolSection: "College", subjectCategory: "Languages" },
  { id: "JSS_MTH", name: "Mathematics (JSS)", schoolSection: "College", subjectCategory: "Mathematics" },
  { id: "JSS_BSC", name: "Basic Science (JSS)", schoolSection: "College", subjectCategory: "Sciences" },
  { id: "SSS_ENG_C", name: "English Language (SSS Core)", schoolSection: "College", subjectCategory: "Languages" },
  { id: "SSS_MTH_C", name: "Mathematics (SSS Core)", schoolSection: "College", subjectCategory: "Mathematics" },
  { id: "SSS_BIO_S", name: "Biology (SSS Science)", schoolSection: "College", subjectCategory: "Sciences" },
  { id: "SSS_CHM_S", name: "Chemistry (SSS Science)", schoolSection: "College", subjectCategory: "Sciences" },
  // Islamiyya
  { id: "ISL_QUR", name: "Quranic Studies", schoolSection: "Islamiyya", subjectCategory: "Religious Studies" },
  { id: "ISL_ARB", name: "Arabic Language", schoolSection: "Islamiyya", subjectCategory: "Languages" },
  // Tahfeez
  { id: "TAH_MEM", name: "Quran Memorization", schoolSection: "Tahfeez", subjectCategory: "Religious Studies" },
  { id: "TAH_TAJ", name: "Tajweed", schoolSection: "Tahfeez", subjectCategory: "Religious Studies" },
];


interface StaffAllocation {
  [staffId: string]: string[]; // Array of course IDs
}

export default function ManageStaffAllocationsPage() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);

  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>();
  const [allocations, setAllocations] = useState<StaffAllocation>({});
  const [filteredCourses, setFilteredCourses] = useState<CourseForAllocation[]>(mockCourseListForAllocation);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<SchoolSection | "all">("all");
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const userId = localStorage.getItem("userId");
    setUserRole(role);

    // Load staff from localStorage
    if (typeof window !== 'undefined') {
      const storedUsersString = localStorage.getItem('managedUsers');
      if (storedUsersString) {
        try {
          const allStoredUsers: StaffMember[] = JSON.parse(storedUsersString);
          // Filter for users who are staff or admin, as admins might also be assigned subjects
          const staffUsers = allStoredUsers.filter(u => u.role === 'staff' || u.role === 'admin' || u.role === 'head_of_section');
          setAvailableStaff(staffUsers);

          if (userId && (role === 'admin' || role === 'head_of_section')) {
            const foundUser = allStoredUsers.find(u => u.id === userId);
            if (foundUser) {
              setCurrentUser(foundUser);
              if (role === 'head_of_section') {
                setSelectedSectionFilter(foundUser.section || 'all');
              }
            }
          }

        } catch (e) {
          console.error("Failed to parse users from localStorage for staff allocations:", e);
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
    if (selectedSectionFilter === "all") {
      setFilteredCourses(mockCourseListForAllocation);
    } else {
      setFilteredCourses(mockCourseListForAllocation.filter(course => course.schoolSection === selectedSectionFilter));
    }
  }, [selectedSectionFilter]);

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
    const staffMember = visibleStaff.find(s => s.id === selectedStaffId);
    const staffMemberName = staffMember ? combineName(staffMember) : "Selected Staff";
    console.log("Saving allocations for", staffMemberName, ":", allocations[selectedStaffId]);
    toast({
      title: "Allocations Saved",
      description: `Subject allocations for ${staffMemberName} have been updated.`,
    });
  };

  const visibleStaff = userRole === 'head_of_section' && currentUser?.section
    ? availableStaff.filter(s => s.section === currentUser.section || s.role === 'staff') // HOS can assign to staff in their section
    : availableStaff;

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

  const staffCourses = selectedStaffId ? (allocations[selectedStaffId] || []) : [];
  const staffMemberDetails = visibleStaff.find(s => s.id === selectedStaffId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Manage Staff Allocations</h1>
        <p className="text-muted-foreground">Assign subjects to staff members {userRole === 'head_of_section' && `for the ${currentUser?.section} section`}.</p>
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
                  {visibleStaff.length > 0 ? visibleStaff.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>{combineName(staff)} ({staff.title || staff.role})</SelectItem>
                  )) : <SelectItem value="no-staff" disabled>No staff available</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="levelFilter">Filter Subjects by Section</Label>
              <Select value={selectedSectionFilter} onValueChange={(value) => setSelectedSectionFilter(value as SchoolSection | "all")} disabled={userRole === 'head_of_section'}>
                <SelectTrigger id="levelFilter" className="w-full">
                  <SelectValue placeholder="Filter by school section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {SCHOOL_SECTIONS.map(section => (
                    <SelectItem key={section} value={section} disabled={userRole === 'head_of_section' && section !== currentUser?.section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedStaffId && staffMemberDetails ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Available Subjects for {combineName(staffMemberDetails)}:</h3>
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2 border rounded-md">
                  {filteredCourses.map(course => (
                    <div key={course.id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary/50 border">
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={staffCourses.includes(course.id)}
                        onCheckedChange={() => handleCourseToggle(course.id)}
                        aria-label={`Allocate ${course.name} to ${combineName(staffMemberDetails)}`}
                      />
                      <Label htmlFor={`course-${course.id}`} className="flex flex-col cursor-pointer">
                        <span>{course.name}</span>
                        <span className="text-xs text-muted-foreground">{course.schoolSection} - {course.subjectCategory}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No subjects match the selected section filter.</p>
              )}
              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveChanges} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Save className="mr-2 h-4 w-4"/> Save Changes for {combineName(staffMemberDetails)}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Please select a staff member to manage their allocations.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
