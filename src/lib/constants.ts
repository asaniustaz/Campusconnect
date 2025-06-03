
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, UserCircle, BookOpen, Users, CalendarCheck, FileText, UploadCloud, Settings, LogOut, UserPlus, BookUser, CreditCard, School } from 'lucide-react';

export type UserRole = 'student' | 'staff' | 'admin';

export type SchoolLevel = 'Kindergarten' | 'Primary' | 'Secondary';
export type SubjectCategory = 'Science' | 'Art' | 'General';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavItem[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'staff', 'admin'] },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle, roles: ['student', 'staff', 'admin'] },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen, roles: ['student', 'staff', 'admin'] },
  { href: '/dashboard/staff', label: 'Staff Directory', icon: Users, roles: ['student', 'staff', 'admin'] },
  { href: '/dashboard/payments', label: 'Payment History', icon: CreditCard, roles: ['student'] },
  { href: '/dashboard/attendance', label: 'Mark Attendance', icon: CalendarCheck, roles: ['staff', 'admin'] },
  { href: '/dashboard/results', label: 'Results', icon: FileText, roles: ['student', 'staff', 'admin'] },
  { href: '/dashboard/results/upload', label: 'Upload Results', icon: UploadCloud, roles: ['staff', 'admin'] },
  // Admin specific routes
  { href: '/dashboard/admin/manage-users', label: 'Manage Users', icon: UserPlus, roles: ['admin'] },
  { href: '/dashboard/admin/manage-staff-allocations', label: 'Staff Allocations', icon: BookUser, roles: ['admin'] },
  // { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['student', 'staff', 'admin'] },
];

export const APP_NAME = "ANNAJIHUN ACADEMY ZARIA";

export const SCHOOL_LEVELS: SchoolLevel[] = ['Kindergarten', 'Primary', 'Secondary'];
export const SUBJECT_CATEGORIES: SubjectCategory[] = ['Science', 'Art', 'General'];
export const TERMS: string[] = ["First Term", "Second Term", "Third Term"];

