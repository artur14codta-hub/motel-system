const quartoForm = document.getElementById('quartoForm');
const quartosTableBody = document.getElementById('quartosTableBody');

// Painel de cards
const quartosPanelContainer = document.createElement('div');
quartosPanelContainer.id = 'quartosPanel';
quartosPanelContainer.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6';

// Insere painel antes da tabela
if (quartosTableBody) {
  const tabelaContainer = quartosTableBody.closest('div');
  tabelaContainer.parentNode.insertBefore(quartosPanelContainer, tabelaContainer);
}

// Cores por status
const statusCores = {
  livre: 'bg-green-400',
  ocupado: 'bg-red-500',
  limpeza: 'bg-yellow-400'
};

// --- FUNÇÃO LISTAR QUARTOS ---
function listarQuartos() {
  let quartos = JSON.parse(localStorage.getItem('quartos')) || [];
  let entradas = JSON.parse(localStorage.getItem('entradasQuartos')) || {};

  // Limpa tabela e painel
  if (quartosTableBody) quartosTableBody.innerHTML = '';
  quartosPanelContainer.innerHTML = '';

  quartos.forEach((quarto, index) => {
    // --- TABELA ---
    if (quartosTableBody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="border px-4 py-2">${quarto.nome}</td>
        <td class="border px-4 py-2">R$ ${quarto.valor}</td>
        <td class="border px-4 py-2">${quarto.status}</td>
        <td class="border px-4 py-2">${entradas[index] || "--:--"}</td>
        <td class="border px-4 py-2"><button class="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded" onclick="editarQuarto(${index})">Editar</button></td>
        <td class="border px-4 py-2"><button class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded" onclick="removerQuarto(${index})">Remover</button></td>
      `;
      quartosTableBody.appendChild(tr);
    }

    // --- PAINEL DE CARDS ---
    const card = document.createElement('div');
    card.className = `p-4 rounded-xl shadow cursor-pointer text-white ${statusCores[quarto.status]}`;
    card.innerHTML = `<h3 class="text-xl font-bold">${quarto.nome}</h3><p>Valor: R$ ${quarto.valor}</p><p>Status: ${quarto.status}</p><p>Entrada: ${entradas[index] || "--:--"}</p>`;

    card.addEventListener('click', () => {
      if (quarto.status === 'livre') {
        quarto.status = 'ocupado';
        entradas[index] = new Date().toLocaleTimeString(); // salva hora de entrada
      } else if (quarto.status === 'ocupado') {
        quarto.status = 'limpeza';
      } else {
        quarto.status = 'livre';
        entradas[index] = null; // limpa hora se voltar a livre
      }

      quartos[index] = quarto;
      localStorage.setItem('quartos', JSON.stringify(quartos));
      localStorage.setItem('entradasQuartos', JSON.stringify(entradas));
      listarQuartos();
    });

    quartosPanelContainer.appendChild(card);
  });
}

// Inicializa listagem
listarQuartos();

// --- CADASTRO ---
if (quartoForm) {
  quartoForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nomeQuarto').value.trim();
    const valor = document.getElementById('valorQuarto').value;
    const status = document.getElementById('statusQuarto').value;

    if (!nome || !valor || !status) {
      alert('Preencha todos os campos');
      return;
    }

    let quartos = JSON.parse(localStorage.getItem('quartos')) || [];
    quartos.push({ nome, valor, status });
    localStorage.setItem('quartos', JSON.stringify(quartos));

    // Adiciona entrada nula
    let entradas = JSON.parse(localStorage.getItem('entradasQuartos')) || {};
    entradas[quartos.length - 1] = null;
    localStorage.setItem('entradasQuartos', JSON.stringify(entradas));

    quartoForm.reset();
    listarQuartos();
  });
}

// --- REMOVER ---
function removerQuarto(index) {
  let quartos = JSON.parse(localStorage.getItem('quartos')) || [];
  if (confirm('Deseja realmente remover este quarto?')) {
    quartos.splice(index, 1);
    localStorage.setItem('quartos', JSON.stringify(quartos));

    let entradas = JSON.parse(localStorage.getItem('entradasQuartos')) || {};
    entradas.splice ? entradas.splice(index, 1) : delete entradas[index];
    localStorage.setItem('entradasQuartos', JSON.stringify(entradas));

    listarQuartos();
  }
}

// --- EDITAR ---
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

    alert('Quarto atualizado com sucesso!');
    quartoForm.reset();
    listarQuartos();

    quartoForm.onsubmit = null;
  };
}
