async function verificarUsuario() {
  const usuarioJson = localStorage.getItem("usuario");

  // Verifica se o usuário está no localStorage
  if (!usuarioJson) {
    redirecionarParaLogin();
    return;
  }

  const usuario = JSON.parse(usuarioJson);

  try {
    // Obtém os dados do usuário usando a função obter_usuario
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

        // Adiciona a primeira letra do nome na classe .user-letter
        const primeiraLetra = usuarioCompleto.usuario.nome
          .charAt(0)
          .toLowerCase();
        const userLetterElement = document.querySelector(".user-letter");

        if (userLetterElement) {
          // Atualiza a classe do elemento com a letra
          userLetterElement.className = `fa-regular fa-${primeiraLetra}`;
        }

        // Adiciona um log de "login" após a verificação bem-sucedida
        try {
          const resultadoLog = await window.electronAPI.adicionarLog(
            usuarioCompleto.usuario.id,
            "login"
          );

          if (resultadoLog.success) {
            console.log("Log de login adicionado com sucesso.");
          } else {
            console.error(
              "Erro ao adicionar log de login:",
              resultadoLog.message
            );
          }
        } catch (error) {
          console.error("Erro ao adicionar log de login:", error);
        }
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

// Função para limpar localStorage e redirecionar para login
function redirecionarParaLogin() {
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}

// Função para buscar e exibir as notícias
async function carregarNoticias() {
  const noticesContainer = document.querySelector(".notices-container");
  noticesContainer.innerHTML = "";

  try {
    showLoadingModal("Carregando informações...");
    const noticias = await window.electronAPI.obterNoticias();

    if (Array.isArray(noticias)) {
      noticias.sort((a, b) => new Date(b.data) - new Date(a.data));
      hideLoadingModal();

      noticias.forEach((noticia) => {
        const { titulo, descricao, data } = noticia;
        const dataFormatada = new Date(data).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

        const noticeCard = document.createElement("div");
        noticeCard.classList.add("notice-card");
        noticeCard.innerHTML = `
              <h3>${titulo}</h3>
              <p>${descricao}</p>
              <span class="notice-date">${dataFormatada}</span>
            `;

        noticesContainer.appendChild(noticeCard);
      });
    } else {
      console.error("Nenhuma notícia disponível.");
    }
  } catch (error) {
    console.error("Erro ao carregar notícias: ", error);
  }
}

// Carrega as notícias ao carregar a página
document.addEventListener("DOMContentLoaded", carregarNoticias);
