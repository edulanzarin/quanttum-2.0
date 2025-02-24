document.addEventListener("DOMContentLoaded", async function () {
  // Verifica se o usuário está logado
  const usuarioJson = localStorage.getItem("usuario");

  if (!usuarioJson) {
    alert("Usuário não está logado.");
    redirecionarParaLogin();
    return;
  }

  const usuario = JSON.parse(usuarioJson);
  const idUsuario = usuario.id;

  // Carrega os favoritos do usuário do sessionStorage
  carregarFavoritos();

  // Adiciona eventos de clique às estrelas de favorito
  const estrelasFavorito = document.querySelectorAll(".card-favorite");
  estrelasFavorito.forEach((estrela) => {
    estrela.addEventListener("click", async function (event) {
      event.preventDefault();

      // Obtém o ID do card (pai da estrela)
      const card = estrela.closest(".card");
      const idFuncao = card.id;

      // Chama a função para gerenciar o favorito
      try {
        showLoadingModal("Gerenciando favoritos...");
        const resultado = await window.electronAPI.gerenciarUsuario(
          "favorito",
          idUsuario,
          null,
          null,
          null,
          idFuncao
        );

        hideLoadingModal();
        if (resultado.success) {
          // Atualiza o estado visual da estrela
          estrela.classList.toggle("active");
          createNotification(
            `${resultado.message}`,
            "#1d1830",
            "darkgreen",
            successGifUrl
          );

          // Atualiza os favoritos no sessionStorage
          const favoritosJson = sessionStorage.getItem("favoritos");
          if (favoritosJson) {
            const favoritos = JSON.parse(favoritosJson);
            if (favoritos.includes(idFuncao)) {
              favoritos.splice(favoritos.indexOf(idFuncao), 1);
            } else {
              favoritos.push(idFuncao);
            }
            sessionStorage.setItem("favoritos", JSON.stringify(favoritos));
          }
        } else {
          createNotification(
            `Erro: ${resultado.message}`,
            "#1d1830",
            "darkred",
            errorGifUrl
          );
        }
      } catch (error) {
        createNotification(
          `Erro ao gerenciar favoritos. ${error}`,
          "red",
          "darkred"
        );
      }
    });
  });
});

// Função para carregar os favoritos do usuário e marcar os cards correspondentes
function carregarFavoritos() {
  try {
    // Obtém os favoritos do sessionStorage
    const favoritosJson = sessionStorage.getItem("favoritos");

    if (favoritosJson) {
      const favoritos = JSON.parse(favoritosJson);

      // Percorre todos os cards e marca como ativos aqueles que estão nos favoritos
      favoritos.forEach((idFuncao) => {
        const card = document.getElementById(idFuncao);
        if (card) {
          const estrela = card.querySelector(".card-favorite");
          if (estrela) {
            estrela.classList.add("active");
          }
        }
      });
    }
  } catch (error) {
    createNotification(
      "Ocorreu um erro ao conectar com o servidor.",
      "red",
      "darkred"
    );
  }
}
