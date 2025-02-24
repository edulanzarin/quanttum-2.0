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

  // Obtém os favoritos do sessionStorage
  const favoritosJson = sessionStorage.getItem("favoritos");

  if (!favoritosJson) {
    console.log("Nenhum favorito encontrado.");
    return;
  }

  const favoritos = JSON.parse(favoritosJson);

  // Busca os cards correspondentes aos favoritos e os exibe
  await carregarCardsFavoritos(favoritos, idUsuario);
});

// Função para carregar os cards favoritos
async function carregarCardsFavoritos(favoritos, idUsuario) {
  const cardGrid = document.querySelector(".card-grid");

  if (!cardGrid) {
    console.error("Container de cards não encontrado.");
    return;
  }

  // Limpa o container de cards
  cardGrid.innerHTML = "";

  // URLs das páginas onde os cards podem estar
  const paginas = ["contabil.html", "folha.html", "fiscal.html"];

  // Para cada favorito, busca o card correspondente
  for (const idFuncao of favoritos) {
    let cardEncontrado = null;

    // Busca o card em cada página
    for (const pagina of paginas) {
      const card = await buscarCardNaPagina(pagina, idFuncao);
      if (card) {
        cardEncontrado = card;
        break;
      }
    }

    // Se o card foi encontrado, adiciona ao container
    if (cardEncontrado) {
      // Marca a estrela como ativa
      const estrela = cardEncontrado.querySelector(".card-favorite");
      if (estrela) {
        estrela.classList.add("active");
      }

      // Adiciona evento de clique na estrela
      estrela.addEventListener("click", async function (event) {
        event.preventDefault();

        // Chama a função para gerenciar o favorito
        try {
          showLoadingModal("Removendo dos favoritos...");
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
            // Remove o card da tela
            cardEncontrado.remove();

            // Atualiza os favoritos no sessionStorage
            const favoritosJson = sessionStorage.getItem("favoritos");
            if (favoritosJson) {
              const favoritos = JSON.parse(favoritosJson);
              if (favoritos.includes(idFuncao)) {
                favoritos.splice(favoritos.indexOf(idFuncao), 1); // Remove o favorito
                sessionStorage.setItem("favoritos", JSON.stringify(favoritos));
              }
            }

            createNotification(
              `${resultado.message}`,
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
        } catch (error) {
          createNotification(
            `Erro ao remover dos favoritos. ${error}`,
            "red",
            "darkred"
          );
        }
      });

      // Adiciona o card ao container
      cardGrid.appendChild(cardEncontrado);
    } else {
      console.warn(`Card com ID ${idFuncao} não encontrado em nenhuma página.`);
    }
  }
}

// Função para buscar um card em uma página específica
async function buscarCardNaPagina(pagina, idFuncao) {
  try {
    // Faz uma requisição para a página
    const response = await fetch(pagina);
    const text = await response.text();

    // Cria um elemento temporário para parsear o HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;

    // Busca o card pelo ID
    const card = tempDiv.querySelector(`#${idFuncao}`);

    if (card) {
      // Clona o card para evitar problemas de referência
      return card.cloneNode(true);
    }
  } catch (error) {
    console.error(`Erro ao buscar card na página ${pagina}:`, error);
  }

  return null;
}
