const relatorioService = require('../services/relatorio.service');

async function mensal(req, res, next) {
  try {
    const { mes, ano } = req.query;
    const relatorio = await relatorioService.gerarRelatorioMensal(Number(mes), Number(ano));
    res.json(relatorio);
  } catch (err) {
    next(err);
  }
}

module.exports = { mensal };
