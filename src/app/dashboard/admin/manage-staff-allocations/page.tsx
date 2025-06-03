
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { UserRole, SchoolLevel } from "@/lib/constants";
import { BookUser, Save } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  schoolLevel: SchoolLevel;
}

// Mock data - in a real app, this would come from a database
const mockStaffList: StaffMember[] = [
  { id: "staff001", name: "Dr. Eleanor Vance" },
  { id: "staff004", name: "Prof. Robert Downy" },
  { id: "staff005", name: "Mrs. Daisy Fields" },
];

const mockCourseList: Course[] = [
  { id: "CS101", name: "Introduction to Programming", schoolLevel: "Secondary" },
  { id: "MA202", name: "Calculus II", schoolLevel: "Secondary" },
  { id: "KIDART101", name: "Fun with Colors", schoolLevel: "Kindergarten" },
  { id: "PRIMSCI101", name: "Nature Wonders", schoolLevel: "Primary" },
  { id: "ENGL300", name: "Advanced Composition", schoolLevel: "Secondary" },
];

interface StaffAllocation {
  [staffId: string]: string[]; // Array of course IDs
}

export default function ManageStaffAllocationsPage() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | undefined>();
  const [allocations, setAllocations] = useState<StaffAllocation>({});

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    setUserRole(role);
    // Mock initial allocations (e.g., Dr. Vance teaches CS101)
    setAllocations({ "staff001": ["CS101"] });
  }, []);

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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Manage Staff Allocations</h1>
        <p className="text-muted-foreground">Assign courses and subject mastery to staff members.</p>
      </header>

      <Card className="shadow-xl max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookUser /> Subject Allocation</CardTitle>
          <div className="mt-4">
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
        </CardHeader>
        <CardContent>
          {selectedStaff ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Available Courses for {mockStaffList.find(s => s.id === selectedStaff)?.name || 'Selected Staff'}:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-1 border rounded-md">
                {mockCourseList.map(course => (
                  <div key={course.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary/50">
                    <Checkbox
                      id={`course-${course.id}`}
                      checked={staffCourses.includes(course.id)}
                      onCheckedChange={() => handleCourseToggle(course.id)}
                    />
                    <Label htmlFor={`course-${course.id}`} className="flex flex-col">
                      <span>{course.name}</span>
                      <span className="text-xs text-muted-foreground">{course.schoolLevel}</span>
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveChanges} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Save className="mr-2 h-4 w-4"/> Save Changes
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
