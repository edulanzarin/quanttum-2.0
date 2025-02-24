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
    loadingText.textContent = "Processando...";

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
