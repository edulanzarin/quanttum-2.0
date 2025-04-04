const processarBtn = document.querySelector(".process-btn");
const valor = document.getElementById("valor");
const valorMaximo = document.getElementById("valor_maximo");
const dataInicio = document.getElementById("data_inicio");
const dataFim = document.getElementById("data_fim");
const pagamentoCheckbox = document.getElementById("pagamento");
const recebimentoCheckbox = document.getElementById("recebimento");

// Formata o campo de valor em reais
new Cleave("#valor", {
  numeral: true,
  numeralThousandsGroupStyle: "thousand",
  numeralDecimalMark: ",", // Usa vírgula como separador decimal
  delimiter: ".", // Usa ponto como separador de milhar
  prefix: "R$ ",
  rawValueTrimPrefix: true, // Remove o prefixo ao obter o valor
});

new Cleave("#valor_maximo", {
  numeral: true,
  numeralThousandsGroupStyle: "thousand",
  numeralDecimalMark: ",", // Usa vírgula como separador decimal
  delimiter: ".", // Usa ponto como separador de milhar
  prefix: "R$ ",
  rawValueTrimPrefix: true, // Remove o prefixo ao obter o valor
});

processarBtn.addEventListener("click", async () => {
  // Captura os valores dos campos
  const valorTotal = parseFloat(
    valor.value.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
  );

  const valorMaximoTotal = parseFloat(
    valorMaximo.value.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
  );

  const dataInicioValue = dataInicio.value; // Já está no formato yyyy-mm-dd
  const dataFimValue = dataFim.value; // Já está no formato yyyy-mm-dd

  // Verifica se o valor é válido
  if (isNaN(valorTotal) || valorTotal <= 0) {
    createNotification(
      "Informe um valor válido.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  if (isNaN(valorMaximoTotal) || valorMaximoTotal <= 0) {
    createNotification(
      "Informe um valor máximo válido.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  // Verifica se as datas foram informadas
  if (!dataInicioValue || !dataFimValue) {
    createNotification(
      "Informe o intervalo de datas.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  // Verifica se o intervalo de datas é válido
  const inicio = new Date(dataInicioValue);
  const fim = new Date(dataFimValue);
  if (inicio > fim) {
    createNotification(
      "A data inicial deve ser anterior à data final.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  // Verifica se nenhuma checkbox foi marcada
  if (!pagamentoCheckbox.checked && !recebimentoCheckbox.checked) {
    createNotification(
      "Selecione o tipo de lançamento (Pagamento ou Recebimento).",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  // Verifica se ambas as checkboxes estão marcadas
  if (pagamentoCheckbox.checked && recebimentoCheckbox.checked) {
    createNotification(
      "Selecione apenas um tipo de lançamento.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  // Define o tipo de lançamento
  const tipo = pagamentoCheckbox.checked ? "pagamento" : "recebimento";

  try {
    showLoadingModal(); // Exibe o modal de carregamento

    // Chama a função do Electron para gerar os lançamentos
    const resultado = await window.electronAPI.gerarLancamentos(
      valorTotal,
      valorMaximoTotal,
      dataInicioValue, // Já está no formato yyyy-mm-dd
      dataFimValue, // Já está no formato yyyy-mm-dd
      tipo
    );

    hideLoadingModal(); // Oculta o modal de carregamento

    // Exibe o retorno
    if (resultado.status === "success") {
      createNotification(
        resultado.message,
        "#1d1830",
        "darkgreen",
        successGifUrl
      );
    } else {
      createNotification(
        `Erro: ${resultado.message}`,
        "#1d1830",
        "darkred",
        errorGifUrl
      );
    }
  } catch (erro) {
    console.error("Erro ao gerar lançamentos:", erro);
    hideLoadingModal(); // Oculta o modal de carregamento em caso de erro
    createNotification(
      "Ocorreu um erro ao gerar os lançamentos.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
  }
});
