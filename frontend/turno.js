// ======================
// CONFIGURAÇÃO
// ======================
const GERENTE_SENHA = "1205";

const userBox = document.getElementById("usuarioAtivo");
const tabela = document.getElementById("tabelaTurnos");
const faturamentoDiaEl = document.getElementById("faturamentoDia");

// Modal
const modalSenhaGerente = document.getElementById("modalSenhaGerente");
const inputSenhaModal = document.getElementById("inputSenhaModal");
const erroSenha = document.getElementById("erroSenha");
const btnConfirmarModal = modalSenhaGerente.querySelector("button.bg-green-600");
const btnCancelarModal = modalSenhaGerente.querySelector("button.bg-gray-500");

let registroAtualIndex = null;
let acaoPendente = null;

// Botão e input de filtro
const btnFiltrar = document.getElementById("btnFiltrar");
const filtroData = document.getElementById("filtroData");

// ======================
// INICIALIZAÇÃO
// ======================
window.addEventListener("load", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuario) {
    alert("⚠️ Você precisa fazer login!");
    window.location.href = "login.html";
    return;
  }

  userBox.textContent = `👤 Bem-vindo, ${usuario.nome}!`;

  let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
  let turnoAtivo = turnos.find(t => t.email === usuario.email && t.ativo);

  if (!turnoAtivo) {
    turnos.push({
      nome: usuario.nome,
      email: usuario.email,
      inicio: new Date().toISOString(),
      fim: null,
      ativo: true
    });
    localStorage.setItem("turnos", JSON.stringify(turnos));
  }

  atualizarTabela();
  atualizarFaturamento();

  document.getElementById("btnSair").addEventListener("click", () => {
    encerrarTurnoELogout();
  });
});

// ======================
// ENCERRAR TURNO
// ======================
function encerrarTurno(emailUsuario = null) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const email = emailUsuario || usuario.email;

  let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
  const turnoAtivo = turnos.find(t => t.email === email && t.ativo);

  if (turnoAtivo) {
    turnoAtivo.fim = new Date().toISOString();
    turnoAtivo.ativo = false;
    localStorage.setItem("turnos", JSON.stringify(turnos));
  }

  atualizarTabela();
}

function encerrarTurnoELogout() {
  encerrarTurno();
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

// ======================
// ATUALIZA TABELA
// ======================
function atualizarTabela() {
  tabela.innerHTML = "";
  const turnos = JSON.parse(localStorage.getItem("turnos")) || [];

  turnos.forEach((turno, i) => {
    const inicio = new Date(turno.inicio);
    const fim = turno.fim ? new Date(turno.fim) : new Date();

    const diffMs = fim - inicio;
    const h = Math.floor(diffMs / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);
    const s = Math.floor((diffMs % 60000) / 1000);

    const permanencia = `${h}h ${m}m ${s}s`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-4 py-2 border">${turno.nome}</td>
      <td class="px-4 py-2 border">${inicio.toLocaleDateString("pt-BR")}</td>
      <td class="px-4 py-2 border">${inicio.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
      <td class="px-4 py-2 border">
        ${turno.ativo
          ? `<span class="inline-block w-3 h-3 bg-green-500 rounded-full"></span> Ativo`
          : `<span class="inline-block w-3 h-3 bg-red-600 rounded-full"></span> Encerrado`
        }
      </td>
      <td class="px-4 py-2 border">${turno.fim ? fim.toLocaleDateString("pt-BR") : "--/--/----"}</td>
      <td class="px-4 py-2 border">${turno.fim ? fim.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "--:--"}</td>
      <td class="px-4 py-2 border">${permanencia}</td>
      <td class="px-4 py-2 border">
        ${turno.ativo ? `<button onclick="encerrarTurnoELogout()" class="bg-yellow-400 text-white px-3 py-1 rounded">Encerrar</button>` : ""}
        <button onclick="pedirSenhaGerente('apagarTurno', ${i})" class="bg-red-600 text-white px-3 py-1 rounded">Apagar</button>
      </td>
    `;

    tabela.appendChild(tr);
  });

  if (turnos.some(t => t.ativo)) {
    setTimeout(atualizarTabela, 1000);
  }
}

// ======================
// MODAL SENHA
// ======================
function pedirSenhaGerente(acao, index) {
  acaoPendente = acao;
  registroAtualIndex = index;

  modalSenhaGerente.classList.remove("hidden");
  inputSenhaModal.value = "";
  erroSenha.classList.add("hidden");
}

btnConfirmarModal.onclick = () => {
  if (inputSenhaModal.value === GERENTE_SENHA) {
    modalSenhaGerente.classList.add("hidden");
    if (acaoPendente === "apagarTurno") apagarTurnoConfirmado(registroAtualIndex);
  } else {
    erroSenha.classList.remove("hidden");
  }
};

btnCancelarModal.onclick = () => {
  modalSenhaGerente.classList.add("hidden");
  erroSenha.classList.add("hidden");
};

// ======================
// APAGAR TURNO
// ======================
function apagarTurnoConfirmado(index) {
  let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

  if (!confirm("Deseja realmente apagar este turno?")) return;

  turnos.splice(index, 1);
  localStorage.setItem("turnos", JSON.stringify(turnos));
  atualizarTabela();
}

// ======================
// FATURAMENTO
// ======================
function atualizarFaturamento(dataFiltro = null) {
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];

  const dia = dataFiltro || new Date().toISOString().slice(0, 10);

  const registrosDia = registros.filter(r => r.data === dia);

  const total = registrosDia.reduce((acc, r) => acc + Number(r.total || 0), 0);

  faturamentoDiaEl.textContent = `R$ ${total.toFixed(2)}`;
}

// ======================
// FILTRAR FATURAMENTO
// ======================
btnFiltrar.addEventListener("click", () => {
  const dataSelecionada = filtroData.value;
  if (!dataSelecionada) {
    alert("⚠️ Selecione uma data para filtrar!");
    return;
  }
  atualizarFaturamento(dataSelecionada);
});
