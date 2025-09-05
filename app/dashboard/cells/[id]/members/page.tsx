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
}

export default function MembersPage() {
  const { id } = useParams(); // id de la célula
  const router = useRouter();
  const { data: session, status } = useSession();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el modal de crear miembro
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [knowledgeLine, setKnowledgeLine] = useState("");

  // Redirigir si no hay sesión
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/api/auth/signin");
  }, [status, session, router]);

  // Fetch de miembros
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

  useEffect(() => {
    if (!session) return;
    fetchMembers();
  }, [id, session]);

  // Crear nuevo miembro
  const handleAddMember = async () => {
    if (!name || !role || !knowledgeLine) return alert("Completa todos los campos");
    try {
      const res = await fetch(`/api/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, knowledgeLine, cellId: Number(id) }),
      });
      if (!res.ok) throw new Error("Error al agregar miembro");
      setName("");
      setRole("");
      setKnowledgeLine("");
      setOpen(false);
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
              <DialogDescription>Rellena los campos para añadir un nuevo miembro a esta célula.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Rol</label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Línea de conocimiento</label>
                <Input value={knowledgeLine} onChange={(e) => setKnowledgeLine(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
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
                <p>Línea de conocimiento: {member.knowledgeLine}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
