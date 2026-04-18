const express = require("express");
const cors = require("cors"); // 1. Importe o pacote que você instalou
const app = express();

// 2. Ative o CORS ANTES de definir as rotas
app.use(cors());

app.use(express.json());

// Rotas
const authRoutes = require("./routes/auth.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const pacienteRoutes = require("./routes/paciente.routes");
const profissionalRoutes = require("./routes/profissional.routes");
const consultaRoutes = require("./routes/consulta.routes");
const relatorioRoutes = require("./routes/relatorio.routes");
const recomendacaoRoutes = require("./routes/recomendacao.routes");

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/profissionais", profissionalRoutes);
app.use("/api/consultas", consultaRoutes);
app.use("/api/relatorios", relatorioRoutes);
app.use("/api/recomendacoes", recomendacaoRoutes);

// Rota de saúde
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", sistema: "Medi Sync" });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ erro: err.message || "Erro interno do servidor" });
});

module.exports = app;
