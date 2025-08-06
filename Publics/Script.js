document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const chatHistory = document.getElementById('chatHistory');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const newsBtn = document.getElementById('newsBtn');
    const newsModal = document.getElementById('newsModal');
    const closeNewsBtn = document.getElementById('closeNewsBtn');
    const newsContainer = document.getElementById('newsContainer');
    const themeToggle = document.getElementById('themeToggle');
    const typingIndicator = document.getElementById('typingIndicator');
    
    // State
    let currentCategory = 'general';
    let isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Initialize theme
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
        });
    });
    
    newsBtn.addEventListener('click', fetchNews);
    closeNewsBtn.addEventListener('click', () => {
        newsModal.style.display = 'none';
    });
    
    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('darkMode', isDarkMode);
        themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
    
    // Functions
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message
        addMessage(message, 'user');
        userInput.value = '';
        
        // Show typing indicator
        typingIndicator.style.display = 'flex';
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    category: currentCategory
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                addMessage(data.response, 'ai');
            } else {
                addMessage("Sorry, I'm having trouble responding right now. Please try again later.", 'ai');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage("Network error. Please check your connection and try again.", 'ai');
        } finally {
            typingIndicator.style.display = 'none';
        }
    }
    
    function addMessage(content, sender) {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message', sender);
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageEl.innerHTML = `
            <div class="message-content">${escapeHtml(content)}</div>
            <div class="message-time">${timeString}</div>
        `;
        
        chatHistory.appendChild(messageEl);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    
    async function fetchNews() {
        newsContainer.innerHTML = '<div class="loading">Loading news...</div>';
        newsModal.style.display = 'block';
        
        try {
            const response = await fetch('/api/news');
            const data = await response.json();
            
            if (response.ok) {
                displayNews(data.articles);
            } else {
                newsContainer.innerHTML = `<div class="error">Failed to load news: ${data.error || 'Unknown error'}</div>`;
            }
        } catch (error) {
            console.error('Error:', error);
            newsContainer.innerHTML = '<div class="error">Network error. Please try again later.</div>';
        }
    }
    
    function displayNews(articles) {
        if (!articles || articles.length === 0) {
            newsContainer.innerHTML = '<div class="no-news">No news available at the moment.</div>';
            return;
        }
        
        newsContainer.innerHTML = articles.map(article => `
            <div class="news-item">
                <h3>${escapeHtml(article.title)}</h3>
                <p>${escapeHtml(article.description || 'No description available')}</p>
                <div class="news-meta">
                    <span>${escapeHtml(article.source)}</span>
                    <span>${article.publishedAt}</span>
                </div>
                <a href="${article.url}" target="_blank">Read more</a>
            </div>
        `).join('');
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
