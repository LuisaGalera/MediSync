const pool = require('../config/database');

async function criar(dados) {
  const { paciente_id, profissional_id, data_hora, especialidade, tipo, urgente } = dados;
  const result = await pool.query(
    `INSERT INTO consulta (paciente_id, profissional_id, data_hora, especialidade, tipo, urgente, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'agendada') RETURNING *`,
    [paciente_id, profissional_id, data_hora, especialidade, tipo || 'presencial', urgente || false]
  );
  return result.rows[0];
}

async function verificarConflito(profissional_id, data_hora) {
  // Verifica sobreposição de 30 minutos (RN-002)
  const result = await pool.query(
    `SELECT id FROM consulta
     WHERE profissional_id = $1
       AND status NOT IN ('cancelada')
       AND data_hora BETWEEN ($2::timestamp - interval '30 minutes') AND ($2::timestamp + interval '30 minutes')`,
    [profissional_id, data_hora]
  );
  return result.rows.length > 0;
}

async function contarPorEspecialidadeNoMes(paciente_id, especialidade) {
  // Valida limite de 1 consulta por especialidade por mês (RN-004)
  const result = await pool.query(
    `SELECT COUNT(*) FROM consulta
     WHERE paciente_id = $1
       AND especialidade = $2
       AND status NOT IN ('cancelada')
       AND date_trunc('month', data_hora) = date_trunc('month', NOW())`,
    [paciente_id, especialidade]
  );
  return parseInt(result.rows[0].count);
}

async function buscarPorId(id) {
  const result = await pool.query('SELECT * FROM consulta WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function cancelar(id) {
  const result = await pool.query(
    `UPDATE consulta SET status = 'cancelada', atualizado_em = NOW()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

async function reagendar(id, nova_data_hora) {
  const result = await pool.query(
    `UPDATE consulta SET data_hora = $1, status = 'agendada', atualizado_em = NOW()
     WHERE id = $2 RETURNING *`,
    [nova_data_hora, id]
  );
  return result.rows[0];
}

async function listarPorPaciente(paciente_id) {
  const result = await pool.query(
    `SELECT c.*, u.nome AS profissional_nome
     FROM consulta c
     JOIN profissional_saude ps ON ps.id = c.profissional_id
     JOIN usuarios u ON u.id = ps.usuario_id
     WHERE c.paciente_id = $1
     ORDER BY c.data_hora DESC`,
    [paciente_id]
  );
  return result.rows;
}

async function contarVagasDisponiveisMes(profissional_id) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM consulta
     WHERE profissional_id = $1
       AND status = 'agendada'
       AND date_trunc('month', data_hora) = date_trunc('month', NOW())`,
    [profissional_id]
  );
  return parseInt(result.rows[0].count);
}

async function agregarRelatorio(mes, ano) {
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'realizada') AS realizadas,
       COUNT(*) FILTER (WHERE status = 'cancelada') AS canceladas,
       COUNT(*) FILTER (WHERE status = 'reagendada') AS reagendadas,
       COUNT(*) AS total
     FROM consulta
     WHERE EXTRACT(MONTH FROM data_hora) = $1
       AND EXTRACT(YEAR FROM data_hora) = $2`,
    [mes, ano]
  );
  return result.rows[0];
}

module.exports = {
  criar, verificarConflito, contarPorEspecialidadeNoMes,
  buscarPorId, cancelar, reagendar, listarPorPaciente,
  contarVagasDisponiveisMes, agregarRelatorio
};
