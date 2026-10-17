// =========================================================
// CURSOR Y EVENTOS GLOBALES
// =========================================================
const cursorDot = document.getElementById("cursor-dot");
const cursorOutline = document.getElementById("cursor-outline");

if (window.matchMedia("(pointer: fine)").matches) {
    let cursorX = 0;
    let cursorY = 0;
    let outlineX = 0;
    let outlineY = 0;
    let cursorFrame = null;

    const renderCursor = () => {
        outlineX += (cursorX - outlineX) * 0.18;
        outlineY += (cursorY - outlineY) * 0.18;

        if (cursorDot) cursorDot.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        if (cursorOutline) cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;

        // Continuar el loop mientras el outline no haya convergido al cursor
        const dx = cursorX - outlineX;
        const dy = cursorY - outlineY;
        if (dx * dx + dy * dy > 0.25) {
            cursorFrame = requestAnimationFrame(renderCursor);
        } else {
            cursorFrame = null;
        }
    };

    window.addEventListener("mousemove", (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);

        // Spotlight dinámico que sigue al cursor en tarjetas Bento y bloques de código
        const targetCard = e.target.closest('.card, .highlight-box, .bento-card, .network-insight, .terminal-window');
        if (targetCard) {
            const rect = targetCard.getBoundingClientRect();
            targetCard.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            targetCard.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }
    }, { passive: true });

    document.body.addEventListener("mouseover", (e) => {
        if(e.target.closest('.interactive-hover, .router-btn, .tool-btn, a, button, .dock-item, .theme-option, .copy-btn, .card')) {
            document.body.classList.add("cursor-hover");
        }
    });
    document.body.addEventListener("mouseout", (e) => {
        if(e.target.closest('.interactive-hover, .router-btn, .tool-btn, a, button, .dock-item, .theme-option, .copy-btn, .card')) {
            document.body.classList.remove("cursor-hover");
        }
    });
}

// Manejador interactivo universal para botones de copiar (con micro-animación y estado táctil)
document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.copy-btn');
    if (!copyBtn) return;

    const parent = copyBtn.closest('.highlight-box, .terminal-window, pre') || copyBtn.parentElement;
    const codeEl = parent ? parent.querySelector('code') : null;
    const textToCopy = codeEl ? codeEl.innerText.replace(/^\$\s*/, '').trim() : copyBtn.getAttribute('data-copy') || '';

    if (textToCopy && navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            if (typeof showToast === 'function') {
                showToast('Comando copiado al portapapeles', 'success');
            }
            copyBtn.classList.add('copied');
            const originalLabel = copyBtn.innerText;
            copyBtn.innerText = 'Copiado';

            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerText = originalLabel;
            }, 2000);
        }).catch(() => {
            if (typeof showToast === 'function') {
                showToast('No se pudo copiar automáticamente', 'error');
            }
        });
    }
});

const backToTop = document.getElementById("back-to-top");
let scrollFrame = null;

const updateScrollUi = () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    if (backToTop) backToTop.style.display = winScroll > 400 ? "flex" : "none";
    scrollFrame = null;
};

window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollUi);
}, { passive: true });

updateScrollUi();

if (backToTop) {
    backToTop.onclick = () => {
        if (typeof lenis !== 'undefined') lenis.scrollTo(0);
        else window.scrollTo({top: 0, behavior: 'smooth'});
    };
}

// --- INTERACTIVIDAD NOC: TOPOLOGÍA TRONCAL DE COLOMBIA ---
document.addEventListener('click', (e) => {
    const nodeBtn = e.target.closest('.noc-node-btn');
    if (!nodeBtn) return;

    document.querySelectorAll('.noc-node-btn').forEach(btn => btn.classList.remove('active'));
    nodeBtn.classList.add('active');

    const city = nodeBtn.querySelector('.node-city')?.innerText || 'Nodo';
    const lat = nodeBtn.getAttribute('data-lat') || '8.2';
    const hop = nodeBtn.getAttribute('data-hop') || 'Troncal Nacional';

    const latencyEl = document.getElementById('noc-latency');
    if (latencyEl) latencyEl.innerText = `${lat} ms`;

    const routeText = document.getElementById('noc-route-text');
    if (routeText) {
        routeText.innerHTML = `Cliente Local ➔ Gateway FTTH ➔ <span style="color:#38bdf8; font-weight:800;">${city} (${hop})</span> ➔ Salida Internacional (${lat} ms)`;
    }

    if (typeof showToast === 'function') {
        showToast(`Nodo ${city} seleccionado · Latencia: ${lat} ms`, 'info');
    }
});
