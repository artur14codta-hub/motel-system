// ============================
// CONFIGURAÇÃO DE SENHA
// ============================
const GERENTE_SENHA = "1205";
let gerenteAutorizado = false; // senha já validada

// Modal de senha
const modalSenhaGerente = document.getElementById("modalSenhaGerente");
const inputSenhaModal = document.getElementById("inputSenhaModal");
const erroSenha = document.getElementById("erroSenha");

// ============================
// PRODUTOS
// ============================
const produtoTableBody = document.getElementById("produtoTableBody");
const produtoForm = document.getElementById("produtoForm");
const produtoNome = document.getElementById("produtoNome");
const produtoQuantidade = document.getElementById("produtoQuantidade");
const produtoPreco = document.getElementById("produtoPreco");

// Modal de edição
const editarProdutoModal = document.getElementById("editarProdutoModal");
const editarProdutoForm = document.getElementById("editarProdutoForm");
const editarProdutoNome = document.getElementById("editarProdutoNome");
const editarProdutoQuantidade = document.getElementById("editarProdutoQuantidade");
const editarProdutoPreco = document.getElementById("editarProdutoPreco");

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let editarIndex = null;
let acaoPendente = null;

// ============================
// FUNÇÕES DE SENHA
// ============================
function pedirSenhaGerente(acao, index) {
  if (gerenteAutorizado) {
    // senha já foi inserida, executa ação direto
    executarAcao(acao, index);
    return;
  }

  acaoPendente = { acao, index };
  modalSenhaGerente.classList.remove("hidden");
  inputSenhaModal.value = "";
  erroSenha.classList.add("hidden");
  inputSenhaModal.focus();
}

function verificarSenhaGerente() {
  if (inputSenhaModal.value === GERENTE_SENHA) {
    gerenteAutorizado = true;
    modalSenhaGerente.classList.add("hidden");
    erroSenha.classList.add("hidden");

    // executa a ação que estava pendente
    if (acaoPendente) {
      executarAcao(acaoPendente.acao, acaoPendente.index);
      acaoPendente = null;
    }
  } else {
    erroSenha.classList.remove("hidden");
    inputSenhaModal.value = "";
    inputSenhaModal.focus();
  }
}

function fecharModalSenha() {
  modalSenhaGerente.classList.add("hidden");
  erroSenha.classList.add("hidden");
  acaoPendente = null;
}

// Executa ação protegida
function executarAcao(acao, index) {
  switch (acao) {
    case "editarProduto":
      abrirEditarProduto(index);
      break;
    case "apagarProduto":
      apagarProduto(index);
      break;
  }
}

// ============================
// LISTAR PRODUTOS
// ============================
function carregarProdutos() {
  produtoTableBody.innerHTML = "";
  produtos.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border px-2 py-1">${p.nome}</td>
      <td class="border px-2 py-1">${p.quantidade}</td>
      <td class="border px-2 py-1">R$ ${parseFloat(p.preco).toFixed(2)}</td>
      <td class="border px-2 py-1 flex gap-2">
        <button onclick="pedirSenhaGerente('editarProduto', ${i})" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded">Editar</button>
        <button onclick="pedirSenhaGerente('apagarProduto', ${i})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Apagar</button>
      </td>
    `;
    produtoTableBody.appendChild(tr);
  });

  localStorage.setItem("produtos", JSON.stringify(produtos));
}

// ============================
// ADICIONAR PRODUTO
// ============================
produtoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = produtoNome.value.trim();
  const quantidade = parseInt(produtoQuantidade.value);
  const preco = parseFloat(produtoPreco.value);

  if (!nome || isNaN(quantidade) || isNaN(preco)) {
    alert("Preencha todos os campos corretamente!");
    return;
  }

  produtos.push({ nome, quantidade, preco });
  localStorage.setItem("produtos", JSON.stringify(produtos));

  produtoNome.value = "";
  produtoQuantidade.value = "";
  produtoPreco.value = "";

  carregarProdutos();
});

// ============================
// APAGAR PRODUTO
// ============================
function apagarProduto(index) {
  if (!confirm("Deseja realmente apagar este produto?")) return;
  produtos.splice(index, 1);
  localStorage.setItem("produtos", JSON.stringify(produtos));
  carregarProdutos();
}

// ============================
// EDITAR PRODUTO
// ============================
function abrirEditarProduto(index) {
  editarIndex = index;
  const p = produtos[index];
  editarProdutoNome.value = p.nome;
  editarProdutoQuantidade.value = p.quantidade;
  editarProdutoPreco.value = p.preco;
  editarProdutoModal.classList.remove("hidden");
}

function fecharEditarModal() {
  editarProdutoModal.classList.add("hidden");
}

editarProdutoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = editarProdutoNome.value.trim();
  const quantidade = parseInt(editarProdutoQuantidade.value);
  const preco = parseFloat(editarProdutoPreco.value);

  if (!nome || isNaN(quantidade) || isNaN(preco)) {
    alert("Preencha todos os campos corretamente!");
    return;
  }

  produtos[editarIndex] = { nome, quantidade, preco };
  localStorage.setItem("produtos", JSON.stringify(produtos));
  fecharEditarModal();
  carregarProdutos();
});

// ============================
// INICIALIZAÇÃO
// ============================
carregarProdutos();
