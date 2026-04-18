const pool = require('../config/database');

async function criar(dados) {
  const { tipo, mensagem, referencia_id } = dados;
  await pool.query(
    `INSERT INTO notificacao (tipo, mensagem, referencia_id, criado_em)
     VALUES ($1, $2, $3, NOW())`,
    [tipo, mensagem, referencia_id || null]
  );
}

module.exports = { criar };
