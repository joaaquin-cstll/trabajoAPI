// Asegúrate de que la URL base NO termine en barra /
const BASE_URL = "https://thesimpsonsapi.com"; 
const URL_PERSONAJES = `${BASE_URL}/api/characters`;
const URL_LUGARES = `${BASE_URL}/api/locations`;

async function cargarCategoria(categoria) {
    const contenedor = document.getElementById('contenedorPersonajes');
    const estado = document.getElementById('estadoMensaje');
    contenedor.innerHTML = "<p>Buscando en Springfield...</p>";

    try {
        const respuesta = await fetch(URL_PERSONAJES);
        const datos = await respuesta.json();
        const personajes = datos.results;

        let filtrados = [];
        if (categoria === 'protagonistas') {
            filtrados = personajes.filter(p => p.id <= 5);
        } else if (categoria === 'iconicos') {
            const idsIconicos = [9, 13, 15, 16, 17, 18];
            filtrados = personajes.filter(p => idsIconicos.includes(p.id));
        } else {
            const excluidos = [1, 2, 3, 4, 5, 9, 13, 15, 16, 17, 18];
            filtrados = personajes.filter(p => !excluidos.includes(p.id));
        }

        renderizar(filtrados, 'personaje');
        estado.innerText = `Mostrando personajes: ${categoria}`;
    } catch (e) {
        estado.innerText = "Error al conectar con la API.";
    }
}

async function cargarLugares() {
    const contenedor = document.getElementById('contenedorPersonajes');
    const estado = document.getElementById('estadoMensaje');
    contenedor.innerHTML = "<p>Viajando por Springfield...</p>";

    try {
        const respuesta = await fetch(URL_LUGARES);
        const datos = await respuesta.json();
        const lugaresIconicos = datos.results.slice(0, 10);

        renderizar(lugaresIconicos, 'lugar');
        estado.innerText = "📍 Lugares emblemáticos";
    } catch (e) {
        estado.innerText = "Error al conectar con la API.";
    }
}

function renderizar(lista, tipo) {
    const contenedor = document.getElementById('contenedorPersonajes');
    contenedor.innerHTML = "";

    lista.forEach(item => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        
        // 1. Construimos la URL original de la API
        const rutaRelativa = tipo === 'lugar' ? item.image_path : item.portrait_path;
        const urlOriginal = `${BASE_URL}${rutaRelativa}`;

        // 2. LA SOLUCIÓN: Usamos un proxy de imágenes gratuito (wsrv.nl)
        // Esto descarga la imagen por ti y te la sirve sin bloqueos de CORS/Hotlinking
        const urlConProxy = `https://wsrv.nl/?url=${encodeURIComponent(urlOriginal)}`;

        tarjeta.innerHTML = `
            <div class="imagen-contenedor">
                <img src="${urlConProxy}" alt="${item.name}" 
                     onerror="this.src='https://placehold.co/200x200/3c5baf/ffffff?text=Springfield'">
            </div>
            <div class="nombre">${item.name}</div>
            <div class="ocupacion">${tipo === 'lugar' ? 'Uso: ' + item.use : item.occupation}</div>
            ${tipo === 'personaje' && item.phrases && item.phrases.length > 0 ? `<p class="frase">"${item.phrases[0]}"</p>` : ''}
            ${tipo === 'lugar' ? `<p class="ciudad">🏙️ ${item.town || 'Springfield'}</p>` : ''}
        `;
        contenedor.appendChild(tarjeta);
    });
}