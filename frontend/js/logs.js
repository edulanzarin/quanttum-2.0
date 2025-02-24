document.addEventListener("DOMContentLoaded", function () {
  const filtrarBtn = document.getElementById("filtrar");
  const idUsuarioInput = document.getElementById("id_usuario");
  const dataInicioInput = document.getElementById("data_inicio");
  const dataFimInput = document.getElementById("data_fim");

  // Verifica se há um usuário logado no localStorage
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Se houver um usuário logado, preenche o campo id_usuario automaticamente
  if (usuario && usuario.id) {
    idUsuarioInput.value = usuario.id;
  }

  filtrarBtn.addEventListener("click", async function () {
    const idUsuario = idUsuarioInput.value.trim(); // Obtém o valor do campo id_usuario
    const dataInicio = dataInicioInput.value; // Obtém o valor do campo data_inicio
    const dataFim = dataFimInput.value; // Obtém o valor do campo data_fim

    // Validação do campo id_usuario
    if (!idUsuario) {
      createNotification(
        "É necessário inserir o id do usuário",
        "#1d1830",
        "darkgreen",
        errorGifUrl
      );
      return; // Impede a execução da função se o campo estiver vazio
    }

    try {
      let idUsuarioFiltro = idUsuario; // Valor padrão é o que foi digitado no campo

      // Verifica se o usuário digitou "all" no campo id_usuario
      if (idUsuario.toLowerCase() === "all") {
        idUsuarioFiltro = null; // Passa null para obter todos os logs, sem filtrar por ID
      }

      showLoadingModal("Baixando logs...");

      // Chama a função para obter logs
      const resultado = await window.electronAPI.obterLogs(
        idUsuarioFiltro, // Passa o valor do ID ou null (caso seja "all")
        dataInicio || null, // Passa a data de início ou null
        dataFim || null // Passa a data de fim ou null
      );

      hideLoadingModal();

      if (resultado.success) {
        createNotification(
          "Logs baixados com sucesso!",
          "#1d1830",
          "darkgreen",
          successGifUrl
        );
      } else {
        createNotification(
          `Erro ao obter logs: ${resultado.message}`,
          "error",
          "#1d1830",
          "darkgreen",
          errorGifUrl
        );
      }
    } catch (error) {
      createNotification(
        "Erro ao conectar com o servidor.",
        "error",
        "error",
        "#1d1830",
        "darkgreen",
        errorGifUrl
      );
    }
  });
});
