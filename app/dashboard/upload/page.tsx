"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from "lucide-react"

interface UploadResult {
  success: boolean
  message: string
  processedRecords: number
  errors: string[]
}

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<string>("")
  const [cellId, setCellId] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !fileType || !cellId) {
      return
    }

    setUploading(true)
    setUploadProgress(0)

    // Simular progreso de carga
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      // Simular procesamiento
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Simular resultado exitoso
      setUploadResult({
        success: true,
        message: "Archivo procesado exitosamente",
        processedRecords: Math.floor(Math.random() * 100) + 50,
        errors: [],
      })

      setUploadProgress(100)
    } catch (error) {
      setUploadResult({
        success: false,
        message: "Error al procesar el archivo",
        processedRecords: 0,
        errors: ["Formato de archivo inválido", "Faltan columnas requeridas"],
      })
    } finally {
      clearInterval(progressInterval)
      setUploading(false)
    }
  }

  const downloadTemplate = (type: string) => {
    // Simular descarga de plantilla
    alert(`Descargando plantilla para: ${type}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Carga Masiva de Datos</h2>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Cargar Archivo
          </CardTitle>
          <CardDescription>Sube archivos Excel o CSV con datos de planeación, resultados o capacidad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="file-type">Tipo de Archivo</Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planeación de Sprint</SelectItem>
                  <SelectItem value="results">Resultados de Sprint</SelectItem>
                  <SelectItem value="capacity">Capacidad de Talento</SelectItem>
                  <SelectItem value="daily_logs">Registros Diarios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cell">Célula</Label>
              <Select value={cellId} onValueChange={setCellId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la célula" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Célula Frontend Alpha</SelectItem>
                  <SelectItem value="2">Célula Backend Beta</SelectItem>
                  <SelectItem value="3">Célula DevOps Gamma</SelectItem>
                  <SelectItem value="4">Célula QA Delta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Archivo</Label>
            <Input id="file" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Procesando archivo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={!selectedFile || !fileType || !cellId || uploading}>
              {uploading ? (
                <>Procesando...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Cargar Archivo
                </>
              )}
            </Button>

            {fileType && (
              <Button variant="outline" onClick={() => downloadTemplate(fileType)}>
                <Download className="mr-2 h-4 w-4" />
                Descargar Plantilla
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Result */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Resultado de la Carga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={uploadResult.success ? "default" : "destructive"}>
              <AlertDescription>
                {uploadResult.message}
                {uploadResult.success && (
                  <p className="mt-2">
                    Registros procesados: <strong>{uploadResult.processedRecords}</strong>
                  </p>
                )}
              </AlertDescription>
            </Alert>

            {uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2">Errores encontrados:</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  {uploadResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Templates Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Plantillas Disponibles
          </CardTitle>
          <CardDescription>Descarga las plantillas para cada tipo de archivo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Planeación de Sprint</h4>
              <p className="text-sm text-muted-foreground">
                Incluye: ID Sprint, Tareas, Story Points, Asignaciones, Fechas
              </p>
              <Button variant="outline" size="sm" onClick={() => downloadTemplate("planning")}>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Resultados de Sprint</h4>
              <p className="text-sm text-muted-foreground">
                Incluye: Tareas completadas, Puntos entregados, Métricas de calidad
              </p>
              <Button variant="outline" size="sm" onClick={() => downloadTemplate("results")}>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Capacidad de Talento</h4>
              <p className="text-sm text-muted-foreground">
                Incluye: Miembros, Líneas de conocimiento, Capacidad, Costos
              </p>
              <Button variant="outline" size="sm" onClick={() => downloadTemplate("capacity")}>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Registros Diarios</h4>
              <p className="text-sm text-muted-foreground">
                Incluye: Fecha, Usuario, Tarea, Horas trabajadas, Progreso
              </p>
              <Button variant="outline" size="sm" onClick={() => downloadTemplate("daily_logs")}>
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Cargas Recientes</CardTitle>
          <CardDescription>Historial de archivos procesados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                filename: "planeacion_sprint_23.xlsx",
                type: "Planeación",
                date: "2024-01-15",
                status: "Completado",
                records: 45,
              },
              {
                filename: "resultados_q4_2023.csv",
                type: "Resultados",
                date: "2024-01-14",
                status: "Completado",
                records: 128,
              },
              {
                filename: "capacidad_enero.xlsx",
                type: "Capacidad",
                date: "2024-01-13",
                status: "Error",
                records: 0,
              },
            ].map((upload, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{upload.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {upload.type} • {upload.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{upload.records} registros</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      upload.status === "Completado" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {upload.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
