-- Crear tabla sprints si no existe
CREATE TABLE IF NOT EXISTS sprints (
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

-- Insertar algunos datos de ejemplo para sprints (solo si la tabla está vacía)
INSERT IGNORE INTO sprints (cell_id, name, quarter, start_date, end_date, planned_points, committed_points, delivered_points, status) VALUES
(1, 'Sprint Q1-1', '2025-Q1', '2025-01-01', '2025-01-14', 40, 38, 42, 'completed'),
(1, 'Sprint Q1-2', '2025-Q1', '2025-01-15', '2025-01-28', 42, 40, 35, 'completed'),
(1, 'Sprint Q1-3', '2025-Q1', '2025-01-29', '2025-02-11', 38, 38, 0, 'active'),
(2, 'Sprint Q1-1', '2025-Q1', '2025-01-01', '2025-01-14', 35, 32, 35, 'completed'),
(2, 'Sprint Q1-2', '2025-Q1', '2025-01-15', '2025-01-28', 30, 28, 30, 'completed'),
(2, 'Sprint Q1-3', '2025-Q1', '2025-01-29', '2025-02-11', 33, 33, 0, 'active');
