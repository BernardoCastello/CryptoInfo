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

    let currentPage = 0;
    const pageSize = 4; // Quantidade de notícias por página

    // Função para carregar as notícias mais relevantes sobre a criptomoeda
    const loadCryptoNews = async (coin, page = 0) => {
        try {
            const response = await fetch(`/api/crypto-news?coin=${coin}`);
            const data = await response.json();

            const newsList = document.getElementById('news-list');
            newsList.innerHTML = ''; // Limpa a lista de notícias existente.

            const startIdx = page * pageSize;
            const endIdx = startIdx + pageSize;
            const paginatedData = data.slice(startIdx, endIdx);

            for (let i = 0; i < paginatedData.length; i++) {
                const article = paginatedData[i];
                const newsItem = document.createElement('li');
                newsItem.className = 'news-item'; // Adiciona uma classe para aplicar estilos

                const newsImage = document.createElement('img');
                newsImage.src = article.urlToImage;
                newsImage.alt = 'Imagem da Notícia';
                newsImage.style.maxWidth = '450px';
                newsImage.style.maxHeight = '450px';
                newsImage.style.objectFit = 'contain';

                const newsTitleContainer = document.createElement('div');
                newsTitleContainer.className = 'title-container';

                const newsTitle = document.createElement('a');
                newsTitle.href = article.url;
                newsTitle.target = '_blank';
                newsTitle.textContent = article.title;

                newsItem.appendChild(newsImage);
                newsTitleContainer.appendChild(newsTitle);
                newsItem.appendChild(newsTitleContainer);

                newsList.appendChild(newsItem);
            }
        } catch (error) {
            console.error('Erro ao buscar notícias:', error);
        }
    };

    const updateNewsPage = (coin, direction) => {
        if (direction === 'prev') {
            currentPage = Math.max(0, currentPage - 1);
        } else if (direction === 'next') {
            currentPage++;
        }
        loadCryptoNews(coin, currentPage);
    };

    // Após carregar os dados da criptomoeda, carregue as notícias relevantes
    selectElement.addEventListener('change', () => {
        const selectedCoin = selectElement.value;
        if (selectedCoin) {
            loadCryptoData(selectedCoin);
            loadCryptoNews(selectedCoin);
        } else {
            currentValueElement.textContent = 'Aguardando seleção...';
            if (chart) {
                chart.destroy();
            }
        }
    });

    // Botões de navegação para as notícias
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn.addEventListener('click', () => {
        const selectedCoin = selectElement.value;
        if (selectedCoin && currentPage > 0) {
            updateNewsPage(selectedCoin, 'prev');
        }
    });

    nextBtn.addEventListener('click', () => {
        const selectedCoin = selectElement.value;
        if (selectedCoin) {
            updateNewsPage(selectedCoin, 'next');
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
