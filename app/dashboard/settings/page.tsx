"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Settings, Bell, Database, Shield, Palette, Globe, Save, RefreshCw } from "lucide-react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReports: true,
    sprintReminders: true,
  })

  const [systemSettings, setSystemSettings] = useState({
    defaultSprintDuration: "14",
    workingHoursPerDay: "8",
    defaultVelocityTarget: "40",
    qualityThreshold: "85",
  })

  const handleSaveSettings = () => {
    alert("Configuración guardada exitosamente")
  }

  const handleResetSettings = () => {
    if (confirm("¿Estás seguro de que quieres restaurar la configuración por defecto?")) {
      alert("Configuración restaurada")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Restaurar
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración General
          </CardTitle>
          <CardDescription>Configuraciones básicas del sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nombre de la Empresa</Label>
              <Input id="company-name" defaultValue="Mi Empresa S.A." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Select defaultValue="america/bogota">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="america/bogota">América/Bogotá (UTC-5)</SelectItem>
                  <SelectItem value="america/mexico_city">América/Ciudad_de_México (UTC-6)</SelectItem>
                  <SelectItem value="america/new_york">América/Nueva_York (UTC-5)</SelectItem>
                  <SelectItem value="europe/madrid">Europa/Madrid (UTC+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select defaultValue="cop">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cop">Peso Colombiano (COP)</SelectItem>
                  <SelectItem value="usd">Dólar Americano (USD)</SelectItem>
                  <SelectItem value="eur">Euro (EUR)</SelectItem>
                  <SelectItem value="mxn">Peso Mexicano (MXN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select defaultValue="es">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sprint Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configuración de Sprints
          </CardTitle>
          <CardDescription>Parámetros por defecto para la gestión de sprints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sprint-duration">Duración de Sprint (días)</Label>
              <Input
                id="sprint-duration"
                type="number"
                value={systemSettings.defaultSprintDuration}
                onChange={(e) => setSystemSettings({ ...systemSettings, defaultSprintDuration: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="working-hours">Horas de Trabajo por Día</Label>
              <Input
                id="working-hours"
                type="number"
                value={systemSettings.workingHoursPerDay}
                onChange={(e) => setSystemSettings({ ...systemSettings, workingHoursPerDay: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="velocity-target">Velocidad Objetivo por Defecto</Label>
              <Input
                id="velocity-target"
                type="number"
                value={systemSettings.defaultVelocityTarget}
                onChange={(e) => setSystemSettings({ ...systemSettings, defaultVelocityTarget: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality-threshold">Umbral de Calidad (%)</Label>
              <Input
                id="quality-threshold"
                type="number"
                value={systemSettings.qualityThreshold}
                onChange={(e) => setSystemSettings({ ...systemSettings, qualityThreshold: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>Configura cómo y cuándo recibir notificaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alertas por Email</Label>
              <p className="text-sm text-muted-foreground">Recibir alertas críticas por correo electrónico</p>
            </div>
            <Switch
              checked={notifications.emailAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificaciones Push</Label>
              <p className="text-sm text-muted-foreground">Notificaciones en tiempo real en el navegador</p>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reportes Semanales</Label>
              <p className="text-sm text-muted-foreground">Resumen semanal de métricas por email</p>
            </div>
            <Switch
              checked={notifications.weeklyReports}
              onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Recordatorios de Sprint</Label>
              <p className="text-sm text-muted-foreground">Notificaciones sobre inicio y fin de sprints</p>
            </div>
            <Switch
              checked={notifications.sprintReminders}
              onCheckedChange={(checked) => setNotifications({ ...notifications, sprintReminders: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Seguridad
          </CardTitle>
          <CardDescription>Configuraciones de seguridad y acceso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Tiempo de Sesión (minutos)</Label>
              <Input id="session-timeout" type="number" defaultValue="480" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-policy">Política de Contraseñas</Label>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Básica (8 caracteres)</SelectItem>
                  <SelectItem value="medium">Media (8 chars + números)</SelectItem>
                  <SelectItem value="high">Alta (12 chars + símbolos)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Configuraciones de Seguridad</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Autenticación de dos factores</span>
                <Badge variant="outline">Recomendado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Registro de actividad de usuarios</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Bloqueo automático por intentos fallidos</span>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme and Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Apariencia
          </CardTitle>
          <CardDescription>Personaliza la apariencia del sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select defaultValue="system">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color-scheme">Esquema de Colores</Label>
              <Select defaultValue="blue">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Azul</SelectItem>
                  <SelectItem value="green">Verde</SelectItem>
                  <SelectItem value="purple">Púrpura</SelectItem>
                  <SelectItem value="orange">Naranja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Logo de la Empresa</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Logo</span>
              </div>
              <Button variant="outline">Cambiar Logo</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestión de Datos
          </CardTitle>
          <CardDescription>Configuraciones de respaldo y retención de datos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Frecuencia de Respaldo</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Cada Hora</SelectItem>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="retention-period">Período de Retención (meses)</Label>
              <Input id="retention-period" type="number" defaultValue="12" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Opciones de Datos</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Exportación automática de reportes</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Compresión de datos históricos</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Anonimización de datos sensibles</span>
                <Switch />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Integraciones</CardTitle>
          <CardDescription>Configurar conexiones con sistemas externos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">J</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Jira</p>
                  <p className="text-xs text-muted-foreground">Sincronización de tareas y sprints</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Desconectado</Badge>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium text-purple-600">S</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Slack</p>
                  <p className="text-xs text-muted-foreground">Notificaciones y alertas</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">Conectado</Badge>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium text-green-600">G</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Google Workspace</p>
                  <p className="text-xs text-muted-foreground">Calendario y documentos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Desconectado</Badge>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración Avanzada</CardTitle>
          <CardDescription>Configuraciones técnicas y de desarrollo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-settings">Configuración de API</Label>
            <Textarea id="api-settings" placeholder="Configuraciones JSON para APIs externas..." rows={4} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Modo de Desarrollo</Label>
              <p className="text-sm text-muted-foreground">Habilitar logs detallados y herramientas de debug</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Cache Avanzado</Label>
              <p className="text-sm text-muted-foreground">Optimizar rendimiento con cache inteligente</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
