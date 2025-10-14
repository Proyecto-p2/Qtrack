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
    id?: number;
    quarter: string;
    year: number;
    sprintsPerQ: number;
    sprintDuration: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface QConfigurationProps {
    onSave?: () => void;
}

// Helper: sumar días a una fecha ISO (YYYY-MM-DD) de forma segura
const addDaysISO = (isoDate: string, days: number): string => {
    const [y, m, d] = isoDate.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + days);
    const yy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(dt.getUTCDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
};

// Formatear fecha dd/mm/yyyy
const formatDateWithoutTimezone = (dateString: string): string => {
    if (!dateString) return 'No definida';

    // Extraer solo la parte de la fecha (antes de 'T' si existe)
    const datePart = dateString.split('T')[0];
    const parts = datePart.split('-');

    if (parts.length !== 3) return 'No definida';
    const [y, m, d] = parts;

    return `${d}/${m}/${y}`;
};

// Convertir dd/mm/yyyy a yyyy-mm-dd
const parseDisplayDate = (displayDate: string): string => {
    if (!displayDate) return '';
    const parts = displayDate.split('/');
    if (parts.length === 3) {
        const [d, m, y] = parts;
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return displayDate;
};

// Obtener fecha de hoy en formato ISO
const makeTodayISO = (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// Calcular fecha de inicio basada en Q anterior
const calculateStartDate = (quarter: string, year: string, existingConfigs: QConfig[]): string => {
    const yearNum = parseInt(year);

    const previousQuarters: { [key: string]: string } = {
        'Q2': 'Q1',
        'Q3': 'Q2',
        'Q4': 'Q3'
    };

    const previousQuarter = previousQuarters[quarter];

    if (previousQuarter) {
        const previousQConfig = existingConfigs.find(config =>
            config.quarter === previousQuarter && config.year === yearNum
        );

        if (previousQConfig?.endDate) {
            const endDatePart = previousQConfig.endDate.split('T')[0];
            const nextDay = addDaysISO(endDatePart, 1);
            console.log(`📅 Q anterior (${previousQuarter}): fin=${endDatePart}, siguiente=${nextDay}`);
            return nextDay;
        }
    }

    const quarterStartMonths: { [key: string]: number } = {
        'Q1': 0,
        'Q2': 3,
        'Q3': 6,
        'Q4': 9
    };

    const startMonth = quarterStartMonths[quarter] || 0;
    const mm = String(startMonth + 1).padStart(2, '0');
    return `${yearNum}-${mm}-01`;
};

// Calcular días entre fechas
const calculateDaysBetweenDates = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startPart = start.split('T')[0];
    const endPart = end.split('T')[0];
    const startDateObj = new Date(startPart + 'T00:00:00Z');
    const endDateObj = new Date(endPart + 'T00:00:00Z');
    const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Calcular semanas entre fechas
const calculateWeeksBetweenDates = (start: string, end: string): number => {
    const days = calculateDaysBetweenDates(start, end);
    return Math.ceil(days / 7);
};

export default function QConfiguration({ onSave }: QConfigurationProps) {
    const [sprintsPerQ, setSprintsPerQ] = useState<string>('4');
    const [sprintDuration, setSprintDuration] = useState<string>('2');
    const [quarter, setQuarter] = useState('Q1');
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());
    const [startDate, setStartDate] = useState(makeTodayISO());
    const [endDate, setEndDate] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [existingConfigs, setExistingConfigs] = useState<QConfig[]>([]);
    const { toast } = useToast();

    const [summaryData, setSummaryData] = useState({
        totalWeeks: 0,
        totalDays: 0
    });

    // Calcular resumen
    const calculateSummaryData = () => {
        if (!startDate || !endDate) {
            setSummaryData({ totalWeeks: 0, totalDays: 0 });
            return;
        }

        const totalDays = calculateDaysBetweenDates(startDate, endDate);
        const totalWeeks = calculateWeeksBetweenDates(startDate, endDate);

        setSummaryData({ totalWeeks, totalDays });
    };

    // Cargar configuraciones al iniciar
    useEffect(() => {
    const loadAllConfigs = async () => {
        try {
            const response = await fetch('/api/q-configuration/all');
            if (response.ok) {
                const configs: QConfig[] = await response.json();
                setExistingConfigs(configs);
                console.log('📊 Configuraciones cargadas:', configs);

                const activeConfig = configs.find(config => config.isActive);
                if (activeConfig) {
                    setQuarter(activeConfig.quarter);
                    setYear(activeConfig.year.toString());
                    setSprintsPerQ(activeConfig.sprintsPerQ.toString());
                    setSprintDuration(activeConfig.sprintDuration.toString());
                    setStartDate(activeConfig.startDate.split('T')[0]);
                    setEndDate(activeConfig.endDate.split('T')[0]);
                    console.log('✅ Configuración activa cargada:', activeConfig);
                }
            }
        } catch (error) {
            console.error('❌ Error cargando configuraciones:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las configuraciones",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    loadAllConfigs();
}, []);


    // Actualizar fecha de inicio al cambiar Q o año
    useEffect(() => {
        if (year && quarter && existingConfigs.length > 0) {
            const hasManualDate = localStorage.getItem(`manualDate-${quarter}-${year}`);

            if (!hasManualDate) {
                const calculatedStartDate = calculateStartDate(quarter, year, existingConfigs);
                console.log(`📅 Fecha calculada para ${quarter} ${year}: ${calculatedStartDate}`);
                setStartDate(calculatedStartDate);
                setEndDate('');
            }
        }
    }, [quarter, year, existingConfigs]);

    // Actualizar resumen cuando cambian fechas
    useEffect(() => {
        calculateSummaryData();
    }, [startDate, endDate]);

    useEffect(() => {
        validateForm();
    }, [sprintsPerQ, sprintDuration, year, startDate, endDate, quarter]);

    // Validar fechas
    const validateDates = (start: string, end: string): string => {
        if (!start || !end) return 'Ambas fechas son requeridas';

        const startDateObj = new Date(start + 'T00:00:00Z');
        const endDateObj = new Date(end + 'T00:00:00Z');

        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
            return 'Las fechas deben ser válidas';
        }

        if (startDateObj >= endDateObj) {
            return 'La fecha de inicio debe ser anterior a la fecha de fin';
        }

        const diffDays = calculateDaysBetweenDates(start, end);

        if (diffDays > 90) return 'La duración del trimestre no puede exceder 3 meses';
        if (diffDays < 7) return 'La duración del trimestre debe ser de al menos 1 semana';

        const currentConfig = { quarter, year: parseInt(year), startDate: start, endDate: end };
        return checkQuarterOverlap(currentConfig, existingConfigs);
    };

    // Verificar solapamiento
    const checkQuarterOverlap = (currentConfig: { quarter: string; year: number; startDate: string; endDate: string }, allConfigs: QConfig[]): string => {
        const currentStart = new Date(currentConfig.startDate + 'T00:00:00Z');
        const currentEnd = new Date(currentConfig.endDate + 'T00:00:00Z');

        for (const config of allConfigs) {
            if (config.quarter === currentConfig.quarter && config.year === currentConfig.year) {
                continue;
            }

            const configStart = new Date(config.startDate.split('T')[0] + 'T00:00:00Z');
            const configEnd = new Date(config.endDate.split('T')[0] + 'T00:00:00Z');

            if (currentStart <= configEnd && currentEnd >= configStart) {
                return `El trimestre se solapa con ${config.quarter} ${config.year}`;
            }
        }

        return '';
    };

    const validateForm = (): boolean => {
        const yearNum = Number(year);
        const sprintsNum = Number(sprintsPerQ);
        const durationNum = Number(sprintDuration);

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

        if ((startDate && !endDate) || (!startDate && endDate)) {
            setValidationError('Ambas fechas son requeridas');
            return false;
        }

        setValidationError('');
        return true;
    };

    const handleSave = async () => {
    if (!validateForm()) return;

    const yearNum = Number(year);
    const sprintsNum = Number(sprintsPerQ);
    const durationNum = Number(sprintDuration);

    try {
        // Asegurar que las fechas estén en formato YYYY-MM-DD
        const formattedStartDate = startDate.split('T')[0];
        const formattedEndDate = endDate.split('T')[0];

        const qConfig = {
            quarter,
            year: yearNum,
            sprintsPerQ: sprintsNum,
            sprintDuration: durationNum,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            isActive: true
        };

        console.log('💾 Guardando configuración:', qConfig);

        const response = await fetch('/api/q-configuration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(qConfig),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Configuración guardada:', result);

            setIsSaved(true);
            toast({
                title: "Configuración guardada",
                description: `${quarter} ${yearNum} configurado correctamente.`,
            });

            setTimeout(() => setIsSaved(false), 3000);

            // Recargar configuraciones
            const configsResponse = await fetch('/api/q-configuration/all');
            if (configsResponse.ok) {
                const configs = await configsResponse.json();
                setExistingConfigs(configs);
            }

            localStorage.removeItem(`manualDate-${quarter}-${year}`);

            if (onSave) onSave();
        } else {
            const errorData = await response.json();
            console.error('❌ Error del servidor:', errorData);
            toast({
                title: "Error",
                description: errorData.error || "No se pudo guardar la configuración",
                variant: "destructive",
            });
        }
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        toast({
            title: "Error",
            description: "Error de conexión al guardar la configuración",
            variant: "destructive",
        });
    }
};


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
                    Define la estructura de sprints para el próximo trimestre.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="quarter">Trimestre</Label>
                        <Select value={quarter} onValueChange={(v) => { setQuarter(v); localStorage.removeItem(`manualDate-${v}-${year}`); }}>
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
                            onChange={(e) => { setYear(e.target.value); localStorage.removeItem(`manualDate-${quarter}-${e.target.value}`); }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Fecha de inicio del Q</Label>
                        <div className="relative">
                            <Input
                                id="startDate"
                                type="text"
                                placeholder="dd/mm/yyyy"
                                value={formatDateWithoutTimezone(startDate)}
                                readOnly
                                onClick={(e) => {
                                    const dateInput = document.createElement('input');
                                    dateInput.type = 'date';
                                    dateInput.value = startDate;
                                    dateInput.style.position = 'absolute';
                                    dateInput.style.top = '0';
                                    dateInput.style.left = '0';
                                    dateInput.style.width = '100%';
                                    dateInput.style.height = '100%';
                                    dateInput.style.opacity = '0';
                                    dateInput.style.cursor = 'pointer';

                                    dateInput.onchange = (ev) => {
                                        const newValue = (ev.target as HTMLInputElement).value;
                                        setStartDate(newValue);
                                        localStorage.setItem(`manualDate-${quarter}-${year}`, 'true');
                                        dateInput.remove();
                                    };

                                    dateInput.onblur = () => {
                                        setTimeout(() => dateInput.remove(), 100);
                                    };

                                    e.currentTarget.parentElement?.appendChild(dateInput);
                                    dateInput.focus();
                                    dateInput.showPicker?.();
                                }}
                                className="text-sm cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate">Fecha de fin del Q</Label>
                        <div className="relative">
                            <Input
                                id="endDate"
                                type="text"
                                placeholder="dd/mm/yyyy"
                                value={formatDateWithoutTimezone(endDate)}
                                readOnly
                                onClick={(e) => {
                                    const dateInput = document.createElement('input');
                                    dateInput.type = 'date';
                                    dateInput.value = endDate;
                                    dateInput.style.position = 'absolute';
                                    dateInput.style.top = '0';
                                    dateInput.style.left = '0';
                                    dateInput.style.width = '100%';
                                    dateInput.style.height = '100%';
                                    dateInput.style.opacity = '0';
                                    dateInput.style.cursor = 'pointer';

                                    dateInput.onchange = (ev) => {
                                        const newValue = (ev.target as HTMLInputElement).value;
                                        setEndDate(newValue);
                                        dateInput.remove();
                                    };

                                    dateInput.onblur = () => {
                                        setTimeout(() => dateInput.remove(), 100);
                                    };

                                    e.currentTarget.parentElement?.appendChild(dateInput);
                                    dateInput.focus();
                                    dateInput.showPicker?.();
                                }}
                                className="text-sm cursor-pointer"
                            />
                        </div>
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
                            onChange={(e) => setSprintsPerQ(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sprintDuration">Duración por sprint (semanas)</Label>
                        <div className="flex items-center h-10 px-3 border border-input rounded-md bg-muted">
                            <span className="text-sm font-medium">
                                {summaryData.totalWeeks > 0 ? `${summaryData.totalWeeks} semanas` : 'Seleccione fechas'}
                            </span>
                        </div>
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
                            <p className="font-medium">
                                {formatDateWithoutTimezone(startDate)}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Fin:</p>
                            <p className="font-medium">
                                {formatDateWithoutTimezone(endDate)}
                            </p>
                        </div>
                    </div>
                    {startDate && endDate && (
                        <div className="mt-2 pt-2 border-t">
                            <p className="text-sm font-medium">
                                Duración real: {summaryData.totalWeeks} semanas
                                <span className="text-muted-foreground ml-2">
                                    ({summaryData.totalDays} días)
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
