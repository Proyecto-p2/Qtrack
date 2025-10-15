"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, Clock, CheckCircle, Award, Calendar } from "lucide-react"

export default function PerformancePage() {
  const personalMetrics = {
    currentVelocity: 8,
    targetVelocity: 10,
    completedTasks: 24,
    totalTasks: 30,
    hoursLogged: 156,
    targetHours: 160,
    qualityScore: 94,
    sprintContribution: 32,
  }

  const recentTasks = [
    {
      id: 1,
      title: "Implementar dashboard de métricas",
      points: 8,
      status: "completed",
      completedAt: "2024-01-15",
    },
    {
      id: 2,
      title: "Refactorizar componentes UI",
      points: 5,
      status: "completed",
      completedAt: "2024-01-14",
    },
    {
      id: 3,
      title: "Optimizar queries de base de datos",
      points: 13,
      status: "in_progress",
      completedAt: null,
    },
    {
      id: 4,
      title: "Documentar APIs",
      points: 3,
      status: "todo",
      completedAt: null,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in_progress":
        return "secondary"
      case "todo":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completada"
      case "in_progress":
        return "En Progreso"
      case "todo":
        return "Pendiente"
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Mi Rendimiento</h2>
        <div className="text-sm text-muted-foreground">Sprint 25 • Q1 2024</div>
      </div>

      {/* Personal Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Velocidad Personal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalMetrics.currentVelocity}</div>
            <p className="text-xs text-muted-foreground">Objetivo: {personalMetrics.targetVelocity} puntos</p>
            <Progress
              value={(personalMetrics.currentVelocity / personalMetrics.targetVelocity) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalMetrics.completedTasks}</div>
            <p className="text-xs text-muted-foreground">de {personalMetrics.totalTasks} asignadas</p>
            <Progress value={(personalMetrics.completedTasks / personalMetrics.totalTasks) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Registradas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalMetrics.hoursLogged}</div>
            <p className="text-xs text-muted-foreground">de {personalMetrics.targetHours} planificadas</p>
            <Progress value={(personalMetrics.hoursLogged / personalMetrics.targetHours) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Calidad</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalMetrics.qualityScore}%</div>
            <p className="text-xs text-green-600">Excelente desempeño</p>
            <Progress value={personalMetrics.qualityScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Sprint Contribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Contribución al Sprint
          </CardTitle>
          <CardDescription>Tu aporte a los objetivos de la célula</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{personalMetrics.sprintContribution}%</div>
              <p className="text-sm text-muted-foreground">Contribución Total</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">8</div>
              <p className="text-sm text-muted-foreground">Puntos Entregados</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">2</div>
              <p className="text-sm text-muted-foreground">Tareas Críticas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tareas Recientes
          </CardTitle>
          <CardDescription>Actividades del sprint actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                    {task.points}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    {task.completedAt && (
                      <p className="text-xs text-muted-foreground">
                        Completada el {new Date(task.completedAt).toLocaleDateString("es-ES")}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={getStatusColor(task.status) as any}>{getStatusText(task.status)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencias de Rendimiento</CardTitle>
          <CardDescription>Evolución de tu productividad en los últimos sprints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Gráfico de tendencias de velocidad personal</p>
              <p className="text-sm text-muted-foreground mt-2">
                Aquí se mostraría la evolución de tu rendimiento a lo largo del tiempo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals and Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos del Trimestre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: "Mantener velocidad promedio de 10 puntos",
                progress: 80,
                status: "on_track",
              },
              {
                title: "Completar certificación en React",
                progress: 60,
                status: "on_track",
              },
              {
                title: "Liderar 2 iniciativas técnicas",
                progress: 50,
                status: "at_risk",
              },
              {
                title: "Mentoría a desarrollador junior",
                progress: 90,
                status: "ahead",
              },
            ].map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{goal.title}</span>
                  <Badge
                    variant={
                      goal.status === "ahead" ? "default" : goal.status === "on_track" ? "secondary" : "destructive"
                    }
                  >
                    {goal.status === "ahead" ? "Adelantado" : goal.status === "on_track" ? "En Progreso" : "En Riesgo"}
                  </Badge>
                </div>
                <Progress value={goal.progress} />
                <p className="text-xs text-muted-foreground">{goal.progress}% completado</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
