// Seletores
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

// Função para listar produtos
function carregarProdutos() {
  produtoTableBody.innerHTML = "";
  produtos.forEach((p, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border px-2 py-1">${p.nome}</td>
      <td class="border px-2 py-1">${p.quantidade}</td>
      <td class="border px-2 py-1">R$ ${parseFloat(p.preco).toFixed(2)}</td>
      <td class="border px-2 py-1 flex gap-2">
        <button onclick="abrirEditarProduto(${i})" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded">Editar</button>
        <button onclick="apagarProduto(${i})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Apagar</button>
      </td>
    `;
    produtoTableBody.appendChild(tr);
  });

  // Atualiza no localStorage para garantir que o estoque/consumo use os dados corretos
  localStorage.setItem("produtos", JSON.stringify(produtos));
}

// Adicionar produto
function adicionarProduto() {
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
}

// Apagar produto
function apagarProduto(index) {
  if (!confirm("Deseja realmente apagar este produto?")) return;
  produtos.splice(index, 1);
  localStorage.setItem("produtos", JSON.stringify(produtos));
  carregarProdutos();
}

// Abrir modal de edição
function abrirEditarProduto(index) {
  editarIndex = index;
  const p = produtos[index];
  editarProdutoNome.value = p.nome;
  editarProdutoQuantidade.value = p.quantidade;
  editarProdutoPreco.value = p.preco;
  editarProdutoModal.classList.remove("hidden");
}

// Fechar modal
function fecharEditarModal() {
  editarProdutoModal.classList.add("hidden");
}

// Salvar edição
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


// Inicializa
carregarProdutos();
