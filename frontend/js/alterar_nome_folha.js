// Função para abrir o seletor de pasta usando o Electron
document.getElementById("fileOrigem").addEventListener("click", () => {
  // Abre o seletor de pasta via Electron API
  window.electronAPI
    .selecionarPasta()
    .then((caminho) => {
      if (caminho) {
        document.getElementById("caminho").value = caminho; // Atualiza o campo com o caminho da pasta
      }
    })
    .catch((err) => {
      console.error("Erro ao selecionar a pasta:", err);
    });
});

// Função para alterar o nome das folhas
async function alterarNomeFolha() {
  const caminho = document.getElementById("caminho").value;
  const incluirNmrEmpresa = document.getElementById("nmrEmpresa").checked;

  console.log("Caminho selecionado:", caminho);
  console.log("Incluir número da empresa:", incluirNmrEmpresa);

  // Verifica se o caminho foi selecionado
  if (!caminho) {
    createNotification(
      "É necessário selecionar o caminho da pasta.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  try {
    showLoadingModal();
    // Chama a função do Electron para alterar o nome das folhas
    const resultado = await window.electronAPI.alterarNomeFolha(
      caminho,
      incluirNmrEmpresa
    );

    console.log("Resultado do backend:", resultado);

    hideLoadingModal();

    // Exibe o retorno
    if (resultado.success) {
      createNotification(
        "Arquivos renomeados com sucesso!",
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
    console.error("Erro ao renomear os arquivos:", erro);
    createNotification(
      "Ocorreu um erro ao renomear os arquivos.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
  }
}

// Adiciona o evento de clique ao botão "Alterar"
document
  .querySelector(".process-btn")
  .addEventListener("click", alterarNomeFolha);
