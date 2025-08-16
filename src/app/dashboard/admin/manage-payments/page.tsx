
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { UserRole, Student, PaymentRecord, PaymentStatus } from "@/lib/constants";
import { TERMS, combineName } from "@/lib/constants";
import { DollarSign, PlusCircle, Edit, Filter, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const paymentSchema = z.object({
  studentId: z.string().min(1, "Please select a student."),
  description: z.string().min(3, "Description is required."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  term: z.string().min(1, "Please select a term."),
  status: z.custom<PaymentStatus>((val) => ["Paid", "Pending", "Failed"].includes(val as PaymentStatus), "Invalid status"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function ManagePaymentsPage() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [allPayments, setAllPayments] = useState<PaymentRecord[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);

  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    setUserRole(role);

    if (typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem('managedUsers');
      if (storedUsers) {
        try {
          const allUsers: Student[] = JSON.parse(storedUsers);
          setAllStudents(allUsers.filter(u => u.role === 'student'));
        } catch (e) { console.error("Failed to parse students", e); }
      }

      const storedPayments = localStorage.getItem('schoolPayments');
      if (storedPayments) {
        try {
          const payments: PaymentRecord[] = JSON.parse(storedPayments);
          setAllPayments(payments);
          setFilteredPayments(payments);
        } catch (e) { console.error("Failed to parse payments", e); }
      }
    }
  }, []);

  useEffect(() => {
    let data = [...allPayments];
    if (studentFilter !== "all") {
      data = data.filter(p => p.studentId === studentFilter);
    }
    if (statusFilter !== "all") {
      data = data.filter(p => p.status === statusFilter);
    }
    setFilteredPayments(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [studentFilter, statusFilter, allPayments]);

  const savePaymentsToLocalStorage = (payments: PaymentRecord[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('schoolPayments', JSON.stringify(payments));
      setAllPayments(payments);
    }
  };

  const handleOpenDialog = (payment: PaymentRecord | null = null) => {
    setEditingPayment(payment);
    if (payment) {
      form.reset({
        studentId: payment.studentId,
        description: payment.description,
        amount: payment.amount,
        term: payment.term,
        status: payment.status,
      });
    } else {
      form.reset({ studentId: '', description: '', amount: 0, term: '', status: 'Pending' });
    }
    setIsDialogOpen(true);
  };

  const onSubmit: SubmitHandler<PaymentFormData> = (data) => {
    const student = allStudents.find(s => s.id === data.studentId);
    const studentName = student ? combineName(student) : 'Unknown Student';
    let updatedPayments = [...allPayments];

    if (editingPayment) {
      const updatedRecord: PaymentRecord = {
        ...editingPayment,
        studentId: data.studentId,
        studentName,
        description: data.description,
        amount: data.amount,
        term: data.term,
        status: data.status,
      };
      updatedPayments = allPayments.map(p => p.id === editingPayment.id ? updatedRecord : p);
      toast({ title: "Payment Updated", description: `Payment record for ${studentName} updated.` });
    } else {
      const newRecord: PaymentRecord = {
        id: `pay-${Date.now()}`,
        date: new Date().toISOString(),
        studentId: data.studentId,
        studentName,
        description: data.description,
        amount: data.amount,
        term: data.term,
        status: data.status,
      };
      updatedPayments.push(newRecord);
      toast({ title: "Payment Added", description: `New payment record for ${studentName} created.` });
    }
    
    savePaymentsToLocalStorage(updatedPayments);
    setIsDialogOpen(false);
    setEditingPayment(null);
  };

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="text-2xl text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription>This page is only accessible to admin members.</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Manage Payments</h1>
          <p className="text-muted-foreground">View, add, and update student payment records.</p>
        </div>
        <Button onClick={() => handleOpenDialog(null)} className="mt-2 sm:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Payment
        </Button>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter /> Filters</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Select value={studentFilter} onValueChange={setStudentFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by Student" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {allStudents.map(student => (
                  <SelectItem key={student.id} value={student.id}>{combineName(student)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{format(new Date(payment.date), "PPP")}</TableCell>
                  <TableCell>{payment.studentName}</TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell>NGN {payment.amount.toLocaleString()}</TableCell>
                  <TableCell>
                     <Badge 
                        variant={payment.status === "Paid" ? "default" : payment.status === "Pending" ? "secondary" : "destructive"}
                        className={`capitalize ${payment.status === "Paid" ? 'bg-green-500 hover:bg-green-600' : payment.status === "Pending" ? 'bg-orange-400 hover:bg-orange-500' : ''}`}
                      >
                         {payment.status === "Paid" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                         {payment.status === "Pending" && <DollarSign className="mr-1 h-3 w-3" />}
                         {payment.status === "Failed" && <XCircle className="mr-1 h-3 w-3" />}
                        {payment.status}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(payment)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">No payment records match filters.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPayment ? "Edit Payment" : "Add New Payment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="studentId"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-1">
                  <Label>Student</Label>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!editingPayment}>
                    <SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger>
                    <SelectContent>
                      {allStudents.map(s => <SelectItem key={s.id} value={s.id}>{combineName(s)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.studentId && <p className="text-sm text-destructive">{form.formState.errors.studentId.message}</p>}
                </div>
              )}
            />
            <div className="space-y-1">
              <Label>Description</Label>
              <Input {...form.register("description")} />
              {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Amount (NGN)</Label>
              <Input type="number" {...form.register("amount")} />
              {form.formState.errors.amount && <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>}
            </div>
             <Controller
              name="term"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-1">
                  <Label>Term</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                    <SelectContent>
                      {TERMS.map(term => <SelectItem key={term} value={term}>{term}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.term && <p className="text-sm text-destructive">{form.formState.errors.term.message}</p>}
                </div>
              )}
            />
             <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>}
                </div>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {editingPayment ? "Save Changes" : "Create Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
