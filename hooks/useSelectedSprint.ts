// hooks/useSelectedSprint.ts
"use client";

import { useState, useEffect } from 'react';

export function useSelectedSprint() {
    const [selectedSprint, setSelectedSprint] = useState<string>("");

    // Cargar desde localStorage al inicializar
    useEffect(() => {
        const savedSprint = localStorage.getItem('selectedSprint');
        if (savedSprint) {
            setSelectedSprint(savedSprint);
        }
    }, []);

    // Guardar en localStorage cuando cambie
    useEffect(() => {
        if (selectedSprint) {
            localStorage.setItem('selectedSprint', selectedSprint);
        } else {
            localStorage.removeItem('selectedSprint');
        }
    }, [selectedSprint]);

    return { selectedSprint, setSelectedSprint };
}