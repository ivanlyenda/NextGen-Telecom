// =========================================================
// SISTEMA TOAST NOTIFICATIONS
// =========================================================
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// =========================================================
// LÓGICA PWA
// =========================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('Fallo PWA', err));
    });
}

let deferredPrompt;
const installBtn = document.getElementById('btn-install');
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'block';
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') { 
                installBtn.style.display = 'none'; 
                showToast('App instalada con éxito', 'success');
            }
            deferredPrompt = null;
        }
    });
}

const offlineBadge = document.getElementById('offline-badge');
window.addEventListener('offline', () => { if (offlineBadge) offlineBadge.style.display = 'block'; showToast('Conexión perdida', 'error'); });
window.addEventListener('online', () => { if (offlineBadge) offlineBadge.style.display = 'none'; showToast('Conexión restaurada', 'success'); });

// =========================================================
// RELOJ GLOBAL AUTOMÁTICO Y MONITOR DE PING
// =========================================================
function updateClockAndDate() {
    try {
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const timeOptions = { timeZone: userTimeZone, hour: '2-digit', minute: '2-digit', hour12: true };
        const dateOptions = { timeZone: userTimeZone, year: 'numeric', month: 'short', day: '2-digit' };
        
        const now = new Date();
        const relojEl = document.getElementById('reloj');
        const fechaEl = document.getElementById('fecha');
        const zonaEl = document.getElementById('zona-horaria');
        
        if (relojEl) relojEl.innerText = now.toLocaleTimeString('es-CO', timeOptions);
        if (fechaEl) fechaEl.innerText = now.toLocaleDateString('es-CO', dateOptions).toUpperCase();
        
        if (zonaEl) {
            const city = userTimeZone.split('/').pop().replace('_', ' ');
            zonaEl.innerText = city;
        }
    } catch (e) {
        const relojEl = document.getElementById('reloj');
        if (relojEl) relojEl.innerText = new Date().toLocaleTimeString();
    }
}
setInterval(updateClockAndDate, 1000);
updateClockAndDate();

// Simulador de fluctuación de Ping y LEDs del Router (con referencias DOM en caché)
let pingEl = null;
let dotEl = null;
let ledWifi = null;
let ledEth = null;

setInterval(() => {
    const basePing = 20;
    const jitter = Math.floor(Math.random() * 15);
    const isSpike = Math.random() > 0.95; 
    
    const currentPing = isSpike ? basePing + 80 + jitter : basePing + jitter;
    if (!pingEl) pingEl = document.getElementById('ping-value');
    if (!dotEl) dotEl = document.querySelector('.ping-dot');
    
    if (pingEl) pingEl.innerText = `${currentPing}ms`;
    
    if (pingEl && dotEl) {
        if (currentPing < 50) {
            pingEl.style.color = 'var(--accent)';
            dotEl.style.background = 'var(--accent)';
            dotEl.style.boxShadow = '0 0 8px var(--accent)';
        } else if (currentPing < 100) {
            pingEl.style.color = '#fbbf24';
            dotEl.style.background = '#fbbf24';
            dotEl.style.boxShadow = '0 0 8px #fbbf24';
        } else {
            pingEl.style.color = '#e11d48';
            dotEl.style.background = '#e11d48';
            dotEl.style.boxShadow = '0 0 8px #e11d48';
        }
    }

    if (!ledWifi) ledWifi = document.getElementById('led-wifi');
    if (!ledEth) ledEth = document.getElementById('led-eth');
    
    if (ledWifi) {
        if (Math.random() > 0.3) {
            ledWifi.style.background = '#3b82f6';
            ledWifi.style.boxShadow = '0 0 8px #3b82f6';
        } else {
            ledWifi.style.background = '#1e293b';
            ledWifi.style.boxShadow = 'none';
        }
    }

    if (ledEth) {
        if (Math.random() > 0.5) {
            ledEth.style.background = '#10b981';
            ledEth.style.boxShadow = '0 0 8px #10b981';
        } else {
            ledEth.style.background = '#1e293b';
            ledEth.style.boxShadow = 'none';
        }
    }
}, 1500);
