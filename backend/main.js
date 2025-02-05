const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { execFile } = require("child_process");

let mainWindow;

// Função para criar a janela principal da aplicação
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "../frontend/assets/images/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      sandbox: false,
    },
    autoHideMenuBar: true,
  });

  // Carregar o HTML com o caminho correto
  mainWindow.loadFile(path.join(__dirname, "../frontend/pages/index.html"));
  mainWindow.maximize();
}

// Evento quando a aplicação está pronta
app.on("ready", async () => {
  app.commandLine.appendSwitch("no-sandbox");
  try {
    createWindow();
  } catch (error) {
    console.error("Erro ao criar a janela:", error.message);
    app.quit();
  }
});

// Função para selecionar arquivo (abre o diálogo)
ipcMain.handle("selecionar-arquivo", async () => {
  const result = await dialog.showOpenDialog({
    title: "Escolha um arquivo",
    properties: ["openFile"],
    filters: [{ name: "Todos os arquivos", extensions: ["*"] }],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

const pythonPath =
  "P:\\PUBLICO 2025\\CONTABIL\\EDUARDO\\Automatizações\\Python311\\python.exe"; // Caminho específico

// Função para chamar o script Python e processar os pagamentos
function processarPagosChocoleite(caminho_pdf) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/empresas.py"),
        "processar_pagos_chocoleite",
        caminho_pdf,
      ],
      (error, stdout, stderr) => {
        if (error) {
          reject(`Erro: ${error.message}`);
          return;
        }
        if (stderr) {
          reject(`Erro: ${stderr}`);
          return;
        }
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          reject("Erro ao processar a resposta do Python.");
        }
      }
    );
  });
}

// Função para chamar o script Python e processar os recebidos
function processarRecebidosChocoleite(caminho_pdf) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/chocoleite.py"),
        "processar_recebidos_chocoleite",
        caminho_pdf,
      ],
      (error, stdout, stderr) => {
        if (error) {
          reject(`Erro: ${error.message}`);
          return;
        }
        if (stderr) {
          reject(`Erro: ${stderr}`);
          return;
        }
        try {
          const result = JSON.parse(stdout); // Certifique-se que o Python está retornando JSON
          resolve(result);
        } catch (e) {
          reject("Erro ao processar a resposta do Python.");
        }
      }
    );
  });
}

// Recebendo o pedido de processar o pagamento do frontend
ipcMain.handle("processar-pagos-chocoleite", async (event, caminho_pdf) => {
  try {
    const result = await processarPagosChocoleite(caminho_pdf);
    return result;
  } catch (error) {
    return { success: false, message: error };
  }
});

// Recebendo o pedido de processar os recebidos do frontend
ipcMain.handle("processar-recebidos-chocoleite", async (event, caminho_pdf) => {
  try {
    const result = await processarRecebidosChocoleite(caminho_pdf);
    return result;
  } catch (error) {
    return { success: false, message: error };
  }
});

// Função para chamar o script Python e processar as planilhas
function processarPlanilhasDCondor(
  caminho_livros_fiscais,
  caminho_contabilidade_gerencial
) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/dcondor.py"),
        "processar_planilhas", // Nome da função ou comando do script Python
        caminho_livros_fiscais,
        caminho_contabilidade_gerencial,
      ],
      (error, stdout, stderr) => {
        if (error) {
          reject(`Erro: ${error.message}`);
          return;
        }
        if (stderr) {
          reject(`Erro: ${stderr}`);
          return;
        }
        try {
          const result = JSON.parse(stdout); // Certifique-se que o Python está retornando JSON
          resolve(result);
        } catch (e) {
          reject("Erro ao processar a resposta do Python.");
        }
      }
    );
  });
}

// Recebendo o pedido de processar as planilhas do frontend
ipcMain.handle(
  "processar-planilhas-dcondor",
  async (event, caminho_livros_fiscais, caminho_contabilidade_gerencial) => {
    try {
      const result = await processarPlanilhasDCondor(
        caminho_livros_fiscais,
        caminho_contabilidade_gerencial
      );
      return result;
    } catch (error) {
      return { success: false, message: error };
    }
  }
);

async function obterCfopDCondor() {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [path.join(__dirname, "scripts/dcondor.py"), "obter_cfop"],
      (error, stdout, stderr) => {
        if (error) {
          reject(`Erro: ${error.message}`);
          return;
        }

        try {
          const result = JSON.parse(stdout.trim()); // Remove espaços extras

          if (!result.success || !Array.isArray(result.cfops)) {
            reject("Resposta inválida do Python");
          } else {
            resolve(result.cfops);
          }
        } catch (e) {
          reject(`Erro ao processar a resposta do Python: ${stdout}`);
        }
      }
    );
  });
}

// Recebendo o pedido para obter os CFOPs do frontend
ipcMain.handle("obter-cfop-dcondor", async (event) => {
  try {
    const result = await obterCfopDCondor();
    return result;
  } catch (error) {
    return { success: false, message: error };
  }
});
