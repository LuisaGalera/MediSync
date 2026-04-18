const express = require('express');
const router = express.Router();
const { autenticar } = require('../middlewares/auth.middleware');
const pacienteRepo = require('../repositories/paciente.repository');

router.use(autenticar);

router.get('/:usuario_id', async (req, res, next) => {
  try {
    const paciente = await pacienteRepo.buscarPorUsuarioId(req.params.usuario_id);
    if (!paciente) return res.status(404).json({ erro: 'Paciente não encontrado' });
    res.json(paciente);
  } catch (err) { next(err); }
});

router.put('/:usuario_id', async (req, res, next) => {
  try {
    const atualizado = await pacienteRepo.atualizar(req.params.usuario_id, req.body);
    res.json({ mensagem: 'Dados atualizados com sucesso', paciente: atualizado });
  } catch (err) { next(err); }
});

module.exports = router;
