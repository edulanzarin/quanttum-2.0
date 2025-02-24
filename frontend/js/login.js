async function handleLogin() {
  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!usuario || !senha) {
    showMessage("Por favor, preencha todos os campos.", "error");
    return;
  }

  try {
    // Faz o login
    const resultado = await window.electronAPI.gerenciarUsuario(
      "login",
      null,
      usuario,
      senha
    );

    if (resultado.success) {
      showMessage("Login bem-sucedido!", "success");

      // Obtém os dados completos do usuário usando o ID retornado
      const idUsuario = resultado.usuario.id;
      const usuarioCompleto = await window.electronAPI.gerenciarUsuario(
        "obter",
        idUsuario
      );

      if (usuarioCompleto.success) {
        // Salva os dados no localStorage
        localStorage.setItem(
          "usuario",
          JSON.stringify(usuarioCompleto.usuario)
        );
        console.log(
          "Dados do usuário salvos no localStorage:",
          usuarioCompleto.usuario
        );

        // Redireciona para a próxima página após 2 segundos
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      } else {
        showMessage("Erro ao obter dados do usuário.", "error");
      }
    } else {
      showMessage(resultado.message, "error");
    }
  } catch (error) {
    showMessage("Erro ao conectar com o servidor.", "error");
    console.error("Erro:", error);
  }
}

// Função para exibir mensagens na tela
function showMessage(message, type) {
  const messageElement = document.getElementById("message");
  messageElement.textContent = message;
  messageElement.className = `message ${type}`;
  messageElement.style.display = "block";

  setTimeout(() => {
    messageElement.style.display = "none";
  }, 5000);
}

// Adiciona o evento de clique ao botão de login
document.getElementById("login").addEventListener("click", handleLogin);
