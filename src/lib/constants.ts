
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, UserCircle, BookOpen, Users, CalendarCheck, FileText, UploadCloud, Settings, LogOut, UserPlus, BookUser, CreditCard, School, NotebookPen, Calculator, FlaskConical, Landmark, Palette, Laptop, Briefcase, HeartPulse, BookOpenCheck, Puzzle, ClipboardList, Building, UserCheck, Presentation } from 'lucide-react';

export type UserRole = 'student' | 'staff' | 'admin';

export type SchoolLevel = 'Kindergarten' | 'Primary' | 'Secondary';

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
  displayLevel: 'Nursery' | 'Primary' | 'Junior Secondary' | 'Senior Secondary'; // For UI grouping
  studentCount: number;
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
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen, roles: ['student', 'staff', 'admin'] },
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

export const SCHOOL_LEVELS: SchoolLevel[] = ['Kindergarten', 'Primary', 'Secondary'];

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
  // Nursery Classes (mapped to Primary level for data, displayed as Nursery)
  { id: 'nur1', name: 'Nursery 1', level: 'Primary', displayLevel: 'Nursery', studentCount: 25, classMasterId: 'staff005' }, // Mrs. Daisy Fields
  { id: 'nur2', name: 'Nursery 2', level: 'Primary', displayLevel: 'Nursery', studentCount: 22, classMasterId: 'staff006' }, // Ms. Bola
  { id: 'nur3', name: 'Nursery 3', level: 'Primary', displayLevel: 'Nursery', studentCount: 20, classMasterId: 'staff006' }, // Ms. Bola

  // Primary Classes
  { id: 'pri1', name: 'Primary 1', level: 'Primary', displayLevel: 'Primary', studentCount: 30, classMasterId: 'staff007' }, // Mr. David
  { id: 'pri2', name: 'Primary 2', level: 'Primary', displayLevel: 'Primary', studentCount: 28, classMasterId: 'staff007' }, // Mr. David
  { id: 'pri3', name: 'Primary 3', level: 'Primary', displayLevel: 'Primary', studentCount: 32, classMasterId: 'staff008' }, // Mrs. Esther
  { id: 'pri4', name: 'Primary 4', level: 'Primary', displayLevel: 'Primary', studentCount: 27, classMasterId: 'staff008' }, // Mrs. Esther
  { id: 'pri5', name: 'Primary 5', level: 'Primary', displayLevel: 'Primary', studentCount: 30 }, // No class master assigned example
  { id: 'pri6', name: 'Primary 6', level: 'Primary', displayLevel: 'Primary', studentCount: 25, classMasterId: 'staff002' }, // Mr. Samuel Green (Admissions, but can be CM)

  // Junior Secondary Classes
  { id: 'jss1', name: 'JSS 1', level: 'Secondary', displayLevel: 'Junior Secondary', studentCount: 40, classMasterId: 'staff009' }, // Ms. Johnson
  { id: 'jss2', name: 'JSS 2', level: 'Secondary', displayLevel: 'Junior Secondary', studentCount: 38, classMasterId: 'staff010' }, // Mr. Adebayo
  { id: 'jss3', name: 'JSS 3', level: 'Secondary', displayLevel: 'Junior Secondary', studentCount: 35, classMasterId: 'staff003' }, // Ms. Olivia Chen

  // Senior Secondary Classes
  { id: 'sss1_sci', name: 'SSS 1 Science', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 25, classMasterId: 'staff004' }, // Prof. Robert Downy -> Mr. Robert Adewale
  { id: 'sss1_art', name: 'SSS 1 Arts', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 20, classMasterId: 'staff011' }, // Prof. Wole
  { id: 'sss1_com', name: 'SSS 1 Commercial', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 18, classMasterId: 'staff001' }, // Dr. Eleanor Vance
  { id: 'sss2_sci', name: 'SSS 2 Science', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 22, classMasterId: 'staff004' }, // Prof. Robert Downy -> Mr. Robert Adewale
  { id: 'sss2_art', name: 'SSS 2 Arts', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 23, classMasterId: 'staff011' }, // Prof. Wole
  { id: 'sss2_com', name: 'SSS 2 Commercial', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 15, classMasterId: 'staff001' }, // Dr. Eleanor Vance
  { id: 'sss3_sci', name: 'SSS 3 Science', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 20 },
  { id: 'sss3_art', name: 'SSS 3 Arts', level: 'Secondary', displayLevel: 'Senior Secondary', studentCount: 19 },
];

// Simplified staff list used in school-overview and my-classes for mapping classMasterId to name/avatar
// This should ideally be consistent with the main staff list or fetched from a central source
// For mock purposes, it's redefined here if those pages need it.
export const mockStaffListSimpleForClassMaster = [
  { id: "staff001", name: "Mrs. Eleanor Vance", avatarUrl: "https://placehold.co/40x40.png?text=EV" },
  { id: "staff002", name: "Mr. Samuel Green", avatarUrl: "https://placehold.co/40x40.png?text=SG" },
  { id: "staff003", name: "Ms. Olivia Chen", avatarUrl: "https://placehold.co/40x40.png?text=OC" },
  { id: "staff004", name: "Mr. Robert Adewale", avatarUrl: "https://placehold.co/40x40.png?text=RA" },
  { id: "staff005", name: "Mrs. Daisy Fields", avatarUrl: "https://placehold.co/40x40.png?text=DF" },
  { id: "staff006", name: "Ms. Bola Aderibigbe", avatarUrl: "https://placehold.co/40x40.png?text=BA"},
  { id: "staff007", name: "Mr. David Okon", avatarUrl: "https://placehold.co/40x40.png?text=DO"},
  { id: "staff008", name: "Mrs. Esther Musa", avatarUrl: "https://placehold.co/40x40.png?text=EM"},
  { id: "staff009", name: "Ms. Johnson Chioma", avatarUrl: "https://placehold.co/40x40.png?text=JC"},
  { id: "staff010", name: "Mr. Adebayo Bello", avatarUrl: "https://placehold.co/40x40.png?text=AB"},
  { id: "staff011", name: "Mr. Wole Soyinka", avatarUrl: "https://placehold.co/40x40.png?text=WS"},
  { id: "staff012", name: "Dr. Funmi Kuti", avatarUrl: "https://placehold.co/40x40.png?text=FK"},
];
