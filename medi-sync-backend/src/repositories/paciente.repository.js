const pool = require('../config/database');

async function buscarPorUsuarioId(usuario_id) {
  const result = await pool.query('SELECT * FROM paciente WHERE usuario_id = $1', [usuario_id]);
  return result.rows[0] || null;
}

async function criar(dados) {
  const { usuario_id, data_nascimento, convenio, preferencia_notificacao } = dados;
  const result = await pool.query(
    `INSERT INTO paciente (usuario_id, data_nascimento, convenio, preferencia_notificacao)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [usuario_id, data_nascimento || null, convenio || null, preferencia_notificacao || 'email']
  );
  return result.rows[0];
}

async function atualizar(usuario_id, dados) {
  const { data_nascimento, convenio, preferencia_notificacao } = dados;
  const result = await pool.query(
    `UPDATE paciente SET data_nascimento=$1, convenio=$2, preferencia_notificacao=$3
     WHERE usuario_id=$4 RETURNING *`,
    [data_nascimento, convenio, preferencia_notificacao, usuario_id]
  );
  return result.rows[0];
}

module.exports = { buscarPorUsuarioId, criar, atualizar };
