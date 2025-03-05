// Função para alternar entre as views
function showView(view) {
  // Esconde todas as views
  document.querySelectorAll(".view").forEach((v) => (v.style.display = "none"));
  // Mostra a view selecionada
  document.getElementById(view + "View").style.display = "block";
}

// Função para excluir uma linha da tabela
function deleteConciliation(button) {
  const row = button.closest("tr");
  row.remove();
}

// Função para adicionar uma conciliação
document
  .querySelector("#addView .process-btn")
  .addEventListener("click", async () => {
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

    const dados = {
      empresa: parseInt(empresa, 10),
      banco: parseInt(banco, 10),
      descricao: descricao,
      debito: debito ? parseInt(debito, 10) : null,
      credito: credito ? parseInt(credito, 10) : null,
    };

    try {
      showLoadingModal();
      const resultado = await window.electronAPI.gerenciarConciliacao(
        "adicionar",
        dados
      );
      hideLoadingModal();

      if (resultado.success) {
        createNotification(
          "Conciliação adicionada com sucesso!",
          "#1d1830",
          "darkgreen",
          successGifUrl
        );
        // Limpa os campos após o sucesso
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

// Função para adicionar conciliações em massa
document
  .querySelector("#addView .button-container .process-btn:nth-child(2)")
  .addEventListener("click", async () => {
    const empresa = document.getElementById("nmrEmpresa").value;
    const banco = document.getElementById("nmrBanco").value;
    const planilhaInput = document.getElementById("planilhaInput");

    if (!empresa || !banco || !planilhaInput.value) {
      createNotification(
        "Preencha os campos obrigatórios e selecione uma planilha.",
        "#1d1830",
        "darkred",
        errorGifUrl
      );
      return;
    }

    const dados = {
      empresa: parseInt(empresa, 10),
      banco: parseInt(banco, 10),
      caminho_planilha: planilhaInput.value,
    };

    try {
      showLoadingModal();
      const resultado = await window.electronAPI.gerenciarConciliacao(
        "cadastrar_em_massa",
        dados
      );
      hideLoadingModal();

      if (resultado.success) {
        createNotification(
          "Conciliações em massa adicionadas com sucesso!",
          "#1d1830",
          "darkgreen",
          successGifUrl
        );
        document.getElementById("nmrEmpresa").value = "";
        document.getElementById("nmrBanco").value = "";
        planilhaInput.value = "";
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
        "Ocorreu um erro ao processar a planilha.",
        "#1d1830",
        "darkred",
        errorGifUrl
      );
    }
  });

// Função para abrir o seletor de arquivos
document.querySelectorAll(".file-button").forEach((button) => {
  button.addEventListener("click", () => {
    window.electronAPI
      .selecionarArquivo()
      .then((caminho) => {
        if (caminho) {
          document.getElementById("planilhaInput").value = caminho;
        }
      })
      .catch((err) => {
        console.error("Erro ao selecionar o arquivo:", err);
      });
  });
});

// Função para filtrar a tabela
document
  .querySelector("#getView .filter-button")
  .addEventListener("click", async () => {
    const empresa = document.getElementById("filterEmpresa").value;

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
      showLoadingModal();
      const resultado = await window.electronAPI.gerenciarConciliacao("obter", {
        empresa: parseInt(empresa, 10),
      });
      hideLoadingModal();

      if (resultado.success && resultado.data && resultado.data.conciliacoes) {
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
  });

// Função para preencher a tabela
function preencherTabela(conciliacoes) {
  const tabela = document
    .getElementById("conciliationTable")
    .getElementsByTagName("tbody")[0];
  tabela.innerHTML = ""; // Limpa a tabela antes de preencher

  if (!conciliacoes || conciliacoes.length === 0) {
    const row = tabela.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 6;
    cell.textContent = "Nenhuma conciliação encontrada.";
    cell.style.textAlign = "center";
    return;
  }

  conciliacoes.forEach((conciliacao) => {
    const row = tabela.insertRow();
    row.insertCell(0).textContent = empresa || "-";
    row.insertCell(1).textContent = conciliacao.banco || "-";
    row.insertCell(2).textContent = conciliacao.descricao || "-";
    row.insertCell(3).textContent = conciliacao.debito || "-";
    row.insertCell(4).textContent = conciliacao.credito || "-";

    const cellAcoes = row.insertCell(5);
    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.className = "action-btn delete-btn";
    btnExcluir.onclick = () => excluirConciliacao(conciliacao.id);
    cellAcoes.appendChild(btnExcluir);
  });
}

// Função para excluir uma conciliação
async function excluirConciliacao(id) {
  try {
    showLoadingModal();
    const resultado = await window.electronAPI.gerenciarConciliacao("excluir", {
      empresa: parseInt(document.getElementById("filterEmpresa").value, 10),
      documento_id: id,
    });
    hideLoadingModal();

    if (resultado.success) {
      createNotification(
        "Conciliação excluída com sucesso!",
        "#1d1830",
        "darkgreen",
        successGifUrl
      );
      // Atualiza a tabela após a exclusão
      const empresa = document.getElementById("filterEmpresa").value;
      const resultado = await window.electronAPI.gerenciarConciliacao("obter", {
        empresa: parseInt(empresa, 10),
      });
      preencherTabela(resultado.data.conciliacoes);
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
      "Ocorreu um erro ao excluir a conciliação.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
  }
}
