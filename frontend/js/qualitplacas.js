const processarBtn = document.querySelector(".process-btn");
const filePath = document.getElementById("filePath");
const safraCheckbox = document.getElementById("safra");
const viacrediCheckbox = document.getElementById("viacredi");

// Função para abrir o seletor de arquivos usando o Electron
document.querySelector(".file-button").addEventListener("click", () => {
  // Abre o seletor de arquivos via Electron API
  window.electronAPI
    .selecionarArquivo()
    .then((caminho) => {
      if (caminho) {
        filePath.value = caminho;
      }
    })
    .catch((err) => {
      console.error("Erro ao selecionar o arquivo:", err);
    });
});

// Função para processar o arquivo
processarBtn.addEventListener("click", async () => {
  const caminhoPdf = filePath.value;

  // Verifica se o arquivo foi selecionado
  if (!caminhoPdf) {
    createNotification(
      "É necessário selecionar um arquivo.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  // Verifica se a checkbox "Safra" está marcada

  try {
    showLoadingModal();
    // Chama a função do Electron para processar o Safra
    const resultado = await window.electronAPI.processarSafraQualitplacas(
      caminhoPdf
    );
    hideLoadingModal();

    // Exibe o retorno
    if (resultado.status === "success") {
      createNotification(
        "Relatório Safra processado com sucesso!",
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
    console.error("Erro ao processar o arquivo:", erro);
    createNotification(
      "Ocorreu um erro ao processar o arquivo.",
      "red",
      "darkred"
    );
  }
  return; // Impede o código de processar o Viacredi se o Safra foi selecionado
});
