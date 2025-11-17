const GERENTE_SENHA = "1205";

const relatorioTableBody = document.getElementById("relatorioTableBody");
const filtroData = document.getElementById("filtroData");

// Modal e campos
const editarModal = document.getElementById("editarModal");
const editarForm = document.getElementById("editarForm");
const editarQuarto = document.getElementById("editarQuarto");
const editarData = document.getElementById("editarData");
const editarHoraEntrada = document.getElementById("editarHoraEntrada");
const editarDataSaida = document.getElementById("editarDataSaida");
const editarHoraSaida = document.getElementById("editarHoraSaida");
const editarValorQuarto = document.getElementById("editarValorQuarto");
const editarTotal = document.getElementById("editarTotal");
const editarPagamentos = document.getElementById("editarPagamentos");
const editarPeriodos = document.getElementById("editarPeriodos");

// Modal de senha
const modalSenhaGerente = document.getElementById("modalSenhaGerente");
const inputSenhaModal = document.getElementById("inputSenhaModal");
const erroSenha = document.getElementById("erroSenha");

let registroAtualIndex = null;
let acaoPendente = null;

function formatarHora(horaString) {
  if (!horaString) return "--:--";
  return horaString.trim();
}

function atualizarFaturamento(registros) {
  let total = 0;
  registros.forEach(r => {
    total += parseFloat(r.total || 0);
  });
  document.getElementById("faturamentoRelatorio").textContent = `R$ ${total.toFixed(2)}`;
}

// Agrupar consumos repetidos
function formatarConsumos(consumos) {
  if (!consumos || consumos.length === 0) return "-";
  const mapa = {};
  consumos.forEach(c => {
    const nome = c.nome || "Item";
    const valor = parseFloat(c.valor || 0);
    const chave = `${nome}|${valor.toFixed(2)}`;
    if (!mapa[chave]) mapa[chave] = { nome, valor, quantidade: 1 };
    else mapa[chave].quantidade++;
  });
  return Object.values(mapa).map(item => {
    const total = item.valor * item.quantidade;
    return item.quantidade > 1
      ? `${item.nome} ${item.quantidade}x = R$ ${total.toFixed(2)}`
      : `${item.nome} - R$ ${item.valor.toFixed(2)}`;
  }).join(", ");
}

function montarLinhaRelatorio(r, i) {
  const horaEntrada = formatarHora(r.horaEntrada || "--:--");
  const horaSaida = formatarHora(r.horaSaida || "--:--");
  const dataSaida = r.dataSaida || r.data;

  const consumosTexto = formatarConsumos(r.consumos);

  const momentosTexto = r.momentos ? `${r.momentos} momento${r.momentos > 1 ? 's' : ''}` : '1 momento';

  const formaPagamentoTexto = r.pagamentos
    ? r.pagamentos.map(p => `${p.tipo} R$ ${parseFloat(p.valor).toFixed(2)}`).join(", ")
    : "-";

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td class="border px-2 py-1">${r.quarto}</td>
    <td class="border px-2 py-1">${r.data}</td>
    <td class="border px-2 py-1">${horaEntrada}</td>
    <td class="border px-2 py-1">${dataSaida}</td>
    <td class="border px-2 py-1">${horaSaida}</td>
    <td class="border px-2 py-1">${consumosTexto}</td>
    <td class="border px-2 py-1">R$ ${parseFloat(r.valorPorMomento || r.valorQuarto || 0).toFixed(2)}</td>
    <td class="border px-2 py-1">${formaPagamentoTexto}</td>
    <td class="border px-2 py-1">${momentosTexto}</td>
    <td class="border px-2 py-1 font-bold">R$ ${parseFloat(r.total).toFixed(2)}</td>
    <td class="border px-2 py-1 flex gap-2">
      <button onclick="imprimirComprovante(${i})" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Imprimir</button>
      <button onclick="pedirSenhaGerente('editar', ${i})" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded">Editar</button>
      <button onclick="pedirSenhaGerente('apagar', ${i})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Apagar</button>
    </td>
  `;
  return tr;
}

function carregarRelatorio() {
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  registros.sort((a,b)=>{
    const dataA = new Date(`${a.data} ${a.horaSaida || "00:00"}`);
    const dataB = new Date(`${b.data} ${b.horaSaida || "00:00"}`);
    return dataB - dataA;
  });
  relatorioTableBody.innerHTML = "";
  registros.forEach((r,i)=>{
    relatorioTableBody.appendChild(montarLinhaRelatorio(r,i));
  });
  atualizarFaturamento(registros);
}

function filtrarPorData() {
  const dataSelecionada = filtroData.value;
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  const filtrados = dataSelecionada ? registros.filter(r=>r.data===dataSelecionada) : registros;
  relatorioTableBody.innerHTML = "";
  filtrados.forEach((r,i)=>relatorioTableBody.appendChild(montarLinhaRelatorio(r,i)));
  atualizarFaturamento(filtrados);
}

function limparFiltro() {
  filtroData.value = "";
  carregarRelatorio();
}

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
    if(acaoPendente==="editar") abrirModal(registroAtualIndex);
    else if(acaoPendente==="apagar") apagarRegistroConfirmado(registroAtualIndex);
  } else {
    erroSenha.classList.remove("hidden");
  }
}

function fecharModalSenha(){
  modalSenhaGerente.classList.add("hidden");
  erroSenha.classList.add("hidden");
}

function abrirModal(index){
  registroAtualIndex = index;
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  const r = registros[index];

  editarQuarto.value = r.quarto;
  editarData.value = r.data;
  editarHoraEntrada.value = r.horaEntrada || "";
  editarDataSaida.value = r.dataSaida || r.data;
  editarHoraSaida.value = r.horaSaida || "";
  editarValorQuarto.value = r.valorPorMomento || r.valorQuarto || 0;
  editarTotal.value = r.total;
  editarPagamentos.value = r.pagamentos ? r.pagamentos.map(p=>`${p.tipo} ${p.valor}`).join(", ") : "";
  editarPeriodos.value = r.momentos || 1;

  editarModal.classList.remove("hidden");
}

function fecharModal() {
  editarModal.classList.add("hidden");
}

editarForm.addEventListener("submit", e=>{
  e.preventDefault();
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  const r = registros[registroAtualIndex];

  // Só atualiza Pagamentos, Consumos e Total
  r.pagamentos = editarPagamentos.value.split(",").map(p=>{
    const [tipo, valor] = p.trim().split(" ");
    return { tipo, valor: parseFloat(valor) || 0 };
  });
  r.total = parseFloat(editarTotal.value) || 0;

  localStorage.setItem("relatorio", JSON.stringify(registros));
  carregarRelatorio();
  fecharModal();
  alert("Registro atualizado com sucesso!");
});

function apagarRegistroConfirmado(index){
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  if(!confirm("Deseja realmente apagar este registro?")) return;
  registros.splice(index,1);
  localStorage.setItem("relatorio", JSON.stringify(registros));
  carregarRelatorio();
  alert("Registro removido com sucesso!");
}

function imprimirComprovante(index){
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  const r = registros[index];

  const horaEntrada = formatarHora(r.horaEntrada || "--:--");
  const horaSaida = formatarHora(r.horaSaida || "--:--");
  const dataSaida = r.dataSaida || r.data;
  const consumosLinha = formatarConsumos(r.consumos);
  const formaPagamentoTexto = r.pagamentos
    ? r.pagamentos.map(p=>`${p.tipo} - R$ ${parseFloat(p.valor).toFixed(2)}`).join("<br>")
    : "-";
  const momentosTexto = r.momentos ? `${r.momentos} momento${r.momentos>1?'s':''}` : '1 momento';

  const win = window.open("", "Comprovante", "width=600,height=700");
  win.document.write(`
    <html>
    <head><title>Comprovante</title></head>
    <body style="font-family: Arial; padding: 20px;">
      <h2 style="text-align: center;">Motel Maçã do Amor</h2>
      <p><strong>Quarto:</strong> ${r.quarto}</p>
      <p><strong>Data Entrada:</strong> ${r.data}</p>
      <p><strong>Hora Entrada:</strong> ${horaEntrada}</p>
      <p><strong>Data Saída:</strong> ${dataSaida}</p>
      <p><strong>Hora Saída:</strong> ${horaSaida}</p>

      <h3>Consumos:</h3>
      <p>${consumosLinha}</p>

      <p><strong>Valor Quarto:</strong> R$ ${parseFloat(r.valorPorMomento || r.valorQuarto || 0).toFixed(2)}</p>
      <p><strong>Períodos:</strong> ${momentosTexto}</p>
      <p style="font-weight: bold;"><strong>Total Pago:</strong> R$ ${parseFloat(r.total).toFixed(2)}</p>

      <h3>Forma de Pagamento:</h3>
      <ul>${formaPagamentoTexto}</ul>

      <br><p style="text-align: center;">Obrigado pela preferência!</p>
      <script>window.print();</script>
    </body></html>
  `);
}

// Inicialização
carregarRelatorio();
