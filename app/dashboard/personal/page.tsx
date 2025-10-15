"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { 
  CheckCircle, Clock, AlertCircle, TrendingUp, TrendingDown, 
  Target, Timer, Award, Activity
} from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
  story_points: number;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  sprint_name: string;
  cell_name: string;
  estimated_hours: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
}

interface Metrics {
  id: number;
  user_id: string;
  sprint_name: string;
  quarter: string;
  cell_name: string;
  tribe_name: string;
  tasks_assigned: number;
  tasks_completed: number;
  tasks_in_progress: number;
  tasks_todo: number;
  tasks_blocked: number;
  story_points_assigned: number;
  story_points_completed: number;
  estimated_hours: number;
  actual_hours: number;
  completion_rate: number;
  velocity: number;
  efficiency: number;
  calculated_at: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const statusColors = {
  todo: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  review: 'bg-yellow-500',
  done: 'bg-green-500',
  blocked: 'bg-red-500'
};

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

export default function PersonalDashboardPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<Metrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSprint, setSelectedSprint] = useState<string>("all");

  useEffect(() => {
    if (session?.user) {
      fetchTasks();
    }
  }, [session]);

  useEffect(() => {
    // Recalcular métricas cuando las tareas cambien
    if (tasks.length >= 0) {
      fetchMetrics();
    }
  }, [tasks, session]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/user-tasks?assignedToMe=true');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      // Intentar obtener métricas específicas del usuario
      const response = await fetch(`/api/user-metrics?userId=${(session?.user as any)?.id}`);
      const data = await response.json();
      
      // Si no hay métricas específicas, calcular desde las tareas
      if (!data.metrics || data.metrics.length === 0) {
        // Calcular métricas básicas desde las tareas disponibles
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
        const todoTasks = tasks.filter(t => t.status === 'todo').length;
        const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
        
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.story_points || 0), 0);
        const completedStoryPoints = tasks.filter(t => t.status === 'done').reduce((sum, task) => sum + (task.story_points || 0), 0);
        const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
        const totalActualHours = tasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0);
        
        const velocity = totalEstimatedHours > 0 ? completedStoryPoints / totalEstimatedHours : 0;
        const efficiency = totalActualHours > 0 ? (totalEstimatedHours / totalActualHours) * 100 : 100;

        // Crear métrica calculada
        const calculatedMetric: Metrics = {
          id: 1,
          user_id: (session?.user as any)?.id || '',
          sprint_name: 'Sprint Actual',
          quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
          cell_name: 'Mi Célula',
          tribe_name: 'Mi Tribu',
          tasks_assigned: totalTasks,
          tasks_completed: completedTasks,
          tasks_in_progress: inProgressTasks,
          tasks_todo: todoTasks,
          tasks_blocked: blockedTasks,
          story_points_assigned: totalStoryPoints,
          story_points_completed: completedStoryPoints,
          estimated_hours: totalEstimatedHours,
          actual_hours: totalActualHours,
          completion_rate: completionRate,
          velocity: velocity,
          efficiency: Math.min(efficiency, 100),
          calculated_at: new Date().toISOString()
        };
        
        setMetrics([calculatedMetric]);
      } else {
        setMetrics(data.metrics || []);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      // Si falla completamente, crear métricas básicas desde las tareas
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      const basicMetric: Metrics = {
        id: 1,
        user_id: (session?.user as any)?.id || '',
        sprint_name: 'Sprint Actual',
        quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
        cell_name: 'Mi Célula',
        tribe_name: 'Mi Tribu',
        tasks_assigned: totalTasks,
        tasks_completed: completedTasks,
        tasks_in_progress: tasks.filter(t => t.status === 'in_progress').length,
        tasks_todo: tasks.filter(t => t.status === 'todo').length,
        tasks_blocked: tasks.filter(t => t.status === 'blocked').length,
        story_points_assigned: 0,
        story_points_completed: 0,
        estimated_hours: 0,
        actual_hours: 0,
        completion_rate: completionRate,
        velocity: 0,
        efficiency: 100,
        calculated_at: new Date().toISOString()
      };
      
      setMetrics([basicMetric]);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/user-tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus })
      });

      if (response.ok) {
        fetchTasks();
        // Recalcular métricas después de actualizar tarea
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          const sprint = metrics.find(m => m.sprint_name === task.sprint_name);
          if (sprint) {
            await fetch('/api/user-metrics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                userId: (session?.user as any)?.id, 
                sprintId: sprint.id 
              })
            });
            fetchMetrics();
          }
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const filteredTasks = selectedSprint === "all" 
    ? tasks 
    : tasks.filter(task => task.sprint_name === selectedSprint);

  const currentMetrics = metrics.length > 0 ? metrics[0] : null;

  const taskStatusData = [
    { name: 'Por Hacer', value: filteredTasks.filter(t => t.status === 'todo').length, color: '#9CA3AF' },
    { name: 'En Progreso', value: filteredTasks.filter(t => t.status === 'in_progress').length, color: '#3B82F6' },
    { name: 'En Revisión', value: filteredTasks.filter(t => t.status === 'review').length, color: '#F59E0B' },
    { name: 'Completadas', value: filteredTasks.filter(t => t.status === 'done').length, color: '#10B981' },
    { name: 'Bloqueadas', value: filteredTasks.filter(t => t.status === 'blocked').length, color: '#EF4444' }
  ];

  const sprintPerformance = metrics.map(m => ({
    sprint: m.sprint_name,
    completion_rate: m.completion_rate,
    velocity: m.velocity,
    efficiency: m.efficiency
  }));

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando dashboard personal...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mi Dashboard Personal</h1>
        <div className="flex gap-2">
          <Button onClick={fetchTasks} variant="outline" size="sm">
            Actualizar Tareas
          </Button>
          <Button onClick={fetchMetrics} variant="outline" size="sm">
            Recalcular Métricas
          </Button>
        </div>
      </div>

      {/* Métricas Resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Asignadas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter(t => t.status === 'done').length} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Completación</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.length > 0 ? ((tasks.filter(t => t.status === 'done').length / tasks.length) * 100).toFixed(1) : '0'}%
            </div>
            <Progress 
              value={tasks.length > 0 ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 : 0} 
              className="w-full h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {tasks.filter(t => t.status === 'done').length} de {tasks.length} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Velocidad</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(t => t.status === 'done').reduce((sum, task) => sum + (task.story_points || 1), 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Story points completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const totalEstimated = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
                const totalActual = tasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0);
                if (totalActual === 0) return '100';
                const efficiency = (totalEstimated / totalActual) * 100;
                return Math.min(efficiency, 999).toFixed(1);
              })()}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tiempo estimado vs real
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Mis Tareas</TabsTrigger>
          <TabsTrigger value="metrics">Métricas Detalladas</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mis Tareas Activas</CardTitle>
              <CardDescription>
                Gestiona tus tareas asignadas y actualiza su estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{task.sprint_name}</Badge>
                        <Badge variant="outline">{task.cell_name}</Badge>
                        <Badge className={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {task.story_points} pts
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusColors[task.status]} text-white`}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="todo">Por Hacer</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="review">En Revisión</option>
                        <option value="done">Completada</option>
                        <option value="blocked">Bloqueada</option>
                      </select>
                    </div>
                  </div>
                ))}
                
                {filteredTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No tienes tareas asignadas actualmente
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Tareas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas por Sprint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{metric.sprint_name}</h4>
                      <p className="text-sm text-muted-foreground">{metric.cell_name} - {metric.quarter}</p>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Completación:</span>
                          <div className="font-medium">{metric.completion_rate.toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Velocidad:</span>
                          <div className="font-medium">{metric.velocity.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Eficiencia:</span>
                          <div className="font-medium">{metric.efficiency.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Rendimiento</CardTitle>
              <CardDescription>
                Evolución de tus métricas a lo largo de los sprints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={sprintPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sprint" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="completion_rate" stroke="#8884d8" name="Tasa Completación %" />
                  <Line type="monotone" dataKey="velocity" stroke="#82ca9d" name="Velocidad" />
                  <Line type="monotone" dataKey="efficiency" stroke="#ffc658" name="Eficiencia %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
