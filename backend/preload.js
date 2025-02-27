const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selecionarArquivo: () => ipcRenderer.invoke("selecionar-arquivo"),
  selecionarPasta: () => ipcRenderer.invoke("selecionar-pasta"),
  processarPagosChocoleite: (caminho_pdf) =>
    ipcRenderer.invoke("processar-pagos-chocoleite", caminho_pdf),
  processarRecebidosChocoleite: (caminho_pdf) =>
    ipcRenderer.invoke("processar-recebidos-chocoleite", caminho_pdf),
  processarPlanilhasDCondor: (
    caminho_livros_fiscais,
    caminho_contabilidade_gerencial
  ) =>
    ipcRenderer.invoke(
      "processar-planilhas-dcondor",
      caminho_livros_fiscais,
      caminho_contabilidade_gerencial
    ),
  obterCfopDCondor: () => ipcRenderer.invoke("obter-cfop-dcondor"),
  adicionarCfopDCondor: (cfop, referencia) =>
    ipcRenderer.invoke("adicionar-cfop-dcondor", cfop, referencia),
  apagarCfopDCondor: (cfop) => ipcRenderer.invoke("apagar-cfop-dcondor", cfop),
  extrairArquivos: (origem, destino, incluir_subpastas) =>
    ipcRenderer.invoke("extrair-arquivos", origem, destino, incluir_subpastas),
  moverArquivos: (origem, destino, incluir_subpastas) =>
    ipcRenderer.invoke("mover-arquivos", origem, destino, incluir_subpastas),
  enviarEmails: (email_autorizado, caminho_planilha, caminho_arquivo_email) =>
    ipcRenderer.invoke(
      "enviar-emails",
      email_autorizado,
      caminho_planilha,
      caminho_arquivo_email
    ),
  processarDebito2r: (caminho_debito) =>
    ipcRenderer.invoke("processar-debito-2r", caminho_debito),
  processarCredito2r: (caminho_credito) =>
    ipcRenderer.invoke("processar-credito-2r", caminho_credito),
  processarDirf: (caminho_pdf, modelo) =>
    ipcRenderer.invoke("processar-dirf", caminho_pdf, modelo),
  alterarNomeFolha: (caminho, incluirNumeros) =>
    ipcRenderer.invoke("alterar-nome-folha", caminho, incluirNumeros),
  gerenciarConciliacao: (operacao, dados) =>
    ipcRenderer.invoke("gerenciar-conciliacao", operacao, dados),
  conciliarPagosBanco: (caminhoBanco, caminhoPagos) =>
    ipcRenderer.invoke("conciliar-pagos-banco", caminhoBanco, caminhoPagos),
  conciliarPagosBancoConta: (
    caminhoBanco,
    caminhoPagos,
    contaPadrao,
    padraoQuestor,
    numeroEmpresa,
    numeroBanco
  ) =>
    ipcRenderer.invoke(
      "conciliar-pagos-banco-conta",
      caminhoBanco,
      caminhoPagos,
      contaPadrao,
      padraoQuestor,
      numeroEmpresa,
      numeroBanco
    ),
  gerenciarBancos: (banco, numero_banco, caminho_pdf) =>
    ipcRenderer.invoke("gerenciar-bancos", banco, numero_banco, caminho_pdf),
  obterNoticias: () => ipcRenderer.invoke("obter-noticias"),
  gerenciarUsuario: (acao, id_usuario, usuario, senha, nome, id_funcao) => {
    return ipcRenderer.invoke(
      "gerenciar-usuario",
      acao,
      id_usuario,
      usuario,
      senha,
      nome,
      id_funcao
    );
  },
  adicionarLog: (id_usuario, funcao) => {
    return ipcRenderer.invoke("adicionar-log", id_usuario, funcao);
  },
  obterLogs: (id_usuario, data_inicio, data_fim) => {
    return ipcRenderer.invoke("obter-logs", id_usuario, data_inicio, data_fim);
  },
  obterLogsNo: (id_usuario, data_inicio, data_fim) => {
    return ipcRenderer.invoke(
      "obter-logs-no",
      id_usuario,
      data_inicio,
      data_fim
    );
  },
  gerarPDFsReinf: (caminhoArquivo) => {
    return ipcRenderer.invoke("gerar-pdfs-reinf", caminhoArquivo);
  },
  criarSugestao: (idUsuario, textoSugestao) => {
    return ipcRenderer.invoke("criar-sugestao", idUsuario, textoSugestao);
  },
  obterSugestoes: () => {
    return ipcRenderer.invoke("obter-sugestoes");
  },
});
