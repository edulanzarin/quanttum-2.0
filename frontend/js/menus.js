document.addEventListener("DOMContentLoaded", function () {
  // Verifica se o usuário está logado
  const usuarioJson = localStorage.getItem("usuario");

  if (!usuarioJson) {
    alert("Usuário não está logado.");
    redirecionarParaLogin();
    return;
  }

  const usuario = JSON.parse(usuarioJson);
  const idUsuario = usuario.id;

  // Carrega os favoritos do usuário do localStorage
  carregarFavoritos();

  // Adiciona eventos de clique às estrelas de favorito
  const estrelasFavorito = document.querySelectorAll(".card-favorite");
  estrelasFavorito.forEach((estrela) => {
    estrela.addEventListener("click", function (event) {
      event.preventDefault();

      // Obtém o ID do card (pai da estrela)
      const card = estrela.closest(".card");
      const idFuncao = card.id;

      // Obtém os favoritos do localStorage
      const favoritosJson = localStorage.getItem("favoritos");
      let favoritos = favoritosJson ? JSON.parse(favoritosJson) : [];

      // Verifica se o item já está nos favoritos
      if (favoritos.includes(idFuncao)) {
        // Remove o item dos favoritos
        favoritos = favoritos.filter((item) => item !== idFuncao);
        estrela.classList.remove("active");
        createNotification(
          "Item removido dos favoritos.",
          "#1d1830",
          "darkgreen",
          successGifUrl
        );
      } else {
        // Adiciona o item aos favoritos
        favoritos.push(idFuncao);
        estrela.classList.add("active");
        createNotification(
          "Item adicionado aos favoritos!",
          "#1d1830",
          "darkgreen",
          successGifUrl
        );
      }

      // Atualiza os favoritos no localStorage
      localStorage.setItem("favoritos", JSON.stringify(favoritos));
    });
  });
});

// Função para carregar os favoritos do usuário e marcar os cards correspondentes
function carregarFavoritos() {
  try {
    // Obtém os favoritos do localStorage
    const favoritosJson = localStorage.getItem("favoritos");

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
      "Ocorreu um erro ao carregar os favoritos.",
      "red",
      "darkred"
    );
  }
}
