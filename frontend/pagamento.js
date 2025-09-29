const quartoPagamentoSelect = document.getElementById("quartoPagamentoSelect");
const valorQuartoSpan = document.getElementById("valorQuarto");
const valorConsumoSpan = document.getElementById("valorConsumo");
const valorTotalSpan = document.getElementById("valorTotal");

let quartoSelecionado = null;
let valorQuarto = 0;
let consumos = [];
let valorConsumo = 0;

// Carregar quartos no select
function carregarQuartosPagamento() {
  const quartos = JSON.parse(localStorage.getItem("quartos")) || [];
  quartoPagamentoSelect.innerHTML = '<option value="">Selecione um quarto</option>';
  quartos.forEach((q, i) => {
    quartoPagamentoSelect.innerHTML += `<option value="${i}">${q.nome}</option>`;
  });

  // Se veio da aba consumo
  const quartoConsumo = localStorage.getItem("quartoSelecionado");
  if (quartoConsumo !== null) {
    quartoPagamentoSelect.value = quartoConsumo;
    quartoPagamentoSelect.dispatchEvent(new Event("change"));
    localStorage.removeItem("quartoSelecionado");
  }
}

carregarQuartosPagamento();

// Quando selecionar um quarto, carregar valores
quartoPagamentoSelect.addEventListener("change", () => {
  const index = quartoPagamentoSelect.value;
  if (index === "") {
    quartoSelecionado = null;
    valorQuartoSpan.innerText = "0.00";
    valorConsumoSpan.innerText = "0.00";
    valorTotalSpan.innerText = "0.00";
    return;
  }

  quartoSelecionado = parseInt(index);

  const quartos = JSON.parse(localStorage.getItem("quartos")) || [];
  valorQuarto = parseFloat(quartos[quartoSelecionado].valor);
  valorQuartoSpan.innerText = valorQuarto.toFixed(2);

  const todosConsumos = JSON.parse(localStorage.getItem("consumos")) || {};
  consumos = todosConsumos[quartoSelecionado] || [];
  valorConsumo = consumos.reduce((sum, c) => sum + parseFloat(c.valor), 0);
  valorConsumoSpan.innerText = valorConsumo.toFixed(2);

  valorTotalSpan.innerText = (valorQuarto + valorConsumo).toFixed(2);

  // Registrar hora de entrada se o quarto estiver livre
  if (!quartos[quartoSelecionado].horaEntrada) {
    quartos[quartoSelecionado].horaEntrada = new Date().toLocaleTimeString();
    quartos[quartoSelecionado].status = 'ocupado';
    localStorage.setItem('quartos', JSON.stringify(quartos));
  }
});

// Finalizar Pagamento
function finalizarPagamento() {
  if (quartoSelecionado === null) {
    alert("Selecione um quarto!");
    return;
  }

  const total = valorQuarto + valorConsumo;

  // Valores de pagamento
  const pgDinheiro = parseFloat(document.getElementById("pgtoDinheiro").value) || 0;
  const pgPix = parseFloat(document.getElementById("pgtoPix").value) || 0;
  const pgCredito = parseFloat(document.getElementById("pgtoCredito").value) || 0;
  const pgDebito = parseFloat(document.getElementById("pgtoDebito").value) || 0;

  const somaPagamentos = pgDinheiro + pgPix + pgCredito + pgDebito;

  if (somaPagamentos < total) {
    alert("O valor pago é menor que o total!");
    return;
  }

  const agora = new Date();
  const dataHoje = agora.toISOString().split("T")[0];
  const horaSaida = agora.toLocaleTimeString();

  // Recuperar hora de entrada do quarto
  const quartos = JSON.parse(localStorage.getItem("quartos")) || [];
  const horaEntrada = quartos[quartoSelecionado].horaEntrada || "--:--";

  // Salvar no Relatório
  let relatorio = JSON.parse(localStorage.getItem("relatorio")) || [];
  relatorio.push({
    quarto: quartos[quartoSelecionado].nome,
    quartoIndex: quartoSelecionado, 
    data: dataHoje,
    horaEntrada: horaEntrada,
    horaSaida: horaSaida,
    consumos: consumos,
    valorQuarto: valorQuarto,
    total: total
  });
  localStorage.setItem("relatorio", JSON.stringify(relatorio));

  // Atualizar o estoque
  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  consumos.forEach(itemConsumido => {
    const produtoEstoque = produtos.find(p => p.nome === itemConsumido.nome);
    if (produtoEstoque) {
      produtoEstoque.quantidade -= 1;
      if (produtoEstoque.quantidade < 0) produtoEstoque.quantidade = 0;
    }
  });
  localStorage.setItem("produtos", JSON.stringify(produtos));

  // Limpar consumos do quarto
  let todosConsumos = JSON.parse(localStorage.getItem("consumos")) || {};
  todosConsumos[quartoSelecionado] = [];
  localStorage.setItem("consumos", JSON.stringify(todosConsumos));

  // Resetar hora de entrada do quarto e status
  quartos[quartoSelecionado].horaEntrada = null;
  quartos[quartoSelecionado].status = 'livre';
  localStorage.setItem('quartos', JSON.stringify(quartos));

  alert("Pagamento finalizado com sucesso!");
  window.location.href = "relatorio.html";
}
