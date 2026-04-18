const profissionalRepo = require('../repositories/profissional.repository');

async function listar(req, res, next) {
  try {
    const { especialidade } = req.query;
    const lista = especialidade
      ? await profissionalRepo.buscarPorEspecialidade(especialidade)
      : await profissionalRepo.buscarTodos();
    res.json(lista);
  } catch (err) {
    next(err);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const profissional = await profissionalRepo.buscarPorId(req.params.id);
    if (!profissional) return res.status(404).json({ erro: 'Profissional não encontrado' });
    res.json(profissional);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, buscarPorId };
