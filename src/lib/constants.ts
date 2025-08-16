
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, UserCircle, BookOpen, Users, CalendarCheck, FileText, UploadCloud, Settings, LogOut, UserPlus, BookUser, CreditCard, School, NotebookPen, Calculator, FlaskConical, Landmark, Palette, Laptop, Briefcase, HeartPulse, BookOpenCheck, Puzzle, ClipboardList, Building, UserCheck, Presentation, DollarSign } from 'lucide-react';

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
  level: SchoolLevel;
  displayLevel: 'Kindergarten' | 'Nursery' | 'Primary' | 'Junior Secondary' | 'Senior Secondary'; // For UI grouping
  studentCount: number; // Target student count
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
  schoolLevel: SchoolLevel;
  subjectCategory: SubjectCategory;
  sssStream?: 'Core' | 'Science' | 'Art' | 'Commercial' | 'Trade'; // For SSS subjects
}

export const defaultNigerianCurriculumSubjects: Subject[] = [
  // Kindergarten
  { id: "KG_LIT", title: "Literacy (KG)", code: "KG_LIT", description: "Basic literacy skills for kindergarteners.", instructor: "To be assigned", schedule: "Daily 9-10 AM", schoolLevel: "Kindergarten", subjectCategory: "Languages" },
  { id: "KG_NUM", title: "Numeracy (KG)", code: "KG_NUM", description: "Introduction to numbers and basic math concepts for kindergarten.", instructor: "To be assigned", schedule: "Daily 10-11 AM", schoolLevel: "Kindergarten", subjectCategory: "Mathematics" },
  { id: "KG_ART", title: "Creative Play (KG)", code: "KG_ART", description: "Art, craft, and play-based learning.", instructor: "To be assigned", schedule: "T/Th 11 AM", schoolLevel: "Kindergarten", subjectCategory: "Creative Arts" },

  // Nursery
  { id: "NUR_ENG", title: "Early English (Nursery)", code: "NUR_ENG", description: "Foundational English skills for nursery children.", instructor: "To be assigned", schedule: "Mon, Wed 10 AM", schoolLevel: "Nursery", subjectCategory: "Languages" },
  { id: "NUR_MTH", title: "Early Maths (Nursery)", code: "NUR_MTH", description: "Playful introduction to mathematics for nursery.", instructor: "To be assigned", schedule: "Tue, Thu 10 AM", schoolLevel: "Nursery", subjectCategory: "Mathematics" },
  { id: "NUR_SCI", title: "Our World (Nursery)", code: "NUR_SCI", description: "Exploring the environment and basic science for nursery.", instructor: "To be assigned", schedule: "Fri 10 AM", schoolLevel: "Nursery", subjectCategory: "General Studies" },

  // Primary
  { id: "PRI_ENG", title: "English Language (Primary)", code: "PRI_ENG", description: "Comprehensive English studies for primary students.", instructor: "To be assigned", schedule: "Daily 9 AM", schoolLevel: "Primary", subjectCategory: "Languages" },
  { id: "PRI_MTH", title: "Mathematics (Primary)", code: "PRI_MTH", description: "Core mathematical principles for primary education.", instructor: "To be assigned", schedule: "Daily 10 AM", schoolLevel: "Primary", subjectCategory: "Mathematics" },
  { id: "PRI_BST", title: "Basic Science & Tech (Primary)", code: "PRI_BST", description: "Introduction to science and technology for primary.", instructor: "To be assigned", schedule: "MWF 11 AM", schoolLevel: "Primary", subjectCategory: "Sciences" },
  { id: "PRI_SOS", title: "Social Studies (Primary)", code: "PRI_SOS", description: "Understanding society, history, and geography for primary.", instructor: "To be assigned", schedule: "T/Th 11 AM", schoolLevel: "Primary", subjectCategory: "Social & Humanities" },

  // JSS (Secondary - Junior)
  { id: "JSS_ENG", title: "English Studies (JSS)", code: "JSS_ENG", description: "Advanced English language and literature for JSS.", instructor: "To be assigned", schedule: "Daily 8 AM", schoolLevel: "Secondary", subjectCategory: "Languages", sssStream: "Core" },
  { id: "JSS_MTH", title: "Mathematics (JSS)", code: "JSS_MTH", description: "Junior secondary mathematics curriculum.", instructor: "To be assigned", schedule: "Daily 9 AM", schoolLevel: "Secondary", subjectCategory: "Mathematics", sssStream: "Core" },
  { id: "JSS_BSC", title: "Basic Science (JSS)", code: "JSS_BSC", description: "Integrated basic science concepts for JSS.", instructor: "To be assigned", schedule: "T/Th 10 AM", schoolLevel: "Secondary", subjectCategory: "Sciences", sssStream: "Core" },
  { id: "JSS_BST", title: "Basic Technology (JSS)", code: "JSS_BST", description: "Introduction to technological concepts and skills for JSS.", instructor: "To be assigned", schedule: "MWF 10 AM", schoolLevel: "Secondary", subjectCategory: "Technology", sssStream: "Core" },

  // SSS (Secondary - Senior) - Core examples
  { id: "SSS_ENG_C", title: "English Language (SSS Core)", code: "SSS_ENG_C", description: "Senior secondary English language for all streams.", instructor: "To be assigned", schedule: "Daily 11 AM", schoolLevel: "Secondary", subjectCategory: "Languages", sssStream: "Core" },
  { id: "SSS_MTH_C", title: "Mathematics (SSS Core)", code: "SSS_MTH_C", description: "Senior secondary general mathematics for all streams.", instructor: "To be assigned", schedule: "Daily 12 PM", schoolLevel: "Secondary", subjectCategory: "Mathematics", sssStream: "Core" },

  // SSS - Science examples
  { id: "SSS_BIO_S", title: "Biology (SSS Science)", code: "SSS_BIO_S", description: "Senior secondary biology for science stream.", instructor: "To be assigned", schedule: "MWF 1 PM", schoolLevel: "Secondary", subjectCategory: "Sciences", sssStream: "Science" },
  { id: "SSS_CHM_S", title: "Chemistry (SSS Science)", code: "SSS_CHM_S", description: "Senior secondary chemistry for science stream.", instructor: "To be assigned", schedule: "T/Th 1 PM", schoolLevel: "Secondary", subjectCategory: "Sciences", sssStream: "Science" },
  { id: "SSS_PHY_S", title: "Physics (SSS Science)", code: "SSS_PHY_S", description: "Senior secondary physics for science stream.", instructor: "To be assigned", schedule: "MWF 2 PM", schoolLevel: "Secondary", subjectCategory: "Sciences", sssStream: "Science" },

  // SSS - Arts examples
  { id: "SSS_LIT_A", title: "Literature in English (SSS Arts)", code: "SSS_LIT_A", description: "Senior secondary literature for arts stream.", instructor: "To be assigned", schedule: "MWF 1 PM", schoolLevel: "Secondary", subjectCategory: "Languages", sssStream: "Art" },
  { id: "SSS_GOV_A", title: "Government (SSS Arts)", code: "SSS_GOV_A", description: "Senior secondary government for arts stream.", instructor: "To be assigned", schedule: "T/Th 1 PM", schoolLevel: "Secondary", subjectCategory: "Social & Humanities", sssStream: "Art" },
  
  // SSS - Commercial examples
  { id: "SSS_ACC_B", title: "Accounting (SSS Commercial)", code: "SSS_ACC_B", description: "Senior secondary accounting for commercial stream.", instructor: "To be assigned", schedule: "MWF 1 PM", schoolLevel: "Secondary", subjectCategory: "Business & Vocational", sssStream: "Commercial" },
  { id: "SSS_ECO_B", title: "Economics (SSS Commercial)", code: "SSS_ECO_B", description: "Senior secondary economics for commercial stream.", instructor: "To be assigned", schedule: "T/Th 1 PM", schoolLevel: "Secondary", subjectCategory: "Business & Vocational", sssStream: "Commercial" },
];


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
  { href: '/dashboard/admin/manage-payments', label: 'Manage Payments', icon: DollarSign, roles: ['admin'] },
];

export const APP_NAME = "BAMCHISE";

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
  avatarUrl?: string; // Added for student avatar
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
