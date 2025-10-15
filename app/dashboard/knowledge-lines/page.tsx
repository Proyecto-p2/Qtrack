"use client";

import { useEffect, useState } from "react";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "@/components/ui/table";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

interface KnowledgeLine {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  objetivos: string;
  creada_por: string;
  creada_en: string;
}

export default function KnowledgeLines() {
  const [lines, setLines] = useState<KnowledgeLine[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    objetivos: "",
  });

  const fetchLines = async () => {
    const res = await fetch("/api/knowledge-lines");
    const data = await res.json();
    setLines(data.knowledgeLines || []);
  };

  useEffect(() => {
    fetchLines();
  }, []);

  const handleSubmit = async () => {
    if (!form.nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    const res = await fetch("/api/knowledge-lines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setOpen(false);
      setForm({ nombre: "", descripcion: "", categoria: "", objetivos: "" });
      fetchLines();
    } else {
      alert("Error al crear la línea de conocimiento");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar esta línea?")) return;
    const res = await fetch(`/api/knowledge-lines?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchLines();
    else alert("Error al eliminar la línea");
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-md border">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Líneas de Conocimiento</CardTitle>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button>+ Nueva línea</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear nueva línea de conocimiento</DialogTitle>
              </DialogHeader>

              <div className="space-y-3 py-3">
                <Input placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                <Input placeholder="Categoría" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} />
                <Textarea placeholder="Descripción breve" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} />
                <Textarea placeholder="Objetivos principales" value={form.objetivos} onChange={e => setForm({...form, objetivos: e.target.value})} />
              </div>

              <DialogFooter>
                <Button onClick={handleSubmit}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Objetivos</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No hay líneas registradas aún.</TableCell>
                </TableRow>
              ) : (
                lines.map(line => (
                  <TableRow key={line.id}>
                    <TableCell>{line.nombre}</TableCell>
                    <TableCell>{line.categoria}</TableCell>
                    <TableCell>{line.descripcion}</TableCell>
                    <TableCell>{line.objetivos}</TableCell>
                    <TableCell>{new Date(line.creada_en).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(line.id)}>Eliminar</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
