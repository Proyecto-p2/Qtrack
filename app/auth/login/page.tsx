"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn, User } from "lucide-react"
import { useHydration } from "@/hooks/use-hydration"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    login: "",
    contraseña: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const hydrated = useHydration()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        login: formData.login,
        contraseña: formData.contraseña,
        redirect: false,
        callbackUrl: "/dashboard"
      })

      if (result?.error) {
        setError("Credenciales incorrectas. Verifica tu usuario/correo y contraseña.")
      } else if (result?.ok) {
        window.location.href = "/dashboard"
      }
    } catch (error) {
      setError("Error de conexión. Intenta nuevamente.")
      console.error("Error en login:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <LogIn className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
          <p className="text-muted-foreground">
            Accede a tu cuenta de QTRACK
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Bienvenido de vuelta</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Field */}
              <div className="space-y-2">
                <Label htmlFor="login">Usuario o Correo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login"
                    name="login"
                    type="text"
                    placeholder="usuario o correo@ejemplo.com"
                    value={formData.login}
                    onChange={handleChange}
                    className="pl-10"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="contraseña">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="contraseña"
                    name="contraseña"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.contraseña}
                    onChange={handleChange}
                    className="pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Iniciando sesión...
                  </div>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">¿No tienes una cuenta? </span>
              <Link
                href="/auth/register"
                className="font-medium text-primary hover:underline"
              >
                Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Cell Performance Management System</p>
          <p>© 2025 QTRACK. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
