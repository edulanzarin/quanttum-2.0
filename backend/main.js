const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { execFile } = require("child_process");
const fs = require("fs");

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
  mainWindow.loadFile(path.join(__dirname, "../frontend/pages/auth.html"));
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

const pythonPath =
  "P:\\PUBLICO 2025\\CONTABIL\\EDUARDO\\Automatizações\\Python311\\python.exe"; // Caminho específico

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

// Função para selecionar diretório (abre o diálogo)
ipcMain.handle("selecionar-pasta", async () => {
  const result = await dialog.showOpenDialog({
    title: "Escolha uma pasta",
    properties: ["openDirectory"], // Altera para 'openDirectory' para selecionar uma pasta
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0]; // Retorna o caminho da pasta selecionada
});

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

// Recebendo o pedido de processar o pagamento do frontend
ipcMain.handle("processar-pagos-chocoleite", async (event, caminho_pdf) => {
  try {
    const result = await processarPagosChocoleite(caminho_pdf);
    return result;
  } catch (error) {
    return { success: false, message: error };
  }
});

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
        "processar_planilhas",
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
          console.error(`Erro ao executar script Python: ${error.message}`);
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

// Função para adicionar CFOP
async function adicionarCfop(cfop, referencia) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/dcondor.py"),
        "adicionar_cfop",
        cfop,
        referencia,
      ],
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar script Python: ${error.message}`);
          reject(`Erro: ${error.message}`);
          return;
        }

        try {
          const result = JSON.parse(stdout.trim()); // Remove espaços extras

          if (!result.success) {
            reject(result.message);
          } else {
            resolve(result.message);
          }
        } catch (e) {
          reject(`Erro ao processar a resposta do Python: ${stdout}`);
        }
      }
    );
  });
}

// Recebendo o pedido para adicionar um CFOP no frontend via IPC
ipcMain.handle("adicionar-cfop-dcondor", async (event, cfop, referencia) => {
  try {
    const result = await adicionarCfop(cfop, referencia);
    return { success: true, message: result };
  } catch (error) {
    return { success: false, message: error };
  }
});

// Função para adicionar CFOP
async function apagarCfop(cfop) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [path.join(__dirname, "scripts/dcondor.py"), "apagar_cfop", cfop],
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar script Python: ${error.message}`);
          reject(`Erro: ${error.message}`);
          return;
        }

        try {
          const result = JSON.parse(stdout.trim()); // Remove espaços extras

          if (!result.success) {
            reject(result.message);
          } else {
            resolve(result.message);
          }
        } catch (e) {
          reject(`Erro ao processar a resposta do Python: ${stdout}`);
        }
      }
    );
  });
}

// Recebendo o pedido para adicionar um CFOP no frontend via IPC
ipcMain.handle("apagar-cfop-dcondor", async (event, cfop) => {
  try {
    const result = await apagarCfop(cfop);
    return { success: true, message: result };
  } catch (error) {
    return { success: false, message: error };
  }
});

async function extrairArquivos(origem, destino, incluir_subpastas) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/extrair_arquivos.py"),
        "extrair_arquivos",
        origem,
        destino,
        incluir_subpastas,
      ],
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar script Python: ${error.message}`);
          reject(`Erro: ${error.message}`);
          return;
        }

        const result = stdout.trim(); // Remova o JSON.parse

        if (result.includes("Erro")) {
          reject(result);
        } else {
          resolve(result);
        }
      }
    );
  });
}

// Recebendo o pedido para adicionar um CFOP no frontend via IPC
ipcMain.handle(
  "extrair-arquivos",
  async (event, origem, destino, incluir_subpastas) => {
    try {
      const result = await extrairArquivos(origem, destino, incluir_subpastas);
      return { success: true, message: result };
    } catch (error) {
      return { success: false, message: error };
    }
  }
);

async function moverArquivos(origem, destino, incluir_subpastas) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/mover_arquivos.py"), // Atualize para o novo script
        "mover_arquivos", // Comando atualizado
        origem,
        destino,
        incluir_subpastas,
      ],
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar script Python: ${error.message}`);
          reject(`Erro: ${error.message}`);
          return;
        }

        const result = stdout.trim(); // Remova o JSON.parse

        if (result.includes("Erro")) {
          reject(result);
        } else {
          resolve(result);
        }
      }
    );
  });
}

// Recebendo o pedido para mover arquivos no frontend via IPC
ipcMain.handle(
  "mover-arquivos",
  async (event, origem, destino, incluir_subpastas) => {
    try {
      const result = await moverArquivos(origem, destino, incluir_subpastas);
      return { success: true, message: result };
    } catch (error) {
      return { success: false, message: error };
    }
  }
);

async function enviarEmails(
  email_autorizado,
  caminho_planilha,
  caminho_arquivo_email
) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/enviar_emails.py"),
        "enviar_emails",
        email_autorizado,
        caminho_planilha,
        caminho_arquivo_email,
      ],
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar script Python: ${error.message}`);
          reject(`Erro: ${error.message}`);
          return;
        }

        // Aqui estamos tentando tratar o stdout como JSON
        try {
          const result = JSON.parse(stdout.trim());

          if (result.status === "success") {
            resolve(result);
          } else {
            reject(result.message);
          }
        } catch (e) {
          console.error("Erro ao tentar interpretar a resposta do Python:", e);
          reject("Erro ao processar a resposta do Python");
        }
      }
    );
  });
}

// Recebendo o pedido para adicionar um CFOP no frontend via IPC
ipcMain.handle(
  "enviar-emails",
  async (event, email_autorizado, caminho_planilha, caminho_arquivo_email) => {
    try {
      const result = await enviarEmails(
        email_autorizado,
        caminho_planilha,
        caminho_arquivo_email
      );
      return { success: true, message: result.message }; // Retorna como objeto
    } catch (error) {
      return { success: false, message: error }; // Retorna como objeto
    }
  }
);

async function processarDebito2r(caminho_debito) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/2r.py"),
        "processar_debito_2r",
        caminho_debito,
      ],
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar script Python: ${error.message}`);
          reject(`Erro: ${error.message}`);
          return;
        }

        // Aqui estamos tentando tratar o stdout como JSON
        try {
          const result = JSON.parse(stdout.trim());

          if (result.status === "success") {
            resolve(result);
          } else {
            reject(result.message);
          }
        } catch (e) {
          console.error("Erro ao tentar interpretar a resposta do Python:", e);
          reject("Erro ao processar a resposta do Python");
        }
      }
    );
  });
}

// Recebendo o pedido para adicionar um CFOP no frontend via IPC
ipcMain.handle("processar-debito-2r", async (event, caminho_debito) => {
  try {
    const result = await processarDebito2r(caminho_debito);
    return { success: true, message: result.message };
  } catch (error) {
    return { success: false, message: error }; // Retorna como objeto
  }
});

async function processarCredito2r(caminho_credito) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/2r.py"),
        "processar_credito_2r",
        caminho_credito,
      ],
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar script Python: ${error.message}`);
          reject(`Erro: ${error.message}`);
          return;
        }

        // Aqui estamos tentando tratar o stdout como JSON
        try {
          const result = JSON.parse(stdout.trim());

          if (result.status === "success") {
            resolve(result);
          } else {
            reject(result.message);
          }
        } catch (e) {
          console.error("Erro ao tentar interpretar a resposta do Python:", e);
          reject("Erro ao processar a resposta do Python");
        }
      }
    );
  });
}

// Recebendo o pedido para adicionar um CFOP no frontend via IPC
ipcMain.handle("processar-credito-2r", async (event, caminho_credito) => {
  try {
    const result = await processarCredito2r(caminho_credito);
    return { success: true, message: result.message };
  } catch (error) {
    return { success: false, message: error }; // Retorna como objeto
  }
});

// Função para chamar o script Python e processar os pagamentos
function processarDirf(caminho_pdf, modelo) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/dirf.py"),
        "processar_dirf",
        caminho_pdf,
        modelo,
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

// Recebendo o pedido de processar o pagamento do frontend
ipcMain.handle("processar-dirf", async (event, caminho_pdf, modelo) => {
  try {
    const result = await processarDirf(caminho_pdf, modelo);
    return result;
  } catch (error) {
    return { success: false, message: error };
  }
});

async function alterarNomeFolha(caminho, incluirNumeros) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/alterar_nome_folha.py"), // Caminho para o script Python
        "alterar_nome_folha", // Comando para o script Python
        caminho,
        incluirNumeros,
      ],
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar script Python: ${error.message}`);
          reject(`Erro: ${error.message}`);
          return;
        }

        const result = stdout.trim();

        if (result.includes("Erro")) {
          reject(result);
        } else {
          resolve(result);
        }
      }
    );
  });
}

// Recebendo o pedido para alterar o nome dos arquivos PDF no frontend via IPC
ipcMain.handle("alterar-nome-folha", async (event, caminho, incluirNumeros) => {
  try {
    const result = await alterarNomeFolha(caminho, incluirNumeros);
    return { success: true, message: result };
  } catch (error) {
    return { success: false, message: error };
  }
});

async function gerenciarConciliacao(operacao, dados) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/conciliacao.py"),
        "gerenciar_conciliacao",
        operacao,
        JSON.stringify(dados),
      ],
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar script Python: ${error.message}`);
          reject(`Erro: ${error.message}`);
          return;
        }

        const result = stdout.trim();

        try {
          // Tenta parsear o resultado como JSON
          const parsedResult = JSON.parse(result);
          resolve(parsedResult);
        } catch (e) {
          console.error(`Erro ao parsear resultado: ${e.message}`);
          reject(`Erro ao parsear resultado: ${result}`);
        }
      }
    );
  });
}

ipcMain.handle("gerenciar-conciliacao", async (event, operacao, dados) => {
  try {
    const result = await gerenciarConciliacao(operacao, dados);
    return { success: true, data: result }; // Resultado encapsulado em "data"
  } catch (error) {
    return { success: false, message: error };
  }
});

function conciliarPagosBanco(caminhoBanco, caminhoPagos) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath, // Caminho para o Python
      [
        path.join(__dirname, "scripts/conciliar.py"),
        "conciliar_pagos_banco", // Ação a ser executada
        caminhoBanco,
        caminhoPagos,
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

// Recebendo o pedido de conciliação do frontend
ipcMain.handle(
  "conciliar-pagos-banco",
  async (event, caminhoBanco, caminhoPagos) => {
    try {
      const result = await conciliarPagosBanco(caminhoBanco, caminhoPagos);
      return result;
    } catch (error) {
      return { success: false, message: error };
    }
  }
);

// Função para conciliar pagos e banco com filtros adicionais
function conciliarPagosBancoConta(
  caminhoBanco,
  caminhoPagos,
  contaPadrao,
  padraoQuestor,
  numeroEmpresa,
  numeroBanco
) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath, // Caminho para o Python
      [
        path.join(__dirname, "scripts/conciliar.py"),
        "conciliar_pagos_banco_conta",
        caminhoBanco,
        caminhoPagos,
        contaPadrao,
        padraoQuestor,
        numeroEmpresa,
        numeroBanco,
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

// Recebendo o pedido de conciliação do frontend
ipcMain.handle(
  "conciliar-pagos-banco-conta",
  async (
    event,
    caminhoBanco,
    caminhoPagos,
    contaPadrao,
    padraoQuestor,
    numeroEmpresa,
    numeroBanco
  ) => {
    try {
      const result = await conciliarPagosBancoConta(
        caminhoBanco,
        caminhoPagos,
        contaPadrao,
        padraoQuestor,
        numeroEmpresa,
        numeroBanco
      );
      return result;
    } catch (error) {
      return { success: false, message: error };
    }
  }
);

function gerenciarBancos(banco, numero_banco, caminho_pdf) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/bancos.py"),
        banco,
        numero_banco,
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

// Recebendo o pedido de processar bancos do frontend
ipcMain.handle(
  "gerenciar-bancos",
  async (event, banco, numero_banco, caminho_pdf) => {
    try {
      const result = await gerenciarBancos(banco, numero_banco, caminho_pdf);
      return result;
    } catch (error) {
      return { success: false, message: error };
    }
  }
);

async function obterNoticias() {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [path.join(__dirname, "scripts/noticias.py"), "obter_noticias"],
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar script Python: ${error.message}`);
          reject(`Erro: ${error.message}`);
          return;
        }

        try {
          const result = JSON.parse(stdout.trim()); // Remove espaços extras

          if (!result.success || !Array.isArray(result.noticias)) {
            reject("Resposta inválida do Python");
          } else {
            resolve(result.noticias);
          }
        } catch (e) {
          reject(`Erro ao processar a resposta do Python: ${stdout}`);
        }
      }
    );
  });
}

// Recebendo o pedido para obter as notícias do frontend
ipcMain.handle("obter-noticias", async (event) => {
  try {
    const result = await obterNoticias();
    return result;
  } catch (error) {
    return { success: false, message: error };
  }
});

function gerenciarUsuario(acao, id_usuario, usuario, senha, nome, id_funcao) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath, // Comando para executar o Python
      [
        path.join(__dirname, "scripts/usuario.py"),
        acao,
        id_usuario || "",
        usuario || "",
        senha || "",
        nome || "",
        id_funcao || "",
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

// Recebendo o pedido de gerenciar usuários do frontend
ipcMain.handle(
  "gerenciar-usuario",
  async (event, acao, id_usuario, usuario, senha, nome, id_funcao) => {
    try {
      const result = await gerenciarUsuario(
        acao,
        id_usuario,
        usuario,
        senha,
        nome,
        id_funcao
      );
      return result;
    } catch (error) {
      return { success: false, message: error };
    }
  }
);

// Função para adicionar logs
function adicionarLog(id_usuario, funcao) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath, // Comando para executar o Python
      [
        path.join(__dirname, "scripts/logs.py"),
        "adicionar_log",
        id_usuario,
        funcao,
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

// Handlers para as funções de logs
ipcMain.handle("adicionar-log", async (event, id_usuario, funcao) => {
  try {
    const result = await adicionarLog(id_usuario, funcao);
    return result;
  } catch (error) {
    return { success: false, message: error };
  }
});

// Função para obter logs
function obterLogs(id_usuario, data_inicio, data_fim) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath, // Comando para executar o Python
      [
        path.join(__dirname, "scripts/logs.py"),
        "obter_logs",
        id_usuario || "",
        data_inicio || "",
        data_fim || "",
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

ipcMain.handle(
  "obter-logs",
  async (event, id_usuario, data_inicio, data_fim) => {
    try {
      const result = await obterLogs(id_usuario, data_inicio, data_fim);
      return result;
    } catch (error) {
      return { success: false, message: error };
    }
  }
);

// Função para obter logs
function obterLogsNo(id_usuario, data_inicio, data_fim) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath, // Comando para executar o Python
      [
        path.join(__dirname, "scripts/logs.py"),
        "obter_logs_no",
        id_usuario || "",
        data_inicio || "",
        data_fim || "",
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

ipcMain.handle(
  "obter-logs-no",
  async (event, id_usuario, data_inicio, data_fim) => {
    try {
      const result = await obterLogsNo(id_usuario, data_inicio, data_fim);
      return result;
    } catch (error) {
      return { success: false, message: error };
    }
  }
);

async function gerarPDFsReinf(caminhoArquivo) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [path.join(__dirname, "scripts/reinf.py"), caminhoArquivo],
      (error, stdout, stderr) => {
        if (error) {
          reject(`Erro: ${error.message}`);
          return;
        }

        const result = stdout.trim();

        try {
          // Tenta parsear o resultado como JSON
          const parsedResult = JSON.parse(result);
          resolve(parsedResult);
        } catch (e) {
          reject(`Erro ao parsear resultado: ${result}`);
        }
      }
    );
  });
}

// Handler para o IPC "gerar-pdfs"
ipcMain.handle("gerar-pdfs-reinf", async (event, caminhoArquivo) => {
  try {
    const result = await gerarPDFsReinf(caminhoArquivo);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error };
  }
});

// Função para enviar sugestão
async function criarSugestao(idUsuario, texto) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/sugestoes.py"), // Caminho para o script Python
        "criar_sugestao", // Comando para o script Python
        idUsuario,
        texto,
      ],
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar script Python: ${error.message}`);
          reject(`Erro: ${error.message}`);
          return;
        }

        const result = stdout.trim();

        if (result.includes("Erro")) {
          reject(result);
        } else {
          resolve(result);
        }
      }
    );
  });
}

// Função para obter sugestões
async function obterSugestoes() {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/sugestoes.py"), // Caminho para o script Python
        "obter_sugestoes", // Comando para o script Python
      ],
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Erro ao executar script Python: ${error.message}`);
          reject(`Erro: ${error.message}`);
          return;
        }

        const result = stdout.trim();

        if (result.includes("Erro")) {
          reject(result);
        } else {
          resolve(result);
        }
      }
    );
  });
}

// Recebendo o pedido para enviar sugestão no frontend via IPC
ipcMain.handle("criar-sugestao", async (event, idUsuario, texto) => {
  try {
    const result = await criarSugestao(idUsuario, texto);
    return { success: true, message: result };
  } catch (error) {
    return { success: false, message: error };
  }
});

// Recebendo o pedido para obter sugestões no frontend via IPC
ipcMain.handle("obter-sugestoes", async () => {
  try {
    const result = await obterSugestoes();
    return { success: true, message: result };
  } catch (error) {
    return { success: false, message: error };
  }
});

// Função para chamar o script Python e gerar lançamentos
function gerarLancamentos(
  valorTotal,
  valorMaximoTotal,
  dataInicio,
  dataFim,
  tipo
) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/gerar_lancamentos.py"),
        "gerar_lancamentos",
        valorTotal.toString(),
        valorMaximoTotal.toString(),
        dataInicio,
        dataFim,
        tipo,
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

// Recebendo o pedido de gerar lançamentos do frontend
ipcMain.handle(
  "gerar-lancamentos",
  async (event, valorTotal, valorMaximoTotal, dataInicio, dataFim, tipo) => {
    try {
      const result = await gerarLancamentos(
        valorTotal,
        valorMaximoTotal,
        dataInicio,
        dataFim,
        tipo
      );
      return result;
    } catch (error) {
      return { success: false, message: error };
    }
  }
);

// Função para chamar o script Python e gerar despesas
function gerarDespesas(
  valorTotal,
  valorMaximoTotal,
  dataInicio,
  dataFim,
  contas
) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/gerar_lancamentos.py"),
        "gerar_despesas",
        valorTotal.toString(),
        valorMaximoTotal.toString(),
        dataInicio,
        dataFim,
        contas.join(","), // Passa a lista de contas como string separada por vírgula
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

// Recebendo o pedido de gerar despesas do frontend
ipcMain.handle(
  "gerar-despesas",
  async (event, valorTotal, valorMaximoTotal, dataInicio, dataFim, contas) => {
    try {
      const result = await gerarDespesas(
        valorTotal,
        valorMaximoTotal,
        dataInicio,
        dataFim,
        contas
      );
      return result;
    } catch (error) {
      return { success: false, message: error };
    }
  }
);

// Função para chamar o script Python e processar os pagamentos
function processarSafraQualitplacas(caminho_pdf) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/qualitplacas.py"), // Caminho para o script Python
        "processar_safra_qualitplacas", // Argumento para o script Python
        caminho_pdf, // Caminho do PDF passado pelo frontend
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
          const result = JSON.parse(stdout); // Parseia a resposta do Python
          resolve(result);
        } catch (e) {
          reject("Erro ao processar a resposta do Python.");
        }
      }
    );
  });
}

// Recebendo o pedido de processar o pagamento do frontend
ipcMain.handle("processar-safra-qualitplacas", async (event, caminho_pdf) => {
  try {
    const result = await processarSafraQualitplacas(caminho_pdf);
    return result;
  } catch (error) {
    return { success: false, message: error };
  }
});

function processarRelatorioEmpresas() {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath,
      [
        path.join(__dirname, "scripts/dashboard.py"),
        "processar_relatorio_empresas",
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

// Recebendo o pedido de processar o relatório do frontend
ipcMain.handle("processar-relatorio-empresas", async () => {
  try {
    const result = await processarRelatorioEmpresas();
    return result;
  } catch (error) {
    return { success: false, message: error };
  }
});

function conciliarApenasBanco(caminhoBanco, numeroEmpresa, numeroBanco) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath, // Caminho para o Python
      [
        path.join(__dirname, "scripts/conciliar.py"), // Caminho para o script Python
        "conciliar_apenas_banco", // Ação a ser executada
        caminhoBanco,
        numeroEmpresa.toString(), // Converte para string
        numeroBanco.toString(), // Converte para string
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

// Recebendo o pedido de conciliação do frontend
ipcMain.handle(
  "conciliar-apenas-banco",
  async (event, caminhoBanco, numeroEmpresa, numeroBanco) => {
    try {
      const result = await conciliarApenasBanco(
        caminhoBanco,
        numeroEmpresa,
        numeroBanco
      );
      return result;
    } catch (error) {
      return { success: false, message: error };
    }
  }
);

function renomearDas(caminhoPasta, adicionarData, incluirSubpastas) {
  return new Promise((resolve, reject) => {
    execFile(
      pythonPath, // Caminho para o Python
      [
        path.join(__dirname, "scripts/renomear_das.py"), // Caminho para o script Python
        "renomear_das", // Ação a ser executada
        caminhoPasta,
        adicionarData.toString(), // Converte para string
        incluirSubpastas.toString(), // Converte para string
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

// Recebendo o pedido de renomeação do frontend
ipcMain.handle(
  "renomear-das",
  async (event, caminhoPasta, adicionarData, incluirSubpastas) => {
    try {
      const result = await renomearDas(
        caminhoPasta,
        adicionarData,
        incluirSubpastas
      );
      return result;
    } catch (error) {
      return { success: false, message: error };
    }
  }
);
