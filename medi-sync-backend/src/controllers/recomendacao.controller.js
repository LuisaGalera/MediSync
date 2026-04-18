const recomendacaoService = require('../services/recomendacao.service');

async function obter(req, res, next) {
  try {
    const { paciente_id } = req.params;
    const recomendacoes = await recomendacaoService.gerarRecomendacoes(paciente_id);
    res.json(recomendacoes);
  } catch (err) {
    next(err);
  }
}

module.exports = { obter };
