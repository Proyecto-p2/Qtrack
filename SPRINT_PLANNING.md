# Sprint Planning - Funcionalidad Implementada

## 📋 Historia de Usuario Implementada

**Como administrador o agile coach, quiero poder definir los puntos planeados para cada sprint, para poder realizar una planificación efectiva basada en la configuración de quarters (Q).**

## 🚀 Funcionalidades Desarrolladas

### 1. API de Gestión de Sprints (`/api/sprints`)
- **GET**: Obtener sprints filtrados por quarter y/o célula
- **POST**: Crear o actualizar sprints completos
- **PUT**: Actualizar solo puntos planeados de un sprint específico

### 2. API de Generación Automática (`/api/sprints/generate`)
- Genera sprints automáticamente basado en la configuración Q activa
- Calcula fechas de sprints según duración y cantidad configurada
- Previene duplicación de sprints para el mismo quarter/célula

### 3. Componente de Planificación (`sprint-planning.tsx`)
- Interfaz completa para gestión de puntos planeados
- Filtrado por quarter y célula
- Edición en línea de puntos planeados
- Generación automática de sprints
- Guardado individual o masivo de cambios

### 4. Nueva Página de Dashboard (`/dashboard/sprint-planning`)
- Página dedicada accesible desde el sidebar
- Integrada con el sistema de navegación existente

## 🗄️ Estructura de Base de Datos

### Tabla `sprints`
```sql
CREATE TABLE sprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cell_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    quarter VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    planned_points INT DEFAULT 0,
    committed_points INT DEFAULT 0,
    delivered_points INT DEFAULT 0,
    status ENUM('planning', 'active', 'completed', 'cancelled') DEFAULT 'planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cell_id) REFERENCES cells(id) ON DELETE CASCADE
);
```

## 🔧 Instalación y Configuración

### 1. Verificar Base de Datos
```bash
npm run db:check
```

### 2. Ejecutar Migraciones (si es necesario)
Si la tabla `sprints` no existe, ejecuta el script SQL:
```sql
-- Desde MySQL/phpMyAdmin
source scripts/03-sprints-table.sql;
```

## 📱 Uso de la Funcionalidad

### Para Administradores y Agile Coaches:

1. **Acceder a la Planificación**
   - Navegar a Dashboard → Planificación

2. **Generar Sprints Automáticamente**
   - Seleccionar quarter activo
   - Usar botón "Generar Sprints"
   - Seleccionar células para las que generar sprints
   - Los sprints se crean basados en la configuración Q

3. **Definir Puntos Planeados**
   - Filtrar por quarter/célula deseada
   - Editar puntos planeados directamente en la tabla
   - Guardar cambios individualmente o en lote

4. **Monitorear Estado**
   - Ver estado de cada sprint (planning, active, completed, cancelled)
   - Comparar puntos planeados vs comprometidos vs entregados

## 🔄 Integración con Sistema Q

La funcionalidad está completamente integrada con el sistema de configuración Q existente:

- **Genera sprints automáticamente** basado en:
  - Número de sprints por quarter (`sprints_per_q`)
  - Duración de cada sprint (`sprint_duration`)
  - Fechas de inicio y fin del quarter
  
- **Previene duplicación** verificando sprints existentes por quarter/célula

- **Mantiene consistencia** usando el mismo formato de quarter (`YYYY-QX`)

## 🎯 Beneficios Implementados

1. **Planificación Estructurada**: Sprints generados automáticamente según configuración
2. **Gestión Centralizada**: Una interfaz para todos los sprints del quarter
3. **Flexibilidad**: Posibilidad de ajustar puntos planeados según necesidades
4. **Trazabilidad**: Historial completo de puntos planeados vs ejecutados
5. **Integración**: Funciona seamlessly con el sistema Q existente

## 🔐 Permisos y Seguridad

- Solo **administradores** y **agile coaches** pueden:
  - Generar sprints automáticamente
  - Modificar puntos planeados
  - Crear/actualizar sprints

- Verificación de permisos a nivel de API
- Sesión requerida para todas las operaciones

## 📊 Métricas y Reportes

La funcionalidad permite análisis de:
- **Capacidad de planificación** por célula
- **Consistencia** entre puntos planeados y entregados  
- **Evolución** de la planificación por quarters
- **Performance** de células en cumplimiento de planificación

## 🔮 Próximos Pasos Sugeridos

1. **Dashboard de Métricas**: Visualización de efectividad de planificación
2. **Alertas Automáticas**: Notificaciones cuando hay desviaciones significativas
3. **Templates de Planificación**: Plantillas basadas en historial de células
4. **Integración con Herramientas Externas**: Sincronización con Jira/Azure DevOps
