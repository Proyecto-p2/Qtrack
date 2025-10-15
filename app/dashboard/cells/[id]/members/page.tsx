"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";

interface Member {
  id: number;
  name: string;
  role: string;
  knowledgeLine: string;
  cellId: number;
  workload: number;
  currentLoad: number;
}

export default function MembersPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [members, setMembers] = useState<Member[]>([]);
  const [knowledgeLines, setKnowledgeLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadInputs, setLoadInputs] = useState<{ [key: number]: string }>({});

  // Modal
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [knowledgeLine, setKnowledgeLine] = useState("");
  const [workload, setWorkload] = useState<string>("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/api/auth/signin");
  }, [status, session, router]);

  const fetchMembers = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/members?cellId=${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Error al obtener los miembros");
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledgeLines = async () => {
    try {
      const res = await fetch("/api/knowledge-lines", { cache: "no-store" });
      if (!res.ok) throw new Error("Error al obtener líneas de conocimiento");
      const data = await res.json();
      setKnowledgeLines(data.knowledgeLines.map((line: any) => line.nombre));
    } catch (err) {
      console.error("Error al obtener líneas de conocimiento", err);
    }
  };

  useEffect(() => {
    if (!session) return;
    fetchMembers();
    fetchKnowledgeLines();
  }, [id, session]);

  const handleAddMember = async () => {
    if (!name || !role || !knowledgeLine) return alert("Completa todos los campos");
    try {
      const res = await fetch(`/api/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          knowledgeLine,
          cellId: Number(id),
          workload: workload ? Number(workload) : 0
        }),
      });
      if (!res.ok) throw new Error("Error al agregar miembro");
      setName("");
      setRole("");
      setKnowledgeLine("");
      setWorkload("");
      setOpen(false);
      fetchMembers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateLoad = async (memberId: number) => {
    const newLoadStr = loadInputs[memberId];
    if (!newLoadStr || newLoadStr.trim() === "") return;

    const newLoad = Number(newLoadStr);
    if (isNaN(newLoad) || newLoad < 0) {
      alert("Ingresa un número válido");
      return;
    }

    try {
      const res = await fetch(`/api/members/${memberId}/workload`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentLoad: newLoad }),
      });
      if (!res.ok) throw new Error("Error al actualizar carga");
      const data = await res.json();
      if (data.notificationSent) {
        alert("Notificación enviada a administradores y agile coaches");
      }
      setLoadInputs((prev) => ({ ...prev, [memberId]: "" }));
      fetchMembers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p>Cargando miembros...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Miembros de la célula</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Agregar Miembro</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Miembro</DialogTitle>
              <DialogDescription>
                Rellena los campos para añadir un nuevo miembro a esta célula.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Línea de conocimiento</label>
                <select
                  value={knowledgeLine}
                  onChange={(e) => setKnowledgeLine(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                >
                  <option value="">Selecciona una línea</option>
                  {knowledgeLines.map((line) => (
                    <option key={line} value={line}>
                      {line}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Carga asignada (puntos)</label>
                <Input
                  type="number"
                  value={workload}
                  onChange={(e) => setWorkload(e.target.value)}
                  min="0"
                  placeholder="Ej: 100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddMember}>Agregar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {members.length === 0 ? (
        <p>No hay miembros en esta célula.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <CardTitle>{member.name}</CardTitle>
                <CardDescription>
                  <Badge>{member.role}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Línea de conocimiento: {member.knowledgeLine}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Carga asignada:</span>
                    <span className="font-semibold">{member.workload} pts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Carga actual:</span>
                    <Badge variant={member.currentLoad >= member.workload ? "destructive" : "default"}>
                      {member.currentLoad} pts
                    </Badge>
                  </div>
                  <div className="pt-2">
                    <label className="text-xs text-gray-600 mb-1 block">Actualizar carga:</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        placeholder="Nueva carga"
                        value={loadInputs[member.id] || ""}
                        onChange={(e) =>
                          setLoadInputs((prev) => ({
                            ...prev,
                            [member.id]: e.target.value,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateLoad(member.id)}
                        disabled={!loadInputs[member.id] || loadInputs[member.id].trim() === ""}
                      >
                        Actualizar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
