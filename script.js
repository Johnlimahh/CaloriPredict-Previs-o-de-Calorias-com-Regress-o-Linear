let atletas = [];
let chart;

function calcularCalorias(peso, velocidade, distancia) {
  const MET = velocidade;
  return MET * peso * 0.0175 * (distancia / velocidade) * 60;
}

function adicionarAtleta() {
  const peso = parseFloat(document.getElementById("peso").value);
  const velocidade = parseFloat(document.getElementById("velocidade").value);
  const distancia = parseFloat(document.getElementById("distancia").value);

  if (!isNaN(peso) && !isNaN(velocidade) && !isNaN(distancia)) {
    const calorias = calcularCalorias(peso, velocidade, distancia);
    atletas.push({ peso, velocidade, distancia, calorias, grupo: null });
    atualizarTabela();
    atualizarGrafico();
  } else {
    alert("Preencha todos os campos corretamente.");
  }
}

function atualizarTabela() {
  const tabela = document.getElementById("tabelaAtletas");
  tabela.innerHTML = "";

  atletas.forEach((atleta) => {
    const row = `<tr>
            <td>${atleta.peso} Kg</td>
            <td>${atleta.velocidade} Km/h</td>
            <td>${atleta.distancia.toFixed(2)} Km</td>
            <td>${atleta.calorias.toFixed(2)} Kcal</td>
            <td>${atleta.grupo !== null ? atleta.grupo : "N/A"}</td>
        </tr>`;
    tabela.innerHTML += row;
  });
}

function atualizarGrafico() {
  const ctx = document.getElementById("graficoAtletas").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: atletas.map((a) => a.distancia),
      datasets: [
        {
          label: "Calorias Queimadas",
          data: atletas.map((a) => a.calorias),
          borderColor: "blue",
          borderWidth: 2,
          fill: false,
          tension: 0.2
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Distância (Km)" } },
        y: { title: { display: true, text: "Calorias (Kcal)" } }
      }
    }
  });
}

function preverCalorias() {
  if (atletas.length < 2) {
    alert("Adicione pelo menos 2 atletas para prever.");
    return;
  }

  let somaX = 0,
    somaY = 0,
    somaXY = 0,
    somaX2 = 0;
  const n = atletas.length;

  atletas.forEach((atleta) => {
    somaX += atleta.distancia;
    somaY += atleta.calorias;
    somaXY += atleta.distancia * atleta.calorias;
    somaX2 += atleta.distancia ** 2;
  });

  const mediaX = somaX / n;
  const mediaY = somaY / n;
  const b1 = (somaXY - n * mediaX * mediaY) / (somaX2 - n * mediaX ** 2);
  const b0 = mediaY - b1 * mediaX;

  localStorage.setItem("b0", b0);
  localStorage.setItem("b1", b1);

  alert(
    `Equação gerada: Calorias = ${b0.toFixed(2)} + ${b1.toFixed(2)} * Distância`
  );
}

function calcularPrevisao() {
  const novaDistancia = parseFloat(
    document.getElementById("novaDistancia").value
  );
  const b0 = parseFloat(localStorage.getItem("b0"));
  const b1 = parseFloat(localStorage.getItem("b1"));

  if (isNaN(novaDistancia)) {
    alert("Por favor, insira uma distância válida.");
    return;
  }

  if (isNaN(b0) || isNaN(b1)) {
    alert(
      "A equação de previsão ainda não foi gerada. Clique em 'Prever Calorias' antes."
    );
    return;
  }

  const previsaoCalorias = b0 + b1 * novaDistancia;
  document.getElementById(
    "resultadoPrevisao"
  ).innerText = `Para ${novaDistancia} km percorridos, a previsão é de ${previsaoCalorias.toFixed(
    2
  )} Kcal queimadas.`;
}
