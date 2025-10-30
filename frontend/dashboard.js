// Atualiza a data atual
function atualizarData() {
  const data = new Date();
  const opcoes = { day: '2-digit', month: 'long', year: 'numeric' };
  document.getElementById('dataAtual').textContent = "📅 " + data.toLocaleDateString('pt-BR', opcoes);
}

// Calcula os dados do Dashboard
function calcularDashboard() {
  let faturamentoDia = 0;
  let consumoTotal = 0;
  let ocupados = 0;

  // Quartos
  const quartos = JSON.parse(localStorage.getItem('quartos')) || [];
  ocupados = quartos.filter(q => q.status === 'ocupado').length;

  // Consumo
  const consumos = JSON.parse(localStorage.getItem('consumo')) || [];
  consumoTotal = consumos.reduce((total, c) => total + (parseFloat(c.valor) || 0), 0);

  // Pagamentos do dia
  const pagamentos = JSON.parse(localStorage.getItem('pagamentos')) || [];
  const hoje = new Date().toLocaleDateString('pt-BR');
  pagamentos.forEach(p => {
    if (p.data === hoje) faturamentoDia += parseFloat(p.valor);
  });

  // Atualiza na tela
  document.getElementById('faturamentoDia').textContent = `R$ ${faturamentoDia.toFixed(2)}`;
  document.getElementById('consumoTotal').textContent = `R$ ${consumoTotal.toFixed(2)}`;
  document.getElementById('qtdOcupados').textContent = ocupados;
}

// Função para gerar relatório
function gerarRelatorioDia() {
  alert("📊 Função de geração de relatório será implementada aqui!");
}

// Inicialização
window.addEventListener('load', () => {
  atualizarData();
  calcularDashboard();
  setInterval(calcularDashboard, 30000); // atualiza a cada 30s
});
