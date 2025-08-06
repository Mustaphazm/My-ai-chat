export default async function handler(req, res) {
    try {
        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`);
        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error(data.message || 'Failed to fetch news');
        }

        // Format top 5 articles
        const articles = data.articles.slice(0, 5).map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            source: article.source.name,
            publishedAt: new Date(article.publishedAt).toLocaleString()
        }));

        res.status(200).json({ articles });
    } catch (error) {
        console.error('News API Error:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
}
