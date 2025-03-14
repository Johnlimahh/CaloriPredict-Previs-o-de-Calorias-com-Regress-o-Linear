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
        const esporteRecomendado = recomendarEsporte(calorias, velocidade, distancia);
        
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
        
        // Limpar os campos após adicionar
        document.getElementById("nomeAtleta").value = "";
        document.getElementById("peso").value = "";
        document.getElementById("velocidade").value = "";
        document.getElementById("distancia").value = "";
    } else {
        alert("Preencha todos os campos corretamente.");
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
    
    const cores = { "Elite": "red", "Amador": "blue", "Iniciante": "green" };
    
    let datasets = Object.keys(cores).map(categoria => ({
        label: categoria,
        data: atletas.filter(a => a.categoria === categoria).map(a => ({ 
            x: a.distancia, 
            y: a.calorias,
            r: 8, // Tamanho do ponto
            nome: a.nome,
            categoria: a.categoria,
            esporte: a.esporteRecomendado
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
                        label: function(context) {
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
                    position: 'top'
                }
            },
            scales: {
                x: { 
                    title: { display: true, text: "Distância (Km)" },
                    ticks: { callback: function(value) { return value + " Km"; } }
                },
                y: { 
                    title: { display: true, text: "Calorias (Kcal)" },
                    ticks: { callback: function(value) { return value + " Kcal"; } }
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
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = atletas.length;
    
    for (let i = 0; i < n; i++) {
        sumX += atletas[i].distancia;
        sumY += atletas[i].calorias;
        sumXY += atletas[i].distancia * atletas[i].calorias;
        sumX2 += atletas[i].distancia * atletas[i].distancia;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const equacao = `Calorias = ${slope.toFixed(2)} × Distância + ${intercept.toFixed(2)}`;
    document.getElementById("resultadoPrevisao").innerHTML = `Equação de Previsão: ${equacao}`;
    
    // Armazenar coeficientes para uso posterior
    window.coeficientes = { slope, intercept };
}

function calcularPrevisao() {
    if (!window.coeficientes) {
        alert("Gere a equação de previsão primeiro.");
        return;
    }
    
    const novaDistancia = parseFloat(document.getElementById("novaDistancia").value);
    if (isNaN(novaDistancia)) {
        alert("Insira um valor válido para a distância.");
        return;
    }
    
    const caloriasPrevistas = window.coeficientes.slope * novaDistancia + window.coeficientes.intercept;
    document.getElementById("resultadoPrevisao").innerHTML += `<br>Para ${novaDistancia} Km, a previsão é de ${caloriasPrevistas.toFixed(2)} Kcal`;
}
