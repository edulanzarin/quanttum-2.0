// Importa as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-analytics.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// 🔹 Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA9NhITakVX__c5aiiYNp0rX8z0WfXcTwY",
  authDomain: "quanttum2.firebaseapp.com",
  projectId: "quanttum2",
  storageBucket: "quanttum2.firebasestorage.app",
  messagingSenderId: "642949416782",
  appId: "1:642949416782:web:a4fdfd25a6d63e2944801f",
  measurementId: "G-1BV3HZPLX6"
};

// 🔹 Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

document.getElementById("login").addEventListener("click", async () => {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;
  
    if (!usuario || !senha) {
        createNotification(
            "Preencha todos os campos.",
            "#1d1830",
            "darkred",
            errorGifUrl
          );
      return;
    }
  
    try {
      // 🔹 Obtém todos os documentos da coleção "usuarios"
      const querySnapshot = await getDocs(collection(db, "usuarios"));
  
      let usuarioEncontrado = null;
      let usuarioId = null;  // Variável para armazenar o id do documento
  
      querySnapshot.forEach((doc) => {
        const dados = doc.data(); 
        if (dados.usuario === usuario && dados.senha === senha) {
          usuarioEncontrado = dados;
          usuarioId = doc.id;  // Pega o id do documento
        }
      });
  
      if (usuarioEncontrado) {
        // 🔹 Salva os dados do usuário no localStorage (exceto senha)
        localStorage.setItem("usuario", usuarioEncontrado.usuario);
        localStorage.setItem("nome", usuarioEncontrado.nome);
        localStorage.setItem("usuarioId", usuarioId);  
  
        // 🔹 Redireciona para index.html
        window.location.href = "index.html";
      } else {
          createNotification(
              "Usuário ou senha incorretos!",
              "#1d1830",
              "darkred",
              errorGifUrl
            );
      }
    } catch (error) {
      console.error("Erro ao verificar login:", error);
      createNotification(
          "Erro ao processar login.",
          "#1d1830",
          "darkred",
          errorGifUrl
        );
    }
  });
  
  // URLs dos GIFs de sucesso e erro
const successGifUrl = "../assets/animations/success.gif";
const errorGifUrl = "../assets/animations/error.gif";

// Função para criar notificações empilháveis
function createNotification(message, backgroundColor, borderColor, gifUrl) {
  // Cria um novo elemento de notificação
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.textContent = message;
  notification.style.backgroundColor = backgroundColor;
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
  }, 5000);
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
