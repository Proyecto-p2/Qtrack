// components/q-configuration.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Save, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface QConfig {
    quarter: string;
    year: number;
    sprintsPerQ: number;
    sprintDuration: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

interface QConfigurationProps {
    onSave?: () => void;
}

export default function QConfiguration({ onSave }: QConfigurationProps) {
    const [sprintsPerQ, setSprintsPerQ] = useState<string>('4');
    const [sprintDuration, setSprintDuration] = useState<string>('2');
    const [quarter, setQuarter] = useState('Q1');
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    // Cargar configuración existente al montar el componente
    useEffect(() => {
        const loadCurrentConfig = async () => {
            try {
                const response = await fetch('/api/q-configuration');
                if (response.ok) {
                    const config: QConfig = await response.json();

                    // Si hay una configuración activa, llenar el formulario con sus valores
                    if (config.isActive) {
                        setQuarter(config.quarter);
                        setYear(config.year.toString());
                        setSprintsPerQ(config.sprintsPerQ.toString());
                        setSprintDuration(config.sprintDuration.toString());
                        setStartDate(config.startDate);
                        setEndDate(config.endDate);
                    }
                }
            } catch (error) {
                console.error('Error loading Q configuration:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCurrentConfig();
    }, []);

    useEffect(() => {
        validateForm();
    }, [sprintsPerQ, sprintDuration, year, startDate, endDate, quarter]);

    const validateForm = (): boolean => {
        // Convertir a números
        const yearNum = Number(year);
        const sprintsNum = Number(sprintsPerQ);
        const durationNum = Number(sprintDuration);

        // Validar campos numéricos
        if (!year || isNaN(yearNum) || yearNum < 2000 || yearNum > 2999) {
            setValidationError('El año debe ser un número válido entre 2000 y 2999');
            return false;
        }

        if (!sprintsPerQ || isNaN(sprintsNum) || sprintsNum < 1 || sprintsNum > 100) {
            setValidationError('Los sprints por Q deben estar entre 1 y 100');
            return false;
        }

        if (!sprintDuration || isNaN(durationNum) || durationNum < 1 || durationNum > 12) {
            setValidationError('La duración del sprint debe estar entre 1 y 12 semanas');
            return false;
        }

        if (startDate && endDate) {
            const dateError = validateDates(startDate, endDate);
            if (dateError) {
                setValidationError(dateError);
                return false;
            }
        }

        // Si no hay fechas, validar que al menos estén vacías
        if ((startDate && !endDate) || (!startDate && endDate)) {
            setValidationError('Ambas fechas son requeridas');
            return false;
        }

        setValidationError('');
        return true;
    };

    // Calcular días entre dos fechas
    const calculateDaysBetweenDates = (start: string, end: string): number => {
        const startDateObj = new Date(start);
        const endDateObj = new Date(end);
        const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Calcular semanas entre dos fechas
    const calculateWeeksBetweenDates = (start: string, end: string): number => {
        const days = calculateDaysBetweenDates(start, end);
        return Math.ceil(days / 7);
    };

    // Validar que las fechas no se solapen con otros trimestres
    const validateDates = (start: string, end: string): string => {
        if (!start || !end) {
            return 'Ambas fechas son requeridas';
        }

        const startDateObj = new Date(start);
        const endDateObj = new Date(end);

        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
            return 'Las fechas deben ser válidas';
        }

        if (startDateObj >= endDateObj) {
            return 'La fecha de inicio debe ser anterior a la fecha de fin';
        }

        // Validar que no exceda 3 meses (90 días aproximadamente)
        const diffDays = calculateDaysBetweenDates(start, end);

        if (diffDays > 90) {
            return 'La duración del trimestre no puede exceder 3 meses';
        }

        if (diffDays < 7) {
            return 'La duración del trimestre debe ser de al menos 1 semana';
        }

        return '';
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }
        // Convertir a números y validar
        const yearNum = Number(year);
        const sprintsNum = Number(sprintsPerQ);
        const durationNum = Number(sprintDuration);

        // Validar campos numéricos
        if (!year || isNaN(yearNum) || yearNum < 2000 || yearNum > 2999) {
            setValidationError('El año debe ser un número válido entre 2000 y 2999');
            return;
        }

        if (!sprintsPerQ || isNaN(sprintsNum) || sprintsNum < 1 || sprintsNum > 100) {
            setValidationError('Los sprints por Q deben estar entre 1 y 100');
            return;
        }

        if (!sprintDuration || isNaN(durationNum) || durationNum < 1 || durationNum > 12) {
            setValidationError('La duración del sprint debe estar entre 1 y 12 semanas');
            return;
        }

        // Validar fechas
        if (!startDate) {
            setValidationError('La fecha de inicio es requerida');
            return;
        }

        if (!endDate) {
            setValidationError('La fecha de fin es requerida');
            return;
        }

        const error = validateDates(startDate, endDate);
        if (error) {
            setValidationError(error);
            toast({
                title: "Error de validación",
                description: error,
                variant: "destructive",
            });
            return;
        }

        setValidationError('');

        try {
            const qConfig: QConfig = {
                quarter,
                year: yearNum,
                sprintsPerQ: sprintsNum,
                sprintDuration: durationNum,
                startDate,
                endDate,
                isActive: true
            };

            const response = await fetch('/api/q-configuration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(qConfig),
            });

            if (response.ok) {
                setIsSaved(true);
                toast({
                    title: "Configuración guardada",
                    description: `Q${quarter} ${yearNum} configurado con ${sprintsNum} sprints de ${durationNum} semanas cada uno.`,
                });
                setTimeout(() => setIsSaved(false), 3000);

                // Llamar al callback onSave si existe
                if (onSave) {
                    onSave();
                }
            } else {
                const errorData = await response.json();
                toast({
                    title: "Error",
                    description: errorData.error || "No se pudo guardar la configuración",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Error al guardar la configuración",
                variant: "destructive",
            });
        }
    };

    const handleStartDateChange = (newStartDate: string) => {
        setStartDate(newStartDate);
    };

    const handleEndDateChange = (newEndDate: string) => {
        setEndDate(newEndDate);
    };

    const handleSprintsChange = (newSprints: string) => {
        setSprintsPerQ(newSprints);
    };

    const handleDurationChange = (newDuration: string) => {
        setSprintDuration(newDuration);
    };

    const handleYearChange = (newYear: string) => {
        setYear(newYear);
    }

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="flex justify-center items-center h-32">
                        <p>Cargando configuración...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuración de Trimestre (Q)
                </CardTitle>
                <CardDescription>
                    Define la estructura de sprints para el próximo trimestre
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="quarter">Trimestre</Label>
                        <Select value={quarter} onValueChange={setQuarter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar trimestre" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Q1">Q1</SelectItem>
                                <SelectItem value="Q2">Q2</SelectItem>
                                <SelectItem value="Q3">Q3</SelectItem>
                                <SelectItem value="Q4">Q4</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="year">Año</Label>
                        <Input
                            id="year"
                            type="number"
                            min="2000"
                            max="2999"
                            value={year}
                            onChange={(e) => handleYearChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="sprintsPerQ">Sprints por Q (1-100)</Label>
                        <Input
                            id="sprintsPerQ"
                            type="number"
                            min="1"
                            max="100"
                            value={sprintsPerQ}
                            onChange={(e) => handleSprintsChange(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sprintDuration">Duración por sprint (semanas, 1-12)</Label>
                        <Input
                            id="sprintDuration"
                            type="number"
                            min="1"
                            max="12"
                            value={sprintDuration}
                            onChange={(e) => handleDurationChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Fecha de inicio del Q</Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate">Fecha de fin del Q</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => handleEndDateChange(e.target.value)}
                        />
                    </div>
                </div>

                {validationError && (
                    <div className="p-3 border border-red-300 bg-red-50 rounded-md">
                        <p className="text-sm text-red-600">{validationError}</p>
                    </div>
                )}

                <div className="rounded-lg bg-muted p-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4" />
                        Resumen del {quarter} {year}:
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                            <p className="text-muted-foreground">Sprints:</p>
                            <p className="font-medium">{sprintsPerQ || '0'} sprints</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Duración c/u:</p>
                            <p className="font-medium">{sprintDuration || '0'} semanas</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Inicio:</p>
                            <p className="font-medium">{startDate ? new Date(startDate).toLocaleDateString('es-ES') : 'No definida'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Fin:</p>
                            <p className="font-medium">{endDate ? new Date(endDate).toLocaleDateString('es-ES') : 'No definida'}</p>
                        </div>
                    </div>
                    {startDate && endDate && (
                        <div className="mt-2 pt-2 border-t">
                            <p className="text-sm font-medium">
                                Duración real: {calculateWeeksBetweenDates(startDate, endDate)} semanas
                                <span className="text-muted-foreground ml-2">
                                    ({calculateDaysBetweenDates(startDate, endDate)} días)
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                <Button
                    onClick={handleSave}
                    className="w-full"
                    disabled={isSaved || !!validationError}
                >
                    {isSaved ? '¡Configuración guardada!' : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar configuración de Q
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}