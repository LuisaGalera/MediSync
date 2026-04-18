const { Pool } = require("pg");

console.log("DEBUG - Senha carregada:", typeof process.env.DB_PASSWORD); // Deve imprimir "string"

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  // O segredo está aqui: converter explicitamente para String
  password: String(process.env.DB_PASSWORD || ""),
});

pool.on("connect", () => {
  console.log("Conectado ao banco de dados PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Erro no pool de conexão:", err);
});

module.exports = pool;
