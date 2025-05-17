document.addEventListener('DOMContentLoaded', function () {
    const sortBy = document.getElementById('sort-by');
    const viewToggle = document.querySelectorAll('.view-toggle button');
    const gameGrid = document.querySelector('.game-grid');
    let gameCards = Array.from(document.querySelectorAll('.game-card'));
    const itemsPerPage = 6;
    let currentPage = 1;

    function attachEventListeners() {
        document.querySelectorAll('.buy-button').forEach(button => {
            button.addEventListener('click', () => {
                const card = button.closest('.game-card');
                addToCart(
                    card.dataset.id,
                    card.querySelector('.game-title').textContent,
                    card.querySelector('.game-price').textContent,
                    'purchase'
                );
                showNotification(`${card.querySelector('.game-title').textContent} sepete eklendi`);
            });
        });

        document.querySelectorAll('.rent-button').forEach(button => {
            button.addEventListener('click', () => {
                const card = button.closest('.game-card');
                const rentPrice = card.querySelector('.game-rent').textContent.replace('Kiralama: ', '').replace('/haftalık', '');
                addToCart(
                    card.dataset.id,
                    card.querySelector('.game-title').textContent,
                    rentPrice,
                    'rent'
                );
                showNotification(`${card.querySelector('.game-title').textContent} kiralama sepete eklendi`);
            });
        });
    }

    function sortGames(value) {
        switch (value) {
            case 'price-low':
                gameCards.sort((a, b) => extractPrice(a) - extractPrice(b));
                break;
            case 'price-high':
                gameCards.sort((a, b) => extractPrice(b) - extractPrice(a));
                break;
            case 'name-asc':
                gameCards.sort((a, b) => a.querySelector('.game-title').textContent.localeCompare(b.querySelector('.game-title').textContent, 'tr'));
                break;
            case 'name-desc':
                gameCards.sort((a, b) => b.querySelector('.game-title').textContent.localeCompare(a.querySelector('.game-title').textContent, 'tr'));
                break;
            case 'newest':
                gameCards.sort((a, b) => new Date(b.dataset.release) - new Date(a.dataset.release));
                break;
        }
        gameGrid.innerHTML = '';
        gameCards.forEach(card => gameGrid.appendChild(card));
        showPage(1);  // sıfırdan başlat
    }

    function extractPrice(card) {
        const priceText = card.querySelector('.game-price')?.textContent || '₺0';
        return parseFloat(priceText.replace('₺', '').replace(/\./g, '').replace(',', '.')) || 0;
    }

    sortBy?.addEventListener('change', () => sortGames(sortBy.value));

    viewToggle.forEach(button => {
        button.addEventListener('click', () => {
            viewToggle.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            gameGrid.classList.toggle('list-view', button.classList.contains('list-view-btn'));
            gameGrid.classList.toggle('grid-view', button.classList.contains('grid-view-btn'));
            showNotification(`${button.classList.contains('list-view-btn') ? 'Liste' : 'Izgara'} görünümü etkinleştirildi`);
            showPage(currentPage);
        });
    });

    function setupPaginationListeners() {
        document.querySelectorAll('.pagination button').forEach(button => {
            button.onclick = () => {
                if (button.classList.contains('prev') && currentPage > 1) showPage(currentPage - 1);
                else if (button.classList.contains('next')) {
                    const totalPages = Math.ceil(gameCards.length / itemsPerPage);
                    if (currentPage < totalPages) showPage(currentPage + 1);
                } else if (button.classList.contains('page-number')) {
                    showPage(parseInt(button.textContent));
                }
            };
        });
    }

    function renderPagination() {
        const paginationContainer = document.querySelector('.pagination .page-numbers');
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(gameCards.length / itemsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = 'page-number';
            btn.textContent = i;
            if (i === currentPage) btn.classList.add('active');
            paginationContainer.appendChild(btn);
        }

        setupPaginationListeners();
    }

    function showPage(pageNumber) {
        currentPage = pageNumber;
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = pageNumber * itemsPerPage;

        const cardsToShow = gameCards.slice(startIndex, endIndex);
        gameCards.forEach(card => card.style.display = 'none');
        cardsToShow.forEach(card => card.style.display = '');

        renderPagination(); // burada çağırıyoruz

        document.querySelector('.pagination .prev').disabled = pageNumber === 1;
        const totalPages = Math.ceil(gameCards.length / itemsPerPage);
        document.querySelector('.pagination .next').disabled = pageNumber === totalPages;

        if (pageNumber === 1) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: gameGrid.offsetTop - 100, behavior: 'smooth' });
        }
    }

    function addToCart(id, name, price, type) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find(item => item.id === id && item.type === type);
        if (existing) existing.quantity += 1;
        else cart.push({ id, name, price, type, quantity: 1 });
        localStorage.setItem('cart', JSON.stringify(cart));
        if (document.getElementById('sepet-panel')?.classList.contains('active')) updateCartContents?.();
    }

    function showNotification(message) {
        const n = document.createElement('div');
        n.className = 'notification';
        n.textContent = message;
        document.body.appendChild(n);
        setTimeout(() => {
            n.classList.add('fadeOut');
            setTimeout(() => n.remove(), 300);
        }, 3000);
    }

    showPage(1);
    attachEventListeners();

    const urlParams = new URLSearchParams(window.location.search);
    const kategori = urlParams.get('kategori');

    if (kategori && kategori !== 'hepsi') {
        gameCards = gameCards.filter(card => card.dataset.kategori === kategori);
    }
});