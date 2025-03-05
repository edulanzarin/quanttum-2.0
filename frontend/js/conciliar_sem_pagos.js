const processarBtn = document.querySelector(".process-btn");
const planilhaBancoInput = document.getElementById("planilhaBanco");
const nmrEmpresaInput = document.getElementById("nmrEmpresa");
const nmrBancoInput = document.getElementById("nmrBanco");

// Função para abrir o seletor de arquivos usando o Electron
document.querySelectorAll(".file-button").forEach((label, index) => {
  label.addEventListener("click", () => {
    // Abre o seletor de arquivos via Electron API
    window.electronAPI
      .selecionarArquivo()
      .then((caminho) => {
        if (caminho) {
          // Atualiza o campo com o caminho do arquivo selecionado
          if (index === 0) {
            planilhaBancoInput.value = caminho;
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
  const numeroEmpresa = nmrEmpresaInput.value;
  const numeroBanco = nmrBancoInput.value;

  // Verifica se o arquivo do banco foi selecionado
  if (!caminhoBanco) {
    createNotification(
      "É necessário selecionar a planilha do banco.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  // Verifica se os campos de empresa e banco estão preenchidos
  if (!numeroEmpresa || !numeroBanco) {
    createNotification(
      "É necessário preencher o número da empresa e do banco.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  try {
    showLoadingModal();

    // Chama a função de conciliação apenas do banco
    const resultado = await window.electronAPI.conciliarApenasBanco(
      caminhoBanco,
      numeroEmpresa,
      numeroBanco
    );

    hideLoadingModal();

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
