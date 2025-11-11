"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useSelectedSprint } from "@/hooks/useSelectedSprint";

interface SprintResumen {
    sprint: string;
    celula: string;
    puntosComprometidos: number;
    itemsS: number;
    itemsM: number;
    itemsL: number;
    totalItems?: number;
}

export default function EjecutadoNoPlaneadoPanel() {
    const { selectedSprint, setSelectedSprint } = useSelectedSprint();
    const [resumen, setResumen] = useState<SprintResumen | null>(null);
    const [savedData, setSavedData] = useState<SprintResumen[]>([]);
    const [ejecutadoPlaneadoData, setEjecutadoPlaneadoData] = useState<SprintResumen[]>([]);
    const [sprints, setSprints] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Cargar sprints disponibles
                const resPlaneado = await fetch("/api/planning");
                const planeado: SprintResumen[] = await resPlaneado.json();
                setSprints([...new Set(planeado.map((p) => p.sprint))]);

                // Cargar datos de ejecutado/planeado
                const resEjecutadoPlan = await fetch("/api/executed");
                const ejecutadoPlan: SprintResumen[] = await resEjecutadoPlan.json();
                setEjecutadoPlaneadoData(Array.isArray(ejecutadoPlan) ? ejecutadoPlan : []);

                // Cargar datos guardados de ejecutado/no planeado
                const resEjecutadoNoPlan = await fetch("/api/executedNoPlanned");
                const ejecutadoNoPlan: SprintResumen[] = await resEjecutadoNoPlan.json();
                setSavedData(Array.isArray(ejecutadoNoPlan) ? ejecutadoNoPlan : []);
            } catch (err) {
                console.error("Error cargando datos:", err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!selectedSprint) return;

        const loadSprintData = async () => {
            try {
                // 1. Primero buscar en ejecutado/no planeado (datos guardados)
                const existing = savedData.find((p) => p.sprint === selectedSprint);
                if (existing) {
                    setResumen({
                        ...existing,
                        totalItems: existing.totalItems ?? (existing.itemsS + existing.itemsM + existing.itemsL),
                    });
                    return;
                }

                // 2. Si no existe, cargar DESDE EJECUTADO/PLANEADO como base
                const ejecutadoPlaneado = ejecutadoPlaneadoData.find((p) => p.sprint === selectedSprint);
                if (ejecutadoPlaneado) {
                    setResumen({
                        sprint: selectedSprint,
                        celula: ejecutadoPlaneado.celula,
                        puntosComprometidos: ejecutadoPlaneado.puntosComprometidos || 0,
                        itemsS: ejecutadoPlaneado.itemsS || 0,
                        itemsM: ejecutadoPlaneado.itemsM || 0,
                        itemsL: ejecutadoPlaneado.itemsL || 0,
                        totalItems: ejecutadoPlaneado.totalItems ??
                            ((ejecutadoPlaneado.itemsS || 0) + (ejecutadoPlaneado.itemsM || 0) + (ejecutadoPlaneado.itemsL || 0)),
                    });
                    return;
                }

                // 3. Si no existe en ejecutado/planeado, cargar desde planeado
                const resPlaneado = await fetch("/api/planning");
                const planeado: SprintResumen[] = await resPlaneado.json();
                const plan = planeado.find((p) => p.sprint === selectedSprint);

                if (plan) {
                    setResumen({
                        sprint: selectedSprint,
                        celula: plan.celula,
                        puntosComprometidos: plan.puntosComprometidos || 0,
                        itemsS: plan.itemsS || 0,
                        itemsM: plan.itemsM || 0,
                        itemsL: plan.itemsL || 0,
                        totalItems: plan.totalItems ??
                            ((plan.itemsS || 0) + (plan.itemsM || 0) + (plan.itemsL || 0)),
                    });
                }
            } catch (err) {
                console.error("Error cargando datos del sprint:", err);
            }
        };

        loadSprintData();
    }, [selectedSprint, savedData, ejecutadoPlaneadoData]);

    const handleChange = (field: keyof SprintResumen, value: number | string) => {
        if (!resumen) return;

        const numValue = typeof value === "string" ? Number(value) : value;

        const updated: SprintResumen = {
            ...resumen,
            [field]: isNaN(numValue as number) ? 0 : numValue,
        } as SprintResumen;

        // Si cambian items S, M o L, recalculamos totalItems automáticamente
        if (field === "itemsS" || field === "itemsM" || field === "itemsL") {
            updated.totalItems = (Number(updated.itemsS || 0) + Number(updated.itemsM || 0) + Number(updated.itemsL || 0));
        }

        setResumen(updated);
    };

    const handleSave = async () => {
        if (!resumen) return;

        const payload = {
            sprint: resumen.sprint,
            celula: resumen.celula,
            puntosComprometidos: Number(resumen.puntosComprometidos) || 0,
            itemsS: Number(resumen.itemsS) || 0,
            itemsM: Number(resumen.itemsM) || 0,
            itemsL: Number(resumen.itemsL) || 0,
            totalItems: Number(resumen.totalItems) || 0,
        };

        console.log("💾 Guardando ejecutado/no planeado:", payload);

        try {
            const res = await fetch("/api/executedNoPlanned", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("✅ Ejecutado/No planeado guardado correctamente");
                setSavedData(prev => {
                    const index = prev.findIndex(p => p.sprint === payload.sprint);
                    if (index >= 0) {
                        const updated = [...prev];
                        updated[index] = payload;
                        return updated;
                    }
                    return [...prev, payload];
                });
            } else {
                const errorData = await res.json();
                console.error("❌ Error del servidor:", errorData);
                alert("❌ Error al guardar ejecutado/no planeado");
            }
        } catch (err) {
            console.error("Error guardando ejecutado/no planeado:", err);
            alert("❌ Error al guardar ejecutado/no planeado (ver consola)");
        }
    };

    return (
        <Card className="max-w-3xl mx-auto p-4 mt-10 shadow-md rounded-2xl border border-gray-300">
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-800">⚙️ Ejecutado / No planeado</h2>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label>Sprint</Label>
                    <Select value={selectedSprint} onValueChange={setSelectedSprint}>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecciona un sprint" />
                        </SelectTrigger>
                        <SelectContent>
                            {sprints.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {resumen && (
                    <>
                        <div>
                            <Label>Célula</Label>
                            <Input value={resumen.celula} readOnly className="bg-gray-50" />
                        </div>

                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {["S", "M", "L"].map((size) => (
                                <div key={size}>
                                    <Label>{`Items ${size}`}</Label>
                                    <Input
                                        type="number"
                                        value={resumen[`items${size}` as keyof SprintResumen] as number}
                                        onChange={(e) =>
                                            handleChange(`items${size}` as keyof SprintResumen, Number(e.target.value))
                                        }
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                                <Label>Items Ejec/No Plan</Label>
                                <Input
                                    type="number"
                                    value={resumen.totalItems ?? 0}
                                    onChange={(e) => handleChange("totalItems", Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label>Puntos Ejec/No Plan</Label>
                                <Input
                                    type="number"
                                    value={resumen.puntosComprometidos}
                                    onChange={(e) => handleChange("puntosComprometidos", Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                            <Button onClick={handleSave}>💾 Guardar Ejecutado / No Planeado</Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}