# Cell Performance Management System - Prototipo

Sistema integral de gestión y análisis de rendimiento de células de trabajo desarrollado con Next.js y React.

## 🎯 Objetivo

Prototipo visual para demostrar la funcionalidad de un sistema que resuelve la desalineación entre herramientas de seguimiento y la realidad operativa de las células y sus talentos, brindando trazabilidad sobre contribución individual y colectiva a los OKR.

## 🏗️ Arquitectura del Prototipo

### Stack Tecnológico
- **Frontend**: React 18 + Next.js 14 (App Router)
- **UI Components**: shadcn/ui + Tailwind CSS
- **Datos**: Mock data para demostración
- **Iconos**: Lucide React

### Estructura de Roles (Simulados)

#### 🔑 Administrador
- Gestión completa de usuarios y células
- Configuración de líneas de conocimiento
- Acceso a todas las métricas y reportes

#### 👨‍💼 Agile Coach
- Registro y gestión de células asignadas
- Configuración de sprints y capacidades
- Carga masiva de datos de planeación
- Monitoreo de métricas de sus células

#### 👩‍💻 Miembro de Célula
- Registro diario de actividades
- Consulta de métricas personales
- Actualización de progreso en tareas

#### 👁️ Consulta (Viewer)
- Acceso de solo lectura a métricas
- Visualización de reportes y dashboards

## 🚀 Funcionalidades del Prototipo

### 📊 Dashboard Ejecutivo
- Métricas en tiempo real de todas las células
- Indicadores de velocidad, eficiencia y calidad
- Alertas de rendimiento y costos
- Comparativas entre células y períodos

### 📈 Análisis de Rendimiento
- **Velocidad por Sprint**: Puntos planificados vs entregados
- **Eficiencia Operativa**: Ratio de trabajo planificado vs no planificado
- **Calidad de Entrega**: Métricas de defectos y retrabajos
- **Costo por Punto**: Análisis de eficiencia económica

### 🎯 Gestión de Capacidad
- Dimensionamiento real por línea de conocimiento
- Identificación de cuellos de botella
- Proyecciones de capacidad futura
- Optimización de asignaciones

### 🚨 Sistema de Alertas
- **Sobrecarga**: Detección automática de exceso de trabajo
- **Subejecución**: Identificación de bajo rendimiento
- **Costos Excesivos**: Alertas de presupuesto
- **Riesgos de Entrega**: Predicciones basadas en tendencias

### 📁 Carga Masiva de Datos
- Simulación de importación desde Excel/CSV
- Plantillas estandarizadas
- Validación automática de datos
- Procesamiento en lotes

### 👤 Rendimiento Personal
- Métricas individuales de productividad
- Contribución a objetivos de célula
- Registro diario de actividades
- Objetivos y progreso personal

### 📋 Gestión de Sprints
- Creación y seguimiento de sprints
- Métricas de velocidad y progreso
- Estados y transiciones
- Comparativas históricas

### 📊 Centro de Reportes
- Generador de reportes personalizados
- Plantillas predefinidas para diferentes necesidades
- Exportación en múltiples formatos
- Historial de reportes generados

### 👥 Gestión de Usuarios
- Lista completa con filtros avanzados
- Creación y edición de usuarios
- Gestión de roles y permisos
- Estados de actividad y último acceso

### ⚙️ Configuración del Sistema
- Configuraciones generales y de sprint
- Notificaciones personalizables
- Seguridad y políticas de acceso
- Integraciones con sistemas externos
- Gestión de datos y respaldos

## 🗄️ Modelo de Datos (Simulado)

### Entidades Principales

\`\`\`typescript
// Usuarios y Roles
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'agile_coach' | 'member' | 'viewer'
  cellName?: string
  knowledgeLine?: string
  seniority?: 'junior' | 'semi_senior' | 'senior' | 'expert'
  isActive: boolean
}

// Células de Trabajo
interface Cell {
  id: number
  name: string
  tribeName: string
  agileCoachName: string
  memberCount: number
  avgVelocity: number
  currentSprintPoints: number
  costPerSprint: number
  status: 'active' | 'inactive' | 'planning'
}

// Sprints
interface Sprint {
  id: number
  name: string
  cellName: string
  quarter: string
  startDate: string
  endDate: string
  plannedPoints: number
  committedPoints: number
  deliveredPoints: number
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  progress: number
}

// Métricas
interface MetricData {
  cellName: string
  velocity: number
  targetVelocity: number
  efficiency: number
  qualityScore: number
  memberCount: number
  sprintCost: number
}

// Alertas
interface AlertData {
  id: number
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: 'overload' | 'underperformance' | 'cost_overrun' | 'deadline_risk'
  cellName: string
  createdAt: string
  isRead: boolean
  isResolved: boolean
}
\`\`\`

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm, yarn o bun

### Instalación Local

1. **Clonar el repositorio**
\`\`\`bash
git clone <repository-url>
cd cell-performance-management
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
# o
yarn install
# o
bun install
\`\`\`

3. **Ejecutar en desarrollo**
\`\`\`bash
npm run dev
# o
yarn dev
# o
bun dev
\`\`\`

4. **Construir para producción**
\`\`\`bash
npm run build
# o
yarn build
# o
bun run build
\`\`\`

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

### Componentes Adaptativos
- Sidebar colapsible en móvil usando shadcn/ui Sidebar[^1]
- Tablas con scroll horizontal
- Cards responsivas en grids
- Navegación optimizada para touch

## 🎨 Diseño y UX

### Principios de Diseño
- **Claridad**: Información presentada de forma clara y organizada
- **Consistencia**: Uso uniforme de componentes y patrones
- **Eficiencia**: Acceso rápido a información crítica
- **Accesibilidad**: Cumplimiento de estándares WCAG

### Paleta de Colores
- **Primario**: Azul para acciones principales
- **Secundario**: Gris para información complementaria
- **Éxito**: Verde para estados positivos
- **Advertencia**: Amarillo para alertas medias
- **Error**: Rojo para alertas críticas

## 📊 Métricas y KPIs Simulados

### Métricas de Célula
- **Velocidad**: 25-42 puntos por sprint
- **Predictibilidad**: Variación entre comprometido y entregado
- **Eficiencia**: 70-95% de trabajo planificado
- **Calidad**: Score de 85-96% basado en criterios simulados
- **Costo por Sprint**: $12,000 - $22,000 por célula

### Métricas Individuales
- **Productividad**: 3-13 puntos por período
- **Contribución**: 15-40% del total de la célula
- **Especialización**: Distribución por línea de conocimiento
- **Carga de Trabajo**: 65-115% de capacidad disponible

### Alertas Automáticas (Simuladas)
- **Sobrecarga**: >110% de capacidad planificada
- **Subejecución**: <80% de velocidad objetivo
- **Costo Excesivo**: >15% del presupuesto asignado
- **Riesgo de Entrega**: Basado en progreso actual

## 🔮 Funcionalidades Futuras

### Módulo de IA Predictiva
- Predicción de velocidad futura
- Identificación de patrones y anomalías
- Optimización de recursos
- Proyección de costos

### Integraciones Planificadas
- **Jira**: Sincronización de tareas y sprints
- **Slack**: Notificaciones y alertas
- **Google Workspace**: Calendario y documentos
- **Microsoft Teams**: Colaboración y comunicación

## 🧪 Datos de Prueba

El prototipo incluye datos realistas para demostrar todas las funcionalidades:

- **12 células** distribuidas en 3 tribus
- **48 miembros** con diferentes roles y seniorities
- **25+ sprints** en diferentes estados
- **100+ tareas** con progreso variado
- **50+ alertas** de diferentes tipos y severidades
- **Métricas históricas** de los últimos 6 meses

## 📈 Casos de Uso Demostrados

1. **Agile Coach** monitoreando el rendimiento de sus células
2. **Miembro** registrando progreso diario y consultando métricas personales
3. **Administrador** configurando el sistema y gestionando usuarios
4. **Viewer** consultando reportes y dashboards ejecutivos

## 🔒 Consideraciones de Seguridad (Futuras)

- Autenticación JWT con roles granulares
- Cifrado de datos sensibles
- Logs de auditoría
- Políticas de acceso por rol
- Validación de permisos en cada operación

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para consultas sobre el prototipo:
- Email: support@company.com
- Documentación: [Wiki del proyecto]

---

**Versión**: 1.0.0 (Prototipo)  
**Última actualización**: Enero 2024

## 🚀 Próximos Pasos

1. **Validación con usuarios**: Recopilar feedback del prototipo
2. **Arquitectura backend**: Diseñar APIs y base de datos real
3. **Autenticación**: Implementar sistema de login seguro
4. **Integraciones**: Conectar con herramientas existentes
5. **IA y Analytics**: Desarrollar módulo predictivo
6. **Testing**: Implementar suite completa de pruebas
7. **Deployment**: Configurar pipeline de CI/CD