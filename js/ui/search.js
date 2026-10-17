// =========================================================
// SISTEMA DE BÚSQUEDA PREDICTIVA MODAL (APPLE-LIKE)
// =========================================================
const searchModal = document.getElementById('search-modal');
const searchModalInput = document.getElementById('search-modal-input');
const closeSearchModal = document.getElementById('close-search-modal');
const searchSuggestions = document.getElementById('search-suggestions');
const dynamicResults = document.getElementById('dynamic-results');

const openSearchModal = () => {
    if (!searchModal) return;
    searchModal.classList.remove('hidden');
    gsap.killTweensOf(searchModal);
    gsap.to(searchModal, { opacity: 1, duration: 0.4, ease: "power2.out" });
    if (typeof lenis !== 'undefined') lenis.stop();
    if (searchModalInput) {
        searchModalInput.value = '';
        setTimeout(() => searchModalInput.focus(), 100);
    }
    if (dynamicResults) dynamicResults.classList.add('hidden');
    if (searchSuggestions) searchSuggestions.classList.remove('hidden');
};

const closeSearchModalFunc = () => {
    if (!searchModal) return;
    gsap.killTweensOf(searchModal);
    gsap.to(searchModal, { 
        opacity: 0, 
        duration: 0.3, 
        ease: "power2.in", 
        onComplete: () => {
            searchModal.classList.add('hidden');
            const mainModal = document.getElementById('modal');
            const sideMenu = document.getElementById('sidebar');
            if (typeof lenis !== 'undefined' && (!mainModal || !mainModal.classList.contains('active')) && (!sideMenu || !sideMenu.classList.contains('active'))) {
                lenis.start();
            }
        }
    });
};

const buscadorInput = document.getElementById('buscador');
if (buscadorInput) {
    buscadorInput.addEventListener('focus', openSearchModal);
}
const dockSearchBtn = document.getElementById('dock-search-btn');
if (dockSearchBtn) {
    dockSearchBtn.addEventListener('click', openSearchModal);
}
const sidebarSearchBtn = document.getElementById('sidebar-search-btn');
if (sidebarSearchBtn) {
    sidebarSearchBtn.addEventListener('click', () => {
        const sideMenu = document.getElementById('sidebar');
        if (sideMenu && sideMenu.classList.contains('active') && typeof toggleMenu === 'function') {
            toggleMenu();
        }
        openSearchModal();
    });
}
if (closeSearchModal) {
    closeSearchModal.addEventListener('click', closeSearchModalFunc);
}

// Atajo global Ctrl+K / Cmd+K
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        openSearchModal();
    }
});

if (searchModalInput) {
    searchModalInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query === '') {
            dynamicResults.classList.add('hidden');
            searchSuggestions.classList.remove('hidden');
            return;
        }
        
        searchSuggestions.classList.add('hidden');
        dynamicResults.classList.remove('hidden');
        dynamicResults.innerHTML = '';
        
        let matchesCount = 0;
        
        for (const [key, content] of Object.entries(manuales)) {
            const plainText = content.replace(/<[^>]*>/g, '').toLowerCase();
            if (key.includes(query) || plainText.includes(query)) {
                matchesCount++;
                const titleMatch = content.match(/<h2>(.*?)<\/h2>/);
                const title = titleMatch ? titleMatch[1] : key;
                
                const resultItem = document.createElement('button');
                resultItem.className = 'w-full text-left p-4 bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/10 rounded-2xl transition-all duration-300 flex flex-col gap-1 cursor-pointer';
                resultItem.innerHTML = `
                    <span class="text-sm font-bold text-white">${title}</span>
                    <span class="text-xs text-slate-400 truncate">${plainText.substring(0, 100)}...</span>
                `;
                
                resultItem.addEventListener('click', () => {
                    closeSearchModalFunc();
                    abrirManual(key);
                });
                
                dynamicResults.appendChild(resultItem);
            }
        }
        
        if (matchesCount === 0) {
            dynamicResults.innerHTML = `
                <div class="text-center py-8 text-slate-500">
                    <p class="text-sm font-medium">No se encontraron manuales para "${query}"</p>
                    <a href="https://www.google.com/search?q=solucionar+problema+internet+${encodeURIComponent(query)}" target="_blank" class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all inline-block">Buscar en Google</a>
                </div>
            `;
        }
    });
}

document.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        closeSearchModalFunc();
        abrirManual(target);
    });
});

document.querySelectorAll('.dock-item[data-target]').forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        if (target === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            abrirManual(target);
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Cerrar búsqueda si está abierta
        closeSearchModalFunc();
        // Cerrar modal de manuales si está abierto (usa getElementById para evitar colisión con globals)
        const mainModal = document.getElementById('modal');
        if (mainModal && mainModal.classList.contains('active')) {
            if (typeof cerrarModal === 'function') {
                cerrarModal();
            } else {
                mainModal.classList.remove('active');
                if (window.trafficInterval) clearInterval(window.trafficInterval);
            }
        }
        // NOTA: El sidebar ya tiene su propio Escape handler en sidebar.js (L80-84)
        // No duplicar aquí para evitar doble toggleMenu (parpadeo)
    }
    if (e.key === '/' && document.activeElement !== searchModalInput && document.activeElement !== buscadorInput) {
        e.preventDefault();
        openSearchModal();
    }
});
