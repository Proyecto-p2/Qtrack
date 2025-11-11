"use client";

import { useState, useEffect } from "react";
import PlaneadoPanel from "./PlanningPanel";
import EjecutadoPlaneadoPanel from "./Executed";
import EjecutadoNoPlaneadoPanel from "./ExecutedNoPlanned";
import ReporteFinal from "./ReporteFinal";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SprintResumen {
    sprint: string;
    celula: string;
    puntosComprometidos: number;
    itemsS: number;
    itemsM: number;
    itemsL: number;
    totalItems?: number;
}

export default function PlanningPage() {
    const [selectedSprintTotales, setSelectedSprintTotales] = useState<string>("");
    const [sprints, setSprints] = useState<string[]>([]);
    const [totales, setTotales] = useState({
        totalItemsEjecutados: 0,
        puntosTotalEjecutados: 0
    });

    // Cargar sprints disponibles
    useEffect(() => {
        const fetchSprints = async () => {
            try {
                const resPlaneado = await fetch("/api/planning");
                const planeado: SprintResumen[] = await resPlaneado.json();
                const sprintsUnicos = Array.from(new Set(planeado.map((p) => p.sprint)));
                setSprints(sprintsUnicos);
            } catch (err) {
                console.error("Error cargando sprints:", err);
            }
        };
        fetchSprints();
    }, []);

    // Calcular totales cuando cambie el sprint seleccionado
    useEffect(() => {
        const fetchTotales = async () => {
            if (!selectedSprintTotales) {
                setTotales({ totalItemsEjecutados: 0, puntosTotalEjecutados: 0 });
                return;
            }

            try {
                console.log("🔄 Calculando totales para sprint:", selectedSprintTotales);

                const [resPlan, resNoPlan] = await Promise.all([
                    fetch("/api/executed"),
                    fetch("/api/executedNoPlanned")
                ]);

                const ejecPlanData: SprintResumen[] = await resPlan.json();
                const ejecNoPlanData: SprintResumen[] = await resNoPlan.json();

                console.log("📊 Datos obtenidos:");
                console.log("- Ejecutado/Planeado:", ejecPlanData);
                console.log("- Ejecutado/No Planeado:", ejecNoPlanData);

                // Filtrar datos por el sprint seleccionado
                const ejecPlanSprint = ejecPlanData.filter(item => item.sprint === selectedSprintTotales);
                const ejecNoPlanSprint = ejecNoPlanData.filter(item => item.sprint === selectedSprintTotales);

                console.log("🎯 Datos filtrados para sprint", selectedSprintTotales + ":");
                console.log("- Ejecutado/Planeado:", ejecPlanSprint);
                console.log("- Ejecutado/No Planeado:", ejecNoPlanSprint);

                // Calcular totales
                let totalItemsEjecutados = 0;
                let puntosTotalEjecutados = 0;

                // Sumar Ejecutado/Planeado
                ejecPlanSprint.forEach(r => {
                    const items = Number(r.totalItems) || (Number(r.itemsS) + Number(r.itemsM) + Number(r.itemsL));
                    const puntos = Number(r.puntosComprometidos) || 0;
                    totalItemsEjecutados += items;
                    puntosTotalEjecutados += puntos;
                    console.log(`📦 Ejecutado/Planeado - Items: ${items}, Puntos: ${puntos}`);
                });

                // Sumar Ejecutado/No Planeado
                ejecNoPlanSprint.forEach(r => {
                    const items = Number(r.totalItems) || (Number(r.itemsS) + Number(r.itemsM) + Number(r.itemsL));
                    const puntos = Number(r.puntosComprometidos) || 0;
                    totalItemsEjecutados += items;
                    puntosTotalEjecutados += puntos;
                    console.log(`📦 Ejecutado/No Planeado - Items: ${items}, Puntos: ${puntos}`);
                });

                console.log("✅ Totales finales - Items:", totalItemsEjecutados, "Puntos:", puntosTotalEjecutados);

                setTotales({
                    totalItemsEjecutados,
                    puntosTotalEjecutados
                });

            } catch (err) {
                console.error("❌ Error al calcular totales:", err);
                setTotales({ totalItemsEjecutados: 0, puntosTotalEjecutados: 0 });
            }
        };

        fetchTotales();
    }, [selectedSprintTotales]);

    return (
        <div className="space-y-10">
            <PlaneadoPanel />
            <EjecutadoPlaneadoPanel />
            <EjecutadoNoPlaneadoPanel />

            {/* Panel de Totales Consolidados con selector propio */}
            <Card className="max-w-3xl mx-auto p-4 mt-10 shadow-md rounded-2xl border border-gray-300">
                <CardHeader>
                    <h2 className="text-xl font-bold text-gray-800">📊 Totales Consolidados</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Selector de Sprint */}
                    <div>
                        <Label>Sprint</Label>
                        <Select value={selectedSprintTotales} onValueChange={setSelectedSprintTotales}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecciona un sprint para ver los totales" />
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

                    {/* Totales */}
                    {selectedSprintTotales && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <Label className="font-semibold">Total Items Ejecutados</Label>
                                <Input
                                    type="number"
                                    readOnly
                                    value={totales.totalItemsEjecutados}
                                    className="bg-gray-50 font-bold text-lg"
                                />
                            </div>
                            <div>
                                <Label className="font-semibold">Total Puntos Ejecutados</Label>
                                <Input
                                    type="number"
                                    readOnly
                                    value={totales.puntosTotalEjecutados}
                                    className="bg-gray-50 font-bold text-lg"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ReporteFinal />
        </div>
    );
}