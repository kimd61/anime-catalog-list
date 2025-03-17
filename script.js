class AnimeApp {
    constructor() {
        this.currentPage = 1;
        this.searchTerm = '';
        this.initElements();
        this.addEventListeners();
        this.loadTopAnime();
    }

    initElements() {
        this.searchInput = document.getElementById('search-input');
        this.searchButton = document.getElementById('search-button');
        this.animeGrid = document.getElementById('anime-grid');
        this.loadingSpinner = document.getElementById('loading');
        this.errorMessage = document.getElementById('error-message');
        this.pagination = document.getElementById('pagination');
        this.prevPageButton = document.getElementById('prev-page');
        this.nextPageButton = document.getElementById('next-page');
        this.currentPageSpan = document.getElementById('current-page');
    }

    addEventListeners() {
        this.searchButton.addEventListener('click', () => this.searchAnime());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchAnime();
        });
        
        this.prevPageButton.addEventListener('click', () => this.changePage(-1));
        this.nextPageButton.addEventListener('click', () => this.changePage(1));

        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                if (page === 'top') this.loadTopAnime();
                if (page === 'search') this.searchInput.focus();
            });
        });
    }

    showLoading() {
        this.loadingSpinner.classList.remove('hidden');
        this.animeGrid.innerHTML = '';
        this.errorMessage.classList.add('hidden');
    }

    hideLoading() {
        this.loadingSpinner.classList.add('hidden');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.animeGrid.innerHTML = '';
    }

    async fetchAnime(url) {
        this.showLoading();
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            this.showError('Failed to fetch anime data: ' + error.message);
            return null;
        } finally {
            this.hideLoading();
        }
    }

    createAnimeCard(anime) {
        const card = document.createElement('div');
        card.classList.add('anime-card');

        // Handle different API response structures
        const title = anime.title || anime.title_english || 'Unknown Title';
        const imageUrl = anime.images?.jpg?.image_url || anime.image_url || 'https://via.placeholder.com/225x350';
        const score = anime.score || 'N/A';
        const episodes = anime.episodes || 'Unknown';
        const genres = anime.genres ? anime.genres.slice(0, 3).map(g => g.name || g) : [];

        card.innerHTML = `
            <img src="${imageUrl}" alt="${title}">
            <div class="anime-card-content">
                <h3>${title}</h3>
                <div class="anime-details">
                    <span>Score: ${score}</span>
                    <span>Episodes: ${episodes}</span>
                </div>
                <div class="anime-genres">
                    ${genres.map(genre => 
                        `<span class="genre-tag">${genre}</span>`
                    ).join('')}
                </div>
            </div>
        `;
        
        return card;
    }

    renderAnimeGrid(animeList) {
        this.animeGrid.innerHTML = '';
        animeList.forEach(anime => {
            const card = this.createAnimeCard(anime);
            this.animeGrid.appendChild(card);
        });
    }

    async loadTopAnime() {
        this.searchTerm = '';
        this.currentPage = 1;
        const url = `https://api.jikan.moe/v4/top/anime?page=${this.currentPage}&limit=25`;
        
        const data = await this.fetchAnime(url);
        if (data) {
            this.renderAnimeGrid(data.data);
            this.updatePagination(data);
        }
    }

    async searchAnime() {
        this.searchTerm = this.searchInput.value.trim();
        if (!this.searchTerm) return;

        this.currentPage = 1;
        const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(this.searchTerm)}&page=${this.currentPage}&limit=25`;
        
        const data = await this.fetchAnime(url);
        if (data) {
            this.renderAnimeGrid(data.data);
            this.updatePagination(data);
        }
    }

    updatePagination(data) {
        // Show/hide pagination
        if (data.pagination) {
            this.pagination.classList.remove('hidden');
            
            // Update page number
            this.currentPageSpan.textContent = `Page ${data.pagination.current_page}`;
            
            // Enable/disable prev button
            this.prevPageButton.disabled = !data.pagination.has_previous_page;
            
            // Enable/disable next button
            this.nextPageButton.disabled = !data.pagination.has_next_page;
        } else {
            this.pagination.classList.add('hidden');
        }
    }

    async changePage(direction) {
        this.currentPage += direction;
        
        let url;
        if (this.searchTerm) {
            url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(this.searchTerm)}&page=${this.currentPage}&limit=25`;
        } else {
            url = `https://api.jikan.moe/v4/top/anime?page=${this.currentPage}&limit=25`;
        }
        
        const data = await this.fetchAnime(url);
        if (data) {
            this.renderAnimeGrid(data.data);
            this.updatePagination(data);
        }
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnimeApp();
});