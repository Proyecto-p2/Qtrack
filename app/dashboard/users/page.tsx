"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Users, UserCheck, UserX, Edit, Eye } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  role: "admin" | "agile_coach" | "member" | "viewer"
  cellName?: string
  knowledgeLine?: string
  seniority?: "junior" | "semi_senior" | "senior" | "expert"
  isActive: boolean
  lastLogin: string
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const users: User[] = [
    {
      id: 1,
      name: "Ana García",
      email: "ana.garcia@company.com",
      role: "agile_coach",
      cellName: "Célula Frontend Alpha",
      isActive: true,
      lastLogin: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      name: "Luis Martín",
      email: "luis.martin@company.com",
      role: "agile_coach",
      cellName: "Célula Backend Beta",
      isActive: true,
      lastLogin: "2024-01-15T09:15:00Z",
    },
    {
      id: 3,
      name: "Carlos López",
      email: "carlos.lopez@company.com",
      role: "member",
      cellName: "Célula Frontend Alpha",
      knowledgeLine: "Frontend Development",
      seniority: "senior",
      isActive: true,
      lastLogin: "2024-01-15T11:45:00Z",
    },
    {
      id: 4,
      name: "María Rodríguez",
      email: "maria.rodriguez@company.com",
      role: "member",
      cellName: "Célula Backend Beta",
      knowledgeLine: "Backend Development",
      seniority: "expert",
      isActive: true,
      lastLogin: "2024-01-14T16:20:00Z",
    },
    {
      id: 5,
      name: "Pedro Sánchez",
      email: "pedro.sanchez@company.com",
      role: "member",
      cellName: "Célula DevOps Gamma",
      knowledgeLine: "DevOps",
      seniority: "senior",
      isActive: false,
      lastLogin: "2024-01-10T14:30:00Z",
    },
    {
      id: 6,
      name: "Laura Fernández",
      email: "laura.fernandez@company.com",
      role: "member",
      cellName: "Célula QA Delta",
      knowledgeLine: "QA Testing",
      seniority: "semi_senior",
      isActive: true,
      lastLogin: "2024-01-15T08:00:00Z",
    },
    {
      id: 7,
      name: "Roberto Silva",
      email: "roberto.silva@company.com",
      role: "viewer",
      isActive: true,
      lastLogin: "2024-01-15T12:00:00Z",
    },
    {
      id: 8,
      name: "Carmen Ruiz",
      email: "carmen.ruiz@company.com",
      role: "admin",
      isActive: true,
      lastLogin: "2024-01-15T07:30:00Z",
    },
  ]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.cellName && user.cellName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "agile_coach":
        return "default"
      case "member":
        return "secondary"
      case "viewer":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "agile_coach":
        return "Agile Coach"
      case "member":
        return "Miembro"
      case "viewer":
        return "Consulta"
      default:
        return role
    }
  }

  const getSeniorityText = (seniority?: string) => {
    switch (seniority) {
      case "junior":
        return "Junior"
      case "semi_senior":
        return "Semi Senior"
      case "senior":
        return "Senior"
      case "expert":
        return "Expert"
      default:
        return "-"
    }
  }

  const activeUsers = users.filter((u) => u.isActive).length
  const totalUsers = users.length
  const adminUsers = users.filter((u) => u.role === "admin").length
  const coachUsers = users.filter((u) => u.role === "agile_coach").length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>Agrega un nuevo usuario al sistema con sus permisos y asignaciones.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input id="name" placeholder="Ej: Juan Pérez" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" placeholder="juan.perez@company.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="agile_coach">Agile Coach</SelectItem>
                      <SelectItem value="member">Miembro</SelectItem>
                      <SelectItem value="viewer">Consulta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cell">Célula (opcional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar célula" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Célula Frontend Alpha</SelectItem>
                      <SelectItem value="2">Célula Backend Beta</SelectItem>
                      <SelectItem value="3">Célula DevOps Gamma</SelectItem>
                      <SelectItem value="4">Célula QA Delta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="knowledge">Línea de Conocimiento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar línea" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend">Frontend Development</SelectItem>
                      <SelectItem value="backend">Backend Development</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                      <SelectItem value="qa">QA Testing</SelectItem>
                      <SelectItem value="ux">UX/UI Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seniority">Seniority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="semi_senior">Semi Senior</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Cancelar</Button>
                <Button>Crear Usuario</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">{activeUsers} activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">{Math.round((activeUsers / totalUsers) * 100)}% del total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <UserCheck className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">Con permisos completos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agile Coaches</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coachUsers}</div>
            <p className="text-xs text-muted-foreground">Líderes de células</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o célula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="agile_coach">Agile Coach</SelectItem>
                <SelectItem value="member">Miembro</SelectItem>
                <SelectItem value="viewer">Consulta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>{filteredUsers.length} usuarios encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Célula</TableHead>
                <TableHead>Línea de Conocimiento</TableHead>
                <TableHead>Seniority</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último Acceso</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleColor(user.role) as any}>{getRoleText(user.role)}</Badge>
                  </TableCell>
                  <TableCell>{user.cellName || "-"}</TableCell>
                  <TableCell>{user.knowledgeLine || "-"}</TableCell>
                  <TableCell>{getSeniorityText(user.seniority)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.isActive ? (
                        <UserCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <UserX className="h-4 w-4 text-red-500" />
                      )}
                      <span className={user.isActive ? "text-green-600" : "text-red-600"}>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(user.lastLogin).toLocaleDateString("es-ES")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
