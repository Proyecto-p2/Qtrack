"use client"

import {
  BarChart3,
  Building2,
  Calendar,
  FileSpreadsheet,
  Home,
  Settings,
  TrendingUp,
  Users,
  AlertTriangle,
  Upload,
  Target,
  User,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

import { useSession } from "next-auth/react"

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Células", url: "/dashboard/cells", icon: Building2 },
  { title: "Tribus", url: "/dashboard/tribes", icon: Users }, 
  { title: "Métricas", url: "/dashboard/metrics", icon: BarChart3 },
  { title: "Sprints", url: "/dashboard/sprints", icon: Calendar },
  { title: "Mi Rendimiento", url: "/dashboard/performance", icon: TrendingUp },
  { title: "Registro Diario", url: "/dashboard/daily-log", icon: Target },
  { title: "Alertas", url: "/dashboard/alerts", icon: AlertTriangle },
  { title: "Carga de Datos", url: "/dashboard/upload", icon: Upload },
  { title: "Reportes", url: "/dashboard/reports", icon: FileSpreadsheet },
  { title: "Usuarios", url: "/dashboard/users", icon: Users },
  { title: "Mi Perfil", url: "/dashboard/profile", icon: User },
  { title: "Configuración", url: "/dashboard/settings", icon: Settings },


]

export function AppSidebar() {
  const { data: session, status } = useSession()

  const getRoleLabel = (role: string) => {
    const roles = {
      admin: "Administrador",
      usuario: "Usuario", 
      editor: "Editor",
      agile_coach: "Agile Coach"
    }
    return roles[role as keyof typeof roles] || "Usuario"
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Obtener datos del usuario de la sesión
  const userRole = (session?.user as any)?.role || "usuario"
  const userName = session?.user?.name || "Usuario"
  const userEmail = session?.user?.email || ""

  // Filtrar items del menú basado en el rol del usuario
  const filteredMenuItems = menuItems.filter(item => {
    // Solo mostrar "Usuarios" a los administradores
    if (item.title === "Usuarios") {
      return userRole === "admin"
    }
    return true
  })

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">QTRACK</h2>
            <p className="text-xs text-muted-foreground">
              {status === "loading" ? "Cargando..." : getRoleLabel(userRole)}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {getInitials(userName)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {userEmail || "Cargando..."}
              </p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
