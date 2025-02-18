const processarBtn = document.querySelector(".process-btn");
const filePath = document.getElementById("filePath");
const pagosCheckbox = document.getElementById("pagos");
const recebidosCheckbox = document.getElementById("recebidos");
const bancoSelect = document.getElementById("banco"); // Captura o select do banco

// Função para abrir o seletor de arquivos usando o Electron
document.querySelector(".file-label").addEventListener("click", () => {
    window.electronAPI
        .selecionarArquivo()
        .then((caminho) => {
            if (caminho) {
                filePath.value = caminho;
            }
        })
        .catch((err) => {
            console.error("Erro ao selecionar o arquivo:", err);
        });
});

// Função para processar o arquivo
processarBtn.addEventListener("click", async () => {
    const caminhoPdf = filePath.value;
    const bancoSelecionado = bancoSelect.value;

    // Verifica se um banco foi selecionado
    if (!bancoSelecionado) {
        createNotification("É necessário selecionar um banco.", "#1d1830", "darkred", errorGifUrl);
        return;
    }

    // Verifica se o arquivo foi selecionado
    if (!caminhoPdf) {
        createNotification("É necessário selecionar um arquivo.", "#1d1830", "darkred", errorGifUrl);
        return;
    }

    try {
        showLoadingModal();
        // Chama a função do Electron passando o banco e o arquivo
        const resultado = await window.electronAPI.gerenciarBancos(bancoSelecionado, caminhoPdf);
        hideLoadingModal();

        if (resultado.status === "success") {
            createNotification(
                "Relatório processado com sucesso!",
                "#1d1830",
                "darkgreen",
                successGifUrl
            );
        } else {
            createNotification(`Erro: ${resultado.message}`, "#1d1830", "darkred", errorGifUrl);
        }
    } catch (erro) {
        console.error("Erro ao processar o arquivo:", erro);
        createNotification("Ocorreu um erro ao processar o arquivo.", "red", "darkred");
    }
});
