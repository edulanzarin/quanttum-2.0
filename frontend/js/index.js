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
