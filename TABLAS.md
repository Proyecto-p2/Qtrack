CREATE TABLE usuarios (
    id CHAR(36) NOT NULL PRIMARY KEY, -- UUID en formato texto
    usuario VARCHAR(50) NOT NULL UNIQUE, -- nombre de usuario único
    correo VARCHAR(100) NOT NULL UNIQUE, -- correo único
    contraseña VARCHAR(255) NOT NULL, -- hash (bcrypt ~60 caracteres, damos margen)
    nombre VARCHAR(150) NOT NULL,
    rol ENUM('admin', 'usuario', 'editor', 'agile_coach') NOT NULL DEFAULT 'usuario',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE cells (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tribeName VARCHAR(255) NOT NULL,
  agileCoachName VARCHAR(255) NOT NULL,
  productOwnerName VARCHAR(255) NOT NULL,
  memberCount INT DEFAULT 0,
  avgVelocity INT DEFAULT 0,
  currentSprintPoints INT DEFAULT 0,
  costPerSprint DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('active','inactive','planning') DEFAULT 'planning',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE tribes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  leadName VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cellId INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    knowledgeLine VARCHAR(255) DEFAULT '',
    role VARCHAR(255) DEFAULT '',
    FOREIGN KEY (cellId) REFERENCES cells(id) ON DELETE CASCADE
);

CREATE TABLE q_configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quarter VARCHAR(10) NOT NULL, -- Q1, Q2, Q3, Q4
    year INT NOT NULL,
    sprints_per_q INT NOT NULL,
    sprint_duration INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS knowledge_lines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(255),
    objetivos TEXT,
    creada_por VARCHAR(255) NOT NULL,
    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP);