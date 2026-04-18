const pool = require('../config/database');

async function buscarTodos() {
  const result = await pool.query(
    `SELECT ps.*, u.nome, u.email FROM profissional_saude ps
     JOIN usuarios u ON u.id = ps.usuario_id
     ORDER BY u.nome`
  );
  return result.rows;
}

async function buscarPorEspecialidade(especialidade) {
  const result = await pool.query(
    `SELECT ps.*, u.nome, u.email FROM profissional_saude ps
     JOIN usuarios u ON u.id = ps.usuario_id
     WHERE ps.especialidade ILIKE $1`,
    [`%${especialidade}%`]
  );
  return result.rows;
}

async function buscarPorId(id) {
  const result = await pool.query(
    `SELECT ps.*, u.nome, u.email FROM profissional_saude ps
     JOIN usuarios u ON u.id = ps.usuario_id
     WHERE ps.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function buscarCapacidadeMensal(profissional_id) {
  const result = await pool.query(
    'SELECT capacidade_mensal FROM profissional_saude WHERE id = $1',
    [profissional_id]
  );
  return result.rows[0]?.capacidade_mensal || 0;
}

module.exports = { buscarTodos, buscarPorEspecialidade, buscarPorId, buscarCapacidadeMensal };
