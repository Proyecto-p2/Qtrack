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
import { Plus, Search, Users, TrendingUp, DollarSign, Edit, Eye } from "lucide-react"

interface Cell {
  id: number
  name: string
  tribeName: string
  agileCoachName: string
  productOwnerName: string
  memberCount: number
  avgVelocity: number
  currentSprintPoints: number
  costPerSprint: number
  status: "active" | "inactive" | "planning"
}

export default function CellsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const cells: Cell[] = [
    {
      id: 1,
      name: "Célula Frontend Alpha",
      tribeName: "Tribu Digital",
      agileCoachName: "Ana García",
      productOwnerName: "Carlos López",
      memberCount: 6,
      avgVelocity: 42,
      currentSprintPoints: 38,
      costPerSprint: 15000,
      status: "active",
    },
    {
      id: 2,
      name: "Célula Backend Beta",
      tribeName: "Tribu Digital",
      agileCoachName: "Luis Martín",
      productOwnerName: "María Rodríguez",
      memberCount: 5,
      avgVelocity: 35,
      currentSprintPoints: 40,
      costPerSprint: 18000,
      status: "active",
    },
    {
      id: 3,
      name: "Célula DevOps Gamma",
      tribeName: "Tribu Infraestructura",
      agileCoachName: "Pedro Sánchez",
      productOwnerName: "Laura Fernández",
      memberCount: 4,
      avgVelocity: 28,
      currentSprintPoints: 25,
      costPerSprint: 22000,
      status: "planning",
    },
    {
      id: 4,
      name: "Célula QA Delta",
      tribeName: "Tribu Calidad",
      agileCoachName: "Ana García",
      productOwnerName: "Roberto Silva",
      memberCount: 3,
      avgVelocity: 25,
      currentSprintPoints: 28,
      costPerSprint: 12000,
      status: "active",
    },
    {
      id: 5,
      name: "Célula Data Epsilon",
      tribeName: "Tribu Analytics",
      agileCoachName: "Carmen Ruiz",
      productOwnerName: "José Martínez",
      memberCount: 4,
      avgVelocity: 30,
      currentSprintPoints: 32,
      costPerSprint: 20000,
      status: "inactive",
    },
  ]

  const filteredCells = cells.filter(
    (cell) =>
      cell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cell.tribeName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "planning":
        return "outline"
      default:
        return "default"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activa"
      case "inactive":
        return "Inactiva"
      case "planning":
        return "Planificación"
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Células</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Célula
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Célula</DialogTitle>
              <DialogDescription>
                Configura una nueva célula de trabajo con sus integrantes y métricas.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre de la Célula</label>
                  <Input placeholder="Ej: Célula Frontend Zeta" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tribu</label>
                  <Input placeholder="Ej: Tribu Digital" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Agile Coach</label>
                  <Input placeholder="Seleccionar coach..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Owner</label>
                  <Input placeholder="Seleccionar PO..." />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Puntos por Sprint</label>
                  <Input type="number" placeholder="40" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sprints por Q</label>
                  <Input type="number" placeholder="6" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Capacidad (hrs)</label>
                  <Input type="number" placeholder="160" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Cancelar</Button>
                <Button>Crear Célula</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre de célula o tribu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cells Table */}
      <Card>
        <CardHeader>
          <CardTitle>Células Registradas</CardTitle>
          <CardDescription>{filteredCells.length} células encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Célula</TableHead>
                <TableHead>Tribu</TableHead>
                <TableHead>Agile Coach</TableHead>
                <TableHead>Miembros</TableHead>
                <TableHead>Velocidad</TableHead>
                <TableHead>Sprint Actual</TableHead>
                <TableHead>Costo/Sprint</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCells.map((cell) => (
                <TableRow key={cell.id}>
                  <TableCell className="font-medium">{cell.name}</TableCell>
                  <TableCell>{cell.tribeName}</TableCell>
                  <TableCell>{cell.agileCoachName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {cell.memberCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      {cell.avgVelocity}
                    </div>
                  </TableCell>
                  <TableCell>{cell.currentSprintPoints} pts</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />${cell.costPerSprint.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(cell.status) as any}>{getStatusText(cell.status)}</Badge>
                  </TableCell>
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Células</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cells.length}</div>
            <p className="text-xs text-muted-foreground">{cells.filter((c) => c.status === "active").length} activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cells.reduce((sum, cell) => sum + cell.memberCount, 0)}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {Math.round(cells.reduce((sum, cell) => sum + cell.memberCount, 0) / cells.length)} por célula
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Velocidad Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(cells.reduce((sum, cell) => sum + cell.avgVelocity, 0) / cells.length)}
            </div>
            <p className="text-xs text-muted-foreground">puntos por sprint</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${cells.reduce((sum, cell) => sum + cell.costPerSprint, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Por sprint actual</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
