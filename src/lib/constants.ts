import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, UserCircle, BookOpen, Users, CalendarCheck, FileText, UploadCloud, Settings, LogOut } from 'lucide-react';

export type UserRole = 'student' | 'staff';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavItem[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'staff'] },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle, roles: ['student', 'staff'] },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen, roles: ['student', 'staff'] },
  { href: '/dashboard/staff', label: 'Staff Directory', icon: Users, roles: ['student', 'staff'] },
  { href: '/dashboard/attendance', label: 'Mark Attendance', icon: CalendarCheck, roles: ['staff'] },
  { href: '/dashboard/results', label: 'Results', icon: FileText, roles: ['student', 'staff'] },
  { href: '/dashboard/results/upload', label: 'Upload Results', icon: UploadCloud, roles: ['staff'] },
  // { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['student', 'staff'] },
];

export const APP_NAME = "CampusConnect";
