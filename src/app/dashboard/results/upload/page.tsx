
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/lib/constants";
import { TERMS } from "@/lib/constants"; // Using TERMS from constants
import { UploadCloud, FileSpreadsheet } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];


const uploadSchema = z.object({
  subjectId: z.string().min(1, "Please select a subject."), // Changed from courseId
  term: z.string().min(1, "Please select a term."), // Changed from semester
  resultsFile: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, "Results file is required.")
    .refine((files) => files && files[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => files && ACCEPTED_FILE_TYPES.includes(files[0]?.type),
      ".csv, .xlsx, .xls files are accepted."
    ),
});

type UploadFormData = z.infer<typeof uploadSchema>;

// K-12 Focused Mock Subjects
const mockSubjectsForUpload = [
  { id: "PRI_ENG", name: "English Language (Primary)" },
  { id: "JSS_MTH", name: "Mathematics (JSS)" },
  { id: "SSS_PHY_S", name: "Physics (SSS Science)" },
  { id: "NUR_BSC", name: "Basic Science (Nursery)"},
];

export default function ResultUploadPage() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });


  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    setUserRole(role);
  }, []);
  
  const onSubmit = (data: UploadFormData) => {
    console.log("Uploading results:", data.resultsFile[0].name, "for subject:", data.subjectId, "term:", data.term);
    toast({
      title: "Upload Successful",
      description: `Results file "${data.resultsFile[0].name}" has been uploaded.`,
    });
    form.reset();
    setFileName(null);
  };

  if (userRole !== 'staff' && userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="text-2xl text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription>This page is only accessible to staff or admin members.</CardDescription>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Upload Results</h1>
        <p className="text-muted-foreground">Securely upload student results for subjects and terms.</p>
      </header>

      <Card className="max-w-lg mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSpreadsheet /> Result Upload Form</CardTitle>
          <CardDescription>Please ensure the file is in CSV, XLSX, or XLS format.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <Label>Subject</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockSubjectsForUpload.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
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
                        {TERMS.map(term => ( // Using TERMS from constants
                          <SelectItem key={term} value={term}>{term}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="resultsFile"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <Label htmlFor="resultsFile">Results File</Label>
                    <FormControl>
                      <Input 
                        id="resultsFile" 
                        type="file"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        onChange={(e) => {
                          onChange(e.target.files);
                          setFileName(e.target.files?.[0]?.name || null);
                        }}
                        {...rest}
                       />
                    </FormControl>
                     {fileName && <p className="text-sm text-muted-foreground mt-1">Selected file: {fileName}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <UploadCloud className="mr-2 h-4 w-4" /> Upload File
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    