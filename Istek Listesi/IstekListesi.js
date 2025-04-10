let games = [
    {
        name: "Cyberpunk 2077",
        platform: "PC",
        priority: "Orta",
        price: 599.99,
        addedDate: "15.03.2024",
        timestamp: 1710499200000,
        image: "https://example.com/cyberpunk2077.jpg"
    },
    {
        name: "Horizon Forbidden West",
        platform: "PlayStation",
        priority: "Orta",
        price: 2199.99,
        addedDate: "20.02.2024",
        timestamp: 1708387200000,
        image: "https://example.com/horizon.jpg"
    },
    {
        name: "Forza Horizon 5",
        platform: "Xbox",
        priority: "Düşük",
        price: 1199.99,
        addedDate: "10.01.2024",
        timestamp: 1705708800000,
        image: "https://example.com/forza.jpg"
    },
    {
        name: "Elden Ring",
        platform: "PC",
        priority: "Yüksek",
        price: 1499.99,
        addedDate: "05.02.2024",
        timestamp: 1707091200000,
        image: "https://example.com/eldenring.jpg"
    }
];

function renderGameList() {
    const gameListElement = document.getElementById('game-list');
    gameListElement.innerHTML = '';

    games.forEach((game) => {
        const gameCard = document.createElement('div');
        gameCard.classList.add('game-card');
        
        let priorityClass = 'priority-low';
        if (game.priority === 'Orta') priorityClass = 'priority-medium';
        if (game.priority === 'Yüksek') priorityClass = 'priority-high';

        gameCard.innerHTML = `
            <div class="game-card-image" style="background-image: url('${game.image}')"></div>
            <div class="game-card-content">
                <div class="game-card-header">
                    <h3>${game.name}</h3>
                    <span class="priority-badge ${priorityClass}">${game.priority}</span>
                </div>
                <div class="game-card-body">
                    <p>
                        <strong>Fiyat:</strong> 
                        <span>${game.price} TL</span>
                    </p>
                    <p>
                        <strong>Platform:</strong> 
                        <span>${game.platform}</span>
                    </p>
                    <p>
                        <strong>Eklenme Tarihi:</strong> 
                        <span>${game.addedDate}</span>
                    </p>
                </div>
                <div class="game-card-actions">
                    <button class="btn btn-rent">Kirala</button>
                    <button class="btn btn-buy">Satın Al</button>
                </div>
            </div>
        `;
        gameListElement.appendChild(gameCard);
    });
}

function sortGames() {
    const sortBy = document.getElementById('sort-by').value;

    switch(sortBy) {
        case 'name-asc':
            games.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            games.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'date-desc':
            games.sort((a, b) => b.timestamp - a.timestamp);
            break;
        case 'date-asc':
            games.sort((a, b) => a.timestamp - b.timestamp);
            break;
        case 'price-asc':
            games.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            games.sort((a, b) => b.price - a.price);
            break;
        case 'priority-asc':
            const priorityOrder = {'Düşük': 1, 'Orta': 2, 'Yüksek': 3};
            games.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            break;
        case 'priority-desc':
            const priorityOrderDesc = {'Düşük': 1, 'Orta': 2, 'Yüksek': 3};
            games.sort((a, b) => priorityOrderDesc[b.priority] - priorityOrderDesc[a.priority]);
            break;
    }

    renderGameList();
}

document.getElementById('sort-by').innerHTML = `
    <option value="name-asc">İsme Göre Artan (A-Z)</option>
    <option value="name-desc">İsme Göre Azalan (Z-A)</option>
    <option value="price-asc">Fiyata Göre Artan</option>
    <option value="price-desc">Fiyata Göre Azalan</option>
    <option value="date-asc">Eklenme Tarihine Göre En Eski</option>
    <option value="date-desc">Eklenme Tarihine Göre En Yeni</option>
    <option value="priority-asc">Önceliğe Göre Artan</option>
    <option value="priority-desc">Önceliğe Göre Azalan</option>
`;

renderGameList();