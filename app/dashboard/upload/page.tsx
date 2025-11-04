"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

interface ExcelRow {
  assignedTo: string;
  state: string;
  storyPoints: string;
  iterationPath: string;
  id?: number;
  createdAt?: string;
}

export default function DashboardUpload() {
  const [formValues, setFormValues] = useState<ExcelRow>({
    assignedTo: "",
    state: "",
    storyPoints: "",
    iterationPath: "",
  });
  const [savedData, setSavedData] = useState<ExcelRow[]>([]);

  const fetchSavedData = async () => {
    try {
      const res = await fetch("/api/upload");
      const data = await res.json();

      if (Array.isArray(data)) {
        const formattedData = data.map((row: any) => ({
          assignedTo: row.assigned_to,
          state: row.state,
          storyPoints: row.story_points,
          iterationPath: row.iteration_path,
          id: row.id,
          createdAt: row.created_at,
        }));
        setSavedData(formattedData);
      } else {
        const row = data;
        setSavedData([{
          assignedTo: row.assigned_to,
          state: row.state,
          storyPoints: row.story_points,
          iterationPath: row.iteration_path,
          id: row.id,
          createdAt: row.created_at,
        }]);
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setSavedData([]);
    }
  };

  useEffect(() => {
    fetchSavedData();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length > 0) {
        const firstRow = jsonData[0];
        setFormValues({
          assignedTo: firstRow["Assigned To"] || "",
          state: firstRow["State"] || "",
          storyPoints: String(firstRow["Story Points"] || ""),
          iterationPath: firstRow["Iteration Path"] || "",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSave = async () => {
    console.log("Datos a guardar:", formValues);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: formValues.assignedTo,
          state: formValues.state,
          story_points: formValues.storyPoints,
          iteration_path: formValues.iterationPath,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        console.error("Error al guardar:", result);
        return;
      }

      setFormValues({ assignedTo: "", state: "", storyPoints: "", iterationPath: "" });
      fetchSavedData();
    } catch (error) {
      console.error("Error guardando datos:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-black">📂 Dashboard Upload</h2>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="mb-4 w-full file:border file:rounded file:px-3 file:py-2 file:bg-blue-600 file:text-white file:cursor-pointer"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {["assignedTo", "state", "storyPoints", "iterationPath"].map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1 text-black">{key}</label>
            <input
              name={key}
              value={(formValues as any)[key]}
              onChange={handleChange}
              placeholder={key}
              className="border rounded w-full p-2 text-black focus:ring-2 focus:ring-blue-400 bg-white"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mb-6"
      >
        Guardar datos
      </button>

      <h3 className="text-lg font-semibold mb-3 text-black">💾 Datos guardados</h3>
      {savedData.length === 0 ? (
        <p className="text-gray-500">No hay datos guardados aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedData.map((row) => (
            <div key={row.id} className="p-4 border rounded-lg shadow-sm bg-gray-50 text-black">
              <p>
                <span className="font-semibold">Assigned To:</span> {row.assignedTo}
              </p>
              <p>
                <span className="font-semibold">State:</span> {row.state}
              </p>
              <p>
                <span className="font-semibold">Story Points:</span> {row.storyPoints}
              </p>
              <p>
                <span className="font-semibold">Iteration Path:</span> {row.iterationPath}
              </p>
              {row.createdAt && <p className="text-xs text-gray-500 mt-1">{row.createdAt}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
