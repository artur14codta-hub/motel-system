// turnos.js

const tabelaTurnos = document.getElementById("tabelaTurnos");
const btnSair = document.getElementById("btnSair");

// Pega usuário logado
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

// Função para formatar hora
function formatarHora(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Função para calcular tempo de permanência
function tempoPermanencia(inicio, fim = new Date()) {
  const diffMs = new Date(fim) - new Date(inicio);
  const segundos = Math.floor((diffMs / 1000) % 60);
  const minutos = Math.floor((diffMs / (1000 * 60)) % 60);
  const horas = Math.floor(diffMs / (1000 * 60 * 60));
  return `${horas}h ${minutos}m ${segundos}s`;
}

// Inicializa turno
function iniciarTurno() {
  if (!usuario) return;

  // Salva turno no localStorage se não existir
  let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
  const turnoExistente = turnos.find(t => t.email === usuario.email && !t.fim);

  if (!turnoExistente) {
    const novoTurno = {
      nome: usuario.nome,
      email: usuario.email,
      inicio: new Date().toISOString(),
      fim: null,
      ativo: true
    };
    turnos.push(novoTurno);
    localStorage.setItem("turnos", JSON.stringify(turnos));
  }

  atualizarTabela();
}

// Atualiza tabela de turnos
function atualizarTabela() {
  tabelaTurnos.innerHTML = '';
  const turnos = JSON.parse(localStorage.getItem("turnos")) || [];

  turnos.forEach(turno => {
    const tr = document.createElement("tr");
    const situacao = turno.ativo 
      ? `<span class="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> Ativo`
      : `<span class="inline-block w-3 h-3 rounded-full bg-gray-400 mr-1"></span> Inativo`;

    tr.innerHTML = `
      <td class="px-4 py-2 border">${turno.nome}</td>
      <td class="px-4 py-2 border">${formatarHora(turno.inicio)}</td>
      <td class="px-4 py-2 border">${turno.fim ? formatarHora(turno.fim) : "--:--"}</td>
      <td class="px-4 py-2 border">${turno.fim ? tempoPermanencia(turno.inicio, turno.fim) : tempoPermanencia(turno.inicio)}</td>
      <td class="px-4 py-2 border">${situacao}</td>
    `;
    tabelaTurnos.appendChild(tr);
  });
}

// Botão Sair encerra turno
btnSair.addEventListener("click", () => {
  if (!usuario) return;

  let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
  const turnoAtivo = turnos.find(t => t.email === usuario.email && t.ativo);

  if (turnoAtivo) {
    turnoAtivo.fim = new Date().toISOString();
    turnoAtivo.ativo = false;
    localStorage.setItem("turnos", JSON.stringify(turnos));
  }

  // Remove usuário logado e recarrega página
  localStorage.removeItem("usuarioLogado");
  window.location.reload();
});

// Atualiza tabela a cada 1 segundo para o tempo de permanência
setInterval(() => {
  if (usuario) atualizarTabela();
}, 1000);

// Inicializa ao carregar
window.addEventListener("load", () => {
  if (usuario) iniciarTurno();
});
