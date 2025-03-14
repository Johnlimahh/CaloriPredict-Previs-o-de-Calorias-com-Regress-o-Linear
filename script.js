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

function adicionarAtleta() {
    const peso = parseFloat(document.getElementById("peso").value);
    const velocidade = parseFloat(document.getElementById("velocidade").value);
    const distancia = parseFloat(document.getElementById("distancia").value);

    if (!isNaN(peso) && !isNaN(velocidade) && !isNaN(distancia)) {
        const calorias = calcularCalorias(peso, velocidade, distancia);
        const categoria = classificarAtleta(calorias);
        atletas.push({ peso, velocidade, distancia, calorias, categoria });
        atualizarTabela();
        atualizarGrafico();
    } else {
        alert("Preencha todos os campos corretamente.");
    }
}

function atualizarTabela() {
    const tabela = document.getElementById("tabelaAtletas");
    tabela.innerHTML = "";

    atletas.forEach((atleta, index) => {
        const row = `<tr>
            <td>${atleta.peso} Kg</td>
            <td>${atleta.velocidade} Km/h</td>
            <td>${atleta.distancia.toFixed(2)} Km</td>
            <td>${atleta.calorias.toFixed(2)} Kcal</td>
            <td>${atleta.categoria}</td>
        </tr>`;
        tabela.innerHTML += row;
    });
}

function atualizarGrafico() {
    const ctx = document.getElementById("graficoAtletas").getContext("2d");

    if (chart) chart.destroy();

    const cores = { "Elite": "red", "Amador": "blue", "Iniciante": "green" };

    let datasets = Object.keys(cores).map(categoria => ({
        label: categoria,
        data: atletas.filter(a => a.categoria === categoria).map(a => ({ 
            x: a.distancia, 
            y: a.calorias,
            atleta: `Atleta ${atletas.indexOf(a) + 1} (${categoria})`
        })),
        backgroundColor: cores[categoria],
        borderColor: cores[categoria],
        pointRadius: 6
    }));

    chart = new Chart(ctx, {
        type: "scatter",
        data: { datasets },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.raw.atleta;
                        }
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: "Distância (Km)" } },
                y: { title: { display: true, text: "Calorias (Kcal)" } }
            }
        }
    });
}
