const consultaService = require('../services/consulta.service');

async function agendar(req, res, next) {
  try {
    const consulta = await consultaService.agendar(req.body);
    res.status(201).json({ mensagem: 'Consulta agendada com sucesso', consulta });
  } catch (err) {
    next(err);
  }
}

async function cancelar(req, res, next) {
  try {
    const { id } = req.params;
    const cancelada = await consultaService.cancelar(id, req.usuario.id);
    res.json({ mensagem: 'Consulta cancelada com sucesso', consulta: cancelada });
  } catch (err) {
    next(err);
  }
}

async function reagendar(req, res, next) {
  try {
    const { id } = req.params;
    const { nova_data_hora } = req.body;
    const atualizada = await consultaService.reagendar(id, nova_data_hora);
    res.json({ mensagem: 'Consulta reagendada com sucesso', consulta: atualizada });
  } catch (err) {
    next(err);
  }
}

async function historico(req, res, next) {
  try {
    const { paciente_id } = req.params;
    const lista = await consultaService.listarHistorico(paciente_id);
    res.json(lista);
  } catch (err) {
    next(err);
  }
}

module.exports = { agendar, cancelar, reagendar, historico };
