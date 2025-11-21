// ===============================
//          CAIXA.JS
// ===============================

// CONSTANTES
const GERENTE_SENHA = "1205";

// ELEMENTOS HTML
const btnAbrirCaixa = document.getElementById("btnAbrirCaixa");
const btnFecharCaixa = document.getElementById("btnFecharCaixa");

const modalAbertura = document.getElementById("modalAbertura");
const modalFechamento = document.getElementById("modalFechamento");

const nomeFuncionarioEl = document.getElementById("nomeFuncionario");
const valorAberturaInput = document.getElementById("valorAbertura");
const valorFechamentoInput = document.getElementById("valorFechamento");

const cancelarAberturaBtn = document.getElementById("cancelarAbertura");
const confirmarAberturaBtn = document.getElementById("confirmarAbertura");

const fecharModalFechamentoBtn = document.getElementById("fecharModalFechamento");
const confirmarFechamentoBtn = document.getElementById("confirmarFechamento");

const totalEntrouSpan = document.getElementById("totalEntrouSpan");
const diferencaResultado = document.getElementById("diferencaResultado");

const tabelaCaixa = document.getElementById("tabelaCaixa");

// Modal gerente
const modalSenhaGerente = document.getElementById("modalSenhaGerente");
const inputSenhaModal = document.getElementById("inputSenhaModal");
const erroSenha = document.getElementById("erroSenha");

// Variáveis controle
let acaoPendente = null;
let registroAtualIndex = null;

// ===============================
// HELPER FUNCTIONS
// ===============================
function formatCurrencyBR(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ===============================
// CARREGAR PÁGINA
// ===============================
window.addEventListener("load", () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario) {
        alert("Faça login novamente!");
        window.location.href = "login.html";
        return;
    }
    nomeFuncionarioEl.innerText = usuario.nome;

    const caixaAtual = JSON.parse(localStorage.getItem("caixaAtual"));
    btnAbrirCaixa.disabled = !!caixaAtual;
    btnFecharCaixa.disabled = !caixaAtual;

    atualizarEntrada();
    carregarTabela();
});

// ===============================
// ABRIR / FECHAR CAIXA
// ===============================
btnAbrirCaixa.addEventListener("click", () => {
    const caixasFechados = JSON.parse(localStorage.getItem("caixasFechados")) || [];
    const ultimo = caixasFechados[caixasFechados.length - 1];
    valorAberturaInput.value = ultimo ? ultimo.valorFechamento.toFixed(2) : "";
    modalAbertura.classList.remove("hidden");
});

cancelarAberturaBtn.addEventListener("click", () => modalAbertura.classList.add("hidden"));

confirmarAberturaBtn.addEventListener("click", () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    const valorAbertura = parseFloat(valorAberturaInput.value);
    if (isNaN(valorAbertura) || valorAbertura < 0) return alert("Digite um valor válido!");
    if (localStorage.getItem("caixaAtual")) return alert("Já existe um caixa aberto!");

    const agora = new Date();
    const caixa = {
        funcionario: usuario.nome,
        dataAbertura: agora.toLocaleDateString("pt-BR"),
        horaAbertura: agora.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
        valorAbertura: Number(valorAbertura),
        totalEntrou: 0
    };
    localStorage.setItem("caixaAtual", JSON.stringify(caixa));
    modalAbertura.classList.add("hidden");
    location.reload();
});

btnFecharCaixa.addEventListener("click", () => {
    const caixa = JSON.parse(localStorage.getItem("caixaAtual"));
    if (!caixa) return alert("Nenhum caixa aberto!");

    atualizarEntrada();

    const caixaAtualizado = JSON.parse(localStorage.getItem("caixaAtual"));
    totalEntrouSpan.textContent = formatCurrencyBR(caixaAtualizado.totalEntrou);
    valorFechamentoInput.value = "";
    diferencaResultado.textContent = "R$ 0,00";
    modalFechamento.classList.remove("hidden");
});

fecharModalFechamentoBtn.addEventListener("click", () => modalFechamento.classList.add("hidden"));

valorFechamentoInput.addEventListener("input", () => {
    const caixa = JSON.parse(localStorage.getItem("caixaAtual"));
    if (!caixa) return;
    const contado = parseFloat(valorFechamentoInput.value || 0);
    const esperado = caixa.valorAbertura + (caixa.totalEntrou || 0);
    const dif = contado - esperado;
    diferencaResultado.textContent = (dif >= 0 ? "+ " : "- ") + formatCurrencyBR(Math.abs(dif));
});

confirmarFechamentoBtn.addEventListener("click", () => {
    const caixa = JSON.parse(localStorage.getItem("caixaAtual"));
    if (!caixa) return alert("Nenhum caixa aberto!");

    const valorContado = parseFloat(valorFechamentoInput.value);
    if (isNaN(valorContado)) return alert("Digite o valor contado!");

    const totalEsperado = caixa.valorAbertura + (caixa.totalEntrou || 0);
    const diferenca = valorContado - totalEsperado;

    const agora = new Date();
    const fechamento = {
        funcionario: caixa.funcionario,
        dataAbertura: caixa.dataAbertura,
        horaAbertura: caixa.horaAbertura,
        valorAbertura: caixa.valorAbertura,
        totalEntrou: caixa.totalEntrou || 0,
        valorFechamento: Number(valorContado),
        dataFechamento: agora.toLocaleDateString("pt-BR"),
        horaFechamento: agora.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
        diferenca: Number(diferenca)
    };
    const historico = JSON.parse(localStorage.getItem("caixasFechados")) || [];
    historico.push(fechamento);
    localStorage.setItem("caixasFechados", JSON.stringify(historico));
    localStorage.removeItem("caixaAtual");
    modalFechamento.classList.add("hidden");
    location.reload();
});

// ===============================
// CALCULAR ENTRADA
// ===============================
function atualizarEntrada() {
    const caixa = JSON.parse(localStorage.getItem("caixaAtual"));
    if (!caixa) return;

    const relatorio = JSON.parse(localStorage.getItem("relatorio")) || [];
    let totalDinheiro = 0;
    relatorio.forEach(item => {
        if (!item.pagamentos) return;
        item.pagamentos.forEach(pag => {
            if (pag.tipo === "Dinheiro") totalDinheiro += Number(pag.valor) || 0;
        });
    });
    caixa.totalEntrou = totalDinheiro;
    localStorage.setItem("caixaAtual", JSON.stringify(caixa));
}

// ===============================
// MODAL SENHA GERENTE
// ===============================
function pedirSenhaGerente(acao, index){
  acaoPendente = acao;
  registroAtualIndex = index;
  modalSenhaGerente.classList.remove("hidden");
  inputSenhaModal.value = "";
  erroSenha.classList.add("hidden");
}

function verificarSenhaGerente(){
  if(inputSenhaModal.value === GERENTE_SENHA){
    modalSenhaGerente.classList.add("hidden");
    if(acaoPendente==="editar") abrirModalEditar(registroAtualIndex);
    else if(acaoPendente==="apagar") apagarRegistroConfirmado(registroAtualIndex);
  } else {
    erroSenha.classList.remove("hidden");
  }
}

function fecharModalSenha(){
  modalSenhaGerente.classList.add("hidden");
  erroSenha.classList.add("hidden");
}

// ===============================
// TABELA
// ===============================
function carregarTabela() {
    tabelaCaixa.innerHTML = "";

    const caixaAtual = JSON.parse(localStorage.getItem("caixaAtual"));
    if (caixaAtual) {
        const trAtual = document.createElement("tr");
        trAtual.innerHTML = `
            <td class="border px-2 py-1">${caixaAtual.funcionario}</td>
            <td class="border px-2 py-1">${caixaAtual.dataAbertura}</td>
            <td class="border px-2 py-1">${caixaAtual.horaAbertura}</td>
            <td class="border px-2 py-1">${formatCurrencyBR(caixaAtual.valorAbertura)}</td>
            <td class="border px-2 py-1">${formatCurrencyBR(caixaAtual.totalEntrou)}</td>
            <td class="border px-2 py-1"></td>
            <td class="border px-2 py-1"></td>
            <td class="border px-2 py-1"></td>
            <td class="border px-2 py-1"></td>
            <td class="border px-2 py-1 text-sm text-gray-600">Somente fechamento</td>
        `;
        tabelaCaixa.appendChild(trAtual);
    }

    const historico = JSON.parse(localStorage.getItem("caixasFechados")) || [];
    historico.forEach((c, index) => {
        const tr = document.createElement("tr");
        const difFormat = (c.diferenca >= 0 ? "+ " : "- ") + formatCurrencyBR(Math.abs(c.diferenca || 0));

        tr.innerHTML = `
            <td class="border px-2 py-1">${c.funcionario}</td>
            <td class="border px-2 py-1">${c.dataAbertura}</td>
            <td class="border px-2 py-1">${c.horaAbertura}</td>
            <td class="border px-2 py-1">${formatCurrencyBR(c.valorAbertura)}</td>
            <td class="border px-2 py-1">${formatCurrencyBR(c.totalEntrou)}</td>
            <td class="border px-2 py-1">${formatCurrencyBR(c.valorFechamento)}</td>
            <td class="border px-2 py-1">${c.dataFechamento}</td>
            <td class="border px-2 py-1">${c.horaFechamento}</td>
            <td class="border px-2 py-1">${difFormat}</td>
            <td class="border px-2 py-1 flex justify-center gap-2">
                <button class="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700" onclick="pedirSenhaGerente('editar', ${index})">Editar</button>
                <button class="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700" onclick="pedirSenhaGerente('apagar', ${index})">Apagar</button>
            </td>
        `;
        tabelaCaixa.appendChild(tr);
    });
}

// ===============================
// FUNÇÕES DE EDITAR / APAGAR
// ===============================
function abrirModalEditar(index) {
    const historico = JSON.parse(localStorage.getItem("caixasFechados")) || [];
    const registro = historico[index];
    const novoValorAbertura = prompt("Valor Abertura:", registro.valorAbertura);
    if (novoValorAbertura !== null) registro.valorAbertura = Number(novoValorAbertura);

    const novoEntrou = prompt("Entrou (Dinheiro):", registro.totalEntrou);
    if (novoEntrou !== null) registro.totalEntrou = Number(novoEntrou);

    const novoValorFechamento = prompt("Valor Fechamento:", registro.valorFechamento);
    if (novoValorFechamento !== null) registro.valorFechamento = Number(novoValorFechamento);

    registro.diferenca = registro.valorFechamento - (registro.valorAbertura + registro.totalEntrou);

    historico[index] = registro;
    localStorage.setItem("caixasFechados", JSON.stringify(historico));
    carregarTabela();
}

function apagarRegistroConfirmado(index) {
    const historico = JSON.parse(localStorage.getItem("caixasFechados")) || [];
    historico.splice(index, 1);
    localStorage.setItem("caixasFechados", JSON.stringify(historico));
    carregarTabela();
}
