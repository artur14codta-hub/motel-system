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

let registroAtualIndex = null;

// Função para carregar o relatório
function carregarRelatorio() {
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  relatorioTableBody.innerHTML = "";

  registros.forEach((registro, i) => {
    const horaEntrada = registro.horaEntrada || "--:--";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border px-2 py-1">${registro.quarto}</td>
      <td class="border px-2 py-1">${registro.data}</td>
      <td class="border px-2 py-1">${horaEntrada}</td>
      <td class="border px-2 py-1">${registro.horaSaida || "--:--"}</td>
      <td class="border px-2 py-1">${
        registro.consumos && registro.consumos.length > 0
          ? registro.consumos.map(c => `${c.nome} (R$ ${parseFloat(c.valor).toFixed(2)})`).join(", ")
          : "-"
      }</td>
      <td class="border px-2 py-1">R$ ${parseFloat(registro.valorQuarto).toFixed(2)}</td>
      <td class="border px-2 py-1 font-bold">R$ ${parseFloat(registro.total).toFixed(2)}</td>
      <td class="border px-2 py-1 flex gap-2">
        <button onclick="imprimirComprovante(${i})" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
          Imprimir
        </button>
        <button onclick="abrirModal(${i})" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded">
          Editar
        </button>
        <button onclick="apagarRegistro(${i})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">
          Apagar
        </button>
      </td>
    `;
    relatorioTableBody.appendChild(tr);
  });
}

// Filtrar por data
function filtrarPorData() {
  const dataSelecionada = filtroData.value;
  if (!dataSelecionada) return;

  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  const filtrados = registros.filter(r => r.data === dataSelecionada);

  relatorioTableBody.innerHTML = "";
  filtrados.forEach((registro, i) => {
    const horaEntrada = registro.horaEntrada || "--:--";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border px-2 py-1">${registro.quarto}</td>
      <td class="border px-2 py-1">${registro.data}</td>
      <td class="border px-2 py-1">${horaEntrada}</td>
      <td class="border px-2 py-1">${registro.horaSaida || "--:--"}</td>
      <td class="border px-2 py-1">${
        registro.consumos && registro.consumos.length > 0
          ? registro.consumos.map(c => `${c.nome} (R$ ${parseFloat(c.valor).toFixed(2)})`).join(", ")
          : "-"
      }</td>
      <td class="border px-2 py-1">R$ ${parseFloat(registro.valorQuarto).toFixed(2)}</td>
      <td class="border px-2 py-1 font-bold">R$ ${parseFloat(registro.total).toFixed(2)}</td>
      <td class="border px-2 py-1 flex gap-2">
        <button onclick="imprimirComprovante(${i})" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
          Imprimir
        </button>
        <button onclick="abrirModal(${i})" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded">
          Editar
        </button>
        <button onclick="apagarRegistro(${i})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">
          Apagar
        </button>
      </td>
    `;
    relatorioTableBody.appendChild(tr);
  });
}

// Limpar filtro
function limparFiltro() {
  filtroData.value = "";
  carregarRelatorio();
}

// Imprimir comprovante
function imprimirComprovante(index) {
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  const r = registros[index];
  const horaEntrada = r.horaEntrada || "--:--";

  const comprovante = window.open("", "Comprovante", "width=600,height=700");
  comprovante.document.write(`
    <html>
      <head><title>Comprovante</title></head>
      <body style="font-family: Arial; padding: 20px;">
        <h2 style="text-align: center;">Motel Maçã do Amor</h2>
        <p><strong>Quarto:</strong> ${r.quarto}</p>
        <p><strong>Data:</strong> ${r.data}</p>
        <p><strong>Entrada:</strong> ${horaEntrada}</p>
        <p><strong>Saída:</strong> ${r.horaSaida || "--:--"}</p>
        <h3>Consumos:</h3>
        <ul>${
          r.consumos && r.consumos.length > 0
            ? r.consumos.map(c => `<li>${c.nome} - R$ ${parseFloat(c.valor).toFixed(2)}</li>`).join("")
            : "<li>-</li>"
        }</ul>
        <p><strong>Valor do Quarto:</strong> R$ ${parseFloat(r.valorQuarto).toFixed(2)}</p>
        <p><strong>Total Pago:</strong> R$ ${parseFloat(r.total).toFixed(2)}</p>
        <br><p style="text-align: center;">Obrigado pela preferência!</p>
        <script>window.print();</script>
      </body>
    </html>
  `);
}

// Apagar registro
function apagarRegistro(index) {
  if (!confirm("Deseja realmente apagar este registro?")) return;

  let registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  registros.splice(index, 1);
  localStorage.setItem("relatorio", JSON.stringify(registros));
  carregarRelatorio();
}

// --- EDITAR COM MODAL ---
function abrirModal(index) {
  registroAtualIndex = index;
  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  const r = registros[index];

  editarQuarto.value = r.quarto;
  editarData.value = r.data;
  editarHoraEntrada.value = r.horaEntrada || "";
  editarHoraSaida.value = r.horaSaida || "";
  editarValorQuarto.value = r.valorQuarto;
  editarTotal.value = r.total;

  editarModal.classList.remove("hidden");
}

function fecharModal() {
  editarModal.classList.add("hidden");
}

// Salvar alterações do modal
editarForm.addEventListener("submit", function(e) {
  e.preventDefault();
  if (registroAtualIndex === null) return;

  const registros = JSON.parse(localStorage.getItem("relatorio")) || [];
  const r = registros[registroAtualIndex];

  r.quarto = editarQuarto.value;
  r.data = editarData.value;
  r.horaEntrada = editarHoraEntrada.value;
  r.horaSaida = editarHoraSaida.value;
  r.valorQuarto = parseFloat(editarValorQuarto.value) || 0;
  r.total = parseFloat(editarTotal.value) || 0;

  localStorage.setItem("relatorio", JSON.stringify(registros));
  carregarRelatorio();
  fecharModal();
});

// Inicializa
carregarRelatorio();
