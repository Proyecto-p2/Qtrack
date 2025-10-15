"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Clock, DollarSign, TrendingDown, Search, Filter } from "lucide-react"

interface AlertData {
  id: number
  title: string
  message: string
  severity: "low" | "medium" | "high" | "critical"
  type: "overload" | "underperformance" | "cost_overrun" | "deadline_risk"
  cellName: string
  createdAt: string
  isRead: boolean
  isResolved: boolean
}

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const alerts: AlertData[] = [
    {
      id: 1,
      title: "Sobrecarga detectada en Sprint 23",
      message: "La célula está trabajando al 115% de su capacidad planificada. Se recomienda redistribuir tareas.",
      severity: "high",
      type: "overload",
      cellName: "Célula Frontend Alpha",
      createdAt: "2024-01-15T10:30:00Z",
      isRead: false,
      isResolved: false,
    },
    {
      id: 2,
      title: "Bajo rendimiento en línea Backend",
      message: "Velocidad por debajo del objetivo en los últimos 2 sprints consecutivos.",
      severity: "medium",
      type: "underperformance",
      cellName: "Célula Backend Beta",
      createdAt: "2024-01-14T14:20:00Z",
      isRead: true,
      isResolved: false,
    },
    {
      id: 3,
      title: "Costo excedido en 15%",
      message: "Los costos del sprint actual exceden el presupuesto asignado. Revisar asignaciones.",
      severity: "critical",
      type: "cost_overrun",
      cellName: "Célula DevOps Gamma",
      createdAt: "2024-01-13T09:15:00Z",
      isRead: true,
      isResolved: false,
    },
    {
      id: 4,
      title: "Riesgo de entrega en Sprint 24",
      message: "Basado en el progreso actual, existe un 70% de probabilidad de no cumplir con la fecha de entrega.",
      severity: "high",
      type: "deadline_risk",
      cellName: "Célula QA Delta",
      createdAt: "2024-01-12T16:45:00Z",
      isRead: true,
      isResolved: true,
    },
    {
      id: 5,
      title: "Capacidad subutilizada",
      message: "La célula está operando al 65% de su capacidad. Considerar asignar más trabajo.",
      severity: "low",
      type: "underperformance",
      cellName: "Célula Data Epsilon",
      createdAt: "2024-01-11T11:30:00Z",
      isRead: false,
      isResolved: false,
    },
  ]

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.cellName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && !alert.isRead) ||
      (statusFilter === "unresolved" && !alert.isResolved) ||
      (statusFilter === "resolved" && alert.isResolved)

    return matchesSearch && matchesSeverity && matchesStatus
  })

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

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "critical":
        return "Crítica"
      case "high":
        return "Alta"
      case "medium":
        return "Media"
      case "low":
        return "Baja"
      default:
        return severity
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "overload":
        return <AlertTriangle className="h-4 w-4" />
      case "underperformance":
        return <TrendingDown className="h-4 w-4" />
      case "cost_overrun":
        return <DollarSign className="h-4 w-4" />
      case "deadline_risk":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "overload":
        return "Sobrecarga"
      case "underperformance":
        return "Bajo Rendimiento"
      case "cost_overrun":
        return "Exceso de Costos"
      case "deadline_risk":
        return "Riesgo de Entrega"
      default:
        return type
    }
  }

  const markAsRead = (alertId: number) => {
    // Simular marcar como leída
    console.log(`Marcando alerta ${alertId} como leída`)
  }

  const resolveAlert = (alertId: number) => {
    // Simular resolver alerta
    console.log(`Resolviendo alerta ${alertId}`)
  }

  const unreadCount = alerts.filter((alert) => !alert.isRead).length
  const unresolvedCount = alerts.filter((alert) => !alert.isResolved).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Centro de Alertas</h2>
        <div className="flex gap-2">
          <Badge variant="destructive">{unreadCount} sin leer</Badge>
          <Badge variant="outline">{unresolvedCount} sin resolver</Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">Últimas 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter((a) => a.severity === "critical").length}
            </div>
            <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Resolver</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unresolvedCount}</div>
            <p className="text-xs text-muted-foreground">Pendientes de acción</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resueltas Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">3</div>
            <p className="text-xs text-muted-foreground">Acciones completadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alertas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las severidades</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="unread">Sin leer</SelectItem>
                <SelectItem value="unresolved">Sin resolver</SelectItem>
                <SelectItem value="resolved">Resueltas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Activas</CardTitle>
          <CardDescription>{filteredAlerts.length} alertas encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Alert
                key={alert.id}
                className={`${!alert.isRead ? "border-l-4 border-l-blue-500" : ""} ${alert.isResolved ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {getTypeIcon(alert.type)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        {!alert.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(alert.severity) as any}>
                          {getSeverityText(alert.severity)}
                        </Badge>
                        <Badge variant="outline">{getTypeText(alert.type)}</Badge>
                        {alert.isResolved && <Badge variant="secondary">Resuelta</Badge>}
                      </div>
                    </div>

                    <AlertDescription className="text-sm">{alert.message}</AlertDescription>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {alert.cellName} • {new Date(alert.createdAt).toLocaleString("es-ES")}
                      </span>
                      <div className="flex gap-2">
                        {!alert.isRead && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(alert.id)}>
                            Marcar como leída
                          </Button>
                        )}
                        {!alert.isResolved && (
                          <Button variant="outline" size="sm" onClick={() => resolveAlert(alert.id)}>
                            Resolver
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}

            {filteredAlerts.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron alertas con los filtros aplicados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
