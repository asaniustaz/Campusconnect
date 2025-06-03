
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle2, XCircle } from "lucide-react";
import type { UserRole } from "@/lib/constants";

interface PaymentRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
  term: string;
}

const mockPaymentHistory: PaymentRecord[] = [
  { id: "pay001", date: "2023-09-05", description: "First Term School Fees", amount: 50000, status: "Paid", term: "First Term" },
  { id: "pay002", date: "2023-09-10", description: "Textbook Fee", amount: 5000, status: "Paid", term: "First Term" },
  { id: "pay003", date: "2024-01-15", description: "Second Term School Fees", amount: 50000, status: "Paid", term: "Second Term" },
  { id: "pay004", date: "2024-01-20", description: "Excursion Fee", amount: 7500, status: "Pending", term: "Second Term" },
  { id: "pay005", date: "2024-05-03", description: "Third Term School Fees", amount: 50000, status: "Paid", term: "Third Term" },
];

export default function PaymentsPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const name = localStorage.getItem("userName");
    setUserRole(role);
    setUserName(name);
  }, []);

  if (userRole !== 'student') {
    // This page is intended for students. Admins/Staff might have a different view or this page might be restricted.
    // For now, let's restrict it to students.
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="text-2xl text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription>This page is only accessible to students.</CardDescription>
        </Card>
      </div>
    );
  }
  
  if (!userName) {
     return <div className="text-center p-10">Loading payment information...</div>;
  }

  // In a real app, filter payments for the logged-in student
  const studentPayments = mockPaymentHistory; 
  const totalPaid = studentPayments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = studentPayments.filter(p => p.status === "Pending").reduce((sum, p) => sum + p.amount, 0);


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Payment History</h1>
        <p className="text-muted-foreground">View your fee payments and transaction records for {userName}.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NGN {totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <DollarSign className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NGN {totalPending.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Transaction Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount (NGN)</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.term}</TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell className="text-right">{payment.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={payment.status === "Paid" ? "default" : payment.status === "Pending" ? "secondary" : "destructive"}
                      className={`capitalize ${payment.status === "Paid" ? 'bg-green-500 hover:bg-green-600 text-white' : payment.status === "Pending" ? 'bg-orange-400 hover:bg-orange-500 text-white' : ''}`}
                    >
                       {payment.status === "Paid" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                       {payment.status === "Pending" && <DollarSign className="mr-1 h-3 w-3" />}
                       {payment.status === "Failed" && <XCircle className="mr-1 h-3 w-3" />}
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

