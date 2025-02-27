async function verificarUsuario() {
  const usuarioJson = localStorage.getItem("usuario");

  // Verifica se o usuário está no localStorage
  if (!usuarioJson) {
    redirecionarParaLogin();
    return;
  }

  const usuario = JSON.parse(usuarioJson);

  try {
    // Adiciona a primeira letra do nome na classe .user-letter
    const primeiraLetra = usuario.nome.charAt(0).toLowerCase();
    const userLetterElement = document.querySelector(".user-letter");

    if (userLetterElement) {
      // Atualiza a classe do elemento com a letra
      userLetterElement.className = `fa-regular fa-${primeiraLetra}`;
    }
  } catch (error) {
    console.error("Erro ao conectar com o servidor:", error);
    redirecionarParaLogin();
  }
}

// Evento de logout ao clicar no botão com ID "logout"
document.addEventListener("DOMContentLoaded", () => {
  verificarUsuario();

  const logoutButton = document.getElementById("logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", redirecionarParaLogin);
  }
});

// Função para limpar localStorage e redirecionar para login
function redirecionarParaLogin() {
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}

// URLs dos GIFs de sucesso e erro
const successGifUrl = "../assets/animations/success.gif";
const errorGifUrl = "../assets/animations/error.gif";

// Função para criar notificações empilháveis
function createNotification(message, backgroundColor, borderColor, gifUrl) {
  // Cria um novo elemento de notificação
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
  notification.style.borderColor = "#6f00ff";

  // Adiciona o GIF de sucesso ou erro
  const gif = document.createElement("img");
  gif.src = gifUrl;
  gif.style.width = "24px";
  gif.style.height = "24px";
  gif.style.marginRight = "10px";
  notification.appendChild(gif);

  // Adiciona o texto da notificação
  const text = document.createElement("span");
  text.textContent = message;
  notification.appendChild(text);

  // Adiciona o ícone de "copiar"
  const copyIcon = document.createElement("span");
  copyIcon.classList.add("copy-icon", "material-symbols-rounded");
  copyIcon.textContent = "content_copy";
  notification.appendChild(copyIcon);

  // Define a posição 'top' com base nas notificações existentes
  const topOffset = calculateNotificationOffset();
  notification.style.top = `${topOffset}px`;

  // Adiciona a notificação ao body
  document.body.appendChild(notification);

  // Adiciona o evento de clique para copiar o conteúdo
  notification.addEventListener("click", () => {
    navigator.clipboard
      .writeText(message)
      .then(() => {
        console.log("Conteúdo copiado para a área de transferência: ", message);
        // Mostra uma mensagem de confirmação
        const confirmation = document.createElement("div");
        confirmation.textContent = "Copiado!";
        confirmation.style.position = "absolute";
        confirmation.style.bottom = "2px";
        confirmation.style.right = "10px";
        confirmation.style.fontSize = "8px";
        confirmation.style.color = "#6f00ff";
        notification.appendChild(confirmation);

        setTimeout(() => {
          confirmation.remove();
        }, 2000);
      })
      .catch((err) => {
        console.error("Erro ao copiar o conteúdo: ", err);
      });
  });

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
const showLoadingModal = (mensagem = "Processando...") => {
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
    loadingText.textContent = mensagem;

    loadingContent.appendChild(loadingImage);
    loadingContent.appendChild(loadingText);

    loadingModal.appendChild(loadingContent);

    document.body.appendChild(loadingModal);
  } else {
    loadingModal.style.display = "flex";
    const loadingText = loadingModal.querySelector("p");
    loadingText.textContent = mensagem;
  }
};

// Função para esconder o modal de carregamento
const hideLoadingModal = () => {
  const loadingModal = document.getElementById("loading-modal");
  if (loadingModal) {
    loadingModal.style.display = "none";
  }
};
