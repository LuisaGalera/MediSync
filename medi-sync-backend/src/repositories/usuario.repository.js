const pool = require('../config/database');

async function buscarPorEmail(email) {
  const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows[0] || null;
}

async function buscarPorCpf(cpf) {
  const result = await pool.query('SELECT * FROM usuarios WHERE cpf = $1', [cpf]);
  return result.rows[0] || null;
}

async function criar(dados) {
  const { cpf, nome, email, senha_hash, telefone, perfil } = dados;
  const result = await pool.query(
    `INSERT INTO usuarios (cpf, nome, email, senha_hash, telefone, perfil)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, cpf, nome, email, perfil`,
    [cpf, nome, email, senha_hash, telefone || null, perfil || 'paciente']
  );
  return result.rows[0];
}

module.exports = { buscarPorEmail, buscarPorCpf, criar };
