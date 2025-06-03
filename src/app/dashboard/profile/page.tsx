
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
import type { UserRole, SchoolLevel } from "@/lib/constants";
import { SCHOOL_LEVELS, mockSchoolClasses } from "@/lib/constants";
import { Edit3, School, Camera } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  departmentOrClass: z.string().optional(), // General field for department (staff) or class (student)
  schoolLevel: z.custom<SchoolLevel>().optional(), // For students primarily
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

type UserProfile = Omit<ProfileFormData, 'avatarFile' | 'departmentOrClass'> & {
  role: UserRole;
  id: string;
  avatarUrl?: string; 
  department?: string; // For staff/admin
  className?: string; // For student
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
    const email = `${name.toLowerCase().replace(/[^a-z0-9.]/g, "").split(" ").join(".")}@campus.edu`;
    
    let departmentValue: string | undefined = undefined;
    let classNameValue: string | undefined = undefined;
    let schoolLevelValue: SchoolLevel | undefined = undefined;

    if (role === "student") {
      if (name.toLowerCase().includes("kinder")) {
        schoolLevelValue = "Kindergarten";
        classNameValue = mockSchoolClasses.find(c => c.displayLevel === 'Nursery')?.name || "Nursery 1"; // Example
      } else if (name.toLowerCase().includes("primary")) {
        schoolLevelValue = "Primary";
        classNameValue = mockSchoolClasses.find(c => c.displayLevel === 'Primary')?.name || "Primary 3"; // Example
      } else {
         schoolLevelValue = "Secondary";
         classNameValue = mockSchoolClasses.find(c => c.displayLevel === 'Junior Secondary')?.name || "JSS 1"; // Example
      }
    } else if (role === "staff") {
      departmentValue = name.toLowerCase().includes("teacher") || name.toLowerCase().includes("bola") ? "Academics" : "Administration"; // Example
    } else if (role === "admin") {
      departmentValue = "School Administration"; 
    }
    
    const initialAvatarUrl = `https://placehold.co/150x150.png?text=${name[0]}`;
    const profileData: UserProfile = {
      id: role === "admin" ? "adm001" : (role === "staff" ? "stf001" : "std001"),
      name,
      email,
      role,
      phone: "08012345678",
      department: departmentValue,
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
      departmentOrClass: role === 'student' ? profileData.className : profileData.department,
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
      };
      if (prev.role === 'student') {
        updatedProfile.className = data.departmentOrClass;
      } else {
        updatedProfile.department = data.departmentOrClass;
      }
      return updatedProfile;
    });
    
    if (localStorage.getItem("userName") !== data.name) {
       localStorage.setItem("userName", data.name); 
    }
    toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    setIsEditing(false);
    form.reset({...data, avatarFile: undefined }); 
  };

  if (!userProfile) {
    return <div className="text-center p-10">Loading profile...</div>;
  }
  
  const userInitials = userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase() || userProfile.email[0].toUpperCase();
  
  let departmentOrClassLabel = "Details";
  if (userProfile.role === "student") departmentOrClassLabel = "Class";
  else if (userProfile.role === "staff") departmentOrClassLabel = "Department / Subject Area";
  else if (userProfile.role === "admin") departmentOrClassLabel = "Role Description";


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
            {userProfile.schoolLevel && userProfile.role === 'student' && (
              <span className="block mt-1 text-sm text-muted-foreground">
                <School className="inline-block h-4 w-4 mr-1 text-primary" /> Level: {userProfile.schoolLevel}
              </span>
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
            <div>
              <Label htmlFor="departmentOrClass">{departmentOrClassLabel}</Label>
              <Input id="departmentOrClass" {...form.register("departmentOrClass")} defaultValue={userProfile.role === 'student' ? userProfile.className : userProfile.department} disabled={!isEditing || (userProfile.role === 'admin' && departmentOrClassLabel === 'Role Description')} />
            </div>
             {userProfile.role === 'student' && (
              <div>
                <Label htmlFor="schoolLevel">School Level</Label>
                {isEditing ? (
                  <Controller
                    name="schoolLevel"
                    control={form.control}
                    defaultValue={userProfile.schoolLevel}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Input id="schoolLevelInput" value={userProfile.schoolLevel || ''} disabled />
                )}
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
                        departmentOrClass: userProfile.role === 'student' ? userProfile.className : userProfile.department, 
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
                departmentOrClass: userProfile.role === 'student' ? userProfile.className : userProfile.department,
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

    