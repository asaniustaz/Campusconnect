
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FolderKanban, FileText, FileSpreadsheet, Trash2, AlertTriangle, RefreshCw } from "lucide-react";
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
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";


export default function DocumentsPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<Student | StaffMember | null>(null);
  const [allDocuments, setAllDocuments] = useState<StoredDocument[]>([]);
  const [visibleDocuments, setVisibleDocuments] = useState<StoredDocument[]>([]);
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const userId = localStorage.getItem("userId");
    setUserRole(role);

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Load classes and users from localStorage
        const storedClassesStr = localStorage.getItem('schoolClasses') || '[]';
        const currentClasses: SchoolClass[] = JSON.parse(storedClassesStr);
        setAllClasses(currentClasses);

        const storedUsersStr = localStorage.getItem('managedUsers') || '[]';
        const allUsers: (Student | StaffMember)[] = JSON.parse(storedUsersStr);
        const foundUser = userId ? allUsers.find(u => u.id === userId) : null;
        setCurrentUser(foundUser || null);
        
        // Load documents from Firestore
        const querySnapshot = await getDocs(collection(db, "documents"));
        const allDocs = querySnapshot.docs.map(doc => doc.data() as StoredDocument);
        setAllDocuments(allDocs);

        // Determine visible documents based on user role
        if (!foundUser) {
            setVisibleDocuments([]);
            setIsLoading(false);
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
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch documents from the cloud." });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = (dataUrl: string, fileName: string) => {
    // Firebase Storage download URLs are public by default and can be opened directly
    window.open(dataUrl, '_blank');
  };
  
  const handleDelete = async (documentId: string) => {
    const docToDelete = allDocuments.find(doc => doc.id === documentId);
    if (!docToDelete) return;

    try {
        toast({ title: "Deleting...", description: "Removing document and files from the cloud." });

        // Delete Firestore document
        await deleteDoc(doc(db, "documents", documentId));

        // Delete files from Storage
        const templateRef = ref(storage, `documents/${documentId}/template-${docToDelete.templateFile.name}`);
        const resultsRef = ref(storage, `documents/${documentId}/results-${docToDelete.resultsFile.name}`);
        await deleteObject(templateRef);
        await deleteObject(resultsRef);

        const updatedDocuments = allDocuments.filter(doc => doc.id !== documentId);
        setAllDocuments(updatedDocuments);
        // Re-filter visible documents
        setVisibleDocuments(prev => prev.filter(doc => doc.id !== documentId));
        
        toast({ title: "Document Deleted", description: "The document set has been removed." });
    } catch (error) {
        console.error("Error deleting document from Firebase:", error);
        toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete the document." });
    }
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
          {isLoading ? (
             <div className="flex items-center justify-center py-10">
                <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                <p className="ml-4 text-muted-foreground">Loading documents from the cloud...</p>
             </div>
          ) : visibleDocuments.length > 0 ? (
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
                                            This action will permanently delete this document set (template and scoresheet) from the cloud. It cannot be undone.
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
