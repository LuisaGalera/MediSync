const consultaRepo = require('../repositories/consulta.repository');
const profissionalRepo = require('../repositories/profissional.repository');
const notificacaoRepo = require('../repositories/notificacao.repository');

const CAPACIDADE_ALERTA_PERCENTUAL = 0.2; // RN-003: alerta abaixo de 20%

// Verifica e emite alerta de disponibilidade (RN-003)
async function verificarAlertaDisponibilidade(profissional_id) {
  const capacidade = await profissionalRepo.buscarCapacidadeMensal(profissional_id);
  const agendadas = await consultaRepo.contarVagasDisponiveisMes(profissional_id);
  const ocupacao = agendadas / capacidade;

  if (capacidade > 0 && (1 - ocupacao) < CAPACIDADE_ALERTA_PERCENTUAL) {
    await notificacaoRepo.criar({
      tipo: 'alerta_disponibilidade',
      mensagem: `Profissional ${profissional_id} com menos de 20% de vagas disponíveis no mês.`,
      referencia_id: profissional_id
    });
  }
}

// RN-002 + RN-004: agendar consulta com validações completas
async function agendar(dados) {
  const { paciente_id, profissional_id, data_hora, especialidade, tipo, urgente } = dados;

  if (!paciente_id || !profissional_id || !data_hora || !especialidade) {
    throw { status: 400, message: 'Paciente, profissional, data/hora e especialidade são obrigatórios' };
  }

  const dataConsulta = new Date(data_hora);
  if (dataConsulta <= new Date()) {
    throw { status: 400, message: 'A data da consulta deve ser no futuro' };
  }

  // RN-004: limite de 1 consulta por especialidade por mês
  const consultasNoMes = await consultaRepo.contarPorEspecialidadeNoMes(paciente_id, especialidade);
  if (consultasNoMes >= 1) {
    throw { status: 409, message: 'Já existe uma consulta agendada nessa especialidade para este mês (RN-004)' };
  }

  // RN-002: sem sobreposição de horários
  const conflito = await consultaRepo.verificarConflito(profissional_id, data_hora);
  if (conflito) {
    throw { status: 409, message: 'Profissional já possui consulta nesse horário (RN-002)' };
  }

  const consulta = await consultaRepo.criar({ paciente_id, profissional_id, data_hora, especialidade, tipo, urgente });

  // RN-003: verificar disponibilidade após agendamento
  await verificarAlertaDisponibilidade(profissional_id);

  return consulta;
}

// RN-004: cancelamento exige 24h de antecedência
async function cancelar(consulta_id, usuario_id) {
  const consulta = await consultaRepo.buscarPorId(consulta_id);

  if (!consulta) {
    throw { status: 404, message: 'Consulta não encontrada' };
  }

  if (consulta.status === 'cancelada') {
    throw { status: 400, message: 'Consulta já está cancelada' };
  }

  const agora = new Date();
  const dataConsulta = new Date(consulta.data_hora);
  const diferencaHoras = (dataConsulta - agora) / (1000 * 60 * 60);

  if (diferencaHoras < 24) {
    throw { status: 400, message: 'Cancelamento exige antecedência mínima de 24 horas (RN-004)' };
  }

  const cancelada = await consultaRepo.cancelar(consulta_id);

  // RN-003: rever disponibilidade após cancelamento
  await verificarAlertaDisponibilidade(consulta.profissional_id);

  return cancelada;
}

async function reagendar(consulta_id, nova_data_hora) {
  const consulta = await consultaRepo.buscarPorId(consulta_id);
  if (!consulta) throw { status: 404, message: 'Consulta não encontrada' };

  const novaData = new Date(nova_data_hora);
  if (novaData <= new Date()) {
    throw { status: 400, message: 'A nova data deve ser no futuro' };
  }

  const conflito = await consultaRepo.verificarConflito(consulta.profissional_id, nova_data_hora);
  if (conflito) {
    throw { status: 409, message: 'Profissional já possui consulta nesse horário (RN-002)' };
  }

  return await consultaRepo.reagendar(consulta_id, nova_data_hora);
}

async function listarHistorico(paciente_id) {
  return await consultaRepo.listarPorPaciente(paciente_id);
}

module.exports = { agendar, cancelar, reagendar, listarHistorico };
