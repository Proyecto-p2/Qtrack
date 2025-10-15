"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, Users, DollarSign, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"

interface TaskMetrics {
  total: number
  completed: number
  in_progress: number
  todo: number
  blocked: number
  assigned: number
  unassigned: number
  completionRate: number
  velocity: number
  efficiency: number
}

interface SprintData {
  id: number
  name: string
  tasks: number
  completed: number
  velocity: number
  startDate: string
  endDate: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function MetricsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("current_quarter")
  const [selectedCell, setSelectedCell] = useState("all")
  const [taskMetrics, setTaskMetrics] = useState<TaskMetrics | null>(null)
  const [sprintData, setSprintData] = useState<SprintData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRealMetrics()
  }, [])

  const fetchRealMetrics = async () => {
    try {
      setLoading(true)
      
      // Obtener datos de tareas
      const tasksResponse = await fetch('/api/user-tasks')
      const tasksData = await tasksResponse.json()
      const tasks = tasksData.tasks || []

      // Obtener datos de sprints
      const sprintsResponse = await fetch('/api/sprints')
      const sprintsData = await sprintsResponse.json()
      const sprints = sprintsData.sprints || []

      // Calcular métricas de tareas
      const completed = tasks.filter((t: any) => t.status === 'done').length
      const inProgress = tasks.filter((t: any) => t.status === 'in_progress').length
      const todo = tasks.filter((t: any) => t.status === 'todo').length
      const blocked = tasks.filter((t: any) => t.status === 'blocked').length
      const assigned = tasks.filter((t: any) => t.assigned_user_name).length
      const total = tasks.length

      // Calcular tasa de completación
      const completionRate = total > 0 ? (completed / total) * 100 : 0

      // Calcular velocidad (tareas completadas por sprint activo)
      const activeSprints = sprints.filter((s: any) => s.status === 'active').length || 1
      const velocity = completed / activeSprints

      // Calcular eficiencia (porcentaje de tareas asignadas y completadas)
      const efficiency = assigned > 0 ? (completed / assigned) * 100 : 0

      const metrics: TaskMetrics = {
        total,
        completed,
        in_progress: inProgress,
        todo,
        blocked,
        assigned,
        unassigned: total - assigned,
        completionRate,
        velocity,
        efficiency: Math.min(efficiency, 100) // Cap at 100%
      }

      // Procesar datos de sprints para métricas detalladas
      const processedSprints: SprintData[] = sprints.map((sprint: any) => {
        const sprintTasks = tasks.filter((t: any) => t.sprint_id === sprint.id)
        const sprintCompleted = sprintTasks.filter((t: any) => t.status === 'done').length
        
        return {
          id: sprint.id,
          name: sprint.name,
          tasks: sprintTasks.length,
          completed: sprintCompleted,
          velocity: sprintCompleted,
          startDate: sprint.start_date,
          endDate: sprint.end_date
        }
      })

      setTaskMetrics(metrics)
      setSprintData(processedSprints)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Métricas de Rendimiento</h2>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_quarter">Trimestre Actual</SelectItem>
                  <SelectItem value="last_quarter">Trimestre Anterior</SelectItem>
                  <SelectItem value="current_year">Año Actual</SelectItem>
                  <SelectItem value="last_30_days">Últimos 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Célula</label>
              <Select value={selectedCell} onValueChange={setSelectedCell}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las células</SelectItem>
                  <SelectItem value="Frontend">Célula Frontend Alpha</SelectItem>
                  <SelectItem value="Backend">Célula Backend Beta</SelectItem>
                  <SelectItem value="DevOps">Célula DevOps Gamma</SelectItem>
                  <SelectItem value="QA">Célula QA Delta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tareas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskMetrics?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Tareas en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Completación</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taskMetrics ? taskMetrics.completionRate.toFixed(1) : 0}%
            </div>
            <Progress 
              value={taskMetrics?.completionRate || 0} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {taskMetrics?.completed || 0} de {taskMetrics?.total || 0} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Velocidad</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taskMetrics ? taskMetrics.velocity.toFixed(1) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Tareas por sprint</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taskMetrics ? taskMetrics.efficiency.toFixed(1) : 0}%
            </div>
            <Progress 
              value={taskMetrics?.efficiency || 0} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tareas asignadas completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribución de Estados de Tareas
          </CardTitle>
          <CardDescription>Vista general del estado actual de todas las tareas</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-muted-foreground">Cargando métricas...</div>
            </div>
          ) : taskMetrics ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Barras - Estados */}
              <div className="h-64">
                <h4 className="text-sm font-semibold mb-3">Estados de Tareas</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Completadas', value: taskMetrics.completed, fill: '#10b981' },
                      { name: 'En Progreso', value: taskMetrics.in_progress, fill: '#3b82f6' },
                      { name: 'Por Hacer', value: taskMetrics.todo, fill: '#6b7280' },
                      { name: 'Bloqueadas', value: taskMetrics.blocked, fill: '#ef4444' }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Pastel - Asignaciones */}
              <div className="h-64">
                <h4 className="text-sm font-semibold mb-3">Distribución de Asignaciones</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Asignadas', value: taskMetrics.assigned },
                        { name: 'Sin Asignar', value: taskMetrics.unassigned }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Asignadas', value: taskMetrics.assigned },
                        { name: 'Sin Asignar', value: taskMetrics.unassigned }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-muted-foreground">No hay datos disponibles</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Metrics by Sprint */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Detalladas por Sprint</CardTitle>
          <CardDescription>Rendimiento individual de cada sprint activo</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Cargando datos de sprints...</div>
            </div>
          ) : sprintData.length > 0 ? (
            <div className="space-y-6">
              {sprintData.map((sprint, index) => (
                <div key={sprint.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{sprint.name}</h3>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{sprint.tasks} tareas</span>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progreso</span>
                        <span className="text-sm font-semibold">
                          {sprint.completed}/{sprint.tasks}
                        </span>
                      </div>
                      <Progress 
                        value={sprint.tasks > 0 ? (sprint.completed / sprint.tasks) * 100 : 0} 
                        className="h-2" 
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Velocidad</span>
                        <span className="text-sm text-blue-600">{sprint.velocity}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tareas completadas
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Completación</span>
                        <span className="text-sm text-green-600">
                          {sprint.tasks > 0 ? ((sprint.completed / sprint.tasks) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tasa de finalización
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Duración</span>
                        <span className="text-sm">
                          {new Date(sprint.startDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - 
                          {new Date(sprint.endDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Periodo del sprint
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Estado del Sprint</span>
                      <Badge 
                        variant={sprint.completed === sprint.tasks ? "default" : sprint.completed > 0 ? "secondary" : "outline"}
                      >
                        {sprint.completed === sprint.tasks ? "Completado" : 
                         sprint.completed > 0 ? "En Progreso" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4" />
              <p>No hay sprints disponibles</p>
              <p className="text-sm mt-2">Los sprints aparecerán aquí cuando se creen</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Rendimiento
          </CardTitle>
          <CardDescription>Alertas basadas en las métricas actuales del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Cargando alertas...</div>
              </div>
            ) : (
              <>
                {/* Alertas basadas en métricas reales */}
                {taskMetrics && (
                  <>
                    {taskMetrics.blocked > 0 && (
                      <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="font-medium text-sm">Tareas Bloqueadas</p>
                            <p className="text-sm text-muted-foreground">
                              {taskMetrics.blocked} tareas bloqueadas requieren atención
                            </p>
                          </div>
                        </div>
                        <Badge variant="destructive">Alta</Badge>
                      </div>
                    )}

                    {taskMetrics.efficiency < 50 && taskMetrics.assigned > 0 && (
                      <div className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <div>
                            <p className="font-medium text-sm">Eficiencia Baja</p>
                            <p className="text-sm text-muted-foreground">
                              Eficiencia del {taskMetrics.efficiency.toFixed(1)}% está por debajo del promedio
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Media</Badge>
                      </div>
                    )}

                    {taskMetrics.unassigned > taskMetrics.assigned && (
                      <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-blue-50">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">Muchas Tareas Sin Asignar</p>
                            <p className="text-sm text-muted-foreground">
                              {taskMetrics.unassigned} tareas sin asignar vs {taskMetrics.assigned} asignadas
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">Información</Badge>
                      </div>
                    )}

                    {/* Si no hay alertas */}
                    {taskMetrics.blocked === 0 && 
                     taskMetrics.efficiency >= 50 && 
                     taskMetrics.unassigned <= taskMetrics.assigned && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          ¡Excelente! No hay alertas de rendimiento en este momento.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
