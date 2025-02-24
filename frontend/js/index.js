// Função para buscar e exibir as notícias
async function carregarNoticias() {
  const noticesContainer = document.querySelector(".notices-container");
  noticesContainer.innerHTML = "";

  try {
    showLoadingModal();
    // Chama a função do Electron para obter as notícias
    const noticias = await window.electronAPI.obterNoticias();

    // Verifica se as notícias foram retornadas com sucesso
    if (Array.isArray(noticias)) {
      // Ordena as notícias por data (mais recentes primeiro)
      noticias.sort((a, b) => new Date(b.data) - new Date(a.data));

      // Esconde o modal de loading antes de iterar
      hideLoadingModal();

      noticias.forEach((noticia) => {
        const { titulo, descricao, data } = noticia;

        // Formata a data para "24 de fevereiro de 2025"
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
              <span class="notice-date">${dataFormatada}</span> <!-- data formatada -->
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
