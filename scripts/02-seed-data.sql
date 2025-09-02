-- Insertar datos de prueba adicionales
USE cell_performance_db;

-- Insertar tribus
INSERT INTO tribes (name, description, created_by) VALUES
('Tribu Digital', 'Desarrollo de productos digitales', 1),
('Tribu Infraestructura', 'Plataforma y DevOps', 1),
('Tribu Data', 'Analytics y Business Intelligence', 1);

-- Insertar usuarios adicionales
INSERT INTO users (email, password_hash, name, role) VALUES
('coach1@company.com', '$2b$10$example_hash', 'Ana García', 'agile_coach'),
('coach2@company.com', '$2b$10$example_hash', 'Luis Martín', 'agile_coach'),
('po1@company.com', '$2b$10$example_hash', 'Carlos López', 'member'),
('po2@company.com', '$2b$10$example_hash', 'María Rodríguez', 'member'),
('dev1@company.com', '$2b$10$example_hash', 'Pedro Sánchez', 'member'),
('dev2@company.com', '$2b$10$example_hash', 'Laura Fernández', 'member'),
('dev3@company.com', '$2b$10$example_hash', 'José Martínez', 'member'),
('dev4@company.com', '$2b$10$example_hash', 'Carmen Ruiz', 'member'),
('viewer1@company.com', '$2b$10$example_hash', 'Roberto Silva', 'viewer');

-- Insertar células
INSERT INTO cells (name, tribe_id, agile_coach_id, product_owner_id, points_per_sprint, sprints_per_quarter, capacity_hours, cost_per_hour) VALUES
('Célula Frontend Alpha', 1, 2, 4, 40, 6, 960, 25.00),
('Célula Backend Beta', 1, 3, 5, 35, 6, 800, 30.00),
('Célula DevOps Gamma', 2, 2, 4, 30, 6, 640, 35.00);

-- Insertar miembros de células
INSERT INTO cell_members (cell_id, user_id, knowledge_line_id, seniority_level, capacity_percentage, hourly_rate) VALUES
-- Célula Frontend Alpha
(1, 4, 1, 'senior', 100.00, 25.00),
(1, 6, 1, 'semi_senior', 100.00, 20.00),
(1, 7, 1, 'junior', 100.00, 15.00),
(1, 8, 5, 'senior', 100.00, 28.00),
-- Célula Backend Beta  
(2, 5, 2, 'expert', 100.00, 35.00),
(2, 6, 2, 'senior', 100.00, 30.00),
(2, 7, 2, 'semi_senior', 100.00, 25.00),
(2, 8, 4, 'senior', 100.00, 28.00),
-- Célula DevOps Gamma
(3, 4, 3, 'expert', 100.00, 40.00),
(3, 5, 3, 'senior', 100.00, 35.00),
(3, 6, 2, 'senior', 50.00, 30.00),
(3, 7, 4, 'semi_senior', 100.00, 25.00);

-- Insertar sprints
INSERT INTO sprints (cell_id, name, quarter, start_date, end_date, planned_points, committed_points, delivered_points, status) VALUES
(1, 'Sprint 23', '2024-Q1', '2024-01-15', '2024-01-29', 40, 38, 42, 'completed'),
(1, 'Sprint 24', '2024-Q1', '2024-01-30', '2024-02-13', 42, 40, 35, 'completed'),
(1, 'Sprint 25', '2024-Q1', '2024-02-14', '2024-02-28', 38, 38, 0, 'active'),
(2, 'Sprint 23', '2024-Q1', '2024-01-15', '2024-01-29', 35, 32, 35, 'completed'),
(2, 'Sprint 24', '2024-Q1', '2024-01-30', '2024-02-13', 38, 35, 32, 'completed'),
(2, 'Sprint 25', '2024-Q1', '2024-02-14', '2024-02-28', 35, 35, 0, 'active'),
(3, 'Sprint 23', '2024-Q1', '2024-01-15', '2024-01-29', 30, 28, 30, 'completed'),
(3, 'Sprint 24', '2024-Q1', '2024-01-30', '2024-02-13', 32, 30, 28, 'completed'),
(3, 'Sprint 25', '2024-Q1', '2024-02-14', '2024-02-28', 30, 30, 0, 'active');

-- Insertar tareas de ejemplo
INSERT INTO tasks (sprint_id, title, description, story_points, task_type, priority, status, assigned_to, knowledge_line_id, impact_weight) VALUES
(1, 'Implementar login con OAuth', 'Integración con proveedores OAuth', 8, 'planned', 'high', 'done', 4, 1, 1.2),
(1, 'Diseño de dashboard principal', 'Mockups y prototipos', 5, 'planned', 'medium', 'done', 8, 5, 1.0),
(1, 'Fix bug en formulario', 'Corrección de validaciones', 3, 'unplanned', 'high', 'done', 6, 1, 0.8),
(2, 'API de gestión de usuarios', 'CRUD completo de usuarios', 13, 'planned', 'high', 'done', 5, 2, 1.3),
(2, 'Tests unitarios backend', 'Cobertura de testing', 8, 'planned', 'medium', 'done', 7, 2, 1.0),
(3, 'Setup CI/CD pipeline', 'Configuración de despliegue automático', 21, 'planned', 'critical', 'in_progress', 4, 3, 1.5);

-- Insertar métricas de rendimiento
INSERT INTO performance_metrics (cell_id, user_id, sprint_id, metric_type, value, target_value, calculation_date) VALUES
(1, NULL, 1, 'velocity', 42, 40, '2024-01-29'),
(1, NULL, 1, 'efficiency', 87.5, 85.0, '2024-01-29'),
(2, NULL, 4, 'velocity', 35, 35, '2024-01-29'),
(2, NULL, 4, 'efficiency', 78.2, 85.0, '2024-01-29'),
(3, NULL, 7, 'velocity', 30, 30, '2024-01-29'),
(3, NULL, 7, 'efficiency', 82.1, 85.0, '2024-01-29');

-- Insertar alertas de ejemplo
INSERT INTO alerts (cell_id, user_id, alert_type, severity, title, message, is_read, is_resolved) VALUES
(1, NULL, 'overload', 'medium', 'Sobrecarga detectada', 'La célula Frontend Alpha está trabajando al 110% de su capacidad planificada', FALSE, FALSE),
(2, 5, 'underperformance', 'high', 'Rendimiento bajo', 'Velocidad por debajo del objetivo en los últimos 2 sprints', FALSE, FALSE),
(3, NULL, 'cost_overrun', 'critical', 'Exceso de costos', 'Los costos del sprint actual exceden el presupuesto en 15%', FALSE, FALSE);
