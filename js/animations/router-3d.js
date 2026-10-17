/* Router 3D: interacción aislada, con rotación segura y modo de inspección estable. */
(() => {
    const scene = document.getElementById('router-scene');
    const model = document.getElementById('router-model');
    const calloutSvg = document.getElementById('callout-svg');
    const calloutLine = document.getElementById('callout-line');
    const calloutCard = document.getElementById('callout-card');
    const calloutTitle = document.getElementById('cc-title');
    const calloutDescription = document.getElementById('cc-desc');
    const autoButton = document.getElementById('btn-autorotate');
    const inspectionButton = document.getElementById('btn-explode');

    if (!scene || !model) return;

    let rotationX = -18;
    let rotationY = 28;
    let pointerId = null;
    let lastPoint = null;
    let autoRotate = false;
    let animationFrame = null;
    let isInViewport = true;

    const updateRotation = () => {
        model.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    };

    const hideCallout = () => {
        calloutCard?.classList.remove('active');
        calloutSvg?.classList.remove('active');
        model.querySelectorAll('.hotspot').forEach((node) => node.classList.remove('active-node'));
    };

    const stopAutoRotate = () => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = null;
    };

    const rotateFrame = () => {
        if (!autoRotate || !isInViewport) return;
        rotationY = (rotationY + .22) % 360;
        updateRotation();
        animationFrame = requestAnimationFrame(rotateFrame);
    };

    const setAutoRotate = (enabled) => {
        autoRotate = enabled;
        autoButton?.classList.toggle('active', enabled);
        autoButton?.setAttribute('aria-pressed', String(enabled));
        stopAutoRotate();
        if (enabled) rotateFrame();
    };

    const drawCallout = (hotspot) => {
        const container = scene.closest('.router-container');
        if (!container || !calloutCard || !calloutLine) return;

        const containerRect = container.getBoundingClientRect();
        const hotspotRect = hotspot.getBoundingClientRect();
        const cardRect = calloutCard.getBoundingClientRect();
        const startX = hotspotRect.left - containerRect.left + hotspotRect.width / 2;
        const startY = hotspotRect.top - containerRect.top + hotspotRect.height / 2;
        const isCompact = window.matchMedia('(max-width: 900px)').matches;
        const endX = isCompact
            ? cardRect.left - containerRect.left + cardRect.width / 2
            : cardRect.left - containerRect.left;
        const endY = isCompact
            ? cardRect.top - containerRect.top
            : cardRect.top - containerRect.top + cardRect.height / 2;
        const midX = isCompact ? startX : startX + (endX - startX) * .52;
        const midY = isCompact ? startY + (endY - startY) * .52 : startY;

        calloutLine.setAttribute('points', `${startX},${startY} ${midX},${midY} ${endX},${endY}`);
        calloutLine.style.animation = 'none';
        void calloutLine.getBoundingClientRect();
        calloutLine.style.animation = 'drawLaser .45s cubic-bezier(.16, 1, .3, 1) forwards';
    };

    scene.addEventListener('pointerdown', (event) => {
        if (event.target.closest('.hotspot')) return;
        pointerId = event.pointerId;
        lastPoint = { x: event.clientX, y: event.clientY };
        scene.setPointerCapture(pointerId);
        scene.classList.add('is-dragging');
        hideCallout();
        stopAutoRotate();
    });

    scene.addEventListener('pointermove', (event) => {
        if (event.pointerId !== pointerId || !lastPoint) return;
        rotationY += (event.clientX - lastPoint.x) * .45;
        rotationX = Math.max(-42, Math.min(18, rotationX - (event.clientY - lastPoint.y) * .35));
        lastPoint = { x: event.clientX, y: event.clientY };
        updateRotation();
    });

    const endDrag = (event) => {
        if (event.pointerId !== pointerId) return;
        if (scene.hasPointerCapture(pointerId)) scene.releasePointerCapture(pointerId);
        pointerId = null;
        lastPoint = null;
        scene.classList.remove('is-dragging');
        if (autoRotate) rotateFrame();
    };
    scene.addEventListener('pointerup', endDrag);
    scene.addEventListener('pointercancel', endDrag);

    model.querySelectorAll('.hotspot').forEach((hotspot) => {
        hotspot.setAttribute('role', 'button');
        hotspot.setAttribute('tabindex', '0');
        hotspot.setAttribute('aria-label', hotspot.dataset.title || 'Ver detalle del componente');

        const showCallout = () => {
            if (model.classList.contains('exploded')) return;
            model.querySelectorAll('.hotspot').forEach((node) => node.classList.remove('active-node'));
            hotspot.classList.add('active-node');
            if (calloutTitle) calloutTitle.textContent = hotspot.dataset.title || 'Componente del router';
            if (calloutDescription) calloutDescription.textContent = hotspot.dataset.desc || '';
            calloutCard?.classList.add('active');
            calloutSvg?.classList.add('active');
            drawCallout(hotspot);
        };

        hotspot.addEventListener('click', (event) => {
            event.stopPropagation();
            showCallout();
        });
        hotspot.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                showCallout();
            }
        });
    });

    autoButton?.addEventListener('click', () => {
        setAutoRotate(!autoRotate);
        if (typeof showToast === 'function') {
            showToast(autoRotate ? 'Auto-rotación activada' : 'Auto-rotación pausada', 'success');
        }
    });

    inspectionButton?.addEventListener('click', () => {
        const inspecting = model.classList.toggle('exploded');
        inspectionButton.classList.toggle('active', inspecting);
        inspectionButton.setAttribute('aria-pressed', String(inspecting));
        hideCallout();
        if (typeof showToast === 'function') {
            showToast(inspecting ? 'Modo de inspección activado' : 'Vista exterior restaurada', 'success');
        }
    });

    new IntersectionObserver(([entry]) => {
        isInViewport = entry.isIntersecting;
        if (isInViewport && autoRotate && !animationFrame) rotateFrame();
        else if (!isInViewport) stopAutoRotate();
    }, { threshold: 0.05 }).observe(scene);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const activeHotspot = model.querySelector('.hotspot.active-node');
            if (activeHotspot) drawCallout(activeHotspot);
        }, 120);
    }, { passive: true });

    updateRotation();
})();
