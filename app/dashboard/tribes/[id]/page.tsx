"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, TrendingUp, Users, DollarSign, Target, BarChart3 } from "lucide-react";

interface Task {
  id?: number;
  name: string;
  status: 'todo' | 'inProgress' | 'done';
}

interface Sprint {
  id: number;
  cellId: number;
  name: string;
  quarter: string;
  startDate: string;
  endDate: string;
  plannedPoints: number;
  committedPoints?: number;
  deliveredPoints?: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  tasks: Task[];
}

interface Cell {
  id: number;
  name: string;
  tribeName: string;
  agileCoachName: string;
  agile_coach_user_id?: string;
  memberCount: number;
  costPerSprint: number;
  status: "active" | "inactive" | "planning";
  sprints?: Sprint[];
  agileCoach_info?: {
    id: string;
    fullName: string;
    username: string;
    email: string;
  };
}

interface Tribe {
  id: number;
  name: string;
  leadName: string;
  lead_user_id?: string;
  description?: string;
  createdAt: string;
  leader_info?: {
    id: string;
    fullName: string;
    username: string;
    email: string;
  };
  cells?: Cell[];
}

export default function TribeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tribeId = params.id as string;

  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [loading, setLoading] = useState(true);

  const THRESHOLD = 0.7;

  useEffect(() => {
    const fetchTribeDetails = async () => {
      try {
        setLoading(true);
        
        // Obtener información de la tribu
        const resTribes = await fetch("/api/tribes");
        const dataTribes = await resTribes.json();
        const tribeData = (dataTribes.tribes || []).find((t: any) => t.id === Number(tribeId));
        
        if (!tribeData) {
          router.push("/dashboard/tribes");
          return;
        }

        // Obtener células de la tribu
        const resCells = await fetch("/api/cells");
        const dataCells = await resCells.json();
        const tribeCells = (dataCells.cells || []).filter((cell: any) => cell.tribeName === tribeData.name);

        // Para cada célula, obtener sus sprints
        for (const cell of tribeCells) {
          const resSprints = await fetch(`/api/sprints?cellId=${cell.id}`);
          const dataSprints = await resSprints.json();
          cell.sprints = dataSprints.sprints || [];
        }

        tribeData.cells = tribeCells;
        setTribe(tribeData);
      } catch (error) {
        console.error("Error fetching tribe details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (tribeId) {
      fetchTribeDetails();
    }
  }, [tribeId, router]);

  const calculateTribeCompletion = () => {
    if (!tribe?.cells) return { percentage: 0, doneTasks: 0, totalTasks: 0 };

    let totalTasks = 0;
    let doneTasks = 0;

    tribe.cells.forEach(cell => {
      cell.sprints?.forEach(sprint => {
        totalTasks += sprint.tasks.length;
        doneTasks += sprint.tasks.filter(task => task.status === "done").length;
      });
    });

    return {
      percentage: totalTasks > 0 ? doneTasks / totalTasks : 0,
      doneTasks,
      totalTasks
    };
  };

  const getCellCompletion = (cell: Cell) => {
    let totalTasks = 0;
    let doneTasks = 0;

    cell.sprints?.forEach(sprint => {
      totalTasks += sprint.tasks.length;
      doneTasks += sprint.tasks.filter(task => task.status === "done").length;
    });

    return {
      percentage: totalTasks > 0 ? doneTasks / totalTasks : 0,
      doneTasks,
      totalTasks
    };
  };

  const getTotalCost = () => {
    if (!tribe?.cells) return 0;
    return tribe.cells.reduce((sum, cell) => sum + cell.costPerSprint, 0);
  };

  const getCompletionDistribution = () => {
    if (!tribe?.cells) return { excellent: 0, good: 0, needsImprovement: 0 };

    const excellent = tribe.cells.filter(cell => getCellCompletion(cell).percentage >= 0.9).length;
    const good = tribe.cells.filter(cell => {
      const completion = getCellCompletion(cell).percentage;
      return completion >= THRESHOLD && completion < 0.9;
    }).length;
    const needsImprovement = tribe.cells.filter(cell => getCellCompletion(cell).percentage < THRESHOLD).length;

    return { excellent, good, needsImprovement };
  };

  const getQuarterlyData = () => {
    if (!tribe?.cells) return {};

    const quarterData: Record<string, { totalTasks: number; doneTasks: number; sprints: number }> = {};

    tribe.cells.forEach(cell => {
      cell.sprints?.forEach(sprint => {
        if (!quarterData[sprint.quarter]) {
          quarterData[sprint.quarter] = { totalTasks: 0, doneTasks: 0, sprints: 0 };
        }
        quarterData[sprint.quarter].totalTasks += sprint.tasks.length;
        quarterData[sprint.quarter].doneTasks += sprint.tasks.filter(t => t.status === "done").length;
        quarterData[sprint.quarter].sprints += 1;
      });
    });

    return quarterData;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando detalles de la tribu...</p>
        </div>
      </div>
    );
  }

  if (!tribe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Tribu no encontrada</p>
        </div>
      </div>
    );
  }

  const overallCompletion = calculateTribeCompletion();
  const totalCost = getTotalCost();
  const distribution = getCompletionDistribution();
  const quarterlyData = getQuarterlyData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tribe.name}</h1>
          <p className="text-muted-foreground">{tribe.description || "Sin descripción"}</p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento General</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(overallCompletion.percentage * 100).toFixed(1)}%</div>
            <Progress value={overallCompletion.percentage * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {overallCompletion.doneTasks} de {overallCompletion.totalTasks} tareas completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Células Totales</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tribe.cells?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {distribution.excellent + distribution.good} cumplen la meta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total/Sprint</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Presupuesto agregado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprints Totales</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tribe.cells?.reduce((sum, cell) => sum + (cell.sprints?.length || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all cells</p>
          </CardContent>
        </Card>
      </div>

      {/* Información del líder */}
      <Card>
        <CardHeader>
          <CardTitle>Líder de Tribu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold">
                {tribe.leadName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium">{tribe.leadName}</p>
              {tribe.leader_info && (
                <div className="text-sm text-muted-foreground">
                  <p>@{tribe.leader_info.username}</p>
                  <p>{tribe.leader_info.email}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribución de cumplimiento */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Cumplimiento por Células</CardTitle>
          <CardDescription>Análisis del rendimiento de las células</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{distribution.excellent}</div>
              <p className="text-sm text-muted-foreground">🟢 Excelente (90%+)</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{distribution.good}</div>
              <p className="text-sm text-muted-foreground">🟡 Bueno (70-89%)</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{distribution.needsImprovement}</div>
              <p className="text-sm text-muted-foreground">🔴 Necesita Mejora (&lt;70%)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rendimiento por trimestre */}
      {Object.keys(quarterlyData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Trimestre</CardTitle>
            <CardDescription>Evolución del cumplimiento a lo largo del tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trimestre</TableHead>
                  <TableHead>Sprints</TableHead>
                  <TableHead>Tareas Totales</TableHead>
                  <TableHead>Tareas Completadas</TableHead>
                  <TableHead>Cumplimiento</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(quarterlyData).map(([quarter, data]) => {
                  const completion = data.totalTasks > 0 ? data.doneTasks / data.totalTasks : 0;
                  return (
                    <TableRow key={quarter}>
                      <TableCell className="font-medium">{quarter}</TableCell>
                      <TableCell>{data.sprints}</TableCell>
                      <TableCell>{data.totalTasks}</TableCell>
                      <TableCell>{data.doneTasks}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={completion * 100} className="w-16" />
                          <span className="text-sm">{(completion * 100).toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={completion >= THRESHOLD ? "default" : "destructive"}>
                          {completion >= THRESHOLD ? "✅ Meta" : "⚠️ Bajo meta"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Células de la tribu */}
      <Card>
        <CardHeader>
          <CardTitle>Células de la Tribu</CardTitle>
          <CardDescription>Análisis detallado por célula</CardDescription>
        </CardHeader>
        <CardContent>
          {tribe.cells && tribe.cells.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Célula</TableHead>
                  <TableHead>Agile Coach</TableHead>
                  <TableHead>Sprints</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Cumplimiento</TableHead>
                  <TableHead>Costo/Sprint</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tribe.cells.map((cell) => {
                  const completion = getCellCompletion(cell);
                  return (
                    <TableRow key={cell.id}>
                      <TableCell className="font-medium">{cell.name}</TableCell>
                      <TableCell>{cell.agileCoachName}</TableCell>
                      <TableCell>{cell.sprints?.length || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={completion.percentage * 100} className="w-16" />
                          <span className="text-sm">{(completion.percentage * 100).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <Badge 
                            variant={completion.percentage >= THRESHOLD ? "default" : "destructive"}
                            className="mb-1"
                          >
                            {completion.percentage >= 0.9 ? "🟢" : 
                             completion.percentage >= THRESHOLD ? "🟡" : "🔴"}
                            {(completion.percentage * 100).toFixed(0)}%
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {completion.doneTasks}/{completion.totalTasks}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>${cell.costPerSprint.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/dashboard/cells/${cell.id}`)}
                        >
                          Ver detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay células asignadas a esta tribu</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
