const processarBtn = document.querySelector(".process-btn");
const filePath = document.getElementById("filePath");
const bancoSelect = document.getElementById("banco"); // Captura o select do banco
const contaDebito = document.getElementById("contaDebito"); // Captura o campo de conta débito

// Função para abrir o seletor de arquivos usando o Electron
document.querySelector(".file-label").addEventListener("click", () => {
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
  const caminhoArquivo = filePath.value;
  const bancoSelecionado = bancoSelect.value;
  const numeroContaDebito = contaDebito.value; // Captura o número da conta débito

  // Verifica se um banco foi selecionado
  if (!bancoSelecionado) {
    createNotification(
      "É necessário selecionar um banco.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  // Verifica se o arquivo foi selecionado
  if (!caminhoArquivo) {
    createNotification(
      "É necessário selecionar um arquivo.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  // Verifica se o número da conta débito foi preenchido (apenas para Viacredi)
  if (bancoSelecionado === "viacredi" && !numeroContaDebito) {
    createNotification(
      "É necessário informar o número da conta débito.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  try {
    showLoadingModal();

    // Verifica a extensão do arquivo
    const extensaoArquivo = caminhoArquivo.split(".").pop().toLowerCase();

    let resultado;
    if (extensaoArquivo === "ofx" && bancoSelecionado === "viacredi") {
      // Processa arquivo OFX da Viacredi
      resultado = await window.electronAPI.gerenciarBancos(
        "viacredi_ofx",
        numeroContaDebito, // Passa o número da conta débito
        caminhoArquivo
      );
    } else if (
      extensaoArquivo === "pdf" &&
      bancoSelecionado === "santander_dois"
    ) {
      // Processa arquivo PDF do Santander
      resultado = await window.electronAPI.gerenciarBancos(
        bancoSelecionado,
        null, // Não precisa de número da conta débito
        caminhoArquivo
      );
    } else {
      // Extensão ou banco não suportado
      hideLoadingModal();
      createNotification(
        "Formato de arquivo ou banco não suportado.",
        "#1d1830",
        "darkred",
        errorGifUrl
      );
      return;
    }

    hideLoadingModal();

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
