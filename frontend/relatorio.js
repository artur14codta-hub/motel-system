const GERENTE_SENHA = "1205";

const relatorioTableBody = document.getElementById("relatorioTableBody");
const filtroData = document.getElementById("filtroData");

// Modal e campos
const editarModal = document.getElementById("editarModal");
const editarForm = document.getElementById("editarForm");
const editarQuarto = document.getElementById("editarQuarto");
const editarData = document.getElementById("editarData");
const editarHoraEntrada = document.getElementById("editarHoraEntrada");
const editarHoraSaida = document.getElementById("editarHoraSaida");
const editarValorQuarto = document.getElementById("editarValorQuarto");
const editarTotal = document.getElementById("editarTotal");
const editarPagamentos = document.getElementById("editarPagamentos");

// Modal de senha
const modalSenhaGerente = document.getElementById("modalSenhaGerente");
const inputSenhaModal = document.getElementById("inputSenhaModal");
const erroSenha = document.getElementById("erroSenha");

let registroAtualIndex = null;
let acaoPendente = null;

// ---------- Função NOVA — mostra SOMENTE o horário ----------
function formatarHora(horaString) {
  if (!horaString) return "--:--";
  // garantia: remove espaços, valida formato simples HH:MM ou HH:MM:SS
  return horaString.trim();
}

// ---------- Atualiza faturamento ----------
function atualizarFaturamento(registros) {
  let total = 0;
  registros.forEach(r => {
    total += parseFloat(r.total || 0);
  });
  document.getElementById("faturamentoRelatorio").textContent = `R$ ${total.toFixed(2)}`;
}

// ---------- Carrega relatório ----------
function carregarRelatorio() {
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];

  registros.sort((a,b)=>{
    const dataA = new Date(`${a.data} ${a.horaSaida || "00:00"}`);
    const dataB = new Date(`${b.data} ${b.horaSaida || "00:00"}`);
    return dataB - dataA;
  });

  relatorioTableBody.innerHTML = "";

  registros.forEach((r,i)=>{
    const horaEntrada = formatarHora(r.horaEntrada);
    const horaSaida = formatarHora(r.horaSaida);

    const formaPagamentoTexto = r.pagamentos
      ? r.pagamentos.map(p => `${p.tipo} R$ ${parseFloat(p.valor).toFixed(2)}`).join("<br>")
      : "-";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border px-2 py-1">${r.quarto}</td>
      <td class="border px-2 py-1">${r.data}</td>
      <td class="border px-2 py-1">${horaEntrada}</td>
      <td class="border px-2 py-1">${horaSaida}</td>
      <td class="border px-2 py-1">${
        r.consumos && r.consumos.length>0
          ? r.consumos.map(c=>`${c.nome} (R$ ${parseFloat(c.valor).toFixed(2)})`).join(", ")
          : "-"
      }</td>
      <td class="border px-2 py-1">R$ ${parseFloat(r.valorQuarto).toFixed(2)}</td>
      <td class="border px-2 py-1">${formaPagamentoTexto}</td>
      <td class="border px-2 py-1 font-bold">R$ ${parseFloat(r.total).toFixed(2)}</td>
      <td class="border px-2 py-1 flex gap-2">
        <button onclick="imprimirComprovante(${i})" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Imprimir</button>
        <button onclick="pedirSenhaGerente('editar', ${i})" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded">Editar</button>
        <button onclick="pedirSenhaGerente('apagar', ${i})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Apagar</button>
      </td>
    `;
    relatorioTableBody.appendChild(tr);
  });

  atualizarFaturamento(registros);
}

// ---------- Filtrar por data ----------
function filtrarPorData() {
  const dataSelecionada = filtroData.value;

  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];

  if(!dataSelecionada) return carregarRelatorio();

  const filtrados = registros.filter(r=>r.data === dataSelecionada);

  relatorioTableBody.innerHTML = "";

  filtrados.forEach((r,i)=>{
    const horaEntrada = formatarHora(r.horaEntrada);
    const horaSaida = formatarHora(r.horaSaida);

    const formaPagamentoTexto = r.pagamentos
      ? r.pagamentos.map(p => `${p.tipo} R$ ${parseFloat(p.valor).toFixed(2)}`).join("<br>")
      : "-";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border px-2 py-1">${r.quarto}</td>
      <td class="border px-2 py-1">${r.data}</td>
      <td class="border px-2 py-1">${horaEntrada}</td>
      <td class="border px-2 py-1">${horaSaida}</td>
      <td class="border px-2 py-1">${
        r.consumos && r.consumos.length>0
          ? r.consumos.map(c=>`${c.nome} (R$ ${parseFloat(c.valor).toFixed(2)})`).join(", ")
          : "-"
      }</td>
      <td class="border px-2 py-1">R$ ${parseFloat(r.valorQuarto).toFixed(2)}</td>
      <td class="border px-2 py-1">${formaPagamentoTexto}</td>
      <td class="border px-2 py-1 font-bold">R$ ${parseFloat(r.total).toFixed(2)}</td>
      <td class="border px-2 py-1 flex gap-2">
        <button onclick="imprimirComprovante(${i})" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Imprimir</button>
        <button onclick="pedirSenhaGerente('editar', ${i})" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded">Editar</button>
        <button onclick="pedirSenhaGerente('apagar', ${i})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Apagar</button>
      </td>
    `;
    relatorioTableBody.appendChild(tr);
  });

  atualizarFaturamento(filtrados);
}

// ---------- Limpar filtro ----------
function limparFiltro() {
  filtroData.value = "";
  carregarRelatorio();
}

// ---------- Modal de senha ----------
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

// ---------- Editar ----------
function abrirModal(index){
  registroAtualIndex = index;
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  const r = registros[index];

  editarQuarto.value = r.quarto;
  editarData.value = r.data;
  editarHoraEntrada.value = r.horaEntrada || "";
  editarHoraSaida.value = r.horaSaida || "";
  editarValorQuarto.value = r.valorQuarto;
  editarTotal.value = r.total;
  editarPagamentos.value = r.pagamentos
    ? r.pagamentos.map(p=>`${p.tipo} ${p.valor}`).join(", ")
    : "";

  editarModal.classList.remove("hidden");
}

function fecharModal() {
  editarModal.classList.add("hidden");
}

editarForm.addEventListener("submit", e=>{
  e.preventDefault();
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  const r = registros[registroAtualIndex];

  r.quarto = editarQuarto.value;
  r.data = editarData.value;
  r.horaEntrada = editarHoraEntrada.value;
  r.horaSaida = editarHoraSaida.value;
  r.valorQuarto = parseFloat(editarValorQuarto.value) || 0;
  r.total = parseFloat(editarTotal.value) || 0;

  const pagamentosRaw = editarPagamentos.value.split(",");
  r.pagamentos = pagamentosRaw.map(p=>{
    const [tipo, valor] = p.trim().split(" ");
    return { tipo, valor: parseFloat(valor) || 0 };
  });

  localStorage.setItem("relatorio", JSON.stringify(registros));
  carregarRelatorio();
  fecharModal();
  alert("Registro atualizado com sucesso!");
});

// ---------- Apagar ----------
function apagarRegistroConfirmado(index){
  let registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  if(!confirm("Deseja realmente apagar este registro?")) return;
  registros.splice(index,1);
  localStorage.setItem("relatorio", JSON.stringify(registros));
  carregarRelatorio();
  alert("Registro removido com sucesso!");
}

// ---------- Imprimir ----------
function imprimirComprovante(index){
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  const r = registros[index];

  const horaEntrada = formatarHora(r.horaEntrada);
  const horaSaida = formatarHora(r.horaSaida);

  const formaPagamentoTexto = r.pagamentos
    ? r.pagamentos.map(p=>`${p.tipo} - R$ ${parseFloat(p.valor).toFixed(2)}`).join("<br>")
    : "-";

  const win = window.open("", "Comprovante", "width=600,height=700");
  win.document.write(`
    <html>
    <head><title>Comprovante</title></head>
    <body style="font-family: Arial; padding: 20px;">
      <h2 style="text-align: center;">Motel Maçã do Amor</h2>
      <p><strong>Quarto:</strong> ${r.quarto}</p>
      <p><strong>Data:</strong> ${r.data}</p>
      <p><strong>Entrada:</strong> ${horaEntrada}</p>
      <p><strong>Saída:</strong> ${horaSaida}</p>
      <h3>Consumos:</h3>
      <ul>${
        r.consumos && r.consumos.length>0
          ? r.consumos.map(c=>`<li>${c.nome} - R$ ${parseFloat(c.valor).toFixed(2)}</li>`).join("")
          : "<li>-</li>"
      }</ul>
      <p><strong>Valor do Quarto:</strong> R$ ${parseFloat(r.valorQuarto).toFixed(2)}</p>
      <h3>Forma de Pagamento:</h3>
      <ul>${formaPagamentoTexto}</ul>
      <p><strong>Total Pago:</strong> R$ ${parseFloat(r.total).toFixed(2)}</p>
      <br><p style="text-align: center;">Obrigado pela preferência!</p>
      <script>window.print();</script>
    </body></html>
  `);
}

// ---------- Inicialização ----------
carregarRelatorio();
