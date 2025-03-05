const processarBtn = document.querySelector(".process-btn");
const valor = document.getElementById("valor");
const valorMaximo = document.getElementById("valor_maximo");
const dataInicio = document.getElementById("data_inicio");
const dataFim = document.getElementById("data_fim");
const contasInput = document.getElementById("contas");

// Formatação dos campos de valor
new Cleave("#valor", {
  numeral: true,
  numeralThousandsGroupStyle: "thousand",
  numeralDecimalMark: ",",
  delimiter: ".",
  prefix: "R$ ",
  rawValueTrimPrefix: true,
});

new Cleave("#valor_maximo", {
  numeral: true,
  numeralThousandsGroupStyle: "thousand",
  numeralDecimalMark: ",",
  delimiter: ".",
  prefix: "R$ ",
  rawValueTrimPrefix: true,
});

processarBtn.addEventListener("click", async () => {
  const valorTotal = parseFloat(
    valor.value.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
  );
  const valorMaximoTotal = parseFloat(
    valorMaximo.value.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
  );
  const dataInicioValue = dataInicio.value;
  const dataFimValue = dataFim.value;
  const contas = contasInput.value
    .split(";")
    .map((conta) => conta.trim())
    .filter((conta) => conta !== "");

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

  if (!dataInicioValue || !dataFimValue) {
    createNotification(
      "Informe o intervalo de datas.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

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

  if (contas.length === 0) {
    createNotification(
      "Informe ao menos uma conta.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
    return;
  }

  try {
    showLoadingModal();
    const resultado = await window.electronAPI.gerarDespesas(
      valorTotal,
      valorMaximoTotal,
      dataInicioValue,
      dataFimValue,
      contas
    );
    hideLoadingModal();

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
    console.error("Erro ao gerar despesas:", erro);
    hideLoadingModal();
    createNotification(
      "Ocorreu um erro ao gerar as despesas.",
      "#1d1830",
      "darkred",
      errorGifUrl
    );
  }
});
