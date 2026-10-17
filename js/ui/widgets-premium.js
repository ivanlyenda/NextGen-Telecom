// ================================================================
// NEXGEN TELECOM — WIDGETS PREMIUM INTERACTIONS
// Liquid Glassmorphism + Fiber Optic + Multi-Theme JS Engine
// OPTIMIZADO: Un solo MutationObserver, sin DOM rewrite, sin duplicados
// ================================================================

(function () {
    'use strict';

    // ----------------------------------------------------------------
    // UTILIDADES
    // ----------------------------------------------------------------
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
    const canAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ----------------------------------------------------------------
    // MÓDULO 1: THEME-AWARE GLOW UPDATER
    // ----------------------------------------------------------------
    const THEME_GLOW_MAP = {
        dark:        { hue: 270, shadowHue: 270 },
        light:       { hue: 235, shadowHue: 235 },
        glass:       { hue: 325, shadowHue: 325 },
        neon:        { hue: 185, shadowHue: 290 },
        transparent: { hue: 325, shadowHue: 325 },
    };

    function applyThemeGlow(theme) {
        const map = THEME_GLOW_MAP[theme] || THEME_GLOW_MAP.dark;
        document.documentElement.style.setProperty('--glow-hue', map.hue);
        document.documentElement.style.setProperty('--shadow-hue', map.shadowHue);
    }

    function updateSocialBtnColors(theme) {
        $$('.social-btn').forEach(btn => {
            btn.dataset.currentTheme = theme;
        });
    }

    function updateShiningBtnState(theme) {
        $$('.shining-btn, .tool-btn').forEach(btn => {
            btn.classList.toggle('neon-boost', theme === 'neon');
        });
    }

    // --- PERF: Event listener desacoplado para themechange (cero layout thrashing, sin MutationObserver) ---
    window.addEventListener('themechange', (e) => {
        const theme = e.detail?.theme || 'dark';
        // Las custom properties (--glow-hue, --shadow-hue) ahora se gestionan por CSS puro
    });


    // ----------------------------------------------------------------
    // MÓDULO 2: SOCIAL BUTTONS — LIQUID EXPANSION HANDLER
    // ----------------------------------------------------------------
    function initSocialButtons() {
        const socialBtns = $$('.social-btn');
        if (!socialBtns.length) return;

        socialBtns.forEach(btn => {
            btn.style.width = '52px';

            if ('ontouchstart' in window) {
                btn.addEventListener('touchstart', () => {
                    btn.classList.add('touch-expanded');
                    btn.style.width = '180px';
                }, { passive: true });

                btn.addEventListener('touchend', () => {
                    setTimeout(() => {
                        btn.classList.remove('touch-expanded');
                        btn.style.width = '52px';
                    }, 1800);
                }, { passive: true });
            }

            // Fiber-glow trail en mousemove (solo desktop)
            if (canAnimate) {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    btn.style.setProperty('--mouse-x', `${x}%`);
                    btn.style.setProperty('--mouse-y', `${y}%`);
                }, { passive: true });
            }
        });
    }


    // ----------------------------------------------------------------
    // MÓDULO 3: SHINING BUTTON STATE MANAGER
    // ----------------------------------------------------------------
    window.setShiningBtnState = function(btnEl, state) {
        btnEl.classList.remove('state-active', 'state-inactive');
        if (state !== 'default') {
            btnEl.classList.add(`state-${state}`);
        }
    };


    // ----------------------------------------------------------------
    // MÓDULO 4: THEME SWITCH BUTTON
    // FIX: Ya NO reescribe el DOM — el HTML ya tiene socket/face/glow
    // Solo limpia clases Tailwind conflictivas si existen
    // ----------------------------------------------------------------
    function initThemeSwitchButton() {
        const themeBtn = $('#theme-btn');
        if (!themeBtn) return;
        if (!themeBtn.classList.contains('theme-switch-btn')) {
            themeBtn.classList.add('theme-switch-btn');
        }
        // Limpiar inline styles de Tailwind que puedan haber quedado
        const tailwindConflictClasses = [
            'bg-white/5', 'border', 'border-white/10',
            'hover:border-indigo-500/50', 'w-11', 'h-11',
            'rounded-full', 'text-slate-300', 'hover:text-indigo-400',
            'transition-all', 'duration-300', 'shadow-md'
        ];
        themeBtn.classList.remove(...tailwindConflictClasses);
    }


    // ----------------------------------------------------------------
    // MÓDULO 5: FIBER GLOW ANIMATOR
    // ----------------------------------------------------------------
    function initFiberPulse() {
        const fiberDots = $$('.fiber-dot');
        if (!fiberDots.length || !canAnimate) return;

        const pingValue = $('#ping-value');
        const latencyFiberDot = $('#stat-latency .fiber-dot');
        const latencyFiberTrail = $('#stat-latency .fiber-trail');

        if (pingValue && latencyFiberDot && latencyFiberTrail) {
            const pingObserver = new MutationObserver(() => {
                const text = pingValue.textContent || '';
                const ms = parseInt(text);
                let status = 'status-ok';
                if (ms > 150) status = 'status-error';
                else if (ms > 80) status = 'status-warn';

                latencyFiberDot.className = `fiber-dot ${status}`;
                latencyFiberTrail.className = `fiber-trail ${status}`;
            });
            pingObserver.observe(pingValue, { childList: true, characterData: true, subtree: true });
        }
    }


    // ----------------------------------------------------------------
    // MÓDULO 6: BACK TO TOP BUTTON — Shining upgrade
    // ----------------------------------------------------------------
    function upgradeBackToTop() {
        const btn = $('#back-to-top');
        if (!btn) return;

        btn.style.overflow = 'hidden';
        btn.style.isolation = 'isolate';

        if (!btn.querySelector('.btn-sheen')) {
            const sheen = document.createElement('span');
            sheen.className = 'btn-sheen';
            sheen.style.cssText = `
                position: absolute;
                inset: 0;
                background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.16) 45%, transparent 70%);
                transform: translateX(-120%);
                transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
                pointer-events: none;
                z-index: 1;
                border-radius: inherit;
            `;
            btn.appendChild(sheen);

            btn.addEventListener('mouseenter', () => {
                sheen.style.transform = 'translateX(120%)';
            });
            btn.addEventListener('mouseleave', () => {
                sheen.style.transform = 'translateX(-120%)';
                requestAnimationFrame(() => {
                    sheen.style.transition = 'none';
                    sheen.style.transform = 'translateX(-120%)';
                    requestAnimationFrame(() => {
                        sheen.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
                    });
                });
            });
        }
    }


    // ----------------------------------------------------------------
    // MÓDULO 7: PING MONITOR PILL — Fiber dot en header
    // ----------------------------------------------------------------
    function upgradePingMonitor() {
        const pingMonitor = $('#ping-monitor');
        if (!pingMonitor) return;

        const pingDot = pingMonitor.querySelector('.ping-dot');
        if (pingDot && !pingDot.classList.contains('fiber-enhanced')) {
            pingDot.classList.add('fiber-enhanced');
            pingDot.style.cssText += `
                box-shadow: 0 0 6px rgba(16, 185, 129, 0.7), 0 0 12px rgba(16, 185, 129, 0.4);
                animation: fiberDotPulse 2s ease-in-out infinite;
            `;
        }
    }


    // ----------------------------------------------------------------
    // MÓDULO 8: AVISO LEGAL & HABEAS DATA (Ley 1581 / SENA)
    // ----------------------------------------------------------------
    function initLegalNotices() {
        const legalBtn = $('#btn-legal-notice');
        const termsBtn = $('#btn-terms-notice');
        const modal = $('#modal');
        const modalBody = $('#modal-body');

        const openLegalModal = (title, htmlContent) => {
            if (!modal || !modalBody) {
                if (window.showToast) {
                    window.showToast('Proyecto Académico SENA (Ficha 3147350) - Sin fines comerciales', 'success');
                }
                return;
            }
            modalBody.innerHTML = `
                <div class="legal-modal-content space-y-4 text-left">
                    <div class="flex items-center gap-3 border-b border-white/10 pb-4">
                        <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">⚖️</div>
                        <div>
                            <h2 class="text-xl font-bold text-white">${title}</h2>
                            <p class="text-xs text-slate-400">Proyecto Formativo SENA Santander — Ficha 3147350</p>
                        </div>
                    </div>
                    ${htmlContent}
                </div>
            `;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        if (legalBtn) {
            legalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openLegalModal('Política de Privacidad y Habeas Data (Ley 1581 de 2012)', `
                    <p class="text-sm text-slate-300 leading-relaxed">
                        En cumplimiento de la <strong>Ley Estatutaria 1581 de 2012</strong> y el Decreto 1377 de 2013 de la República de Colombia, se informa que la plataforma <strong>NexGen Telecom</strong> funciona como un entorno de simulación local interactivo.
                    </p>
                    <div class="bg-slate-950/60 p-4 rounded-xl border border-white/10 text-xs space-y-2 text-slate-300">
                        <p>🔹 <strong>No Recolección de Datos:</strong> Todas las utilidades (Calculadora IP, Planificador WiFi, Generador WPA3) se ejecutan de manera 100% cliente en el navegador. No se almacenan, transmiten ni comercializan datos personales o direcciones IP reales en servidores externos.</p>
                        <p>🔹 <strong>Cookies Técnicas:</strong> Unicamente se utiliza el almacenamiento local (localStorage) para guardar la preferencia de tema visual seleccionada por el usuario.</p>
                        <p>🔹 <strong>Tratamiento de Información:</strong> Proyecto desarrollado bajo los principios de legalidad, finalidad y libertad estipulados en el régimen de Habeas Data colombiano.</p>
                    </div>
                `);
            });
        }

        if (termsBtn) {
            termsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openLegalModal('Exención de Responsabilidad y Términos Académicos', `
                    <p class="text-sm text-slate-300 leading-relaxed">
                        NexGen Telecom es un proyecto integral de aprendizaje desarrollado bajo la supervisión del instructor actual <strong>Diego Cordero</strong> y con mención especial al mentor académico <strong>Vladimir Quintana</strong> para la ficha <strong>3147350 del SENA</strong> por el desarrollador <strong>Iván Steven Parra Niño</strong>.
                    </p>
                    <div class="bg-slate-950/60 p-4 rounded-xl border border-white/10 text-xs space-y-2 text-slate-300">
                        <p>🛡️ <strong>Exención Comercial (Ley 1480 de 2011 / SIC / CRC):</strong> NexGen Telecom no representa una empresa proveedora de servicios de internet (ISP) ni presta servicios públicos domiciliarios o comerciales. Los valores de velocidad y latencia presentados corresponden a simulaciones pedagógicas.</p>
                        <p>📚 <strong>Uso de Contenidos:</strong> Los diagramas del modelo OSI, guías de ponchado T568B y conceptos de subnetting se ofrecen con fines exclusivamente didácticos y formativos.</p>
                    </div>
                `);
            });
        }

        const closeBtn = $('#btn-close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.body.style.overflow = '';
            });
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.style.overflow = '';
                }
            });
        }
    }

    // ----------------------------------------------------------------
    // INICIALIZACIÓN
    // ----------------------------------------------------------------
    function init() {
        initSocialButtons();
        initThemeSwitchButton();
        initFiberPulse();
        // NOTA: stat-card spotlight/card-index ahora están unificados en glass-effects.js
        upgradeBackToTop();
        upgradePingMonitor();
        initLegalNotices();

        // Re-init cuando se abra un modal
        document.addEventListener('modalOpened', () => {
            updateShiningBtnState(document.body.dataset.theme || 'dark');
        });

        console.log('[NexGen] Widgets Premium v3.0 — Optimizado ✓');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
