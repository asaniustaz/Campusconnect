
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Users, CalendarCheck, FileText, Bell, ShieldCheck, School, UserPlus, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserRole, SchoolSection } from "@/lib/constants";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type UserInfo = {
  name: string;
  role: UserRole;
  email: string;
  schoolSection?: SchoolSection; // Updated for students
  avatarUrl?: string;
}

const StatCard = ({ title, value, icon: Icon, description, link, linkText }: { title: string, value: string | number, icon: React.ElementType, description?: string, link?: string, linkText?: string }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
    {link && linkText && (
      <CardContent className="pt-0">
         <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={link}>{linkText}</Link>
        </Button>
      </CardContent>
    )}
  </Card>
);

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("userRole") as UserRole;
    const userId = localStorage.getItem("userId");
    
    if (name && role && userId) {
      let email = `${name.toLowerCase().replace(/[^a-z0-9.]/g, "").split(" ").join(".")}@campus.edu`;
      let schoolSection: SchoolSection | undefined = undefined;
      let avatarUrl = `https://placehold.co/100x100.png?text=${name[0]}`;

      if (typeof window !== 'undefined') {
        const storedUsersString = localStorage.getItem('managedUsers');
        if (storedUsersString) {
            try {
                const allManagedUsers: Array<UserInfo & {id: string, avatarUrl?: string}> = JSON.parse(storedUsersString);
                const foundUser = allManagedUsers.find(u => u.id === userId);
                if (foundUser) {
                    email = foundUser.email; // Use stored email
                    if (foundUser.avatarUrl) {
                        avatarUrl = foundUser.avatarUrl; // Use stored avatar
                    }
                     if (role === 'student') {
                        schoolSection = foundUser.schoolSection;
                    }
                }
            } catch (e) {
                console.error("Failed to parse user details from localStorage for dashboard", e);
            }
        }
      }
      
      // Fallback schoolSection for student if not found in managedUsers
      if (role === 'student' && !schoolSection) { 
        if (name.toLowerCase().includes("college")) schoolSection = "College";
        else if (name.toLowerCase().includes("islamiyya")) schoolSection = "Islamiyya";
        else schoolSection = "Tahfeez";
      }
      
      setUserInfo({ name, role, email, schoolSection, avatarUrl });
    }
  }, []);

  if (!userInfo) {
    return <div className="text-center p-10">Loading user information...</div>;
  }
  
  const userInitials = userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase() || userInfo.email[0].toUpperCase();

  const commonStatsBase = [
    { title: "My Subjects", value: userInfo.role === 'student' ? 4 : (userInfo.role === 'staff' ? 2 : 5), icon: BookOpen, description: userInfo.role === 'student' ? "Currently enrolled" : (userInfo.role === 'staff' ? "Subjects Taught" : "Total Subjects"), link: "/dashboard/courses", linkText: "View Subjects"},
    { title: "Notifications", value: userInfo.role === 'admin' ? 5 : 3, icon: Bell, description: "Unread messages" },
  ];

  let stats = [];
  if (userInfo.role === 'student') {
    stats = [
      ...commonStatsBase,
      { title: "My Grades", value: "B+", icon: FileText, description: "Latest assessment", link: "/dashboard/results", linkText: "View Results" },
      { title: "Payment History", value: "NGN 55k", icon: CreditCard, description: "Total Paid", link: "/dashboard/payments", linkText: "View Payments"},
    ];
  } else if (userInfo.role === 'staff') {
    stats = [
      ...commonStatsBase,
      { title: "Students Taught", value: 45, icon: Users, description: "Across all courses" }, // This description might need update if "courses" is removed globally
      { title: "Mark Attendance", value: "Today", icon: CalendarCheck, description: "For CS101", link: "/dashboard/attendance", linkText: "Mark Now" },
    ];
  } else { // admin
    stats = [
      ...commonStatsBase,
      { title: "Total Users", value: 150, icon: Users, description: "Students & Staff" },
      { title: "System Status", value: "Operational", icon: ShieldCheck, description: "All systems nominal" },
      { title: "Add New User", value: "Student/Staff", icon: UserPlus, description: "Register new members", link: "/dashboard/admin/manage-users", linkText: "Add User"},
    ];
  }


  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row items-center gap-4 p-6">
            <Avatar className="w-20 h-20 border-2 border-primary">
              <AvatarImage src={userInfo.avatarUrl} alt={userInfo.name} data-ai-hint="user avatar passport" />
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold font-headline text-foreground">Welcome, {userInfo.name}!</h1>
                <p className="text-muted-foreground">
                {userInfo.role === 'admin' 
                    ? "Admin Dashboard for ANNAJIHUN ACADEMY ZARIA."
                    : `Your ${userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)} portal.`
                }
                </p>
                {userInfo.schoolSection && <p className="text-sm text-primary flex items-center justify-center sm:justify-start mt-1"><School className="h-4 w-4 mr-1"/> {userInfo.schoolSection} Section</p>}
            </div>
        </CardHeader>
      </Card>
      

      <section>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} description={stat.description} link={stat.link} linkText={stat.linkText} />
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
              { title: "Mid-term Exams Schedule (All Levels)", date: "Oct 15, 2023", content: "The schedule for mid-term exams has been published. Please check the notice board.", forRoles: ['student', 'staff', 'admin'] },
              { title: "School Reopens (Primary & Secondary)", date: "Oct 10, 2023", content: "Primary and Secondary sections will reopen on Jan 8th. Kindergarten resumes Jan 15th.", forRoles: ['student', 'staff', 'admin'] },
              { title: "Science Fair Submissions", date: "Oct 01, 2023", content: "Secondary school students: Science fair project submissions are due Nov 1st.", forRoles: ['student', 'staff'] },
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

    