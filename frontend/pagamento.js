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

  const quartoIndex = localStorage.getItem("quartoSelecionado");
  if (quartoIndex !== null) {
    quartoPagamentoSelect.value = quartoIndex;
    quartoPagamentoSelect.dispatchEvent(new Event("change"));
    localStorage.removeItem("quartoSelecionado");
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

  // Valor total do consumo
  const consumoQuarto = consumos[quartoSelecionado] || [];
  valorConsumo = consumoQuarto.reduce((total, item) => total + parseFloat(item.valor), 0);
  valorConsumoSpan.innerText = valorConsumo.toFixed(2);

  valorTotalSpan.innerText = (valorQuarto + valorConsumo).toFixed(2);
});

// Finalizar pagamento
function finalizarPagamento() {
  if (quartoSelecionado === null) {
    alert("Selecione um quarto para finalizar o pagamento!");
    return;
  }

  const total = valorQuarto + valorConsumo;

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

  // SOMENTE HORÁRIO ✔️
  const horaSaida = agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const dataHoje = agora.toISOString().split("T")[0];

  const quartos = JSON.parse(localStorage.getItem("quartos")) || [];
  const consumos = JSON.parse(localStorage.getItem("consumos")) || {};

  // 👉 GARANTIR QUE A HORA DE ENTRADA ESTEJA EM FORMATO CORRETO
  if (!quartos[quartoSelecionado].horaEntrada) {
    quartos[quartoSelecionado].horaEntrada = agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  // Salvar no relatório
  let relatorio = JSON.parse(localStorage.getItem("relatorio")) || [];
  relatorio.push({
    quarto: quartos[quartoSelecionado].nome,
    data: dataHoje,
    horaEntrada: quartos[quartoSelecionado].horaEntrada, // ✔️ SÓ HORÁRIO
    horaSaida: horaSaida,
    valorQuarto: valorQuarto,
    valorConsumo: valorConsumo,
    total: total,
    consumos: consumos[quartoSelecionado] || [],
    pagamentos: [
      { tipo: "Dinheiro", valor: pgDinheiro },
      { tipo: "PIX", valor: pgPix },
      { tipo: "Crédito", valor: pgCredito },
      { tipo: "Débito", valor: pgDebito }
    ].filter(p => p.valor > 0)
  });
  localStorage.setItem("relatorio", JSON.stringify(relatorio));

  // Atualizar estoque
  const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
  (consumos[quartoSelecionado] || []).forEach(item => {
    const produto = produtos.find(p => p.nome === item.nome);
    if (produto) produto.quantidade = Math.max(0, produto.quantidade - 1);
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
