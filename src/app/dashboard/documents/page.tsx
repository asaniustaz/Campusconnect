
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FolderKanban, FileText, FileSpreadsheet, Trash2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { UserRole, SchoolClass, Student, StaffMember, StoredDocument } from "@/lib/constants";
import { mockSchoolClasses as defaultClasses } from "@/lib/constants";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


export default function DocumentsPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<Student | StaffMember | null>(null);
  const [allDocuments, setAllDocuments] = useState<StoredDocument[]>([]);
  const [visibleDocuments, setVisibleDocuments] = useState<StoredDocument[]>([]);
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const userId = localStorage.getItem("userId");
    setUserRole(role);

    // Load all necessary data from localStorage
    const storedDocsStr = localStorage.getItem('resultDocuments') || '[]';
    const allDocs: StoredDocument[] = JSON.parse(storedDocsStr);
    setAllDocuments(allDocs);

    const storedClassesStr = localStorage.getItem('schoolClasses') || '[]';
    const currentClasses: SchoolClass[] = JSON.parse(storedClassesStr);
    setAllClasses(currentClasses);

    const storedUsersStr = localStorage.getItem('managedUsers') || '[]';
    const allUsers: (Student | StaffMember)[] = JSON.parse(storedUsersStr);
    const foundUser = userId ? allUsers.find(u => u.id === userId) : null;
    setCurrentUser(foundUser || null);

    // Determine visible documents based on user role
    if (!foundUser) {
        setVisibleDocuments([]);
        return;
    }
    
    let userVisibleDocs: StoredDocument[] = [];
    switch (role) {
        case 'admin':
            userVisibleDocs = allDocs;
            break;
        case 'head_of_section':
            const hos = foundUser as StaffMember;
            if (hos.section) {
                const classIdsInSection = currentClasses.filter(c => c.section === hos.section).map(c => c.id);
                userVisibleDocs = allDocs.filter(doc => classIdsInSection.includes(doc.classId));
            }
            break;
        case 'staff':
            const staff = foundUser as StaffMember;
            if (staff.assignedClasses && staff.assignedClasses.length > 0) {
                userVisibleDocs = allDocs.filter(doc => staff.assignedClasses!.includes(doc.classId));
            }
            break;
        case 'student':
            const student = foundUser as Student;
            if (student.classId) {
                userVisibleDocs = allDocs.filter(doc => doc.classId === student.classId);
            }
            break;
    }
    setVisibleDocuments(userVisibleDocs.sort((a,b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
  }, []);

  const handleDownload = (dataUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDelete = (documentId: string) => {
    const updatedDocuments = allDocuments.filter(doc => doc.id !== documentId);
    localStorage.setItem('resultDocuments', JSON.stringify(updatedDocuments));
    setAllDocuments(updatedDocuments);
    setVisibleDocuments(updatedDocuments.filter(doc => visibleDocuments.some(v => v.id === doc.id)));
    toast({ title: "Document Deleted", description: "The document set has been removed." });
  };


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Documents Center</h1>
        <p className="text-muted-foreground">Access and download class-related documents like result templates and scoresheets.</p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FolderKanban /> Available Documents</CardTitle>
          <CardDescription>
            Showing documents you are permitted to view. Admins can see all documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {visibleDocuments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Session & Term</TableHead>
                  <TableHead>Uploaded On</TableHead>
                  <TableHead className="text-center">Downloads</TableHead>
                  {userRole === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell><Badge variant="secondary">{doc.className}</Badge></TableCell>
                    <TableCell>{doc.session} - {doc.term}</TableCell>
                    <TableCell>{format(new Date(doc.uploadedAt), "PPP p")}</TableCell>
                    <TableCell className="text-center flex items-center justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDownload(doc.templateFile.dataUrl, doc.templateFile.name)}>
                            <FileText className="mr-2 h-4 w-4" /> Template
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(doc.resultsFile.dataUrl, doc.resultsFile.name)}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Scores
                        </Button>
                    </TableCell>
                    {userRole === 'admin' && (
                        <TableCell className="text-right">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action will permanently delete this document set (template and scoresheet). It cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(doc.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Documents Found</h3>
                <p className="text-muted-foreground mt-1">There are no documents available for you to view at this time.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
