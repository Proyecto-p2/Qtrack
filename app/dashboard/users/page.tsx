"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  Search, 
  Users, 
  UserCheck, 
  UserX, 
  Edit, 
  Trash2,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react"

interface User {
  id: number
  usuario: string
  correo: string
  nombre: string
  rol: "admin" | "usuario" | "editor" | "agile_coach"
  activo: boolean
  creado_en: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Estados para el formulario de usuario
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    usuario: "",
    correo: "",
    nombre: "",
    rol: "usuario" as "admin" | "usuario" | "editor" | "agile_coach",
    activo: true,
    contraseña: ""
  })

  // Verificar permisos de admin
  useEffect(() => {
    if (status === "loading") return
    
    if (!session?.user || (session.user as any)?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    
    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)
      } else {
        setError(data.message || "Error al cargar usuarios")
      }
    } catch (error) {
      setError("Error de conexión")
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      usuario: "",
      correo: "",
      nombre: "",
      rol: "usuario",
      activo: true,
      contraseña: ""
    })
    setIsEditing(false)
    setEditingUser(null)
    setShowPassword(false)
    setError("")
    setSuccess("")
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (user: User) => {
    setFormData({
      usuario: user.usuario,
      correo: user.correo,
      nombre: user.nombre,
      rol: user.rol,
      activo: user.activo,
      contraseña: "" // Siempre vacío para edición
    })
    setEditingUser(user)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    // Validación básica
    if (!formData.usuario || !formData.correo || !formData.nombre || !formData.rol) {
      setError("Todos los campos son obligatorios")
      setIsSubmitting(false)
      return
    }

    // Validar contraseña solo para usuarios nuevos
    if (!isEditing && !formData.contraseña) {
      setError("La contraseña es obligatoria para usuarios nuevos")
      setIsSubmitting(false)
      return
    }

    if (formData.contraseña && formData.contraseña.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsSubmitting(false)
      return
    }

    try {
      const url = isEditing ? `/api/admin/users/${editingUser?.id}` : "/api/admin/users"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setIsDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        setError(data.message || "Error en la operación")
      }
    } catch (error) {
      setError("Error de conexión")
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${user.nombre}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        fetchUsers()
      } else {
        setError(data.message || "Error al eliminar usuario")
      }
    } catch (error) {
      setError("Error de conexión")
      console.error("Error deleting user:", error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.correo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === "all" || user.rol === roleFilter

    return matchesSearch && matchesRole
  })

  const getRoleLabel = (role: string) => {
    const roles = {
      admin: "Administrador",
      usuario: "Usuario",
      editor: "Editor",
      agile_coach: "Agile Coach"
    }
    return roles[role as keyof typeof roles] || role
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive"
      case "agile_coach": return "secondary"
      case "editor": return "outline"
      default: return "default"
    }
  }

  // Verificación de permisos en el render
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session?.user || (session.user as any)?.role !== 'admin') {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a esta página. Solo los administradores pueden gestionar usuarios.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground mt-1">
            Panel de administración para gestionar usuarios del sistema
          </p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.activo).length} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.activo).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {users.length > 0 ? Math.round((users.filter(u => u.activo).length / users.length) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.rol === "admin").length}
            </div>
            <p className="text-xs text-muted-foreground">Con permisos completos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agile Coaches</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.rol === "agile_coach").length}
            </div>
            <p className="text-xs text-muted-foreground">Líderes de células</p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas adicionales por rol */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Editores</CardTitle>
            <Edit className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.rol === "editor").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.rol === "editor" && u.activo).length} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Estándar</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {users.filter(u => u.rol === "usuario").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.rol === "usuario" && u.activo).length} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Inactivos</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => !u.activo).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {users.length > 0 ? Math.round((users.filter(u => !u.activo).length / users.length) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios del Sistema
            <Badge variant="secondary" className="ml-auto">
              {filteredUsers.length} usuarios
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, usuario o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="usuario">Usuario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Cargando usuarios...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.usuario}</TableCell>
                    <TableCell>{user.nombre}</TableCell>
                    <TableCell>{user.correo}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.rol)}>
                        {getRoleLabel(user.rol)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.activo ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <UserX className="h-3 w-3 mr-1" />
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(user.creado_en).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-700"
                          disabled={user.id === (session.user as any)?.id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron usuarios con los filtros aplicados
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para crear/editar usuario */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Modifica la información del usuario seleccionado"
                : "Completa los datos para crear un nuevo usuario"
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuario</Label>
                <Input
                  id="usuario"
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleInputChange}
                  placeholder="nombre_usuario"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="correo">Correo</Label>
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Nombre completo del usuario"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Select value={formData.rol} onValueChange={(value) => handleSelectChange("rol", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Usuario</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="agile_coach">Agile Coach</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={formData.activo}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, activo: checked }))
                    }
                  />
                  <Label className="text-sm">
                    {formData.activo ? "Activo" : "Inactivo"}
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contraseña">
                {isEditing ? "Nueva Contraseña (opcional)" : "Contraseña"}
              </Label>
              <div className="relative">
                <Input
                  id="contraseña"
                  name="contraseña"
                  type={showPassword ? "text" : "password"}
                  value={formData.contraseña}
                  onChange={handleInputChange}
                  placeholder={isEditing ? "Dejar vacío para mantener actual" : "Contraseña del usuario"}
                  required={!isEditing}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {!isEditing && (
                <p className="text-xs text-muted-foreground">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? "Actualizando..." : "Creando..."}
                  </>
                ) : (
                  <>
                    {isEditing ? "Actualizar" : "Crear"} Usuario
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
