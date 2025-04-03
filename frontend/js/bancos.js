const processarBtn = document.querySelector(".process-btn");
const filePath = document.getElementById("filePath");
const bancoSelect = document.getElementById("banco");
const contaDebito = document.getElementById("contaDebito");

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

// Função para habilitar ou desabilitar a seleção do banco com base no tipo de arquivo
filePath.addEventListener("input", () => {
  const extensaoArquivo = filePath.value.split(".").pop().toLowerCase();
  if (extensaoArquivo === "ofx") {
    bancoSelect.disabled = true;
    bancoSelect.value = ""; // Reseta a seleção
  } else {
    bancoSelect.disabled = false;
  }
});

processarBtn.addEventListener("click", async () => {
  const caminhoArquivo = filePath.value;
  const bancoSelecionado = bancoSelect.value;
  const numeroContaDebito = contaDebito.value;
  const extensaoArquivo = caminhoArquivo.split(".").pop().toLowerCase();

  // Se o arquivo for PDF, exige a seleção do banco
  if (extensaoArquivo === "pdf" && !bancoSelecionado) {
    createNotification(
      "É necessário selecionar um banco para arquivos PDF.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  if (!caminhoArquivo) {
    createNotification(
      "É necessário selecionar um arquivo.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

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
    let resultado;
    if (extensaoArquivo === "ofx") {
      resultado = await window.electronAPI.gerenciarBancos(
        "ofx",
        numeroContaDebito,
        caminhoArquivo
      );
    } else if (extensaoArquivo === "pdf") {
      resultado = await window.electronAPI.gerenciarBancos(
        bancoSelecionado,
        null,
        caminhoArquivo
      );
    } else {
      hideLoadingModal();
      createNotification(
        "Formato de arquivo não suportado.",
        "#1d1830",
        "darkred",
        errorGifUrl
      );
      return;
    }

    hideLoadingModal();
    createNotification(
      resultado.status === "success"
        ? "Relatório processado com sucesso!"
        : `Erro: ${resultado.message}`,
      "#1d1830",
      resultado.status === "success" ? "darkgreen" : "darkred",
      resultado.status === "success" ? successGifUrl : errorGifUrl
    );
  } catch (erro) {
    console.error("Erro ao processar o arquivo:", erro);
    createNotification(
      "Ocorreu um erro ao processar o arquivo.",
      "red",
      "darkred"
    );
  }
});
