
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Users, CalendarCheck, FileText, Bell, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserRole } from "@/lib/constants";

type UserInfo = {
  name: string;
  role: UserRole;
}

const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description?: string }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("userRole") as UserRole;
    if (name && role) {
      setUserInfo({ name, role });
    }
  }, []);

  if (!userInfo) {
    return <div className="text-center p-10">Loading user information...</div>;
  }
  
  const commonStats = [
    { title: "My Courses", value: userInfo.role === 'student' ? 4 : (userInfo.role === 'staff' ? 2 : 0), icon: BookOpen, description: userInfo.role === 'student' ? "Currently enrolled" : (userInfo.role === 'staff' ? "Courses Taught" : "Platform Overview") },
    { title: "Notifications", value: userInfo.role === 'admin' ? 5 : 3, icon: Bell, description: "Unread messages" },
  ];

  const studentStats = [
    ...commonStats,
    { title: "Recent Grades", value: "B+", icon: FileText, description: "Latest assessment" },
    { title: "Attendance", value: "92%", icon: CalendarCheck, description: "Overall presence" },
  ];

  const staffStats = [
    ...commonStats,
    { title: "Students Taught", value: 45, icon: Users, description: "Across all courses" },
    { title: "Pending Actions", value: 2, icon: CalendarCheck, description: "Attendance/Results" },
  ];
  
  const adminStats = [
    ...commonStats,
    { title: "Total Users", value: 150, icon: Users, description: "Students & Staff" },
    { title: "System Status", value: "Operational", icon: ShieldCheck, description: "All systems nominal" },
  ];

  let stats;
  if (userInfo.role === 'student') {
    stats = studentStats;
  } else if (userInfo.role === 'staff') {
    stats = staffStats;
  } else { // admin
    stats = adminStats;
  }


  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Welcome, {userInfo.name}!</h1>
        <p className="text-muted-foreground">
          {userInfo.role === 'admin' 
            ? "Welcome to the Admin Dashboard of ANNAJIHUN ACADEMY ZARIA."
            : "Here's an overview of your CampusConnect portal."
          }
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Stats</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} description={stat.description} />
          ))}
        </div>
      </section>

      <section>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Announcements</CardTitle>
            <CardDescription>Latest updates and news from the institution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "System Maintenance Alert", date: "Nov 05, 2023", content: "Scheduled system maintenance on Nov 10th, 2 AM - 4 AM. Expect brief downtime.", forRoles: ['admin'] },
              { title: "Mid-term Exams Schedule", date: "Oct 15, 2023", content: "The schedule for mid-term exams has been published. Please check the notice board.", forRoles: ['student', 'staff'] },
              { title: "Holiday Notification", date: "Oct 10, 2023", content: "The institution will be closed on October 20th for a public holiday.", forRoles: ['student', 'staff', 'admin'] },
            ].filter(ann => ann.forRoles.includes(userInfo.role)).map((announcement, index) => (
              <div key={index} className="p-3 border rounded-md bg-secondary/30">
                <h3 className="font-semibold text-secondary-foreground">{announcement.title}</h3>
                <p className="text-xs text-muted-foreground">{announcement.date}</p>
                <p className="text-sm mt-1">{announcement.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
