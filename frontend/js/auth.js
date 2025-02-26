showLoadingModal("Autenticando...");
async function verificarLogin() {
  const usuarioJson = localStorage.getItem("usuario");

  // Verifica se o usuário está no localStorage
  if (!usuarioJson) {
    redirecionarParaLogin();
    return;
  }

  const usuario = JSON.parse(usuarioJson);

  try {
    // Obtém os dados do usuário
    const usuarioCompleto = await window.electronAPI.gerenciarUsuario(
      "obter",
      usuario.id
    );

    if (usuarioCompleto.success) {
      // Verifica se o status do usuário está "on"
      if (usuarioCompleto.usuario.status !== "on") {
        redirecionarParaLogin();
      } else {
        // Atualiza o usuário no localStorage
        localStorage.setItem(
          "usuario",
          JSON.stringify(usuarioCompleto.usuario)
        );

        // Obtém as notícias do banco de dados
        const noticias = await window.electronAPI.obterNoticias();

        if (Array.isArray(noticias)) {
          // Remove notícias antigas do localStorage
          localStorage.removeItem("noticias");

          // Armazena as notícias no localStorage
          localStorage.setItem("noticias", JSON.stringify(noticias));
        }

        hideLoadingModal();

        // Redireciona para a página index.html
        window.location.href = "index.html";
      }
    } else {
      console.error("Erro ao obter dados do usuário.");
      redirecionarParaLogin();
    }
  } catch (error) {
    console.error("Erro ao conectar com o servidor:", error);
    redirecionarParaLogin();
  }
}

// Executa a verificação de login ao carregar a página
document.addEventListener("DOMContentLoaded", verificarLogin);
