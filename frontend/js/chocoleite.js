const processarBtn = document.querySelector(".process-btn");
const filePath = document.getElementById("filePath");
const pagosCheckbox = document.getElementById("pagos");
const recebidosCheckbox = document.getElementById("recebidos");

// Função para abrir o seletor de arquivos usando o Electron
document.querySelector(".file-button").addEventListener("click", () => {
  // Abre o seletor de arquivos via Electron API
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

  // Verifica se nenhuma checkbox foi marcada
  if (!recebidosCheckbox.checked && !pagosCheckbox.checked) {
    createNotification(
      "É necessário selecionar uma função.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  if (recebidosCheckbox.checked && pagosCheckbox.checked) {
    createNotification(
      "Selecione apenas uma função.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  // Verifica se a checkbox "Recebidos" está marcada
  if (recebidosCheckbox.checked) {
    try {
      showLoadingModal();
      // Chama a função do Electron para processar os recebidos
      const resultado = await window.electronAPI.processarRecebidosChocoleite(
        caminhoPdf
      );
      hideLoadingModal();

      // Exibe o retorno
      if (resultado.status === "success") {
        createNotification(
          "Relatório de recebidos processado com sucesso!",
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
    return; // Impede o código de processar os "pagos" se "recebidos" foi selecionado
  }

  // Se "Recebidos" não foi marcado, então processa os "Pagos"
  if (pagosCheckbox.checked) {
    try {
      showLoadingModal();
      // Chama a função do Electron para processar os pagos
      const resultado = await window.electronAPI.processarPagosChocoleite(
        caminhoPdf
      );
      hideLoadingModal();

      // Exibe o retorno
      if (resultado.status === "success") {
        createNotification(
          "Relatório de pagamentos processado com sucesso!",
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
  }
});
