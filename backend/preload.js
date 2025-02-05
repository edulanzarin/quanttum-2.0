const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selecionarArquivo: () => ipcRenderer.invoke("selecionar-arquivo"),
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
});
