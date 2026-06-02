"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Trash2, Search, Shield, CheckCircle, XCircle, Users, Store } from "lucide-react"

interface HeadOwner {
  id: string
  name: string
  email: string
  phone: string
  department: string
  role: "head_owner" | "regional_manager" | "director"
  status: "active" | "inactive"
  shopsManaged: number
  studentsOverseen: number
  joinedDate: string
}

const initialHeadOwners: HeadOwner[] = [
  { id: "HO-001", name: "Robert Anderson", email: "robert@eduadmin.com", phone: "+1 555-1001", department: "Central Campus", role: "director", status: "active", shopsManaged: 12, studentsOverseen: 450, joinedDate: "2022-01-15" },
  { id: "HO-002", name: "Jennifer Martinez", email: "jennifer@eduadmin.com", phone: "+1 555-1002", department: "East Wing", role: "head_owner", status: "active", shopsManaged: 5, studentsOverseen: 180, joinedDate: "2022-06-20" },
  { id: "HO-003", name: "William Thompson", email: "william@eduadmin.com", phone: "+1 555-1003", department: "West Campus", role: "regional_manager", status: "active", shopsManaged: 8, studentsOverseen: 320, joinedDate: "2023-02-10" },
  { id: "HO-004", name: "Elizabeth Garcia", email: "elizabeth@eduadmin.com", phone: "+1 555-1004", department: "North Annex", role: "head_owner", status: "inactive", shopsManaged: 3, studentsOverseen: 95, joinedDate: "2021-09-01" },
]

const pendingApprovals = [
  { id: "PA-001", type: "shop", name: "Tech Hub", requestedBy: "David Lee", date: "2024-01-10" },
  { id: "PA-002", type: "shop", name: "Snack Shack", requestedBy: "Emma White", date: "2024-01-12" },
  { id: "PA-003", type: "student", name: "New Registration Batch", requestedBy: "Admin", date: "2024-01-14" },
]

export function HeadOwnersManagement() {
  const [headOwners, setHeadOwners] = React.useState<HeadOwner[]>(initialHeadOwners)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [editingOwner, setEditingOwner] = React.useState<HeadOwner | null>(null)
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    department: "",
  })

  const filteredOwners = headOwners.filter(
    (owner) =>
      owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddOwner = () => {
    const newOwner: HeadOwner = {
      id: `HO-${String(headOwners.length + 1).padStart(3, "0")}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      role: "head_owner",
      status: "active",
      shopsManaged: 0,
      studentsOverseen: 0,
      joinedDate: new Date().toISOString().split("T")[0],
    }
    setHeadOwners([...headOwners, newOwner])
    setFormData({ name: "", email: "", phone: "", department: "" })
    setIsAddDialogOpen(false)
  }

  const handleEditOwner = () => {
    if (!editingOwner) return
    setHeadOwners(
      headOwners.map((o) =>
        o.id === editingOwner.id
          ? { ...o, name: formData.name, email: formData.email, phone: formData.phone, department: formData.department }
          : o
      )
    )
    setEditingOwner(null)
    setFormData({ name: "", email: "", phone: "", department: "" })
  }

  const handleDeleteOwner = (id: string) => {
    setHeadOwners(headOwners.filter((o) => o.id !== id))
  }

  const openEditDialog = (owner: HeadOwner) => {
    setEditingOwner(owner)
    setFormData({ name: owner.name, email: owner.email, phone: owner.phone, department: owner.department })
  }

  const getRoleBadge = (role: HeadOwner["role"]) => {
    const styles = {
      director: "bg-primary/20 text-primary",
      regional_manager: "bg-info/20 text-info",
      head_owner: "bg-success/20 text-success",
    }
    const labels = {
      director: "Director",
      regional_manager: "Regional Manager",
      head_owner: "Head Owner",
    }
    return (
      <Badge variant="secondary" className={styles[role]}>
        {labels[role]}
      </Badge>
    )
  }

  const totalShops = headOwners.reduce((acc, o) => acc + o.shopsManaged, 0)
  const totalStudents = headOwners.reduce((acc, o) => acc + o.studentsOverseen, 0)

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Head Owners</p>
                <p className="text-2xl font-bold">{headOwners.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shops Managed</p>
                <p className="text-2xl font-bold">{totalShops}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
                <Store className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Students Overseen</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{pendingApprovals.length}</p>
              </div>
              <Badge variant="secondary" className="bg-warning/20 text-warning">
                Action Required
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Approvals */}
        <Card className="border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Pending Approvals</CardTitle>
            <CardDescription>Review and approve requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium text-sm">{approval.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {approval.type === "shop" ? "Shop Registration" : "Student Batch"} • {approval.date}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-success hover:text-success hover:bg-success/10">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Head Owner List */}
        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Head Owner Directory</CardTitle>
                <CardDescription>Manage administrative personnel</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-48 pl-9 bg-secondary border-border"
                  />
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Head Owner</DialogTitle>
                      <DialogDescription>
                        Enter head owner details
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="ho-name">Full Name</Label>
                        <Input
                          id="ho-name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ho-email">Email</Label>
                        <Input
                          id="ho-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ho-phone">Phone</Label>
                        <Input
                          id="ho-phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ho-dept">Department</Label>
                        <Input
                          id="ho-dept"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="bg-secondary border-border"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddOwner}>Add</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Head Owner</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Oversight</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOwners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{owner.name}</p>
                        <p className="text-xs text-muted-foreground">{owner.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {owner.department}
                    </TableCell>
                    <TableCell>{getRoleBadge(owner.role)}</TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <span className="text-muted-foreground">{owner.shopsManaged} shops</span>
                        <span className="mx-1">•</span>
                        <span className="text-muted-foreground">{owner.studentsOverseen} students</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault()
                              openEditDialog(owner)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={() => handleDeleteOwner(owner.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingOwner} onOpenChange={(open) => !open && setEditingOwner(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Head Owner</DialogTitle>
            <DialogDescription>
              Update head owner information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ho-name">Full Name</Label>
              <Input
                id="edit-ho-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ho-email">Email</Label>
              <Input
                id="edit-ho-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ho-phone">Phone</Label>
              <Input
                id="edit-ho-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ho-dept">Department</Label>
              <Input
                id="edit-ho-dept"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOwner(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditOwner}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
