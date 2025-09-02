"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Plus, Save, Target, TrendingUp } from "lucide-react"

export default function DailyLogPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedTask, setSelectedTask] = useState("")
  const [hoursWorked, setHoursWorked] = useState("")
  const [progressPercentage, setProgressPercentage] = useState("")
  const [notes, setNotes] = useState("")

  const availableTasks = [
    { id: "1", title: "Implementar dashboard de métricas", points: 8, progress: 75 },
    { id: "2", title: "Refactorizar componentes UI", points: 5, progress: 100 },
    { id: "3", title: "Optimizar queries de base de datos", points: 13, progress: 40 },
    { id: "4", title: "Documentar APIs", points: 3, progress: 0 },
  ]

  const recentLogs = [
    {
      id: 1,
      date: "2024-01-15",
      taskTitle: "Implementar dashboard de métricas",
      hoursWorked: 6,
      progress: 75,
      notes: "Completé la integración con la API de métricas y los gráficos principales.",
    },
    {
      id: 2,
      date: "2024-01-14",
      taskTitle: "Refactorizar componentes UI",
      hoursWorked: 4,
      progress: 100,
      notes: "Finalizada la refactorización. Todos los tests pasan correctamente.",
    },
    {
      id: 3,
      date: "2024-01-13",
      taskTitle: "Optimizar queries de base de datos",
      hoursWorked: 5,
      progress: 30,
      notes: "Identifiqué los queries más lentos. Trabajando en la optimización de índices.",
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simular guardado
    alert("Registro guardado exitosamente")
    // Reset form
    setSelectedTask("")
    setHoursWorked("")
    setProgressPercentage("")
    setNotes("")
  }

  const weeklyHours =
    recentLogs.reduce((sum, log) => sum + log.hoursWorked, 0) + (hoursWorked ? Number.parseFloat(hoursWorked) : 0)
  const targetWeeklyHours = 40

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Registro Diario</h2>
        <div className="text-sm text-muted-foreground">
          Semana actual: {weeklyHours}h de {targetWeeklyHours}h
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Esta Semana</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyHours}h</div>
            <p className="text-xs text-muted-foreground">de {targetWeeklyHours}h objetivo</p>
            <Progress value={(weeklyHours / targetWeeklyHours) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Activas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableTasks.filter((t) => t.progress < 100).length}</div>
            <p className="text-xs text-muted-foreground">en progreso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(availableTasks.reduce((sum, task) => sum + task.progress, 0) / availableTasks.length)}%
            </div>
            <p className="text-xs text-muted-foreground">de tareas asignadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registros Esta Semana</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentLogs.length}</div>
            <p className="text-xs text-muted-foreground">días registrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Log Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nuevo Registro Diario
          </CardTitle>
          <CardDescription>Registra tu progreso y horas trabajadas en las tareas asignadas</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task">Tarea</Label>
                <Select value={selectedTask} onValueChange={setSelectedTask} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una tarea" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title} ({task.points} pts)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hours">Horas Trabajadas</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  min="0"
                  max="12"
                  placeholder="8.0"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">Progreso (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="75"
                  value={progressPercentage}
                  onChange={(e) => setProgressPercentage(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas y Observaciones</Label>
              <Textarea
                id="notes"
                placeholder="Describe el trabajo realizado, obstáculos encontrados, próximos pasos..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Guardar Registro
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Current Tasks Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Tareas Asignadas</CardTitle>
          <CardDescription>Progreso actual de tus tareas del sprint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge variant="outline">{task.points} pts</Badge>
                  </div>
                  <Badge variant={task.progress === 100 ? "default" : task.progress > 0 ? "secondary" : "outline"}>
                    {task.progress === 100 ? "Completada" : task.progress > 0 ? "En Progreso" : "Pendiente"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Registros Recientes</CardTitle>
          <CardDescription>Historial de tus últimos registros diarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{new Date(log.date).toLocaleDateString("es-ES")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{log.hoursWorked}h</span>
                  </div>
                </div>
                <h4 className="font-medium mb-2">{log.taskTitle}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">Progreso:</span>
                  <Progress value={log.progress} className="flex-1 max-w-32" />
                  <span className="text-sm">{log.progress}%</span>
                </div>
                <p className="text-sm text-muted-foreground">{log.notes}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
