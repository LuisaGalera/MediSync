-- ============================================================
-- Medi Sync - Script de criação do banco de dados PostgreSQL
-- ============================================================

CREATE DATABASE medisync;

\c medisync;

-- Tabela de usuários (todos os perfis)
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  nome VARCHAR(200) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  telefone VARCHAR(20),
  perfil VARCHAR(20) NOT NULL DEFAULT 'paciente' CHECK (perfil IN ('paciente', 'profissional', 'admin')),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de pacientes
CREATE TABLE paciente (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  data_nascimento DATE,
  convenio VARCHAR(100),
  preferencia_notificacao VARCHAR(20) DEFAULT 'email' CHECK (preferencia_notificacao IN ('email', 'sms', 'push'))
);

-- Tabela de profissionais de saúde
CREATE TABLE profissional_saude (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  especialidade VARCHAR(100) NOT NULL,
  crm VARCHAR(30),
  capacidade_mensal INTEGER DEFAULT 80,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de consultas
CREATE TABLE consulta (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER NOT NULL REFERENCES paciente(id),
  profissional_id INTEGER NOT NULL REFERENCES profissional_saude(id),
  data_hora TIMESTAMP NOT NULL,
  especialidade VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) DEFAULT 'presencial' CHECK (tipo IN ('presencial', 'telemedicina')),
  urgente BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada', 'reagendada')),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de histórico médico
CREATE TABLE historico_medico_registro (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER NOT NULL REFERENCES paciente(id),
  consulta_id INTEGER REFERENCES consulta(id),
  descricao TEXT,
  diagnostico TEXT,
  data_registro TIMESTAMP DEFAULT NOW()
);

-- Tabela de avaliações
CREATE TABLE avaliacao (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER NOT NULL REFERENCES paciente(id),
  profissional_id INTEGER NOT NULL REFERENCES profissional_saude(id),
  consulta_id INTEGER NOT NULL REFERENCES consulta(id),
  nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE notificacao (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  mensagem TEXT NOT NULL,
  referencia_id INTEGER,
  lida BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_consulta_paciente ON consulta(paciente_id);
CREATE INDEX idx_consulta_profissional ON consulta(profissional_id);
CREATE INDEX idx_consulta_data_hora ON consulta(data_hora);
CREATE INDEX idx_consulta_status ON consulta(status);
