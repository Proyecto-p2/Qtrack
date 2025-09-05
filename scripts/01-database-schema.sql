-- Crear base de datos
CREATE DATABASE IF NOT EXISTS cell_performance_db;
USE cell_performance_db;

-- Tabla de usuarios
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'agile_coach', 'member', 'viewer') NOT NULL,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de tribus
CREATE TABLE tribes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabla de líneas de conocimiento
CREATE TABLE knowledge_lines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight_factor DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de células
CREATE TABLE cells (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    tribe_id INT,
    agile_coach_id INT,
    product_owner_id INT,
    points_per_sprint INT DEFAULT 0,
    sprints_per_quarter INT DEFAULT 6,
    capacity_hours INT DEFAULT 160,
    cost_per_hour DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tribe_id) REFERENCES tribes(id),
    FOREIGN KEY (agile_coach_id) REFERENCES users(id),
    FOREIGN KEY (product_owner_id) REFERENCES users(id)
);

-- Tabla de miembros de células
CREATE TABLE cell_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cell_id INT,
    user_id INT,
    knowledge_line_id INT,
    seniority_level ENUM('junior', 'semi_senior', 'senior', 'expert') DEFAULT 'junior',
    capacity_percentage DECIMAL(5,2) DEFAULT 100.00,
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    FOREIGN KEY (cell_id) REFERENCES cells(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (knowledge_line_id) REFERENCES knowledge_lines(id),
    UNIQUE KEY unique_active_member (cell_id, user_id, left_at)
);

-- Tabla de sprints
CREATE TABLE sprints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cell_id INT,
    name VARCHAR(255) NOT NULL,
    quarter VARCHAR(10) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    planned_points INT DEFAULT 0,
    committed_points INT DEFAULT 0,
    delivered_points INT DEFAULT 0,
    status ENUM('planning', 'active', 'completed', 'cancelled') DEFAULT 'planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cell_id) REFERENCES cells(id)
);

-- Tabla de tareas/objetivos
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sprint_id INT,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    story_points INT DEFAULT 0,
    task_type ENUM('planned', 'unplanned', 'bug', 'technical_debt') DEFAULT 'planned',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('todo', 'in_progress', 'review', 'done', 'blocked') DEFAULT 'todo',
    assigned_to INT,
    knowledge_line_id INT,
    impact_weight DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (sprint_id) REFERENCES sprints(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (knowledge_line_id) REFERENCES knowledge_lines(id)
);

-- Tabla de registro diario de actividades
CREATE TABLE daily_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    task_id INT,
    date DATE NOT NULL,
    hours_worked DECIMAL(4,2) DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    UNIQUE KEY unique_daily_log (user_id, task_id, date)
);

-- Tabla de métricas de rendimiento
CREATE TABLE performance_metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cell_id INT,
    user_id INT,
    sprint_id INT,
    metric_type ENUM('velocity', 'quality', 'efficiency', 'collaboration') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    target_value DECIMAL(10,2),
    calculation_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cell_id) REFERENCES cells(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (sprint_id) REFERENCES sprints(id)
);

-- Tabla de alertas
CREATE TABLE alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cell_id INT,
    user_id INT,
    alert_type ENUM('overload', 'underperformance', 'cost_overrun', 'deadline_risk') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (cell_id) REFERENCES cells(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de archivos cargados
CREATE TABLE file_uploads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    file_type ENUM('planning', 'results', 'capacity') NOT NULL,
    file_size INT NOT NULL,
    uploaded_by INT,
    cell_id INT,
    sprint_id INT,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    processed_records INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    FOREIGN KEY (cell_id) REFERENCES cells(id),
    FOREIGN KEY (sprint_id) REFERENCES sprints(id)
);

-- Insertar datos iniciales
INSERT INTO knowledge_lines (name, description, weight_factor) VALUES
('Frontend Development', 'Desarrollo de interfaces de usuario', 1.0),
('Backend Development', 'Desarrollo de servicios y APIs', 1.2),
('DevOps', 'Infraestructura y despliegue', 1.3),
('QA Testing', 'Aseguramiento de calidad', 1.0),
('UX/UI Design', 'Diseño de experiencia de usuario', 1.1),
('Data Analytics', 'Análisis de datos y métricas', 1.2),
('Product Management', 'Gestión de producto', 1.1);

-- Usuario administrador inicial
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@company.com', '$2b$10$example_hash', 'Administrador Sistema', 'admin');

