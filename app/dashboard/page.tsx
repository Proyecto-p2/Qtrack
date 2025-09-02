"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, Users, AlertTriangle, Target, Clock, DollarSign, Activity, CheckCircle } from "lucide-react"
import { Building2, Calendar, Upload, FileSpreadsheet } from "lucide-react" // Import missing icons

export default function DashboardPage() {
  const stats = {
    totalCells: 12,
    totalMembers: 48,
    activeAlerts: 7,
    avgVelocity: 32,
    completedSprints: 24,
    ongoingSprints: 8,
    totalCosts: 125000,
    efficiencyRate: 87,
  }

  const alerts = [
    {
      id: 1,
      title: "Sobrecarga detectada en Sprint 23",
      severity: "high",
      cellName: "Célula Frontend",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      title: "Bajo rendimiento en línea Backend",
      severity: "medium",
      cellName: "Célula Fullstack",
      createdAt: "2024-01-14",
    },
    {
      id: 3,
      title: "Costo excedido en 15%",
      severity: "critical",
      cellName: "Célula DevOps",
      createdAt: "2024-01-13",
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="text-sm text-muted-foreground">Última actualización: {new Date().toLocaleString("es-ES")}</div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Células Activas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCells}</div>
            <p className="text-xs text-muted-foreground">{stats.totalMembers} miembros totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Velocidad Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgVelocity}</div>
            <p className="text-xs text-muted-foreground">puntos por sprint</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.efficiencyRate}%</div>
            <Progress value={stats.efficiencyRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Sprint Status and Costs */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Estado de Sprints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sprints Activos</span>
              <Badge variant="default">{stats.ongoingSprints}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sprints Completados</span>
              <Badge variant="secondary">{stats.completedSprints}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso Q1 2024</span>
                <span>75%</span>
              </div>
              <Progress value={75} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Costos del Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCosts.toLocaleString("es-ES")}</div>
            <p className="text-xs text-muted-foreground mt-2">Costo total del trimestre actual</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Presupuesto utilizado</span>
                <span>68%</span>
              </div>
              <Progress value={68} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Resumen de Rendimiento
          </CardTitle>
          <CardDescription>Métricas clave de las células más activas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Célula Frontend Alpha",
                velocity: 42,
                target: 40,
                efficiency: 87,
                members: 6,
                status: "excellent",
              },
              {
                name: "Célula Backend Beta",
                velocity: 35,
                target: 38,
                efficiency: 78,
                members: 5,
                status: "good",
              },
              {
                name: "Célula DevOps Gamma",
                velocity: 28,
                target: 30,
                efficiency: 82,
                members: 4,
                status: "warning",
              },
            ].map((cell, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{cell.name}</h4>
                  <Badge
                    variant={
                      cell.status === "excellent" ? "default" : cell.status === "good" ? "secondary" : "destructive"
                    }
                  >
                    {cell.velocity}/{cell.target}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Eficiencia</span>
                    <span>{cell.efficiency}%</span>
                  </div>
                  <Progress value={cell.efficiency} className="h-1" />
                  <p className="text-xs text-muted-foreground">{cell.members} miembros activos</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas Recientes
          </CardTitle>
          <CardDescription>Últimas alertas generadas por el sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert) => (
            <Alert key={alert.id}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <strong>{alert.title}</strong>
                  <p className="text-sm text-muted-foreground">
                    {alert.cellName} • {new Date(alert.createdAt).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <Badge variant={getSeverityColor(alert.severity) as any}>
                  {alert.severity === "critical" ? "Crítica" : alert.severity === "high" ? "Alta" : "Media"}
                </Badge>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/dashboard/cells"
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Gestionar Células</p>
                <p className="text-xs text-muted-foreground">Ver y editar células</p>
              </div>
            </a>
            <a
              href="/dashboard/sprints"
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Planificar Sprint</p>
                <p className="text-xs text-muted-foreground">Crear nuevo sprint</p>
              </div>
            </a>
            <a
              href="/dashboard/upload"
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-sm">Cargar Datos</p>
                <p className="text-xs text-muted-foreground">Importar Excel/CSV</p>
              </div>
            </a>
            <a
              href="/dashboard/reports"
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <FileSpreadsheet className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-sm">Ver Reportes</p>
                <p className="text-xs text-muted-foreground">Análisis detallado</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
