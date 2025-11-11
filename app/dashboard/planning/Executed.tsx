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

export default function EjecutadoPlaneadoPanel() {
    const { selectedSprint, setSelectedSprint } = useSelectedSprint();
    const [resumen, setResumen] = useState<SprintResumen | null>(null);
    const [savedData, setSavedData] = useState<SprintResumen[]>([]);
    const [planeadoData, setPlaneadoData] = useState<SprintResumen[]>([]);
    const [sprints, setSprints] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Cargar sprints y datos planeados
                const resPlaneado = await fetch("/api/planning");
                const planeado: any = await resPlaneado.json();
                const planeadoArr: SprintResumen[] = Array.isArray(planeado) ? planeado : [];

                // Cargar datos ejecutados existentes
                const resEjecutado = await fetch("/api/executed");
                const ejecutado: any = await resEjecutado.json();
                const ejecutadoArr: SprintResumen[] = Array.isArray(ejecutado) ? ejecutado : [];

                setPlaneadoData(planeadoArr);
                setSavedData(ejecutadoArr);
                setSprints(Array.from(new Set(planeadoArr.map((p) => p.sprint))));
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
                // 1. Primero buscar en ejecutado/planeado (datos guardados)
                const existing = savedData.find((p) => p.sprint === selectedSprint);
                if (existing) {
                    setResumen({
                        ...existing,
                        totalItems: existing.totalItems ??
                            (Number(existing.itemsS || 0) + Number(existing.itemsM || 0) + Number(existing.itemsL || 0)),
                    });
                    return;
                }

                // 2. Si no existe, cargar DESDE PLANEADO como base
                const planeado = planeadoData.find((p) => p.sprint === selectedSprint);
                if (planeado) {
                    setResumen({
                        sprint: selectedSprint,
                        celula: planeado.celula,
                        puntosComprometidos: planeado.puntosComprometidos || 0,
                        itemsS: planeado.itemsS || 0,
                        itemsM: planeado.itemsM || 0,
                        itemsL: planeado.itemsL || 0,
                        totalItems: planeado.totalItems ??
                            ((planeado.itemsS || 0) + (planeado.itemsM || 0) + (planeado.itemsL || 0)),
                    });
                }
            } catch (err) {
                console.error("Error cargando datos del sprint:", err);
            }
        };

        loadSprintData();
    }, [selectedSprint, savedData, planeadoData]);

    const handleChange = (field: keyof SprintResumen, value: number | string) => {
        if (!resumen) return;

        const numValue = typeof value === "string" ? Number(value) : value;

        const updated: SprintResumen = {
            ...resumen,
            [field]: isNaN(numValue) ? 0 : numValue,
        } as SprintResumen;

        // Recalcular totalItems si cambian items S, M o L
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

        console.log("💾 Guardando ejecutado/planeado:", payload);

        try {
            const res = await fetch("/api/executed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("✅ Ejecutado/Planeado guardado correctamente");
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
                alert("❌ Error al guardar ejecutado/planeado");
            }
        } catch (err) {
            console.error("Error guardando ejecutado/planeado:", err);
            alert("❌ Error al guardar ejecutado/planeado (ver consola)");
        }
    };

    return (
        <Card className="max-w-3xl mx-auto p-4 mt-10 shadow-md rounded-2xl border border-gray-300">
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-800">⚙️ Ejecutado / Planeado</h2>
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
                                <Label>Items Ejec/Plan</Label>
                                <Input
                                    type="number"
                                    value={resumen.totalItems ?? 0}
                                    onChange={(e) => handleChange("totalItems", Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label>Puntos Ejec/Plan</Label>
                                <Input
                                    type="number"
                                    value={resumen.puntosComprometidos}
                                    onChange={(e) =>
                                        handleChange("puntosComprometidos", Number(e.target.value))
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                            <Button onClick={handleSave}>💾 Guardar Ejecutado / Planeado</Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}