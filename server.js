const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.static('public'));

// Rota para obter a lista de criptomoedas disponíveis
app.get('/api/coin-list', async (req, res) => {
    try {
        const apiKey = '763f917d31323e1acea6528e55ff38a284721ee131e70a4a7c0c213918776898'; // Substitua pela sua própria chave de API CryptoCompare.

        const response = await axios.get(`https://min-api.cryptocompare.com/data/all/coinlist?api_key=${apiKey}`);
        const coinList = response.data.Data;

        const formattedList = {};
        for (const coin in coinList) {
            formattedList[coin] = coinList[coin].FullName;
        }

        res.json(formattedList);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar lista de criptomoedas' });
    }
});

// Rota para obter informações e histórico de uma criptomoeda específica
app.get('/api/coin-info', async (req, res) => {
    try {
        const { coin } = req.query;
        const apiKey = '763f917d31323e1acea6528e55ff38a284721ee131e70a4a7c0c213918776898'; // Substitua pela sua própria chave de API CryptoCompare.

        const priceResponse = await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${coin}&tsyms=USD&api_key=${apiKey}`);
        const chartResponse = await axios.get(`https://min-api.cryptocompare.com/data/v2/histohour?fsym=${coin}&tsym=USD&limit=72&api_key=${apiKey}`);



        const priceData = priceResponse.data;
        const chartData = chartResponse.data.Data.Data;

        res.json({ price: priceData, chart: chartData });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados da criptomoeda' });
    }
});

// Rota para obter notícias sobre uma criptomoeda específica nas últimas 72 horas
app.get('/api/crypto-news', async (req, res) => {
    try {
        const { coin } = req.query;
        const apiKey = '9caa56cc7d804c50a3ab4ab5eeb534f4';

        const newsResponse = await axios.get(`https://newsapi.org/v2/everything?q=${coin}&from=${getPastDate()}&sortBy=relevancy&apiKey=${apiKey}`);

        const newsData = newsResponse.data.articles;

        res.json(newsData);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar notícias da criptomoeda' });
    }
});

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});

// Função para obter a data de 72 horas atrás no formato "YYYY-MM-DD"
function getPastDate() {
    const today = new Date();
    today.setHours(today.getHours() - 72); // Subtrai 72 horas.
    return today.toISOString().split('T')[0];
}