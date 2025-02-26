// Função para carregar e exibir as notícias
function carregarNoticias() {
  const noticesContainer = document.querySelector(".notices-container");
  noticesContainer.innerHTML = "";

  // Obtém as notícias do localStorage
  const noticiasJson = localStorage.getItem("noticias");

  if (!noticiasJson) {
    console.error("Nenhuma notícia encontrada no localStorage.");
    return;
  }

  const noticias = JSON.parse(noticiasJson);

  if (Array.isArray(noticias)) {
    // Ordena as notícias pela data (mais recente primeiro)
    noticias.sort((a, b) => new Date(b.data) - new Date(a.data));

    // Exibe as notícias na tela
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
    console.error("Formato de notícias inválido no localStorage.");
  }
}

// Carrega as notícias ao carregar a página
document.addEventListener("DOMContentLoaded", carregarNoticias);
