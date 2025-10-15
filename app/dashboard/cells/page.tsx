"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  memberCount: number;
  costPerSprint: number;
  status: "active" | "inactive" | "planning";
  sprints?: Sprint[];
}

interface Tribe {
  id: number;
  name: string;
}

export default function CellsPage() {
  const router = useRouter();
  const [cells, setCells] = useState<Cell[]>([]);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [tribeName, setTribeName] = useState("");
  const [agileCoachName, setAgileCoachName] = useState("");
  const [costPerSprint, setCostPerSprint] = useState(0);

  const THRESHOLD = 0.7; // 70% completadas mínimo

  const fetchCells = async () => {
    const res = await fetch("/api/cells");
    const data = await res.json();
    const parsedCells: Cell[] = (data.cells || []).map((cell: any) => ({
      ...cell,
      memberCount: Number(cell.memberCount),
      costPerSprint: Number(cell.costPerSprint),
    }));

    // Para cada célula, traer sus sprints y tasks
    for (const cell of parsedCells) {
      const resSprints = await fetch(`/api/sprints?cellId=${cell.id}`);
      const dataSprints = await resSprints.json();
      cell.sprints = dataSprints.sprints || [];
    }

    setCells(parsedCells);
  };

  const fetchTribes = async () => {
    const res = await fetch("/api/tribes");
    const data = await res.json();
    setTribes(data.tribes || []);
  };

  useEffect(() => {
    fetchCells();
    fetchTribes();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !tribeName.trim() || !agileCoachName.trim() || !costPerSprint) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const res = await fetch("/api/cells", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, tribeName, agileCoachName, costPerSprint, status: "planning" }),
    });

    if (res.ok) {
      setName(""); setTribeName(""); setAgileCoachName(""); setCostPerSprint(0); setOpen(false);
      fetchCells();
    } else {
      console.error("Error al crear célula", await res.text());
      alert("Error al crear la célula");
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`¿Deseas eliminar la célula "${name}"?`)) return;
    const res = await fetch(`/api/cells?name=${encodeURIComponent(name)}`, { method: "DELETE" });
    if (res.ok) fetchCells();
    else console.error("Error eliminando célula", await res.text());
  };

  const filteredCells = cells.filter(
    (cell) =>
      cell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cell.tribeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateCompletion = (cell: Cell) => {
    let totalTasks = 0;
    let doneTasks = 0;
    cell.sprints?.forEach(s => {
      totalTasks += s.tasks.length;
      doneTasks += s.tasks.filter(t => t.status === "done").length;
    });
    if (totalTasks === 0) return 0;
    return doneTasks / totalTasks;
  };

  const getCompletionColor = (cell: Cell) => {
    const completion = calculateCompletion(cell);
    return completion < THRESHOLD ? "destructive" : "default";
  };

  return (
    <div className="space-y-4">
      {/* Header y modal crear célula */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Células</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nueva Célula
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Crear Nueva Célula</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre de la Célula</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Célula Frontend Zeta" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tribu</label>
                  <Select value={tribeName} onValueChange={setTribeName}>
                    <SelectTrigger><SelectValue placeholder={tribes.length > 0 ? "Selecciona tribu" : "No hay tribus"} /></SelectTrigger>
                    <SelectContent>
                      {tribes.map((tribe) => <SelectItem key={tribe.id} value={tribe.name}>{tribe.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Agile Coach</label>
                  <Input value={agileCoachName} onChange={(e) => setAgileCoachName(e.target.value)} placeholder="Nombre del Agile Coach" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Costo por Sprint</label>
                  <Input type="number" value={costPerSprint} onChange={(e) => setCostPerSprint(Number(e.target.value))} placeholder="Ej: 5000" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Crear Célula</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtro */}
      <Card>
        <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
        <CardContent>
          <Input placeholder="Buscar por nombre de célula o tribu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Células Registradas</CardTitle>
          <CardDescription>{filteredCells.length} células encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Célula</TableHead>
                <TableHead>Tribu</TableHead>
                <TableHead>Agile Coach</TableHead>
                <TableHead>Miembros</TableHead>
                <TableHead>Costo/Sprint</TableHead>
                <TableHead>Cumplimiento</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCells.map((cell) => {
                const completion = calculateCompletion(cell);
                return (
                  <TableRow key={cell.id}>
                    <TableCell className="font-medium">{cell.name}</TableCell>
                    <TableCell>{cell.tribeName}</TableCell>
                    <TableCell>{cell.agileCoachName}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/cells/${cell.id}/members`)}>Ver miembros</Button>
                    </TableCell>
                    <TableCell>${cell.costPerSprint.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getCompletionColor(cell) as any}>
                        {(completion * 100).toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(cell.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
