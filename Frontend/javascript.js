const API_BASE = "http://localhost:3000/api";
const TOKEN_KEY = "medisync_token";
const USER_KEY = "medisync_user";
const PATIENT_KEY = "medisync_patient";
const LAST_LOGIN_EMAIL_KEY = "medisync_last_email";
const LAST_REGISTER_KEY = "medisync_last_register";

function obterPaginaAtual() {
  const arquivo = window.location.pathname.split("/").pop();
  return arquivo || "Login.html";
}

function paginasProtegidas() {
  return [
    "Home.html",
    "Agendar.html",
    "Consultas.html",
    "Historico.html",
    "Perfil.html",
  ];
}

function obterToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function obterUsuarioSessao() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch (error) {
    return null;
  }
}

function obterPacienteCache() {
  try {
    return JSON.parse(localStorage.getItem(PATIENT_KEY) || "null");
  } catch (error) {
    return null;
  }
}

function salvarSessao(payload, emailInformado = "") {
  const usuario = {
    ...(payload.usuario || {}),
    email:
      payload.usuario?.email ||
      emailInformado ||
      localStorage.getItem(LAST_LOGIN_EMAIL_KEY) ||
      "",
  };

  localStorage.setItem(TOKEN_KEY, payload.token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));

  if (usuario.email) {
    localStorage.setItem(LAST_LOGIN_EMAIL_KEY, usuario.email);
  }
}

function salvarPaciente(paciente) {
  localStorage.setItem(PATIENT_KEY, JSON.stringify(paciente));

  const usuario = obterUsuarioSessao() || {};
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      ...usuario,
      paciente_id: paciente?.id || null,
    }),
  );
}

function limparSessao() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PATIENT_KEY);
}

function redirecionar(arquivo) {
  window.location.href = arquivo;
}

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatarEspecialidade(especialidade) {
  return String(especialidade || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function formatarStatus(status) {
  const mapa = {
    agendada: "Agendada",
    cancelada: "Cancelada",
    realizada: "Realizada",
    reagendada: "Reagendada",
  };

  return mapa[status] || status || "Sem status";
}

function obterClasseStatus(status) {
  return normalizarTexto(status || "").replace(/\s+/g, "-");
}

function formatarDataHora(dataIso) {
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "Data inválida";

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarDiaMes(dataIso) {
  const data = new Date(dataIso);
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

  if (Number.isNaN(data.getTime())) {
    return { dia: "--", mes: "---" };
  }

  return {
    dia: String(data.getDate()).padStart(2, "0"),
    mes: meses[data.getMonth()],
  };
}

function criarDataHoraIso(data, hora) {
  if (!data || !hora) return null;

  const valor = new Date(`${data}T${hora}:00`);
  if (Number.isNaN(valor.getTime())) return null;

  return valor.toISOString();
}

async function requisicaoApi(caminho, opcoes = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(opcoes.headers || {}),
  };
  const token = obterToken();

  if (token && opcoes.auth !== false) {
    headers.Authorization = `Bearer ${token}`;
  }

  let resposta;

  try {
    resposta = await fetch(`${API_BASE}${caminho}`, {
      method: opcoes.method || "GET",
      headers,
      body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
    });
  } catch (error) {
    throw new Error(
      "Não foi possível conectar ao back-end. Verifique se a API está rodando em http://localhost:3000.",
    );
  }

  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    throw new Error(
      dados?.erro || dados?.message || "Não foi possível concluir a operação.",
    );
  }

  return dados;
}

async function carregarPaciente(force = false) {
  const cache = obterPacienteCache();
  if (cache && !force) {
    return cache;
  }

  const usuario = obterUsuarioSessao();
  if (!usuario?.id) {
    return null;
  }

  try {
    const paciente = await requisicaoApi(`/pacientes/${usuario.id}`);
    salvarPaciente(paciente);
    return paciente;
  } catch (error) {
    return null;
  }
}

async function carregarConsultas() {
  const paciente = await carregarPaciente();
  if (!paciente?.id) {
    return [];
  }

  return requisicaoApi(`/consultas/historico/${paciente.id}`);
}

function obterDadosCadastraisLocais() {
  try {
    return JSON.parse(localStorage.getItem(LAST_REGISTER_KEY) || "null");
  } catch (error) {
    return null;
  }
}

function aplicarMascaraCpf() {
  const campoCpf = document.getElementById("cpf");
  if (!campoCpf) return;

  campoCpf.addEventListener("input", (evento) => {
    let valor = evento.target.value.replace(/\D/g, "").slice(0, 11);
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    evento.target.value = valor;
  });
}

function aplicarMascaraTelefone() {
  const campoTelefone = document.getElementById("telefone");
  if (!campoTelefone) return;

  campoTelefone.addEventListener("input", (evento) => {
    let valor = evento.target.value.replace(/\D/g, "").slice(0, 11);
    valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
    valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
    evento.target.value = valor;
  });
}

function protegerRotas() {
  const pagina = obterPaginaAtual();
  if (paginasProtegidas().includes(pagina) && !obterToken()) {
    alert("Faça login para acessar esta área.");
    redirecionar("Login.html");
  }
}

function configurarLogin() {
  if (obterPaginaAtual() !== "Login.html") return;

  const formulario = document.querySelector("form");
  if (!formulario) return;

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const email = document.getElementById("email")?.value?.trim() || "";
    const senha = document.getElementById("senha")?.value || "";

    try {
      const resposta = await requisicaoApi("/auth/login", {
        method: "POST",
        auth: false,
        body: { email, senha },
      });

      salvarSessao(resposta, email);
      await carregarPaciente(true);
      redirecionar("Home.html");
    } catch (error) {
      alert(error.message);
    }
  });
}

function configurarCadastro() {
  if (obterPaginaAtual() !== "Cadastro.html") return;

  const formulario = document.querySelector("form");
  if (!formulario) return;

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const senha = document.getElementById("senha")?.value || "";
    const confirmarSenha =
      document.getElementById("confirmar-senha")?.value || "";
    const aceitou = document.getElementById("aceitar")?.checked;

    if (!aceitou) {
      alert("Você precisa aceitar os termos para continuar.");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    const payload = {
      nome: document.getElementById("nome")?.value?.trim(),
      cpf: (document.getElementById("cpf")?.value || "").replace(/\D/g, ""),
      data_nascimento: document.getElementById("data-nascimento")?.value,
      email: document.getElementById("email")?.value?.trim(),
      telefone: document.getElementById("telefone")?.value,
      senha,
      perfil: "paciente",
      convenio: "",
    };

    try {
      await requisicaoApi("/auth/registrar", {
        method: "POST",
        auth: false,
        body: payload,
      });

      localStorage.setItem(
        LAST_REGISTER_KEY,
        JSON.stringify({
          nome: payload.nome,
          cpf: payload.cpf,
          data_nascimento: payload.data_nascimento,
          email: payload.email,
          telefone: payload.telefone,
          genero: document.getElementById("genero")?.value || "",
        }),
      );

      const login = await requisicaoApi("/auth/login", {
        method: "POST",
        auth: false,
        body: { email: payload.email, senha },
      });

      salvarSessao(login, payload.email);
      await carregarPaciente(true);
      alert("Conta criada com sucesso.");
      redirecionar("Home.html");
    } catch (error) {
      alert(error.message);
    }
  });
}

function renderizarProfissionais(lista) {
  const container = document.querySelector(".grid-medicos");
  const estado = document.querySelector(".estado-vazio");
  if (!container || !estado) return;

  container.innerHTML = "";

  if (!lista.length) {
    estado.style.display = "flex";
    estado.innerHTML = `
      <span class="material-symbols-outlined pesquisa">search_off</span>
      <div class="texto-vazio">
        <p>Nenhum profissional encontrado</p>
        <span>Tente pesquisar por outra especialidade</span>
      </div>
    `;
    return;
  }

  estado.style.display = "none";

  lista.forEach((profissional) => {
    container.innerHTML += `
      <div class="card-profissional">
        <span class="material-symbols-outlined foto">person</span>
        <div class="conteudo">
          <div class="info">
            <p class="nome-medico">${profissional.nome}</p>
            <p class="especialidade-medico">${formatarEspecialidade(profissional.especialidade)}</p>
            <p>${profissional.email || "E-mail não informado"}</p>
            <p>CRM: ${profissional.crm || "Não informado"}</p>
          </div>
          <button class="btn-agendar" data-profissional-id="${profissional.id}" data-especialidade="${profissional.especialidade}">Agendar</button>
        </div>
      </div>
    `;
  });
}

function filtrarProfissionaisNoFront(lista, nome) {
  if (!nome) return lista;
  const termo = normalizarTexto(nome);
  return lista.filter((item) => normalizarTexto(item.nome).includes(termo));
}

function encontrarProfissionalDestaque(lista, nomeCard, especialidadeCard) {
  const nomeNormalizado = normalizarTexto(nomeCard);
  const especialidadeNormalizada = normalizarTexto(especialidadeCard);

  return lista.find((profissional) => {
    const nomeProfissional = normalizarTexto(profissional.nome);
    const especialidadeProfissional = normalizarTexto(
      formatarEspecialidade(profissional.especialidade),
    );

    return (
      nomeProfissional === nomeNormalizado &&
      especialidadeProfissional === especialidadeNormalizada
    );
  });
}

async function prepararBotoesDestaque(grid) {
  const botoesDestaque = Array.from(
    grid.querySelectorAll(".btn-agendar-destaque"),
  );
  if (!botoesDestaque.length) return;

  try {
    const profissionais = await requisicaoApi("/profissionais");

    botoesDestaque.forEach((botao) => {
      const card = botao.closest(".card-profissional");
      if (!card) return;

      const nome = card.querySelector(".nome-medico")?.textContent || "";
      const especialidade =
        card.querySelector(".especialidade-medico")?.textContent || "";
      const profissional = encontrarProfissionalDestaque(
        profissionais,
        nome,
        especialidade,
      );

      if (!profissional) return;

      botao.dataset.profissionalId = profissional.id;
      botao.dataset.especialidade = profissional.especialidade;
    });
  } catch (error) {
    console.error("Nao foi possivel preparar os medicos em destaque.", error);
  }
}

function configurarAgendamento() {
  if (obterPaginaAtual() !== "Agendar.html") return;

  const formulario = document.querySelector(".form-agendamento");
  const grid = document.querySelector(".grid-medicos");
  if (!formulario || !grid) return;

  prepararBotoesDestaque(grid);

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById("nome")?.value || "";
    const especialidade = document.getElementById("especialidade")?.value || "";

    try {
      let profissionais = [];

      if (especialidade) {
        profissionais = await requisicaoApi(
          `/profissionais?especialidade=${encodeURIComponent(especialidade)}`,
        );
      } else {
        profissionais = await requisicaoApi("/profissionais");
      }

      profissionais = filtrarProfissionaisNoFront(profissionais, nome);
      renderizarProfissionais(profissionais);
    } catch (error) {
      alert(error.message);
    }
  });

  grid.addEventListener("click", async (evento) => {
    const botao = evento.target.closest(".btn-agendar");
    if (!botao) return;

    const data = document.getElementById("data-consulta")?.value;
    const hora = document.getElementById("hora-consulta")?.value;
    const dataHora = criarDataHoraIso(data, hora);

    if (!dataHora) {
      alert("Informe uma data e um horário válidos.");
      return;
    }

    if (!botao.dataset.profissionalId || !botao.dataset.especialidade) {
      alert(
        "Não foi possível identificar esse profissional. Atualize a página e tente novamente.",
      );
      return;
    }

    try {
      const paciente = await carregarPaciente();
      if (!paciente?.id) {
        alert(
          "Não foi possível identificar o paciente logado. Faça login novamente.",
        );
        return;
      }

      await requisicaoApi("/consultas", {
        method: "POST",
        body: {
          paciente_id: paciente.id,
          profissional_id: Number(botao.dataset.profissionalId),
          data_hora: dataHora,
          especialidade: botao.dataset.especialidade,
          tipo: "presencial",
          urgente: false,
        },
      });

      alert("Consulta agendada com sucesso.");
      redirecionar("Consultas.html");
    } catch (error) {
      alert(error.message);
    }
  });
}

function filtrarConsultasLista(consultas, status, periodo) {
  return consultas.filter((consulta) => {
    const statusValido = !status || consulta.status === status;
    if (!statusValido) return false;

    if (!periodo) return true;

    const hoje = new Date();
    const dataConsulta = new Date(consulta.data_hora);
    const diferencaDias = (dataConsulta - hoje) / (1000 * 60 * 60 * 24);
    return diferencaDias >= 0 && diferencaDias <= Number(periodo);
  });
}

function renderizarConsultas(lista) {
  const container = document.querySelector(".lista-consultas");
  if (!container) return;

  container.innerHTML = "";

  if (!lista.length) {
    container.innerHTML = "<p>Nenhuma consulta encontrada</p>";
    return;
  }

  lista.forEach((consulta) => {
    const { dia, mes } = formatarDiaMes(consulta.data_hora);
    const status = formatarStatus(consulta.status);
    const botao =
      consulta.status === "agendada" || consulta.status === "reagendada"
        ? `<button class="btn-consulta btn-acao" data-consulta-id="${consulta.id}">Cancelar consulta</button>`
        : `<button class="btn-consulta btn-detalhe" disabled>${formatarDataHora(consulta.data_hora)}</button>`;

    container.innerHTML += `
      <div class="card-consulta">
        <div class="data-consulta">
          <span class="dia">${dia}</span>
          <span class="mes-consulta">${mes}</span>
        </div>
        <div class="info-consulta">
          <p class="nome">${consulta.profissional_nome || "Profissional"}</p>
          <p class="especialidade">${formatarEspecialidade(consulta.especialidade)}</p>
          <p>${formatarDataHora(consulta.data_hora)}</p>
        </div>
        <div class="acoes-consulta">
          <p class="status ${obterClasseStatus(consulta.status)}">${status}</p>
          ${botao}
        </div>
      </div>
    `;
  });
}

async function configurarConsultas() {
  if (obterPaginaAtual() !== "Consultas.html") return;

  const formulario = document.querySelector(".filtro-consultas");
  const container = document.querySelector(".lista-consultas");
  if (!container) return;

  let consultas = [];

  async function carregarEExibir() {
    try {
      consultas = await carregarConsultas();
      renderizarConsultas(consultas);
    } catch (error) {
      alert(error.message);
    }
  }

  if (formulario) {
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const status = document.getElementById("status")?.value || "";
      const periodo = document.getElementById("periodo-consulta")?.value || "";
      renderizarConsultas(filtrarConsultasLista(consultas, status, periodo));
    });
  }

  container.addEventListener("click", async (evento) => {
    const botao = evento.target.closest(".btn-acao");
    if (!botao) return;

    if (!window.confirm("Deseja cancelar esta consulta?")) return;

    try {
      await requisicaoApi(`/consultas/${botao.dataset.consultaId}/cancelar`, {
        method: "PATCH",
      });
      await carregarEExibir();
    } catch (error) {
      alert(error.message);
    }
  });

  await carregarEExibir();
}

function renderizarHistorico(lista) {
  const container = document.querySelector(".lista-eventos");
  if (!container) return;

  container.innerHTML = "";

  if (!lista.length) {
    container.innerHTML = "<p>Nenhum evento encontrado</p>";
    return;
  }

  lista.forEach((consulta) => {
    container.innerHTML += `
      <div class="card-evento">
        <span class="material-symbols-outlined icone">stethoscope</span>
        <div class="info">
          <p><strong>Consulta com ${consulta.profissional_nome || "Profissional"}</strong></p>
          <p>${formatarDataHora(consulta.data_hora)}</p>
          <p>Especialidade: ${formatarEspecialidade(consulta.especialidade)}</p>
          <p>Status: ${formatarStatus(consulta.status)}</p>
        </div>
      </div>
    `;
  });
}

async function configurarHistorico() {
  if (obterPaginaAtual() !== "Historico.html") return;

  const formulario = document.querySelector(".form-historico");
  let historico = [];

  async function carregarHistorico() {
    try {
      historico = await carregarConsultas();
      renderizarHistorico(historico);
    } catch (error) {
      alert(error.message);
    }
  }

  if (formulario) {
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const tipo = document.getElementById("evento")?.value || "";
      const periodo = document.getElementById("periodo")?.value || "";

      let filtrado = [...historico];

      if (tipo && tipo !== "consulta") {
        filtrado = [];
      }

      if (periodo) {
        const hoje = new Date();
        filtrado = filtrado.filter((consulta) => {
          const data = new Date(consulta.data_hora);
          const diferencaDias = (hoje - data) / (1000 * 60 * 60 * 24);
          return diferencaDias >= 0 && diferencaDias <= Number(periodo);
        });
      }

      renderizarHistorico(filtrado);
    });
  }

  await carregarHistorico();
}

function buscarCampoPerfil() {
  return {
    nome: document.querySelector('.dados-pessoais input[type="text"]'),
    dataNascimento: document.querySelector(
      '.dados-pessoais input[type="date"]',
    ),
    cpf: document.querySelector('.dados-pessoais .linha input[type="text"]'),
    genero: document.querySelector(".dados-pessoais select"),
    telefone: document.querySelector('.perfil-meio .bloco input[type="text"]'),
    email: document.querySelector('.perfil-meio .bloco input[type="email"]'),
    rua: document.querySelectorAll('.perfil-meio .bloco input[type="text"]')[1],
    numero: document.querySelectorAll(
      '.perfil-meio .bloco .linha input[type="text"]',
    )[0],
    cep: document.querySelectorAll(
      '.perfil-meio .bloco .linha input[type="text"]',
    )[1],
    bairro: document.querySelectorAll(
      '.perfil-meio .bloco input[type="text"]',
    )[2],
    salvar: document.querySelector(".btn-salvar"),
    checkboxes: Array.from(
      document.querySelectorAll('.checkbox-group input[type="checkbox"]'),
    ),
  };
}

function marcarPreferencia(checkboxes, preferencia) {
  checkboxes.forEach((checkbox) => {
    checkbox.checked =
      normalizarTexto(checkbox.parentElement.textContent) ===
      normalizarTexto(preferencia);
  });
}

function bloquearCampo(
  campo,
  valor,
  placeholderBloqueio = "Não disponível no back-end original",
) {
  if (!campo) return;
  campo.value = valor || "";
  campo.disabled = true;
  if (!valor) {
    campo.placeholder = placeholderBloqueio;
  }
}

async function configurarPerfil() {
  if (obterPaginaAtual() !== "Perfil.html") return;

  const campos = buscarCampoPerfil();
  if (!campos.salvar) return;

  const usuario = obterUsuarioSessao() || {};
  const paciente = await carregarPaciente(true);
  const cadastroLocal = obterDadosCadastraisLocais() || {};

  if (campos.nome) campos.nome.value = usuario.nome || cadastroLocal.nome || "";
  if (campos.dataNascimento)
    campos.dataNascimento.value =
      paciente?.data_nascimento || cadastroLocal.data_nascimento || "";
  bloquearCampo(campos.cpf, cadastroLocal.cpf || "");
  bloquearCampo(campos.genero, cadastroLocal.genero || "");
  bloquearCampo(campos.telefone, cadastroLocal.telefone || "");
  bloquearCampo(campos.email, usuario.email || cadastroLocal.email || "");
  bloquearCampo(campos.rua, "");
  bloquearCampo(campos.numero, "");
  bloquearCampo(campos.cep, "");
  bloquearCampo(campos.bairro, "");

  marcarPreferencia(
    campos.checkboxes,
    paciente?.preferencia_notificacao || "email",
  );

  campos.salvar.addEventListener("click", async () => {
    const usuarioLogado = obterUsuarioSessao();
    if (!usuarioLogado?.id) {
      alert("Faça login novamente para atualizar os dados do paciente.");
      return;
    }

    const preferenciaMarcada = campos.checkboxes.find(
      (checkbox) => checkbox.checked,
    );
    const preferenciaTexto = preferenciaMarcada
      ? preferenciaMarcada.parentElement.textContent.trim().toLowerCase()
      : "email";

    try {
      const resposta = await requisicaoApi(`/pacientes/${usuarioLogado.id}`, {
        method: "PUT",
        body: {
          data_nascimento:
            campos.dataNascimento?.value || paciente?.data_nascimento || null,
          convenio: paciente?.convenio || "",
          preferencia_notificacao: preferenciaTexto,
        },
      });

      salvarPaciente(resposta.paciente);
      alert("Os campos disponíveis no back-end original foram atualizados.");
    } catch (error) {
      alert(error.message);
    }
  });
}

async function configurarHome() {
  if (obterPaginaAtual() !== "Home.html") return;

  const saudacao = document.querySelector(".nome-user p");
  const blocoConsultas = document.querySelector(".minhas-consultas");
  const blocoNotificacoes = document.querySelector(".notificacao-recentes");
  const usuario = obterUsuarioSessao() || {};

  try {
    const consultas = await carregarConsultas();
    const futuras = consultas
      .filter(
        (consulta) =>
          ["agendada", "reagendada"].includes(consulta.status) &&
          new Date(consulta.data_hora) >= new Date(),
      )
      .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora))
      .slice(0, 3);

    if (saudacao) {
      const primeiroNome = (usuario.nome || "Usuário").split(" ")[0];
      saudacao.textContent = `Olá, ${primeiroNome}`;
    }

    if (blocoConsultas) {
      blocoConsultas.innerHTML = `
        <h2 class="pro-consultas">Próximas consultas</h2>
        ${
          futuras.length
            ? futuras
                .map((consulta) => {
                  const { dia, mes } = formatarDiaMes(consulta.data_hora);
                  return `
            <div class="consultas">
              <div class="data">
                <span class="dia">${dia}</span>
                <span class="mes">${mes.toLowerCase()}</span>
              </div>
              <div class="informacoes">
                <p>${consulta.profissional_nome || "Profissional"}</p>
                <p>${formatarEspecialidade(consulta.especialidade)}</p>
              </div>
              <span class="material-symbols-outlined seta">chevron_right</span>
            </div>
          `;
                })
                .join("")
            : "<p>Você ainda não possui consultas agendadas.</p>"
        }
        <div class="all-consultas">
          <a href="Consultas.html">Todas as consultas</a>
        </div>
      `;
    }

    if (blocoNotificacoes) {
      const conteudo = futuras.length
        ? futuras
            .map(
              (consulta) => `
            <div class="notificacoes">
              <span class="material-symbols-outlined confirmada">check_circle</span>
              <div class="lembrete">
                <h3 class="titulo-lembrete">Consulta agendada</h3>
                <p>${consulta.profissional_nome || "Profissional"}</p>
                <p>${formatarDataHora(consulta.data_hora)}</p>
                <span class="tempo-passado">Status: ${formatarStatus(consulta.status)}</span>
              </div>
            </div>
          `,
            )
            .join("")
        : "<p>Nenhuma notificação recente.</p>";

      blocoNotificacoes.innerHTML = `<h2 class="notificacao-texto">Notificações recentes</h2>${conteudo}`;
    }
  } catch (error) {
    alert(error.message);
  }
}

function configurarLogoutRapido() {
  document.querySelectorAll(".nav-esquerda img").forEach((imagem) => {
    imagem.style.cursor = "pointer";
    imagem.addEventListener("dblclick", () => {
      limparSessao();
      redirecionar("Login.html");
    });
  });
}

function irParaConsulta() {
  redirecionar("Agendar.html");
}

function irParaHistorico() {
  redirecionar("Consultas.html");
}

function irParaPerfil() {
  redirecionar("Perfil.html");
}

window.irParaConsulta = irParaConsulta;
window.irParaHistorico = irParaHistorico;
window.irParaPerfil = irParaPerfil;

async function iniciarAplicacao() {
  protegerRotas();
  aplicarMascaraCpf();
  aplicarMascaraTelefone();
  configurarLogoutRapido();
  configurarLogin();
  configurarCadastro();
  configurarAgendamento();
  await configurarConsultas();
  await configurarHistorico();
  await configurarPerfil();
  await configurarHome();
}

document.addEventListener("DOMContentLoaded", iniciarAplicacao);

