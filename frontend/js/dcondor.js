const processarBtn = document.querySelector(".process-btn");
const filePathLivrosFiscais = document.getElementById("filePathLivrosFiscais");
const filePathContabilidade = document.getElementById("filePathContabilidade");

// Função para abrir o seletor de arquivos usando o Electron
document.querySelectorAll(".file-label").forEach((label, index) => {
  label.addEventListener("click", () => {
    // Abre o seletor de arquivos via Electron API
    window.electronAPI
      .selecionarArquivo()
      .then((caminho) => {
        if (caminho) {
          // Atualiza o campo com o caminho do arquivo selecionado
          if (index === 0) {
            filePathLivrosFiscais.value = caminho;
          } else {
            filePathContabilidade.value = caminho;
          }
        }
      })
      .catch((err) => {
        console.error("Erro ao selecionar o arquivo:", err);
      });
  });
});

// Função para processar os arquivos
processarBtn.addEventListener("click", async () => {
  const caminhoLivrosFiscais = filePathLivrosFiscais.value;
  const caminhoContabilidade = filePathContabilidade.value;

  // Verifica se ambos os arquivos foram selecionados
  if (!caminhoLivrosFiscais || !caminhoContabilidade) {
    createNotification(
      "É necessário selecionar ambas as planilhas.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  try {
    showLoadingModal();
    // Chama a função do Electron para processar as planilhas DCondor
    const resultado = await window.electronAPI.processarPlanilhasDCondor(
      caminhoLivrosFiscais,
      caminhoContabilidade
    );
    hideLoadingModal();

    // Exibe o retorno
    if (resultado.status === "sucesso") {
      createNotification(
        "Planilhas processadas com sucesso!",
        "#1d1830",
        "darkgreen",
        successGifUrl
      );
    } else {
      createNotification(
        `Erro: ${resultado.mensagem}`,
        "#1d1830",
        "darkred",
        errorGifUrl
      );
    }
  } catch (erro) {
    console.error("Erro ao processar as planilhas:", erro);
    createNotification(
      "Ocorreu um erro ao processar as planilhas.",
      "red",
      "darkred"
    );
  }
});

const jsonBtn = document.querySelector(".json-btn");
const jsonContainer = document.getElementById("jsonContainer");
const addBtn = document.querySelector(".add-btn");
const modal = document.getElementById("modal");
const saveBtn = document.querySelector(".save-btn");
const cancelBtn = document.querySelector(".cancel-btn");

jsonBtn.addEventListener("click", async () => {
  if (jsonContainer.style.display === "none") {
    jsonContainer.style.display = "flex";
  } else {
    jsonContainer.style.display = "none";
  }

  // Exibe o gif de carregamento e esconde a tabela
  document.getElementById("loadingGif").style.display = "block";
  const cfopTable = document.getElementById("cfop-table");
  cfopTable.style.display = "none"; // Esconde a tabela enquanto os dados estão carregando

  // Chama o IPC para obter os CFOPs
  try {
    const cfops = await window.electronAPI.obterCfopDCondor();

    // Limpa o conteúdo da tabela antes de adicionar os novos dados
    const cfopTableBody = document.getElementById("cfopTableBody");
    cfopTableBody.innerHTML = ""; // Limpa o conteúdo

    // Preenche a tabela com os dados recebidos
    cfops.forEach((cfop) => {
      const newRow = document.createElement("tr");

      const newCFOP = document.createElement("td");
      newCFOP.innerText = cfop.cfop;

      const newDesc = document.createElement("td");
      newDesc.innerText = cfop.descricao;

      const newActions = document.createElement("td");

      // Criação dos botões de editar e deletar
      const editBtn = document.createElement("button");
      const deleteBtn = document.createElement("button");

      // Adicionando as classes de estilo para os botões
      editBtn.classList.add("edit-btn");
      deleteBtn.classList.add("delete-btn");

      // Usando innerHTML para adicionar o ícone de editar e deletar
      editBtn.innerHTML = '<i class="fas fa-edit"></i>'; // Adiciona o ícone de editar
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'; // Adiciona o ícone de deletar

      // Adicionando os botões à célula (td)
      newActions.appendChild(editBtn);
      newActions.appendChild(deleteBtn);

      newRow.appendChild(newCFOP);
      newRow.appendChild(newDesc);
      newRow.appendChild(newActions);

      cfopTableBody.appendChild(newRow);
    });

    // Esconde o gif de carregamento e mostra a tabela
    document.getElementById("loadingGif").style.display = "none";
    addBtn.style.display = "flex";

    cfopTable.style.display = "table"; // Mostra a tabela novamente
  } catch (error) {
    createNotification(
      "Erro ao carregar CFOPS.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    document.getElementById("loadingGif").style.display = "none"; // Esconde o gif mesmo em caso de erro
  }
});

// Ação para abrir o modal
addBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Ação para salvar as novas informações
saveBtn.addEventListener("click", async () => {
  const cfopInput = document.getElementById("cfopInput");
  const descInput = document.getElementById("descInput");
  const cfop = cfopInput.value;
  const referencia = descInput.value;

  // Verifica se os campos estão preenchidos
  if (cfop && referencia) {
    try {
      // Chama a função para adicionar o CFOP no backend
      const addCFOP = await window.electronAPI.adicionarCfopDCondor(
        cfop,
        referencia
      );

      // Verifica se o CFOP foi adicionado com sucesso
      if (addCFOP.success) {
        // Se foi bem-sucedido, adiciona o CFOP na tabela
        const cfopTableBody = document.getElementById("cfopTableBody");
        const newRow = document.createElement("tr");

        const newCFOP = document.createElement("td");
        newCFOP.contentEditable = true;
        newCFOP.innerText = cfop;

        const newDesc = document.createElement("td");
        newDesc.contentEditable = true;
        newDesc.innerText = referencia;

        const newActions = document.createElement("td");
        const editBtn = document.createElement("button");
        const deleteBtn = document.createElement("button");

        // Adicionando as classes de estilo para os botões
        editBtn.classList.add("edit-btn");
        deleteBtn.classList.add("delete-btn");

        // Usando innerHTML para adicionar o ícone de editar e deletar
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';

        // Adiciona os botões às ações
        newActions.appendChild(editBtn);
        newActions.appendChild(deleteBtn);

        // Adiciona a nova linha à tabela
        newRow.appendChild(newCFOP);
        newRow.appendChild(newDesc);
        newRow.appendChild(newActions);
        cfopTableBody.appendChild(newRow);

        // Limpa os campos do modal
        cfopInput.value = "";
        descInput.value = "";

        // Fecha o modal
        modal.style.display = "none";
      } else {
        createNotification(addCFOP.message, "#1d1830", "darkred", errorGifUrl);
      }
    } catch (error) {
      createNotification(
        "Erro ao adicionar CFOP.",
        "#1d1830",
        "darkred",
        errorGifUrl
      );
    }
  } else {
    createNotification(
      "É necessário preencher todos os campos.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
  }
});

// Ação para cancelar e fechar o modal
cancelBtn.addEventListener("click", () => {
  cfopInput.value = "";
  descInput.value = "";
  modal.style.display = "none";
});

const editBtns = document.querySelectorAll(".edit-btn");
const editModal = document.getElementById("editModal");
const editCfopInput = document.getElementById("editCfopInput");
const editDescInput = document.getElementById("editDescInput");
const saveEditBtn = document.querySelector(".edit-save-btn");
const cancelEditBtn = document.querySelector(".edit-cancel-btn");

// Abrir o modal de edição ao clicar no botão Editar
editBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    const row = btn.closest("tr");
    const cfop = row.cells[0].innerText;
    const referencia = row.cells[1].innerText;

    editCfopInput.value = cfop;
    editDescInput.value = referencia;

    editModal.style.display = "flex";
  });
});

// Salvar as alterações
saveEditBtn.addEventListener("click", () => {
  const newCfop = editCfopInput.value;
  const newReferencia = editDescInput.value;

  if (newCfop && newReferencia) {
    const row = document.querySelector(
      `#cfopTableBody tr:nth-child(${index + 1})`
    );
    row.cells[0].innerText = newCfop; // Atualiza o CFOP
    row.cells[1].innerText = newReferencia; // Atualiza a referência

    editModal.style.display = "none"; // Fecha o modal
  } else {
    alert("Por favor, preencha todos os campos.");
  }
});

// Cancelar a edição
cancelEditBtn.addEventListener("click", () => {
  editCfopInput.value = "";
  editDescInput.value = "";
  editModal.style.display = "none"; // Fecha o modal de edição
});
