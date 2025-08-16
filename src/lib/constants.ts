
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, UserCircle, BookOpen, Users, CalendarCheck, FileText, UploadCloud, Settings, LogOut, UserPlus, BookUser, CreditCard, School, NotebookPen, Calculator, FlaskConical, Landmark, Palette, Laptop, Briefcase, HeartPulse, BookOpenCheck, Puzzle, ClipboardList, Building, UserCheck, Presentation, DollarSign } from 'lucide-react';

export type UserRole = 'student' | 'staff' | 'admin' | 'head_of_section';

export type SchoolSection = 'College' | 'Islamiyya' | 'Tahfeez';

// Updated Subject Categories
export type SubjectCategory =
  'Languages' |
  'Mathematics' |
  'Sciences' |
  'Social & Humanities' |
  'Creative Arts' |
  'Technology' |
  'Business & Vocational' |
  'Health & PE' |
  'Religious Studies' |
  'General Studies';

export interface SchoolClass {
  id: string;
  name: string; // e.g., "Nursery 1A", "Primary 5B", "JSS 2"
  section: SchoolSection;
  displayLevel: string;
}

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavItem[];
};

export interface Subject {
  id: string;
  title: string;
  code: string; // e.g., ENG101, JSS_MTH
  description: string;
  instructor: string; // Default/Coordinating Instructor
  schedule: string; // e.g., "Mon 9-11 AM, Wed 1-3 PM"
  schoolSection: SchoolSection;
  subjectCategory: SubjectCategory;
  sssStream?: 'Core' | 'Science' | 'Art' | 'Commercial' | 'Trade'; // For SSS subjects
}

export const defaultNigerianCurriculumSubjects: Subject[] = [
  // College Subjects
  { id: "JSS_ENG", title: "English Studies (JSS)", code: "JSS_ENG", description: "Advanced English language and literature for JSS.", instructor: "To be assigned", schedule: "Daily 8 AM", schoolSection: "College", subjectCategory: "Languages", sssStream: "Core" },
  { id: "JSS_MTH", title: "Mathematics (JSS)", code: "JSS_MTH", description: "Junior secondary mathematics curriculum.", instructor: "To be assigned", schedule: "Daily 9 AM", schoolSection: "College", subjectCategory: "Mathematics", sssStream: "Core" },
  { id: "SSS_BIO_S", title: "Biology (SSS Science)", code: "SSS_BIO_S", description: "Senior secondary biology for science stream.", instructor: "To be assigned", schedule: "MWF 1 PM", schoolSection: "College", subjectCategory: "Sciences", sssStream: "Science" },

  // Islamiyya Subjects
  { id: "ISL_QUR", title: "Quranic Studies", code: "ISL_QUR", description: "Study of the Holy Quran.", instructor: "To be assigned", schedule: "Daily 9-10 AM", schoolSection: "Islamiyya", subjectCategory: "Religious Studies" },
  { id: "ISL_ARB", title: "Arabic Language", code: "ISL_ARB", description: "Learning the Arabic language.", instructor: "To be assigned", schedule: "Daily 10-11 AM", schoolSection: "Islamiyya", subjectCategory: "Languages" },

  // Tahfeez Subjects
  { id: "TAH_MEM", title: "Quran Memorization", code: "TAH_MEM", description: "Intensive Quran memorization sessions.", instructor: "To be assigned", schedule: "Daily 8-11 AM", schoolSection: "Tahfeez", subjectCategory: "Religious Studies" },
  { id: "TAH_TAJ", title: "Tajweed", code: "TAH_TAJ", description: "Perfecting the recitation of the Quran.", instructor: "To be assigned", schedule: "T/Th 11 AM", schoolSection: "Tahfeez", subjectCategory: "Religious Studies" },
];


export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'staff', 'admin', 'head_of_section'] },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle, roles: ['student', 'staff', 'admin', 'head_of_section'] },
  { href: '/dashboard/school-overview', label: 'School Overview', icon: Building, roles: ['admin', 'staff', 'head_of_section'] },
  { href: '/dashboard/my-classes', label: 'My Classes', icon: Presentation, roles: ['staff', 'admin', 'head_of_section'] },
  { href: '/dashboard/courses', label: 'Subjects', icon: BookOpen, roles: ['student', 'staff', 'admin', 'head_of_section'] },
  { href: '/dashboard/staff', label: 'Staff Directory', icon: Users, roles: ['student', 'staff', 'admin', 'head_of_section'] },
  { href: '/dashboard/payments', label: 'Payment History', icon: CreditCard, roles: ['student'] },
  { href: '/dashboard/attendance', label: 'Mark Attendance', icon: CalendarCheck, roles: ['staff', 'admin', 'head_of_section'] },
  { href: '/dashboard/results', label: 'Results', icon: FileText, roles: ['student', 'staff', 'admin', 'head_of_section'] },
  { href: '/dashboard/results/upload', label: 'Upload Results', icon: UploadCloud, roles: ['admin'] },
  // Admin specific routes
  { href: '/dashboard/admin/manage-users', label: 'Manage Users', icon: UserPlus, roles: ['admin'] },
  { href: '/dashboard/admin/manage-classes', label: 'Manage Classes', icon: School, roles: ['admin'] },
  { href: '/dashboard/admin/manage-staff-allocations', label: 'Staff Allocations', icon: BookUser, roles: ['admin'] },
  { href: '/dashboard/admin/attendance-report', label: 'Attendance Report', icon: ClipboardList, roles: ['admin'] },
  { href: '/dashboard/admin/manage-payments', label: 'Manage Payments', icon: DollarSign, roles: ['admin'] },
];

export const APP_NAME = "BAMCHISE";

export const SCHOOL_SECTIONS: SchoolSection[] = ['College', 'Islamiyya', 'Tahfeez'];

// Updated list of subject categories
export const SUBJECT_CATEGORIES: SubjectCategory[] = [
  'Languages',
  'Mathematics',
  'Sciences',
  'Social & Humanities',
  'Creative Arts',
  'Technology',
  'Business & Vocational',
  'Health & PE',
  'Religious Studies',
  'General Studies'
];

export const SESSIONS: string[] = ["2023/2024", "2024/2025", "2025/2026"];
export const TERMS: string[] = ["First Term", "Second Term", "Third Term"];

export const subjectCategoryIcons: Record<SubjectCategory, LucideIcon> = {
  'Languages': NotebookPen,
  'Mathematics': Calculator,
  'Sciences': FlaskConical,
  'Social & Humanities': Landmark,
  'Creative Arts': Palette,
  'Technology': Laptop,
  'Business & Vocational': Briefcase,
  'Health & PE': HeartPulse,
  'Religious Studies': BookOpenCheck,
  'General Studies': Puzzle
};

export const mockSchoolClasses: SchoolClass[] = [
  // College Classes
  { id: 'jss1', name: 'JSS 1', section: 'College', displayLevel: 'Junior Secondary 1' },
  { id: 'jss2', name: 'JSS 2', section: 'College', displayLevel: 'Junior Secondary 2' },
  { id: 'jss3', name: 'JSS 3', section: 'College', displayLevel: 'Junior Secondary 3' },
  { id: 'sss1', name: 'SSS 1', section: 'College', displayLevel: 'Senior Secondary 1' },
  { id: 'sss2', name: 'SSS 2', section: 'College', displayLevel: 'Senior Secondary 2' },
  { id: 'sss3', name: 'SSS 3', section: 'College', displayLevel: 'Senior Secondary 3' },

  // Islamiyya Classes
  { id: 'islamiyya1', name: 'Islamiyya 1', section: 'Islamiyya', displayLevel: 'Level 1' },
  { id: 'islamiyya2', name: 'Islamiyya 2', section: 'Islamiyya', displayLevel: 'Level 2' },
  { id: 'islamiyya3', name: 'Islamiyya 3', section: 'Islamiyya', displayLevel: 'Level 3' },
  
  // Tahfeez Classes
  { id: 'tahfeez1', name: 'Tahfeez 1', section: 'Tahfeez', displayLevel: 'Level 1' },
  { id: 'tahfeez2', name: 'Tahfeez 2', section: 'Tahfeez', displayLevel: 'Level 2' },
];


export type PaymentStatus = "Paid" | "Pending" | "Failed";

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  description: string;
  amount: number;
  status: PaymentStatus;
  term: string;
}

export interface User {
    id: string;
    firstName: string;
    surname: string;
    middleName?: string;
    email: string;
    role: UserRole;
    password?: string;
    avatarUrl?: string;
}

// Define Student interface here to be used across relevant files
export interface Student extends User {
  schoolSection: SchoolSection; // Overall school section
  classId?: string; // Specific class assigned
  rollNumber?: string; // For attendance page if needed
}

export interface StaffMember extends User {
    department: string;
    title: string;
    assignedClasses?: string[];
    section?: SchoolSection;
}

export const combineName = (user: { firstName?: string, surname?: string, middleName?: string, name?: string }): string => {
    if (user.firstName && user.surname) {
        return `${user.firstName} ${user.middleName || ''} ${user.surname}`.replace(/\s+/g, ' ').trim();
    }
    // Fallback for old data structure
    if (user.name) return user.name;
    return 'Unknown User';
};

// Global mock student list, can be imported by pages that need it.
export let globalMockStudents: Student[] = []; // Emptied for real user management


// Mock data for initial payments (can be removed if using a real backend)
export const mockSchoolPayments: PaymentRecord[] = [];

// Mock user data for initial load
export const mockManagedUsers: (Student | StaffMember)[] = [];
