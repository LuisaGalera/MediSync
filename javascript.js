// =========================
// CPF
// =========================
const campoCpf = document.getElementById("cpf");

if (campoCpf) {
  campoCpf.addEventListener("input", function (e) {
    let valor = e.target.value.replace(/\D/g, "");

    if (valor.length > 11) valor = valor.slice(0, 11);

    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    e.target.value = valor;
  });
}

// =========================
// TELEFONE
// =========================
const campoTelefone = document.getElementById("telefone");

if (campoTelefone) {
  campoTelefone.addEventListener("input", function (e) {
    let valor = e.target.value.replace(/\D/g, "");

    if (valor.length > 11) valor = valor.slice(0, 11);

    valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
    valor = valor.replace(/(\d{5})(\d)/, "$1-$2");

    e.target.value = valor;
  });
}

// =========================
// BOTÃO IR PARA AGENDAR
// =========================
function irParaConsulta() {
  window.location.href = "Agendar.html";
}
// =========================
// BOTÃO IR PARA HISTORICO
// =========================
function irParaHistorico() {
  window.location.href = "Consultas.html";
}

// =========================
// BOTÃO IR PARA PERFIL
// =========================
function irParaPerfil() {
  window.location.href = "Perfil.html";
}
// =========================
// DADOS MÉDICOS
// =========================
const medicos = [
  {
    nome: "Dr. João Silva",
    especialidade: "Cardiologista",
    plano: "Unimed",
    avaliacao: 4.8,
  },
  {
    nome: "Dra. Maria",
    especialidade: "Psicologia",
    plano: "Amil",
    avaliacao: 4.9,
  },
  {
    nome: "Carlos Rodrigues",
    especialidade: "Pediatra",
    plano: "Hapvida",
    avaliacao: 4.8,
  },
  {
    nome: "Geovanna Maria",
    especialidade: "Ginecologia",
    plano: "Bradesco Saúde",
    avaliacao: 4.2,
  },
];

// =========================
// NORMALIZAÇÃO
// =========================
function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizarEspecialidade(texto) {
  const valor = normalizarTexto(texto);

  if (valor === "cardiologia") return "cardiologista";
  if (valor === "psicologia") return "psicologia";
  if (valor === "pediatria") return "pediatra";
  if (valor === "ginecologia") return "ginecologista";

  return valor;
}

// =========================
// FORM AGENDAMENTO
// =========================
const formAgendamento = document.querySelector(".form-agendamento");

if (formAgendamento) {
  formAgendamento.addEventListener("submit", function (e) {
    e.preventDefault();

    const campoNome = document.getElementById("nome");
    const campoEspecialidade = document.getElementById("especialidade");
    const campoPlano = document.getElementById("plano-saude");

    const nome = campoNome ? normalizarTexto(campoNome.value) : "";
    const especialidade = campoEspecialidade ? campoEspecialidade.value : "";
    const plano = campoPlano ? campoPlano.value : "";

    filtrarMedicos(nome, especialidade, plano);
  });
}

// =========================
// FILTRO MÉDICOS
// =========================
function filtrarMedicos(nome, especialidade, plano) {
  const filtrados = medicos.filter((medico) => {
    return (
      (nome === "" || normalizarTexto(medico.nome).includes(nome)) &&
      (especialidade === "" ||
        normalizarEspecialidade(medico.especialidade) ===
          normalizarEspecialidade(especialidade)) &&
      (plano === "" || normalizarTexto(medico.plano) === normalizarTexto(plano))
    );
  });

  mostrarMedicos(filtrados);
}

// =========================
// MOSTRAR MÉDICOS
// =========================
function mostrarMedicos(lista) {
  const container = document.querySelector(".grid-medicos");
  const estado = document.querySelector(".estado-vazio");

  if (!container || !estado) return;

  container.innerHTML = "";

  if (lista.length === 0) {
    estado.style.display = "flex";
    estado.innerHTML = `
      <span class="material-symbols-outlined pesquisa">search_off</span>
      <div class="texto-vazio">
        <p>Nenhum profissional encontrado</p>
        <span>Tente ajustar os filtros</span>
      </div>
    `;
    return;
  }

  estado.style.display = "none";

  lista.forEach((medico) => {
    container.innerHTML += `
      <div class="card-profissional">
        <span class="material-symbols-outlined foto">person</span>

        <div class="conteudo">
          <div class="info">
            <p class="nome-medico">${medico.nome}</p>
            <p>${medico.especialidade}</p>
            <p>⭐ ${medico.avaliacao}</p>
          </div>

          <button class="btn-agendar">Agendar</button>
        </div>
      </div>
    `;
  });
}

// =========================
// HISTÓRICO
// =========================
const eventos = [
  {
    tipo: "consulta",
    titulo: "Consulta com Dr. João Silva – Cardiologista",
    data: "2026-04-12",
    descricao: "Queixa: dor no peito ao caminhar",
    local: "Hospital Vida Centro",
  },
  {
    tipo: "exame",
    titulo: "Hemograma Completo",
    data: "2026-03-28",
    descricao: "Resultado disponível para download",
    local: "Laboratório Saúde+",
  },
  {
    tipo: "medicamento",
    titulo: "Losartana – 50mg",
    data: "2026-01-20",
    descricao: "Tomar 1x ao dia, às 18h",
    local: "-",
  },
];

// =========================
// FORM HISTÓRICO
// =========================
const formHistorico = document.querySelector(".form-historico");

if (formHistorico) {
  formHistorico.addEventListener("submit", function (e) {
    e.preventDefault();

    const campoTipo = document.getElementById("evento");
    const campoPeriodo = document.getElementById("periodo");
    const tipo = campoTipo ? campoTipo.value : "";
    const periodo = campoPeriodo ? campoPeriodo.value : "";

    aplicarFiltro(tipo, periodo);
  });
}

// =========================
// FILTRO HISTÓRICO
// =========================
function aplicarFiltro(tipo, periodo) {
  let filtrados = eventos;

  if (tipo !== "") {
    filtrados = filtrados.filter((e) => e.tipo === tipo);
  }

  if (periodo !== "") {
    const hoje = new Date();
    const limiteDias = Number(periodo);

    filtrados = filtrados.filter((e) => {
      const dataEvento = new Date(e.data);
      const diff = (hoje - dataEvento) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= limiteDias;
    });
  }

  mostrarEventos(filtrados);
}

// =========================
// MOSTRAR HISTÓRICO
// =========================
function mostrarEventos(lista) {
  const container = document.querySelector(".lista-eventos");

  if (!container) return;

  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = "<p>Nenhum evento encontrado</p>";
    return;
  }

  lista.forEach((evento) => {
    container.innerHTML += `
      <div class="card-evento">
        <span class="material-symbols-outlined icone">
          ${iconePorTipo(evento.tipo)}
        </span>

        <div class="info">
          <p><strong>${evento.titulo}</strong></p>
          <p>${formatarData(evento.data)}</p>
          <p>${evento.descricao}</p>
          <p>${evento.local}</p>
        </div>
      </div>
    `;
  });
}

// =========================
// UTILIDADES
// =========================
function iconePorTipo(tipo) {
  if (tipo === "consulta") return "stethoscope";
  if (tipo === "exame") return "biotech";
  if (tipo === "medicamento") return "medication";
}

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}

// =========================
// AUTO LOAD HISTÓRICO
// =========================
if (document.querySelector(".lista-eventos")) {
  mostrarEventos(eventos);
}

// =========================
//  CONSULTAS
// =========================
const consultas = [
  {
    nome: "Dr. João Vitor",
    especialidade: "Cardiologista",
    status: "Agendada",
    data: "2026-04-22",
  },
  {
    nome: "Dra. Geovanna Maria",
    especialidade: "Ginecologista",
    status: "Cancelada",
    data: "2026-05-01",
  },
  {
    nome: "Dr. Carlos Rodrigues",
    especialidade: "Pediatra",
    status: "Realizada",
    data: "2026-06-15",
  },
];

// =========================
// FORM CONSULTAS
// =========================
const formConsultas = document.querySelector(".filtro-consultas");

if (formConsultas) {
  formConsultas.addEventListener("submit", function (e) {
    e.preventDefault();

    const campoStatus = document.getElementById("status");
    const campoPeriodo = document.getElementById("periodo-consulta");

    const status = campoStatus ? campoStatus.value : "";
    const periodo = campoPeriodo ? campoPeriodo.value : "";

    filtrarConsultas(status, periodo);
  });
}

// =========================
// FILTRO CONSULTAS
// =========================
function filtrarConsultas(status, periodo) {
  let filtradas = consultas;

  if (status !== "") {
    filtradas = filtradas.filter(
      (c) => c.status.toLowerCase() === status.toLowerCase(),
    );
  }

  if (periodo !== "") {
    const hoje = new Date();
    const limiteDias = Number(periodo);

    filtradas = filtradas.filter((c) => {
      const dataConsulta = new Date(c.data);
      const diff = (dataConsulta - hoje) / (1000 * 60 * 60 * 24);

      return diff >= 0 && diff <= limiteDias;
    });
  }

  mostrarConsultas(filtradas);
}

// =========================
// MOSTRAR CONSULTAS
// =========================
function mostrarConsultas(lista) {
  const container = document.querySelector(".lista-consultas");

  if (!container) return;

  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = "<p>Nenhuma consulta encontrada</p>";
    return;
  }

  lista.forEach((consulta) => {
    const dataFormatada = formatarData(consulta.data);
    const [dia, mes] = dataFormatada.split(" ");

    container.innerHTML += `
      <div class="card-consulta">
        <div class="data-consulta">
          <span class="dia">${dia}</span>
          <span class="mes-consulta">${mes}</span>
        </div>

        <div class="info-consulta">
          <p class="nome">${consulta.nome}</p>
          <p class="especialidade">${consulta.especialidade}</p>
        </div>
        <div class="acoes-consulta">
          <p class="status ${consulta.status.toLowerCase()}">
            ${consulta.status}
          </p>
          ${
            consulta.status === "Agendada"
              ? `<button class="btn-consulta btn-acao">Cancelar consulta</button>`
              : `<button class="btn-consulta btn-detalhe">Ver detalhes</button>`
          }
        </div>
      </div>
    `;
  });
}

// =========================
// FORMATAR DATA
// =========================
function formatarData(data) {
  const d = new Date(data);

  const dia = String(d.getDate()).padStart(2, "0");

  const meses = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  const mes = meses[d.getMonth()];

  return `${dia} ${mes}`;
}

// =========================
// AUTO LOAD
// =========================
if (document.querySelector(".lista-consultas")) {
  mostrarConsultas(consultas);
}
