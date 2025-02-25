const processarBtn = document.querySelector(".process-btn");
const filePath = document.getElementById("filePath");

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

  try {
    showLoadingModal();
    console.log("Iniciando processamento..."); // Log de início
    const resultado = await window.electronAPI.gerarPDFsReinf(caminhoPdf);
    console.log("Resultado recebido:", resultado); // Log do resultado
    hideLoadingModal();

    // Exibe o retorno
    if (resultado.success) {
      createNotification(
        "Arquivos gerados com sucesso!",
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
    console.error("Erro ao gerar os arquivo:", erro);
    createNotification(
      "Ocorreu um erro ao gerar os arquivos.",
      "red",
      "darkred"
    );
  }
});
