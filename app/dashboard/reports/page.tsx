"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileSpreadsheet, Download, Calendar, BarChart3, TrendingUp, Users, DollarSign } from "lucide-react"

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("current_quarter")
  const [selectedCell, setSelectedCell] = useState("all")
  const [selectedReport, setSelectedReport] = useState("")

  const availableReports = [
    {
      id: "velocity_report",
      name: "Reporte de Velocidad",
      description: "Análisis de velocidad por célula y sprint",
      icon: TrendingUp,
      category: "Rendimiento",
    },
    {
      id: "capacity_report",
      name: "Reporte de Capacidad",
      description: "Utilización de capacidad y recursos",
      icon: Users,
      category: "Recursos",
    },
    {
      id: "cost_analysis",
      name: "Análisis de Costos",
      description: "Desglose de costos por célula y período",
      icon: DollarSign,
      category: "Financiero",
    },
    {
      id: "sprint_summary",
      name: "Resumen de Sprints",
      description: "Métricas consolidadas de sprints completados",
      icon: Calendar,
      category: "Sprints",
    },
    {
      id: "quality_metrics",
      name: "Métricas de Calidad",
      description: "Indicadores de calidad y defectos",
      icon: BarChart3,
      category: "Calidad",
    },
    {
      id: "team_performance",
      name: "Rendimiento de Equipos",
      description: "Comparativa de rendimiento entre células",
      icon: Users,
      category: "Rendimiento",
    },
  ]

  const recentReports = [
    {
      id: 1,
      name: "Reporte Velocidad Q1 2024",
      type: "Velocidad",
      generatedAt: "2024-01-15T10:30:00Z",
      size: "2.3 MB",
      format: "Excel",
    },
    {
      id: 2,
      name: "Análisis Costos Enero",
      type: "Costos",
      generatedAt: "2024-01-14T14:20:00Z",
      size: "1.8 MB",
      format: "PDF",
    },
    {
      id: 3,
      name: "Capacidad Células Activas",
      type: "Capacidad",
      generatedAt: "2024-01-13T09:15:00Z",
      size: "3.1 MB",
      format: "Excel",
    },
  ]

  const handleGenerateReport = () => {
    if (!selectedReport) return

    const report = availableReports.find((r) => r.id === selectedReport)
    alert(`Generando ${report?.name} para ${selectedPeriod}...`)
  }

  const handleDownloadReport = (reportId: number) => {
    alert(`Descargando reporte ${reportId}...`)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Rendimiento":
        return "default"
      case "Recursos":
        return "secondary"
      case "Financiero":
        return "outline"
      case "Sprints":
        return "default"
      case "Calidad":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Centro de Reportes</h2>
        <div className="text-sm text-muted-foreground">Genera y descarga reportes personalizados</div>
      </div>

      {/* Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Generar Nuevo Reporte
          </CardTitle>
          <CardDescription>Selecciona los parámetros para generar un reporte personalizado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Reporte</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un reporte" />
                </SelectTrigger>
                <SelectContent>
                  {availableReports.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_quarter">Trimestre Actual</SelectItem>
                  <SelectItem value="last_quarter">Trimestre Anterior</SelectItem>
                  <SelectItem value="current_year">Año Actual</SelectItem>
                  <SelectItem value="last_30_days">Últimos 30 días</SelectItem>
                  <SelectItem value="custom">Período Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Célula</label>
              <Select value={selectedCell} onValueChange={setSelectedCell}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las células</SelectItem>
                  <SelectItem value="frontend">Célula Frontend Alpha</SelectItem>
                  <SelectItem value="backend">Célula Backend Beta</SelectItem>
                  <SelectItem value="devops">Célula DevOps Gamma</SelectItem>
                  <SelectItem value="qa">Célula QA Delta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleGenerateReport} disabled={!selectedReport} className="w-full">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Generar Reporte
          </Button>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Disponibles</CardTitle>
          <CardDescription>Tipos de reportes que puedes generar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <report.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{report.name}</h4>
                      <Badge variant={getCategoryColor(report.category) as any} className="text-xs">
                        {report.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{report.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Recientes</CardTitle>
          <CardDescription>Reportes generados recientemente disponibles para descarga</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{report.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.type} • {new Date(report.generatedAt).toLocaleDateString("es-ES")} • {report.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{report.format}</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadReport(report.id)}>
                    <Download className="h-4 w-4 mr-1" />
                    Descargar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Reportes</CardTitle>
          <CardDescription>Plantillas predefinidas para diferentes necesidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Reporte Ejecutivo Mensual</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Resumen ejecutivo con métricas clave, tendencias y alertas para la dirección.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">Velocidad</Badge>
                <Badge variant="outline">Costos</Badge>
                <Badge variant="outline">Alertas</Badge>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Análisis de Rendimiento por Célula</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Comparativa detallada del rendimiento entre células con recomendaciones.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">Eficiencia</Badge>
                <Badge variant="outline">Calidad</Badge>
                <Badge variant="outline">Capacidad</Badge>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Reporte de Costos Detallado</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Desglose completo de costos por célula, sprint y línea de conocimiento.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">Presupuesto</Badge>
                <Badge variant="outline">ROI</Badge>
                <Badge variant="outline">Proyecciones</Badge>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Dashboard de Métricas en Tiempo Real</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Vista consolidada de todas las métricas actualizadas en tiempo real.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">Live Data</Badge>
                <Badge variant="outline">KPIs</Badge>
                <Badge variant="outline">Alertas</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
