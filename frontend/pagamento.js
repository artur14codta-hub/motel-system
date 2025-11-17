// ===============================
//    PAGAMENTO.JS (ATUALIZADO)
// ===============================

const quartoPagamentoSelect = document.getElementById("quartoPagamentoSelect");
const valorQuartoSpan = document.getElementById("valorQuarto");
const valorConsumoSpan = document.getElementById("valorConsumo");
const valorTotalSpan = document.getElementById("valorTotal");

let quartoSelecionado = null;
let valorQuarto = 0;
let valorConsumo = 0;
let momentosCount = 1;
let totalMomentos = 0;

// -------------------------------
//  Carregar quartos no select
// -------------------------------
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

// -------------------------------
//  UTIL: calcula diferença em horas (float)
// -------------------------------
function horasEntre(dataEntradaISO, dataSaidaISO) {
  const entrada = new Date(dataEntradaISO);
  const saida = new Date(dataSaidaISO);
  const diffMs = saida - entrada;
  return diffMs / (1000 * 60 * 60); // horas decimais
}

// -------------------------------
//  UTIL: calcula momentos (3h cada) e retorna {momentos, totalMomentos}
// -------------------------------
function calcularMomentosEValor(dataEntradaISO, dataSaidaISO, valorPorMomento) {
  const horas = horasEntre(dataEntradaISO, dataSaidaISO);
  // se por algum motivo horas <= 0, cobramos 1 momento
  const momentos = Math.max(1, Math.ceil(horas / 3));
  const total = momentos * valorPorMomento;
  return { momentos, totalMomentos: total };
}

// -------------------------------
//  Atualiza valores na tela (ao selecionar quarto)
// -------------------------------
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
  const entradas = JSON.parse(localStorage.getItem("entradasQuartos")) || {};

  // Valor base por momento do quarto
  valorQuarto = parseFloat(quartos[quartoSelecionado].valor) || 0;
  valorQuartoSpan.innerText = valorQuarto.toFixed(2);

  // Consumo do quarto
  const consumoQuarto = consumos[quartoSelecionado] || [];
  valorConsumo = consumoQuarto.reduce((t, item) => t + parseFloat(item.valor), 0);
  valorConsumoSpan.innerText = valorConsumo.toFixed(2);

  // Se tivermos hora de entrada, calculamos os momentos
  const dataEntradaISO = entradas[quartoSelecionado];
  const agoraISO = new Date().toISOString();

  if (dataEntradaISO) {
    const calc = calcularMomentosEValor(dataEntradaISO, agoraISO, valorQuarto);
    momentosCount = calc.momentos;
    totalMomentos = calc.totalMomentos;
  } else {
    momentosCount = 1;
    totalMomentos = valorQuarto;
  }

  // Mostrar total do quarto já com momentos + consumos
  valorTotalSpan.innerText = (totalMomentos + valorConsumo).toFixed(2);

  // Opcional: mostrar detalhes de momentos no HTML (crie um span/p/div onde quiser)
  const detalhesMomentosEl = document.getElementById("detalhesMomentos");
  if (detalhesMomentosEl) {
    detalhesMomentosEl.innerHTML = `${momentosCount} × R$ ${valorQuarto.toFixed(2)} = R$ ${totalMomentos.toFixed(2)}`;
  }
});

// -------------------------------
//   FINALIZAR PAGAMENTO
// -------------------------------
function finalizarPagamento() {

  if (quartoSelecionado === null) {
    alert("Selecione um quarto para finalizar o pagamento!");
    return;
  }

  // total atual mostrado (usar totalMomentos + valorConsumo)
  const total = (totalMomentos || valorQuarto) + (valorConsumo || 0);

  const pgDinheiro = parseFloat(document.getElementById("pgtoDinheiro").value) || 0;
  const pgPix = parseFloat(document.getElementById("pgtoPix").value) || 0;
  const pgCredito = parseFloat(document.getElementById("pgtoCredito").value) || 0;
  const pgDebito = parseFloat(document.getElementById("pgtoDebito").value) || 0;

  const somaPagamentos = pgDinheiro + pgPix + pgCredito + pgDebito;

  if (somaPagamentos < total) {
    alert("O valor pago está incompleto!");
    return;
  }

  const agora = new Date();
  const dataSaidaISO = agora.toISOString();

  const quartos = JSON.parse(localStorage.getItem("quartos")) || [];
  const entradas = JSON.parse(localStorage.getItem("entradasQuartos")) || {};
  const consumos = JSON.parse(localStorage.getItem("consumos")) || {};

  // Pegar data+hora da entrada
  const dataEntradaISO = entradas[quartoSelecionado];

  if (!dataEntradaISO) {
    alert("Erro: este quarto não possui hora de entrada registrada!");
    return;
  }

  // RECALCULAR momentos (garantia)
  const calc = calcularMomentosEValor(dataEntradaISO, dataSaidaISO, valorQuarto);
  momentosCount = calc.momentos;
  totalMomentos = calc.totalMomentos;

  // SALVAR NO RELATÓRIO (com campos de momentos)
  let relatorio = JSON.parse(localStorage.getItem("relatorio")) || [];

  const dataHoje = agora.toISOString().split("T")[0];
  const nomeQuarto = quartos[quartoSelecionado].nome;

  relatorio.push({
    quarto: nomeQuarto,
    data: dataHoje,
    horaEntrada: dataEntradaISO ? new Date(dataEntradaISO).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "",
    horaSaida: agora.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    dataEntradaISO: dataEntradaISO,
    dataSaidaISO: dataSaidaISO,
    periodo: `${horasEntre(dataEntradaISO, dataSaidaISO).toFixed(2)}h`,
    momentos: momentosCount,
    valorPorMomento: valorQuarto,
    totalMomentos: totalMomentos,
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
    const prod = produtos.find(p => p.nome === item.nome);
    if (prod) prod.quantidade = Math.max(0, prod.quantidade - 1);
  });
  localStorage.setItem("produtos", JSON.stringify(produtos));

  // Limpar consumo e resetar quarto
  consumos[quartoSelecionado] = [];
  localStorage.setItem("consumos", JSON.stringify(consumos));

  quartos[quartoSelecionado].status = "livre";
  localStorage.setItem("quartos", JSON.stringify(quartos));

  entradas[quartoSelecionado] = null;
  localStorage.setItem("entradasQuartos", JSON.stringify(entradas));

  alert("Pagamento finalizado com sucesso!");
  window.location.href = "relatorio.html";
}

// -------------------------------
carregarQuartosPagamento();
