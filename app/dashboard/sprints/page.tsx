"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import QConfiguration from "@/components/q-configuration"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Play, Pause, CheckCircle, Clock, Target } from "lucide-react"

interface Sprint {
    id: number
    name: string
    cellName: string
    quarter: string
    startDate: string
    endDate: string
    plannedPoints: number
    committedPoints: number
    deliveredPoints: number
    status: "planning" | "active" | "completed" | "cancelled"
    progress: number
}

interface QConfig {
    id: number
    quarter: string
    year: number
    sprintsPerQ: number
    sprintDuration: number
    startDate: string
    endDate: string
    isActive: boolean
}

interface Cell {
    id: number
    name: string
    tribeName: string
    agileCoachName: string
    productOwnerName: string
}

export default function SprintsPage() {
    const [selectedQuarter, setSelectedQuarter] = useState("")
    const [showQConfig, setShowQConfig] = useState(false)
    const [currentQConfig, setCurrentQConfig] = useState<QConfig | null>(null)
    const [allQuarters, setAllQuarters] = useState<QConfig[]>([])
    const [cells, setCells] = useState<Cell[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Cargar datos iniciales
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)

                // Cargar configuración actual de Q
                const configResponse = await fetch('/api/q-configuration')
                if (configResponse.ok) {
                    const config = await configResponse.json()
                    setCurrentQConfig(config)
                }

                // Cargar todos los Qs para el selector
                const quartersResponse = await fetch('/api/q-configuration/all')
                if (quartersResponse.ok) {
                    const quartersData = await quartersResponse.json()
                    setAllQuarters(quartersData)
                    if (quartersData.length > 0 && !selectedQuarter) {
                        const activeQ = quartersData.find((q: QConfig) => q.isActive) || quartersData[0]
                        setSelectedQuarter(`${activeQ.year}-${activeQ.quarter}`)
                    }
                }

                // Cargar células
                const cellsResponse = await fetch('/api/cells')
                if (cellsResponse.ok) {
                    const cellsData = await cellsResponse.json()
                    setCells(cellsData.cells || cellsData)
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Datos de sprints hardcodeados (serán reemplazados por API)
    const sprints: Sprint[] = [
        {
            id: 1,
            name: "Sprint 25",
            cellName: "Célula Frontend Alpha",
            quarter: "2024-Q1",
            startDate: "2024-02-14",
            endDate: "2024-02-28",
            plannedPoints: 40,
            committedPoints: 38,
            deliveredPoints: 0,
            status: "active",
            progress: 65,
        },
        {
            id: 2,
            name: "Sprint 24",
            cellName: "Célula Frontend Alpha",
            quarter: "2024-Q1",
            startDate: "2024-01-30",
            endDate: "2024-02-13",
            plannedPoints: 42,
            committedPoints: 40,
            deliveredPoints: 35,
            status: "completed",
            progress: 100,
        },
        {
            id: 3,
            name: "Sprint 25",
            cellName: "Célula Backend Beta",
            quarter: "2024-Q1",
            startDate: "2024-02-14",
            endDate: "2024-02-28",
            plannedPoints: 35,
            committedPoints: 35,
            deliveredPoints: 0,
            status: "active",
            progress: 45,
        },
        {
            id: 4,
            name: "Sprint 26",
            cellName: "Célula DevOps Gamma",
            quarter: "2024-Q1",
            startDate: "2024-03-01",
            endDate: "2024-03-15",
            plannedPoints: 30,
            committedPoints: 0,
            deliveredPoints: 0,
            status: "planning",
            progress: 0,
        },
        {
            id: 5,
            name: "Sprint 25",
            cellName: "Célula QA Delta",
            quarter: "2024-Q1",
            startDate: "2024-02-14",
            endDate: "2024-02-28",
            plannedPoints: 25,
            committedPoints: 28,
            deliveredPoints: 0,
            status: "active",
            progress: 80,
        },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "default"
            case "completed":
                return "secondary"
            case "planning":
                return "outline"
            case "cancelled":
                return "destructive"
            default:
                return "default"
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case "active":
                return "Activo"
            case "completed":
                return "Completado"
            case "planning":
                return "Planificación"
            case "cancelled":
                return "Cancelado"
            default:
                return status
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <Play className="h-4 w-4" />
            case "completed":
                return <CheckCircle className="h-4 w-4" />
            case "planning":
                return <Clock className="h-4 w-4" />
            case "cancelled":
                return <Pause className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const activeSprints = sprints.filter((s) => s.status === "active")
    const completedSprints = sprints.filter((s) => s.status === "completed")
    const planningSprints = sprints.filter((s) => s.status === "planning")

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Cargando...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Sprints</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowQConfig(!showQConfig)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar Q
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Sprint
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Crear Nuevo Sprint</DialogTitle>
                                <DialogDescription>Configura un nuevo sprint para una célula específica.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sprint-name">Nombre del Sprint</Label>
                                        <Input id="sprint-name" placeholder="Ej: Sprint 26" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cell">Célula</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar célula" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cells.map(cell => (
                                                    <SelectItem key={cell.id} value={cell.id.toString()}>
                                                        {cell.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="quarter">Trimestre</Label>
                                        <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar trimestre" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allQuarters.map(q => (
                                                    <SelectItem key={`${q.year}-${q.quarter}`} value={`${q.year}-${q.quarter}`}>
                                                        {q.year} {q.quarter}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="start-date">Fecha Inicio</Label>
                                        <Input id="start-date" type="date" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end-date">Fecha Fin</Label>
                                        <Input id="end-date" type="date" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="planned-points">Puntos Planificados</Label>
                                        <Input id="planned-points" type="number" placeholder="40" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="committed-points">Puntos Comprometidos</Label>
                                        <Input id="committed-points" type="number" placeholder="38" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline">Cancelar</Button>
                                    <Button>Crear Sprint</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {showQConfig && (
                <div className="animate-in fade-in-50">
                    <QConfiguration onSave={() => {
                        setShowQConfig(false)
                        // Recargar datos después de guardar
                        window.location.reload()
                    }} />
                </div>
            )}

            {currentQConfig && !showQConfig && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Configuración Actual del Trimestre</h3>
                                <p className="text-sm text-muted-foreground">
                                    {currentQConfig.quarter} {currentQConfig.year} - {currentQConfig.sprintsPerQ} sprints de {currentQConfig.sprintDuration} semanas
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setShowQConfig(true)}>
                                <Settings className="mr-2 h-4 w-4" />
                                Modificar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sprints Activos</CardTitle>
                        <Play className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeSprints.length}</div>
                        <p className="text-xs text-muted-foreground">En ejecución</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completados</CardTitle>
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedSprints.length}</div>
                        <p className="text-xs text-muted-foreground">Este trimestre</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En Planificación</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{planningSprints.length}</div>
                        <p className="text-xs text-muted-foreground">Próximos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Velocidad Promedio</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.round(
                                completedSprints.reduce((sum, s) => sum + s.deliveredPoints, 0) / completedSprints.length || 0,
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">puntos por sprint</p>
                    </CardContent>
                </Card>
            </div>

            {/* Active Sprints */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5 text-green-500" />
                        Sprints Activos
                    </CardTitle>
                    <CardDescription>Sprints en ejecución con progreso en tiempo real</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {activeSprints.map((sprint) => (
                            <div key={sprint.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold">{sprint.name}</h4>
                                        <p className="text-sm text-muted-foreground">{sprint.cellName}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default">Activo</Badge>
                                        <span className="text-sm text-muted-foreground">
                      {new Date(sprint.startDate).toLocaleDateString("es-ES")} -{" "}
                                            {new Date(sprint.endDate).toLocaleDateString("es-ES")}
                    </span>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3 mb-3">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Planificados</p>
                                        <p className="text-lg font-semibold">{sprint.plannedPoints}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Comprometidos</p>
                                        <p className="text-lg font-semibold">{sprint.committedPoints}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Progreso</p>
                                        <p className="text-lg font-semibold">{sprint.progress}%</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progreso del Sprint</span>
                                        <span>{sprint.progress}%</span>
                                    </div>
                                    <Progress value={sprint.progress} />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* All Sprints Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Todos los Sprints
                    </CardTitle>
                    <CardDescription>Historial completo de sprints por trimestre</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Seleccionar trimestre" />
                            </SelectTrigger>
                            <SelectContent>
                                {allQuarters.map(q => (
                                    <SelectItem key={`${q.year}-${q.quarter}`} value={`${q.year}-${q.quarter}`}>
                                        {q.year} {q.quarter}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sprint</TableHead>
                                <TableHead>Célula</TableHead>
                                <TableHead>Fechas</TableHead>
                                <TableHead>Planificados</TableHead>
                                <TableHead>Comprometidos</TableHead>
                                <TableHead>Entregados</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Progreso</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sprints.map((sprint) => (
                                <TableRow key={sprint.id}>
                                    <TableCell className="font-medium">{sprint.name}</TableCell>
                                    <TableCell>{sprint.cellName}</TableCell>
                                    <TableCell className="text-sm">
                                        {new Date(sprint.startDate).toLocaleDateString("es-ES")} -{" "}
                                        {new Date(sprint.endDate).toLocaleDateString("es-ES")}
                                    </TableCell>
                                    <TableCell>{sprint.plannedPoints}</TableCell>
                                    <TableCell>{sprint.committedPoints}</TableCell>
                                    <TableCell>{sprint.deliveredPoints || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(sprint.status) as any} className="flex items-center gap-1 w-fit">
                                            {getStatusIcon(sprint.status)}
                                            {getStatusText(sprint.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={sprint.progress} className="w-16 h-2" />
                                            <span className="text-sm">{sprint.progress}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">
                                            Ver Detalles
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}