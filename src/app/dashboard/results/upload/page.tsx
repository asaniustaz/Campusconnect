
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { UserRole, SchoolClass, StaffMember, SchoolSection } from "@/lib/constants";
import { TERMS, SESSIONS, mockSchoolClasses as defaultClasses } from "@/lib/constants"; 
import { UploadCloud, FileSpreadsheet, FileText, FileType } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_DOCX_TYPES = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ACCEPTED_EXCEL_TYPES = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];


const uploadSchema = z.object({
  session: z.string().min(1, "Please select a session."),
  term: z.string().min(1, "Please select a term."),
  classId: z.string().min(1, "Please select a class."),
  templateFile: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, "Template file is required.")
    .refine((files) => files && files[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => files && ACCEPTED_DOCX_TYPES.includes(files[0]?.type),
      "Only .docx files are accepted."
    ),
  resultsFile: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, "Results file is required.")
    .refine((files) => files && files[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => files && ACCEPTED_EXCEL_TYPES.includes(files[0]?.type),
      ".csv, .xlsx, .xls files are accepted."
    ),
});

type UploadFormData = z.infer<typeof uploadSchema>;


export default function ResultUploadPage() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);

  const [templateFileName, setTemplateFileName] = useState<string | null>(null);
  const [resultsFileName, setResultsFileName] = useState<string | null>(null);
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });


  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const userId = localStorage.getItem("userId");
    setUserRole(role);

    if (typeof window !== 'undefined') {
      const storedClassesString = localStorage.getItem('schoolClasses');
      if (storedClassesString) {
        try {
          setAllClasses(JSON.parse(storedClassesString));
        } catch (e) {
          setAllClasses(defaultClasses);
        }
      } else {
        setAllClasses(defaultClasses);
      }

      if (userId && (role === 'admin' || role === 'head_of_section')) {
        const storedUsersString = localStorage.getItem('managedUsers');
        if (storedUsersString) {
          try {
            const allUsers: StaffMember[] = JSON.parse(storedUsersString);
            const foundUser = allUsers.find(u => u.id === userId);
            if (foundUser) {
              setCurrentUser(foundUser);
            }
          } catch (e) { console.error("Failed to parse current user", e); }
        }
      }
    }
  }, []);
  
  const onSubmit = (data: UploadFormData) => {
    console.log("Generating results with:", data);
    toast({
      title: "Processing Started",
      description: `Generating results for ${data.classId} - ${data.term}, ${data.session}.`,
    });
    form.reset();
    setTemplateFileName(null);
    setResultsFileName(null);
  };

  const getVisibleClasses = () => {
    if (userRole === 'admin') {
      return allClasses;
    }
    if (userRole === 'head_of_section' && currentUser?.section) {
      return allClasses.filter(c => c.section === currentUser.section);
    }
    return [];
  };

  if (userRole !== 'admin' && userRole !== 'head_of_section') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="text-2xl text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription>This page is only accessible to admin and Head of Section members.</CardDescription>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Generate Student Results</h1>
        <p className="text-muted-foreground">Upload a DOCX template and an Excel file to generate PDF results.</p>
      </header>

      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSpreadsheet /> Result Generation Form</CardTitle>
          <CardDescription>Select the session, term, and class, then upload the required files.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="session"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Session</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Session" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SESSIONS.map(session => (
                              <SelectItem key={session} value={session}>{session}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Term</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Term" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TERMS.map(term => ( 
                              <SelectItem key={term} value={term}>{term}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Class for DOCX Template</Label>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getVisibleClasses().map(cls => (
                            <SelectItem key={cls.id} value={cls.id}>{cls.name} ({cls.displayLevel})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              
              <FormField
                control={form.control}
                name="templateFile"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <Label htmlFor="templateFile" className="flex items-center gap-2"><FileType/> Report Card Template (.docx)</Label>
                    <FormControl>
                      <Input 
                        id="templateFile" 
                        type="file"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(e) => {
                          onChange(e.target.files);
                          setTemplateFileName(e.target.files?.[0]?.name || null);
                        }}
                        {...rest}
                       />
                    </FormControl>
                     {templateFileName && <p className="text-sm text-muted-foreground mt-1">Selected: {templateFileName}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />

               <FormField
                control={form.control}
                name="resultsFile"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <Label htmlFor="resultsFile" className="flex items-center gap-2"><FileText/> Scoresheet for All Classes (.xlsx, .csv)</Label>
                    <FormControl>
                      <Input 
                        id="resultsFile" 
                        type="file"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={(e) => {
                          onChange(e.target.files);
                          setResultsFileName(e.target.files?.[0]?.name || null);
                        }}
                        {...rest}
                       />
                    </FormControl>
                     {resultsFileName && <p className="text-sm text-muted-foreground mt-1">Selected: {resultsFileName}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <UploadCloud className="mr-2 h-4 w-4" /> Generate and Distribute Results
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
