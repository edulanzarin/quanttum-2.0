// Função para exibir os dados no dashboard
function exibirDashboard(dados) {
  // Atualiza a primeira linha
  document.getElementById("total-empresas").textContent = dados.total_empresas;
  document.getElementById("total-empresas-L").textContent =
    dados.data.COMÉRCIOS.L +
    dados.data.INDÚSTRIAS.L +
    dados.data.SUPERMERCADOS.L +
    dados.data.EXPRESS.L;

  // Função para criar gráficos
  function criarGrafico(elementId, segmento, sigla) {
    const ctx = document.getElementById(elementId).getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: [segmento],
        datasets: [
          {
            label: `Empresas com ${sigla}`,
            data: [dados.data[segmento][sigla] || 0],
            backgroundColor: "#6f00ff",
            borderColor: "#6f00ff",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  // Cria gráficos para a segunda linha (sigla L)
  criarGrafico("chart-supermercados-L", "SUPERMERCADOS", "L");
  criarGrafico("chart-comercio-L", "COMÉRCIOS", "L");
  criarGrafico("chart-industrias-L", "INDÚSTRIAS", "L");
  criarGrafico("chart-express-L", "EXPRESS", "L");

  // Cria gráficos para a terceira linha (sigla DG)
  criarGrafico("chart-supermercados-DG", "SUPERMERCADOS", "DG");
  criarGrafico("chart-comercio-DG", "COMÉRCIOS", "DG");
  criarGrafico("chart-industrias-DG", "INDÚSTRIAS", "DG");
  criarGrafico("chart-express-DG", "EXPRESS", "DG");
}

// Função para carregar os dados do relatório
async function carregarDados() {
  try {
    const resultado = await window.electronAPI.processarRelatorioEmpresas();
    if (resultado.status === "success") {
      exibirDashboard(resultado);
    } else {
      alert(`Erro: ${resultado.message}`);
    }
  } catch (erro) {
    console.error("Erro ao carregar os dados:", erro);
    alert("Ocorreu um erro ao carregar os dados.");
  }
}

// Carrega os dados ao iniciar a página
carregarDados();
