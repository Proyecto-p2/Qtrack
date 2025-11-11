"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useSelectedSprint } from "@/hooks/useSelectedSprint";

interface ExcelRecord {
    assigned_to: string;
    state: string;
    story_points: number;
    iteration_path: string;
    sprint: string;
    celula: string;
}

interface SprintResumen {
    sprint: string;
    celula: string;
    puntosComprometidos: number;
    itemsS: number;
    itemsM: number;
    itemsL: number;
    totalItems?: number;
}

export default function PlaneadoPanel() {
    const { selectedSprint, setSelectedSprint } = useSelectedSprint();
    const [data, setData] = useState<ExcelRecord[]>([]);
    const [sprints, setSprints] = useState<string[]>([]);
    const [resumen, setResumen] = useState<SprintResumen | null>(null);
    const [savedData, setSavedData] = useState<SprintResumen[]>([]);

    // 🔹 Cargar datos del Excel y del planeado
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [uploadRes, planningRes] = await Promise.all([
                    fetch("/api/upload"),
                    fetch("/api/planning"),
                ]);

                const uploadData = await uploadRes.json().catch(() => []);
                const planningData = await planningRes.json().catch(() => []);

                console.log("📊 Datos cargados desde Excel:", uploadData);
                console.log("💾 Datos guardados en planning:", planningData);

                const cleaned = (Array.isArray(uploadData) ? uploadData : []).map((r: any) => ({
                    ...r,
                    story_points: Number(r.story_points) || 0,
                }));

                setData(cleaned);
                setSavedData(Array.isArray(planningData) ? planningData : []);
                setSprints(Array.from(new Set(cleaned.map((r: any) => r.sprint))).filter(Boolean) as string[]);
            } catch (err) {
                console.error("Error cargando datos:", err);
            }
        };
        fetchData();
    }, []);

    // 🔹 Cargar resumen existente o crear nuevo desde Excel
    useEffect(() => {
        if (!selectedSprint) return;

        console.log("🔄 Cargando datos para sprint:", selectedSprint);

        // 1. Primero buscar en datos guardados (planning_data)
        const existing = savedData.find((p) => p.sprint === selectedSprint);
        if (existing) {
            console.log("✅ Encontrado en planning_data:", existing);
            setResumen({
                ...existing,
                totalItems: existing.totalItems ??
                    (Number(existing.itemsS || 0) + Number(existing.itemsM || 0) + Number(existing.itemsL || 0)),
            });
            return;
        }

        // 2. Si no existe en planning_data, calcular desde datos del Excel
        const sprintData = data.filter((d) => d.sprint === selectedSprint);
        console.log("📋 Datos del sprint desde Excel:", sprintData);

        if (sprintData.length === 0) {
            console.log("❌ No hay datos para este sprint");
            setResumen(null);
            return;
        }

        // Calcular puntos comprometidos desde el Excel
        const puntosPorPersona: Record<string, number> = {};
        sprintData.forEach((item) => {
            const puntos = Number(item.story_points) || 0;
            if (!item.assigned_to) return;
            puntosPorPersona[item.assigned_to] = (puntosPorPersona[item.assigned_to] || 0) + puntos;
        });

        const puntosComprometidos = Object.values(puntosPorPersona).reduce((sum, val) => sum + val, 0);
        const celula = sprintData[0]?.celula || "";

        console.log("🧮 Calculado desde Excel - Puntos:", puntosComprometidos, "Célula:", celula);

        // Crear resumen con datos del Excel
        const nuevoResumen: SprintResumen = {
            sprint: selectedSprint,
            celula,
            puntosComprometidos,
            itemsS: 0, // Estos campos se llenarán manualmente
            itemsM: 0,
            itemsL: 0,
            totalItems: 0,
        };

        setResumen(nuevoResumen);
    }, [selectedSprint, savedData, data]);

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

    // 🔹 Guardar planeado
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

        console.log("💾 Guardando planeado:", payload);

        try {
            const res = await fetch("/api/planning", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("✅ Planeado guardado correctamente");
                setSavedData((prev) => {
                    const existingIndex = prev.findIndex((p) => p.sprint === resumen.sprint);
                    if (existingIndex >= 0) {
                        const updated = [...prev];
                        updated[existingIndex] = payload;
                        return updated;
                    }
                    return [...prev, payload];
                });
            } else {
                alert("❌ Error al guardar planeado");
            }
        } catch (err) {
            console.error("Error guardando planeado:", err);
            alert("❌ Error al guardar planeado (ver consola)");
        }
    };

    // 🔹 Descargar Excel con todos los datos
    const handleDownload = async () => {
        try {
            const PLANNING_API = "/api/planning";
            const EXECUTED_API = "/api/executed";
            const EXECUTED_NO_PLANNED_API = "/api/executedNoPlanned";

            const [planeadoRes, ejecutadoRes, ejecutadoNoPlanRes] = await Promise.allSettled([
                fetch(PLANNING_API),
                fetch(EXECUTED_API),
                fetch(EXECUTED_NO_PLANNED_API),
            ]);

            const safeJson = async (p: PromiseSettledResult<Response>) => {
                try {
                    if (p.status !== "fulfilled") return [];
                    const r = p.value;
                    if (!r.ok) return [];
                    const j = await r.json();
                    return Array.isArray(j) ? j : [];
                } catch {
                    return [];
                }
            };

            const planeadoArr = await safeJson(planeadoRes);
            const ejecutadoArr = await safeJson(ejecutadoRes);
            const ejecutadoNoPlanArr = await safeJson(ejecutadoNoPlanRes);

            // Normalizar datos
            const normalize = (arr: any[]) =>
                arr.map((r) => ({
                    sprint: r.sprint ?? "",
                    celula: r.celula ?? "",
                    puntosComprometidos: Number(r.puntosComprometidos ?? r.puntos_comprometidos ?? 0),
                    itemsS: Number(r.itemsS ?? r.items_s ?? 0),
                    itemsM: Number(r.itemsM ?? r.items_m ?? 0),
                    itemsL: Number(r.itemsL ?? r.items_l ?? 0),
                    totalItems: Number(r.totalItems ?? r.total_items ?? 0),
                }));

            const planeadoNorm = normalize(planeadoArr);
            const ejecutadoNorm = normalize(ejecutadoArr);
            const ejecutadoNoPlanNorm = normalize(ejecutadoNoPlanArr);

            // Consolidado: sumar ejecutado + ejecutado_no_planeado
            const consolidatedMap = new Map();

            [...ejecutadoNorm, ...ejecutadoNoPlanNorm].forEach(item => {
                const key = item.sprint;
                if (!consolidatedMap.has(key)) {
                    consolidatedMap.set(key, {
                        sprint: item.sprint,
                        celula: item.celula,
                        totalItemsEjecutados: item.totalItems,
                        puntosTotalEjecutados: item.puntosComprometidos,
                    });
                } else {
                    const existing = consolidatedMap.get(key);
                    existing.totalItemsEjecutados += item.totalItems;
                    existing.puntosTotalEjecutados += item.puntosComprometidos;
                }
            });

            const consolidatedArray = Array.from(consolidatedMap.values());

            // Crear hojas del Excel
            const wsPlaneado = XLSX.utils.json_to_sheet(planeadoNorm);
            const wsEjecutado = XLSX.utils.json_to_sheet(ejecutadoNorm);
            const wsEjecutadoNoPlan = XLSX.utils.json_to_sheet(ejecutadoNoPlanNorm);
            const wsConsolidado = XLSX.utils.json_to_sheet(consolidatedArray);

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, wsPlaneado, "Planeado");
            XLSX.utils.book_append_sheet(wb, wsEjecutado, "EjecutadoPlaneado");
            XLSX.utils.book_append_sheet(wb, wsEjecutadoNoPlan, "EjecutadoNoPlaneado");
            XLSX.utils.book_append_sheet(wb, wsConsolidado, "Consolidado");

            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(blob, "reporte_planeado_ejecutado_consolidado.xlsx");

            alert("✅ Reporte descargado correctamente");
        } catch (err) {
            console.error("Error exportando Excel:", err);
            alert("❌ Error exportando Excel (revisa consola)");
        }
    };

    return (
        <Card className="max-w-3xl mx-auto p-4 mt-6 shadow-md rounded-2xl">
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-800">📑 Planeado</h2>
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
                            <Input
                                value={resumen.celula}
                                onChange={(e) => handleChange("celula", e.target.value)}
                            />
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
                                <Label>Items planeados</Label>
                                <Input
                                    type="number"
                                    value={resumen.totalItems || 0}
                                    onChange={(e) => handleChange("totalItems", Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label>Puntos comprometidos</Label>
                                <Input
                                    type="number"
                                    value={resumen.puntosComprometidos}
                                    onChange={(e) => handleChange("puntosComprometidos", Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                            <Button onClick={handleSave}>💾 Guardar Planeado</Button>
                            <Button variant="secondary" className="bg-green-600 text-white" onClick={handleDownload}>
                                📄 Descargar Reporte Completo
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}