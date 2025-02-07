const processarBtn = document.querySelector(".process-btn");
const filePlanilha = document.getElementById("filePlanilha");

// Função para abrir o seletor de arquivos usando o Electron
document.querySelector(".file-label").addEventListener("click", () => {
  // Abre o seletor de arquivos via Electron API
  window.electronAPI
    .selecionarArquivo()
    .then((caminho) => {
      if (caminho) {
        filePlanilha.value = caminho;
      }
    })
    .catch((err) => {
      console.error("Erro ao selecionar o arquivo:", err);
    });
});

// Função para processar os arquivos
processarBtn.addEventListener("click", async () => {
  const caminhoPlanilha = filePlanilha.value;

  // Verifica se o arquivo foi selecionado
  if (!caminhoPlanilha) {
    createNotification(
      "É necessário selecionar uma planilha.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  // Verifica se nenhuma checkbox foi marcada
  const debitoCheckbox = document.getElementById("debito");
  const creditoCheckbox = document.getElementById("credito");

  if (!debitoCheckbox.checked && !creditoCheckbox.checked) {
    createNotification(
      "É necessário selecionar ao menos uma opção: Débitos ou Créditos.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  // Verifica se ambas as checkboxes foram marcadas
  if (debitoCheckbox.checked && creditoCheckbox.checked) {
    createNotification(
      "Selecione apenas uma função: Débitos ou Créditos.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  try {
    showLoadingModal();

    let resultado;

    // Chama a função do Electron para processar os débitos ou créditos, dependendo do checkbox marcado
    if (debitoCheckbox.checked) {
      resultado = await window.electronAPI.processarDebito2r(caminhoPlanilha);
    } else if (creditoCheckbox.checked) {
      resultado = await window.electronAPI.processarCredito2r(caminhoPlanilha);
    }

    hideLoadingModal();

    // Exibe o retorno
    if (resultado.success) {
      createNotification(
        "Relatório processado com sucesso!",
        "#1d1830",
        "darkgreen",
        successGifUrl
      );
    } else {
      createNotification(
        `Erro: ${resultado.message}`,
        "#1d1830",
        "darkred",
        errorGifUrl
      );
    }
  } catch (erro) {
    console.error("Erro ao processar os arquivos:", erro);
    createNotification(
      "Ocorreu um erro ao processar os arquivos.",
      "red",
      "darkred"
    );
  }
});
