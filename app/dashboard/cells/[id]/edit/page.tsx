"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Cell {
  id: number;
  name: string;
  tribeName: string;
  agileCoachName: string;
  costPerSprint: number;
}

export default function EditCellPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [cell, setCell] = useState<Cell | null>(null);
  const [name, setName] = useState("");
  const [tribeName, setTribeName] = useState("");
  const [agileCoachName, setAgileCoachName] = useState("");
  const [costPerSprint, setCostPerSprint] = useState(0);
  const [tribes, setTribes] = useState<string[]>([]);

  const fetchCell = async () => {
    try {
      const res = await fetch(`/api/cells/${id}`);
      const data = await res.json();
      setCell(data.cell);
      setName(data.cell.name);
      setTribeName(data.cell.tribeName);
      setAgileCoachName(data.cell.agileCoachName);
      setCostPerSprint(data.cell.costPerSprint);
    } catch (error) {
      console.error("Error cargando célula:", error);
    }
  };

  const fetchTribes = async () => {
    try {
      const res = await fetch("/api/tribes");
      const data = await res.json();
      setTribes(data.tribes.map((t: any) => t.name));
    } catch (error) {
      console.error("Error cargando tribus:", error);
    }
  };

  useEffect(() => {
    fetchCell();
    fetchTribes();
  }, [id]);

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/cells/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name ?? null,
          tribeName: tribeName ?? null,
          agileCoachName: agileCoachName ?? null,
          costPerSprint: costPerSprint ?? null,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        console.error("Error actualizando célula:", result);
        alert("Error al actualizar la célula: " + result.error);
        return;
      }

      alert("✅ Célula actualizada correctamente");
      router.push("/dashboard/cells");
    } catch (error) {
      console.error("Error al actualizar célula:", error);
      alert("Error al actualizar célula");
    }
  };

  if (!cell) return <p>Cargando célula...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h2 className="text-2xl font-bold">Editar Célula</h2>
      <div className="space-y-2">
        <label className="text-sm font-medium">Nombre de la Célula</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la célula" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Tribu</label>
        <Select value={tribeName} onValueChange={setTribeName}>
          <SelectTrigger><SelectValue placeholder="Selecciona tribu" /></SelectTrigger>
          <SelectContent>
            {tribes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Agile Coach</label>
        <Input value={agileCoachName} onChange={(e) => setAgileCoachName(e.target.value)} placeholder="Nombre del Agile Coach" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Costo por Sprint</label>
        <Input type="number" value={costPerSprint} onChange={(e) => setCostPerSprint(Number(e.target.value))} />
      </div>
      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button onClick={handleSave}>Guardar Cambios</Button>
      </div>
    </div>
  );
}
