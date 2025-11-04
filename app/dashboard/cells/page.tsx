"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Sprint {
  id: number;
  cellId: number;
  tasks: { id: number; status: 'todo' | 'inProgress' | 'done'; }[];
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
  const [editingCell, setEditingCell] = useState<Cell | null>(null);

  const [editTribeName, setEditTribeName] = useState("");
  const [editAgileCoach, setEditAgileCoach] = useState("");

  const THRESHOLD = 0.7;

  const fetchCells = async () => {
    const res = await fetch("/api/cells");
    const data = await res.json();
    const parsedCells: Cell[] = (data.cells || []).map((cell: any) => ({
      ...cell,
      memberCount: Number(cell.memberCount),
      costPerSprint: Number(cell.costPerSprint),
    }));

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

  const handleDelete = async (name: string) => {
    if (!confirm(`¿Deseas eliminar la célula "${name}"?`)) return;
    const res = await fetch(`/api/cells?name=${encodeURIComponent(name)}`, { method: "DELETE" });
    if (res.ok) fetchCells();
    else console.error("Error eliminando célula", await res.text());
  };

  const handleEditClick = (cell: Cell) => {
    setEditingCell(cell);
    setEditTribeName(cell.tribeName);
    setEditAgileCoach(cell.agileCoachName);
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    if (!editTribeName.trim() || !editAgileCoach.trim()) {
      alert("Tribu y Agile Coach son obligatorios");
      return;
    }

    const res = await fetch(`/api/cells/${editingCell.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tribeName: editTribeName, agileCoachName: editAgileCoach }),
    });

    if (res.ok) {
      setEditingCell(null);
      fetchCells();
    } else {
      console.error("Error al actualizar célula", await res.text());
      alert("Error al actualizar la célula");
    }
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
    if (totalTasks === 0) return { percentage: 0, doneTasks: 0, totalTasks: 0 };
    return { percentage: doneTasks / totalTasks, doneTasks, totalTasks };
  };

  const getCompletionColor = (completion: number) => {
    if (completion >= 0.9) return "default";
    if (completion >= THRESHOLD) return "secondary";
    return "destructive";
  };

  const getCompletionIcon = (completion: number) => {
    if (completion >= 0.9) return "🟢";
    if (completion >= THRESHOLD) return "🟡";
    return "🔴";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Células Registradas</CardTitle>
          <CardDescription>{filteredCells.length} células encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nombre de célula o tribu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm mb-4"
          />
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
                const completionData = calculateCompletion(cell);
                const completion = completionData.percentage;
                return (
                  <TableRow key={cell.id}>
                    <TableCell className="font-medium">{cell.name}</TableCell>
                    <TableCell>{cell.tribeName}</TableCell>
                    <TableCell>{cell.agileCoachName}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/cells/${cell.id}/members`)}>
                        Ver miembros
                      </Button>
                    </TableCell>
                    <TableCell>${cell.costPerSprint.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={getCompletionColor(completion) as any}>
                          {(completion * 100).toFixed(0)}%
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ({completionData.doneTasks}/{completionData.totalTasks} tareas)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditClick(cell)}>Editar</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(cell.name)}>
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

      {/* Modal de edición */}
      <Dialog open={editingCell !== null} onOpenChange={() => setEditingCell(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Célula: {editingCell?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tribu</label>
              <Select value={editTribeName} onValueChange={setEditTribeName}>
                <SelectTrigger><SelectValue placeholder="Selecciona tribu" /></SelectTrigger>
                <SelectContent>
                  {tribes.map((tribe) => (
                    <SelectItem key={tribe.id} value={tribe.name}>{tribe.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Agile Coach</label>
              <Input value={editAgileCoach} onChange={(e) => setEditAgileCoach(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingCell(null)}>Cancelar</Button>
              <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
