"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search } from "lucide-react"

interface Tribe {
  id: number
  name: string
  leadName: string
  description?: string
  createdAt: string
}

export default function TribesPage() {
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [open, setOpen] = useState(false)

  // Campos formulario
  const [name, setName] = useState("")
  const [leadName, setLeadName] = useState("")
  const [description, setDescription] = useState("")

  // Cargar tribus desde la API
  useEffect(() => {
    const fetchTribes = async () => {
      const res = await fetch("/api/tribes")
      const data = await res.json()
      setTribes(data.tribes || [])
    }
    fetchTribes()
  }, [])

  // Crear nueva tribu
  const handleCreate = async () => {
    const res = await fetch("/api/tribes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, leadName, description }),
    })

    if (res.ok) {
      const data = await res.json()
      const newTribe: Tribe = {
        id: data.data.insertId || Date.now(),
        name,
        leadName,
        description,
        createdAt: new Date().toISOString(),
      }
      setTribes((prev) => [...prev, newTribe])
      setOpen(false)
      setName("")
      setLeadName("")
      setDescription("")
    } else {
      console.error("Error creando tribu", await res.text())
    }
  }

  // Eliminar tribu por nombre
  const handleDelete = async (tribeName: string) => {
    if (!confirm(`¿Deseas eliminar la tribu "${tribeName}"?`)) return

    const res = await fetch(`/api/tribes?name=${encodeURIComponent(tribeName)}`, {
      method: "DELETE",
    })

    if (res.ok) {
      setTribes((prev) => prev.filter((t) => t.name !== tribeName))
    } else {
      console.error("Error al eliminar tribu")
    }
  }

  // Filtrar tribus
  const filteredTribes = tribes.filter(
    (tribe) =>
      tribe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tribe.leadName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Tribus</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Tribu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Tribu</DialogTitle>
              <DialogDescription>Registra una nueva tribu en el sistema.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Tribu Digital" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Líder</label>
                <Input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Ej: Ana García" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Crear Tribu</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o líder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Tribus */}
      <Card>
        <CardHeader>
          <CardTitle>Tribus Registradas</CardTitle>
          <CardDescription>{filteredTribes.length} tribus encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Líder</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTribes.map((tribe) => (
                <TableRow key={tribe.id}>
                  <TableCell className="font-medium">{tribe.name}</TableCell>
                  <TableCell>{tribe.leadName}</TableCell>
                  <TableCell>{tribe.description || "—"}</TableCell>
                  <TableCell>{new Date(tribe.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(tribe.name)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Tribus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tribes.length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
