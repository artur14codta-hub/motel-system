// ======== Proteção por senha do gerente ========
const GERENTE_SENHA = "1205"; // senha padrão, pode alterar

function fecharModalSenha() {
  document.getElementById("modalSenhaGerente").classList.add("hidden");
  document.getElementById("inputSenhaModal").value = "";
  document.getElementById("erroSenha").classList.add("hidden");
}

function verificarSenhaGerente() {
  const input = document.getElementById("inputSenhaModal").value;
  const erro = document.getElementById("erroSenha");
  const conteudo = document.getElementById("conteudoControleQuartos");

  if (input === GERENTE_SENHA) {
    erro.classList.add("hidden");
    document.getElementById("modalSenhaGerente").classList.add("hidden");
    conteudo.classList.remove("hidden");
  } else {
    erro.classList.remove("hidden");
  }
}

// Mostrar o modal ao carregar a página
window.addEventListener("load", () => {
  document.getElementById("modalSenhaGerente").classList.remove("hidden");
});

// ======== Controle de Quartos ========
const controleForm = document.getElementById('controleQuartoForm');
const quartosControleTableBody = document.getElementById('quartosControleTableBody');
let editarIndex = null; // Para controlar se estamos editando um quarto

function listarQuartosControle() {
  let quartos = JSON.parse(localStorage.getItem('quartos')) || [];
  quartosControleTableBody.innerHTML = '';

  quartos.forEach((quarto, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border px-4 py-2">${quarto.nome}</td>
      <td class="border px-4 py-2">${quarto.valor}</td>
      <td class="border px-4 py-2 flex gap-2">
        <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded" onclick="editarQuarto(${index})">Editar</button>
        <button class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded" onclick="removerQuartoControle(${index})">Remover</button>
      </td>
    `;
    quartosControleTableBody.appendChild(tr);
  });
}

listarQuartosControle();

if (controleForm) {
  controleForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const nome = document.getElementById('nomeQuarto').value.trim();
    const valor = document.getElementById('valorQuarto').value;

    if (!nome || !valor) {
      alert('Preencha todos os campos');
      return;
    }

    let quartos = JSON.parse(localStorage.getItem('quartos')) || [];

    if (editarIndex !== null) {
      quartos[editarIndex].nome = nome;
      quartos[editarIndex].valor = valor;
      editarIndex = null;
    } else {
      quartos.push({ nome, valor, status: 'livre' });
    }

    localStorage.setItem('quartos', JSON.stringify(quartos));
    controleForm.reset();
    listarQuartosControle();
  });
}

function removerQuartoControle(index) {
  let quartos = JSON.parse(localStorage.getItem('quartos')) || [];
  if (confirm('Deseja realmente remover este quarto?')) {
    quartos.splice(index, 1);
    localStorage.setItem('quartos', JSON.stringify(quartos));
    listarQuartosControle();
  }
}

function editarQuarto(index) {
  let quartos = JSON.parse(localStorage.getItem('quartos')) || [];
  const quarto = quartos[index];
  document.getElementById('nomeQuarto').value = quarto.nome;
  document.getElementById('valorQuarto').value = quarto.valor;
  editarIndex = index;
}
