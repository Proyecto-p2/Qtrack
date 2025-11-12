"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

export default function ReporteFinal() {
    const { selectedSprint } = useSelectedSprint();
    const [ejecPlan, setEjecPlan] = useState<SprintResumen[]>([]);
    const [ejecNoPlan, setEjecNoPlan] = useState<SprintResumen[]>([]);
    const [totales, setTotales] = useState({
        totalItems: 0,
        totalPuntos: 0,
        itemsEjecPlan: 0,
        puntosEjecPlan: 0,
        itemsEjecNoPlan: 0,
        puntosEjecNoPlan: 0
    });

    useEffect(() => {
        const fetchAll = async () => {
            if (!selectedSprint) {
                // Si no hay sprint seleccionado, limpiar los datos
                setTotales({
                    totalItems: 0,
                    totalPuntos: 0,
                    itemsEjecPlan: 0,
                    puntosEjecPlan: 0,
                    itemsEjecNoPlan: 0,
                    puntosEjecNoPlan: 0
                });
                return;
            }

            try {
                const [resPlan, resNoPlan] = await Promise.all([
                    fetch("/api/executed"),
                    fetch("/api/executedNoPlanned")
                ]);

                const ejecPlanData: SprintResumen[] = await resPlan.json();
                const ejecNoPlanData: SprintResumen[] = await resNoPlan.json();

                setEjecPlan(ejecPlanData);
                setEjecNoPlan(ejecNoPlanData);

                // Filtrar datos por el sprint seleccionado
                const ejecPlanSprint = ejecPlanData.filter(item => item.sprint === selectedSprint);
                const ejecNoPlanSprint = ejecNoPlanData.filter(item => item.sprint === selectedSprint);

                console.log("📊 Datos para reporte del sprint:", selectedSprint);
                console.log("✅ Ejecutado/Planeado:", ejecPlanSprint);
                console.log("✅ Ejecutado/No Planeado:", ejecNoPlanSprint);

                // Calcular totales para Ejecutado/Planeado
                const itemsEjecPlan = ejecPlanSprint.reduce((sum, r) => {
                    const items = Number(r.totalItems) || (Number(r.itemsS) + Number(r.itemsM) + Number(r.itemsL));
                    return sum + items;
                }, 0);

                const puntosEjecPlan = ejecPlanSprint.reduce((sum, r) =>
                    sum + (Number(r.puntosComprometidos) || 0), 0
                );

                // Calcular totales para Ejecutado/No Planeado
                const itemsEjecNoPlan = ejecNoPlanSprint.reduce((sum, r) => {
                    const items = Number(r.totalItems) || (Number(r.itemsS) + Number(r.itemsM) + Number(r.itemsL));
                    return sum + items;
                }, 0);

                const puntosEjecNoPlan = ejecNoPlanSprint.reduce((sum, r) =>
                    sum + (Number(r.puntosComprometidos) || 0), 0
                );

                // Totales consolidados
                const totalItems = itemsEjecPlan + itemsEjecNoPlan;
                const totalPuntos = puntosEjecPlan + puntosEjecNoPlan;

                setTotales({
                    totalItems,
                    totalPuntos,
                    itemsEjecPlan,
                    puntosEjecPlan,
                    itemsEjecNoPlan,
                    puntosEjecNoPlan
                });

            } catch (err) {
                console.error("Error al calcular reporte:", err);
                setTotales({
                    totalItems: 0,
                    totalPuntos: 0,
                    itemsEjecPlan: 0,
                    puntosEjecPlan: 0,
                    itemsEjecNoPlan: 0,
                    puntosEjecNoPlan: 0
                });
            }
        };

        fetchAll();
    }, [selectedSprint]);

    // Si no hay sprint seleccionado, no mostrar el reporte
    if (!selectedSprint) {
        return null;
    }

    return (
        <Card className="max-w-3xl mx-auto p-4 mt-10 shadow-md rounded-2xl border border-gray-300">
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-800">📈 Reporte Consolidado - Sprint {selectedSprint}</h2>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Totales por categoría */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-gray-700">⚙️ Ejecutado / Planeado</h3>
                        <div>
                            <Label>Items ejecutados</Label>
                            <Input type="number" readOnly value={totales.itemsEjecPlan} className="bg-blue-50" />
                        </div>
                        <div>
                            <Label>Puntos ejecutados</Label>
                            <Input type="number" readOnly value={totales.puntosEjecPlan} className="bg-blue-50" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-gray-700">⚙️ Ejecutado / No Planeado</h3>
                        <div>
                            <Label>Items ejecutados</Label>
                            <Input type="number" readOnly value={totales.itemsEjecNoPlan} className="bg-green-50" />
                        </div>
                        <div>
                            <Label>Puntos ejecutados</Label>
                            <Input type="number" readOnly value={totales.puntosEjecNoPlan} className="bg-green-50" />
                        </div>
                    </div>
                </div>

                {/* Totales consolidados */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                        <Label className="font-bold">Total items ejecutados</Label>
                        <Input
                            type="number"
                            readOnly
                            value={totales.totalItems}
                            className="bg-gray-100 font-bold"
                        />
                    </div>
                    <div>
                        <Label className="font-bold">Total puntos ejecutados</Label>
                        <Input
                            type="number"
                            readOnly
                            value={totales.totalPuntos}
                            className="bg-gray-100 font-bold"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}