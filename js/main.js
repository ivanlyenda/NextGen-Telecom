// =========================================================
// MOTOR DE ANALÍTICA Y OPTIMIZACIÓN DE FPS (OPTIMIZADO)
// =========================================================
function simulateNetworkActivity() {
    const lValue = document.querySelector('#stat-latency .value');
    const bValue = document.querySelector('#stat-bandwidth .value');
    const pValue = document.querySelector('#stat-loss .value');
    if (lValue) {
        const ping = Math.floor(Math.random() * (35 - 12) + 12);
        lValue.innerText = `${ping} ms`;
        lValue.style.color = ping > 30 ? 'var(--tertiary)' : '';
    }
    if (bValue) {
        const speed = (Math.random() * (950 - 870) + 870).toFixed(1);
        bValue.innerText = `${speed} Mbps`;
    }
    if (pValue) {
        const loss = (Math.random() * 0.005).toFixed(3);
        pValue.innerText = `${loss}%`;
    }
}

// Iniciar simulación cada 2.5 segundos
setInterval(simulateNetworkActivity, 2500);

// --- PERF: Scroll listener unificado (disable-hover durante scroll) ---
// Anteriormente existía un listener separado aquí y en global-events.js
// Ahora solo este archivo gestiona disable-hover
let isScrolling;
window.addEventListener('scroll', () => {
    if (!document.body.classList.contains('disable-hover')) {
        document.body.classList.add('disable-hover');
    }
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(() => {
        document.body.classList.remove('disable-hover');
    }, 150);
}, { passive: true });

// Iniciar simulación al cargar — se usa solo una vez via DOMContentLoaded
// (el setInterval ya cubre las ejecuciones posteriores)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', simulateNetworkActivity, { once: true });
} else {
    simulateNetworkActivity();
}
