
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, UserCircle, BookOpen, Users, CalendarCheck, FileText, UploadCloud, Settings, LogOut, UserPlus, BookUser, CreditCard, School, NotebookPen, Calculator, FlaskConical, Landmark, Palette, Laptop, Briefcase, HeartPulse, BookOpenCheck, Puzzle, ClipboardList, Building, UserCheck, Presentation } from 'lucide-react';

export type UserRole = 'student' | 'staff' | 'admin';

export type SchoolLevel = 'Kindergarten' | 'Nursery' | 'Primary' | 'Secondary';

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
  level: SchoolLevel; // This will be 'Primary' for Nursery, and 'Secondary' for JSS/SSS
  displayLevel: 'Kindergarten' | 'Nursery' | 'Primary' | 'Junior Secondary' | 'Senior Secondary'; // For UI grouping
  studentCount: number; // Target student count
  classMasterId?: string; // ID of a staff member
}

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
  { href: '/dashboard/school-overview', label: 'School Overview', icon: Building, roles: ['admin', 'staff'] },
  { href: '/dashboard/my-classes', label: 'My Classes', icon: Presentation, roles: ['staff', 'admin'] },
  { href: '/dashboard/courses', label: 'Subjects', icon: BookOpen, roles: ['student', 'staff', 'admin'] },
  { href: '/dashboard/staff', label: 'Staff Directory', icon: Users, roles: ['student', 'staff', 'admin'] },
  { href: '/dashboard/payments', label: 'Payment History', icon: CreditCard, roles: ['student'] },
  { href: '/dashboard/attendance', label: 'Mark Attendance', icon: CalendarCheck, roles: ['staff', 'admin'] },
  { href: '/dashboard/results', label: 'Results', icon: FileText, roles: ['student', 'staff', 'admin'] },
  { href: '/dashboard/results/upload', label: 'Upload Results', icon: UploadCloud, roles: ['staff', 'admin'] },
  // Admin specific routes
  { href: '/dashboard/admin/manage-users', label: 'Manage Users', icon: UserPlus, roles: ['admin'] },
  { href: '/dashboard/admin/manage-staff-allocations', label: 'Staff Allocations', icon: BookUser, roles: ['admin'] },
  { href: '/dashboard/admin/attendance-report', label: 'Attendance Report', icon: ClipboardList, roles: ['admin'] },
  // { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['student', 'staff', 'admin'] },
];

export const APP_NAME = "ANNAJIHUN ACADEMY ZARIA";

export const SCHOOL_LEVELS: SchoolLevel[] = ['Kindergarten', 'Nursery', 'Primary', 'Secondary'];

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
  // Kindergarten
  { id: 'kg1', name: 'Kindergarten 1', level: 'Kindergarten', displayLevel: 'Kindergarten', studentCount: 0 },
  { id: 'kg2', name: 'Kindergarten 2', level: 'Kindergarten', displayLevel: 'Kindergarten', studentCount: 0 },

  // Nursery Classes
  { id: 'nur1', name: 'Nursery 1', level: 'Nursery', displayLevel: 'Nursery', studentCount: 0 },
  { id: 'nur2', name: 'Nursery 2', level: 'Nursery', displayLevel: 'Nursery', studentCount: 0 },
  { id: 'nur3', name: 'Nursery 3', level: 'Nursery', displayLevel: 'Nursery', studentCount: 0 },

  // Primary Classes
  { id: 'pri1', name: 'Primary 1', level: 'Primary', displayLevel: 'Primary', studentCount: 0 },
  { id: 'pri2', name: 'Primary 2', level: 'Primary', displayLevel: 'Primary', studentCount: 0 },
  { id: 'pri3', name: 'Primary 3', level: 'Primary', displayLevel: 'Primary', studentCount: 0 },
  { id: 'pri4', name: 'Primary 4', level: 'Primary', displayLevel: 'Primary', studentCount: 0 },
  { id: 'pri5', name: 'Primary 5', level: 'Primary', displayLevel: 'Primary', studentCount: 0 },
  { id: 'pri6', name: 'Primary 6', level: 'Primary', displayLevel: 'Primary', studentCount: 0 },

  // Junior Secondary Classes
  { id: 'jss1', name: 'JSS 1', level: 'Secondary', displayLevel: 'Junior Secondary', studentCount: 0 },
  { id: 'jss2', name: 'JSS 2', level: 'Secondary', displayLevel: 'Junior Secondary', studentCount: 0 },
  { id: 'jss3', name: 'JSS 3', level: 'Secondary', displayLevel: 'Junior Secondary', studentCount: 0 },

  // Senior Secondary Classes
  { id: 'sss1_sci', name: 'SSS 1 Science', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 0 },
  { id: 'sss1_art', name: 'SSS 1 Arts', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 0 },
  { id: 'sss1_com', name: 'SSS 1 Commercial', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 0 },
  { id: 'sss2_sci', name: 'SSS 2 Science', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 0 },
  { id: 'sss2_art', name: 'SSS 2 Arts', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 0 },
  { id: 'sss2_com', name: 'SSS 2 Commercial', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 0 },
  { id: 'sss3_sci', name: 'SSS 3 Science', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 0 },
  { id: 'sss3_art', name: 'SSS 3 Arts', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 0 },
];


// Define Student interface here to be used across relevant files
export interface Student {
  id: string;
  name: string;
  email: string;
  schoolLevel: SchoolLevel; // Overall school level
  classId?: string; // Specific class assigned
  passwordHash?: string; // For prototype, this might store the actual password for login. NOT FOR PRODUCTION.
  rollNumber?: string; // For attendance page if needed
  // Added for localStorage user management
  role?: UserRole; 
  password?: string; // Storing password directly for prototype login - NOT SECURE
}

// Global mock student list, can be imported by pages that need it.
export let globalMockStudents: Student[] = []; // Emptied for real user management

// Function to update globalMockStudents (e.g., when admin adds/edits)
export const updateGlobalMockStudents = (newStudents: Student[]) => {
  globalMockStudents = newStudents;
};
export const addStudentToGlobalList = (newStudent: Student) => {
  let students = [];
  if (typeof window !== 'undefined') {
    const storedUsersString = localStorage.getItem('managedUsers');
    const allStoredUsers: (Student)[] = storedUsersString ? JSON.parse(storedUsersString) : [];
    students = allStoredUsers.filter((u: any) => u.role === 'student');
  }
  students.push(newStudent);
  if (typeof window !== 'undefined') {
    const allUsersString = localStorage.getItem('managedUsers');
    const allUsers: (Student)[] = allUsersString ? JSON.parse(allUsersString) : [];
    const otherUsers = allUsers.filter((u: any) => u.role !== 'student');
    localStorage.setItem('managedUsers', JSON.stringify([...otherUsers, ...students]));
  }
  globalMockStudents = students; // Update in-memory list if needed by other components immediately
};

export const updateStudentInGlobalList = (updatedStudent: Student) => {
  let students = [];
   if (typeof window !== 'undefined') {
    const storedUsersString = localStorage.getItem('managedUsers');
    const allStoredUsers: (Student)[] = storedUsersString ? JSON.parse(storedUsersString) : [];
    students = allStoredUsers.filter((u: any) => u.role === 'student');
  }
  const index = students.findIndex(s => s.id === updatedStudent.id);
  if (index !== -1) {
    students[index] = updatedStudent;
  }
  if (typeof window !== 'undefined') {
     const allUsersString = localStorage.getItem('managedUsers');
     const allUsers: (Student)[] = allUsersString ? JSON.parse(allUsersString) : [];
    const otherUsers = allUsers.filter((u: any) => u.role !== 'student');
    localStorage.setItem('managedUsers', JSON.stringify([...otherUsers, ...students]));
  }
  globalMockStudents = students;
};

export const deleteStudentFromGlobalList = (studentId: string) => {
  let students = [];
  if (typeof window !== 'undefined') {
    const storedUsersString = localStorage.getItem('managedUsers');
    const allStoredUsers: (Student)[] = storedUsersString ? JSON.parse(storedUsersString) : [];
    students = allStoredUsers.filter((u: any) => u.role === 'student');
  }
  students = students.filter(s => s.id !== studentId);
  if (typeof window !== 'undefined') {
    const allUsersString = localStorage.getItem('managedUsers');
    const allUsers: (Student)[] = allUsersString ? JSON.parse(allUsersString) : [];
    const otherUsers = allUsers.filter((u: any) => u.role !== 'student');
    localStorage.setItem('managedUsers', JSON.stringify([...otherUsers, ...students]));
  }
  globalMockStudents = students;
};

    