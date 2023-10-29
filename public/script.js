document.addEventListener('DOMContentLoaded', () => {
    const selectElement = document.getElementById('crypto-select');
    const currentValueElement = document.getElementById('current-value');
    let chart = null;

    // Função para preencher o seletor de criptomoedas com a lista
    const loadCryptoList = async () => {
        try {
            const response = await fetch('/api/coin-list');
            const data = await response.json();

            for (const coin in data) {
                const option = document.createElement('option');
                option.value = coin;
                option.textContent = data[coin];
                selectElement.appendChild(option);
            }
        } catch (error) {
            console.error('Erro ao carregar a lista de criptomoedas:', error);
        }
    };

    // Função para formatar a data em mês, dia e hora
    function formatDateTime(timestamp) {
        const date = new Date(timestamp * 1000);
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const hours = date.getHours();
        return `${month} ${day}, ${hours}:00`;
    }

    // Função para obter os dados das últimas 96 horas do histórico de uma criptomoeda selecionada
    const loadCryptoData = async (coin) => {
        try {
            const response = await fetch(`/api/coin-info?coin=${coin}`);
            const data = await response.json();

            currentValueElement.textContent = `Current Value: ${data.price.USD} $`;
            currentValueElement.className = 'blue-text'; // Adiciona uma classe para aplicar estilos


            if (chart) {
                chart.destroy(); // Destrua o gráfico anterior para criar um novo.
            }

            const chartData = data.chart.slice(-96); // Obtenha apenas os últimos 96 pontos de dados.
            const chartDates = chartData.map((entry) => formatDateTime(entry.time));
            const chartValues = chartData.map((entry) => entry.close);

            // Crie um elemento canvas para o gráfico
            const canvas = document.createElement('canvas');
            canvas.id = 'chart';
            currentValueElement.parentNode.insertBefore(canvas, currentValueElement.nextSibling);

            const ctx = canvas.getContext('2d');
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartDates,
                    datasets: [
                        {
                            label: 'Price History',
                            data: chartValues,
                            borderColor: 'blue',
                            borderWidth: 2,
                            fill: false,
                        },
                    ],
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: true,
                },
            });
        } catch (error) {
            console.error('Erro ao obter dados da criptomoeda:', error);
        }
    };

// Função para carregar as notícias mais relevantes sobre a criptomoeda
const loadCryptoNews = async (coin) => {
    try {
        const response = await fetch(`/api/crypto-news?coin=${coin}`);
        const data = await response.json();

        const newsList = document.getElementById('news-list');
        newsList.innerHTML = ''; // Limpe a lista de notícias existente.

        for (let i = 0; i < 7; i++) {
            const article = data[i];

            // Crie um elemento para conter a imagem e o título
            const newsItem = document.createElement('li');
            newsItem.className = 'news-item'; // Adicione uma classe para aplicar estilos

            // Crie um elemento para a imagem da notícia
            const newsImage = document.createElement('img');
            newsImage.src = article.urlToImage; // Define a imagem da notícia
            newsImage.alt = 'Imagem da Notícia'; // Alt text para acessibilidade
            newsImage.style.maxWidth = '450px'; // Limita a largura máxima
            newsImage.style.maxHeight = '450px'; // Limita a altura máxima
            newsImage.style.objectFit = 'contain'; // Redimensiona a imagem sem cortar

            // Crie um elemento para o título da notícia
            const newsTitleContainer = document.createElement('div');
            newsTitleContainer.className = 'title-container'; // Adicione uma classe para aplicar estilos
            const newsTitle = document.createElement('a');
            newsTitle.href = article.url;
            newsTitle.target = '_blank';
            newsTitle.textContent = article.title;

            // Adicione a imagem e o título ao elemento da notícia
            newsItem.appendChild(newsImage);
            newsTitleContainer.appendChild(newsTitle);
            newsItem.appendChild(newsTitleContainer);

            // Adicione o elemento da notícia à lista
            newsList.appendChild(newsItem);
        }
    } catch (error) {
        console.error('Erro ao buscar notícias:', error);
    }
};




    // Após carregar os dados da criptomoeda, carregue as notícias relevantes
    selectElement.addEventListener('change', () => {
        const selectedCoin = selectElement.value;
        if (selectedCoin) {
            loadCryptoData(selectedCoin);  // Carregua os dados da Cryptomoeda
            loadCryptoNews(selectedCoin); // Carregua as notícias ao selecionar uma criptomoeda.
        } else {
            currentValueElement.textContent = 'Aguardando seleção...';
            if (chart) {
                chart.destroy();
            }
        }
    });

    // Inicializa o seletor de criptomoedas com a lista.
    loadCryptoList();

    // Evite o redimensionamento automático do gráfico
    window.addEventListener('resize', () => {
        if (chart) {
            chart.resize();
        }
    });
});
