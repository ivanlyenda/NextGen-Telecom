// =========================================================
// GESTION DE MODALES Y HERRAMIENTAS
// =========================================================
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
let chartInstance = null;

const abrirManual = (key) => {
    if (key === 'home') { window.scrollTo({top: 0, behavior: 'smooth'}); return; }
    if (modalBody && typeof manuales !== 'undefined') {
        modalBody.innerHTML = manuales[key] || "<h2>Contenido en construcción</h2>";
    }
    if (modal) modal.classList.add('active');
    if (typeof lenis !== 'undefined') lenis.stop();
    
    if(key === 'monitor-trafico') {
        setTimeout(initTrafficChart, 100);
    }
    const sideMenu = document.getElementById('sidebar');
    if(sideMenu && sideMenu.classList.contains('active') && typeof toggleMenu === 'function') { toggleMenu(); }
};

const cerrarModal = () => {
    if (!modal) return;
    modal.classList.remove('active');
    if(window.trafficInterval) clearInterval(window.trafficInterval);
    const sideMenu = document.getElementById('sidebar');
    if (typeof lenis !== 'undefined' && (!sideMenu || !sideMenu.classList.contains('active'))) {
        lenis.start();
    }
};

document.getElementById('btn-close-modal')?.addEventListener('click', cerrarModal);

modal?.addEventListener('click', (e) => { 
    if (e.target === modal) {
        cerrarModal();
    }
});

// Clics delegados en el modal
modalBody?.addEventListener('click', function(e) {
    const summary = e.target.closest('.custom-summary');
    if (summary) {
        const details = summary.parentElement;
        const content = details.querySelector('.custom-content');
        const isOpen = details.classList.contains('open');
        document.querySelectorAll('.custom-details').forEach(det => { 
            det.classList.remove('open'); 
            const detCont = det.querySelector('.custom-content');
            if (detCont) detCont.style.maxHeight = '0'; 
        });
        if (!isOpen) { 
            details.classList.add('open'); 
            content.style.maxHeight = content.scrollHeight + "px"; 
        }
    }

    if (e.target.classList.contains('copy-btn')) {
        const codeBlock = e.target.parentElement.querySelector('code');
        navigator.clipboard.writeText(codeBlock.innerText).then(() => {
            showToast('Comando copiado al portapapeles', 'success');
            const originalText = e.target.innerText; 
            e.target.innerText = 'Copiado'; 
            e.target.style.background = '#10b981'; 
            e.target.style.color = 'white';
            setTimeout(() => { 
                e.target.innerText = originalText; 
                e.target.style.background = ''; 
                e.target.style.color = ''; 
            }, 2000);
        });
    }

    if(e.target.id === 'btn-gen-pass') {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~|}{[]:;?><,./-=";
        let pass = "";
        // FIX: Usar crypto.getRandomValues() en vez de Math.random() para seguridad criptográfica real
        const randomBytes = new Uint32Array(20);
        crypto.getRandomValues(randomBytes);
        for (let i = 0; i < 20; i++) { pass += chars.charAt(randomBytes[i] % chars.length); }
        const resBox = document.getElementById('pass-result');
        resBox.innerText = pass;
        resBox.classList.add('active');
        // FIX: Clipboard API con manejo de errores
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(pass).then(() => {
                showToast('Clave WPA3 generada y copiada', 'success');
            }).catch(() => {
                showToast('Clave generada (copia manual necesaria)', 'info');
            });
        } else {
            showToast('Clave WPA3 generada (copia manual)', 'success');
        }
    }

    if(e.target.id === 'btn-calc-ip') {
        const ip = (document.getElementById('ip-input')?.value || '').trim();
        const mask = document.getElementById('mask-input')?.value || '24';
        const resBox = document.getElementById('ip-result');
        if (!resBox) return;

        const ipParts = ip.split('.');
        if (ipParts.length !== 4 || ipParts.some(p => p === '' || isNaN(p) || Number(p) < 0 || Number(p) > 255)) {
            showToast('Formato de IP inválido (use X.X.X.X)', 'error');
            return;
        }

        const cidr = Number(mask);
        const octets = ipParts.map(Number);

        // Matemáticas binarias exactas de direccionamiento IPv4 (RFC 791 / RFC 4632)
        const ipInt = (((octets[0] << 24) >>> 0) + ((octets[1] << 16) >>> 0) + ((octets[2] << 8) >>> 0) + (octets[3] >>> 0)) >>> 0;
        const maskInt = cidr === 0 ? 0 : ((-1 << (32 - cidr)) >>> 0);
        const netInt = (ipInt & maskInt) >>> 0;
        const bcastInt = (ipInt | (~maskInt >>> 0)) >>> 0;

        const toOctets = (val) => [
            (val >>> 24) & 255,
            (val >>> 16) & 255,
            (val >>> 8) & 255,
            val & 255
        ].join('.');

        const netIP = toOctets(netInt);
        const bcastIP = toOctets(bcastInt);
        const maskIP = toOctets(maskInt);

        const totalAddresses = Math.pow(2, 32 - cidr);
        const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : Math.max(0, totalAddresses - 2);
        const firstHost = cidr >= 31 ? netIP : toOctets(netInt + 1);
        const lastHost = cidr >= 31 ? bcastIP : toOctets(bcastInt - 1);

        // Clasificación de clase y tipo de red
        const firstOctet = octets[0];
        let ipClass = 'A';
        if (firstOctet >= 128 && firstOctet <= 191) ipClass = 'B';
        else if (firstOctet >= 192 && firstOctet <= 223) ipClass = 'C';
        else if (firstOctet >= 224 && firstOctet <= 239) ipClass = 'D (Multicast)';
        else if (firstOctet >= 240) ipClass = 'E (Experimental)';

        const isPrivate = (octets[0] === 10) ||
            (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
            (octets[0] === 192 && octets[1] === 168);
        const ipType = isPrivate ? 'Privada (RFC 1918)' : 'Pública (Enrutable)';

        resBox.innerHTML = `
            <div style="display: grid; gap: 6px; font-size: 0.82rem; line-height: 1.5; text-align: left;">
                <div><b>Dirección IP:</b> <span style="font-family: var(--font-mono); color: var(--secondary); font-weight: bold;">${ip} /${cidr}</span> <span style="font-size: 0.75rem; opacity: 0.85;">(Clase ${ipClass} &bull; ${ipType})</span></div>
                <div><b>Máscara de Subred:</b> <span style="font-family: var(--font-mono);">${maskIP}</span></div>
                <div><b>Dirección de Red:</b> <span style="font-family: var(--font-mono); color: #10b981; font-weight: bold;">${netIP}</span></div>
                <div><b>Dirección Broadcast:</b> <span style="font-family: var(--font-mono); color: #f59e0b; font-weight: bold;">${bcastIP}</span></div>
                <div><b>Rango Hosts Útiles:</b> <span style="font-family: var(--font-mono);">${firstHost} &rarr; ${lastHost}</span></div>
                <div><b>Hosts Disponibles:</b> <span style="font-family: var(--font-mono); font-weight: bold; color: var(--tertiary);">${usableHosts.toLocaleString()}</span> <span style="font-size: 0.75rem; opacity: 0.85;">(de ${totalAddresses.toLocaleString()} direcciones)</span></div>
            </div>
            <hr style="margin: 10px 0; border: 0; border-top: 1px solid var(--border);">
            <i style="font-size: 0.75rem; color: var(--text-secondary);">Cálculo binario exacto según RFC 791 y especificación CIDR.</i>
        `;
        resBox.classList.add('active');
        showToast('Subred calculada matemáticamente', 'success');
    }
    if(e.target.id === 'btn-wifi-plan') {
        const area = document.getElementById('wifi-area').value;
        const walls = Number(document.getElementById('wifi-walls').value || 0);
        const devices = Number(document.getElementById('wifi-devices').value || 1);
        const interference = document.getElementById('wifi-interference').value;
        const resBox = document.getElementById('wifi-result');

        const densityScore = devices + walls * 4 + (interference === 'high' ? 18 : interference === 'medium' ? 8 : 0) + (area === 'large' ? 12 : area === 'medium' ? 5 : 0);
        const band = walls >= 4 || area === 'large' ? '2.4 GHz para cobertura + 5 GHz cerca del router' : devices > 20 ? '5 GHz como banda principal' : '5 GHz para rendimiento y 2.4 GHz como respaldo';
        const channel = interference === 'high'
            ? '2.4 GHz: canal 1, 6 u 11 menos saturado. 5 GHz: canal DFS si el router lo soporta.'
            : '2.4 GHz: canal 1/6/11. 5 GHz: canal 36, 40, 44 o 48 para compatibilidad.';
        const placement = walls >= 3
            ? 'Ubica el router en zona central, alto y fuera de muebles. Considera mesh o AP cableado.'
            : 'Ubica el router elevado, visible y separado de microondas, metal y paredes gruesas.';
        const health = densityScore > 45 ? 'Alta exigencia' : densityScore > 25 ? 'Exigencia media' : 'Entorno liviano';

        resBox.innerHTML = `
            <div style="display: grid; gap: 8px; font-size: 0.82rem; line-height: 1.5; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 6px;">
                    <b>Diagnóstico de Entorno:</b>
                    <span class="net-badge ${densityScore > 45 ? 'status-err' : densityScore > 25 ? 'status-warn' : 'status-ok'}" style="font-weight: 600;">${health} (Score: ${densityScore})</span>
                </div>
                <div><b>Banda sugerida:</b> <span style="color: var(--secondary); font-weight: 600;">${band}</span></div>
                <div><b>Canalización óptima:</b> <span style="font-family: var(--font-mono);">${channel}</span></div>
                <div><b>Ubicación física recomendada:</b> <span style="color: var(--text-primary);">${placement}</span></div>
            </div>
            <hr style="margin: 10px 0; border: 0; border-top: 1px solid var(--border);">
            <i style="font-size: 0.75rem; color: var(--text-secondary);">Planificación predictiva basada en densidad de dispositivos, atenuación estructural (paredes) y saturación RF.</i>
        `;
        resBox.classList.add('active');
        showToast('Plan Wi-Fi generado', 'success');
    }

    if(e.target.id === 'btn-mtu-calc') {
        const mtu = Number(document.getElementById('mtu-link').value);
        const resBox = document.getElementById('mtu-result');
        const mssIpv4 = mtu - 40;
        const mssIpv6 = mtu - 60;
        const profile = mtu >= 1500 ? 'Enlace estándar' : mtu >= 1460 ? 'Túnel ligero' : 'Túnel/VPN conservador';

        resBox.innerHTML = `
            <div style="display: grid; gap: 8px; font-size: 0.82rem; line-height: 1.5; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 6px;">
                    <b>Perfil de Enlace:</b>
                    <span class="net-badge tcp" style="font-weight: 600;">${profile}</span>
                </div>
                <div><b>MTU Configurada:</b> <span style="font-family: var(--font-mono); color: var(--secondary); font-weight: bold;">${mtu} bytes</span></div>
                <div><b>MSS Recomendado IPv4:</b> <span style="font-family: var(--font-mono); color: #10b981; font-weight: bold;">${mssIpv4} bytes</span> <span style="font-size: 0.75rem; opacity: 0.85;">(MTU - 40 bytes [20 IP + 20 TCP])</span></div>
                <div><b>MSS Recomendado IPv6:</b> <span style="font-family: var(--font-mono); color: #3b82f6; font-weight: bold;">${mssIpv6} bytes</span> <span style="font-size: 0.75rem; opacity: 0.85;">(MTU - 60 bytes [40 IPv6 + 20 TCP])</span></div>
            </div>
            <hr style="margin: 10px 0; border: 0; border-top: 1px solid var(--border);">
            <i style="font-size: 0.75rem; color: var(--text-secondary);">Cálculo según RFC 879 y RFC 2460 para evitar fragmentación IP y latencia de reensamblado en routers intermedios.</i>
        `;
        resBox.classList.add('active');
        showToast('MTU/MSS calculado', 'success');
    }

    const wiringTab = e.target.closest('.wiring-tab-btn');
    if (wiringTab) {
        const norma = wiringTab.getAttribute('data-norma');
        document.querySelectorAll('.wiring-tab-btn').forEach(btn => btn.classList.remove('active'));
        wiringTab.classList.add('active');

        const grid = document.getElementById('rj45-pinout-grid');
        const desc = document.getElementById('wiring-norma-desc');

        const t568bData = [
            { pin: 1, cls: 'wire-w-org', name: 'Blanco / Naranja', role: 'TX+ (Transmisión)' },
            { pin: 2, cls: 'wire-org', name: 'Naranja', role: 'TX- (Transmisión)' },
            { pin: 3, cls: 'wire-w-grn', name: 'Blanco / Verde', role: 'RX+ (Recepción)' },
            { pin: 4, cls: 'wire-blu', name: 'Azul', role: 'Datos Gigabit / PoE' },
            { pin: 5, cls: 'wire-w-blu', name: 'Blanco / Azul', role: 'Datos Gigabit / PoE' },
            { pin: 6, cls: 'wire-grn', name: 'Verde', role: 'RX- (Recepción)' },
            { pin: 7, cls: 'wire-w-brn', name: 'Blanco / Marrón', role: 'Datos Gigabit / PoE' },
            { pin: 8, cls: 'wire-brn', name: 'Marrón', role: 'Datos Gigabit / PoE' }
        ];

        const t568aData = [
            { pin: 1, cls: 'wire-w-grn', name: 'Blanco / Verde', role: 'RX+ (Recepción)' },
            { pin: 2, cls: 'wire-grn', name: 'Verde', role: 'RX- (Recepción)' },
            { pin: 3, cls: 'wire-w-org', name: 'Blanco / Naranja', role: 'TX+ (Transmisión)' },
            { pin: 4, cls: 'wire-blu', name: 'Azul', role: 'Datos Gigabit / Tel. Línea 1' },
            { pin: 5, cls: 'wire-w-blu', name: 'Blanco / Azul', role: 'Datos Gigabit / Tel. Línea 1' },
            { pin: 6, cls: 'wire-org', name: 'Naranja', role: 'TX- (Transmisión)' },
            { pin: 7, cls: 'wire-w-brn', name: 'Blanco / Marrón', role: 'Datos Gigabit / PoE' },
            { pin: 8, cls: 'wire-brn', name: 'Marrón', role: 'Datos Gigabit / PoE' }
        ];

        const activeData = norma === 't568a' ? t568aData : t568bData;

        if (grid) {
            grid.innerHTML = activeData.map(d => `
                <div class="pin-card" data-pin="${d.pin}">
                    <div class="pin-num">Pin ${d.pin}</div>
                    <div class="wire-visual ${d.cls}"></div>
                    <div class="wire-name">${d.name}</div>
                    <div class="wire-role">${d.role}</div>
                </div>
            `).join('');
        }

        if (desc) {
            desc.innerHTML = norma === 't568a'
                ? '<strong>Norma T568A:</strong> Estándar original ANSI/TIA/EIA y de uso obligatorio en instalaciones del Gobierno Federal de EE.UU. y cableado residencial con compatibilidad telefónica analógica.'
                : '<strong>Norma T568B:</strong> Es el estándar predominante en más del 90% de las redes corporativas y comerciales de América y Europa. Ideal para nuevos despliegues y patch cords.';
        }

        showToast(norma === 't568a' ? 'Mostrando Norma T568A' : 'Mostrando Norma T568B', 'info');
    }

    // --- INTERACTIVIDAD 1: CONSOLA CMD EN VIVO ---
    if (e.target.id === 'btn-cmd-clear') {
        const screen = document.getElementById('cmd-screen');
        if (screen) {
            screen.innerHTML = `
                <div class="cmd-line cmd-welcome">Microsoft Windows [Versión 10.0.22631.3007]</div>
                <div class="cmd-line cmd-welcome">(c) NexGen Telecom Diagnostic Suite. Consola reiniciada.</div>
                <div class="cmd-line">&nbsp;</div>
                <div class="cmd-line"><span class="cmd-prompt">C:\\Users\\Admin&gt;</span> _</div>
            `;
        }
    }

    if (e.target.id === 'btn-cmd-ping') {
        const screen = document.getElementById('cmd-screen');
        if (screen) {
            screen.innerHTML += `
                <div class="cmd-line">&nbsp;</div>
                <div class="cmd-line"><span class="cmd-prompt">C:\\Users\\Admin&gt;</span> ping 8.8.8.8 -t</div>
                <div class="cmd-line">Haciendo ping a 8.8.8.8 con 32 bytes de datos:</div>
                <div class="cmd-line text-emerald-400">Respuesta desde 8.8.8.8: bytes=32 tiempo=12ms TTL=117</div>
                <div class="cmd-line text-emerald-400">Respuesta desde 8.8.8.8: bytes=32 tiempo=11ms TTL=117</div>
                <div class="cmd-line text-emerald-400">Respuesta desde 8.8.8.8: bytes=32 tiempo=13ms TTL=117</div>
                <div class="cmd-line text-emerald-400">Respuesta desde 8.8.8.8: bytes=32 tiempo=12ms TTL=117</div>
                <div class="cmd-line text-cyan-300">Estadísticas de ping para 8.8.8.8:</div>
                <div class="cmd-line">&nbsp;&nbsp;&nbsp;&nbsp;Paquetes: enviados = 4, recibidos = 4, perdidos = 0 (0% perdidos).</div>
                <div class="cmd-line text-slate-400">Tiempos aproximados de ida y vuelta en milisegundos: Mínimo = 11ms, Máximo = 13ms, Media = 12ms</div>
                <div class="cmd-line"><span class="cmd-prompt">C:\\Users\\Admin&gt;</span> _</div>
            `;
            screen.scrollTop = screen.scrollHeight;
            showToast('Prueba de Ping completada: 12ms (0% pérdidas)', 'success');
        }
    }

    if (e.target.id === 'btn-cmd-tracert') {
        const screen = document.getElementById('cmd-screen');
        if (screen) {
            screen.innerHTML += `
                <div class="cmd-line">&nbsp;</div>
                <div class="cmd-line"><span class="cmd-prompt">C:\\Users\\Admin&gt;</span> tracert google.com</div>
                <div class="cmd-line">Traza a la dirección google.com [142.250.190.46] sobre un máximo de 30 saltos:</div>
                <div class="cmd-line text-slate-300">&nbsp;&nbsp;1&nbsp;&nbsp;&lt;1 ms&nbsp;&nbsp;&lt;1 ms&nbsp;&nbsp;&lt;1 ms&nbsp;&nbsp;192.168.1.1 [Gateway Local / Router Wi-Fi 6]</div>
                <div class="cmd-line text-emerald-400">&nbsp;&nbsp;2&nbsp;&nbsp;&nbsp;4 ms&nbsp;&nbsp;&nbsp;3 ms&nbsp;&nbsp;&nbsp;4 ms&nbsp;&nbsp;10.20.0.1 [Nodo OLT FTTH Santander]</div>
                <div class="cmd-line text-emerald-400">&nbsp;&nbsp;3&nbsp;&nbsp;&nbsp;8 ms&nbsp;&nbsp;&nbsp;7 ms&nbsp;&nbsp;&nbsp;8 ms&nbsp;&nbsp;190.157.0.22 [Backbone Nacional Bogotá NAP]</div>
                <div class="cmd-line text-cyan-300">&nbsp;&nbsp;4&nbsp;&nbsp;28 ms&nbsp;&nbsp;29 ms&nbsp;&nbsp;28 ms&nbsp;&nbsp;108.170.243.193 [Cable Submarino Caribe - Miami Edge]</div>
                <div class="cmd-line text-cyan-300">&nbsp;&nbsp;5&nbsp;&nbsp;31 ms&nbsp;&nbsp;30 ms&nbsp;&nbsp;31 ms&nbsp;&nbsp;142.250.190.46 [google.com Servidor Destino]</div>
                <div class="cmd-line text-emerald-400">Traza completa exitosa. Sin saltos congestionados.</div>
                <div class="cmd-line"><span class="cmd-prompt">C:\\Users\\Admin&gt;</span> _</div>
            `;
            screen.scrollTop = screen.scrollHeight;
            showToast('Rastreo Tracert completado: 5 saltos hacia Google', 'success');
        }
    }

    if (e.target.id === 'btn-cmd-ipconfig') {
        const screen = document.getElementById('cmd-screen');
        if (screen) {
            screen.innerHTML += `
                <div class="cmd-line">&nbsp;</div>
                <div class="cmd-line"><span class="cmd-prompt">C:\\Users\\Admin&gt;</span> ipconfig /all</div>
                <div class="cmd-line text-cyan-300">Configuración IP de Windows — Adaptador de red activo:</div>
                <div class="cmd-line">&nbsp;&nbsp;&nbsp;Nombre de host . . . . . . . . . : NEXGEN-WORKSTATION</div>
                <div class="cmd-line">&nbsp;&nbsp;&nbsp;Enrutamiento IP habilitado. . . . : No</div>
                <div class="cmd-line text-slate-300">Adaptador de Ethernet Ethernet 1 (Fibra Óptica 1000BASE-T):</div>
                <div class="cmd-line text-emerald-400">&nbsp;&nbsp;&nbsp;Dirección IPv4. . . . . . . . . . : 192.168.1.150(Preferido)</div>
                <div class="cmd-line">&nbsp;&nbsp;&nbsp;Máscara de subred . . . . . . . . : 255.255.255.0 (/24)</div>
                <div class="cmd-line">&nbsp;&nbsp;&nbsp;Puerta de enlace predeterminada . : 192.168.1.1</div>
                <div class="cmd-line text-cyan-300">&nbsp;&nbsp;&nbsp;Servidor DHCP . . . . . . . . . . : 192.168.1.1</div>
                <div class="cmd-line">&nbsp;&nbsp;&nbsp;Servidores DNS. . . . . . . . . . : 1.1.1.1, 8.8.8.8</div>
                <div class="cmd-line">&nbsp;&nbsp;&nbsp;Dirección física (MAC). . . . . . : D4-5D-64-89-AB-12</div>
                <div class="cmd-line"><span class="cmd-prompt">C:\\Users\\Admin&gt;</span> _</div>
            `;
            screen.scrollTop = screen.scrollHeight;
            showToast('Información de adaptadores IP renderizada', 'info');
        }
    }

    if (e.target.id === 'btn-cmd-flush') {
        const screen = document.getElementById('cmd-screen');
        if (screen) {
            screen.innerHTML += `
                <div class="cmd-line">&nbsp;</div>
                <div class="cmd-line"><span class="cmd-prompt">C:\\Users\\Admin&gt;</span> ipconfig /flushdns</div>
                <div class="cmd-line text-emerald-400">Configuración IP de Windows</div>
                <div class="cmd-line text-emerald-400">Se vació correctamente la caché de resolución de DNS del sistema.</div>
                <div class="cmd-line text-slate-400">Las solicitudes a dominios web resolverán registros frescos desde los servidores DNS primarios.</div>
                <div class="cmd-line"><span class="cmd-prompt">C:\\Users\\Admin&gt;</span> _</div>
            `;
            screen.scrollTop = screen.scrollHeight;
            showToast('Caché DNS vaciada correctamente', 'success');
        }
    }

    // --- INTERACTIVIDAD 2: EXPLORADOR Y SIMULADOR DE CAPAS OSI ---
    const osiPill = e.target.closest('.osi-layer-pill');
    if (osiPill) {
        const layerNum = osiPill.getAttribute('data-layer');
        document.querySelectorAll('.osi-layer-pill').forEach(p => p.classList.remove('active'));
        osiPill.classList.add('active');

        const osiData = {
            '7': { title: 'Interfaz de Usuario y Servicios de Red', badge: 'Capa 7 — Aplicación', pdu: 'PDU: Datos de Usuario', desc: 'Es la capa más cercana al usuario final. Proporciona protocolos directos para navegadores web, clientes de correo y videollamadas.', protocols: 'HTTP, HTTPS, DNS, DHCP, SSH, FTP, SMTP', hardware: 'Computadoras, Smartphones, Servidores Web, Firewalls L7', tcp: 'Capa 4 — Aplicación (Condensa L7, L6 y L5)' },
            '6': { title: 'Formato, Cifrado y Compresión', badge: 'Capa 6 — Presentación', pdu: 'PDU: Datos Traducidos', desc: 'Se encarga de traducir los datos para que sean legibles por la aplicación. Realiza el cifrado TLS/SSL y la compresión de medios.', protocols: 'TLS 1.3, SSL, JPEG, MPEG, JSON, XML, ASCII', hardware: 'Módulos criptográficos de software y sistemas operativos', tcp: 'Capa 4 — Aplicación (Manejado por librerías del cliente)' },
            '5': { title: 'Gestión y Mantenimiento de Diálogos', badge: 'Capa 5 — Sesión', pdu: 'PDU: Datos de Sesión', desc: 'Establece, administra y finaliza las sesiones de comunicación entre aplicaciones locales y remotas.', protocols: 'NetBIOS, RPC, Sockets, SIP, NFS', hardware: 'Controladores de sesión y APIs de red del sistema operativo', tcp: 'Capa 4 — Aplicación' },
            '4': { title: 'Entrega de Extremo a Extremo y Control de Flujo', badge: 'Capa 4 — Transporte', pdu: 'PDU: Segmento (TCP) / Datagrama (UDP)', desc: 'Divide los datos en segmentos manejables, asigna números de puerto origen y destino, controla el flujo y la corrección de errores.', protocols: 'TCP (Fiable con acuse de recibo), UDP (Tiempo real sin lag)', hardware: 'Firewalls de estado (Stateful), balanceadores de carga L4', tcp: 'Capa 3 — Transporte' },
            '3': { title: 'Enrutamiento Global y Direccionamiento Lógico', badge: 'Capa 3 — Red', pdu: 'PDU: Paquete IP', desc: 'Determina la mejor ruta para enviar paquetes a través de múltiples redes interconectadas usando direcciones IP lógicas.', protocols: 'IPv4, IPv6, ICMP (Ping), OSPF, BGP, NAT', hardware: 'Routers, Switches Layer 3, Gateways de ISP', tcp: 'Capa 2 — Internet' },
            '2': { title: 'Direccionamiento Físico y Control de Acceso al Medio', badge: 'Capa 2 — Enlace de Datos', pdu: 'PDU: Trama (Frame Ethernet)', desc: 'Empaqueta bits en tramas con direcciones MAC origen y destino, controlando el acceso al medio físico y la detección de colisiones.', protocols: 'Ethernet 802.3, Wi-Fi 802.11ax, VLAN 802.1Q, ARP, PPP', hardware: 'Switches L2, Puntos de Acceso Wi-Fi, Tarjetas de Red (NIC)', tcp: 'Capa 1 — Acceso a la Red' },
            '1': { title: 'Transmisión de Señales Físicas y Bits', badge: 'Capa 1 — Física', pdu: 'PDU: Bits (Pulsos de Luz y Voltaje)', desc: 'Convierte las tramas en señales eléctricas, ópticas o electromagnéticas que viajan por el cable de cobre, la fibra óptica o el aire.', protocols: '1000BASE-T, FTTH GPON, RF 2.4/5GHz Wi-Fi, RJ-45, SC/APC', hardware: 'Cables UTP Cat 6A, Hilos de Fibra Óptica, Antenas, Transceptores SFP+', tcp: 'Capa 1 — Acceso a la Red' }
        };

        const data = osiData[layerNum];
        if (data) {
            document.getElementById('osi-badge-num').innerText = data.badge;
            document.getElementById('osi-badge-pdu').innerText = data.pdu;
            document.getElementById('osi-detail-title').innerText = data.title;
            document.getElementById('osi-detail-desc').innerText = data.desc;
            document.getElementById('osi-meta-protocols').innerText = data.protocols;
            document.getElementById('osi-meta-hardware').innerText = data.hardware;
            document.getElementById('osi-meta-tcp').innerText = data.tcp;
        }
    }

    if (e.target.id === 'btn-osi-simulate') {
        const animBar = document.getElementById('osi-packet-anim');
        const animText = document.getElementById('packet-anim-text');
        const animFill = document.getElementById('packet-anim-fill');
        if (!animBar || !animText || !animFill) return;

        animBar.style.display = 'block';
        animFill.style.width = '0%';

        const steps = [
            { pct: '14%', layer: '7', text: '📦 L7 Aplicación: Generando mensaje HTTP/JSON en navegador...' },
            { pct: '28%', layer: '6', text: '🔒 L6 Presentación: Cifrando carga útil con TLS 1.3...' },
            { pct: '42%', layer: '5', text: '🤝 L5 Sesión: Estableciendo socket seguro de comunicación...' },
            { pct: '56%', layer: '4', text: '⚡ L4 Transporte: Segmentando y agregando puerto TCP 443...' },
            { pct: '70%', layer: '3', text: '🌐 L3 Red: Empaquetando con IP Origen e IP Destino...' },
            { pct: '85%', layer: '2', text: '🏷️ L2 Enlace: Creando trama Ethernet con MAC de Router Gateway...' },
            { pct: '100%', layer: '1', text: '✨ L1 Física: ¡Bits convertidos en pulsos láser a través de la Fibra Óptica!' }
        ];

        steps.forEach((step, idx) => {
            setTimeout(() => {
                animFill.style.width = step.pct;
                animText.innerText = step.text;
                const pill = document.querySelector(`.osi-layer-pill[data-layer="${step.layer}"]`);
                if (pill) pill.click();

                if (idx === steps.length - 1) {
                    setTimeout(() => {
                        showToast('¡Encapsulamiento y transmisión completada con éxito!', 'success');
                    }, 500);
                }
            }, idx * 600);
        });
    }
});

// Listener delegado para el slider de curvatura FTTH
modalBody?.addEventListener('input', function(e) {
    if (e.target.id === 'ftth-bend-slider') {
        const angle = Number(e.target.value);
        const angleVal = document.getElementById('ftth-angle-val');
        const statusBadge = document.getElementById('ftth-status-badge');
        const pointer = document.getElementById('dbm-gauge-pointer');
        const logBox = document.getElementById('ftth-log-box');
        const ledPon = document.getElementById('led-pon');
        const ledLos = document.getElementById('led-los');

        const dbm = (-16.0 - (angle * 0.21)).toFixed(1);
        const pointerLeft = Math.min(100, Math.max(0, 15 + (angle / 90) * 80));

        if (angleVal) angleVal.innerText = `${angle}° (${angle < 45 ? 'Normal' : angle < 75 ? 'Riesgo de atenuación' : 'Quiebre crítico'})`;
        if (pointer) pointer.style.left = `${pointerLeft}%`;

        if (angle < 50) {
            if (statusBadge) {
                statusBadge.className = 'ftth-status-badge status-good';
                statusBadge.innerText = `🟢 ENLACE ÓPTIMO (${dbm} dBm)`;
            }
            if (ledPon) ledPon.className = 'ont-led-bulb on-green';
            if (ledLos) ledLos.className = 'ont-led-bulb off-red';
            if (logBox) logBox.innerHTML = `<b>Lectura ONT:</b> Potencia recibida en longitud de onda 1490nm: <span style="color:#10b981; font-weight:800;">${dbm} dBm</span>. Reflexión interna total estable. Transmisión a 1000 Mbps sin fluctuación.`;
        } else if (angle < 75) {
            if (statusBadge) {
                statusBadge.className = 'ftth-status-badge status-warn';
                statusBadge.innerText = `🟡 ATENUACIÓN ALTA (${dbm} dBm)`;
            }
            if (ledPon) ledPon.className = 'ont-led-bulb on-green';
            if (ledLos) ledLos.className = 'ont-led-bulb off-red';
            if (logBox) logBox.innerHTML = `<b>Lectura ONT:</b> Potencia atenuada: <span style="color:#f59e0b; font-weight:800;">${dbm} dBm</span>. La curvatura supera el radio crítico del núcleo de vidrio; se detecta pérdida de paquetes e incremento de Jitter.`;
        } else {
            if (statusBadge) {
                statusBadge.className = 'ftth-status-badge status-danger';
                statusBadge.innerText = `🔴 CORTE DE FIBRA / ALARMA LOS (${dbm} dBm)`;
            }
            if (ledPon) ledPon.className = 'ont-led-bulb off-green';
            if (ledLos) ledLos.className = 'ont-led-bulb on-red blink';
            if (logBox) logBox.innerHTML = `<b>¡ALARMA CRÍTICA!</b> El ángulo de 90° rompe el ángulo de reflexión interna de la luz láser. La ONT pierde sincronización óptica. El LED rojo LOS se activa y el servicio queda interrumpido.`;
        }
    }
});

// Inicializador de Chart.js
function initTrafficChart() {
    const canvasChart = document.getElementById('trafficChart');
    if (!canvasChart) return;
    const ctxChart = canvasChart.getContext('2d');
    
    if(chartInstance) { chartInstance.destroy(); }
    if(window.trafficInterval) clearInterval(window.trafficInterval);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light' && !document.body.classList.contains('light-theme');
    const colorText = isDark ? '#f8fafc' : '#1e293b';

    if (typeof Chart === 'undefined') {
        const pointsDown = [12, 19, 35, 20, 80, 50];
        const pointsUp = [5, 8, 15, 10, 25, 20];
        const labels = ['-10s', '-8s', '-6s', '-4s', '-2s', 'Ahora'];

        const drawFallbackChart = () => {
            const rect = canvasChart.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvasChart.width = Math.max(1, Math.floor(rect.width * dpr));
            canvasChart.height = Math.max(1, Math.floor(rect.height * dpr));
            ctxChart.setTransform(dpr, 0, 0, dpr, 0, 0);

            const width = rect.width;
            const height = rect.height;
            const pad = 34;
            const chartW = width - pad * 2;
            const chartH = height - pad * 1.7;

            ctxChart.clearRect(0, 0, width, height);
            ctxChart.fillStyle = 'rgba(15, 23, 42, 0.22)';
            ctxChart.fillRect(0, 0, width, height);

            ctxChart.strokeStyle = 'rgba(148, 163, 184, 0.18)';
            ctxChart.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = pad + (chartH / 4) * i;
                ctxChart.beginPath();
                ctxChart.moveTo(pad, y);
                ctxChart.lineTo(width - pad, y);
                ctxChart.stroke();
            }

            const drawLine = (points, color, fill) => {
                ctxChart.beginPath();
                points.forEach((value, index) => {
                    const x = pad + (chartW / (points.length - 1)) * index;
                    const y = pad + chartH - (Math.min(value, 100) / 100) * chartH;
                    if (index === 0) ctxChart.moveTo(x, y);
                    else ctxChart.lineTo(x, y);
                });
                ctxChart.strokeStyle = color;
                ctxChart.lineWidth = 2.5;
                ctxChart.stroke();

                ctxChart.lineTo(width - pad, pad + chartH);
                ctxChart.lineTo(pad, pad + chartH);
                ctxChart.closePath();
                ctxChart.fillStyle = fill;
                ctxChart.fill();
            };

            drawLine(pointsDown, '#3b82f6', 'rgba(59, 130, 246, 0.12)');
            drawLine(pointsUp, '#10b981', 'rgba(16, 185, 129, 0.08)');

            ctxChart.fillStyle = colorText;
            ctxChart.font = '600 11px Space Grotesk, Inter, sans-serif';
            labels.forEach((label, index) => {
                const x = pad + (chartW / (labels.length - 1)) * index;
                ctxChart.fillText(label, x - 14, height - 12);
            });
            ctxChart.fillStyle = '#3b82f6';
            ctxChart.fillText('Descarga', pad, 18);
            ctxChart.fillStyle = '#10b981';
            ctxChart.fillText('Subida', pad + 78, 18);
        };

        drawFallbackChart();
        window.trafficInterval = setInterval(() => {
            if(!document.getElementById('trafficChart')) {
                clearInterval(window.trafficInterval);
                return;
            }
            pointsDown.shift();
            pointsDown.push(Math.floor(Math.random() * 60) + 20);
            pointsUp.shift();
            pointsUp.push(Math.floor(Math.random() * 20) + 5);
            drawFallbackChart();
        }, 2000);
        return;
    }

    chartInstance = new Chart(ctxChart, {
        type: 'line',
        data: {
            labels: ['-10s', '-8s', '-6s', '-4s', '-2s', 'Ahora'],
            datasets: [
                {
                    label: 'Descarga (Mbps)',
                    data: [12, 19, 35, 20, 80, 50],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Subida (Mbps)',
                    data: [5, 8, 15, 10, 25, 20],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            scales: {
                y: { beginAtZero: true, max: 100, ticks: { color: colorText } },
                x: { ticks: { color: colorText } }
            },
            plugins: { legend: { labels: { color: colorText } } }
        }
    });

    window.trafficInterval = setInterval(() => {
        if(!document.getElementById('trafficChart')) {
            clearInterval(window.trafficInterval);
            return;
        }
        const dataDown = chartInstance.data.datasets[0].data;
        const dataUp = chartInstance.data.datasets[1].data;
        
        dataDown.shift();
        dataDown.push(Math.floor(Math.random() * 60) + 20); 
        
        dataUp.shift();
        dataUp.push(Math.floor(Math.random() * 20) + 5);  
        
        chartInstance.update();
    }, 2000);
}

window.NexGenTools = {
    ...(window.NexGenTools || {}),
    initTrafficChart
};

window.abrirManual = abrirManual;
window.cerrarModal = cerrarModal;

// Event delegation global: garantiza que CUALQUIER trigger (.js-manual-trigger o data-target) abra su widget
document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-close-modal')) {
        cerrarModal();
        return;
    }
    if (e.target === modal) {
        cerrarModal();
        return;
    }

    const trigger = e.target.closest('.js-manual-trigger, [data-target]');
    if (trigger && !trigger.closest('.theme-option, .glass-radio-group, #liquid-dock .dock-item[data-target="home"]')) {
        const target = trigger.getAttribute('data-target');
        if (target) {
            e.preventDefault();
            abrirManual(target);
        }
    } else if (trigger && trigger.getAttribute('data-target') === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});
