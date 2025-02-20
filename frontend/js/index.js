// Importa as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// 🔹 Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA9NhITakVX__c5aiiYNp0rX8z0WfXcTwY",
  authDomain: "quanttum2.firebaseapp.com",
  projectId: "quanttum2",
  storageBucket: "quanttum2.appspot.com",
  messagingSenderId: "642949416782",
  appId: "1:642949416782:web:a4fdfd25a6d63e2944801f",
  measurementId: "G-1BV3HZPLX6",
};

// 🔹 Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Verifica se o usuário está logado e se o status está "on"
window.onload = async () => {
  const usuarioId = localStorage.getItem("usuarioId");
  const nomeUsuario = localStorage.getItem("nome");

  if (!usuarioId) {
    // Se não encontrar o id, redireciona para a página de login
    window.location.href = "login.html";
    return;
  }

  // Atualiza o nome do usuário no elemento "nome-usuario"
  const nomeUsuarioElement = document.getElementById("nome-usuario");
  if (nomeUsuarioElement) {
    nomeUsuarioElement.textContent = nomeUsuario; // Define o nome do usuário no elemento
  }

  try {
    // 🔹 Obtém o documento do usuário com o id do localStorage
    const docRef = doc(db, "usuarios", usuarioId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const usuario = docSnap.data();
      const status = usuario.status;

      if (status === "on") {
        // Se o status for "on", o usuário permanece na página
        console.log("Usuário ativo, permanecendo na página.");
      } else {
        // Se o status não for "on", redireciona para o login
        window.location.href = "login.html";
      }
    } else {
      // Se o documento do usuário não existir, redireciona para o login
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Erro ao verificar usuário:", error);
    window.location.href = "login.html"; // Em caso de erro, redireciona para o login
  }
};
