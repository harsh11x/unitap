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
import { Plus, MoreHorizontal, Pencil, Trash2, Search, Store, DollarSign, TrendingUp } from "lucide-react"

interface Shop {
  id: string
  name: string
  owner: string
  email: string
  location: string
  status: "active" | "pending" | "closed"
  totalSales: number
  registeredDate: string
}

const initialShops: Shop[] = [
  { id: "SHOP-001", name: "Campus Cafe", owner: "John Smith", email: "john@campuscafe.com", location: "Building A", status: "active", totalSales: 15420.50, registeredDate: "2023-06-15" },
  { id: "SHOP-002", name: "Book Corner", owner: "Mary Johnson", email: "mary@bookcorner.com", location: "Library Wing", status: "active", totalSales: 8750.00, registeredDate: "2023-07-20" },
  { id: "SHOP-003", name: "Tech Hub", owner: "David Lee", email: "david@techhub.com", location: "Building C", status: "pending", totalSales: 0.00, registeredDate: "2024-01-10" },
  { id: "SHOP-004", name: "Fresh Bites", owner: "Lisa Chen", email: "lisa@freshbites.com", location: "Food Court", status: "active", totalSales: 22100.75, registeredDate: "2023-03-01" },
  { id: "SHOP-005", name: "Print Station", owner: "Tom Wilson", email: "tom@printstation.com", location: "Building B", status: "closed", totalSales: 3200.00, registeredDate: "2022-09-15" },
]

export function ShopsManagement() {
  const [shops, setShops] = React.useState<Shop[]>(initialShops)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [editingShop, setEditingShop] = React.useState<Shop | null>(null)
  const [formData, setFormData] = React.useState({
    name: "",
    owner: "",
    email: "",
    location: "",
  })

  const filteredShops = shops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddShop = () => {
    const newShop: Shop = {
      id: `SHOP-${String(shops.length + 1).padStart(3, "0")}`,
      name: formData.name,
      owner: formData.owner,
      email: formData.email,
      location: formData.location,
      status: "pending",
      totalSales: 0,
      registeredDate: new Date().toISOString().split("T")[0],
    }
    setShops([...shops, newShop])
    setFormData({ name: "", owner: "", email: "", location: "" })
    setIsAddDialogOpen(false)
  }

  const handleEditShop = () => {
    if (!editingShop) return
    setShops(
      shops.map((s) =>
        s.id === editingShop.id
          ? { ...s, name: formData.name, owner: formData.owner, email: formData.email, location: formData.location }
          : s
      )
    )
    setEditingShop(null)
    setFormData({ name: "", owner: "", email: "", location: "" })
  }

  const handleDeleteShop = (id: string) => {
    setShops(shops.filter((s) => s.id !== id))
  }

  const openEditDialog = (shop: Shop) => {
    setEditingShop(shop)
    setFormData({ name: shop.name, owner: shop.owner, email: shop.email, location: shop.location })
  }

  const getStatusBadge = (status: Shop["status"]) => {
    const styles = {
      active: "bg-success/20 text-success",
      pending: "bg-warning/20 text-warning",
      closed: "bg-muted text-muted-foreground",
    }
    return (
      <Badge variant="secondary" className={styles[status]}>
        {status}
      </Badge>
    )
  }

  const totalSales = shops.reduce((acc, s) => acc + s.totalSales, 0)
  const activeShops = shops.filter((s) => s.status === "active").length

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Shops</p>
                <p className="text-2xl font-bold">{shops.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Shops</p>
                <p className="text-2xl font-bold">{activeShops}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">${totalSales.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shop List */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Shop Directory</CardTitle>
              <CardDescription>Register and manage campus shops</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 pl-9 bg-secondary border-border"
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Register Shop
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Register New Shop</DialogTitle>
                    <DialogDescription>
                      Enter shop details below
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="shop-name">Shop Name</Label>
                      <Input
                        id="shop-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner">Owner Name</Label>
                      <Input
                        id="owner"
                        value={formData.owner}
                        onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shop-email">Email</Label>
                      <Input
                        id="shop-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddShop}>Register</Button>
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
                <TableHead>Shop</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{shop.name}</p>
                      <p className="text-xs text-muted-foreground">{shop.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{shop.owner}</p>
                      <p className="text-xs text-muted-foreground">{shop.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {shop.location}
                  </TableCell>
                  <TableCell className="font-medium">
                    ${shop.totalSales.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(shop.status)}</TableCell>
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
                            openEditDialog(shop)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => handleDeleteShop(shop.id)}
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

      {/* Edit Dialog */}
      <Dialog open={!!editingShop} onOpenChange={(open) => !open && setEditingShop(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shop</DialogTitle>
            <DialogDescription>
              Update shop information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-shop-name">Shop Name</Label>
              <Input
                id="edit-shop-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-owner">Owner Name</Label>
              <Input
                id="edit-owner"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-shop-email">Email</Label>
              <Input
                id="edit-shop-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingShop(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditShop}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
