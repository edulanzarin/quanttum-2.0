const processarBtn = document.querySelector(".process-btn");
const planilhaBancoInput = document.getElementById("planilhaBanco");
const planilhaPagosInput = document.getElementById("planilhaPagos");

// Função para abrir o seletor de arquivos usando o Electron
document.querySelectorAll(".file-label").forEach((label, index) => {
  label.addEventListener("click", () => {
    // Abre o seletor de arquivos via Electron API
    window.electronAPI
      .selecionarArquivo()
      .then((caminho) => {
        if (caminho) {
          // Atualiza o campo com o caminho do arquivo selecionado
          if (index === 0) {
            planilhaBancoInput.value = caminho;
          } else {
            planilhaPagosInput.value = caminho;
          }
        }
      })
      .catch((err) => {
        console.error("Erro ao selecionar o arquivo:", err);
      });
  });
});

processarBtn.addEventListener("click", async () => {
  const caminhoBanco = planilhaBancoInput.value;
  const caminhoPagos = planilhaPagosInput.value;

  // Verifica se os arquivos foram selecionados
  if (!caminhoBanco || !caminhoPagos) {
    createNotification(
      "É necessário selecionar ambas as planilhas.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  try {
    showLoadingModal(); // Exibe o modal de carregamento

    // Chama a função do Electron para conciliar as planilhas
    const resultado = await window.electronAPI.conciliarPagosBanco(
      caminhoBanco,
      caminhoPagos
    );

    hideLoadingModal(); // Oculta o modal de carregamento

    // Exibe o retorno
    if (resultado.status === "success") {
      createNotification(
        "Conciliação realizada com sucesso!",
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
    console.error("Erro ao processar a conciliação:", erro);
    hideLoadingModal();
    createNotification(
      "Ocorreu um erro ao processar a conciliação.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
  }
});
