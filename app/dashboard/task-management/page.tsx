"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, AlertCircle } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
  story_points: number;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  sprint_name: string;
  cell_name: string;
  tribe_name: string;
  assigned_user_name: string;
  assigned_username: string;
  estimated_hours: number;
  actual_hours: number;
  created_at: string;
}

interface Sprint {
  id: number;
  name: string;
  quarter: string;
  cell_id: number;
  cell_name: string;
}

interface Cell {
  id: number;
  name: string;
  tribeName: string;
}

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

export default function TaskManagementPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sprintFilter, setSprintFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    sprintId: "",
    title: "",
    description: "",
    storyPoints: 0,
    taskType: "planned",
    priority: "medium",
    assignedTo: "",
    estimatedHours: 0
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTasks(),
      fetchSprints(),
      fetchCells()
    ]);
    setLoading(false);
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/user-tasks');
      if (!response.ok) {
        throw new Error('Error fetching tasks');
      }
      const data = await response.json();
      console.log('✅ Tareas obtenidas:', data.tasks?.length || 0);
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Error al cargar las tareas');
    }
  };

  const fetchSprints = async () => {
    try {
      const response = await fetch('/api/sprints');
      if (!response.ok) {
        throw new Error('Error fetching sprints');
      }
      const data = await response.json();
      setSprints(data.sprints || []);
    } catch (error) {
      console.error('Error fetching sprints:', error);
      setError('Error al cargar los sprints');
    }
  };

  const fetchCells = async () => {
    try {
      const response = await fetch('/api/cells');
      if (!response.ok) {
        throw new Error('Error fetching cells');
      }
      const data = await response.json();
      setCells(data.cells || []);
    } catch (error) {
      console.error('Error fetching cells:', error);
      setError('Error al cargar las celdas');
    }
  };

  const handleCreateTask = async () => {
    if (!formData.sprintId || !formData.title.trim()) {
      setError('Por favor completa los campos requeridos (Sprint y Título)');
      return;
    }

    try {
      setError(null);
      const payload = {
        sprintId: parseInt(formData.sprintId),
        title: formData.title.trim(),
        description: formData.description.trim(),
        storyPoints: parseInt(formData.storyPoints.toString()) || 0,
        taskType: formData.taskType,
        priority: formData.priority,
        assignedTo: formData.assignedTo.trim() || null,
        estimatedHours: parseFloat(formData.estimatedHours.toString()) || 0
      };

      console.log('📤 Enviando payload:', payload);

      const response = await fetch('/api/user-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Error al crear la tarea';
        throw new Error(errorMsg);
      }

      setSuccessMessage('Tarea creada exitosamente');
      setOpen(false);
      setFormData({
        sprintId: "",
        title: "",
        description: "",
        storyPoints: 0,
        taskType: "planned",
        priority: "medium",
        assignedTo: "",
        estimatedHours: 0
      });
      
      // Recargar tareas
      setTimeout(() => fetchTasks(), 500);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error instanceof Error ? error.message : 'Error al crear la tarea');
    }
  };

  const updateTaskAssignment = async (taskId: number, newAssignedTo: string) => {
    try {
      setError(null);
      const response = await fetch('/api/user-tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          taskId, 
          assignedTo: newAssignedTo.trim() || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar la asignación');
      }

      setSuccessMessage('Asignación actualizada');
      setTimeout(() => fetchTasks(), 300);
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (error) {
      console.error('Error updating task assignment:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar la asignación');
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      setError(null);
      const response = await fetch('/api/user-tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar el estado');
      }

      setSuccessMessage('Estado actualizado');
      setTimeout(() => fetchTasks(), 300);
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (error) {
      console.error('Error updating task status:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el estado');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesSprint = sprintFilter === "all" || task.sprint_name === sprintFilter;
    const matchesUser = userFilter === "all" || 
                       (userFilter === "unassigned" && !task.assigned_user_name) ||
                       task.assigned_username === userFilter;
    
    return matchesSearch && matchesStatus && matchesSprint && matchesUser;
  });

  const taskStats = {
    total: tasks.length,
    assigned: tasks.filter(t => t.assigned_user_name).length,
    unassigned: tasks.filter(t => !t.assigned_user_name).length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando gestión de tareas...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Tareas</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Tarea</DialogTitle>
              <DialogDescription>
                Crea una nueva tarea y asígnala a un usuario
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sprint">Sprint *</Label>
                  <Select value={formData.sprintId} onValueChange={(value) => setFormData({...formData, sprintId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      {sprints.map((sprint) => (
                        <SelectItem key={sprint.id} value={sprint.id.toString()}>
                          {sprint.name} - {sprint.cell_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Título de la tarea"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción detallada de la tarea"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storyPoints">Story Points</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.storyPoints}
                    onChange={(e) => setFormData({...formData, storyPoints: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Horas Estimadas</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({...formData, estimatedHours: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTask}>
                  Crear Tarea
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{taskStats.assigned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sin Asignar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{taskStats.unassigned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{taskStats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bloqueadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{taskStats.blocked}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="todo">Por Hacer</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="review">En Revisión</SelectItem>
                  <SelectItem value="done">Completadas</SelectItem>
                  <SelectItem value="blocked">Bloqueadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sprint</Label>
              <Select value={sprintFilter} onValueChange={setSprintFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {[...new Set(tasks.map(t => t.sprint_name).filter(Boolean))].map((sprint) => (
                    <SelectItem key={sprint} value={sprint}>
                      {String(sprint).trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                  {[...new Map(tasks.filter(t => t.assigned_user_name).map(t => [
                    t.assigned_username, 
                    { username: t.assigned_username, name: t.assigned_user_name }
                  ])).values()].map((user) => (
                    <SelectItem key={user.username} value={user.username}>
                      {user.name} (@{user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tareas</CardTitle>
          <CardDescription>
            {filteredTasks.length} tareas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="w-full">
            <div className="border rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-100 grid grid-cols-7 gap-4 p-4 font-semibold text-sm">
                <div>Tarea</div>
                <div>Sprint</div>
                <div>Asignado a</div>
                <div>Estado</div>
                <div>Prioridad</div>
                <div>Points</div>
                <div>Acciones</div>
              </div>

              {/* Table Body */}
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No hay tareas que coincidan con los filtros
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} className="border-t grid grid-cols-7 gap-4 p-4 items-center hover:bg-gray-50">
                    <div>
                      <div className="font-medium text-sm">{task.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {task.description}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{task.sprint_name}</div>
                      <div className="text-xs text-muted-foreground">{task.cell_name}</div>
                    </div>
                    <div className="space-y-2">
                      {task.assigned_user_name ? (
                        <div>
                          <div className="font-medium text-xs">{task.assigned_user_name}</div>
                          <div className="text-xs text-muted-foreground">@{task.assigned_username}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Sin asignar</span>
                      )}
                      <Input
                        placeholder="Cambiar asignación"
                        value={task.assigned_to || ""}
                        onChange={(e) => updateTaskAssignment(task.id, e.target.value)}
                        className="w-32 h-7 text-xs"
                      />
                    </div>
                    <div>
                      <Badge className={`${statusColors[task.status]} text-white text-xs`}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <Badge className={`${priorityColors[task.priority]} text-xs`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium">{task.story_points}</div>
                    <div>
                      <Select
                        value={task.status}
                        onValueChange={(value) => updateTaskStatus(task.id, value)}
                      >
                        <SelectTrigger className="w-28 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">Por Hacer</SelectItem>
                          <SelectItem value="in_progress">En Progreso</SelectItem>
                          <SelectItem value="review">En Revisión</SelectItem>
                          <SelectItem value="done">Completada</SelectItem>
                          <SelectItem value="blocked">Bloqueada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}