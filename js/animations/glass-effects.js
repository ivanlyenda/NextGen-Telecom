// =========================================================
// EFECTO LIQUID GLASS: SPOTLIGHT, TILT, ENTRADA SUAVE
// + PROXIMITY PULSE + COUNTER ANIMATION OPTIMIZADA
// =========================================================

// --- Unificado: card-index solo se setea aquí (eliminado duplicado de widgets-premium.js) ---
document.querySelectorAll('.stat-card.liquid-glass').forEach((card, i) => {
    card.style.setProperty('--card-index', i);
});

const canUseFineMotion = window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// =========================================================
// MÓDULO 1: LIQUID GLASS TILT + SPOTLIGHT (Unificado)
// Maneja tanto el tilt 3D como el --mouse-x/--mouse-y
// para TODOS los .liquid-glass (stat-cards + cards grandes)
// =========================================================
if (canUseFineMotion) {
    document.querySelectorAll('.liquid-glass').forEach(widget => {
        const quickRotateX = gsap.quickTo(widget, "rotateX", { duration: 0.24, ease: "power2.out" });
        const quickRotateY = gsap.quickTo(widget, "rotateY", { duration: 0.24, ease: "power2.out" });
        const cardContent = widget.querySelector('.card-content');
        const quickContentX = cardContent ? gsap.quickTo(cardContent, "x", { duration: 0.28, ease: "power2.out" }) : null;
        const quickContentY = cardContent ? gsap.quickTo(cardContent, "y", { duration: 0.28, ease: "power2.out" }) : null;

        widget.addEventListener('mousemove', e => {
            const rect = widget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Spotlight (--mouse-x/--mouse-y) — unificado aquí, ya no se duplica
            widget.style.setProperty('--mouse-x', `${x}px`);
            widget.style.setProperty('--mouse-y', `${y}px`);

            const width = rect.width;
            const height = rect.height;
            const mouseX = e.clientX - (rect.left + width / 2);
            const mouseY = e.clientY - (rect.top + height / 2);

            quickRotateX((mouseY / (height / 2)) * -8);
            quickRotateY((mouseX / (width / 2)) * 8);
            if (quickContentX && quickContentY) {
                quickContentX((mouseX / width) * 5);
                quickContentY((mouseY / height) * 5);
            }
        }, { passive: true });

        widget.addEventListener('mouseleave', () => {
            quickRotateX(0);
            quickRotateY(0);
            // Reset spotlight al centro
            widget.style.setProperty('--mouse-x', '50%');
            widget.style.setProperty('--mouse-y', '50%');
            if (quickContentX && quickContentY) {
                quickContentX(0);
                quickContentY(0);
            }
        }, { passive: true });
    });
}

// =========================================================
// MÓDULO 2: SCROLL REVEAL — Cards con entrada suave
// =========================================================
const cards = document.querySelectorAll('.card');
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            gsap.fromTo(entry.target,
                { opacity: 0, y: 28, scale: 0.985 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.55,
                    delay: index * 0.04,
                    ease: "power3.out",
                    onComplete: () => entry.target.classList.add('visible')
                }
            );
            scrollObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: "80px 0px" });

cards.forEach(card => {
    card.style.opacity = '0';
    scrollObserver.observe(card);
});

// =========================================================
// MÓDULO 3: COUNTER ANIMATION — Usa RAF en vez de setTimeout
// =========================================================
const statsSection = document.getElementById('stats-section');
const counters = document.querySelectorAll('.counter');

const animateCounters = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            statsSection.classList.add('visible');
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const suffix = counter.getAttribute('data-suffix') || '';
                const isDecimal = target % 1 !== 0;
                const totalFrames = 80;
                let frame = 0;

                const updateCount = () => {
                    frame++;
                    const progress = frame / totalFrames;
                    // Ease-out cubic para sensación premium
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = target * eased;

                    if (frame < totalFrames) {
                        counter.innerText = isDecimal ? current.toFixed(1) + suffix : Math.ceil(current) + suffix;
                        requestAnimationFrame(updateCount);
                    } else {
                        counter.innerText = (isDecimal ? target.toFixed(1) : target) + suffix;
                    }
                };
                requestAnimationFrame(updateCount);
            });
            observer.unobserve(entry.target);
        }
    });
};

const counterObserver = new IntersectionObserver(animateCounters, { threshold: 0.5 });
if (statsSection) counterObserver.observe(statsSection);

// =========================================================
// MÓDULO 4: PROXIMITY PULSE — Detección de cercanía del cursor
// Hace que los widgets de la página principal pulsen
// suavemente en los bordes cuando el cursor se acerca
// =========================================================
if (canUseFineMotion) {
    const proximityTargets = document.querySelectorAll('.stat-card.liquid-glass, #grid-inicio .card');
    const PROXIMITY_RADIUS = 180; // px de distancia máxima para activar
    const visibleTargets = new Set();

    const proximityObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) visibleTargets.add(entry.target);
            else {
                visibleTargets.delete(entry.target);
                entry.target.style.setProperty('--proximity', '0');
            }
        });
    }, { rootMargin: '160px 0px' });

    proximityTargets.forEach((target) => proximityObserver.observe(target));

    let proximityFrame = null;
    let lastMouseX = 0, lastMouseY = 0;
    const rectCache = new Map();
    const updateRectCache = () => visibleTargets.forEach((el) => rectCache.set(el, el.getBoundingClientRect()));
    window.addEventListener('scroll', updateRectCache, { passive: true });
    window.addEventListener('resize', updateRectCache, { passive: true });

    const PROX_SQ = PROXIMITY_RADIUS * PROXIMITY_RADIUS;
    const updateProximity = () => {
        proximityFrame = null;
        visibleTargets.forEach((el) => {
            let rect = rectCache.get(el);
            if (!rect) {
                rect = el.getBoundingClientRect();
                rectCache.set(el, rect);
            }
            const dx = lastMouseX - Math.max(rect.left, Math.min(lastMouseX, rect.right));
            const dy = lastMouseY - Math.max(rect.top, Math.min(lastMouseY, rect.bottom));
            const dSq = dx * dx + dy * dy;
            const next = dSq === 0 ? '1' : dSq < PROX_SQ ? (1 - Math.sqrt(dSq) / PROXIMITY_RADIUS).toFixed(2) : '0';

            if (el.dataset.proximity !== next) {
                el.dataset.proximity = next;
                el.style.setProperty('--proximity', next);
            }
        });
    };

    document.addEventListener('mousemove', (e) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        if (!proximityFrame) {
            proximityFrame = requestAnimationFrame(updateProximity);
        }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        visibleTargets.forEach((el) => { el.dataset.proximity = '0'; el.style.setProperty('--proximity', '0'); });
    }, { passive: true });
}
