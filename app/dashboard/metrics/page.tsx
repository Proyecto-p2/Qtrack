"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target, Users, DollarSign, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react"

interface MetricData {
  cellName: string
  velocity: number
  targetVelocity: number
  efficiency: number
  qualityScore: number
  memberCount: number
  sprintCost: number
  plannedVsUnplanned: {
    planned: number
    unplanned: number
  }
}

export default function MetricsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("current_quarter")
  const [selectedCell, setSelectedCell] = useState("all")

  const metrics: MetricData[] = [
    {
      cellName: "Célula Frontend Alpha",
      velocity: 42,
      targetVelocity: 40,
      efficiency: 87,
      qualityScore: 92,
      memberCount: 6,
      sprintCost: 15000,
      plannedVsUnplanned: { planned: 75, unplanned: 25 },
    },
    {
      cellName: "Célula Backend Beta",
      velocity: 35,
      targetVelocity: 38,
      efficiency: 78,
      qualityScore: 88,
      memberCount: 5,
      sprintCost: 18000,
      plannedVsUnplanned: { planned: 68, unplanned: 32 },
    },
    {
      cellName: "Célula DevOps Gamma",
      velocity: 28,
      targetVelocity: 30,
      efficiency: 82,
      qualityScore: 95,
      memberCount: 4,
      sprintCost: 22000,
      plannedVsUnplanned: { planned: 85, unplanned: 15 },
    },
    {
      cellName: "Célula QA Delta",
      velocity: 25,
      targetVelocity: 25,
      efficiency: 90,
      qualityScore: 96,
      memberCount: 3,
      sprintCost: 12000,
      plannedVsUnplanned: { planned: 88, unplanned: 12 },
    },
  ]

  const getPerformanceColor = (actual: number, target: number) => {
    const ratio = actual / target
    if (ratio >= 1.1) return "text-green-600"
    if (ratio >= 0.9) return "text-yellow-600"
    return "text-red-600"
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 85) return "text-green-600"
    if (efficiency >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const totalMetrics = metrics.reduce(
    (acc, metric) => ({
      totalVelocity: acc.totalVelocity + metric.velocity,
      totalTargetVelocity: acc.totalTargetVelocity + metric.targetVelocity,
      avgEfficiency: acc.avgEfficiency + metric.efficiency,
      avgQuality: acc.avgQuality + metric.qualityScore,
      totalMembers: acc.totalMembers + metric.memberCount,
      totalCost: acc.totalCost + metric.sprintCost,
    }),
    {
      totalVelocity: 0,
      totalTargetVelocity: 0,
      avgEfficiency: 0,
      avgQuality: 0,
      totalMembers: 0,
      totalCost: 0,
    },
  )

  const avgEfficiency = metrics.length > 0 ? totalMetrics.avgEfficiency / metrics.length : 0
  const avgQuality = metrics.length > 0 ? totalMetrics.avgQuality / metrics.length : 0

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
            <CardTitle className="text-sm font-medium">Velocidad Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalVelocity}</div>
            <p className="text-xs text-muted-foreground">Objetivo: {totalMetrics.totalTargetVelocity} puntos</p>
            <div
              className={`text-xs ${getPerformanceColor(totalMetrics.totalVelocity, totalMetrics.totalTargetVelocity)}`}
            >
              {((totalMetrics.totalVelocity / totalMetrics.totalTargetVelocity - 1) * 100).toFixed(1)}% vs objetivo
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia Promedio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEfficiency.toFixed(1)}%</div>
            <Progress value={avgEfficiency} className="mt-2" />
            <p className={`text-xs mt-1 ${getEfficiencyColor(avgEfficiency)}`}>
              {avgEfficiency >= 85 ? "Excelente" : avgEfficiency >= 70 ? "Bueno" : "Necesita mejora"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calidad Promedio</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgQuality.toFixed(1)}%</div>
            <Progress value={avgQuality} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Score de calidad general</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMetrics.totalCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{totalMetrics.totalMembers} miembros activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tendencias de Rendimiento
          </CardTitle>
          <CardDescription>Evolución de métricas en los últimos 6 sprints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Gráfico de tendencias de velocidad y eficiencia</p>
              <p className="text-sm text-muted-foreground mt-2">
                Aquí se mostraría un gráfico interactivo con la evolución de las métricas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics by Cell */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Detalladas por Célula</CardTitle>
          <CardDescription>Rendimiento individual de cada célula de trabajo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {metrics.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{metric.cellName}</h3>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{metric.memberCount} miembros</span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Velocidad</span>
                      <span className={`text-sm ${getPerformanceColor(metric.velocity, metric.targetVelocity)}`}>
                        {metric.velocity}/{metric.targetVelocity}
                      </span>
                    </div>
                    <Progress value={(metric.velocity / metric.targetVelocity) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Eficiencia</span>
                      <span className={`text-sm ${getEfficiencyColor(metric.efficiency)}`}>{metric.efficiency}%</span>
                    </div>
                    <Progress value={metric.efficiency} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Calidad</span>
                      <span className="text-sm text-green-600">{metric.qualityScore}%</span>
                    </div>
                    <Progress value={metric.qualityScore} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Costo Sprint</span>
                      <span className="text-sm">${metric.sprintCost.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${(metric.sprintCost / metric.memberCount).toLocaleString()} por miembro
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Trabajo Planificado vs No Planificado</span>
                    <div className="flex gap-2">
                      <Badge variant="default">{metric.plannedVsUnplanned.planned}% Planificado</Badge>
                      <Badge variant="outline">{metric.plannedVsUnplanned.unplanned}% No Planificado</Badge>
                    </div>
                  </div>
                  <div className="mt-2 flex h-2 rounded-full overflow-hidden bg-muted">
                    <div className="bg-blue-600" style={{ width: `${metric.plannedVsUnplanned.planned}%` }} />
                    <div className="bg-orange-500" style={{ width: `${metric.plannedVsUnplanned.unplanned}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.flatMap((metric, index) => {
              const alerts = []

              if (metric.velocity < metric.targetVelocity * 0.9) {
                alerts.push({
                  type: "velocity",
                  message: `Velocidad por debajo del objetivo (${metric.velocity}/${metric.targetVelocity})`,
                  severity: "medium",
                })
              }

              if (metric.efficiency < 70) {
                alerts.push({
                  type: "efficiency",
                  message: `Eficiencia baja (${metric.efficiency}%)`,
                  severity: "high",
                })
              }

              if (metric.plannedVsUnplanned.unplanned > 30) {
                alerts.push({
                  type: "planning",
                  message: `Alto porcentaje de trabajo no planificado (${metric.plannedVsUnplanned.unplanned}%)`,
                  severity: "medium",
                })
              }

              return alerts.map((alert, alertIndex) => (
                <div key={`${index}-${alertIndex}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className={`h-4 w-4 ${alert.severity === "high" ? "text-red-500" : "text-yellow-500"}`}
                    />
                    <div>
                      <p className="font-medium text-sm">{metric.cellName}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <Badge variant={alert.severity === "high" ? "destructive" : "default"}>
                    {alert.severity === "high" ? "Alta" : "Media"}
                  </Badge>
                </div>
              ))
            })}

            {metrics.every(
              (metric) =>
                metric.velocity >= metric.targetVelocity * 0.9 &&
                metric.efficiency >= 70 &&
                metric.plannedVsUnplanned.unplanned <= 30,
            ) && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  ¡Excelente! Todas las células están dentro de los parámetros esperados.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
