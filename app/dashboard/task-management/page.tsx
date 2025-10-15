"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, Users, BarChart3 } from "lucide-react";

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

interface User {
  id: string;
  usuario: string;
  nombre: string;
  correo: string;
  rol: string;
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
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sprintFilter, setSprintFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [open, setOpen] = useState(false);

  // Form state for new task
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
    if (session?.user) {
      fetchTasks();
      fetchSprints();
      fetchUsers();
      fetchCells();
    }
  }, [session]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/user-tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchSprints = async () => {
    try {
      const response = await fetch('/api/sprints');
      const data = await response.json();
      setSprints(data.sprints || []);
    } catch (error) {
      console.error('Error fetching sprints:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCells = async () => {
    try {
      const response = await fetch('/api/cells');
      const data = await response.json();
      setCells(data.cells || []);
    } catch (error) {
      console.error('Error fetching cells:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const response = await fetch('/api/user-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
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
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskAssignment = async (taskId: number, newAssignedTo: string) => {
    try {
      const response = await fetch('/api/user-tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          taskId, 
          assignedTo: newAssignedTo || null 
        })
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task assignment:', error);
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
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesSprint = sprintFilter === "all" || (task as any).sprint_name === sprintFilter;
    const matchesUser = userFilter === "all" || 
                       (userFilter === "unassigned" && !(task as any).assigned_user_name) ||
                       (task as any).assigned_username === userFilter;
    
    return matchesSearch && matchesStatus && matchesSprint && matchesUser;
  });

  const taskStats = {
    total: tasks.length,
    assigned: tasks.filter(t => (t as any).assigned_user_name).length,
    unassigned: tasks.filter(t => !(t as any).assigned_user_name).length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando gestión de tareas...</div>;
  }

  return (
    <div className="space-y-6">
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
                  <Label htmlFor="sprint">Sprint</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Asignar a Usuario</Label>
                  <Select value={formData.assignedTo} onValueChange={(value) => setFormData({...formData, assignedTo: value === "unassigned" ? "" : value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Sin asignar</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.nombre} (@{user.usuario})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
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
                  {[...new Set(tasks.map(t => (t as any).sprint_name).filter(Boolean))].map((sprint) => (
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
                  {[...new Map(tasks.filter(t => (t as any).assigned_user_name).map(t => [
                    (t as any).assigned_username, 
                    { username: (t as any).assigned_username, name: (t as any).assigned_user_name }
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarea</TableHead>
                <TableHead>Sprint</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {task.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.sprint_name}</div>
                      <div className="text-sm text-muted-foreground">{task.cell_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {(task as any).assigned_user_name ? (
                        <div>
                          <div className="font-medium">{(task as any).assigned_user_name}</div>
                          <div className="text-sm text-muted-foreground">@{(task as any).assigned_username}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Sin asignar</span>
                      )}
                    </div>
                    <Select
                      value={(task as any).assigned_to || "unassigned"}
                      onValueChange={(value) => updateTaskAssignment(task.id, value === "unassigned" ? "" : value)}
                    >
                      <SelectTrigger className="w-40 mt-2">
                        <SelectValue placeholder="Cambiar asignación" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Sin asignar</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[task.status]} text-white`}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[task.priority]}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.story_points}</TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
