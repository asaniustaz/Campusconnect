
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { UserRole, PaymentRecord } from "@/lib/constants";

export default function PaymentsPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole;
    const name = localStorage.getItem("userName");
    const id = localStorage.getItem("userId");
    setUserRole(role);
    setUserName(name);
    setUserId(id);

    if (id && role === 'student' && typeof window !== 'undefined') {
      const storedPaymentsStr = localStorage.getItem('schoolPayments');
      if (storedPaymentsStr) {
        try {
          const allPayments: PaymentRecord[] = JSON.parse(storedPaymentsStr);
          const studentPayments = allPayments.filter(p => p.studentId === id);
          setPaymentHistory(studentPayments);
        } catch (e) {
          console.error("Failed to parse payments from localStorage", e);
          setPaymentHistory([]);
        }
      }
    }
  }, []);

  if (userRole !== 'student') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md p-8 text-center">
          <CardTitle className="text-2xl text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription>This page is only accessible to students.</CardDescription>
        </Card>
      </div>
    );
  }
  
  if (!userName || !userId) {
     return <div className="text-center p-10">Loading payment information...</div>;
  }

  const totalPaid = paymentHistory.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = paymentHistory.filter(p => p.status === "Pending").reduce((sum, p) => sum + p.amount, 0);

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
            <AlertTriangle className="h-5 w-5 text-orange-500" />
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
          {paymentHistory.length > 0 ? (
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
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
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
          ) : (
            <p className="text-muted-foreground text-center py-10">No payment records found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
