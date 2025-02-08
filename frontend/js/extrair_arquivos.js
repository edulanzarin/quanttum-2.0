// Função para abrir o seletor de pasta usando o Electron (para origem)
document.getElementById("fileOrigem").addEventListener("click", () => {
  // Abre o seletor de pasta via Electron API
  window.electronAPI
    .selecionarPasta()
    .then((caminho) => {
      if (caminho) {
        document.getElementById("caminhoOrigem").value = caminho; // Atualiza o campo de origem com o caminho da pasta
      }
    })
    .catch((err) => {
      console.error("Erro ao selecionar a pasta de origem:", err);
    });
});

// Função para abrir o seletor de pasta usando o Electron (para destino)
document.getElementById("fileDestino").addEventListener("click", () => {
  // Abre o seletor de pasta via Electron API
  window.electronAPI
    .selecionarPasta()
    .then((caminho) => {
      if (caminho) {
        document.getElementById("caminhoDestino").value = caminho;
      }
    })
    .catch((err) => {
      console.error("Erro ao selecionar a pasta de destino:", err);
    });
});

// Função para mover os arquivos
async function moverArquivos() {
  const caminhoOrigem = document.getElementById("caminhoOrigem").value;
  const caminhoDestino = document.getElementById("caminhoDestino").value;
  const incluirSubpastas = document.getElementById("subpastas").checked;

  console.log("Caminho origem:", caminhoOrigem);
  console.log("Caminho destino:", caminhoDestino);
  console.log("Incluir subpastas:", incluirSubpastas);

  // Verifica se ambos os caminhos foram selecionados
  if (!caminhoOrigem || !caminhoDestino) {
    createNotification(
      "É necessário selecionar os caminhos de origem e destino.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  try {
    showLoadingModal();
    // Chama a função do Electron para mover os arquivos
    const resultado = await window.electronAPI.extrairArquivos(
      caminhoOrigem,
      caminhoDestino,
      incluirSubpastas
    );

    console.log("Resultado do backend:", resultado); // Exibe o que está sendo retornado

    hideLoadingModal();

    // Exibe o retorno
    if (resultado.success) {
      createNotification(
        "Arquivos extraídos com sucesso!",
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
    console.error("Erro ao extrair os arquivos:", erro);
    createNotification(
      "Ocorreu um erro ao extrair os arquivos.",
      "red",
      "darkred"
    );
  }
}
