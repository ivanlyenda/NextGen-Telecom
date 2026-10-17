// =========================================================
// LÓGICA DE LA RED NEURONAL 3D REACTIVA (CANVAS OPTIMIZADO)
// =========================================================
const canvas = document.getElementById('network-canvas');
const ctx = canvas ? canvas.getContext('2d', { alpha: true }) : null;
let width, height, particles = [];
let mouse = { x: null, y: null, click: false };
let isCanvasVisible = true;
let animFrameId = null;

// --- PERF: Debounce para resize (evita reinicializar 60 veces por segundo) ---
let resizeTimer = null;

function initCanvas() {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    const divisor = window.innerWidth < 768 ? 16000 : 14000;
    const minParticles = window.innerWidth < 768 ? 24 : 45;
    const numParticles = Math.max(minParticles, Math.min(Math.floor((width * height) / divisor), 95));

    for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.25 + 0.15;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: vx,
            vy: vy,
            baseVx: vx,
            baseVy: vy,
            radius: Math.random() * 1.8 + 0.8
        });
    }
}

window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
window.addEventListener('mousedown', () => { mouse.click = true; }, { passive: true });
window.addEventListener('mouseup', () => { mouse.click = false; }, { passive: true });
window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.click = true;
    }
}, { passive: true });
window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }
}, { passive: true });
window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; }, { passive: true });
window.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; mouse.click = false; }, { passive: true });

// Detener renderizado si la pestaña está inactiva para ahorrar batería y GPU
document.addEventListener('visibilitychange', () => {
    isCanvasVisible = !document.hidden;
    if (isCanvasVisible && !animFrameId) {
        drawNetwork();
    }
});

// --- PERF: Distancia máxima al cuadrado (evita sqrt innecesario) ---
const MAX_LINK_DIST = 115;
const MAX_LINK_DIST_SQ = MAX_LINK_DIST * MAX_LINK_DIST;

// --- PERF: Paleta de colores cacheada por tema (cero lecturas DOM en el loop RAF) ---
let netFillColor = 'rgba(168, 85, 247, 0.78)';
let netStrokeColor = 'rgba(129, 140, 248, 0.38)';
let isLight = false;

function updateNetworkTheme(themeName) {
    const currentTheme = themeName || document.documentElement.getAttribute('data-theme') || (document.body.classList.contains('light-theme') ? 'light' : (document.body.classList.contains('glass-theme') || document.body.classList.contains('transparent-theme') ? 'glass' : 'dark'));
    const isGlass = currentTheme === 'glass' || currentTheme === 'transparent';
    isLight = currentTheme === 'light';

    if (isGlass) {
        netFillColor = 'rgba(244, 114, 182, 0.75)';
        netStrokeColor = 'rgba(236, 72, 153, 0.35)';
    } else if (isLight) {
        netFillColor = 'rgba(2, 132, 199, 0.88)';
        netStrokeColor = 'rgba(2, 132, 199, 0.40)';
    } else {
        netFillColor = 'rgba(168, 85, 247, 0.78)';
        netStrokeColor = 'rgba(129, 140, 248, 0.38)';
    }
}
updateNetworkTheme();
window.addEventListener('themechange', (e) => updateNetworkTheme(e.detail?.theme));

function drawNetwork() {
    if (!ctx || !isCanvasVisible) {
        animFrameId = null;
        return;
    }

    ctx.clearRect(0, 0, width, height);

    const fillColor = netFillColor;
    const strokeColor = netStrokeColor;

    const len = particles.length;
    const repulseRadius = window.innerWidth < 768 ? 70 : 120;
    const repulseRadiusSq = repulseRadius * repulseRadius;

    // --- PERF: Batch 1 — Actualizar posiciones y calcular física (sin Math.random en el RAF) ---
    for (let i = 0; i < len; i++) {
        let p = particles[i];

        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - p.x;
            let dy = mouse.y - p.y;
            let distanceSq = dx * dx + dy * dy;

            if (mouse.click && distanceSq < repulseRadiusSq * 2.25) {
                let distance = Math.sqrt(distanceSq) || 1;
                p.vx -= (dx / distance) * 1.5;
                p.vy -= (dy / distance) * 1.5;
            } else if (distanceSq < repulseRadiusSq) {
                let distance = Math.sqrt(distanceSq) || 1;
                let force = (repulseRadius - distance) / repulseRadius;
                p.x -= (dx / distance) * force * 3;
                p.y -= (dy / distance) * force * 3;
            }
        }

        // Suave convergencia a la deriva orgánica base (cero jitter, 60fps constante)
        p.vx = p.vx * 0.96 + p.baseVx * 0.04;
        p.vy = p.vy * 0.96 + p.baseVy * 0.04;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) { p.x = 0; p.vx *= -1; p.baseVx *= -1; }
        else if (p.x > width) { p.x = width; p.vx *= -1; p.baseVx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; p.baseVy *= -1; }
        else if (p.y > height) { p.y = height; p.vy *= -1; p.baseVy *= -1; }
    }

    // --- PERF: Batch 2 — Dibujar TODAS las líneas en un solo path ---
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    const linkLimitSq = isLight ? (MAX_LINK_DIST * 1.15) * (MAX_LINK_DIST * 1.15) : MAX_LINK_DIST_SQ;
    for (let i = 0; i < len; i++) {
        let p = particles[i];
        for (let j = i + 1; j < len; j++) {
            let p2 = particles[j];
            let dx = p.x - p2.x;
            let dy = p.y - p2.y;
            let distSq = dx * dx + dy * dy;
            if (distSq < linkLimitSq) {
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
            }
        }
    }
    ctx.lineWidth = isLight ? 1.1 : 0.5;
    ctx.stroke();

    // --- PERF: Batch 3 — Dibujar TODOS los nodos en un solo path ---
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    for (let i = 0; i < len; i++) {
        let p = particles[i];
        const r = isLight ? p.radius * 1.35 : p.radius;
        ctx.moveTo(p.x + r, p.y);
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    }
    ctx.fill();

    animFrameId = requestAnimationFrame(drawNetwork);
}

// --- PERF: Debounced resize en lugar de reinicializar en cada frame ---
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        initCanvas();
    }, 250);
}, { passive: true });

initCanvas();
drawNetwork();
