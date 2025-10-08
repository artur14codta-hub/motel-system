// ======================


// ===== LOGIN =====
const loginForm = document.querySelector('form');
if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const senhaField = document.getElementById('senha');
    const senha = senhaField ? senhaField.value.trim() : null;

    if (senha !== null) {
      if (email === '' || senha === '') {
        alert('Preencha todos os campos');
        return;
      }
      alert('Login realizado com sucesso!');
      window.location.href = 'index.html';
    } else {
      if (email === '') {
        alert('Informe seu e-mail');
        return;
      }
      alert('Código enviado para o seu e-mail (simulado)');
      window.location.href = 'login.html';
    }
  });
}

// ===== MODAL DE SENHA GERENTE =====
const GERENTE_SENHA = "1205";

// Função para abrir o modal e retornar uma Promise
function abrirModalSenhaInicial() {
  const modal = document.getElementById("modalSenhaGerente");
  const inputSenha = document.getElementById("inputSenhaModal");
  const btnConfirmar = modal.querySelector("button.bg-green-600");
  const btnCancelar = modal.querySelector("button.bg-gray-500");
  const erroMsg = document.getElementById("erroSenha");

  return new Promise((resolve) => {
    modal.classList.remove("hidden");
    inputSenha.value = "";
    inputSenha.focus();
    erroMsg.classList.add("hidden");

    function confirmarHandler() {
      if (inputSenha.value === GERENTE_SENHA) {
        fechar();
        resolve(true);
      } else {
        erroMsg.classList.remove("hidden");
        inputSenha.value = "";
        inputSenha.focus();
      }
    }

    function cancelarHandler() {
      fechar();
      resolve(false);
    }

    function escHandler(e) {
      if (e.key === "Escape") cancelarHandler();
    }

    function fechar() {
      modal.classList.add("hidden");
      btnConfirmar.removeEventListener("click", confirmarHandler);
      btnCancelar.removeEventListener("click", cancelarHandler);
      window.removeEventListener("keydown", escHandler);
    }

    btnConfirmar.addEventListener("click", confirmarHandler);
    btnCancelar.addEventListener("click", cancelarHandler);
    window.addEventListener("keydown", escHandler);
  });
}

// ===== FUNCIONÁRIOS =====
const cadastroForm = document.getElementById('cadastroForm');
const funcionariosTableBody = document.getElementById('funcionariosTableBody');

let editIndex = -1;

function carregarFuncionarios() {
  return JSON.parse(localStorage.getItem('funcionarios')) || [];
}

function salvarFuncionarios(list) {
  localStorage.setItem('funcionarios', JSON.stringify(list));
}

function listarFuncionarios() {
  if (!funcionariosTableBody) return;
  const funcionarios = carregarFuncionarios();
  funcionariosTableBody.innerHTML = '';

  funcionarios.forEach((func, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border px-4 py-2">${func.nome}</td>
      <td class="border px-4 py-2">${func.cpf}</td>
      <td class="border px-4 py-2">${func.telefone}</td>
      <td class="border px-4 py-2">${func.cargo}</td>
      <td class="border px-4 py-2">${func.email}</td>
      <td class="border px-4 py-2">
        <button class="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded">Editar</button>
      </td>
      <td class="border px-4 py-2">
        <button class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">Remover</button>
      </td>
    `;

    const btnEditar = tr.querySelector("button.bg-yellow-400");
    const btnRemover = tr.querySelector("button.bg-red-600");

    btnEditar.addEventListener('click', () => editarFuncionario(idx));
    btnRemover.addEventListener('click', () => removerFuncionario(idx));

    funcionariosTableBody.appendChild(tr);
  });
}

// Cadastro / Salvamento
if (cadastroForm) {
  cadastroForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const nascimento = document.getElementById('nascimento').value;
    const cpf = document.getElementById('cpf').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const cargo = document.getElementById('cargo').value.trim();
    const email = document.getElementById('emailFunc').value.trim();
    const senhaCampo = document.getElementById('senhaFunc').value;

    if (!nome || !nascimento || !cpf || !telefone || !cargo || !email || !senhaCampo) {
      alert('Preencha todos os campos');
      return;
    }

    let funcionarios = carregarFuncionarios();
    const novo = { nome, nascimento, cpf, telefone, cargo, email, senha: senhaCampo };

    if (editIndex === -1) {
      funcionarios.push(novo);
      alert('Funcionário cadastrado com sucesso!');
    } else {
      funcionarios[editIndex] = novo;
      alert('Funcionário atualizado com sucesso!');
      editIndex = -1;
    }

    salvarFuncionarios(funcionarios);
    cadastroForm.reset();
    listarFuncionarios();
  });
}

function removerFuncionario(index) {
  if (!confirm('Deseja realmente remover este funcionário?')) return;
  let funcionarios = carregarFuncionarios();
  funcionarios.splice(index, 1);
  salvarFuncionarios(funcionarios);
  listarFuncionarios();
}

function editarFuncionario(index) {
  let funcionarios = carregarFuncionarios();
  const func = funcionarios[index];
  if (!func) return alert("Funcionário não encontrado.");

  document.getElementById('nome').value = func.nome;
  document.getElementById('nascimento').value = func.nascimento;
  document.getElementById('cpf').value = func.cpf;
  document.getElementById('telefone').value = func.telefone;
  document.getElementById('cargo').value = func.cargo;
  document.getElementById('emailFunc').value = func.email;
  document.getElementById('senhaFunc').value = func.senha;

  editIndex = index;
  cadastroForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  abrirModalSenhaInicial().then((ok) => {
    if (!ok) {
      alert("Acesso negado! Você será redirecionado.");
      window.location.href = "index.html";
    } else {
      listarFuncionarios();
    }
  });
});
