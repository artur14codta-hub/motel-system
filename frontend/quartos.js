// ==================== //
//     QUARTOS.JS       //
// ==================== //

// Seletores
const quartoForm = document.getElementById('quartoForm');
const quartosTableBody = document.getElementById('quartosTableBody');

// Painel de cards
const quartosPanelContainer = document.createElement('div');
quartosPanelContainer.id = 'quartosPanel';
quartosPanelContainer.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6';

if (quartosTableBody) {
  const tabelaContainer = quartosTableBody.closest('div');
  if (tabelaContainer && tabelaContainer.parentNode) {
    tabelaContainer.parentNode.insertBefore(quartosPanelContainer, tabelaContainer);
  }
}

// Cores por status
const statusCores = {
  livre: 'bg-green-400',
  ocupado: 'bg-red-500',
  limpeza: 'bg-yellow-400'
};

// ==================== //
// FUNÇÃO DE BACKUP      //
// ==================== //
function criarBackup() {
  const quartos = localStorage.getItem('quartos') || '[]';
  const entradas = localStorage.getItem('entradasQuartos') || '{}';

  const data = {
    quartos: JSON.parse(quartos),
    entradasQuartos: JSON.parse(entradas),
    backupDate: new Date().toLocaleString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_motel_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==================== //
// FUNÇÃO RESTAURAR BACKUP
// ==================== //
function restaurarBackup(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.quartos && data.entradasQuartos) {
        localStorage.setItem('quartos', JSON.stringify(data.quartos));
        localStorage.setItem('entradasQuartos', JSON.stringify(data.entradasQuartos));
        alert('✅ Backup restaurado com sucesso!');
        listarQuartos();
      } else {
        alert('⚠️ Arquivo inválido.');
      }
    } catch(err) {
      alert('⚠️ Erro ao restaurar backup.');
      console.error(err);
    }
  };
  reader.readAsText(file);
}

// ==================== //
//   FUNÇÃO LISTAR      //
// ==================== //
function listarQuartos() {
  let quartos = JSON.parse(localStorage.getItem('quartos')) || [];
  let entradas = JSON.parse(localStorage.getItem('entradasQuartos')) || {};

  if (quartosTableBody) quartosTableBody.innerHTML = '';
  quartosPanelContainer.innerHTML = '';

  quartos.forEach((quarto, index) => {
    // Tabela
    if (quartosTableBody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="border px-4 py-2 font-semibold">${quarto.nome}</td>
        <td class="border px-4 py-2">R$ ${parseFloat(quarto.valor || 0).toFixed(2)}</td>
        <td class="border px-4 py-2 capitalize">${quarto.status}</td>
        <td class="border px-4 py-2">${entradas[index] || "--:--"}</td>
        <td class="border px-4 py-2">
          <button class="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded" onclick="editarQuarto(${index})">
            <i class="fa-solid fa-pen"></i>
          </button>
        </td>
        <td class="border px-4 py-2">
          <button class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded" onclick="removerQuarto(${index})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      quartosTableBody.appendChild(tr);
    }

    // Cards
    const card = document.createElement('div');
    const cor = statusCores[quarto.status] || 'bg-gray-400';
    card.className = `p-4 rounded-xl shadow text-white cursor-pointer transition-transform hover:scale-105 ${cor}`;
    card.innerHTML = `
      <h3 class="text-xl font-bold mb-2">${quarto.nome}</h3>
      <p>Valor: R$ ${parseFloat(quarto.valor || 0).toFixed(2)}</p>
      <p>Status: ${quarto.status === 'livre' ? 'Disponível' : quarto.status === 'ocupado' ? 'Ocupado' : 'Em limpeza'}</p>
      <p>Entrada: ${entradas[index] || "--:--"}</p>
    `;

    card.addEventListener('click', () => {
      if (quarto.status === 'livre') {
        quarto.status = 'ocupado';
        entradas[index] = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (quarto.status === 'ocupado') {
        quarto.status = 'limpeza';
      } else {
        quarto.status = 'livre';
        entradas[index] = null;
      }

      quartos[index] = quarto;
      localStorage.setItem('quartos', JSON.stringify(quartos));
      localStorage.setItem('entradasQuartos', JSON.stringify(entradas));
      listarQuartos();
    });

    quartosPanelContainer.appendChild(card);
  });

  // Executa backup automático diário
  const ultimaDataBackup = localStorage.getItem('ultimaDataBackup');
  const hoje = new Date().toLocaleDateString();
  if (ultimaDataBackup !== hoje) {
    criarBackup();
    localStorage.setItem('ultimaDataBackup', hoje);
  }
}

// ==================== //
//   CADASTRAR QUARTO   //
// ==================== //
if (quartoForm) {
  quartoForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nomeQuarto').value.trim();
    const valor = document.getElementById('valorQuarto').value;
    const status = document.getElementById('statusQuarto').value;

    if (!nome || !valor || !status) {
      alert('⚠️ Preencha todos os campos antes de salvar.');
      return;
    }

    let quartos = JSON.parse(localStorage.getItem('quartos')) || [];
    quartos.push({ nome, valor, status });
    localStorage.setItem('quartos', JSON.stringify(quartos));

    let entradas = JSON.parse(localStorage.getItem('entradasQuartos')) || {};
    entradas[quartos.length - 1] = null;
    localStorage.setItem('entradasQuartos', JSON.stringify(entradas));

    quartoForm.reset();
    listarQuartos();
  });
}

// ==================== //
//     REMOVER QUARTO   //
// ==================== //
function removerQuarto(index) {
  let quartos = JSON.parse(localStorage.getItem('quartos')) || [];
  let entradas = JSON.parse(localStorage.getItem('entradasQuartos')) || {};

  if (confirm('Deseja realmente remover este quarto?')) {
    quartos.splice(index, 1);
    localStorage.setItem('quartos', JSON.stringify(quartos));

    if (Array.isArray(entradas)) entradas.splice(index, 1);
    else delete entradas[index];

    localStorage.setItem('entradasQuartos', JSON.stringify(entradas));
    listarQuartos();
  }
}

// ==================== //
//     EDITAR QUARTO    //
// ==================== //
function editarQuarto(index) {
  let quartos = JSON.parse(localStorage.getItem('quartos')) || [];
  const quarto = quartos[index];

  document.getElementById('nomeQuarto').value = quarto.nome;
  document.getElementById('valorQuarto').value = quarto.valor;
  document.getElementById('statusQuarto').value = quarto.status;

  quartoForm.onsubmit = function (e) {
    e.preventDefault();

    const atualizado = {
      nome: document.getElementById('nomeQuarto').value.trim(),
      valor: document.getElementById('valorQuarto').value,
      status: document.getElementById('statusQuarto').value
    };

    quartos[index] = atualizado;
    localStorage.setItem('quartos', JSON.stringify(quartos));

    alert('✅ Quarto atualizado com sucesso!');
    quartoForm.reset();
    listarQuartos();

    quartoForm.onsubmit = null;
  };
}

// ==================== //
//   LOGIN E TURNOS     //
// ==================== //
window.addEventListener("load", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario) {
    alert("⚠️ Você precisa fazer login para acessar esta página!");
    window.location.href = "login.html";
    return;
  }

  const userBox = document.getElementById("usuarioAtivo");
  const turnoBox = document.getElementById("turnoAtual");

  if (userBox) userBox.textContent = `👤 Usuário: ${usuario.nome}`;
  
  const hora = new Date().getHours();
  let turno = "";
  if (hora >= 6 && hora < 14) turno = "🌅 Manhã";
  else if (hora >= 14 && hora < 22) turno = "🌇 Tarde";
  else turno = "🌙 Noite";

  if (turnoBox) turnoBox.textContent = `🕒 Turno: ${turno}`;

  listarQuartos();
});

// ==================== //
// BOTÃO SAIR (GLOBAL)  //
// ==================== //
const btnSair = document.getElementById("btnSair");
if (btnSair) {
  btnSair.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
  });
}
