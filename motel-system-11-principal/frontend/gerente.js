// Senha do gerente (você pode alterar)
const senhaGerente = "12345"; 

// Função para abrir modal
function abrirModalSenha(callbackFunc) {
  window.callbackGerente = callbackFunc; // função que será executada se senha correta
  document.getElementById("inputSenhaModal").value = "";
  document.getElementById("erroSenha").classList.add("hidden");
  document.getElementById("modalSenhaGerente").classList.remove("hidden");
}

// Função para fechar modal
function fecharModalSenha() {
  document.getElementById("modalSenhaGerente").classList.add("hidden");
  window.callbackGerente = null;
}

// Verificar senha
function verificarSenhaGerente() {
  const senha = document.getElementById("inputSenhaModal").value;
  if(senha === senhaGerente) {
    if(window.callbackGerente) window.callbackGerente();
    fecharModalSenha();
  } else {
    document.getElementById("erroSenha").classList.remove("hidden");
  }
}
