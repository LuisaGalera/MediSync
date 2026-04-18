const consultaRepo = require('../repositories/consulta.repository');

// RN-005: relatórios mensais de atendimento para administradores
async function gerarRelatorioMensal(mes, ano) {
  if (!mes || !ano) throw { status: 400, message: 'Mês e ano são obrigatórios' };

  const dados = await consultaRepo.agregarRelatorio(mes, ano);
  const taxaOcupacao = dados.total > 0
    ? ((dados.realizadas / dados.total) * 100).toFixed(1) + '%'
    : '0%';

  return {
    periodo: `${String(mes).padStart(2, '0')}/${ano}`,
    consultas_realizadas: parseInt(dados.realizadas),
    consultas_canceladas: parseInt(dados.canceladas),
    consultas_reagendadas: parseInt(dados.reagendadas),
    total: parseInt(dados.total),
    taxa_ocupacao: taxaOcupacao
  };
}

module.exports = { gerarRelatorioMensal };
