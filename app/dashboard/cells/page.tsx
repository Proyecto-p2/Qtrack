"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Users, TrendingUp, DollarSign, Trash2 } from "lucide-react";

interface Cell {
  id: number;
  name: string;
  tribeName: string;
  agileCoachName: string;
  productOwnerName: string;
  memberCount: number;
  avgVelocity: number;
  currentSprintPoints: number;
  costPerSprint: number;
  status: "active" | "inactive" | "planning";
}

export default function CellsPage() {
  const router = useRouter();

  const [cells, setCells] = useState<Cell[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  // Campos formulario
  const [name, setName] = useState("");
  const [tribeName, setTribeName] = useState("");
  const [agileCoachName, setAgileCoachName] = useState("");
  const [productOwnerName, setProductOwnerName] = useState("");
  const [currentSprintPoints, setCurrentSprintPoints] = useState(0);
  const [avgVelocity, setAvgVelocity] = useState(0);
  const [costPerSprint, setCostPerSprint] = useState(0);
  const [memberCount, setMemberCount] = useState(0);

  // Cargar células desde BD
  const fetchCells = async () => {
    const res = await fetch("/api/cells");
    const data = await res.json();
    const parsedCells: Cell[] = (data.cells || []).map((cell: any) => ({
      ...cell,
      memberCount: Number(cell.memberCount),
      avgVelocity: Number(cell.avgVelocity),
      currentSprintPoints: Number(cell.currentSprintPoints),
      costPerSprint: Number(cell.costPerSprint),
    }));
    setCells(parsedCells);
  };

  useEffect(() => {
    fetchCells();
  }, []);

  // Crear célula
  const handleCreate = async () => {
    const res = await fetch("/api/cells", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        tribeName,
        agileCoachName,
        productOwnerName,
        currentSprintPoints,
        avgVelocity,
        costPerSprint,
        memberCount,
        status: "planning",
      }),
    });

    if (res.ok) {
      setName("");
      setTribeName("");
      setAgileCoachName("");
      setProductOwnerName("");
      setCurrentSprintPoints(0);
      setAvgVelocity(0);
      setCostPerSprint(0);
      setMemberCount(0);
      setOpen(false);
      fetchCells();
    } else {
      console.error("Error al crear célula", await res.text());
    }
  };

  // Eliminar célula
  const handleDelete = async (name: string) => {
    if (!confirm(`¿Deseas eliminar la célula "${name}"?`)) return;

    const res = await fetch(`/api/cells?name=${encodeURIComponent(name)}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchCells();
    } else {
      console.error("Error eliminando célula", await res.text());
    }
  };

  const filteredCells = cells.filter(
    (cell) =>
      cell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cell.tribeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "planning":
        return "outline";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activa";
      case "inactive":
        return "Inactiva";
      case "planning":
        return "Planificación";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header y modal crear célula */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Células</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Célula
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Célula</DialogTitle>
              <DialogDescription>
                Configura una nueva célula de trabajo con sus integrantes y métricas.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Campos de formulario */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre de la Célula</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Célula Frontend Zeta"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tribu</label>
                  <Input
                    value={tribeName}
                    onChange={(e) => setTribeName(e.target.value)}
                    placeholder="Ej: Tribu Digital"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Agile Coach</label>
                  <Input
                    value={agileCoachName}
                    onChange={(e) => setAgileCoachName(e.target.value)}
                    placeholder="Seleccionar coach..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Owner</label>
                  <Input
                    value={productOwnerName}
                    onChange={(e) => setProductOwnerName(e.target.value)}
                    placeholder="Seleccionar PO..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Puntos por Sprint</label>
                  <Input
                    type="number"
                    value={currentSprintPoints}
                    onChange={(e) =>
                      setCurrentSprintPoints(e.target.value ? Number(e.target.value) : 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Velocidad Promedio</label>
                  <Input
                    type="number"
                    value={avgVelocity}
                    onChange={(e) => setAvgVelocity(e.target.value ? Number(e.target.value) : 0)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Costo por Sprint</label>
                  <Input
                    type="number"
                    value={costPerSprint}
                    onChange={(e) => setCostPerSprint(e.target.value ? Number(e.target.value) : 0)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Número de Miembros</label>
                  <Input
                    type="number"
                    value={memberCount}
                    onChange={(e) => setMemberCount(e.target.value ? Number(e.target.value) : 0)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>Crear Célula</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtro de búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre de célula o tribu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de células */}
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
                <TableHead>Velocidad</TableHead>
                <TableHead>Sprint Actual</TableHead>
                <TableHead>Costo/Sprint</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCells.map((cell) => (
                <TableRow key={cell.id}>
                  <TableCell className="font-medium">{cell.name}</TableCell>
                  <TableCell>{cell.tribeName}</TableCell>
                  <TableCell>{cell.agileCoachName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/cells/${cell.id}/members`)
                        }
                      >
                        Ver miembros ({cell.memberCount})
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      {cell.avgVelocity}
                    </div>
                  </TableCell>
                  <TableCell>{cell.currentSprintPoints} pts</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      ${cell.costPerSprint.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(cell.status) as any}>
                      {getStatusText(cell.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(cell.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resumen de métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Células</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cells.length}</div>
            <p className="text-xs text-muted-foreground">
              {cells.filter((c) => c.status === "active").length} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Velocidad Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cells.length > 0
                ? Math.round(cells.reduce((sum, cell) => sum + cell.avgVelocity, 0) / cells.length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">puntos por sprint</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntos Totales Sprint</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cells.length > 0
                ? cells.reduce((sum, cell) => sum + cell.currentSprintPoints, 0)
                : 0}{" "}
              pts
            </div>
            <p className="text-xs text-muted-foreground">sumados de todas las células</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${cells.reduce((sum, cell) => sum + cell.costPerSprint, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Por sprint actual</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
