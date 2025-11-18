// ============================================
// CONFIGURAÇÕES
// ============================================
const GERENTE_SENHA = "1205";

// Elementos
const userBox = document.getElementById("usuarioAtivo");
const tabela = document.getElementById("tabelaTurnos");
const faturamentoDiaEl = document.getElementById("faturamentoDia");

// Modal de senha do gerente
const modalSenhaGerente = document.createElement("div");
modalSenhaGerente.innerHTML = `
<div id="modalSenhaGerente" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
  <div class="bg-gray-800 text-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
    <h2 class="text-2xl font-bold mb-4 text-center">Acesso Restrito</h2>
    <p class="mb-4 text-center">Digite a senha do gerente para continuar:</p>
    <input type="password" id="inputSenhaModal" class="w-full p-3 rounded-xl text-black mb-4" placeholder="Senha do gerente">
    <div class="flex justify-end gap-2">
      <button onclick="fecharModalSenha()" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl">Cancelar</button>
      <button onclick="verificarSenhaGerente()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl">Confirmar</button>
    </div>
    <p id="erroSenha" class="text-red-500 mt-2 text-center hidden">Senha incorreta!</p>
  </div>
</div>`;
document.body.appendChild(modalSenhaGerente);

// Variáveis do modal
let registroAtualIndex = null;
let acaoPendente = null;
let inputSenhaModal = document.getElementById("inputSenhaModal");
let erroSenha = document.getElementById("erroSenha");

// ============================================
// INICIALIZAÇÃO
// ============================================
window.addEventListener("load", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario) {
    alert("⚠️ Você precisa fazer login para acessar esta página!");
    window.location.href = "login.html";
    return;
  }

  userBox.textContent = `👤 Bem-vindo, ${usuario.nome}!`;

  let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
  let turnoAtivo = turnos.find(t => t.email === usuario.email && t.ativo);

  if (!turnoAtivo) {
    const inicioTurno = new Date().toISOString();
    turnoAtivo = {
      nome: usuario.nome,
      email: usuario.email,
      inicio: inicioTurno,
      fim: null,
      ativo: true
    };
    turnos.push(turnoAtivo);
    localStorage.setItem("turnos", JSON.stringify(turnos));
  }

  atualizarTabela();
  atualizarFaturamento();

  const btnSair = document.getElementById("btnSair");
  if (btnSair) {
    btnSair.addEventListener("click", () => {
      encerrarTurnoELogout();
    });
  }
});

// ============================================
// FUNÇÕES DE TURNO
// ============================================
function encerrarTurno(emailUsuario = null) {
  let usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario && !emailUsuario) return;

  const email = emailUsuario || usuario.email;
  let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
  const turnoAtivo = turnos.find(t => t.email === email && t.ativo);

  if (turnoAtivo) {
    turnoAtivo.fim = new Date().toISOString();
    turnoAtivo.ativo = false;
    localStorage.setItem("turnos", JSON.stringify(turnos));
    alert(`Turno encerrado às ${new Date(turnoAtivo.fim).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`);
  }

  atualizarTabela();
}

function encerrarTurnoELogout() {
  encerrarTurno();
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

// ============================================
// ATUALIZA TABELA DO DASHBOARD
// ============================================
function atualizarTabela() {
  tabela.innerHTML = "";
  const turnos = JSON.parse(localStorage.getItem("turnos")) || [];

  turnos.forEach((turno, i) => {

    // DATA E HORA DE INÍCIO
    const dataInicio = new Date(turno.inicio).toLocaleDateString("pt-BR");
    const horaInicio = new Date(turno.inicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // DATA E HORA DE FIM
    const dataFim = turno.fim ? new Date(turno.fim).toLocaleDateString("pt-BR") : "--/--/----";
    const horaFim = turno.fim ? new Date(turno.fim).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";

    // PERMANÊNCIA
    let permanencia = "";
    if (turno.ativo) {
      const diffMs = new Date() - new Date(turno.inicio);
      const segundos = Math.floor((diffMs / 1000) % 60);
      const minutos = Math.floor((diffMs / (1000 * 60)) % 60);
      const horas = Math.floor(diffMs / (1000 * 60 * 60));
      permanencia = `${horas}h ${minutos}m ${segundos}s`;
    } else if (turno.fim) {
      const diffMs = new Date(turno.fim) - new Date(turno.inicio);
      const segundos = Math.floor((diffMs / 1000) % 60);
      const minutos = Math.floor((diffMs / (1000 * 60)) % 60);
      const horas = Math.floor(diffMs / (1000 * 60 * 60));
      permanencia = `${horas}h ${minutos}m ${segundos}s`;
    }

    const situacao = turno.ativo
      ? `<span class="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> Ativo`
      : `<span class="inline-block w-3 h-3 rounded-full bg-red-600 mr-1"></span> Encerrado`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-4 py-2 border">${turno.nome}</td>
      <td class="px-4 py-2 border">${dataInicio}</td>
      <td class="px-4 py-2 border">${horaInicio}</td>
      <td class="px-4 py-2 border">${situacao}</td>
      <td class="px-4 py-2 border">${dataFim}</td>
      <td class="px-4 py-2 border">${horaFim}</td>
      <td class="px-4 py-2 border">${permanencia}</td>
      <td class="px-4 py-2 border">
        ${turno.ativo ? `<button onclick="encerrarTurnoELogout()" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded">Encerrar</button>` : ""}
        <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded btn-apagar" data-index="${i}">Apagar</button>
      </td>
    `;
    tabela.appendChild(tr);
  });

  document.querySelectorAll(".btn-apagar").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"));
      pedirSenhaGerente("apagarTurno", index);
    });
  });

  if (turnos.some(t => t.ativo)) {
    setTimeout(atualizarTabela, 1000);
  }
}

// ============================================
// MODAL DO GERENTE
// ============================================
function pedirSenhaGerente(acao, index) {
  acaoPendente = acao;
  registroAtualIndex = index;
  modalSenhaGerente.classList.remove("hidden");
  inputSenhaModal.value = "";
  erroSenha.classList.add("hidden");
}

function verificarSenhaGerente() {
  if (inputSenhaModal.value === GERENTE_SENHA) {
    modalSenhaGerente.classList.add("hidden");
    if (acaoPendente === "apagarTurno") apagarTurnoConfirmado(registroAtualIndex);
  } else {
    erroSenha.classList.remove("hidden");
  }
}

function fecharModalSenha() {
  modalSenhaGerente.classList.add("hidden");
  erroSenha.classList.add("hidden");
}

// ============================================
// APAGAR TURNO
// ============================================
function apagarTurnoConfirmado(index) {
  let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
  if (!confirm("Deseja realmente apagar este turno?")) return;
  turnos.splice(index, 1);
  localStorage.setItem("turnos", JSON.stringify(turnos));
  atualizarTabela();
  alert("Turno removido com sucesso!");
}

// ============================================
// FATURAMENTO
// ============================================
function atualizarFaturamento(dataFiltro = null) {
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  let registrosFiltrados = registros;

  if (dataFiltro) {
    registrosFiltrados = registros.filter(r => r.data === dataFiltro);
  } else {
    const hoje = new Date();
    const diaAtual = hoje.toISOString().slice(0, 10);
    registrosFiltrados = registros.filter(r => r.data === diaAtual);
  }

  const faturamentoDia = registrosFiltrados.reduce((acc, r) => acc + parseFloat(r.total || 0), 0);
  faturamentoDiaEl.textContent = `R$ ${faturamentoDia.toFixed(2)}`;
}




// ============================================
// FILTRAR FATURAMENTO
// ============================================
const btnFiltrar = document.getElementById("btnFiltrar");
const filtroData = document.getElementById("filtroData");

btnFiltrar.addEventListener("click", () => {
  const dataSelecionada = filtroData.value; // formato yyyy-mm-dd
  if (!dataSelecionada) {
    alert("Selecione uma data para filtrar!");
    return;
  }
  atualizarFaturamento(dataSelecionada);
});
