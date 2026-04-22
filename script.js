const API_KEY = '4156caece0a24da8bbfdfa9de29c6c35'; // Pon tu clave aquí
const BASE_URL = 'https://api.football-data.org/v4';

async function obtenerDatosLiga() {
    const headers = { 'X-Auth-Token': API_KEY };

    try {
        console.log("⚽ Conectando con el túnel de vestuarios... \n");

        // 1. Obtenemos la clasificación actual para saber quién llega fuerte
        const resClasificacion = await fetch(`${BASE_URL}/competitions/PD/standings`, { headers });
        const dataClasificacion = await resClasificacion.json();
        
        // 2. Obtenemos los próximos partidos (Próximos 5)
        const resPartidos = await fetch(`${BASE_URL}/competitions/PD/matches?status=SCHEDULED`, { headers });
        const dataPartidos = await resPartidos.json();

        if (!dataPartidos.matches || dataPartidos.matches.length === 0) {
            console.log("¡No hay partidos programados pronto! Toca descansar.");
            return;
        }

        procesarPredicciones(dataClasificacion.standings[0].table, dataPartidos.matches.slice(0, 5));

    } catch (error) {
        console.error("❌ Error en el VAR:", error.message);
    }
}

function procesarPredicciones(clasificacion, proximosPartidos) {
    console.log("--- 🔮 PREDICCIONES DE LA JORNADA 🔮 ---");

    proximosPartidos.forEach(partido => {
        const local = partido.homeTeam.name;
        const visitante = partido.awayTeam.name;

        // Buscamos la posición de cada uno en la tabla
        const posLocal = clasificacion.find(t => t.team.id === partido.homeTeam.id).position;
        const posVisitante = clasificacion.find(t => t.team.id === partido.awayTeam.id).position;

        let comentario = "";
        if (posLocal < posVisitante) {
            comentario = `Favorecido el ${local} por su posición en la tabla (${posLocal}º).`;
        } else if (posVisitante < posLocal) {
            comentario = `¡Ojo! El ${visitante} (${posVisitante}º) viene mejor que el local.`;
        } else {
            comentario = "Duelo de titanes igualados. ¡Cualquiera puede ganar!";
        }

        console.log(`
🏟️  ${local} vs ${visitante}
📈  Ranking: ${posLocal}º vs ${posVisitante}º
💡  Predicción: ${comentario}
---------------------------------------`);
    });
}

// Arrancamos el proyecto
obtenerDatosLiga();