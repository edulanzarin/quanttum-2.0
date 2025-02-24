const processarBtn = document.querySelector(".process-btn");
const filePath = document.getElementById("filePath");
const cieloCheckbox = document.getElementById("cielo");

// Função para abrir o seletor de arquivos usando o Electron

document.querySelectorAll(".file-button").forEach((label, index) => {
  window.electronAPI
    .selecionarArquivo()
    .then((caminho) => {
      if (caminho) {
        filePath.value = caminho; // Atualiza o campo com o caminho do arquivo selecionado
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

  // Verifica se a checkbox "Cielo" está marcada
  if (!cieloCheckbox.checked) {
    createNotification(
      "É necessário selecionar um modelo.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  try {
    showLoadingModal();

    // Chama a função do Electron para processar o relatório
    const resultado = await window.electronAPI.processarDirf(
      caminhoPdf,
      "cielo"
    );

    hideLoadingModal();

    // Exibe o retorno
    if (resultado.status === "success") {
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
    console.error("Erro ao processar o arquivo:", erro);
    createNotification(
      "Ocorreu um erro ao processar o arquivo.",
      "red",
      "darkred"
    );
  }
});
