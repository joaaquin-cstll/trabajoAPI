const API_URL = 'https://api.disneyapi.dev/character?pageSize=100';
let allCharacters = [];
let score = 0;
let highScore = localStorage.getItem('disneyHighScore') || 0;
let favorites = JSON.parse(localStorage.getItem('disneyFavs')) || [];

async function fetchDisneyData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        allCharacters = data.data.filter(char => char.imageUrl && char.name);
        renderCharacters(allCharacters);
        renderStats();
        setupGame();
        document.getElementById('high-score').innerText = highScore;
    } catch (error) {
        console.error("Error API");
    }
}

function renderCharacters(list) {
    const grid = document.getElementById('char-grid');
    grid.innerHTML = list.map(char => {
        const isFav = favorites.includes(char._id);
        return `
            <div class="card" onclick="showDetails(${char._id})">
                <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFav(event, ${char._id})">❤</button>
                <span class="badge">${char.films.length} Pelis</span>
                <img src="${char.imageUrl}" alt="${char.name}">
                <h3>${char.name}</h3>
            </div>
        `;
    }).join('');
}

function toggleFav(event, id) {
    event.stopPropagation(); // Evita abrir el modal al dar a favoritos
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('disneyFavs', JSON.stringify(favorites));
    renderCharacters(allCharacters);
}

function setupGame() {
    if (allCharacters.length === 0) return;
    const img = document.getElementById('game-img');
    const optionsDiv = document.getElementById('options');
    const feedback = document.getElementById('feedback');
    
    img.style.filter = "none";
    feedback.innerText = "¿Quién es?";
    feedback.style.color = "#333";

    const shuffled = [...allCharacters].sort(() => 0.5 - Math.random());
    const roundOptions = shuffled.slice(0, 4);
    const winner = roundOptions[0];

    img.src = winner.imageUrl;
    optionsDiv.innerHTML = "";

    roundOptions.sort(() => 0.5 - Math.random()).forEach(opt => {
        const btn = document.createElement('button');
        btn.className = "btn-opt";
        btn.innerText = opt.name;
        btn.onclick = () => {
            const allBtns = optionsDiv.querySelectorAll('.btn-opt');
            allBtns.forEach(b => b.disabled = true);

            if (opt.name === winner.name) {
                score += 10;
                feedback.innerText = "¡+10 Puntos!";
                feedback.style.color = "green";
                btn.classList.add('correct-btn');
                updateScore();
            } else {
                score = 0; // Se resetea la racha si falla
                feedback.innerText = "¡D'oh! Era " + winner.name;
                feedback.style.color = "red";
                btn.classList.add('wrong-btn');
                allBtns.forEach(b => { if(b.innerText === winner.name) b.classList.add('correct-btn'); });
                updateScore();
            }
        };
        optionsDiv.appendChild(btn);
    });
}

function updateScore() {
    document.getElementById('current-score').innerText = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('disneyHighScore', highScore);
        document.getElementById('high-score').innerText = highScore;
    }
}

// Reutilizar funciones de filtrado, modal y navegación previas...
function showDetails(id) {
    const char = allCharacters.find(c => c._id === id);
    const modal = document.getElementById('char-modal');
    document.getElementById('modal-body').innerHTML = `
        <img src="${char.imageUrl}" style="width:150px; border-radius:10px;">
        <h2>${char.name}</h2>
        <p>Apariciones en películas: ${char.films.length}</p>
        <p>${char.films.join(', ')}</p>
    `;
    modal.style.display = "block";
}
function closeModal() { document.getElementById('char-modal').style.display = "none"; }
function filterCharacters() {
    const query = document.getElementById('search').value.toLowerCase();
    renderCharacters(allCharacters.filter(c => c.name.toLowerCase().includes(query)));
}
function renderStats() {
    const container = document.getElementById('stats-container');
    const top = [...allCharacters].sort((a,b) => b.films.length - a.films.length).slice(0,5);
    container.innerHTML = top.map(c => `
        <div class="stat-item">
            <img src="${c.imageUrl}" style="width:50px; height:50px; border-radius:50%">
            <div class="stat-info"><h4>${c.name}</h4><p>${c.films.length} Películas</p></div>
        </div>
    `).join('');
}
function showSection(id) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    const navBtnId = id === 'characters' ? 'nav-char' : id === 'stats' ? 'nav-stats' : 'nav-game';
    document.getElementById(navBtnId).classList.add('active');
}

fetchDisneyData();