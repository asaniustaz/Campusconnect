
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Filter } from "lucide-react"; // Removed Users, Percent as they might not fit K-12 context as well
import { format, subDays } from "date-fns";
import type { UserRole } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface AggregatedAttendanceRecord {
  id: string;
  subjectName: string; // Changed from courseName
  subjectCode: string; // Changed from courseCode
  date: string; 
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number; 
}

// Mock Subjects for Report (aligning with K-12)
const mockSubjectsForReport = [
  { id: "PRI_ENG", name: "English Language (Primary)", code: "PRI_ENG" },
  { id: "JSS_MTH", name: "Mathematics (JSS)", code: "JSS_MTH" },
  { id: "NUR_BSC", name: "Basic Science (Nursery)", code: "NUR_BSC" },
  { id: "SSS_CHM_S", name: "Chemistry (SSS Science)", code: "SSS_CHM_S" },
  { id: "KG_LIT", name: "Literacy (KG)", code: "KG_LIT" },
];

const generateMockReport = (): AggregatedAttendanceRecord[] => {
  const reports: AggregatedAttendanceRecord[] = [];
  const today = new Date();
  mockSubjectsForReport.forEach(subject => {
    for (let i = 0; i < 5; i++) { 
      const date = format(subDays(today, i * 7), "yyyy-MM-dd"); 
      const totalStudents = Math.floor(Math.random() * 20) + 10; 
      const presentCount = Math.floor(Math.random() * totalStudents);
      const absentCount = totalStudents - presentCount;
      const attendanceRate = parseFloat(((presentCount / totalStudents) * 100).toFixed(1));
      reports.push({
        id: `${subject.code}-${date}`,
        subjectName: subject.name,
        subjectCode: subject.code,
        date: date,
        totalStudents,
        presentCount,
        absentCount,
        attendanceRate,
      });
    }
  });
  return reports;
};


export default function AttendanceReportPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [reportData, setReportData] = useState<AggregatedAttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AggregatedAttendanceRecord[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | "all">("all"); // Changed from selectedCourse
  const [selectedDateRange, setSelectedDateRange] = useState<{ from?: Date; to?: Date }>({});

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    setUserRole(role);
    const initialReport = generateMockReport();
    setReportData(initialReport);
    setFilteredData(initialReport);
  }, []);

  useEffect(() => {
    let data = reportData;
    if (selectedSubject !== "all") {
      data = data.filter(record => record.subjectCode === selectedSubject);
    }
    if (selectedDateRange.from && selectedDateRange.to) {
      data = data.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= selectedDateRange.from! && recordDate <= selectedDateRange.to!;
      });
    } else if (selectedDateRange.from) {
       data = data.filter(record => new Date(record.date) >= selectedDateRange.from!);
    } else if (selectedDateRange.to) {
        data = data.filter(record => new Date(record.date) <= selectedDateRange.to!);
    }
    setFilteredData(data);
  }, [reportData, selectedSubject, selectedDateRange]);

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
        <h1 className="text-3xl font-bold font-headline text-foreground">Attendance Report</h1>
        <p className="text-muted-foreground">View aggregated attendance records for all classes and subjects.</p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter /> Filters</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {mockSubjectsForReport.map(subject => (
                  <SelectItem key={subject.id} value={subject.code}>{subject.name}</SelectItem>
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

             <Button variant="outline" onClick={() => {setSelectedSubject("all"); setSelectedDateRange({});}} className="w-full lg:w-auto">
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
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Subject Code</TableHead>
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
                    <TableCell>{record.subjectName}</TableCell>
                    <TableCell><Badge variant="secondary">{record.subjectCode}</Badge></TableCell>
                    <TableCell className="text-center">{record.totalStudents}</TableCell>
                    <TableCell className="text-center text-green-600 font-medium">{record.presentCount}</TableCell>
                    <TableCell className="text-center text-red-600 font-medium">{record.absentCount}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={record.attendanceRate > 75 ? "default" : record.attendanceRate > 50 ? "secondary" : "destructive"}
                               className={record.attendanceRate > 75 ? 'bg-green-500 hover:bg-green-600' : record.attendanceRate > 50 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'}
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

    