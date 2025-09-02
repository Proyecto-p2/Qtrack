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
