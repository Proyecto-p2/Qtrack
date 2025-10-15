"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search } from "lucide-react"

interface Task {
  id?: number;
  name: string;
  status: 'todo' | 'inProgress' | 'done';
}

interface Sprint {
  id: number;
  cellId: number;
  tasks: Task[];
}

interface Cell {
  id: number;
  name: string;
  tribeName: string;
  sprints?: Sprint[];
}

interface User {
  id: string
  usuario: string
  nombre: string
  correo: string
  rol: string
}

interface Tribe {
  id: number
  name: string
  leadName: string
  lead_user_id?: string
  description?: string
  createdAt: string
  leader_info?: {
    id: string
    fullName: string
    username: string
    email: string
  }
  cells?: Cell[]
  completionData?: {
    percentage: number
    totalTasks: number
    doneTasks: number
    cellsCount: number
  }
}

export default function TribesPage() {
  const router = useRouter()
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [open, setOpen] = useState(false)

  // Campos formulario
  const [name, setName] = useState("")
  const [leadUserId, setLeadUserId] = useState("")
  const [description, setDescription] = useState("")

  const THRESHOLD = 0.7; // 70% completadas mínimo

  // Calcular cumplimiento de una tribu basado en sus células
  const calculateTribeCompletion = (tribe: Tribe) => {
    if (!tribe.cells || tribe.cells.length === 0) {
      return { percentage: 0, totalTasks: 0, doneTasks: 0, cellsCount: 0 };
    }

    let totalTasks = 0;
    let doneTasks = 0;
    
    tribe.cells.forEach(cell => {
      cell.sprints?.forEach(sprint => {
        totalTasks += sprint.tasks.length;
        doneTasks += sprint.tasks.filter(task => task.status === "done").length;
      });
    });

    return {
      percentage: totalTasks > 0 ? doneTasks / totalTasks : 0,
      totalTasks,
      doneTasks,
      cellsCount: tribe.cells.length
    };
  };

  const getCompletionColor = (completion: number) => {
    if (completion >= 0.9) return "default"; // Verde para 90%+
    if (completion >= THRESHOLD) return "secondary"; // Azul para 70-89%
    return "destructive"; // Rojo para menos de 70%
  };

  const getCompletionIcon = (completion: number) => {
    if (completion >= 0.9) return "🟢";
    if (completion >= THRESHOLD) return "🟡";
    return "🔴";
  };

  // Cargar tribus, usuarios y datos de cumplimiento desde la API
  useEffect(() => {
    const fetchTribes = async () => {
      const res = await fetch("/api/tribes")
      const data = await res.json()
      const tribesData = data.tribes || []
      
      // Para cada tribu, obtener sus células y sprints
      for (const tribe of tribesData) {
        const resCells = await fetch("/api/cells")
        const dataCells = await resCells.json()
        
        // Filtrar células que pertenecen a esta tribu
        const tribeCells = (dataCells.cells || []).filter((cell: any) => cell.tribeName === tribe.name)
        
        // Para cada célula, obtener sus sprints
        for (const cell of tribeCells) {
          const resSprints = await fetch(`/api/sprints?cellId=${cell.id}`)
          const dataSprints = await resSprints.json()
          cell.sprints = dataSprints.sprints || []
        }
        
        tribe.cells = tribeCells
        tribe.completionData = calculateTribeCompletion(tribe)
      }
      
      setTribes(tribesData)
    }
    
    const fetchUsers = async () => {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data.users || [])
    }
    
    fetchTribes()
    fetchUsers()
  }, [])

  // Crear nueva tribu
  const handleCreate = async () => {
    const selectedUser = users.find(u => u.id === leadUserId)
    
    const res = await fetch("/api/tribes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name, 
        leadUserId, 
        leadName: selectedUser?.nombre || "", // Por compatibilidad
        description 
      }),
    })

    if (res.ok) {
      const data = await res.json()
      const newTribe: Tribe = {
        id: data.data.insertId || Date.now(),
        name,
        leadName: selectedUser?.nombre || "",
        lead_user_id: leadUserId,
        description,
        createdAt: new Date().toISOString(),
      }
      setTribes((prev) => [...prev, newTribe])
      setOpen(false)
      setName("")
      setLeadUserId("")
      setDescription("")
    } else {
      console.error("Error creando tribu", await res.text())
    }
  }

  // Eliminar tribu por nombre
  const handleDelete = async (tribeName: string) => {
    if (!confirm(`¿Deseas eliminar la tribu "${tribeName}"?`)) return

    const res = await fetch(`/api/tribes?name=${encodeURIComponent(tribeName)}`, {
      method: "DELETE",
    })

    if (res.ok) {
      setTribes((prev) => prev.filter((t) => t.name !== tribeName))
    } else {
      console.error("Error al eliminar tribu")
    }
  }

  // Filtrar tribus
  const filteredTribes = tribes.filter(
    (tribe) =>
      tribe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tribe.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tribe.leader_info?.username && tribe.leader_info.username.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Calcular estadísticas generales
  const totalTribes = filteredTribes.length
  const tribesWithData = filteredTribes.filter(tribe => tribe.completionData && tribe.completionData.totalTasks > 0)
  const tribesAboveThreshold = tribesWithData.filter(tribe => tribe.completionData!.percentage >= THRESHOLD).length
  const averageCompletion = tribesWithData.length > 0 
    ? tribesWithData.reduce((sum, tribe) => sum + tribe.completionData!.percentage, 0) / tribesWithData.length 
    : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Tribus</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Tribu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Tribu</DialogTitle>
              <DialogDescription>Registra una nueva tribu en el sistema.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Tribu Digital" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Líder</label>
                <Select value={leadUserId} onValueChange={setLeadUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un usuario" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[400px]">
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{user.nombre}</span>
                          <span className="text-xs text-muted-foreground">@{user.usuario} • {user.rol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Crear Tribu</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas de cumplimiento */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tribus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTribes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(averageCompletion * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {getCompletionIcon(averageCompletion)} Meta: 70%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tribus sobre Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tribesAboveThreshold}</div>
            <p className="text-xs text-muted-foreground">
              De {tribesWithData.length} con datos ({tribesWithData.length > 0 ? ((tribesAboveThreshold / tribesWithData.length) * 100).toFixed(1) : 0}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageCompletion >= 0.9 ? "🟢 Excelente" : 
               averageCompletion >= THRESHOLD ? "🟡 Bueno" : "🔴 Necesita Mejora"}
            </div>
            <p className="text-xs text-muted-foreground">
              Basado en promedio general
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o líder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Tribus */}
      <Card>
        <CardHeader>
          <CardTitle>Tribus Registradas</CardTitle>
          <CardDescription>{filteredTribes.length} tribus encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Líder</TableHead>
                <TableHead>Células</TableHead>
                <TableHead>Cumplimiento</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTribes.map((tribe) => {
                const completionData = tribe.completionData || { percentage: 0, totalTasks: 0, doneTasks: 0, cellsCount: 0 };
                return (
                  <TableRow key={tribe.id}>
                    <TableCell className="font-medium">
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-medium text-left"
                        onClick={() => router.push(`/dashboard/tribes/${tribe.id}`)}
                      >
                        {tribe.name}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{tribe.leadName}</span>
                        {tribe.leader_info && (
                          <span className="text-sm text-muted-foreground">
                            @{tribe.leader_info.username} • {tribe.leader_info.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{completionData.cellsCount} células</span>
                        <span className="text-xs text-muted-foreground">
                          {completionData.totalTasks} tareas totales
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {completionData.totalTasks > 0 ? (
                        <div className="flex items-center gap-2">
                          <Badge variant={getCompletionColor(completionData.percentage) as any}>
                            {(completionData.percentage * 100).toFixed(0)}%
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ({completionData.doneTasks}/{completionData.totalTasks})
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin datos</span>
                      )}
                    </TableCell>
                    <TableCell>{tribe.description || "—"}</TableCell>
                    <TableCell>{new Date(tribe.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/dashboard/tribes/${tribe.id}`)}
                        >
                          Detalle
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(tribe.name)}>
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resumen detallado */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">🟢 Excelente (90%+):</span>
                <span className="font-medium">
                  {tribesWithData.filter(t => t.completionData!.percentage >= 0.9).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">🟡 Bueno (70-89%):</span>
                <span className="font-medium">
                  {tribesWithData.filter(t => t.completionData!.percentage >= THRESHOLD && t.completionData!.percentage < 0.9).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">🔴 Necesita Mejora (&lt;70%):</span>
                <span className="font-medium">
                  {tribesWithData.filter(t => t.completionData!.percentage < THRESHOLD).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas Globales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Células:</span>
                <span className="font-medium">
                  {filteredTribes.reduce((sum, tribe) => sum + (tribe.completionData?.cellsCount || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Tareas:</span>
                <span className="font-medium">
                  {filteredTribes.reduce((sum, tribe) => sum + (tribe.completionData?.totalTasks || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tareas Completadas:</span>
                <span className="font-medium">
                  {filteredTribes.reduce((sum, tribe) => sum + (tribe.completionData?.doneTasks || 0), 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
