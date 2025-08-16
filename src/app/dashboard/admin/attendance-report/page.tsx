
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Filter, Users } from "lucide-react";
import { format, subDays } from "date-fns";
import type { UserRole, SchoolClass } from "@/lib/constants";
import { mockSchoolClasses as defaultClasses } from "@/lib/constants"; // Using mockSchoolClasses
import { Badge } from "@/components/ui/badge";

interface AggregatedAttendanceRecord {
  id: string; // Combination of classId, date, and index
  className: string;
  classId: string; 
  date: string;
  totalStudentsInClass: number; // From SchoolClass.studentCount as a reference
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
}

// Generate mock reports based on classes
const generateMockClassReport = (classes: SchoolClass[]): AggregatedAttendanceRecord[] => {
  const reports: AggregatedAttendanceRecord[] = [];
  const today = new Date();
  classes.forEach(cls => {
    // Generate a few reports for each class for the last few weeks (weekdays only)
    for (let i = 0; i < 5; i++) { 
      let reportDate = subDays(today, Math.floor(Math.random() * 30) +1); // Random day in last 30 days
      // Ensure it's a weekday
      while(reportDate.getDay() === 0 || reportDate.getDay() === 6) {
        reportDate = subDays(reportDate, 1);
      }
      const dateStr = format(reportDate, "yyyy-MM-dd");
      
      const totalStudentsInClass = Math.floor(Math.random() * 15) + 15; // Mock student count per class for demo
      const presentCount = Math.floor(Math.random() * (totalStudentsInClass + 1)); // Can be 0 to totalStudents
      const absentCount = totalStudentsInClass - presentCount;
      const attendanceRate = totalStudentsInClass > 0 ? parseFloat(((presentCount / totalStudentsInClass) * 100).toFixed(1)) : 0;
      
      reports.push({
        id: `${cls.id}-${dateStr}-${i}`, // Added index 'i' to ensure uniqueness
        className: `${cls.name} (${cls.displayLevel})`,
        classId: cls.id,
        date: dateStr,
        totalStudentsInClass,
        presentCount,
        absentCount,
        attendanceRate,
      });
    }
  });
  // Sort by date descending, then by class name
  return reports.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.className.localeCompare(b.className));
};


export default function AttendanceReportPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);
  const [reportData, setReportData] = useState<AggregatedAttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AggregatedAttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | "all">("all");
  const [selectedDateRange, setSelectedDateRange] = useState<{ from?: Date; to?: Date }>({});

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    setUserRole(role);

    let currentClasses: SchoolClass[] = [];
    if (typeof window !== 'undefined') {
        const storedClassesString = localStorage.getItem('schoolClasses');
        if (storedClassesString) {
            try {
                currentClasses = JSON.parse(storedClassesString);
            } catch (e) {
                currentClasses = defaultClasses;
            }
        } else {
            currentClasses = defaultClasses;
        }
    }
    setAllClasses(currentClasses);
    const initialReport = generateMockClassReport(currentClasses);
    setReportData(initialReport);
    setFilteredData(initialReport);
  }, []);

  useEffect(() => {
    let data = reportData;
    if (selectedClass !== "all") {
      data = data.filter(record => record.classId === selectedClass);
    }
    if (selectedDateRange.from && selectedDateRange.to) {
      data = data.filter(record => {
        const recordDate = new Date(record.date);
        // Inclusive of start and end date
        const from = new Date(selectedDateRange.from!.setHours(0,0,0,0));
        const to = new Date(selectedDateRange.to!.setHours(23,59,59,999));
        return recordDate >= from && recordDate <= to;
      });
    } else if (selectedDateRange.from) {
       const from = new Date(selectedDateRange.from!.setHours(0,0,0,0));
       data = data.filter(record => new Date(record.date) >= from);
    } else if (selectedDateRange.to) {
        const to = new Date(selectedDateRange.to!.setHours(23,59,59,999));
        data = data.filter(record => new Date(record.date) <= to);
    }
    setFilteredData(data);
  }, [reportData, selectedClass, selectedDateRange]);

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
        <h1 className="text-3xl font-bold font-headline text-foreground">Class Attendance Report</h1>
        <p className="text-muted-foreground">View aggregated attendance records for all classes.</p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter /> Filters</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {allClasses.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name} ({cls.displayLevel})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDateRange.from ? 
                    selectedDateRange.to ? 
                    `${format(selectedDateRange.from, "LLL dd, y")} - ${format(selectedDateRange.to, "LLL dd, y")}`
                    : format(selectedDateRange.from, "LLL dd, y") 
                    : <span>Pick a date range</span>
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={selectedDateRange.from}
                  selected={selectedDateRange}
                  onSelect={setSelectedDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

             <Button variant="outline" onClick={() => {setSelectedClass("all"); setSelectedDateRange({});}} className="w-full lg:w-auto">
                Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Class Name</TableHead>
                  <TableHead className="text-center">Total Students</TableHead>
                  <TableHead className="text-center">Present</TableHead>
                  <TableHead className="text-center">Absent</TableHead>
                  <TableHead className="text-center">Attendance Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.date), "PPP")}</TableCell>
                    <TableCell><Badge variant="secondary">{record.className}</Badge></TableCell>
                    <TableCell className="text-center">{record.totalStudentsInClass}</TableCell>
                    <TableCell className="text-center text-green-600 font-medium">{record.presentCount}</TableCell>
                    <TableCell className="text-center text-red-600 font-medium">{record.absentCount}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={record.attendanceRate >= 80 ? "default" : record.attendanceRate >= 60 ? "secondary" : "destructive"}
                               className={record.attendanceRate >= 80 ? 'bg-green-500 hover:bg-green-600' : record.attendanceRate >= 60 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'}
                        >
                         {record.attendanceRate}%
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-10">No attendance records match the selected filters.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    
