function showView(view) {
  // Esconde todas as views
  document.querySelectorAll(".view").forEach((v) => (v.style.display = "none"));
  // Mostra a view selecionada
  document.getElementById(view + "View").style.display = "flex";
}

function deleteConciliation(button) {
  const row = button.closest("tr");
  row.remove();
}

// Seleciona o botão "Adicionar"
const adicionarBtn = document.querySelector("#addView .process-btn");

// Função para coletar os dados do formulário e chamar a função gerenciarConciliacao
adicionarBtn.addEventListener("click", async () => {
  // Coleta os valores dos campos de entrada
  const empresa = document.getElementById("nmrEmpresa").value;
  const banco = document.getElementById("nmrBanco").value;
  const descricao = document.getElementById("descricao").value;
  const debito = document.getElementById("contaDebito").value;
  const credito = document.getElementById("contaCredito").value;

  // Validação dos campos obrigatórios
  if (!empresa || !banco || !descricao) {
    createNotification(
      "Preencha os campos obrigatórios: Empresa, Banco e Descrição.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  // Prepara os dados para enviar ao backend
  const dados = {
    empresa: parseInt(empresa, 10), // Converte para número inteiro
    banco: parseInt(banco, 10), // Converte para número inteiro
    descricao: descricao,
    debito: debito ? parseInt(debito, 10) : null, // Converte para número inteiro (opcional)
    credito: credito ? parseInt(credito, 10) : null, // Converte para número inteiro (opcional)
  };

  try {
    // Mostra o modal de carregamento
    showLoadingModal();

    // Chama a função gerenciarConciliacao via IPC
    const resultado = await window.electronAPI.gerenciarConciliacao(
      "adicionar",
      dados
    );

    // Esconde o modal de carregamento
    hideLoadingModal();

    // Verifica o resultado
    if (resultado.success) {
      createNotification(
        "Conciliação adicionada com sucesso!",
        "#1d1830",
        "darkgreen",
        successGifUrl
      );
      // Limpa os campos após o sucesso (opcional)
      document.getElementById("nmrEmpresa").value = "";
      document.getElementById("nmrBanco").value = "";
      document.getElementById("descricao").value = "";
      document.getElementById("contaDebito").value = "";
      document.getElementById("contaCredito").value = "";
    } else {
      createNotification(
        `Erro: ${resultado.message}`,
        "#1d1830",
        "darkred",
        errorGifUrl
      );
    }
  } catch (erro) {
    createNotification(
      "Ocorreu um erro ao adicionar a conciliação.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
  }
});

async function filterTable() {
  // Coleta o valor do campo de filtro
  const empresa = document.getElementById("filterEmpresa").value;

  // Validação do campo
  if (!empresa) {
    createNotification(
      "Informe o número da empresa.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  try {
    // Mostra o modal de carregamento
    showLoadingModal();

    // Chama a função gerenciarConciliacao via IPC
    const resultado = await window.electronAPI.gerenciarConciliacao("obter", {
      empresa: parseInt(empresa, 10), // Converte para número inteiro
    });

    // Esconde o modal de carregamento
    hideLoadingModal();

    // Verifica o resultado
    if (resultado.success && resultado.data && resultado.data.conciliacoes) {
      // Preenche a tabela com os dados retornados
      preencherTabela(resultado.data.conciliacoes);
    } else {
      createNotification(
        resultado.message || "Nenhuma conciliação encontrada.",
        "#1d1830",
        "darkred",
        errorGifUrl
      );
    }
  } catch (erro) {
    createNotification(
      "Ocorreu um erro ao filtrar as conciliações.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
  }
}

function preencherTabela(conciliacoes) {
  const empresa = document.getElementById("filterEmpresa").value;
  const tabela = document
    .getElementById("conciliationTable")
    .getElementsByTagName("tbody")[0];
  tabela.innerHTML = ""; // Limpa a tabela antes de preencher

  if (!conciliacoes || conciliacoes.length === 0) {
    // Se não houver conciliações, exibe uma mensagem
    const row = tabela.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 6; // Mescla as colunas
    cell.textContent = "Nenhuma conciliação encontrada.";
    cell.style.textAlign = "center";
    return;
  }

  // Preenche a tabela com os dados das conciliações
  conciliacoes.forEach((conciliacao) => {
    const row = tabela.insertRow();
    row.insertCell(0).textContent = empresa || "-";
    row.insertCell(1).textContent = conciliacao.banco || "-";
    row.insertCell(2).textContent = conciliacao.descricao || "-";
    row.insertCell(3).textContent = conciliacao.debito || "-";
    row.insertCell(4).textContent = conciliacao.credito || "-";

    // Adiciona botões de ação (editar/excluir)
    const cellAcoes = row.insertCell(5);

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.className = "action-btn delete-btn";
    btnExcluir.onclick = () => excluirConciliacao(conciliacao.id);

    cellAcoes.appendChild(btnExcluir);
  });
}

// Função para editar uma conciliação (exemplo)
function editarConciliacao(id) {
  // Implemente a lógica para editar a conciliação
}

// Função para excluir uma conciliação (exemplo)
function excluirConciliacao(id) {
  // Implemente a lógica para excluir a conciliação
}
