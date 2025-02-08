const processarBtn = document.querySelector(".process-btn");
const emailAutorizado = document.getElementById("emailAutorizado");
const planilhaReferencia = document.getElementById("planilhaReferencia");
const conteudoEmail = document.getElementById("conteudoEmail");

// Função para abrir o seletor de arquivos usando o Electron
document.querySelectorAll(".file-label").forEach((label) => {
  label.addEventListener("click", (event) => {
    const inputField = event.target.previousElementSibling;
    if (inputField === planilhaReferencia) {
      // Abre o seletor de arquivos para planilha de referência
      window.electronAPI
        .selecionarArquivo()
        .then((caminho) => {
          if (caminho) {
            planilhaReferencia.value = caminho; // Atualiza o campo com o caminho do arquivo selecionado
          }
        })
        .catch((err) => {
          console.error("Erro ao selecionar o arquivo:", err);
        });
    } else if (inputField === conteudoEmail) {
      // Abre o seletor de arquivos para conteúdo do e-mail (se necessário)
      window.electronAPI
        .selecionarArquivo()
        .then((caminho) => {
          if (caminho) {
            conteudoEmail.value = caminho; // Atualiza o campo com o caminho do arquivo selecionado
          }
        })
        .catch((err) => {
          console.error("Erro ao selecionar o arquivo:", err);
        });
    } else if (inputField === emailAutorizado) {
      // Permite digitar ou selecionar o e-mail autorizado
      // Caso seja um campo de texto, você pode querer apenas editar
    }
  });
});

processarBtn.addEventListener("click", async () => {
  const email = emailAutorizado.value;
  const planilha = planilhaReferencia.value;
  const conteudo = conteudoEmail.value;

  // Verifica se os campos obrigatórios estão preenchidos
  if (!email || !planilha || !conteudo) {
    createNotification(
      "É necessário preencher todos os campos.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  try {
    showLoadingModal();
    const resultado = await window.electronAPI.enviarEmails(
      email,
      planilha,
      conteudo
    );
    hideLoadingModal();

    if (resultado.success) {
      createNotification(
        "E-mails enviados com sucesso!",
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
    console.error("Erro ao enviar e-mail:", erro);
    createNotification(
      "Ocorreu um erro ao enviar os e-mails.",
      "red",
      "darkred"
    );
  }
});
