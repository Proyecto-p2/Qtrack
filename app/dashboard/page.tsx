"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Building2, Calendar, FileSpreadsheet, Upload } from "lucide-react";

interface Task {
  id?: number;
  name: string;
  status: 'todo' | 'inProgress' | 'done';
}

interface Sprint {
  id: number;
  cellId: number;
  tasks: Task[];
}

interface Cell {
  id: number;
  name: string;
  tribeName: string;
  agileCoachName: string;
  costPerSprint: number;
  status: "active" | "inactive" | "planning";
  sprints?: Sprint[];
}

export default function DashboardPage() {
  const [cells, setCells] = useState<Cell[]>([]);
  const THRESHOLD = 0.7;

  const fetchCells = async () => {
    try {
      const res = await fetch("/api/cells");
      const data = await res.json();
      const parsedCells: Cell[] = (data.cells || []).map((cell: any) => ({
        ...cell,
        costPerSprint: Number(cell.costPerSprint),
      }));

      // Traer sprints y tasks para calcular completion
      for (const cell of parsedCells) {
        const resSprints = await fetch(`/api/sprints?cellId=${cell.id}`);
        const dataSprints = await resSprints.json();
        cell.sprints = dataSprints.sprints || [];
      }

      setCells(parsedCells);
    } catch (err) {
      console.error("Error al cargar células:", err);
    }
  };

  useEffect(() => {
    fetchCells();
  }, []);

  const calculateCompletion = (cell: Cell) => {
    let totalTasks = 0;
    let doneTasks = 0;
    cell.sprints?.forEach(s => {
      totalTasks += s.tasks.length;
      doneTasks += s.tasks.filter(t => t.status === "done").length;
    });
    if (totalTasks === 0) return 0;
    return (doneTasks / totalTasks) * 100;
  };

  const getProgressColor = (completion: number) => {
    return completion >= THRESHOLD * 100 ? "bg-green-500" : "bg-red-500";
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Activa";
      case "inactive": return "Inactiva";
      case "planning": return "Planificación";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "planning": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="text-sm text-muted-foreground">
          Última actualización: {new Date().toLocaleString("es-ES")}
        </div>
      </div>

      {/* Stats generales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Células Activas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cells.filter(c => c.status === "active" || c.status === "planning").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {cells.length} células totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
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
          <CardTitle>Resumen de Rendimiento</CardTitle>
          <CardDescription>Métricas de completion por célula</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cells.map((cell) => {
              const completion = calculateCompletion(cell);
              return (
                <div key={cell.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{cell.name}</h4>
                    <Badge variant={getStatusColor(cell.status) as any}>
                      {getStatusText(cell.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Porcentaje completado</span>
                      <span>{completion.toFixed(0)}%</span>
                    </div>
                    <Progress value={completion} className={`h-2 ${getProgressColor(completion)}`} />
                  </div>
                </div>
              );
            })}
          </div>
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
            <a href="/dashboard/sprint-planning" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Calendar className="h-5 w-5 text-green-600" />
              <div><p className="font-medium text-sm">Planificación</p><p className="text-xs text-muted-foreground">Planificar sprints</p></div>
            </a>
            <a href="/dashboard/users" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <FileSpreadsheet className="h-5 w-5 text-purple-600" />
              <div><p className="font-medium text-sm">Usuarios</p><p className="text-xs text-muted-foreground">Gestión de usuarios</p></div>
            </a>
            <a href="/dashboard/uploads" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Upload className="h-5 w-5 text-orange-600" />
              <div><p className="font-medium text-sm">Mi Perfil</p><p className="text-xs text-muted-foreground">Administrar perfil</p></div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
