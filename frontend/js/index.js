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
        <span class="icon material-symbols-rounded">notifications</span>
        <h3>${titulo}</h3>
        <span class="notice-date">${dataFormatada}</span>
        <span class="click-indicator material-symbols-rounded">open_in_new</span>
      `;

      noticeCard.addEventListener("click", () => abrirModal(noticia));

      noticesContainer.appendChild(noticeCard);
    });
  } else {
    console.error("Formato de notícias inválido no localStorage.");
  }
}

// Função para abrir o modal de notícias
function abrirModal(noticia) {
  const modal = document.getElementById("modal-noticia");
  const modalTitle = document.getElementById("modal-noticia-title");
  const modalDescription = document.getElementById("modal-noticia-description");
  const modalDate = document.getElementById("modal-noticia-date");

  if (modal && modalTitle && modalDescription && modalDate) {
    modalTitle.textContent = noticia.titulo;
    modalDescription.textContent = noticia.descricao;
    modalDate.textContent = new Date(noticia.data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    modal.style.display = "flex";
  } else {
    console.error("Elementos do modal de notícias não encontrados.");
  }
}

// Função para fechar o modal de notícias
function fecharModalNoticia() {
  const modal = document.getElementById("modal-noticia");
  if (modal) {
    modal.style.display = "none";
  } else {
    console.error("Modal de notícias não encontrado.");
  }
}

// Fechar modal de notícias ao clicar no botão de fechar
document
  .querySelector(".close-modal-noticia")
  ?.addEventListener("click", fecharModalNoticia);

// Fechar modal de notícias ao clicar fora do conteúdo
window.addEventListener("click", (event) => {
  const modal = document.getElementById("modal-noticia");
  if (event.target === modal) {
    fecharModalNoticia();
  }
});

// Função para abrir o modal de sugestões
document.getElementById("sugestao-btn")?.addEventListener("click", () => {
  const modal = document.getElementById("sugestao-modal");
  if (modal) {
    modal.style.display = "flex";
  } else {
    console.error("Modal de sugestões não encontrado.");
  }
});

// Função para fechar o modal de sugestões
document
  .querySelector(".close-modal-sugestao")
  ?.addEventListener("click", () => {
    const modal = document.getElementById("sugestao-modal");
    if (modal) {
      modal.style.display = "none";
    } else {
      console.error("Modal de sugestões não encontrado.");
    }
  });

// Carrega as notícias ao carregar a página
document.addEventListener("DOMContentLoaded", carregarNoticias);

// Função para abrir o modal de sugestões
document.getElementById("sugestao-btn").addEventListener("click", () => {
  document.getElementById("sugestao-modal").style.display = "flex";
});

// Função para fechar o modal
document.querySelector(".close-modal").addEventListener("click", () => {
  document.getElementById("sugestao-modal").style.display = "none";
});

// Alternar entre as abas
document.querySelectorAll(".tab-link").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-link")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    document.querySelectorAll(".tab-content").forEach((content) => {
      content.style.display = "none";
    });

    document.getElementById(tab.dataset.tab).style.display = "block";
  });
});

// Enviar sugestão
document
  .getElementById("enviar-sugestao-btn")
  .addEventListener("click", async () => {
    const texto = document.getElementById("sugestao-texto").value;
    if (!texto) {
      createNotification(
        "Digite uma sugestão",
        "#1d1830",
        "darkgreen",
        errorGifUrl
      );
      return;
    }

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const idUsuario = usuario.id;

    try {
      // Chama a função Python para enviar a sugestão
      const resultado = await window.electronAPI.criarSugestao(
        idUsuario,
        texto
      );

      // O retorno do Electron já é um objeto JavaScript, não precisa de JSON.parse
      if (resultado.success) {
        const resposta = JSON.parse(resultado.message); // Aqui sim, fazemos o parse da mensagem
        if (resposta.status === "success") {
          createNotification(
            "Sugestão criada com sucesso!",
            "#1d1830",
            "darkgreen",
            successGifUrl
          );
          document.getElementById("sugestao-texto").value = "";
        } else {
          createNotification(
            "Erro ao criar sugestão",
            "#1d1830",
            "darkgreen",
            errorGifUrl
          );
        }
      } else {
        createNotification(
          "Erro ao criar sugestão",
          "#1d1830",
          "darkgreen",
          errorGifUrl
        );
      }
    } catch (erro) {
      console.error("Erro ao enviar sugestão:", erro);
      createNotification(
        "Erro ao criar sugestão",
        "#1d1830",
        "darkgreen",
        errorGifUrl
      );
    }
  });

// // Função para carregar sugestões
// async function carregarSugestoes() {
//   try {
//     // Chama a função Python para obter as sugestões
//     const resultado = await window.electronAPI.obterSugestoes();

//     // O retorno do Electron já é um objeto JavaScript, não precisa de JSON.parse
//     if (resultado.success) {
//       const resposta = JSON.parse(resultado.message); // Aqui sim, fazemos o parse da mensagem
//       const sugestoes = resposta.sugestoes;
//       const lista = document.getElementById("sugestoes-lista");
//       lista.innerHTML = "";

//       // Ordena as sugestões por data (mais recente primeiro)
//       sugestoes.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));

//       // Exibe as sugestões na tela
//       sugestoes.forEach((sugestao) => {
//         const item = document.createElement("div");
//         item.classList.add("sugestao-item");

//         // Formata a data e hora no formato YYYY-MM-DD_HH-MM-SS
//         const dataHora = sugestao.data_hora
//           .replace("_", " ")
//           .replace(/-/g, "/");

//         item.innerHTML = `
//           <h3>ID do Usuário: ${sugestao.id_usuario}</h3>
//           <span class="sugestao-data">${dataHora}</span>
//           <p class="sugestao-descricao">${sugestao.sugestao}</p>
//         `;

//         // Adiciona evento de clique para expandir/colapsar a descrição
//         item.addEventListener("click", () => {
//           item.classList.toggle("expanded");
//         });

//         lista.appendChild(item);
//       });
//     } else {
//       console.error("Erro ao carregar sugestões:", resultado.message);
//       alert("Erro ao carregar sugestões: " + resultado.message);
//     }
//   } catch (erro) {
//     console.error("Erro ao carregar sugestões:", erro);
//     alert("Erro ao carregar sugestões.");
//   }
// }

// // Carregar sugestões ao abrir a aba
// document
//   .querySelector('[data-tab="ver-sugestoes"]')
//   .addEventListener("click", carregarSugestoes);
