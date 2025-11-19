// =========================
//       CAIXA.JS
// =========================

// Função auxiliar para garantir que valores sejam números válidos
function toFloat(valor) {
  const num = parseFloat(valor);
  return isNaN(num) ? 0 : num;
}

// =========================
//   CARREGA CAIXAS
// =========================
function carregarCaixas() {
  const tabela = document.getElementById("tabelaCaixa");
  const caixas = JSON.parse(localStorage.getItem("caixas")) || [];

  tabela.innerHTML = caixas.map(c => {
    const diff = (c.valorFechamento - (c.valorAbertura + c.totalEntrou)).toFixed(2);
    const diffClass = diff == 0 ? "text-green-600" : diff > 0 ? "text-orange-500" : "text-red-600";

    return `
      <tr class="border-b">
        <td class="p-2">${c.funcionario}</td>
        <td class="p-2">${c.dataAbertura}</td>
        <td class="p-2">${c.horaAbertura}</td>
        <td class="p-2">R$ ${c.valorAbertura.toFixed(2)}</td>
        <td class="p-2 text-blue-700 font-bold">R$ ${c.totalEntrou.toFixed(2)}</td>
        <td class="p-2">R$ ${c.valorFechamento.toFixed(2)}</td>
        <td class="p-2">${c.dataFechamento || "-"}</td>
        <td class="p-2">${c.horaFechamento || "-"}</td>
        <td class="p-2 font-bold ${diffClass}">R$ ${diff}</td>
      </tr>
    `;
  }).join('');
}

// =========================
//      ABRIR CAIXA
// =========================
function abrirCaixa(funcionario, valorAbertura) {
  const valor = toFloat(valorAbertura);
  if (valor < 0) {
    alert("Valor de abertura inválido");
    return;
  }

  const agora = new Date();
  const novoCaixa = {
    funcionario,
    dataAbertura: agora.toLocaleDateString("pt-BR"),
    horaAbertura: agora.toLocaleTimeString("pt-BR"),
    valorAbertura: valor,
    totalEntrou: 0,
    valorFechamento: 0,
    dataFechamento: null,
    horaFechamento: null
  };

  localStorage.setItem("caixaAtual", JSON.stringify(novoCaixa));
  alert("Caixa aberto com sucesso!");
}

// =========================
//  REGISTRAR ENTRADA DINHEIRO
// =========================
function registrarEntradaDinheiro(valor) {
  const caixaAtual = JSON.parse(localStorage.getItem("caixaAtual"));
  if (!caixaAtual) {
    alert("Nenhum caixa aberto.");
    return;
  }

  caixaAtual.totalEntrou += toFloat(valor);
  localStorage.setItem("caixaAtual", JSON.stringify(caixaAtual));
}

// =========================
//       FECHAR CAIXA
// =========================
function fecharCaixa(valorFechamento) {
  const caixaAtual = JSON.parse(localStorage.getItem("caixaAtual"));
  if (!caixaAtual) {
    alert("Nenhum caixa aberto.");
    return;
  }

  const valor = toFloat(valorFechamento);
  if (valor < 0) {
    alert("Valor de fechamento inválido");
    return;
  }

  const agora = new Date();
  caixaAtual.valorFechamento = valor;
  caixaAtual.dataFechamento = agora.toLocaleDateString("pt-BR");
  caixaAtual.horaFechamento = agora.toLocaleTimeString("pt-BR");

  // Salva no histórico
  const caixas = JSON.parse(localStorage.getItem("caixas")) || [];
  caixas.push(caixaAtual);

  localStorage.setItem("caixas", JSON.stringify(caixas));
  localStorage.removeItem("caixaAtual");

  carregarCaixas(); // Atualiza tabela automaticamente
  alert("Caixa fechado com sucesso!");
}

// =========================
//   INICIALIZAÇÃO
// =========================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("tabelaCaixa")) {
    carregarCaixas();
  }
});
