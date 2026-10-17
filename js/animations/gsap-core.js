// =========================================================
// INICIALIZACIONES SUAVES (LENIS Y GSAP)
// =========================================================
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
window.__lenis = lenis;
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// =========================================================
// PRELOADER ADAPTATIVO Y SECUENCIA DE SALIDA (GSAP)
// =========================================================
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const counterEl = document.getElementById('preloader-counter');
    const progressBar = document.getElementById('preloader-progress-bar');
    if (!preloader) return;

    // Detener scroll mientras el preloader está activo
    if (window.__lenis) {
        window.__lenis.stop();
    }
    document.documentElement.classList.add('overflow-hidden');
    document.body.classList.add('overflow-hidden');

    // Lógica del Conteo: Animar mediante un objeto de JS manipulado por GSAP (counter.value)
    // de 1 a 100 en un rango de 1.8s a 2.2s (2.0s) con easing power2.inOut
    const counter = { value: 1 };
    gsap.to(counter, {
        value: 100,
        duration: 2.0,
        ease: "power2.inOut",
        onUpdate: () => {
            const currentVal = Math.round(counter.value);
            if (counterEl) counterEl.textContent = `${currentVal}%`;
            if (progressBar) progressBar.style.width = `${currentVal}%`;
        },
        onComplete: () => {
            // Reanudar scroll de Lenis y desbloquear body
            document.documentElement.classList.remove('overflow-hidden');
            document.body.classList.remove('overflow-hidden');
            if (window.__lenis) {
                window.__lenis.start();
            }

            // Transición de Salida Orgánica (Exit Sequence):
            // 1. Animar el overlay completo hacia arriba con elevación y desvanecido simultáneo
            gsap.to(preloader, {
                yPercent: -100,
                opacity: 0,
                duration: 1.2,
                ease: "power4.inOut",
                onComplete: () => {
                    // 3. Desactivar el contenedor (display: 'none') al finalizar para no interferir con puntero
                    preloader.style.display = 'none';
                }
            });

            // 2. Revelado escalonado del Hero justo antes de completar la salida del preloader
            gsap.from('.reveal-hero', {
                y: 40,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                stagger: 0.1,
                delay: 0.2
            });
        }
    });
}

// Ejecutar el preloader
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreloader, { once: true });
} else {
    initPreloader();
}

// Secuencia Apple-like: 60 frames procedurales de una red premium en movimiento.
function initImageSequence() {
    const canvasSeq = document.getElementById("sequence-canvas");
    if (!canvasSeq) return;

    const contextSeq = canvasSeq.getContext("2d", { alpha: false });
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const W = isMobile ? 760 : 1080;
    const H = isMobile ? 520 : 640;
    canvasSeq.width = W;
    canvasSeq.height = H;

    const frameCount = 60;
    const sequenceObject = { frame: 0 };
    const focal = isMobile ? 480 : 640;

    const nodes = Array.from({ length: isMobile ? 38 : 54 }, (_, i) => {
        const band = i / (isMobile ? 38 : 54);
        const angle = band * Math.PI * 8.2;
        const radius = 135 + Math.sin(i * 1.73) * 72 + (i % 5) * 16;
        return {
            x: Math.cos(angle) * radius + (Math.random() - 0.5) * 55,
            y: (Math.random() - 0.5) * 230,
            z: Math.sin(angle) * radius + (Math.random() - 0.5) * 90,
            size: 1.2 + (i % 7) * 0.28,
            lane: i % 4
        };
    });

    const links = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dz = nodes[i].z - nodes[j].z;
            const dist = Math.hypot(dx, dy, dz);
            if (dist < 190 && links.length < (isMobile ? 76 : 118)) {
                links.push([i, j, dist]);
            }
        }
    }

    const offscreen = document.createElement('canvas');
    offscreen.width = W;
    offscreen.height = H;
    const offCtx = offscreen.getContext('2d', { alpha: false });

    const project = (node, t) => {
        const camera = t * Math.PI * 2;
        const tilt = Math.sin(t * Math.PI * 2) * 0.18;
        const cos = Math.cos(camera);
        const sin = Math.sin(camera);
        const x = node.x * cos - node.z * sin;
        const z = node.x * sin + node.z * cos + 520;
        const y = node.y * Math.cos(tilt) - (z - 520) * Math.sin(tilt) * 0.35;
        const scale = focal / (focal + z);
        return {
            x: W / 2 + x * scale,
            y: H / 2 + y * scale,
            z,
            scale,
            alpha: Math.max(0.08, Math.min(0.86, 1.05 - z / 920))
        };
    };

    const drawRoundedRect = (ctx, x, y, w, h, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    };

    function drawFrame(frameIndex) {
        const t = frameIndex / (frameCount - 1);
        const pulse = Math.sin(t * Math.PI * 2);

        const bg = offCtx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#020617');
        bg.addColorStop(0.42, '#07111f');
        bg.addColorStop(1, '#050816');
        offCtx.fillStyle = bg;
        offCtx.fillRect(0, 0, W, H);

        const aura = offCtx.createRadialGradient(W * 0.52, H * 0.48, 40, W * 0.52, H * 0.48, W * 0.56);
        aura.addColorStop(0, `rgba(56, 189, 248, ${0.18 + 0.04 * pulse})`);
        aura.addColorStop(0.42, 'rgba(99, 102, 241, 0.09)');
        aura.addColorStop(1, 'rgba(2, 6, 23, 0)');
        offCtx.fillStyle = aura;
        offCtx.fillRect(0, 0, W, H);

        offCtx.save();
        offCtx.translate(W / 2, H / 2);
        offCtx.rotate(-0.08 + t * 0.18);
        offCtx.strokeStyle = 'rgba(148, 163, 184, 0.055)';
        offCtx.lineWidth = 1;
        for (let x = -W; x <= W; x += 46) {
            offCtx.beginPath();
            offCtx.moveTo(x, -H);
            offCtx.lineTo(x + W * 0.38, H);
            offCtx.stroke();
        }
        offCtx.restore();

        const projected = nodes.map(node => project(node, t));

        for (const [a, b, dist] of links) {
            const p1 = projected[a];
            const p2 = projected[b];
            const alpha = Math.min(p1.alpha, p2.alpha) * (1 - dist / 245);
            if (alpha <= 0.035) continue;

            const linkGradient = offCtx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            linkGradient.addColorStop(0, `rgba(14, 165, 233, ${alpha * 0.38})`);
            linkGradient.addColorStop(0.5, `rgba(168, 85, 247, ${alpha * 0.28})`);
            linkGradient.addColorStop(1, `rgba(34, 211, 238, ${alpha * 0.40})`);
            offCtx.strokeStyle = linkGradient;
            offCtx.lineWidth = Math.max(0.45, 1.7 * Math.min(p1.scale, p2.scale));
            offCtx.beginPath();
            offCtx.moveTo(p1.x, p1.y);
            offCtx.lineTo(p2.x, p2.y);
            offCtx.stroke();

            const packet = (t * 1.7 + a * 0.061 + b * 0.037) % 1;
            const px = p1.x + (p2.x - p1.x) * packet;
            const py = p1.y + (p2.y - p1.y) * packet;
            const glow = offCtx.createRadialGradient(px, py, 0, px, py, 15);
            glow.addColorStop(0, `rgba(125, 211, 252, ${alpha * 1.8})`);
            glow.addColorStop(1, 'rgba(125, 211, 252, 0)');
            offCtx.fillStyle = glow;
            offCtx.beginPath();
            offCtx.arc(px, py, 15, 0, Math.PI * 2);
            offCtx.fill();
        }

        projected.forEach((p, i) => {
            const node = nodes[i];
            const r = Math.max(1.1, node.size * p.scale * 3.7);
            const glow = offCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 7);
            glow.addColorStop(0, `rgba(125, 211, 252, ${p.alpha * 0.34})`);
            glow.addColorStop(1, 'rgba(125, 211, 252, 0)');
            offCtx.fillStyle = glow;
            offCtx.beginPath();
            offCtx.arc(p.x, p.y, r * 7, 0, Math.PI * 2);
            offCtx.fill();

            offCtx.fillStyle = node.lane === 0
                ? `rgba(34, 211, 238, ${p.alpha})`
                : node.lane === 1
                    ? `rgba(96, 165, 250, ${p.alpha})`
                    : `rgba(167, 139, 250, ${p.alpha})`;
            offCtx.beginPath();
            offCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
            offCtx.fill();
        });

        const scanX = W * (0.18 + 0.64 * t);
        const scan = offCtx.createLinearGradient(scanX - 90, 0, scanX + 90, 0);
        scan.addColorStop(0, 'rgba(14, 165, 233, 0)');
        scan.addColorStop(0.5, 'rgba(125, 211, 252, 0.18)');
        scan.addColorStop(1, 'rgba(14, 165, 233, 0)');
        offCtx.fillStyle = scan;
        offCtx.fillRect(scanX - 90, 0, 180, H);

        drawRoundedRect(offCtx, 28, 28, W - 56, H - 56, 30);
        offCtx.strokeStyle = 'rgba(226, 232, 240, 0.08)';
        offCtx.lineWidth = 1;
        offCtx.stroke();

        offCtx.font = '700 11px "Space Grotesk", "Plus Jakarta Sans", system-ui, sans-serif';
        offCtx.textAlign = 'left';
        offCtx.fillStyle = 'rgba(226, 232, 240, 0.72)';
        offCtx.fillText('NEXGEN CORE ROUTING MAP', 42, H - 34);
        offCtx.textAlign = 'right';
        offCtx.fillStyle = 'rgba(125, 211, 252, 0.74)';
        offCtx.fillText(`FRAME ${String(frameIndex + 1).padStart(2, '0')} / 60`, W - 42, H - 34);

        contextSeq.drawImage(offscreen, 0, 0);
    }

    let lastRenderedFrame = -1;
    function renderFrame(frameIndex) {
        const idx = Math.max(0, Math.min(frameCount - 1, Math.round(frameIndex)));
        if (idx === lastRenderedFrame) return;
        lastRenderedFrame = idx;
        drawFrame(idx);
    }

    renderFrame(0);

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#sequence-section",
            start: "top top",
            end: "+=1200",
            scrub: 0.95,
            pin: true,
            anticipatePin: 1,
            markers: false,
            invalidateOnRefresh: true
        }
    });

    tl.to(sequenceObject, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        onUpdate: () => renderFrame(sequenceObject.frame)
    }, 0);

    tl.fromTo("#sequence-text-1", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.75, ease: "power2.out",
        onStart: () => {
            document.getElementById("sequence-text-1").innerText = "Mapa de red en tiempo real";
            document.getElementById("sequence-text-2").innerText = "Visualización premium de paquetes, rutas y nodos activos.";
        }
    }, 0.05);
    tl.fromTo("#sequence-text-2", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" }, 0.1);
    tl.to(["#sequence-text-1", "#sequence-text-2"], { opacity: 0, y: -20, duration: 0.55, ease: "power2.in" }, 0.75);

    tl.fromTo("#sequence-text-1", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.75, ease: "power2.out",
        onStart: () => {
            document.getElementById("sequence-text-1").innerText = "Paquetes viajando por fibra";
            document.getElementById("sequence-text-2").innerText = "Cada pulso representa tráfico atravesando enlaces troncales.";
        }
    }, 1.0);
    tl.fromTo("#sequence-text-2", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" }, 1.05);
    tl.to(["#sequence-text-1", "#sequence-text-2"], { opacity: 0, y: -20, duration: 0.55, ease: "power2.in" }, 1.75);

    tl.fromTo("#sequence-text-1", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.75, ease: "power2.out",
        onStart: () => {
            document.getElementById("sequence-text-1").innerText = "Estabilidad, latencia y cobertura";
            document.getElementById("sequence-text-2").innerText = "Una lectura visual del estado lógico de la red.";
        }
    }, 2.0);
    tl.fromTo("#sequence-text-2", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.75, ease: "power2.out" }, 2.05);
    tl.to(["#sequence-text-1", "#sequence-text-2"], { opacity: 0.24, y: -10, duration: 0.85, ease: "power2.in" }, 2.75);
}

// Secuencia Apple-like: Router real con ScrollTrigger (5 imágenes en crossfade y apertura 3D)
// Secuencia Apple Keynote: Router real con ScrollTrigger continuo (Macro-Zoom 1:1 Scrub)
function initRouterScrollShowcase() {
    const section = document.getElementById("router-scroll-section");
    if (!section) return;

    const router = document.getElementById("router-scroll-device");
    const topLid = document.getElementById("rscroll-top-lid") || router?.querySelector(".router-device-top");
    const badgeEl = document.getElementById("rscroll-badge");
    const titleEl = document.getElementById("rscroll-title");
    const descEl = document.getElementById("rscroll-desc");
    const featuresEl = document.getElementById("rscroll-features");
    const phasePills = document.querySelectorAll(".phase-pill");
    const calloutEl = document.getElementById("rscroll-macro-callout");
    const calloutBadge = document.getElementById("callout-badge");
    const calloutLine1 = document.getElementById("callout-line-1");
    const calloutLine2 = document.getElementById("callout-line-2");
    const calloutLine3 = document.getElementById("callout-line-3");

    if (!router || !titleEl || !descEl || !featuresEl) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const baseScale = isMobile ? 0.64 : 0.84;

    const steps = [
        {
            badge: "01 · VISTA GENERAL",
            title: "El Centro de Mando de tu Red",
            desc: "Ingeniería de grado carrier en un formato doméstico premium. Diseñado para ofrecer latencia ultrabaja continua sin reinicios ni pérdidas de paquetes.",
            features: [
                "🚀 Reparte el internet a máxima velocidad sin bajones ni fluctuaciones.",
                "📱 Conecta más de 80 dispositivos simultáneos con Wi-Fi 6 OFDMA.",
                "🛡️ Firewall de inspección profunda integrado en el silicio."
            ],
            part: "body"
        },
        {
            badge: "02 · CHASIS DESACOPLADO",
            title: "Arquitectura Interna Blindada",
            desc: "La cubierta superior de aleación polimérica se eleva para revelar la ingeniería interior: disipador pasivo masivo y blindaje electromagnético completo.",
            features: [
                "❄️ Disipación térmica pasiva sin ventiladores ruidosos.",
                "🔋 Vida útil extendida para operaciones críticas 24/7/365.",
                "🧲 Blindaje contra interferencias electromagnéticas externas."
            ],
            part: "inside"
        },
        {
            badge: "03 · SILICIO NPU BIONIC (MACRO-ZOOM)",
            title: "Procesador Neuronal Dedicado",
            desc: "Cámara macro enfocada en el silicio biónico de 4nm: 16 TOPS de potencia neuronal para priorización de paquetes por hardware sin consumir CPU principal.",
            features: [
                "🧠 16 TOPS de inteligencia de red: cero lag en videojuegos online.",
                "⚡ Enrutamiento de paquetes conmutados en menos de 0.12 microsegundos.",
                "🎬 Transmisión de flujos 8K HDR sin búfer ni retrasos."
            ],
            part: "inside"
        },
        {
            badge: "04 · ANTENAS BEAMFORMING",
            title: "Cobertura Espectral Omnidireccional",
            desc: "Arreglo en abanico aerodinámico Wi-Fi 6 con formación de haz (Beamforming) para concentrar la energía de radiofrecuencia hacia cada equipo receptor.",
            features: [
                "🧱 Traspasa muros de concreto y techos conservando potencia.",
                "🎯 Beamforming inteligente que rastrea tus dispositivos en movimiento.",
                "📶 Módulo RF Murata de 5 GHz con amplificadores de bajo ruido."
            ],
            part: "antennas"
        },
        {
            badge: "05 · INTERFACES DE ALTA VELOCIDAD (MACRO PUERTOS)",
            title: "Puertos Blindados Multi-Gigabit",
            desc: "Panel posterior de grado telecomunicaciones: conector WAN 2.5G de fibra óptica directa y 4 puertos LAN Gigabit con pines chapados en oro.",
            features: [
                "🌐 Puerto WAN 2.5G: recibe fibra simétrica GPON de máxima tasa.",
                "⚡ 4 Puertos LAN Gigabit con 8 pines de oro para cero pérdida física.",
                "🔌 Puerto USB 3.2 Gen 2 para almacenamiento en red de 10 Gbps."
            ],
            part: "ports"
        }
    ];

    let currentStep = -1;

    const setActiveStep = (index) => {
        if (index === currentStep) return;
        currentStep = index;

        phasePills.forEach((p, idx) => {
            p.classList.toggle('active', idx === index);
        });

        const targetElements = [badgeEl, titleEl, descEl, featuresEl].filter(Boolean);

        gsap.to(targetElements, {
            opacity: 0,
            y: -6,
            duration: 0.16,
            onComplete: () => {
                if (badgeEl) badgeEl.innerText = steps[index].badge;
                titleEl.innerText = steps[index].title;
                descEl.innerText = steps[index].desc;
                featuresEl.innerHTML = steps[index].features.map(f => `<li>${f}</li>`).join('');
                router.dataset.part = steps[index].part;

                gsap.to(targetElements, {
                    opacity: 1,
                    y: 0,
                    duration: 0.24,
                    ease: "power2.out"
                });
            }
        });

        // Telemetría flotante para fases macro
        if (calloutEl) {
            if (index === 2) {
                if (calloutBadge) calloutBadge.innerHTML = '🔬 MACRO-INSPECCIÓN DE SILICIO NPU';
                if (calloutLine1) calloutLine1.innerHTML = '<b>Arquitectura:</b> TSMC 4nm FinFET Extreme UV (EUV)';
                if (calloutLine2) calloutLine2.innerHTML = '<b>Acelerador IA:</b> 16 TOPS Neural Engine Dedicado';
                if (calloutLine3) calloutLine3.innerHTML = '<b>Throughput de Bus:</b> 51.2 GB/s LPDDR5 6400 MT/s';
                calloutEl.classList.add('active');
            } else if (index === 4) {
                if (calloutBadge) calloutBadge.innerHTML = '⚡ TELEMETRÍA DE INTERFACES FÍSICAS';
                if (calloutLine1) calloutLine1.innerHTML = '<b>Puerto WAN:</b> 2.5G Multi-Gigabit GPON SFP+';
                if (calloutLine2) calloutLine2.innerHTML = '<b>Pines RJ45:</b> Contactos chapados en Oro de 50µ"';
                if (calloutLine3) calloutLine3.innerHTML = '<b>Conmutación L2:</b> 12 Gbps Fabric Non-Blocking';
                calloutEl.classList.add('active');
            } else {
                calloutEl.classList.remove('active');
            }
        }
    };

    // Poses iniciales en 3D — cerrado y centrado
    gsap.set(router, { 
        rotateX: 12, 
        rotateY: -28, 
        rotateZ: 0, 
        scale: baseScale * 1.0,
        x: 0,
        y: 0
    });
    if (topLid) gsap.set(topLid, { z: 26, opacity: 1 });
    setActiveStep(0);

    // Timeline continuo 1:1 scrub estilo Apple AirPods Max
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#router-scroll-section",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.9,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                const p = self.progress;
                let stepIdx = 0;
                if (p < 0.18) stepIdx = 0;
                else if (p < 0.40) stepIdx = 1;
                else if (p < 0.66) stepIdx = 2;
                else if (p < 0.83) stepIdx = 3;
                else stepIdx = 4;

                setActiveStep(stepIdx);
            }
        }
    });

    // Segmento 0 -> 1: Buffer de inicio cerrado (0 a 0.05), luego elevación de chasis (0.05 a 0.25)
    tl.to(router, {
        scale: baseScale * 1.18,
        rotateX: 34,
        rotateY: -18,
        x: isMobile ? 0 : -18,
        y: isMobile ? 8 : 20,
        ease: "power1.inOut",
        duration: 0.20
    }, 0.05);
    if (topLid) {
        tl.to(topLid, {
            z: 115,
            opacity: 0.38,
            ease: "power1.inOut",
            duration: 0.20
        }, 0.05);
    }

    // Segmento 1 -> 2: Macro-Zoom enfocado en el Procesador NPU Bionic (progreso 0.25 a 0.50)
    tl.to(router, {
        scale: baseScale * (isMobile ? 1.35 : 1.68),
        rotateX: 48,
        rotateY: -4,
        x: isMobile ? 0 : -45,
        y: isMobile ? 10 : 38,
        ease: "power2.inOut",
        duration: 0.25
    }, 0.25);
    if (topLid) {
        tl.to(topLid, {
            z: 150,
            opacity: 0.05,
            ease: "power1.inOut",
            duration: 0.25
        }, 0.25);
    }

    // Segmento 2 -> 3: Transición suave a vista de antenas y disipación (progreso 0.50 a 0.72)
    tl.to(router, {
        scale: baseScale * 1.12,
        rotateX: 18,
        rotateY: -58,
        x: isMobile ? 0 : 32,
        y: -6,
        ease: "power2.inOut",
        duration: 0.22
    }, 0.50);
    if (topLid) {
        tl.to(topLid, {
            z: 28,
            opacity: 0.95,
            ease: "power2.inOut",
            duration: 0.22
        }, 0.50);
    }

    // Segmento 3 -> 4: Giro 180° y Macro-Zoom a Puertos Blindados 2.5G & LAN (progreso 0.72 a 1.00)
    tl.to(router, {
        scale: baseScale * (isMobile ? 1.20 : 1.38),
        rotateX: 5,
        rotateY: 178,
        x: 0,
        y: isMobile ? 6 : 16,
        ease: "power2.inOut",
        duration: 0.28
    }, 0.72);
    if (topLid) {
        tl.to(topLid, {
            z: 26,
            opacity: 1.0,
            ease: "power2.inOut",
            duration: 0.28
        }, 0.72);
    }

    // Navegación por clic en las píldoras de fase Apple
    phasePills.forEach((pill) => {
        pill.addEventListener('click', () => {
            const step = parseInt(pill.getAttribute('data-step') || '0', 10);
            const scrollMap = [0.05, 0.28, 0.52, 0.74, 0.94];
            const targetP = scrollMap[step] !== undefined ? scrollMap[step] : 0;
            const scrollDist = section.offsetTop + targetP * (section.offsetHeight - window.innerHeight);

            if (window.__lenis) {
                window.__lenis.scrollTo(scrollDist, { duration: 1.2 });
            } else {
                window.scrollTo({ top: scrollDist, behavior: 'smooth' });
            }
        });
    });
}

// Animación ScrollTrigger para Estadísticas y Panel de Hardware 360°
function initHardwareStatsScroll() {
    const statsSection = document.getElementById("stats-section");
    if (statsSection) {
        const statBoxes = statsSection.querySelectorAll(".stat-box");
        gsap.from(statBoxes, {
            scrollTrigger: {
                trigger: statsSection,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 30,
            duration: 0.75,
            stagger: 0.12,
            ease: "power3.out"
        });
    }

    const hardwareSection = document.querySelector(".router-showcase-container");
    if (hardwareSection) {
        gsap.from(hardwareSection, {
            scrollTrigger: {
                trigger: hardwareSection,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 35,
            duration: 0.85,
            ease: "power3.out"
        });
    }

    // 3. Barra de progreso de scroll superior
    const progressBar = document.getElementById("scroll-progress-bar");
    if (progressBar) {
        gsap.to(progressBar, {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.2
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const startSequence = () => {
        initImageSequence();
        initRouterScrollShowcase();
        initHardwareStatsScroll();
    };
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(startSequence, { timeout: 1200 });
    } else {
        window.setTimeout(startSequence, 250);
    }
});
