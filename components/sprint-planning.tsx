// components/sprint-planning.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Target, Plus, Save, RefreshCw, Settings } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface Sprint {
  id: number;
  cellId: number;
  cellName: string;
  name: string;
  quarter: string;
  startDate: string;
  endDate: string;
  plannedPoints: number;
  committedPoints: number;
  deliveredPoints: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
}

interface Cell {
  id: number;
  name: string;
  tribeName: string;
  agileCoachName: string;
  productOwnerName: string;
}

interface QConfig {
  id: number;
  quarter: string;
  year: number;
  sprintsPerQ: number;
  sprintDuration: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function SprintPlanning() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [quarters, setQuarters] = useState<QConfig[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [editingPoints, setEditingPoints] = useState<{ [key: number]: number }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCellsForGeneration, setSelectedCellsForGeneration] = useState<number[]>([]);
  const { toast } = useToast();

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar sprints cuando cambie el quarter o la célula
  useEffect(() => {
    if (selectedQuarter) {
      loadSprints();
    }
  }, [selectedQuarter, selectedCell]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      // Cargar células
      const cellsResponse = await fetch('/api/cells');
      if (cellsResponse.ok) {
        const cellsData = await cellsResponse.json();
        setCells(cellsData.cells || cellsData);
      }

      // Cargar quarters disponibles
      const quartersResponse = await fetch('/api/q-configuration/all');
      if (quartersResponse.ok) {
        const quartersData = await quartersResponse.json();
        setQuarters(quartersData);
        
        // Seleccionar el quarter activo por defecto
        const activeQuarter = quartersData.find((q: QConfig) => q.isActive);
        if (activeQuarter) {
          setSelectedQuarter(`${activeQuarter.year}-${activeQuarter.quarter}`);
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos iniciales",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSprints = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedQuarter) params.append('quarter', selectedQuarter);
      if (selectedCell) params.append('cellId', selectedCell);

      const response = await fetch(`/api/sprints?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSprints(data.sprints || []);
        
        // Inicializar el estado de edición con los puntos actuales
        const initialPoints: { [key: number]: number } = {};
        (data.sprints || []).forEach((sprint: Sprint) => {
          initialPoints[sprint.id] = sprint.plannedPoints;
        });
        setEditingPoints(initialPoints);
      }
    } catch (error) {
      console.error('Error loading sprints:', error);
      toast({
        title: "Error",
        description: "Error al cargar los sprints",
        variant: "destructive",
      });
    }
  };

  const handlePointsChange = (sprintId: number, newPoints: number) => {
    setEditingPoints(prev => ({
      ...prev,
      [sprintId]: newPoints
    }));
  };

  const saveSprintPoints = async (sprintId: number) => {
    try {
      setSaving(true);
      const response = await fetch('/api/sprints', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sprintId,
          plannedPoints: editingPoints[sprintId]
        }),
      });

      if (response.ok) {
        // Actualizar el estado local
        setSprints(prev => prev.map(sprint => 
          sprint.id === sprintId 
            ? { ...sprint, plannedPoints: editingPoints[sprintId] }
            : sprint
        ));
        
        toast({
          title: "Éxito",
          description: "Puntos planeados actualizados correctamente",
        });
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      console.error('Error saving points:', error);
      toast({
        title: "Error",
        description: "Error al guardar los puntos planeados",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveAllChanges = async () => {
    try {
      setSaving(true);
      const promises = sprints.map(sprint => {
        if (editingPoints[sprint.id] !== sprint.plannedPoints) {
          return fetch('/api/sprints', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sprintId: sprint.id,
              plannedPoints: editingPoints[sprint.id]
            }),
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises.filter(p => p));
      
      // Recargar sprints para sincronizar
      await loadSprints();
      
      toast({
        title: "Éxito",
        description: "Todos los cambios han sido guardados",
      });
    } catch (error) {
      console.error('Error saving all changes:', error);
      toast({
        title: "Error",
        description: "Error al guardar los cambios",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generateSprints = async () => {
    if (!selectedQuarter || selectedCellsForGeneration.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona un quarter y al menos una célula",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      const [year, quarter] = selectedQuarter.split('-');
      
      const response = await fetch('/api/sprints/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quarter,
          year: parseInt(year),
          cellIds: selectedCellsForGeneration
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Éxito",
          description: data.message,
        });
        
        // Recargar sprints
        await loadSprints();
        setSelectedCellsForGeneration([]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar sprints');
      }
    } catch (error) {
      console.error('Error generating sprints:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al generar sprints",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCellSelectionForGeneration = (cellId: number, checked: boolean) => {
    if (checked) {
      setSelectedCellsForGeneration(prev => [...prev, cellId]);
    } else {
      setSelectedCellsForGeneration(prev => prev.filter(id => id !== cellId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasChanges = sprints.some(sprint => 
    editingPoints[sprint.id] !== sprint.plannedPoints
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planificación de Sprints</h1>
          <p className="text-muted-foreground">
            Define los puntos planeados para cada sprint
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Generar Sprints
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generar Sprints Automáticamente</DialogTitle>
                <DialogDescription>
                  Genera sprints automáticamente basado en la configuración Q activa
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Quarter seleccionado: {selectedQuarter}</Label>
                </div>
                <div>
                  <Label>Selecciona las células:</Label>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {cells.map(cell => (
                      <div key={cell.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cell-${cell.id}`}
                          checked={selectedCellsForGeneration.includes(cell.id)}
                          onCheckedChange={(checked) => 
                            handleCellSelectionForGeneration(cell.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={`cell-${cell.id}`} className="text-sm">
                          {cell.name} ({cell.tribeName})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={generateSprints}
                  disabled={isGenerating || selectedCellsForGeneration.length === 0}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Generar Sprints
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {hasChanges && (
            <Button onClick={saveAllChanges} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="quarter-select">Quarter</Label>
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger id="quarter-select">
                  <SelectValue placeholder="Selecciona un quarter" />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map(quarter => (
                    <SelectItem key={quarter.id} value={`${quarter.year}-${quarter.quarter}`}>
                      {quarter.year} - {quarter.quarter} {quarter.isActive && '(Activo)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="cell-select">Célula (Opcional)</Label>
              <Select value={selectedCell} onValueChange={setSelectedCell}>
                <SelectTrigger id="cell-select">
                  <SelectValue placeholder="Todas las células" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las células</SelectItem>
                  {cells.map(cell => (
                    <SelectItem key={cell.id} value={cell.id.toString()}>
                      {cell.name} ({cell.tribeName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Sprints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sprints - {selectedQuarter}
          </CardTitle>
          <CardDescription>
            {sprints.length} sprints encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sprints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron sprints para los filtros seleccionados.
              <br />
              Usa el botón "Generar Sprints" para crear sprints automáticamente.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sprint</TableHead>
                  <TableHead>Célula</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Puntos Planeados</TableHead>
                  <TableHead>Puntos Comprometidos</TableHead>
                  <TableHead>Puntos Entregados</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sprints.map(sprint => (
                  <TableRow key={sprint.id}>
                    <TableCell className="font-medium">{sprint.name}</TableCell>
                    <TableCell>{sprint.cellName}</TableCell>
                    <TableCell>{new Date(sprint.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(sprint.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editingPoints[sprint.id] || 0}
                        onChange={(e) => handlePointsChange(sprint.id, parseInt(e.target.value) || 0)}
                        className="w-20"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>{sprint.committedPoints}</TableCell>
                    <TableCell>{sprint.deliveredPoints}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(sprint.status)}>
                        {sprint.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingPoints[sprint.id] !== sprint.plannedPoints && (
                        <Button
                          size="sm"
                          onClick={() => saveSprintPoints(sprint.id)}
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
