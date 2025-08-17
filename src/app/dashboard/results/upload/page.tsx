
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { UserRole, SchoolClass, StaffMember, StoredDocument } from "@/lib/constants";
import { TERMS, SESSIONS, mockSchoolClasses as defaultClasses } from "@/lib/constants";
import { UploadCloud, FileSpreadsheet, FileText, FileType, CheckCircle, ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { Progress } from "@/components/ui/progress";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_DOCX_TYPES = ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ACCEPTED_EXCEL_TYPES = ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"];

const uploadSchema = z.object({
  session: z.string().min(1, "Please select a session."),
  term: z.string().min(1, "Please select a term."),
  classId: z.string().min(1, "Please select a class."),
  templateFile: z.custom<FileList>().refine(files => files && files.length > 0, "Template file is required."),
  resultsFile: z.custom<FileList>().refine(files => files && files.length > 0, "Results file is required."),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export default function ResultUploadPage() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);
  
  const [step, setStep] = useState(1);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [columnHeaders, setColumnHeaders] = useState<string[]>([]);
  const [mappedFields, setMappedFields] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);


  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { session: "", term: "", classId: "" },
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const userId = localStorage.getItem("userId");
    setUserRole(role);
    if (typeof window !== 'undefined') {
      const storedClassesString = localStorage.getItem('schoolClasses');
      setAllClasses(storedClassesString ? JSON.parse(storedClassesString) : defaultClasses);
      if (userId && (role === 'admin' || role === 'head_of_section')) {
        const storedUsersString = localStorage.getItem('managedUsers');
        if (storedUsersString) {
          const allUsers: StaffMember[] = JSON.parse(storedUsersString);
          setCurrentUser(allUsers.find(u => u.id === userId) || null);
        }
      }
    }
  }, []);
  
  const handleFileRead = async () => {
    setProcessing(true);
    setProgress(10);
    const { templateFile, resultsFile } = form.getValues();

    if (!templateFile || !resultsFile) {
        toast({ variant: "destructive", title: "Error", description: "Both files must be selected."});
        setProcessing(false);
        return;
    }

    try {
      // 1. Read DOCX placeholders
      setProgress(25);
      const templateArrayBuffer = await templateFile[0].arrayBuffer();
      const text = (await mammoth.extractRawText({ arrayBuffer: templateArrayBuffer })).value;
      const foundPlaceholders = text.match(/\{\{([^}]+)\}\}/g) || [];
      const uniquePlaceholders = Array.from(new Set(foundPlaceholders.map(p => p.slice(2, -2))));
      setPlaceholders(uniquePlaceholders);
      toast({ title: "Template Scanned", description: `Found ${uniquePlaceholders.length} unique placeholders.` });

      // 2. Read Excel/CSV sheets and headers
      setProgress(50);
      const resultsArrayBuffer = await resultsFile[0].arrayBuffer();
      const workbook = XLSX.read(resultsArrayBuffer, { type: 'array' });
      const sheetNames = workbook.SheetNames;
      setSheetNames(sheetNames);
      const firstSheet = sheetNames[0];
      setSelectedSheet(firstSheet);
      
      const firstSheetData = XLSX.utils.sheet_to_json<any>(workbook.Sheets[firstSheet], { header: 1 });
      const headers = firstSheetData[0] || [];
      setColumnHeaders(headers.map(String)); // Ensure headers are strings

      // 3. Auto-map fields
      setProgress(75);
      const autoMapped: Record<string, string> = {};
      uniquePlaceholders.forEach(placeholder => {
        const matchingHeader = headers.find((header: any) => String(header).toLowerCase().replace(/[\s_]/g, '') === String(placeholder).toLowerCase().replace(/[\s_]/g, ''));
        if (matchingHeader) {
          autoMapped[placeholder] = String(matchingHeader);
        }
      });
      setMappedFields(autoMapped);
      setProgress(100);
      setStep(2);
    } catch (error) {
        console.error("File processing error:", error);
        toast({ variant: "destructive", title: "File Read Error", description: "Could not process one or both files."});
    } finally {
        setProcessing(false);
    }
  };

  useEffect(() => {
      if(selectedSheet && sheetNames.length > 0) {
          const { resultsFile } = form.getValues();
          if(!resultsFile || resultsFile.length === 0) return;

          resultsFile[0].arrayBuffer().then(buffer => {
              const workbook = XLSX.read(buffer, { type: 'array' });
              const sheetData = XLSX.utils.sheet_to_json<any>(workbook.Sheets[selectedSheet], { header: 1 });
              const headers = sheetData[0] || [];
              const stringHeaders = headers.map(String);
              setColumnHeaders(stringHeaders);

              const autoMapped: Record<string, string> = {};
              placeholders.forEach(placeholder => {
                const matchingHeader = stringHeaders.find((header: string) => header.toLowerCase().replace(/[\s_]/g, '') === placeholder.toLowerCase().replace(/[\s_]/g, ''));
                if (matchingHeader) {
                  autoMapped[placeholder] = matchingHeader;
                }
              });
              setMappedFields(autoMapped);
          });
      }
  }, [selectedSheet, sheetNames, form, placeholders]);

  const handleManualMapChange = (placeholder: string, header: string) => {
    setMappedFields(prev => {
      const newMappedFields = { ...prev };
      if (header === '__UNMAPPED__') {
        delete newMappedFields[placeholder];
      } else {
        newMappedFields[placeholder] = header;
      }
      return newMappedFields;
    });
  };

  const onSubmit = async (data: UploadFormData) => {
    if (placeholders.length > 0 && Object.keys(mappedFields).length === 0) {
        toast({ variant: "destructive", title: "Mapping Required", description: "Please map at least one placeholder to a data column."});
        return;
    }

    setProcessing(true);
    toast({ title: "Uploading...", description: "Your files are being uploaded to the cloud." });

    try {
        const templateFile = data.templateFile[0];
        const resultsFile = data.resultsFile[0];
        const selectedClass = allClasses.find(c => c.id === data.classId);

        if (!selectedClass) throw new Error("Selected class not found.");

        const documentId = `${data.session.replace('/', '-')}-${data.term.replace(' ', '-')}-${data.classId}`;
        
        // 1. Upload Template File
        setProgress(25);
        const templatePath = `documents/${documentId}/template-${templateFile.name}`;
        const templateRef = ref(storage, templatePath);
        await uploadBytes(templateRef, templateFile);
        const templateDownloadUrl = await getDownloadURL(templateRef);
        
        // 2. Upload Results File
        setProgress(50);
        const resultsPath = `documents/${documentId}/results-${resultsFile.name}`;
        const resultsRef = ref(storage, resultsPath);
        await uploadBytes(resultsRef, resultsFile);
        const resultsDownloadUrl = await getDownloadURL(resultsRef);
        
        setProgress(75);
        
        // 3. Save metadata to Firestore
        const newDocument: StoredDocument = {
            id: documentId,
            session: data.session,
            term: data.term,
            classId: data.classId,
            className: selectedClass.name,
            templateFile: { name: templateFile.name, dataUrl: templateDownloadUrl },
            resultsFile: { name: resultsFile.name, dataUrl: resultsDownloadUrl },
            uploadedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, "documents", documentId), newDocument);
        
        setProgress(100);
        toast({
          title: "Upload Successful!",
          description: `Documents for ${selectedClass.name} have been stored securely.`,
        });
        resetFlow();

    } catch (error) {
        console.error("Error saving documents to Firebase:", error);
        toast({ variant: "destructive", title: "Upload Error", description: "Could not save the uploaded files to the cloud." });
    } finally {
        setProcessing(false);
    }
  };
  
  const resetFlow = () => {
    form.reset({ session: "", term: "", classId: "" });
    const templateInput = document.getElementById('templateFile') as HTMLInputElement;
    const resultsInput = document.getElementById('resultsFile') as HTMLInputElement;
    if(templateInput) templateInput.value = "";
    if(resultsInput) resultsInput.value = "";

    setStep(1);
    setPlaceholders([]);
    setSheetNames([]);
    setColumnHeaders([]);
    setMappedFields({});
    setSelectedSheet('');
  };

  const getVisibleClasses = () => {
    if (userRole === 'admin') return allClasses;
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
        <h1 className="text-3xl font-bold font-headline text-foreground">Store Result Documents</h1>
        <p className="text-muted-foreground">Upload a DOCX template and an Excel/CSV scoresheet to be stored for a class.</p>
      </header>

      {step === 1 && (
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileSpreadsheet /> Step 1: Upload Files</CardTitle>
            <CardDescription>Select the session, term, and class, then upload the required source files.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFileRead)} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="session" render={({ field }) => ( <FormItem><Label>Session</Label><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Session" /></SelectTrigger></FormControl><SelectContent>{SESSIONS.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="term" render={({ field }) => ( <FormItem><Label>Term</Label><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Term" /></SelectTrigger></FormControl><SelectContent>{TERMS.map(t => ( <SelectItem key={t} value={t}>{t}</SelectItem> ))}</SelectContent></Select><FormMessage /></FormItem>)} />
                  </div>
                   <FormField control={form.control} name="classId" render={({ field }) => (<FormItem><Label>Class</Label><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl><SelectContent>{getVisibleClasses().map(c => (<SelectItem key={c.id} value={c.id}>{c.name} ({c.displayLevel})</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="templateFile" render={({ field: { onChange, value, ...rest } }) => (<FormItem><Label htmlFor="templateFile" className="flex items-center gap-2"><FileType/> Report Card Template (.docx)</Label><FormControl><Input id="templateFile" type="file" accept={ACCEPTED_DOCX_TYPES.join(',')} onChange={(e) => onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="resultsFile" render={({ field: { onChange, value, ...rest } }) => (<FormItem><Label htmlFor="resultsFile" className="flex items-center gap-2"><FileText/> Scoresheet (.xlsx, .csv)</Label><FormControl><Input id="resultsFile" type="file" accept={ACCEPTED_EXCEL_TYPES.join(',')} onChange={(e) => onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>)} />
                {processing && <Progress value={progress} className="w-full" />}
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={processing}>
                  {processing ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin"/> Processing Files...</> : 'Scan Files & Continue'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {step === 2 && (
        <Card className="max-w-4xl mx-auto shadow-xl">
           <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileSpreadsheet /> Step 2: Confirm & Save</CardTitle>
            <CardDescription>The system has scanned your files. Review the extracted placeholders and confirm the upload to save the documents to the cloud.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-md border space-y-2">
                    <h3 className="font-semibold text-lg mb-2">File Scan Summary</h3>
                     {sheetNames.length > 1 && (
                      <div className="flex items-center gap-2">
                          <Label htmlFor="sheetSelect" className="shrink-0">Select Sheet:</Label>
                          <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                              <SelectTrigger id="sheetSelect" className="flex-1">
                                  <SelectValue placeholder="Select a sheet"/>
                              </SelectTrigger>
                              <SelectContent>
                                  {sheetNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                    )}
                    <p>Template Placeholders Found: <span className="font-bold text-primary">{placeholders.length}</span></p>
                    <p>Column Headers Found in '{selectedSheet}': <span className="font-bold text-primary">{columnHeaders.length}</span></p>
                    <p className="text-sm text-muted-foreground mt-2">Map the template placeholders to the corresponding columns from your scoresheet.</p>
                </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                 {placeholders.map(placeholder => (
                   <div key={placeholder} className="flex items-center gap-2">
                     <Badge variant="secondary" className="min-w-[150px] justify-center text-right break-all">{`{{${placeholder}}}`}</Badge>
                     <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0"/>
                     <Select value={mappedFields[placeholder] || "__UNMAPPED__"} onValueChange={(value) => handleManualMapChange(placeholder, value)}>
                       <SelectTrigger className="flex-1"><SelectValue placeholder="Select column..."/></SelectTrigger>
                       <SelectContent>
                         <SelectItem value="__UNMAPPED__">-- Unmapped --</SelectItem>
                         {columnHeaders.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
                       </SelectContent>
                     </Select>
                     {mappedFields[placeholder] && <CheckCircle className="h-5 w-5 text-green-500 shrink-0"/>}
                   </div>
                 ))}
               </div>

                {placeholders.length > 0 && Object.keys(mappedFields).length < placeholders.length && (
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-md text-yellow-800 dark:text-yellow-300 text-sm flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5"/>
                        <span>Warning: For best results, ensure all placeholders are mapped. Unmapped fields will be blank in the final document.</span>
                    </div>
                )}
               
               <div className="flex justify-between mt-6">
                 <Button variant="outline" onClick={resetFlow}>Back</Button>
                 <Button onClick={form.handleSubmit(onSubmit)} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={processing}>
                   {processing ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : <><UploadCloud className="mr-2 h-4 w-4" /> Save Documents to Cloud</>}
                 </Button>
               </div>
                {processing && <Progress value={progress} className="w-full mt-4" />}
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    