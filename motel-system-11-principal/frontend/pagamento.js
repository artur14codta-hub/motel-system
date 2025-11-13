const quartoPagamentoSelect = document.getElementById("quartoPagamentoSelect");
const valorQuartoSpan = document.getElementById("valorQuarto");
const valorConsumoSpan = document.getElementById("valorConsumo");
const valorTotalSpan = document.getElementById("valorTotal");

let quartoSelecionado = null;
let valorQuarto = 0;
let valorConsumo = 0;

// Carregar os quartos disponíveis
function carregarQuartosPagamento() {
  const quartos = JSON.parse(localStorage.getItem("quartos")) || [];
  quartoPagamentoSelect.innerHTML = '<option value="">Selecione um quarto</option>';

  quartos.forEach((q, i) => {
    quartoPagamentoSelect.innerHTML += `<option value="${i}">${q.nome}</option>`;
  });

  // Se veio da tela de consumo (armazenado em localStorage)
  const quartoIndex = localStorage.getItem("quartoSelecionado");
  if (quartoIndex !== null) {
    quartoPagamentoSelect.value = quartoIndex;
    quartoPagamentoSelect.dispatchEvent(new Event("change"));
    localStorage.removeItem("quartoSelecionado"); // limpar para não repetir
  }
}

// Atualiza os valores ao selecionar um quarto
quartoPagamentoSelect.addEventListener("change", () => {
  const index = quartoPagamentoSelect.value;
  if (index === "") {
    valorQuartoSpan.innerText = "0.00";
    valorConsumoSpan.innerText = "0.00";
    valorTotalSpan.innerText = "0.00";
    quartoSelecionado = null;
    return;
  }

  quartoSelecionado = parseInt(index);

  const quartos = JSON.parse(localStorage.getItem("quartos")) || [];
  const consumos = JSON.parse(localStorage.getItem("consumos")) || {};

  // Valor do quarto
  valorQuarto = parseFloat(quartos[quartoSelecionado].valor) || 0;
  valorQuartoSpan.innerText = valorQuarto.toFixed(2);

  // Valor total do consumo desse quarto
  const consumoQuarto = consumos[quartoSelecionado] || [];
  valorConsumo = consumoQuarto.reduce((total, item) => total + parseFloat(item.valor), 0);
  valorConsumoSpan.innerText = valorConsumo.toFixed(2);

  // Total geral
  valorTotalSpan.innerText = (valorQuarto + valorConsumo).toFixed(2);
});

// Finalizar pagamento
function finalizarPagamento() {
  if (quartoSelecionado === null) {
    alert("Selecione um quarto para finalizar o pagamento!");
    return;
  }

  const total = valorQuarto + valorConsumo;

  // Capturar valores pagos
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

  const quartos = JSON.parse(localStorage.getItem("quartos")) || [];
  const horaEntrada = quartos[quartoSelecionado].horaEntrada || "--:--";

  // Salvar no relatório
  let relatorio = JSON.parse(localStorage.getItem("relatorio")) || [];
  relatorio.push({
    quarto: quartos[quartoSelecionado].nome,
    data: dataHoje,
    horaEntrada: horaEntrada,
    horaSaida: horaSaida,
    valorQuarto: valorQuarto,
    valorConsumo: valorConsumo,
    total: total,
    pagamento: {
      dinheiro: pgDinheiro,
      pix: pgPix,
      credito: pgCredito,
      debito: pgDebito
    }
  });
  localStorage.setItem("relatorio", JSON.stringify(relatorio));

  // Atualizar o estoque
  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  const consumos = JSON.parse(localStorage.getItem("consumos")) || {};
  (consumos[quartoSelecionado] || []).forEach(item => {
    const produto = produtos.find(p => p.nome === item.nome);
    if (produto) {
      produto.quantidade = Math.max(0, produto.quantidade - 1);
    }
  });
  localStorage.setItem("produtos", JSON.stringify(produtos));

  // Limpar consumo e resetar quarto
  consumos[quartoSelecionado] = [];
  localStorage.setItem("consumos", JSON.stringify(consumos));
  quartos[quartoSelecionado].status = "livre";
  quartos[quartoSelecionado].horaEntrada = null;
  localStorage.setItem("quartos", JSON.stringify(quartos));

  alert("✅ Pagamento finalizado com sucesso!");
  window.location.href = "relatorio.html";
}

// Inicializar
carregarQuartosPagamento();
