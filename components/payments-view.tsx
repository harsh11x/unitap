"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle
} from "lucide-react"

const transactions = [
  { id: "TXN-001", student: "Alex Johnson", shop: "Campus Cafe", amount: 25.50, status: "completed", date: "2024-01-15 14:30" },
  { id: "TXN-002", student: "Sarah Williams", shop: "Book Corner", amount: 89.99, status: "completed", date: "2024-01-15 13:15" },
  { id: "TXN-003", student: "Michael Brown", shop: "Tech Hub", amount: 150.00, status: "pending", date: "2024-01-15 12:00" },
  { id: "TXN-004", student: "Emily Davis", shop: "Fresh Bites", amount: 18.75, status: "completed", date: "2024-01-15 11:45" },
  { id: "TXN-005", student: "James Wilson", shop: "Print Station", amount: 5.00, status: "completed", date: "2024-01-15 10:30" },
  { id: "TXN-006", student: "Jessica Taylor", shop: "Campus Cafe", amount: 32.00, status: "failed", date: "2024-01-15 09:15" },
  { id: "TXN-007", student: "Daniel Martinez", shop: "Book Corner", amount: 45.00, status: "completed", date: "2024-01-14 16:30" },
  { id: "TXN-008", student: "Olivia Anderson", shop: "Fresh Bites", amount: 12.50, status: "completed", date: "2024-01-14 15:00" },
]

export function PaymentsView() {
  const completedTransactions = transactions.filter(t => t.status === "completed")
  const pendingTransactions = transactions.filter(t => t.status === "pending")
  const totalAmount = completedTransactions.reduce((acc, t) => acc + t.amount, 0)

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-success/20 text-success",
      pending: "bg-warning/20 text-warning",
      failed: "bg-destructive/20 text-destructive",
    }
    return (
      <Badge variant="secondary" className={styles[status]}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
                <p className="text-xs text-success flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +8 today
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingTransactions.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting confirmation
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">87.5%</p>
                <p className="text-xs text-destructive flex items-center mt-1">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  -2.1% from last week
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TransactionTable transactions={transactions} getStatusBadge={getStatusBadge} />
            </TabsContent>
            <TabsContent value="completed">
              <TransactionTable transactions={transactions.filter(t => t.status === "completed")} getStatusBadge={getStatusBadge} />
            </TabsContent>
            <TabsContent value="pending">
              <TransactionTable transactions={transactions.filter(t => t.status === "pending")} getStatusBadge={getStatusBadge} />
            </TabsContent>
            <TabsContent value="failed">
              <TransactionTable transactions={transactions.filter(t => t.status === "failed")} getStatusBadge={getStatusBadge} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface Transaction {
  id: string
  student: string
  shop: string
  amount: number
  status: string
  date: string
}

function TransactionTable({ 
  transactions, 
  getStatusBadge 
}: { 
  transactions: Transaction[]
  getStatusBadge: (status: string) => React.ReactNode 
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Transaction ID</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Shop</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
            <TableCell>{transaction.student}</TableCell>
            <TableCell className="text-muted-foreground">{transaction.shop}</TableCell>
            <TableCell className="font-medium">${transaction.amount.toFixed(2)}</TableCell>
            <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
            <TableCell>{getStatusBadge(transaction.status)}</TableCell>
          </TableRow>
        ))}
        {transactions.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No transactions found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
