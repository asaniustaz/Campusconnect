
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { BookText, Layers, Users, CalendarDays } from "lucide-react";
import type { UserRole, SchoolLevel, SubjectCategory } from "@/lib/constants";
import { SCHOOL_LEVELS, SUBJECT_CATEGORIES, subjectCategoryIcons } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  instructor: string;
  credits: number;
  schedule: string;
  imageUrl: string;
  aiHint: string;
  schoolLevel: SchoolLevel;
  subjectCategory: SubjectCategory;
  sssStream?: 'Core' | 'Science' | 'Art' | 'Commercial' | 'Trade'; // For SSS subject differentiation
}

// Helper function to generate course codes
let courseCounter = 0;
const generateCourseCode = (level: SchoolLevel, category: SubjectCategory, title: string) => {
  courseCounter++;
  const levelPrefix = level.substring(0, 1);
  const catPrefix = category.substring(0, 3).toUpperCase();
  return `${levelPrefix}${catPrefix}${String(courseCounter).padStart(3, '0')}`;
};

const nigerianCurriculumCourses: Course[] = [
  // Kindergarten (KG)
  {
    id: "KG_LIT", title: "Literacy (Pre-Reading & Pre-Writing)", schoolLevel: "Kindergarten", subjectCategory: "Languages",
    code: generateCourseCode("Kindergarten", "Languages", "Literacy"), description: "Developing pre-reading and pre-writing skills.", instructor: "Mrs. Adaobi", credits: 1, schedule: "Daily 9:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "alphabet blocks"
  },
  {
    id: "KG_NUM", title: "Numeracy (Basic Numbers & Counting)", schoolLevel: "Kindergarten", subjectCategory: "Mathematics",
    code: generateCourseCode("Kindergarten", "Mathematics", "Numeracy"), description: "Introduction to numbers and counting.", instructor: "Mrs. Adaobi", credits: 1, schedule: "Daily 10:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "counting bears"
  },
  {
    id: "KG_RHY", title: "Rhymes and Songs", schoolLevel: "Kindergarten", subjectCategory: "Creative Arts",
    code: generateCourseCode("Kindergarten", "Creative Arts", "Rhymes"), description: "Learning through rhymes and songs.", instructor: "Mrs. Adaobi", credits: 1, schedule: "Mon/Wed 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "children singing"
  },
  {
    id: "KG_COL", title: "Colours and Shapes", schoolLevel: "Kindergarten", subjectCategory: "General Studies",
    code: generateCourseCode("Kindergarten", "General Studies", "ColoursShapes"), description: "Identifying colours and shapes.", instructor: "Mrs. Funke", credits: 1, schedule: "Tue/Thu 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "shape sorter"
  },
  {
    id: "KG_HEA", title: "Health Habits", schoolLevel: "Kindergarten", subjectCategory: "Health & PE",
    code: generateCourseCode("Kindergarten", "Health & PE", "HealthHabits"), description: "Basic personal hygiene and health.", instructor: "Mrs. Funke", credits: 1, schedule: "Daily 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "hand washing"
  },
  {
    id: "KG_SOC", title: "Social Habits", schoolLevel: "Kindergarten", subjectCategory: "Social & Humanities",
    code: generateCourseCode("Kindergarten", "Social & Humanities", "SocialHabits"), description: "Learning to interact and share.", instructor: "Mrs. Funke", credits: 1, schedule: "Daily 1:30 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "children playing"
  },
  {
    id: "KG_PHY", title: "Physical Development", schoolLevel: "Kindergarten", subjectCategory: "Health & PE",
    code: generateCourseCode("Kindergarten", "Health & PE", "PhysicalDev"), description: "Gross motor skills development.", instructor: "Mr. Emeka", credits: 1, schedule: "Daily 2:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "kids playground"
  },
  {
    id: "KG_ART", title: "Creative Arts (KG)", schoolLevel: "Kindergarten", subjectCategory: "Creative Arts",
    code: generateCourseCode("Kindergarten", "Creative Arts", "CreativeKG"), description: "Exploring creativity through drawing and crafts.", instructor: "Mrs. Adaobi", credits: 1, schedule: "Fri 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "kids drawing"
  },

  // Nursery 1–3 (Mapped to Primary Level)
  {
    id: "NUR_ENG", title: "English Language (Nursery)", schoolLevel: "Primary", subjectCategory: "Languages",
    code: generateCourseCode("Primary", "Languages", "EnglishNursery"), description: "Foundational English skills for nursery.", instructor: "Ms. Bola", credits: 2, schedule: "Daily 9:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "abc book"
  },
  {
    id: "NUR_MTH", title: "Mathematics (Nursery)", schoolLevel: "Primary", subjectCategory: "Mathematics",
    code: generateCourseCode("Primary", "Mathematics", "MathNursery"), description: "Basic mathematical concepts for nursery.", instructor: "Ms. Bola", credits: 2, schedule: "Daily 10:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "number blocks"
  },
  {
    id: "NUR_YOR", title: "Yoruba Language (Nursery)", schoolLevel: "Primary", subjectCategory: "Languages",
    code: generateCourseCode("Primary", "Languages", "YorubaNursery"), description: "Introduction to Yoruba language.", instructor: "Mrs. Ade", credits: 1, schedule: "Mon/Wed 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "yoruba culture"
  },
   {
    id: "NUR_IGB", title: "Igbo Language (Nursery)", schoolLevel: "Primary", subjectCategory: "Languages",
    code: generateCourseCode("Primary", "Languages", "IgboNursery"), description: "Introduction to Igbo language.", instructor: "Mr. Obi", credits: 1, schedule: "Mon/Wed 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "igbo culture"
  },
   {
    id: "NUR_HAU", title: "Hausa Language (Nursery)", schoolLevel: "Primary", subjectCategory: "Languages",
    code: generateCourseCode("Primary", "Languages", "HausaNursery"), description: "Introduction to Hausa language.", instructor: "Mallam Sani", credits: 1, schedule: "Mon/Wed 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "hausa culture"
  },
  {
    id: "NUR_BSC", title: "Basic Science (Nursery)", schoolLevel: "Primary", subjectCategory: "Sciences",
    code: generateCourseCode("Primary", "Sciences", "ScienceNursery"), description: "Exploring the world around us.", instructor: "Ms. Chidinma", credits: 2, schedule: "Tue/Thu 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "magnifying glass"
  },
  {
    id: "NUR_HH", title: "Health Habits (Nursery)", schoolLevel: "Primary", subjectCategory: "Health & PE",
    code: generateCourseCode("Primary", "Health & PE", "HealthNursery"), description: "Promoting healthy habits.", instructor: "Nurse Fatima", credits: 1, schedule: "Daily 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "toothbrush apple"
  },
  {
    id: "NUR_SNV", title: "Social Norms and Values (Nursery)", schoolLevel: "Primary", subjectCategory: "Social & Humanities",
    code: generateCourseCode("Primary", "Social & Humanities", "SocialNursery"), description: "Understanding social norms and values.", instructor: "Ms. Bola", credits: 1, schedule: "Daily 1:30 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "children sharing"
  },
  {
    id: "NUR_RHYP", title: "Rhymes and Poetry (Nursery)", schoolLevel: "Primary", subjectCategory: "Creative Arts",
    code: generateCourseCode("Primary", "Creative Arts", "RhymesNursery"), description: "Learning through rhymes and poetry.", instructor: "Ms. Bola", credits: 1, schedule: "Fri 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "poetry book"
  },
  {
    id: "NUR_PHE", title: "Physical and Health Education (Nursery)", schoolLevel: "Primary", subjectCategory: "Health & PE",
    code: generateCourseCode("Primary", "Health & PE", "PHENursery"), description: "Fun physical activities.", instructor: "Coach Sam", credits: 1, schedule: "Daily 2:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "kids exercising"
  },
  {
    id: "NUR_CA", title: "Creative Arts (Nursery)", schoolLevel: "Primary", subjectCategory: "Creative Arts",
    code: generateCourseCode("Primary", "Creative Arts", "CreativeNursery"), description: "Drawing, painting, and crafts.", instructor: "Ms. Chidinma", credits: 1, schedule: "Wed 2:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "children painting"
  },
  {
    id: "NUR_IRS", title: "Islamic Studies (Nursery)", schoolLevel: "Primary", subjectCategory: "Religious Studies",
    code: generateCourseCode("Primary", "Religious Studies", "IRSNursery"), description: "Introduction to Islamic teachings.", instructor: "Imam Ali", credits: 1, schedule: "Tue 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "quran illustration"
  },
  {
    id: "NUR_CRS", title: "Christian Religious Studies (Nursery)", schoolLevel: "Primary", subjectCategory: "Religious Studies",
    code: generateCourseCode("Primary", "Religious Studies", "CRSNursery"), description: "Introduction to Christian teachings.", instructor: "Pastor John", credits: 1, schedule: "Thu 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "bible illustration"
  },
  {
    id: "NUR_NAT", title: "Nature Study (Nursery)", schoolLevel: "Primary", subjectCategory: "Sciences",
    code: generateCourseCode("Primary", "Sciences", "NatureNursery"), description: "Learning about plants and animals.", instructor: "Ms. Chidinma", credits: 1, schedule: "Mon 2:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "leaf insect"
  },
  {
    id: "NUR_CIV", title: "Civic Education (Nursery)", schoolLevel: "Primary", subjectCategory: "Social & Humanities",
    code: generateCourseCode("Primary", "Social & Humanities", "CivicNursery"), description: "Basic understanding of civic duties.", instructor: "Ms. Bola", credits: 1, schedule: "Fri 1:30 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "community helpers"
  },

  // Primary 1–5
  {
    id: "PRI_ENG", title: "English Language (Primary)", schoolLevel: "Primary", subjectCategory: "Languages",
    code: generateCourseCode("Primary", "Languages", "EnglishPrimary"), description: "Developing reading, writing, and speaking skills.", instructor: "Mr. David", credits: 3, schedule: "Daily 9:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "english textbook"
  },
  {
    id: "PRI_MTH", title: "Mathematics (Primary)", schoolLevel: "Primary", subjectCategory: "Mathematics",
    code: generateCourseCode("Primary", "Mathematics", "MathPrimary"), description: "Core mathematical concepts and problem-solving.", instructor: "Mrs. Esther", credits: 3, schedule: "Daily 10:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "math symbols"
  },
  {
    id: "PRI_BST", title: "Basic Science and Technology (Primary)", schoolLevel: "Primary", subjectCategory: "Sciences",
    code: generateCourseCode("Primary", "Sciences", "BSTPrimary"), description: "Fundamentals of science and basic technology.", instructor: "Mr. Peter", credits: 2, schedule: "Mon/Wed/Fri 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "science experiment"
  },
  {
    id: "PRI_SOS", title: "Social Studies (Primary)", schoolLevel: "Primary", subjectCategory: "Social & Humanities",
    code: generateCourseCode("Primary", "Social & Humanities", "SocialPrimary"), description: "Understanding society, culture, and environment.", instructor: "Mrs. Grace", credits: 2, schedule: "Tue/Thu 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "map globe"
  },
  {
    id: "PRI_CIV", title: "Civic Education (Primary)", schoolLevel: "Primary", subjectCategory: "Social & Humanities",
    code: generateCourseCode("Primary", "Social & Humanities", "CivicPrimary"), description: "Rights, duties, and values of a citizen.", instructor: "Mrs. Grace", credits: 1, schedule: "Mon 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "voting box"
  },
  {
    id: "PRI_AGR", title: "Agricultural Science (Primary)", schoolLevel: "Primary", subjectCategory: "Business & Vocational",
    code: generateCourseCode("Primary", "Business & Vocational", "AgricPrimary"), description: "Introduction to farming and agriculture.", instructor: "Mr. Ben", credits: 1, schedule: "Wed 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "farm tools"
  },
  {
    id: "PRI_YOR", title: "Yoruba Language (Primary)", schoolLevel: "Primary", subjectCategory: "Languages",
    code: generateCourseCode("Primary", "Languages", "YorubaPrimary"), description: "Further studies in Yoruba language.", instructor: "Mrs. Ade", credits: 1, schedule: "Tue 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "yoruba text"
  },
  {
    id: "PRI_IGB", title: "Igbo Language (Primary)", schoolLevel: "Primary", subjectCategory: "Languages",
    code: generateCourseCode("Primary", "Languages", "IgboPrimary"), description: "Further studies in Igbo language.", instructor: "Mr. Obi", credits: 1, schedule: "Tue 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "igbo text"
  },
  {
    id: "PRI_HAU", title: "Hausa Language (Primary)", schoolLevel: "Primary", subjectCategory: "Languages",
    code: generateCourseCode("Primary", "Languages", "HausaPrimary"), description: "Further studies in Hausa language.", instructor: "Mallam Sani", credits: 1, schedule: "Tue 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "hausa text"
  },
  {
    id: "PRI_IRS", title: "Islamic Studies (Primary)", schoolLevel: "Primary", subjectCategory: "Religious Studies",
    code: generateCourseCode("Primary", "Religious Studies", "IRSPrimary"), description: "Islamic teachings and practices.", instructor: "Imam Ali", credits: 1, schedule: "Thu 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "mosque silhouette"
  },
  {
    id: "PRI_CRS", title: "Christian Religious Studies (Primary)", schoolLevel: "Primary", subjectCategory: "Religious Studies",
    code: generateCourseCode("Primary", "Religious Studies", "CRSPrimary"), description: "Christian teachings and practices.", instructor: "Pastor John", credits: 1, schedule: "Thu 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "church silhouette"
  },
  {
    id: "PRI_CCA", title: "Cultural and Creative Arts (Primary)", schoolLevel: "Primary", subjectCategory: "Creative Arts",
    code: generateCourseCode("Primary", "Creative Arts", "CCAPrimary"), description: "Exploring culture through various art forms.", instructor: "Ms. Aisha", credits: 1, schedule: "Fri 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "african masks"
  },
  {
    id: "PRI_PHE", title: "Physical and Health Education (Primary)", schoolLevel: "Primary", subjectCategory: "Health & PE",
    code: generateCourseCode("Primary", "Health & PE", "PHEPrimary"), description: "Sports, games, and health education.", instructor: "Coach Tunde", credits: 1, schedule: "Daily 2:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "sports equipment"
  },
  {
    id: "PRI_MOR", title: "Moral Instruction (Primary)", schoolLevel: "Primary", subjectCategory: "Social & Humanities",
    code: generateCourseCode("Primary", "Social & Humanities", "MoralPrimary"), description: "Teaching moral values and ethics.", instructor: "Mrs. Grace", credits: 1, schedule: "Mon 1:30 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "helping hands"
  },
  {
    id: "PRI_VR", title: "Verbal Reasoning (Primary)", schoolLevel: "Primary", subjectCategory: "General Studies",
    code: generateCourseCode("Primary", "General Studies", "VRPrimary"), description: "Developing verbal reasoning skills.", instructor: "Mr. David", credits: 1, schedule: "Wed 1:30 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "brain puzzle"
  },
  {
    id: "PRI_QR", title: "Quantitative Reasoning (Primary)", schoolLevel: "Primary", subjectCategory: "General Studies",
    code: generateCourseCode("Primary", "General Studies", "QRPrimary"), description: "Developing quantitative reasoning skills.", instructor: "Mrs. Esther", credits: 1, schedule: "Fri 1:30 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "number puzzle"
  },
  {
    id: "PRI_HE", title: "Home Economics (Primary)", schoolLevel: "Primary", subjectCategory: "Business & Vocational",
    code: generateCourseCode("Primary", "Business & Vocational", "HEPrimary"), description: "Basic home management skills.", instructor: "Mrs. Kemi", credits: 1, schedule: "Tue 1:30 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "sewing cooking"
  },

  // Junior Secondary School (JSS 1–3)
  {
    id: "JSS_ENG", title: "English Studies (JSS)", schoolLevel: "Secondary", subjectCategory: "Languages",
    code: generateCourseCode("Secondary", "Languages", "EnglishJSS"), description: "Advanced English language and literature.", instructor: "Ms. Johnson", credits: 3, schedule: "Daily 8:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "shakespeare book"
  },
  {
    id: "JSS_MTH", title: "Mathematics (JSS)", schoolLevel: "Secondary", subjectCategory: "Mathematics",
    code: generateCourseCode("Secondary", "Mathematics", "MathJSS"), description: "Core mathematics for junior secondary.", instructor: "Mr. Adebayo", credits: 3, schedule: "Daily 9:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "geometry tools"
  },
  {
    id: "JSS_BSC", title: "Basic Science (JSS)", schoolLevel: "Secondary", subjectCategory: "Sciences",
    code: generateCourseCode("Secondary", "Sciences", "ScienceJSS"), description: "Integrated science concepts.", instructor: "Mr. Okoro", credits: 2, schedule: "Mon/Wed/Fri 10:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "science lab"
  },
  {
    id: "JSS_BT", title: "Basic Technology (JSS)", schoolLevel: "Secondary", subjectCategory: "Technology",
    code: generateCourseCode("Secondary", "Technology", "TechJSS"), description: "Introduction to technology and design.", instructor: "Mr. Isa", credits: 2, schedule: "Tue/Thu 10:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "tools workshop"
  },
  {
    id: "JSS_SOS", title: "Social Studies (JSS)", schoolLevel: "Secondary", subjectCategory: "Social & Humanities",
    code: generateCourseCode("Secondary", "Social & Humanities", "SocialJSS"), description: "Understanding society, government, and history.", instructor: "Mrs. Bello", credits: 2, schedule: "Mon/Wed 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "historical map"
  },
  {
    id: "JSS_CIV", title: "Civic Education (JSS)", schoolLevel: "Secondary", subjectCategory: "Social & Humanities",
    code: generateCourseCode("Secondary", "Social & Humanities", "CivicJSS"), description: "Citizenship, rights, and responsibilities.", instructor: "Mrs. Bello", credits: 1, schedule: "Fri 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "constitution book"
  },
  {
    id: "JSS_AGR", title: "Agricultural Science (JSS)", schoolLevel: "Secondary", subjectCategory: "Business & Vocational", // Or Sciences
    code: generateCourseCode("Secondary", "Business & Vocational", "AgricJSS"), description: "Principles of agriculture and farming.", instructor: "Mr. Eze", credits: 2, schedule: "Tue/Thu 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "farm field"
  },
  {
    id: "JSS_BUS", title: "Business Studies (JSS)", schoolLevel: "Secondary", subjectCategory: "Business & Vocational",
    code: generateCourseCode("Secondary", "Business & Vocational", "BusinessJSS"), description: "Introduction to business and commerce.", instructor: "Ms. Dangana", credits: 2, schedule: "Mon/Wed 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "office setting"
  },
  {
    id: "JSS_CCA", title: "Cultural and Creative Arts (JSS)", schoolLevel: "Secondary", subjectCategory: "Creative Arts",
    code: generateCourseCode("Secondary", "Creative Arts", "CCAJSS"), description: "Music, drama, fine arts.", instructor: "Mr. Femi", credits: 1, schedule: "Fri 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "art supplies"
  },
  {
    id: "JSS_COMP", title: "Computer Studies (JSS)", schoolLevel: "Secondary", subjectCategory: "Technology",
    code: generateCourseCode("Secondary", "Technology", "ComputerJSS"), description: "Fundamentals of computing.", instructor: "Mr. Isa", credits: 1, schedule: "Tue 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "computer screen"
  },
  {
    id: "JSS_IRS", title: "Islamic Studies (JSS)", schoolLevel: "Secondary", subjectCategory: "Religious Studies",
    code: generateCourseCode("Secondary", "Religious Studies", "IRSJSS"), description: "In-depth Islamic knowledge.", instructor: "Sheikh Ahmed", credits: 1, schedule: "Thu 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "islamic calligraphy"
  },
  {
    id: "JSS_CRS", title: "Christian Religious Studies (JSS)", schoolLevel: "Secondary", subjectCategory: "Religious Studies",
    code: generateCourseCode("Secondary", "Religious Studies", "CRSJSS"), description: "In-depth Christian knowledge.", instructor: "Rev. Sister Mary", credits: 1, schedule: "Thu 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "stained glass"
  },
  {
    id: "JSS_HE", title: "Home Economics (JSS)", schoolLevel: "Secondary", subjectCategory: "Business & Vocational",
    code: generateCourseCode("Secondary", "Business & Vocational", "HEJSS"), description: "Food, nutrition, and home management.", instructor: "Mrs. Chioma", credits: 1, schedule: "Wed 2:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "kitchen utensils"
  },
  {
    id: "JSS_PHE", title: "Physical and Health Education (JSS)", schoolLevel: "Secondary", subjectCategory: "Health & PE",
    code: generateCourseCode("Secondary", "Health & PE", "PHEJSS"), description: "Sports, fitness, and health science.", instructor: "Coach Bala", credits: 1, schedule: "Daily 2:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "running track"
  },
  {
    id: "JSS_NIGYOR", title: "Nigerian Language - Yoruba (JSS)", schoolLevel: "Secondary", subjectCategory: "Languages",
    code: generateCourseCode("Secondary", "Languages", "YorubaJSS"), description: "Yoruba language and culture.", instructor: "Dr. (Mrs.) Adewale", credits: 1, schedule: "Tue 2:00PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "yoruba script"
  },
  {
    id: "JSS_NIGIGB", title: "Nigerian Language - Igbo (JSS)", schoolLevel: "Secondary", subjectCategory: "Languages",
    code: generateCourseCode("Secondary", "Languages", "IgboJSS"), description: "Igbo language and culture.", instructor: "Chief Nzeogwu", credits: 1, schedule: "Tue 2:00PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "igbo script"
  },
  {
    id: "JSS_NIGHAU", title: "Nigerian Language - Hausa (JSS)", schoolLevel: "Secondary", subjectCategory: "Languages",
    code: generateCourseCode("Secondary", "Languages", "HausaJSS"), description: "Hausa language and culture.", instructor: "Alhaji Musa", credits: 1, schedule: "Tue 2:00PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "hausa script"
  },

  // Senior Secondary School (SSS 1–3) - Core
  {
    id: "SSS_ENG_C", title: "English Language (SSS Core)", schoolLevel: "Secondary", subjectCategory: "Languages", sssStream: "Core",
    code: generateCourseCode("Secondary", "Languages", "EnglishSSSCore"), description: "Compulsory English for SSS.", instructor: "Prof. Wole", credits: 3, schedule: "Daily 8:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "literature books"
  },
  {
    id: "SSS_MTH_C", title: "Mathematics (SSS Core)", schoolLevel: "Secondary", subjectCategory: "Mathematics", sssStream: "Core",
    code: generateCourseCode("Secondary", "Mathematics", "MathSSSCore"), description: "Compulsory Mathematics for SSS.", instructor: "Dr. Funmi", credits: 3, schedule: "Daily 9:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "calculus equations"
  },
  {
    id: "SSS_CIV_C", title: "Civic Education (SSS Core)", schoolLevel: "Secondary", subjectCategory: "Social & Humanities", sssStream: "Core",
    code: generateCourseCode("Secondary", "Social & Humanities", "CivicSSSCore"), description: "Compulsory Civic Education for SSS.", instructor: "Mr. Lagbaja", credits: 2, schedule: "Mon/Wed 10:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "nigerian flag"
  },
  {
    id: "SSS_NIGYOR_C", title: "Nigerian Language - Yoruba (SSS Core)", schoolLevel: "Secondary", subjectCategory: "Languages", sssStream: "Core",
    code: generateCourseCode("Secondary", "Languages", "YorubaSSSCore"), description: "Yoruba as a core Nigerian Language.", instructor: "Dr. (Mrs.) Adewale", credits: 2, schedule: "Tue/Thu 10:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "yoruba literature"
  },
    {
    id: "SSS_NIGIGB_C", title: "Nigerian Language - Igbo (SSS Core)", schoolLevel: "Secondary", subjectCategory: "Languages", sssStream: "Core",
    code: generateCourseCode("Secondary", "Languages", "IgboSSSCore"), description: "Igbo as a core Nigerian Language.", instructor: "Chief Nzeogwu", credits: 2, schedule: "Tue/Thu 10:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "igbo literature"
  },
  {
    id: "SSS_NIGHAU_C", title: "Nigerian Language - Hausa (SSS Core)", schoolLevel: "Secondary", subjectCategory: "Languages", sssStream: "Core",
    code: generateCourseCode("Secondary", "Languages", "HausaSSSCore"), description: "Hausa as a core Nigerian Language.", instructor: "Alhaji Musa", credits: 2, schedule: "Tue/Thu 10:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "hausa literature"
  },
  {
    id: "SSS_TRD_DP", title: "Trade Subject: Data Processing (SSS Core)", schoolLevel: "Secondary", subjectCategory: "Technology", sssStream: "Trade",
    code: generateCourseCode("Secondary", "Technology", "DataProcSSS"), description: "Core trade subject: Data Processing.", instructor: "Mr. Byte", credits: 2, schedule: "Fri 10:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "data server"
  },
  {
    id: "SSS_TRD_CAT", title: "Trade Subject: Catering Craft (SSS Core)", schoolLevel: "Secondary", subjectCategory: "Business & Vocational", sssStream: "Trade",
    code: generateCourseCode("Secondary", "Business & Vocational", "CateringSSS"), description: "Core trade subject: Catering Craft.", instructor: "Chef Amina", credits: 2, schedule: "Fri 10:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "chef cooking"
  },
  {
    id: "SSS_TRD_AH", title: "Trade Subject: Animal Husbandry (SSS Core)", schoolLevel: "Secondary", subjectCategory: "Business & Vocational", sssStream: "Trade",
    code: generateCourseCode("Secondary", "Business & Vocational", "AnimalHSSS"), description: "Core trade subject: Animal Husbandry.", instructor: "Dr. Vet", credits: 2, schedule: "Fri 10:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "farm animals"
  },

  // SSS - Science Subjects
  {
    id: "SSS_BIO_S", title: "Biology (SSS Science)", schoolLevel: "Secondary", subjectCategory: "Sciences", sssStream: "Science",
    code: generateCourseCode("Secondary", "Sciences", "BiologySSSSci"), description: "Advanced biology for science students.", instructor: "Dr. Evelyn", credits: 3, schedule: "Mon/Wed/Fri 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "dna strand"
  },
  {
    id: "SSS_CHM_S", title: "Chemistry (SSS Science)", schoolLevel: "Secondary", subjectCategory: "Sciences", sssStream: "Science",
    code: generateCourseCode("Secondary", "Sciences", "ChemistrySSSSci"), description: "Advanced chemistry for science students.", instructor: "Mr. Atom", credits: 3, schedule: "Mon/Wed/Fri 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "chemistry beakers"
  },
  {
    id: "SSS_PHY_S", title: "Physics (SSS Science)", schoolLevel: "Secondary", subjectCategory: "Sciences", sssStream: "Science",
    code: generateCourseCode("Secondary", "Sciences", "PhysicsSSSSci"), description: "Advanced physics for science students.", instructor: "Ms. Proton", credits: 3, schedule: "Tue/Thu 11:00 AM, Fri 2:00PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "physics equations"
  },
  {
    id: "SSS_FMTH_S", title: "Further Mathematics (SSS Science)", schoolLevel: "Secondary", subjectCategory: "Mathematics", sssStream: "Science",
    code: generateCourseCode("Secondary", "Mathematics", "FMathSSSSci"), description: "Advanced mathematics for science students.", instructor: "Dr. Funmi", credits: 3, schedule: "Tue/Thu 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "complex graph"
  },
  {
    id: "SSS_AGR_S", title: "Agricultural Science (SSS Science)", schoolLevel: "Secondary", subjectCategory: "Sciences", sssStream: "Science",
    code: generateCourseCode("Secondary", "Sciences", "AgricSSSSci"), description: "Scientific principles of agriculture.", instructor: "Dr. Farmer", credits: 2, schedule: "Mon 2:00PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "crop science"
  },
  {
    id: "SSS_TD_S", title: "Technical Drawing (SSS Science/Tech)", schoolLevel: "Secondary", subjectCategory: "Technology", sssStream: "Science",
    code: generateCourseCode("Secondary", "Technology", "TDSSSSci"), description: "Technical drawing for science/tech students.", instructor: "Engr. Design", credits: 2, schedule: "Wed 2:00PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "blueprints tools"
  },
  {
    id: "SSS_CS_S", title: "Computer Science (SSS Science/Tech)", schoolLevel: "Secondary", subjectCategory: "Technology", sssStream: "Science",
    code: generateCourseCode("Secondary", "Technology", "CompSciSSSSci"), description: "Computer science for science/tech students.", instructor: "Mr. Byte", credits: 2, schedule: "Thu 2:00PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "code screen"
  },

  // SSS - Art Subjects
  {
    id: "SSS_LIT_A", title: "Literature-in-English (SSS Art)", schoolLevel: "Secondary", subjectCategory: "Languages", sssStream: "Art",
    code: generateCourseCode("Secondary", "Languages", "LitSSSArt"), description: "Study of English literature for art students.", instructor: "Prof. Wole", credits: 3, schedule: "Mon/Wed/Fri 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "classic novel"
  },
  {
    id: "SSS_GOV_A", title: "Government (SSS Art)", schoolLevel: "Secondary", subjectCategory: "Social & Humanities", sssStream: "Art",
    code: generateCourseCode("Secondary", "Social & Humanities", "GovSSSArt"), description: "Study of government systems for art students.", instructor: "Mr. Lagbaja", credits: 3, schedule: "Mon/Wed/Fri 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "parliament building"
  },
  {
    id: "SSS_HIS_A", title: "History (SSS Art)", schoolLevel: "Secondary", subjectCategory: "Social & Humanities", sssStream: "Art",
    code: generateCourseCode("Secondary", "Social & Humanities", "HistSSSArt"), description: "Study of history for art students.", instructor: "Dr. Aisha", credits: 3, schedule: "Tue/Thu 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "ancient scroll"
  },
  {
    id: "SSS_FA_A", title: "Fine Art (SSS Art)", schoolLevel: "Secondary", subjectCategory: "Creative Arts", sssStream: "Art",
    code: generateCourseCode("Secondary", "Creative Arts", "FineArtSSSArt"), description: "Practical and theoretical fine arts.", instructor: "Ms. Shade", credits: 2, schedule: "Tue/Thu 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "paintings sculpture"
  },
  {
    id: "SSS_MUS_A", title: "Music (SSS Art)", schoolLevel: "Secondary", subjectCategory: "Creative Arts", sssStream: "Art",
    code: generateCourseCode("Secondary", "Creative Arts", "MusicSSSArt"), description: "Theory and practice of music.", instructor: "Mr. Harmony", credits: 2, schedule: "Fri 2:00PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "musical instruments"
  },
  {
    id: "SSS_IRS_A", title: "Islamic Studies (SSS Art)", schoolLevel: "Secondary", subjectCategory: "Religious Studies", sssStream: "Art",
    code: generateCourseCode("Secondary", "Religious Studies", "IRSSSSArt"), description: "Islamic Studies for art students.", instructor: "Sheikh Ahmed", credits: 2, schedule: "Mon 2:00PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "religious text"
  },
  {
    id: "SSS_CRS_A", title: "Christian Religious Studies (SSS Art)", schoolLevel: "Secondary", subjectCategory: "Religious Studies", sssStream: "Art",
    code: generateCourseCode("Secondary", "Religious Studies", "CRSSSSArt"), description: "Christian Religious Studies for art students.", instructor: "Rev. Sister Mary", credits: 2, schedule: "Mon 2:00PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "religious symbols"
  },
  
  // SSS - Commercial Subjects (Example)
   {
    id: "SSS_ECON_C", title: "Economics (SSS Commercial)", schoolLevel: "Secondary", subjectCategory: "Business & Vocational", sssStream: "Commercial",
    code: generateCourseCode("Secondary", "Business & Vocational", "EconSSSCom"), description: "Principles of economics for commercial students.", instructor: "Mr. Dollar", credits: 3, schedule: "Mon/Wed/Fri 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "stock chart"
  },
  {
    id: "SSS_ACC_C", title: "Accounting (SSS Commercial)", schoolLevel: "Secondary", subjectCategory: "Business & Vocational", sssStream: "Commercial",
    code: generateCourseCode("Secondary", "Business & Vocational", "AccSSSCom"), description: "Financial accounting for commercial students.", instructor: "Ms. Ledger", credits: 3, schedule: "Mon/Wed/Fri 1:00 PM", imageUrl: "https://placehold.co/600x400.png", aiHint: "calculator ledger"
  },
  {
    id: "SSS_COMM_C", title: "Commerce (SSS Commercial)", schoolLevel: "Secondary", subjectCategory: "Business & Vocational", sssStream: "Commercial",
    code: generateCourseCode("Secondary", "Business & Vocational", "CommSSSCom"), description: "Principles of commerce for commercial students.", instructor: "Mr. Trader", credits: 2, schedule: "Tue/Thu 11:00 AM", imageUrl: "https://placehold.co/600x400.png", aiHint: "global trade"
  },
];

interface StaffAllocation {
  [staffId: string]: string[]; // Array of course IDs
}

export default function CoursesPage() {
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | "all">("all");
  const [selectedSssStream, setSelectedSssStream] = useState<'Core' | 'Science' | 'Art' | 'Commercial' | 'Trade' | 'all'>("all");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [allocatedCourseIdsForStaff, setAllocatedCourseIdsForStaff] = useState<string[]>([]);
  const [pageDescription, setPageDescription] = useState("Browse available courses from the Nigerian curriculum. Filter by school level, subject category, and SSS stream.");

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole | null;
    const userId = localStorage.getItem("userId");
    setUserRole(role);

    if (role === 'staff' && userId) {
      const storedAllocations = localStorage.getItem('staffCourseAllocations');
      if (storedAllocations) {
        try {
          const allocations: StaffAllocation = JSON.parse(storedAllocations);
          if (allocations[userId] && allocations[userId].length > 0) {
            setAllocatedCourseIdsForStaff(allocations[userId]);
            setPageDescription("Browse your allocated subjects. Filter by school level, subject category, and SSS stream.");
          } else {
            setPageDescription("You currently have no subjects allocated. Contact an administrator.");
            setAllocatedCourseIdsForStaff([]); // Ensure it's an empty array if no allocations
          }
        } catch (e) {
          console.error("Failed to parse staff allocations from localStorage", e);
          setAllocatedCourseIdsForStaff([]);
           setPageDescription("Could not load your allocated subjects. Contact an administrator.");
        }
      } else {
        setPageDescription("You currently have no subjects allocated. Contact an administrator.");
        setAllocatedCourseIdsForStaff([]);
      }
    } else if (role === 'student' || role === 'admin') {
       setPageDescription("Browse available courses from the Nigerian curriculum. Filter by school level, subject category, and SSS stream.");
    }
  }, []);


  const getFilteredCourses = () => {
    let coursesToDisplay = nigerianCurriculumCourses;

    // Filter by allocated courses for staff
    if (userRole === 'staff' && allocatedCourseIdsForStaff.length > 0) {
      coursesToDisplay = coursesToDisplay.filter(course => allocatedCourseIdsForStaff.includes(course.id));
    } else if (userRole === 'staff' && allocatedCourseIdsForStaff.length === 0 && pageDescription.startsWith("You currently have no subjects allocated")) {
        // If staff has no allocations, show no courses for them
        return [];
    }


    // Apply general filters: level, category, SSS stream
    coursesToDisplay = coursesToDisplay.filter(course => 
      (selectedLevel === "all" || course.schoolLevel === selectedLevel) &&
      (selectedCategory === "all" || course.subjectCategory === selectedCategory)
    );
    
    if (selectedLevel === "Secondary" && selectedSssStream !== "all") {
       coursesToDisplay = coursesToDisplay.filter(course => {
         if (selectedSssStream === "Core") return course.sssStream === "Core";
         return course.sssStream === selectedSssStream || course.sssStream === "Core";
       });
    }
    return coursesToDisplay;
  };

  const filteredCourses = getFilteredCourses();

  const getCategoryIcon = (category: SubjectCategory) => {
    const Icon = subjectCategoryIcons[category] || BookText; // Default icon
    return <Icon className="h-4 w-4 mr-1" />;
  };
  
  const sssStreams: Array<'Core' | 'Science' | 'Art' | 'Commercial' | 'Trade'> = ['Core', 'Science', 'Art', 'Commercial', 'Trade'];


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Subjects</h1>
        <p className="text-muted-foreground">{pageDescription}</p>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={selectedLevel} onValueChange={(value) => {setSelectedLevel(value as SchoolLevel | "all"); if (value !== "Secondary") setSelectedSssStream("all");}}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="School Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {SCHOOL_LEVELS.map(level => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as SubjectCategory | "all")}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Subject Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {SUBJECT_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
         {selectedLevel === "Secondary" && (
          <Select value={selectedSssStream} onValueChange={(value) => setSelectedSssStream(value as 'Core' | 'Science' | 'Art' | 'Commercial' | 'Trade' | 'all')}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="SSS Stream" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All SSS Streams</SelectItem>
              {sssStreams.map(stream => (
                <SelectItem key={stream} value={stream}>{stream}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      {filteredCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative w-full h-48">
                <Image 
                  src={course.imageUrl} 
                  alt={course.title} 
                  layout="fill" 
                  objectFit="cover"
                  data-ai-hint={course.aiHint} 
                />
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{course.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="secondary" className="flex items-center">
                    <Layers className="h-3 w-3 mr-1" /> {course.schoolLevel}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center">
                    {getCategoryIcon(course.subjectCategory)} {course.subjectCategory}
                  </Badge>
                   {course.sssStream && course.schoolLevel === "Secondary" && (
                     <Badge variant="outline" className="capitalize">{course.sssStream}</Badge>
                   )}
                </div>
                <CardDescription>{course.code} - {course.credits} Credits</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-foreground mb-3">{course.description}</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" /> Instructor: {course.instructor}
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2" /> Schedule: {course.schedule}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <BookText className="mr-2 h-4 w-4" /> View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground col-span-full">
            {userRole === 'staff' && pageDescription.startsWith("You currently have no subjects allocated")
                ? "You have no subjects allocated to you. Please contact an administrator."
                : "No subjects match the selected filters."
            }
        </p>
      )}
    </div>
  );
}
