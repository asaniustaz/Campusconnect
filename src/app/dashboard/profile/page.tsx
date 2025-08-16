
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
import type { UserRole, SchoolSection, Student, StaffMember } from "@/lib/constants";
import { SCHOOL_SECTIONS, mockSchoolClasses, combineName } from "@/lib/constants"; 
import { Edit3, School, Camera, GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const profileSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  middleName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  classId: z.string().optional(), 
  department: z.string().optional(), 
  schoolSection: z.custom<SchoolSection>((val) => SCHOOL_SECTIONS.includes(val as SchoolSection), "Please select a school section").optional(), 
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
    const currentUserName = localStorage.getItem("userName") || "User";
    const currentUserRole = (localStorage.getItem("userRole") as UserRole) || "student";
    const currentUserId = localStorage.getItem("userId") || (currentUserRole === "admin" ? "adm001" : (currentUserRole === "staff" ? "stf001" : `std-${Date.now()}`));
    
    let profileData: UserProfile = {
      id: currentUserId,
      firstName: currentUserName.split(' ')[0] || 'User',
      surname: currentUserName.split(' ').slice(1).join(' ') || 'User',
      email: `${currentUserName.toLowerCase().replace(/[^a-z0-9.]/g, "").split(" ").join(".")}@campus.edu`,
      role: currentUserRole,
      phone: "08012345678", // Default phone
      avatarUrl: `https://placehold.co/150x150.png?text=${currentUserName[0]}`, // Default placeholder avatar
    };

    if (typeof window !== 'undefined') {
        const storedUsersString = localStorage.getItem('managedUsers');
        if (storedUsersString) {
            try {
                const allManagedUsers: (Student | StaffMember)[] = JSON.parse(storedUsersString);
                const foundUser = allManagedUsers.find(u => u.id === currentUserId);
                
                if (foundUser) {
                    profileData.email = foundUser.email;
                    profileData.firstName = foundUser.firstName; 
                    profileData.surname = foundUser.surname; 
                    profileData.middleName = foundUser.middleName; 
                    if (foundUser.avatarUrl) {
                        profileData.avatarUrl = foundUser.avatarUrl;
                    }

                    if (foundUser.role === 'student') {
                        const studentUser = foundUser as Student;
                        profileData.classId = studentUser.classId;
                        profileData.schoolSection = studentUser.schoolSection;
                        profileData.className = studentUser.classId ? mockSchoolClasses.find(c => c.id === studentUser.classId)?.name : undefined;
                    } else if (foundUser.role === 'staff' || foundUser.role === 'admin' || foundUser.role === 'head_of_section') {
                        const staffUser = foundUser as StaffMember;
                        profileData.department = staffUser.department || (currentUserRole === 'admin' ? "School Administration" : "General Staff");
                    }
                }
            } catch (e) {
                console.error("Failed to parse managedUsers for profile initialization:", e);
            }
        }
    }
    
    // Fallbacks if user not in localStorage or if certain fields are missing
    if (profileData.role === "student" && !profileData.schoolSection) { 
        profileData.schoolSection = "College";
    } else if (profileData.role === "staff" && !profileData.department) {
      profileData.department = "Academics"; 
    } else if (profileData.role === "admin" && !profileData.department) {
      profileData.department = "School Administration";
    }

    setUserProfile(profileData);
    setAvatarPreview(profileData.avatarUrl || null);
    form.reset({
      firstName: profileData.firstName,
      surname: profileData.surname,
      middleName: profileData.middleName,
      email: profileData.email,
      phone: profileData.phone,
      department: profileData.department,
      classId: profileData.classId,
      schoolSection: profileData.schoolSection,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.reset]); // form.reset is stable, other localStorage values are read once on mount effectively.

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
        form.clearErrors("avatarFile");
      } else {
        form.setError("avatarFile", {
            type: "manual",
            message: !ACCEPTED_IMAGE_TYPES.includes(file.type) ? "Invalid file type. Use JPG, PNG, WEBP." : "File too large. Max 2MB."
        });
        setAvatarPreview(userProfile?.avatarUrl || null);
         form.setValue("avatarFile", undefined); // Clear invalid file from form
      }
    } else {
       form.setValue("avatarFile", undefined); // No file selected
    }
  };

  const onSubmit: SubmitHandler<ProfileFormData> = (data) => {
    if (!userProfile) return;

    let newAvatarUrl = userProfile.avatarUrl; // Start with current avatar
    if (data.avatarFile && data.avatarFile.length > 0 && avatarPreview && avatarPreview.startsWith('data:image')) {
      newAvatarUrl = avatarPreview;
    }

    const updatedProfile: UserProfile = {
        ...userProfile, // Spread existing profile to keep role, id etc.
        firstName: data.firstName,
        surname: data.surname,
        middleName: data.middleName,
        email: data.email,
        phone: data.phone,
        schoolSection: data.schoolSection,
        avatarUrl: newAvatarUrl,
        classId: userProfile.role === 'student' ? data.classId : userProfile.classId,
        department: userProfile.role !== 'student' ? data.department : userProfile.department,
        className: userProfile.role === 'student' && data.classId ? mockSchoolClasses.find(c => c.id === data.classId)?.name : userProfile.className,
      };
    
    setUserProfile(updatedProfile);
      
      if (typeof window !== 'undefined') {
        const storedUsersString = localStorage.getItem('managedUsers');
        let allManagedUsers: (Student | StaffMember)[] = storedUsersString ? JSON.parse(storedUsersString) : [];
        const userIndex = allManagedUsers.findIndex(u => u.id === userProfile.id);

        if (userIndex > -1) {
           const userToUpdate = allManagedUsers[userIndex];
           allManagedUsers[userIndex] = {
             ...userToUpdate,
             firstName: updatedProfile.firstName,
             surname: updatedProfile.surname,
             middleName: updatedProfile.middleName,
             email: updatedProfile.email,
             avatarUrl: updatedProfile.avatarUrl,
             ...(userToUpdate.role === 'student' && {
                classId: (updatedProfile as Student).classId,
                schoolSection: (updatedProfile as Student).schoolSection,
             }),
             ...(userToUpdate.role !== 'student' && {
                 department: (updatedProfile as StaffMember).department,
             })
           };
        } else {
           allManagedUsers.push(updatedProfile as Student | StaffMember);
        }
        localStorage.setItem('managedUsers', JSON.stringify(allManagedUsers));

        if (localStorage.getItem("userId") === userProfile.id) {
            localStorage.setItem("userName", combineName(updatedProfile)); 
        }
      }
    
    toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    setIsEditing(false);
    form.reset({...data, avatarFile: undefined });
  };

  if (!userProfile) {
    return <div className="text-center p-10">Loading profile...</div>;
  }
  
  const userInitials = (userProfile.firstName[0] || '') + (userProfile.surname[0] || '');
  
  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="items-center text-center">
          <div className="relative">
            <Avatar className="w-32 h-32 mb-4 border-4 border-primary shadow-md">
              <AvatarImage
                src={avatarPreview || userProfile.avatarUrl}
                alt={combineName(userProfile)}
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
          <CardTitle className="text-3xl font-headline">{combineName(userProfile)}</CardTitle>
          <CardDescription>
            {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)} - ID: {userProfile.id}
             {userProfile.role === 'student' && (
                <>
                    {userProfile.schoolSection && (
                    <span className="block mt-1 text-sm text-muted-foreground">
                        <School className="inline-block h-4 w-4 mr-1 text-primary" /> Section: {userProfile.schoolSection}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...form.register("firstName")} disabled={!isEditing} />
                {form.formState.errors.firstName && <p className="text-sm text-destructive mt-1">{form.formState.errors.firstName.message}</p>}
                </div>
                <div>
                <Label htmlFor="surname">Surname</Label>
                <Input id="surname" {...form.register("surname")} disabled={!isEditing} />
                {form.formState.errors.surname && <p className="text-sm text-destructive mt-1">{form.formState.errors.surname.message}</p>}
                </div>
            </div>
            <div>
              <Label htmlFor="middleName">Middle Name (Optional)</Label>
              <Input id="middleName" {...form.register("middleName")} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...form.register("email")} disabled={!isEditing} />
              {form.formState.errors.email && <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...form.register("phone")} defaultValue={userProfile.phone} disabled={!isEditing} />
            </div>

            {userProfile.role === 'student' && (
              <>
                <div>
                  <Label htmlFor="schoolSection">School Section</Label>
                  {isEditing ? (
                    <Controller
                      name="schoolSection"
                      control={form.control}
                      defaultValue={userProfile.schoolSection}
                      render={({ field }) => (
                        <Select 
                            onValueChange={(value) => {
                                field.onChange(value as SchoolSection);
                                if (userProfile.schoolSection !== value) {
                                    form.setValue("classId", undefined); // Reset class if level changes
                                }
                            }} 
                            value={field.value || ""}
                        >
                          <SelectTrigger id="schoolSection">
                            <SelectValue placeholder="Select school section" />
                          </SelectTrigger>
                          <SelectContent>
                            {SCHOOL_SECTIONS.map(section => (
                              <SelectItem key={section} value={section}>{section}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : (
                    <Input id="schoolSectionInput" value={userProfile.schoolSection || 'N/A'} disabled />
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
                              .filter(cls => !form.getValues("schoolSection") || cls.section === form.getValues("schoolSection"))
                              .map(cls => (
                              <SelectItem key={cls.id} value={cls.id}>{cls.name} ({cls.section})</SelectItem>
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

            {(userProfile.role === 'staff' || userProfile.role === 'admin' || userProfile.role === 'head_of_section') && (
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
                        firstName: userProfile.firstName,
                        surname: userProfile.surname,
                        middleName: userProfile.middleName,
                        email: userProfile.email,
                        phone: userProfile.phone,
                        department: userProfile.department,
                        classId: userProfile.classId,
                        schoolSection: userProfile.schoolSection,
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
                firstName: userProfile.firstName,
                surname: userProfile.surname,
                middleName: userProfile.middleName,
                email: userProfile.email,
                phone: userProfile.phone,
                department: userProfile.department,
                classId: userProfile.classId,
                schoolSection: userProfile.schoolSection,
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
