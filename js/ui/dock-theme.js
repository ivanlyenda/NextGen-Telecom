// =========================================================
// BARRA LIQUIDA, TEMAS Y CONTROLES VISUALES
// =========================================================
const dock = document.getElementById('liquid-dock');
const dockHighlight = document.getElementById('dock-highlight');
const themeOptions = document.querySelectorAll('.theme-option');
const glassThemeInputs = document.querySelectorAll('.glass-radio-group input[name="theme"]');
const themeCycle = ['dark', 'light', 'glass'];
const themeLabels = {
    dark: 'Oscuro',
    light: 'Claro',
    glass: 'Glassmorphism',
    transparent: 'Glassmorphism'
};

const canUseFinePointer = window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const interactiveDockItems = document.querySelectorAll('.dock-item');
const allDockItems = document.querySelectorAll('.dock-item, .theme-option');

if (dock && dockHighlight) {
    allDockItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const rect = item.getBoundingClientRect();
            const dockRect = dock.getBoundingClientRect();
            const offsetLeft = rect.left - dockRect.left;

            gsap.to(dockHighlight, {
                left: offsetLeft,
                width: rect.width,
                opacity: 1,
                duration: 0.34,
                ease: "back.out(1.4)"
            });
        });
    });

    if (canUseFinePointer) {
        const RADIUS = 85; // Radio de influencia horizontal en px
        let dockRaf = null;

        dock.addEventListener('mousemove', (e) => {
            if (dockRaf) return;
            dockRaf = requestAnimationFrame(() => {
                dockRaf = null;
                const mouseX = e.clientX;
                interactiveDockItems.forEach(item => {
                    const rect = item.getBoundingClientRect();
                    const itemCenter = rect.left + rect.width / 2;
                    const dist = Math.abs(mouseX - itemCenter);

                    if (dist < RADIUS) {
                        // Curva cosenoidal física macOS: 1 en el centro exacto, 0 en el borde
                        const factor = Math.cos((dist / RADIUS) * (Math.PI / 2));
                        const scale = 1 + factor * 0.32; // Hasta 1.32x de aumento suave
                        const translateY = -factor * 6;  // Elevación de 6px
                        item.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
                    } else {
                        item.style.transform = 'translate3d(0, 0, 0) scale(1)';
                    }
                });
            });
        }, { passive: true });

        dock.addEventListener('mouseleave', () => {
            if (dockRaf) { cancelAnimationFrame(dockRaf); dockRaf = null; }
            interactiveDockItems.forEach(item => {
                gsap.to(item, {
                    scale: 1,
                    y: 0,
                    duration: 0.28,
                    ease: "power2.out",
                    overwrite: "auto",
                    onComplete: () => { item.style.transform = ''; }
                });
            });
            gsap.to(dockHighlight, { opacity: 0, width: 0, duration: 0.25 });
        });
    } else {
        dock.addEventListener('mouseleave', () => {
            gsap.to(dockHighlight, { opacity: 0, width: 0, duration: 0.25 });
        });
    }
}

const updateThemeIcon = (theme) => {
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    const themeBtn = document.getElementById('theme-btn');

    if (moonIcon) moonIcon.style.display = theme === 'light' ? 'none' : 'block';
    if (sunIcon) sunIcon.style.display = theme === 'light' ? 'block' : 'none';
    if (themeBtn) {
        themeBtn.dataset.theme = theme;
        themeBtn.title = `Tema actual: ${themeLabels[theme] || theme}. Clic para cambiar.`;
        themeBtn.setAttribute('aria-label', `Tema actual: ${themeLabels[theme] || theme}. Cambiar tema.`);
    }
};

const setTheme = (theme, options = {}) => {
    let nextTheme = (theme === 'transparent') ? 'glass' : theme;
    if (!themeCycle.includes(nextTheme)) nextTheme = 'dark';

    // Operaciones sin impacto en layout FUERA del rAF
    try {
        localStorage.setItem('theme', nextTheme);
    } catch (e) {
        // Storage no disponible (modo incógnito, storage desactivado)
    }
    // BATCH: Todas las mutaciones DOM en un único frame de animación
    // Evita layout thrashing (11 style recalcs → 1 sola composición)
    requestAnimationFrame(() => {
        updateThemeIcon(nextTheme);

        const html = document.documentElement;
        const body = document.body;

        // 1. data-theme como fuente de verdad global
        html.setAttribute('data-theme', nextTheme);
        body.setAttribute('data-theme', nextTheme);

        // 2. Clases de tema en body — operación única
        body.classList.remove('dark-theme', 'light-theme', 'glass-theme', 'transparent-theme');
        body.classList.add(`${nextTheme}-theme`);
        if (nextTheme === 'glass') {
            body.classList.add('transparent-theme');
        }

        // 3. Clase .dark en html para compatibilidad
        html.classList.toggle('dark', nextTheme !== 'light');

        // 4. Actualizar estados de botones de tema
        themeOptions.forEach(opt => {
            const optTheme = opt.getAttribute('data-theme');
            const isActive = optTheme === nextTheme || (nextTheme === 'glass' && optTheme === 'transparent');
            opt.classList.toggle('is-active', isActive);
            opt.setAttribute('aria-pressed', String(isActive));
        });

        // 5. Radios del selector glass
        glassThemeInputs.forEach(input => {
            input.checked = (input.value === nextTheme) || (nextTheme === 'glass' && input.value === 'transparent');
        });

        // 6. Notificar a módulos y canvas mediante evento desacoplado
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: nextTheme } }));
    });

    if (!options.silent && typeof showToast === 'function') {
        showToast(`Modo ${themeLabels[nextTheme] || nextTheme} activado`, 'success');
    }
};

glassThemeInputs.forEach(input => {
    input.addEventListener('change', () => {
        if (input.checked) setTheme(input.value);
    });
});

const themeBtn = document.getElementById('theme-btn');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        let currentTheme = 'dark';
        try {
            currentTheme = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark';
        } catch (e) {
            currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        }
        if (currentTheme === 'transparent') currentTheme = 'glass';
        const currentIndex = themeCycle.indexOf(currentTheme);
        const nextTheme = themeCycle[(currentIndex + 1) % themeCycle.length];
        setTheme(nextTheme);
    });
}

let savedTheme;
try {
    savedTheme = localStorage.getItem('theme');
} catch (e) {
    savedTheme = null;
}
if (savedTheme === 'transparent') savedTheme = 'glass';
if (!savedTheme) {
    // Respetar prefers-color-scheme del sistema si no hay preferencia guardada
    savedTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}
setTheme(savedTheme, { silent: true });

// =========================================================
// HANDLERS PARA BOTONES INTERACTIVOS DEL LIQUID DOCK
// =========================================================
const pingPopup = document.getElementById('ping-visual-popup');
const dockPingBtn = document.getElementById('dock-ping-btn');
if (dockPingBtn && pingPopup) {
    dockPingBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pingPopup.classList.toggle('visible');
    });
    document.addEventListener('click', (e) => {
        if (pingPopup.classList.contains('visible') && !pingPopup.contains(e.target) && !dockPingBtn.contains(e.target)) {
            pingPopup.classList.remove('visible');
        }
    });
}

const dockFocusBtn = document.getElementById('dock-focus-btn');
if (dockFocusBtn) {
    dockFocusBtn.addEventListener('click', () => {
        const isFocus = document.body.classList.toggle('focus-mode');
        dockFocusBtn.classList.toggle('text-cyan-400', isFocus);
        if (typeof showToast === 'function') {
            showToast(isFocus ? 'Modo Concentración activado' : 'Modo Concentración desactivado', isFocus ? 'info' : 'success');
        }
    });
}

const dockQrBtn = document.getElementById('dock-qr-btn');
if (dockQrBtn) {
    dockQrBtn.addEventListener('click', () => {
        if (typeof abrirManual === 'function') {
            abrirManual('gen-wpa3');
        }
    });
}