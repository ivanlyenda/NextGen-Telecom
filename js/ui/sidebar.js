// =========================================================
// GESTION DEL MENU LATERAL CON AISLAMIENTO DE SCROLL
// =========================================================
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuButton = document.getElementById('btn-toggle-menu');

const setSidebarOpenState = (isOpen) => {
    sidebar.classList.toggle('active', isOpen);
    overlay.classList.toggle('active', isOpen);
    document.body.classList.toggle('sidebar-open', isOpen);
    if (menuButton) menuButton.setAttribute('aria-expanded', String(isOpen));

    if (typeof lenis !== 'undefined') {
        if (isOpen) lenis.stop();
        else lenis.start();
    }
};

const toggleMenu = () => {
    if (!sidebar || !overlay) return;
    const willOpen = !sidebar.classList.contains('active');

    setSidebarOpenState(willOpen);

    if (typeof gsap !== 'undefined') {
        gsap.killTweensOf([overlay, sidebar.querySelectorAll('.nav-item')]);

        if (willOpen) {
            gsap.fromTo(
                sidebar.querySelectorAll('.nav-item'),
                { opacity: 0, x: -24 },
                { opacity: 1, x: 0, duration: 0.36, stagger: 0.035, ease: 'power2.out', delay: 0.12 }
            );
        }
    }
};

window.toggleMenu = toggleMenu;

const containSidebarWheel = (event) => {
    if (!sidebar || !sidebar.classList.contains('active')) return;

    const delta = event.deltaY;
    const atTop = sidebar.scrollTop <= 0;
    const atBottom = Math.ceil(sidebar.scrollTop + sidebar.clientHeight) >= sidebar.scrollHeight;

    if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
        event.preventDefault();
    }

    event.stopPropagation();
};

let sidebarTouchStartY = 0;

const containSidebarTouchStart = (event) => {
    sidebarTouchStartY = event.touches ? event.touches[0].clientY : 0;
};

const containSidebarTouchMove = (event) => {
    if (!sidebar || !sidebar.classList.contains('active') || !event.touches) return;

    const currentY = event.touches[0].clientY;
    const delta = sidebarTouchStartY - currentY;
    const atTop = sidebar.scrollTop <= 0;
    const atBottom = Math.ceil(sidebar.scrollTop + sidebar.clientHeight) >= sidebar.scrollHeight;

    if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
        event.preventDefault();
    }

    event.stopPropagation();
};

document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-toggle-menu')) {
        e.preventDefault();
        toggleMenu();
    } else if (e.target === overlay) {
        toggleMenu();
    }
});

if (sidebar) {
    sidebar.addEventListener('wheel', containSidebarWheel, { passive: false });
    sidebar.addEventListener('touchstart', containSidebarTouchStart, { passive: true });
    sidebar.addEventListener('touchmove', containSidebarTouchMove, { passive: false });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
        toggleMenu();
    }
});
