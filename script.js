let atletas = [];
let chart;

function calcularCalorias(peso, velocidade, distancia) {
  const MET = velocidade;
  return MET * peso * 0.0175 * (distancia / velocidade) * 60;
}

function classificarAtleta(calorias) {
  if (calorias > 800) return "Elite";
  if (calorias > 400) return "Amador";
  return "Iniciante";
}

function recomendarEsporte(calorias, velocidade, distancia) {
  // Recomendação baseada no gasto calórico, velocidade e distância
  if (calorias > 1000) {
    if (distancia > 20) return "Ultramaratona";
    if (velocidade > 15) return "Maratona";
    return "Meia-maratona";
  } else if (calorias > 600) {
    if (velocidade > 14) return "Corrida 10km";
    if (distancia < 5) return "Corrida 5km";
    return "Corrida de rua";
  } else if (calorias > 300) {
    if (velocidade > 12) return "Corrida em pista";
    return "Trail running leve";
  } else {
    if (velocidade < 6) return "Caminhada";
    return "Corrida para iniciantes";
  }
}

function adicionarAtleta() {
  const nome = document.getElementById("nomeAtleta").value.trim();
  const peso = parseFloat(document.getElementById("peso").value);
  const velocidade = parseFloat(document.getElementById("velocidade").value);
  const distancia = parseFloat(document.getElementById("distancia").value);

  if (nome === "") {
    alert("Por favor, insira o nome do atleta.");
    return;
  }

  if (!isNaN(peso) && !isNaN(velocidade) && !isNaN(distancia)) {
    const calorias = calcularCalorias(peso, velocidade, distancia);
    const categoria = classificarAtleta(calorias);
    const esporteRecomendado = recomendarEsporte(
      calorias,
      velocidade,
      distancia
    );

    atletas.push({
      nome,
      peso,
      velocidade,
      distancia,
      calorias,
      categoria,
      esporteRecomendado
    });

    atualizarTabela();
    atualizarGrafico();
    salvarDadosLocalStorage(); // Salva os dados sempre que um atleta for adicionado

    // Limpar os campos após adicionar
    document.getElementById("nomeAtleta").value = "";
    document.getElementById("peso").value = "";
    document.getElementById("velocidade").value = "";
    document.getElementById("distancia").value = "";
  } else {
    alert("Preencha todos os campos corretamente.");
  }
}

// Função para salvar os dados no localStorage
function salvarDadosLocalStorage() {
  try {
    localStorage.setItem("atletasSupervisionados", JSON.stringify(atletas));
    console.log("Dados salvos com sucesso no localStorage");
  } catch (error) {
    console.error("Erro ao salvar dados no localStorage:", error);
    alert("Erro ao salvar dados: " + error.message);
  }
}

function atualizarTabela() {
  const tabela = document.getElementById("tabelaAtletas");
  tabela.innerHTML = "";
  atletas.forEach((atleta, index) => {
    const row = `<tr>
            <td>${atleta.nome}</td>
            <td>${atleta.peso} Kg</td>
            <td>${atleta.velocidade} Km/h</td>
            <td>${atleta.distancia.toFixed(2)} Km</td>
            <td>${atleta.calorias.toFixed(2)} Kcal</td>
            <td>${atleta.categoria}</td>
            <td>${atleta.esporteRecomendado}</td>
        </tr>`;
    tabela.innerHTML += row;
  });
}

function atualizarGrafico() {
  const ctx = document.getElementById("graficoAtletas").getContext("2d");
  if (chart) chart.destroy();

  const cores = { Elite: "red", Amador: "blue", Iniciante: "green" };

  let datasets = Object.keys(cores).map((categoria) => ({
    label: categoria,
    data: atletas
      .filter((a) => a.categoria === categoria)
      .map((a) => ({
        x: a.distancia,
        y: a.calorias,
        r: 10, // Aumentado de 8 para 10 para melhor visualização
        nome: a.nome,
        categoria: a.categoria,
        esporte: a.esporteRecomendado
      })),
    backgroundColor: cores[categoria],
    borderColor: cores[categoria],
    pointRadius: 8  // Aumentado de 6 para 8
  }));

  chart = new Chart(ctx, {
    type: "scatter",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Importante para controlar o tamanho exato
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const point = context.raw;
              return [
                `Nome: ${point.nome}`,
                `Categoria: ${point.categoria}`,
                `Distância: ${point.x.toFixed(2)} Km`,
                `Calorias: ${point.y.toFixed(2)} Kcal`,
                `Esporte: ${point.esporte}`
              ];
            }
          }
        },
        legend: {
          display: true,
          position: "top",
          labels: {
            font: {
              size: 14 // Aumentar tamanho da fonte da legenda
            }
          }
        }
      },
      scales: {
        x: {
          title: { 
            display: true, 
            text: "Distância (Km)",
            font: {
              size: 14 // Aumentar tamanho da fonte do título
            }
          },
          ticks: {
            callback: function (value) {
              return value + " Km";
            },
            font: {
              size: 12 // Aumentar tamanho da fonte dos valores
            }
          }
        },
        y: {
          title: { 
            display: true, 
            text: "Calorias (Kcal)",
            font: {
              size: 14 // Aumentar tamanho da fonte do título
            }
          },
          ticks: {
            callback: function (value) {
              return value + " Kcal";
            },
            font: {
              size: 12 // Aumentar tamanho da fonte dos valores
            }
          }
        }
      }
    }
  });
}

function preverCalorias() {
  // Implementar a função de regressão linear
  if (atletas.length < 2) {
    alert("Adicione pelo menos dois atletas para gerar a equação de previsão.");
    return;
  }

  // Calcular coeficientes para regressão linear (distância x calorias)
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  const n = atletas.length;

  for (let i = 0; i < n; i++) {
    sumX += atletas[i].distancia;
    sumY += atletas[i].calorias;
    sumXY += atletas[i].distancia * atletas[i].calorias;
    sumX2 += atletas[i].distancia * atletas[i].distancia;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const equacao = `Calorias = ${slope.toFixed(
    2
  )} × Distância + ${intercept.toFixed(2)}`;
  document.getElementById(
    "resultadoPrevisao"
  ).innerHTML = `Equação de Previsão: ${equacao}`;

  // Armazenar coeficientes para uso posterior
  window.coeficientes = { slope, intercept };
}

function calcularPrevisao() {
  if (!window.coeficientes) {
    alert("Gere a equação de previsão primeiro.");
    return;
  }

  const novaDistancia = parseFloat(
    document.getElementById("novaDistancia").value
  );
  if (isNaN(novaDistancia)) {
    alert("Insira um valor válido para a distância.");
    return;
  }

  const caloriasPrevistas =
    window.coeficientes.slope * novaDistancia + window.coeficientes.intercept;
  document.getElementById(
    "resultadoPrevisao"
  ).innerHTML += `<br>Para ${novaDistancia} Km, a previsão é de ${caloriasPrevistas.toFixed(
    2
  )} Kcal`;
}

// Carregar dados ao iniciar a página
window.addEventListener("DOMContentLoaded", function () {
  try {
    const dadosSalvos = localStorage.getItem("atletasSupervisionados");
    if (dadosSalvos) {
      const atletasSalvos = JSON.parse(dadosSalvos);
      if (atletasSalvos.length > 0) {
        atletas = atletasSalvos;
        atualizarTabela();
        atualizarGrafico();
        console.log(`Carregados ${atletas.length} atletas do localStorage`);
      }
    }

    // Adicionar botão de exportação se não existir
    adicionarBotaoExportacao();
  } catch (error) {
    console.error("Erro ao carregar dados do localStorage:", error);
  }
});

// Adicionar botão de exportação na interface
function adicionarBotaoExportacao() {
  // Verificar se o botão já existe
  if (!document.getElementById("btnExportarDados")) {
    const formContainer =
      document.querySelector(".form-group") ||
      document.querySelector(".container") ||
      document.body;

    const btnExportar = document.createElement("button");
    btnExportar.id = "btnExportarDados";
    btnExportar.className = "btn btn-primary mt-3";
    btnExportar.textContent =
      "Exportar Dados para Atividade Não Supervisionada";
    btnExportar.onclick = exportarDados;

    // Adicionar o botão ao final do formulário
    formContainer.appendChild(btnExportar);
  }
}

// Função para exportar dados
function exportarDados() {
  if (atletas.length === 0) {
    alert("Não há dados para exportar. Adicione pelo menos um atleta.");
    return;
  }

  salvarDadosLocalStorage();
  alert(
    `Dados de ${atletas.length} atletas exportados com sucesso! Eles estarão disponíveis para importação na atividade não supervisionada.`
  );
}

// Adicionar função para limpar todos os dados
function limparDados() {
  if (
    confirm(
      "Tem certeza que deseja remover todos os atletas? Esta ação não pode ser desfeita."
    )
  ) {
    atletas = [];
    atualizarTabela();
    atualizarGrafico();
    salvarDadosLocalStorage(); // Limpar também no localStorage
    alert("Todos os dados foram removidos com sucesso.");
  }
}

// Adicionar essa função ao carregar a página
window.addEventListener("load", function () {
  // Adicionar botão de limpar dados
  if (!document.getElementById("btnLimparDados")) {
    const btnExportar = document.getElementById("btnExportarDados");
    if (btnExportar) {
      const btnLimpar = document.createElement("button");
      btnLimpar.id = "btnLimparDados";
      btnLimpar.className = "btn btn-danger mt-3 ms-2";
      btnLimpar.textContent = "Limpar Dados";
      btnLimpar.onclick = limparDados;

      btnExportar.parentNode.insertBefore(btnLimpar, btnExportar.nextSibling);
    }
  }
});
