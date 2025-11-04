"use client";

import {
  BarChart3,
  Building2,
  Calendar,
  FileSpreadsheet,
  Home,
  Settings,
  TrendingUp,
  Users,
  Upload,
  Target,
  User,
  CalendarDays,
  CheckSquare,
  Activity,
} from "lucide-react";

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
} from "@/components/ui/sidebar";

import { useSession, SessionProvider } from "next-auth/react";
import React from "react";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  {
    title: "Mi Dashboard",
    url: "/dashboard/personal",
    icon: Activity,
    roles: ["usuario", "agile_coach", "admin"],
  },
  {
    title: "Gestión de Tareas",
    url: "/dashboard/task-management",
    icon: CheckSquare,
    roles: ["agile_coach", "admin"],
  },
  { title: "Líneas de Conocimiento", url: "/dashboard/knowledge-lines", icon: Target },
  { title: "Células", url: "/dashboard/cells", icon: Building2 },
  { title: "Tribus", url: "/dashboard/tribes", icon: Users },
  { title: "Sprints", url: "/dashboard/sprints", icon: Calendar },
  { title: "Configuración de Q", url: "/dashboard/q-configuration", icon: Settings },
  { title: "Carga de archivo", url: "/dashboard/upload", icon: Upload },
  { title: "Planificación", url: "/dashboard/sprint-planning", icon: CalendarDays },
  { title: "Usuarios", url: "/dashboard/users", icon: Users, roles: ["admin"] },
  { title: "Mi Perfil", url: "/dashboard/profile", icon: User },
  { title: "Configuración", url: "/dashboard/settings", icon: Settings },
];

// Este componente envuelve tu Sidebar en un SessionProvider
export function AppSidebarWrapper() {
  return (
    <SessionProvider>
      <AppSidebar />
    </SessionProvider>
  );
}

export function AppSidebar() {
  const { data: session, status } = useSession();

  const getRoleLabel = (role: string): string => {
    const roles: Record<string, string> = {
      admin: "Administrador",
      usuario: "Usuario",
      editor: "Editor",
      agile_coach: "Agile Coach",
    };
    return roles[role] || "Usuario";
  };

  const getInitials = (name: string): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const userRole = (session?.user as { role?: string })?.role ?? "usuario";
  const userName = session?.user?.name ?? "Usuario";
  const userEmail = session?.user?.email ?? "";

  const filteredMenuItems = menuItems.filter((item) => {
    return !item.roles || item.roles.includes(userRole);
  });

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
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
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
              <span className="text-sm font-medium text-white">{getInitials(userName)}</span>
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
  );
}
