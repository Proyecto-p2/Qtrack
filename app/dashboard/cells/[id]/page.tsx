"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Calendar, Users, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";

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

interface Member {
  id: string;
  nombre: string;
  usuario: string;
  correo: string;
  rol: string;
}

export default function CellDetailPage() {
  const router = useRouter();
  const params = useParams();
  const cellId = params.id as string;

  const [cell, setCell] = useState<Cell | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const THRESHOLD = 0.7;

  useEffect(() => {
    const fetchCellDetails = async () => {
      try {
        setLoading(true);
        
        // Obtener información de la célula
        const resCells = await fetch("/api/cells");
        const dataCells = await resCells.json();
        const cellData = (dataCells.cells || []).find((c: any) => c.id === Number(cellId));
        
        if (!cellData) {
          router.push("/dashboard/cells");
          return;
        }

        // Obtener sprints de la célula
        const resSprints = await fetch(`/api/sprints?cellId=${cellId}`);
        const dataSprints = await resSprints.json();
        cellData.sprints = dataSprints.sprints || [];

        // Obtener miembros de la célula
        const resMembers = await fetch(`/api/cells/${cellId}/members`);
        if (resMembers.ok) {
          const dataMembers = await resMembers.json();
          setMembers(dataMembers.members || []);
        }

        setCell(cellData);
      } catch (error) {
        console.error("Error fetching cell details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (cellId) {
      fetchCellDetails();
    }
  }, [cellId, router]);

  const calculateOverallCompletion = () => {
    if (!cell?.sprints) return { percentage: 0, doneTasks: 0, totalTasks: 0 };
    
    let totalTasks = 0;
    let doneTasks = 0;
    
    cell.sprints.forEach(sprint => {
      totalTasks += sprint.tasks.length;
      doneTasks += sprint.tasks.filter(task => task.status === "done").length;
    });

    return {
      percentage: totalTasks > 0 ? doneTasks / totalTasks : 0,
      doneTasks,
      totalTasks
    };
  };

  const getSprintCompletion = (sprint: Sprint) => {
    const totalTasks = sprint.tasks.length;
    const doneTasks = sprint.tasks.filter(task => task.status === "done").length;
    const inProgressTasks = sprint.tasks.filter(task => task.status === "inProgress").length;
    
    return {
      percentage: totalTasks > 0 ? doneTasks / totalTasks : 0,
      doneTasks,
      inProgressTasks,
      totalTasks
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inProgress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'todo': return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSprintStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'active': return 'secondary';
      case 'planning': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando detalles de la célula...</p>
        </div>
      </div>
    );
  }

  if (!cell) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Célula no encontrada</p>
        </div>
      </div>
    );
  }

  const overallCompletion = calculateOverallCompletion();
  const activeSprints = cell.sprints?.filter(s => s.status === 'active') || [];
  const completedSprints = cell.sprints?.filter(s => s.status === 'completed') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{cell.name}</h1>
          <p className="text-muted-foreground">Tribu: {cell.tribeName}</p>
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
            <CardTitle className="text-sm font-medium">Sprints Totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cell.sprints?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {completedSprints.length} completados, {activeSprints.length} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">Integrantes del equipo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo/Sprint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cell.costPerSprint.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Presupuesto asignado</p>
          </CardContent>
        </Card>
      </div>

      {/* Información del Agile Coach */}
      <Card>
        <CardHeader>
          <CardTitle>Agile Coach</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold">
                {cell.agileCoachName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium">{cell.agileCoachName}</p>
              {cell.agileCoach_info && (
                <div className="text-sm text-muted-foreground">
                  <p>@{cell.agileCoach_info.username}</p>
                  <p>{cell.agileCoach_info.email}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sprints detallados */}
      <Card>
        <CardHeader>
          <CardTitle>Sprints - Análisis de Cumplimiento</CardTitle>
          <CardDescription>Desglose detallado del progreso por sprint</CardDescription>
        </CardHeader>
        <CardContent>
          {cell.sprints && cell.sprints.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sprint</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Tareas</TableHead>
                  <TableHead>Cumplimiento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cell.sprints.map((sprint) => {
                  const completion = getSprintCompletion(sprint);
                  return (
                    <TableRow key={sprint.id}>
                      <TableCell className="font-medium">{sprint.name}</TableCell>
                      <TableCell>
                        <Badge variant={getSprintStatusColor(sprint.status) as any}>
                          {sprint.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(sprint.startDate).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">
                            {new Date(sprint.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full">
                          <Progress value={completion.percentage * 100} className="mb-1" />
                          <span className="text-xs text-muted-foreground">
                            {(completion.percentage * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>✅ {completion.doneTasks} completadas</p>
                          <p>🔄 {completion.inProgressTasks} en progreso</p>
                          <p>📋 {completion.totalTasks} total</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={completion.percentage >= THRESHOLD ? "default" : "destructive"}
                        >
                          {completion.percentage >= THRESHOLD ? "✅ Cumple" : "⚠️ Bajo meta"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay sprints registrados para esta célula</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Miembros del equipo */}
      <Card>
        <CardHeader>
          <CardTitle>Miembros del Equipo</CardTitle>
          <CardDescription>{members.length} integrantes</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {member.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{member.nombre}</p>
                        <p className="text-sm text-muted-foreground truncate">@{member.usuario}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {member.rol}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay miembros asignados a esta célula</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
