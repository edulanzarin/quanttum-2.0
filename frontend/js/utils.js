// URLs dos GIFs de sucesso e erro
const successGifUrl = "../assets/animations/success.gif";
const errorGifUrl = "../assets/animations/error.gif";

// Função para criar notificações empilháveis
function createNotification(message, backgroundColor, borderColor, gifUrl) {
  // Cria um novo elemento de notificação
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.textContent = message;
  notification.style.backgroundColor = " #333333;";
  notification.style.border = `2px solid ${borderColor}`;
  notification.style.position = "fixed";
  notification.style.right = "10px";
  notification.style.padding = "10px";
  notification.style.zIndex = 1000;

  // Adiciona o GIF de sucesso ou erro
  const gif = document.createElement("img");
  gif.src = gifUrl;
  gif.style.width = "20px";
  gif.style.marginRight = "10px";
  notification.prepend(gif);

  // Define a posição 'top' com base nas notificações existentes
  const topOffset = calculateNotificationOffset();
  notification.style.top = `${topOffset}px`;

  // Adiciona a notificação ao body
  document.body.appendChild(notification);

  // Remove a notificação após 5 segundos e atualiza as posições
  setTimeout(() => {
    notification.remove();
    updateNotificationPositions();
  }, 7000);
}

// Função para calcular a posição 'top' da nova notificação
function calculateNotificationOffset() {
  const notifications = document.querySelectorAll(".notification");
  let topOffset = 80;

  notifications.forEach((notification) => {
    topOffset += notification.offsetHeight + 10;
  });

  return topOffset;
}

// Função para atualizar a posição das notificações restantes
function updateNotificationPositions() {
  const notifications = document.querySelectorAll(".notification");
  let topOffset = 80;

  notifications.forEach((notification) => {
    notification.style.top = `${topOffset}px`; // Recalcula a posição 'top'
    topOffset += notification.offsetHeight + 10; // Atualiza o próximo valor de 'top'
  });
}

// Função para mostrar o modal de carregamento e criar a estrutura HTML
const showLoadingModal = () => {
  let loadingModal = document.getElementById("loading-modal");
  if (!loadingModal) {
    loadingModal = document.createElement("div");
    loadingModal.id = "loading-modal";
    loadingModal.className = "loading-modal";
    loadingModal.style.display = "flex";

    const loadingContent = document.createElement("div");
    loadingContent.className = "loading-content";

    const loadingImage = document.createElement("img");
    loadingImage.src = "../assets/animations/loading.gif";
    loadingImage.alt = "Carregando...";

    const loadingText = document.createElement("p");
    loadingText.textContent = "Tudo estará pronto em breve...";

    loadingContent.appendChild(loadingImage);
    loadingContent.appendChild(loadingText);

    loadingModal.appendChild(loadingContent);

    document.body.appendChild(loadingModal);
  } else {
    loadingModal.style.display = "flex";
  }
};

// Função para esconder o modal de carregamento
const hideLoadingModal = () => {
  const loadingModal = document.getElementById("loading-modal");
  if (loadingModal) {
    loadingModal.style.display = "none";
  }
};

// Dados dos submenus organizados por categoria
const submenus = {
  contabil: {
    EMPRESAS: [
      { icon: "fas fa-building", title: "Chocoleite", link: "chocoleite.html" },
      { icon: "fas fa-building", title: "DCondor", link: "dcondor.html" },
      {
        icon: "fas fa-building",
        title: "Qualitplacas",
        link: "qualitplacas.html",
      },
      { icon: "fas fa-building", title: "2R Distribuidora", link: "2r.html" },
    ],
    EXTRATOS: [
      { icon: "fas fa-university", title: "Extrato", link: "bancos.html" },
      { icon: "fas fa-university", title: "Conciliar", link: "conciliar.html" },
      {
        icon: "fas fa-university",
        title: "Conciliação",
        link: "conciliacao.html",
      },
    ],
    ARQUIVOS: [{ icon: "fas fa-folder", title: "DIRF", link: "dirf.html" }],
  },
  fiscal: {
    ARQUIVOS: [
      {
        icon: "fas fa-folder",
        title: "Renomear DAS",
        link: "renomear_das.html",
      },
    ],
  },
  rh: {
    ARQUIVOS: [
      {
        icon: "fas fa-folder",
        title: "Alterar Nome Folhas",
        link: "alterar_nome_folha.html",
      },
    ],
  },
  geral: {
    GERAL: [
      {
        icon: "fas fa-tools",
        title: "Extrair Arquivos",
        link: "extrair_arquivos.html",
      },
      {
        icon: "fas fa-tools",
        title: "Mover Arquivos",
        link: "mover_arquivos.html",
      },
      {
        icon: "fas fa-tools",
        title: "Enviar Emails",
        link: "enviar_emails.html",
      },
    ],
  },
};

// Função para exibir os submenus no main
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");
  const submenuContent = document.getElementById("submenu-content");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const menu = link.getAttribute("data-menu");
      submenuContent.innerHTML = ""; // Limpa o conteúdo anterior

      if (submenus[menu]) {
        for (const [category, items] of Object.entries(submenus[menu])) {
          const section = document.createElement("div");
          section.className = "submenu-section";
          section.innerHTML = `<h2>${category}</h2>`;

          const cardsContainer = document.createElement("div");
          cardsContainer.className = "cards-container";

          items.forEach((item) => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
              <i class="${item.icon}"></i>
              <span>${item.title}</span>
            `;
            card.addEventListener("click", () => {
              window.location.href = item.link;
            });
            cardsContainer.appendChild(card);
          });

          section.appendChild(cardsContainer);
          submenuContent.appendChild(section);
        }
      }
    });
  });
});
