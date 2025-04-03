const processarBtn = document.querySelector(".process-btn");
const filePasta = document.getElementById("filePasta");
const adicionarDataCheckbox = document.getElementById("data");
const incluirSubpastasCheckbox = document.getElementById("subpastas");

// Função para abrir o seletor de arquivos usando o Electron
document.querySelector(".file-button").addEventListener("click", () => {
  // Abre o seletor de arquivos via Electron API
  window.electronAPI
    .selecionarPasta()
    .then((caminho) => {
      if (caminho) {
        filePasta.value = caminho;
      }
    })
    .catch((err) => {
      console.error("Erro ao selecionar a pasta:", err);
    });
});

// Função para processar o arquivo
processarBtn.addEventListener("click", async () => {
  const caminhoPasta = filePasta.value;

  // Verifica se o arquivo foi selecionado
  if (!caminhoPasta) {
    createNotification(
      "É necessário selecionar uma pasta.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  try {
    showLoadingModal();
    // Chama a função do Electron para processar os recebidos
    const resultado = await window.electronAPI.renomearDas(
      caminhoPasta,
      adicionarDataCheckbox,
      incluirSubpastasCheckbox
    );
    hideLoadingModal();

    // Exibe o retorno
    if (resultado.status === "success") {
      createNotification(
        "Guias renomeadas com sucesso!",
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
  return;
});
