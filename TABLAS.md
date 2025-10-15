-- =====================================================
-- SCRIPT CORREGIDO Y LISTO PARA EJECUTAR
-- Base de datos: qtrack
-- =====================================================

DROP DATABASE IF EXISTS qtrack;
CREATE DATABASE qtrack CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE qtrack;

-- =============================
-- Tabla: cells
-- =============================
DROP TABLE IF EXISTS cells;
CREATE TABLE cells (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tribeName VARCHAR(255) NOT NULL,
  agileCoachName VARCHAR(255) NOT NULL,
  costPerSprint DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('active','inactive','planning') DEFAULT 'planning',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO cells VALUES
(5,'Célua front ','Tribu nómada','Sara Pineda ',1000000.00,'planning','2025-10-09 04:17:40'),
(6,'Célula Frontend','Tribu nómada','John',1000000.00,'planning','2025-10-09 04:56:36');

-- =============================
-- Tabla: knowledge_lines
-- =============================
DROP TABLE IF EXISTS knowledge_lines;
CREATE TABLE knowledge_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(255),
  objetivos TEXT,
  creada_por VARCHAR(255) NOT NULL,
  creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO knowledge_lines VALUES
(1,'Linea de UX','Linea dedicada a mejorar la experiencia UX en el banco','UX','mejorar la experiencia UX en el banco','desconocido','2025-10-15 01:13:02');

-- =============================
-- Tabla: tribes
-- =============================
DROP TABLE IF EXISTS tribes;
CREATE TABLE tribes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leadName VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO tribes VALUES
(2,'Tribu nómada','Cuenta con 5 células asociadas','Ana Bueno','2025-09-05 13:01:44'),
(3,'Tribu digital','Tribu de desarrollo con 6 células asociadas','Juan Pérez','2025-09-06 03:29:18'),
(4,'Tribu asociados','Tribu dedicada al UX','Alex Valencia','2025-09-09 02:12:52');

-- =============================
-- Tabla: q_configurations
-- =============================
DROP TABLE IF EXISTS q_configurations;
CREATE TABLE q_configurations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quarter VARCHAR(10) NOT NULL,
  year INT NOT NULL,
  sprints_per_q INT NOT NULL,
  sprint_duration INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO q_configurations VALUES
(1,'Q1',2025,4,2,'2025-09-09','2025-09-25',0,'2025-09-09 03:19:41','2025-10-14 23:57:57'),
(2,'Q2',2025,4,2,'2025-02-02','2025-04-02',1,'2025-10-14 23:57:57','2025-10-14 23:57:57');

-- =============================
-- Tabla: sprints
-- =============================
DROP TABLE IF EXISTS sprints;
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
  status ENUM('planning','active','completed','cancelled') DEFAULT 'planning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  tasks JSON DEFAULT NULL,
  FOREIGN KEY (cell_id) REFERENCES cells(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO sprints VALUES
(1,5,'Sprint Q1-1','2025-Q1','2025-09-09','2025-09-22',6,0,0,'planning','2025-10-14 03:20:26','2025-10-14 23:37:54','[{\"id\":0,\"name\":\"Task1\",\"status\":\"done\"}, {\"id\":0,\"name\":\"Hacer el front\",\"status\":\"done\"}]'),
(2,5,'Sprint Q1-2','2025-Q1','2025-09-23','2025-10-06',4,0,0,'planning','2025-10-14 03:20:26','2025-10-14 22:27:57','[{\"id\":0,\"name\":\"Task1\",\"status\":\"done\"}]'),
(3,5,'Sprint Q1-3','2025-Q1','2025-10-07','2025-10-20',1,0,0,'planning','2025-10-14 03:20:26','2025-10-14 23:42:35','[{\"id\":0,\"name\":\"Task 3\",\"status\":\"done\"}]'),
(4,5,'Sprint Q1-4','2025-Q1','2025-10-21','2025-11-03',2,0,0,'planning','2025-10-14 03:20:26','2025-10-14 03:20:48',NULL);

-- =============================
-- Tabla: members
-- =============================
DROP TABLE IF EXISTS members;
CREATE TABLE members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cellId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  knowledgeLine VARCHAR(255) DEFAULT '',
  role VARCHAR(255) DEFAULT '',
  workload INT DEFAULT 0,
  currentLoad INT DEFAULT 0,
  FOREIGN KEY (cellId) REFERENCES cells(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO members VALUES
(1,5,'John Alejandro','UX','BackEnd',0,0),
(2,6,'Diana','Linea develop','Backend Developer',0,0);

-- =============================
-- Tabla: tasks
-- =============================
DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sprint_id INT,
  nombre VARCHAR(255) NOT NULL,
  completada TINYINT(1) DEFAULT 0,
  FOREIGN KEY (sprint_id) REFERENCES sprints(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================
-- Tabla: usuarios
-- =============================
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
  id CHAR(36) PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  correo VARCHAR(100) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  rol ENUM('admin','usuario','editor','agile_coach') DEFAULT 'usuario',
  activo TINYINT(1) DEFAULT 1,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO usuarios VALUES
('550e8400-e29b-41d4-a716-446655440000','sara','sara@email.com','$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36G1b/4YF2k2hZxJv3/ZDee','Sara','usuario',1,'2025-09-04 14:15:47'),
('7d832b09-55ab-4566-be4a-1c11987b1121','juanita','juanita@gmail.com','$2b$10$tCAac05yAslhKPFL03SKBOuyjIsBzJYr08/diMv3KDktGh9lO5JVG','Juana Acevedo','usuario',1,'2025-09-10 03:16:15'),
('aadb1bf3-43ca-4bd9-80c5-84591b4d02c2','admin','admin@example.com','$2b$10$mnRNo8cY4tcz1w/IrU.3w.2y1PIR3pGTOk3G13O5ZNHIBxo324Aum','admin','agile_coach',1,'2025-09-04 14:50:25'),
('d6e5f94f-7d03-4e48-ba54-5045c62e08ba','saraa','sara@ejemplo.com','$2b$10$T/A7eufFgvehlJIHgt9gJOMbJaWSPleFvMfGCD0Z6hd2JLJl2DrH.','Sara','usuario',1,'2025-09-04 14:17:36');

-- =============================
-- Tabla: notifications
-- =============================
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId CHAR(36) NOT NULL,
  memberId INT NOT NULL,
  message TEXT NOT NULL,
  type ENUM('load_complete', 'load_exceeded') NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
