"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, UserPlus, Activity } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">QTRACK</h1>
          <p className="text-muted-foreground text-lg">
            Cell Performance Management System
          </p>
        </div>

        {/* Welcome Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Bienvenido</CardTitle>
            <CardDescription>
              Sistema de gestión y análisis de rendimiento de células de trabajo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Login Button */}
            <Link href="/auth/login" className="block">
              <Button className="w-full" size="lg">
                <LogIn className="h-5 w-5 mr-2" />
                Iniciar Sesión
              </Button>
            </Link>

            {/* Register Button */}
            <Link href="/auth/register" className="block">
              <Button variant="outline" className="w-full" size="lg">
                <UserPlus className="h-5 w-5 mr-2" />
                Crear Cuenta
              </Button>
            </Link>

            {/* Dashboard Link (for testing) */}
            <Link href="/dashboard" className="block">
              <Button variant="secondary" className="w-full" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Ver Dashboard (Prueba)
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 text-center text-sm text-muted-foreground">
          <div className="space-y-2">
            <h3 className="font-medium text-foreground">Características</h3>
            <ul className="space-y-1">
              <li>• Gestión de células de trabajo</li>
              <li>• Análisis de rendimiento en tiempo real</li>
              <li>• Métricas y reportes detallados</li>
              <li>• Control de sprints y alertas</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 QTRACK. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
