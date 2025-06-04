
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState, type ChangeEvent } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import type { UserRole, SchoolLevel, Student } from "@/lib/constants";
import { SCHOOL_LEVELS, mockSchoolClasses } from "@/lib/constants"; 
import { Edit3, School, Camera, GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  classId: z.string().optional(), 
  department: z.string().optional(), 
  schoolLevel: z.custom<SchoolLevel>((val) => SCHOOL_LEVELS.includes(val as SchoolLevel), "Please select a school level").optional(), 
  avatarFile: z
    .custom<FileList>()
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0]?.size <= MAX_FILE_SIZE,
      `Max image size is 2MB.`
    )
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type UserProfile = Omit<ProfileFormData, 'avatarFile' > & {
  role: UserRole;
  id: string;
  avatarUrl?: string;
  className?: string; 
};

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

 useEffect(() => {
    const name = localStorage.getItem("userName") || "User";
    const role = (localStorage.getItem("userRole") as UserRole) || "student";
    const userId = localStorage.getItem("userId") || (role === "admin" ? "adm001" : (role === "staff" ? "stf001" : `std-${Date.now()}`));
    let email = `${name.toLowerCase().replace(/[^a-z0-9.]/g, "").split(" ").join(".")}@campus.edu`; // Default email
    
    let studentDetails: Student | undefined;
    let departmentValue: string | undefined = undefined;
    let classIdValue: string | undefined;
    let schoolLevelValue: SchoolLevel | undefined;
    let classNameValue: string | undefined;

    if (typeof window !== 'undefined') {
        const storedUsersString = localStorage.getItem('managedUsers');
        if (storedUsersString) {
            const allManagedUsers: (UserProfile | Student)[] = JSON.parse(storedUsersString);
            const foundUser = allManagedUsers.find(u => u.id === userId);
            if (foundUser) {
                email = foundUser.email; // Use stored email if available
                if (foundUser.role === 'student') {
                    studentDetails = foundUser as Student;
                    classIdValue = studentDetails.classId;
                    schoolLevelValue = studentDetails.schoolLevel;
                    classNameValue = classIdValue ? mockSchoolClasses.find(c => c.id === classIdValue)?.name : undefined;
                } else if (foundUser.role === 'staff' || foundUser.role === 'admin') {
                    departmentValue = (foundUser as UserProfile).department || (role === 'admin' ? "School Administration" : "General Staff");
                }
            }
        }
    }
    
    // Fallbacks if user not in localStorage (e.g. first load for default admin)
    if (role === "student" && !studentDetails) { 
      if (name.toLowerCase().includes("kinder")) schoolLevelValue = "Kindergarten";
      else if (name.toLowerCase().includes("nursery")) schoolLevelValue = "Nursery";
      else if (name.toLowerCase().includes("primary")) schoolLevelValue = "Primary";
      else schoolLevelValue = "Secondary";
    } else if (role === "staff" && !departmentValue) {
      departmentValue = name.toLowerCase().includes("teacher") || name.toLowerCase().includes("bola") ? "Academics" : "Administration"; 
    } else if (role === "admin" && !departmentValue) {
      departmentValue = "School Administration";
    }
    
    const initialAvatarUrl = `https://placehold.co/150x150.png?text=${name[0]}`;
    const profileData: UserProfile = {
      id: userId,
      name,
      email,
      role,
      phone: "08012345678", 
      department: departmentValue,
      classId: classIdValue,
      className: classNameValue,
      schoolLevel: schoolLevelValue,
      avatarUrl: initialAvatarUrl,
    };
    setUserProfile(profileData);
    setAvatarPreview(initialAvatarUrl);
    form.reset({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      department: profileData.department,
      classId: profileData.classId,
      schoolLevel: profileData.schoolLevel,
    });
  }, [form]);


  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (ACCEPTED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        form.setValue("avatarFile", files);
      } else {
        form.setError("avatarFile", {
            type: "manual",
            message: !ACCEPTED_IMAGE_TYPES.includes(file.type) ? "Invalid file type." : "File too large."
        });
        setAvatarPreview(userProfile?.avatarUrl || null);
      }
    }
  };

  const onSubmit: SubmitHandler<ProfileFormData> = (data) => {
    let newAvatarUrl = userProfile?.avatarUrl;
    if (data.avatarFile && data.avatarFile.length > 0 && avatarPreview && avatarPreview.startsWith('data:image')) {
      newAvatarUrl = avatarPreview;
    }

    setUserProfile(prev => {
      if (!prev) return null;
      const updatedProfile: UserProfile = {
        ...prev,
        name: data.name,
        email: data.email,
        phone: data.phone,
        schoolLevel: data.schoolLevel,
        avatarUrl: newAvatarUrl,
        classId: prev.role === 'student' ? data.classId : prev.classId,
        department: prev.role !== 'student' ? data.department : prev.department,
        className: prev.role === 'student' && data.classId ? mockSchoolClasses.find(c => c.id === data.classId)?.name : prev.className,
      };
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        const storedUsersString = localStorage.getItem('managedUsers');
        let allManagedUsers: (UserProfile | Student)[] = storedUsersString ? JSON.parse(storedUsersString) : [];
        const userIndex = allManagedUsers.findIndex(u => u.id === prev.id);
        if (userIndex > -1) {
           allManagedUsers[userIndex] = { ...allManagedUsers[userIndex], ...updatedProfile };
        } else {
           // This case might not be hit if profile assumes user exists, but good for robustness
           allManagedUsers.push(updatedProfile);
        }
        localStorage.setItem('managedUsers', JSON.stringify(allManagedUsers));
        if (localStorage.getItem("userId") === prev.id && localStorage.getItem("userName") !== data.name) {
            localStorage.setItem("userName", data.name); // Update current session's userName if it changed
        }
      }
      return updatedProfile;
    });
    
    toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    setIsEditing(false);
    form.reset({...data, avatarFile: undefined });
  };

  if (!userProfile) {
    return <div className="text-center p-10">Loading profile...</div>;
  }
  
  const userInitials = userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() || userProfile.email[0].toUpperCase();
  
  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center">
          <div className="relative">
            <Avatar className="w-32 h-32 mb-4 border-4 border-primary shadow-md">
              <AvatarImage
                src={avatarPreview || userProfile.avatarUrl}
                alt={userProfile.name}
                data-ai-hint="user avatar passport"
              />
              <AvatarFallback className="text-4xl">{userInitials}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <label htmlFor="avatarFile" className="absolute bottom-4 right-0 bg-accent text-accent-foreground rounded-full p-2 cursor-pointer hover:bg-accent/80 transition-colors">
                <Camera className="h-5 w-5" />
                <input
                  id="avatarFile"
                  type="file"
                  className="hidden"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </div>
          <CardTitle className="text-3xl font-headline">{userProfile.name}</CardTitle>
          <CardDescription>
            {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)} - ID: {userProfile.id}
             {userProfile.role === 'student' && (
                <>
                    {userProfile.schoolLevel && (
                    <span className="block mt-1 text-sm text-muted-foreground">
                        <School className="inline-block h-4 w-4 mr-1 text-primary" /> Level: {userProfile.schoolLevel}
                    </span>
                    )}
                    {userProfile.className && (
                    <span className="block mt-1 text-sm text-muted-foreground">
                        <GraduationCap className="inline-block h-4 w-4 mr-1 text-primary" /> Class: {userProfile.className}
                    </span>
                    )}
                </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...form.register("name")} defaultValue={userProfile.name} disabled={!isEditing} />
              {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...form.register("email")} defaultValue={userProfile.email} disabled={!isEditing} />
              {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...form.register("phone")} defaultValue={userProfile.phone} disabled={!isEditing} />
            </div>

            {userProfile.role === 'student' && (
              <>
                <div>
                  <Label htmlFor="schoolLevel">School Level</Label>
                  {isEditing ? (
                    <Controller
                      name="schoolLevel"
                      control={form.control}
                      defaultValue={userProfile.schoolLevel}
                      render={({ field }) => (
                        <Select 
                            onValueChange={(value) => {
                                field.onChange(value as SchoolLevel);
                                if (userProfile.schoolLevel !== value) {
                                    form.setValue("classId", undefined); // Reset class if level changes
                                }
                            }} 
                            value={field.value || ""}
                        >
                          <SelectTrigger id="schoolLevel">
                            <SelectValue placeholder="Select school level" />
                          </SelectTrigger>
                          <SelectContent>
                            {SCHOOL_LEVELS.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : (
                    <Input id="schoolLevelInput" value={userProfile.schoolLevel || 'N/A'} disabled />
                  )}
                </div>
                <div>
                  <Label htmlFor="classId">Class</Label>
                  {isEditing ? (
                     <Controller
                      name="classId"
                      control={form.control}
                      defaultValue={userProfile.classId}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <SelectTrigger id="classId">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
                            {mockSchoolClasses
                              .filter(cls => !form.getValues("schoolLevel") || cls.level === form.getValues("schoolLevel"))
                              .map(cls => (
                              <SelectItem key={cls.id} value={cls.id}>{cls.name} ({cls.displayLevel})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : (
                    <Input id="classNameInput" value={userProfile.className || 'N/A'} disabled />
                  )}
                </div>
              </>
            )}

            {(userProfile.role === 'staff' || userProfile.role === 'admin') && (
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" {...form.register("department")} defaultValue={userProfile.department} disabled={!isEditing || userProfile.role === 'admin'} />
              </div>
            )}

            {isEditing && form.formState.errors.avatarFile && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.avatarFile.message}</p>
            )}

            {isEditing && (
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                    setIsEditing(false);
                    form.reset({
                        name: userProfile.name,
                        email: userProfile.email,
                        phone: userProfile.phone,
                        department: userProfile.department,
                        classId: userProfile.classId,
                        schoolLevel: userProfile.schoolLevel,
                        avatarFile: undefined
                    });
                    setAvatarPreview(userProfile.avatarUrl || null);
                }}>Cancel</Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
              </div>
            )}
          </form>
        </CardContent>
        {!isEditing && (
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={() => {
              setIsEditing(true);
              form.reset({
                name: userProfile.name,
                email: userProfile.email,
                phone: userProfile.phone,
                department: userProfile.department,
                classId: userProfile.classId,
                schoolLevel: userProfile.schoolLevel,
                avatarFile: undefined
              });
              setAvatarPreview(userProfile.avatarUrl || null);
            }}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

    