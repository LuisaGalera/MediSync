const pool = require('../config/database');

// RF-003 / RN-002: recomendações baseadas em histórico do paciente
async function gerarRecomendacoes(paciente_id) {
  // Especialidades mais recorrentes do paciente
  const especialidades = await pool.query(
    `SELECT especialidade, COUNT(*) AS total
     FROM consulta
     WHERE paciente_id = $1 AND status = 'realizada'
     GROUP BY especialidade
     ORDER BY total DESC
     LIMIT 3`,
    [paciente_id]
  );

  // Profissionais mais bem avaliados nas especialidades do paciente
  const profissionaisRecomendados = await pool.query(
    `SELECT ps.id, u.nome, ps.especialidade, ROUND(AVG(a.nota), 1) AS media_avaliacao
     FROM profissional_saude ps
     JOIN usuarios u ON u.id = ps.usuario_id
     LEFT JOIN avaliacao a ON a.profissional_id = ps.id
     WHERE ps.especialidade = ANY(
       SELECT especialidade FROM consulta
       WHERE paciente_id = $1 AND status = 'realizada'
     )
     GROUP BY ps.id, u.nome, ps.especialidade
     ORDER BY media_avaliacao DESC NULLS LAST
     LIMIT 5`,
    [paciente_id]
  );

  return {
    especialidades_frequentes: especialidades.rows,
    profissionais_recomendados: profissionaisRecomendados.rows
  };
}

module.exports = { gerarRecomendacoes };
