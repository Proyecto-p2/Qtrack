"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, CheckCircle, Clock, Pencil, User, Calendar, Target } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface UserTask {
  id: number
  title: string
  description: string
  status: "todo" | "in_progress" | "review" | "done" | "blocked"
  priority: "low" | "medium" | "high" | "critical"
  story_points: number
  assigned_user_name: string
  assigned_username: string
  estimated_hours: number
  actual_hours: number
}

interface Task {
  id: number
  name: string
  status: "todo" | "inProgress" | "done"
}

interface Sprint {
  id: number
  name: string
  cellId: number
  cellName: string
  quarter: string
  startDate: string
  endDate: string
  plannedPoints: number
  status: "planning" | "active" | "completed" | "cancelled"
  tasks: Task[]
  userTasks?: UserTask[] // Nuevas tareas del sistema
}

interface Cell {
  id: number
  name: string
}

interface QuarterOption {
  id: number
  quarter: string
  year: number
}

// Colores para estados y prioridades
const statusColors = {
  todo: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800", 
  review: "bg-yellow-100 text-yellow-800",
  done: "bg-green-100 text-green-800",
  blocked: "bg-red-100 text-red-800"
};

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800", 
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800"
};

export default function SprintsPage() {
  const [cells, setCells] = useState<Cell[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [quarters, setQuarters] = useState<QuarterOption[]>([])
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [cellsRes, sprintsRes, qRes] = await Promise.all([
        fetch("/api/cells"),
        fetch("/api/sprints"),
        fetch("/api/q-configuration")
      ])

      const cellsData = await cellsRes.json()
      const sprintsData = await sprintsRes.json()
      const qData = await qRes.json()

      setCells(cellsData.cells || [])
      
      // Cargar tareas para cada sprint
      const sprintsWithUserTasks = await Promise.all(
        (sprintsData.sprints || []).map(async (sprint: Sprint) => {
          try {
            const tasksRes = await fetch(`/api/user-tasks?sprintId=${sprint.id}`)
            const tasksData = await tasksRes.json()
            return {
              ...sprint,
              userTasks: tasksData.tasks || []
            }
          } catch (error) {
            console.error(`Error loading tasks for sprint ${sprint.id}:`, error)
            return {
              ...sprint,
              userTasks: []
            }
          }
        })
      )
      
      setSprints(sprintsWithUserTasks)

      if (Array.isArray(qData)) {
        setQuarters(qData)
      } else {
        setQuarters([{ id: qData.id || 1, quarter: qData.quarter, year: qData.year }])
      }

    } catch (error) {
      console.error("Error cargando datos iniciales:", error)
    }
  }

  const handleUpdateSprint = async () => {
    if (!editingSprint) return

    try {
      const res = await fetch(`/api/sprints`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSprint)
      })
      const result = await res.json()

      if (res.ok) {
        setSprints(prev =>
          prev.map(s => (s.id === editingSprint.id ? editingSprint : s))
        )
        setEditingSprint(null)
      } else {
        console.error("Error actualizando sprint:", result.error)
      }
    } catch (error) {
      console.error("Error en PUT:", error)
    }
  }

  const handleTaskStatusChange = async (sprint: Sprint, taskId: number, newStatus: Task["status"]) => {
    const updatedTasks = sprint.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)

    try {
      const res = await fetch("/api/sprints", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sprint, tasks: updatedTasks })
      })
      if (res.ok) {
        setSprints(prev =>
          prev.map(sp => sp.id === sprint.id ? { ...sp, tasks: updatedTasks } : sp)
        )
      } else {
        console.error("Error actualizando task")
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Sprints</h1>

      {cells.map(cell => {
        const cellSprints = sprints.filter(s => s.cellId === cell.id)
        return (
          <Card key={cell.id}>
            <CardHeader>
              <CardTitle>{cell.name}</CardTitle>
              <CardDescription>Sprints asociados a esta célula</CardDescription>
            </CardHeader>
            <CardContent>
              {cellSprints.length === 0 ? (
                <p className="text-muted-foreground">No hay sprints registrados.</p>
              ) : (
                <div className="grid gap-4">
                  {cellSprints.map(s => (
                    <Card key={s.id} className="border p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg">{s.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {s.quarter} | {s.startDate} → {s.endDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize flex gap-1 items-center">
                            {s.status === "active" && <Play className="h-4 w-4" />}
                            {s.status === "completed" && <CheckCircle className="h-4 w-4" />}
                            {s.status === "planning" && <Clock className="h-4 w-4" />}
                            {s.status === "cancelled" && <Pause className="h-4 w-4" />}
                            {s.status}
                          </Badge>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setEditingSprint(s)}>
                                <Pencil className="h-4 w-4 mr-1" /> Editar
                              </Button>
                            </DialogTrigger>

                            {editingSprint && editingSprint.id === s.id && (
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Editar Sprint</DialogTitle>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Nombre</Label>
                                      <Input
                                        value={editingSprint.name}
                                        onChange={e =>
                                          setEditingSprint({ ...editingSprint, name: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>Trimestre</Label>
                                      <Select
                                        value={editingSprint.quarter}
                                        onValueChange={val =>
                                          setEditingSprint({ ...editingSprint, quarter: val })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Seleccionar Q" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {quarters.map(q => (
                                            <SelectItem key={q.id} value={`${q.year}-${q.quarter}`}>
                                              {q.year}-{q.quarter}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <Label>Inicio</Label>
                                      <Input
                                        type="date"
                                        value={editingSprint.startDate}
                                        onChange={e =>
                                          setEditingSprint({ ...editingSprint, startDate: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>Fin</Label>
                                      <Input
                                        type="date"
                                        value={editingSprint.endDate}
                                        onChange={e =>
                                          setEditingSprint({ ...editingSprint, endDate: e.target.value })
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label>Puntos Planificados</Label>
                                      <Input
                                        type="number"
                                        value={editingSprint.plannedPoints}
                                        onChange={e =>
                                          setEditingSprint({
                                            ...editingSprint,
                                            plannedPoints: Number(e.target.value)
                                          })
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <Label>Estado</Label>
                                    <Select
                                      value={editingSprint.status}
                                      onValueChange={val =>
                                        setEditingSprint({ ...editingSprint, status: val as Sprint["status"] })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar estado" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="planning">Planning</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label>Tasks</Label>
                                    {editingSprint.tasks.map((task, i) => (
                                      <div key={i} className="flex gap-2 mb-2">
                                        <Input
                                          placeholder={`Task #${i + 1}`}
                                          value={task.name}
                                          onChange={e => {
                                            const newTasks = [...editingSprint.tasks]
                                            newTasks[i].name = e.target.value
                                            setEditingSprint({ ...editingSprint, tasks: newTasks })
                                          }}
                                        />
                                        <Select
                                          value={task.status}
                                          onValueChange={val => {
                                            const newTasks = [...editingSprint.tasks]
                                            newTasks[i].status = val as Task["status"]
                                            setEditingSprint({ ...editingSprint, tasks: newTasks })
                                          }}
                                        >
                                          <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Estado" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="todo">Todo</SelectItem>
                                            <SelectItem value="inProgress">In Progress</SelectItem>
                                            <SelectItem value="done">Done</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Button
                                          variant="destructive"
                                          onClick={() => {
                                            const newTasks = editingSprint.tasks.filter((_, idx) => idx !== i)
                                            setEditingSprint({ ...editingSprint, tasks: newTasks })
                                          }}
                                        >
                                          Eliminar
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        setEditingSprint({
                                          ...editingSprint,
                                          tasks: [
                                            ...editingSprint.tasks,
                                            { id: 0, name: "", status: "todo" }
                                          ]
                                        })
                                      }
                                    >
                                      + Agregar Task
                                    </Button>
                                  </div>

                                  <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                      variant="secondary"
                                      onClick={() => setEditingSprint(null)}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button onClick={handleUpdateSprint}>Guardar Cambios</Button>
                                  </div>
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>
                        </div>
                      </div>

                      {/* VISTA CONDICIONAL DE TAREAS */}
                      <div className="mt-4">
                        {/* Solo mostrar estadísticas si hay tareas */}
                        {s.userTasks && s.userTasks.length > 0 ? (
                          <div className="space-y-4">
                            {/* Estadísticas del Sprint */}
                            <div className="grid grid-cols-4 gap-4">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-sm font-medium text-blue-600">Total Tareas</div>
                                <div className="text-2xl font-bold text-blue-700">
                                  {s.userTasks.length}
                                </div>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-sm font-medium text-green-600">Completadas</div>
                                <div className="text-2xl font-bold text-green-700">
                                  {s.userTasks.filter(t => t.status === 'done').length}
                                </div>
                              </div>
                              <div className="bg-yellow-50 p-3 rounded-lg">
                                <div className="text-sm font-medium text-yellow-600">En Progreso</div>
                                <div className="text-2xl font-bold text-yellow-700">
                                  {s.userTasks.filter(t => t.status === 'in_progress').length}
                                </div>
                              </div>
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <div className="text-sm font-medium text-purple-600">Story Points</div>
                                <div className="text-2xl font-bold text-purple-700">
                                  {s.userTasks.reduce((sum, t) => sum + (t.story_points || 0), 0)}
                                </div>
                              </div>
                            </div>

                            {/* Tabla de Tareas */}
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Tareas del Sprint
                              </h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Tarea</TableHead>
                                    <TableHead>Asignado</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Prioridad</TableHead>
                                    <TableHead>Puntos</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {s.userTasks.map(task => (
                                    <TableRow key={task.id}>
                                      <TableCell>
                                        <div>
                                          <div className="font-medium">{task.title}</div>
                                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                                            {task.description}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {task.assigned_user_name ? (
                                          <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <div>
                                              <div className="font-medium">{task.assigned_user_name}</div>
                                              <div className="text-sm text-muted-foreground">@{task.assigned_username}</div>
                                            </div>
                                          </div>
                                        ) : (
                                          <span className="text-muted-foreground italic">Sin asignar</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                                          {task.status.replace('_', ' ')}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                                          {task.priority}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{task.story_points}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ) : (
                          /* Sprint sin tareas - solo mostrar mensaje simple */
                          <div className="text-center py-4 text-muted-foreground">
                            <p className="text-sm">Sin tareas asignadas</p>
                          </div>
                        )}
                      </div>

                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
