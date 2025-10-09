"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, Users, AlertTriangle, Target, Clock, DollarSign, Activity, CheckCircle } from "lucide-react";
import { Building2, Calendar, Upload, FileSpreadsheet } from "lucide-react";

interface Cell {
  id: number;
  name: string;
  tribeName: string;
  avgVelocity: number;
  currentSprintPoints: number;
  memberCount: number;
  costPerSprint: number;
  status: "active" | "inactive" | "planning";
}

export default function DashboardPage() {
  const [cells, setCells] = useState<Cell[]>([]);

  // Fetch de células reales
  const fetchCells = async () => {
    try {
      const res = await fetch("/api/cells");
      const data = await res.json();
      console.log("Células cargadas:", data);
      const parsedCells: Cell[] = (data.cells || []).map((cell: any) => ({
        ...cell,
        avgVelocity: Number(cell.avgVelocity),
        currentSprintPoints: Number(cell.currentSprintPoints ?? 0),
        memberCount: Number(cell.memberCount ?? 0),
        costPerSprint: Number(cell.costPerSprint ?? 0),
      }));
      setCells(parsedCells);
    } catch (err) {
      console.error("Error al cargar células:", err);
    }
  };

  useEffect(() => {
    fetchCells();
  }, []);

  // Datos de alertas (ejemplo)
  const alerts = [
    { id: 1, title: "Sobrecarga detectada en Sprint 23", severity: "high", cellName: "Célula Frontend", createdAt: "2024-01-15" },
    { id: 2, title: "Bajo rendimiento en línea Backend", severity: "medium", cellName: "Célula Fullstack", createdAt: "2024-01-14" },
    { id: 3, title: "Costo excedido en 15%", severity: "critical", cellName: "Célula DevOps", createdAt: "2024-01-13" },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

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
        <div className="text-2xl font-bold">
          {
            cells.filter(c => c.status === "active" || c.status === "planning").length
          }
        </div>
        <p className="text-xs text-muted-foreground">
          {cells.reduce((sum, c) => sum + c.memberCount, 0)} miembros totales
        </p>
      </CardContent>
    </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${cells.reduce((sum, c) => sum + c.costPerSprint, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Por sprint actual</p>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Resumen de Rendimiento</CardTitle>
          <CardDescription>Métricas clave de las células más activas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {cells.map((cell, index) => {
              const efficiency = cell.currentSprintPoints
                ? Math.min(Math.round((cell.avgVelocity / cell.currentSprintPoints) * 100), 100)
                : 0;

              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{cell.name}</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Eficiencia</span>
                      <span>{efficiency}%</span>
                    </div>
                    <Progress value={efficiency} className="h-1" />
                    <p className="text-xs text-muted-foreground">{cell.memberCount} miembros activos</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alertas recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Alertas Recientes</CardTitle>
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

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5" />Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a href="/dashboard/cells" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div><p className="font-medium text-sm">Gestionar Células</p><p className="text-xs text-muted-foreground">Ver y editar células</p></div>
            </a>
            <a href="/dashboard/sprints" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Calendar className="h-5 w-5 text-green-600" />
              <div><p className="font-medium text-sm">Sprints</p><p className="text-xs text-muted-foreground">Ver avances por sprint</p></div>
            </a>
            <a href="/dashboard/reports" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <FileSpreadsheet className="h-5 w-5 text-purple-600" />
              <div><p className="font-medium text-sm">Reportes</p><p className="text-xs text-muted-foreground">Generar reportes PDF/Excel</p></div>
            </a>
            <a href="/dashboard/uploads" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Upload className="h-5 w-5 text-orange-600" />
              <div><p className="font-medium text-sm">Subir Datos</p><p className="text-xs text-muted-foreground">Actualizar información de células</p></div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
