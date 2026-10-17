// =========================================================
// BASE DE DATOS TECNICA Y MANUALES
// =========================================================
const crearAcordeon = (titulo, contenido) => `
    <div class="custom-details">
        <div class="custom-summary interactive-hover">${titulo}</div>
        <div class="custom-content"><div class="custom-content-inner">${contenido}</div></div>
    </div>
`;
const crearCodigo = (codigo) => `
    <div class="highlight-box">
        <button class="copy-btn interactive-hover">Copiar</button>
        <code>${codigo}</code>
    </div>
`;
const crearInsight = (titulo, descripcion, items = []) => `
    <div class="card-inner-box network-insight">
        <div class="inner-summary">
            <div class="inner-summary-label">${titulo}</div>
            <p class="inner-text">${descripcion}</p>
        </div>
        ${items.length ? `<div class="inner-characteristics"><div class="inner-characteristics-label">Puntos clave</div><ul class="inner-list">${items.map(item => `<li>${item}</li>`).join('')}</ul></div>` : ''}
    </div>
`;

const crearTablaRed = (columnas, filas) => `
    <div class="network-table-wrapper">
        <table class="network-table">
            <thead>
                <tr>${columnas.map(c => `<th>${c}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${filas.map(f => `<tr>${f.map(td => `<td>${td}</td>`).join('')}</tr>`).join('')}
            </tbody>
        </table>
    </div>
`;

const manuales = {
    'calc-subnet': `
        <h2>Calculadora de Subredes IPv4</h2>
        <p style="margin-bottom:15px">Analiza cualquier dirección IP para obtener su máscara, dirección de red y broadcast. Ideal para diseño de redes LAN.</p>
        <div class="tool-container">
            <input type="text" id="ip-input" class="tool-input" placeholder="Ej: 192.168.1.50" value="192.168.1.50">
            <select id="mask-input" class="tool-input">
                <option value="24" selected>/24 (255.255.255.0) — LAN Común (254 hosts)</option>
                <option value="25">/25 (255.255.255.128) — Subred Mediana (126 hosts)</option>
                <option value="26">/26 (255.255.255.192) — Subred Pequeña (62 hosts)</option>
                <option value="27">/27 (255.255.255.224) — Micro Subred (30 hosts)</option>
                <option value="28">/28 (255.255.255.240) — Servidores (14 hosts)</option>
                <option value="29">/29 (255.255.255.248) — Troncal WAN (6 hosts)</option>
                <option value="30">/30 (255.255.255.252) — Punto a Punto (2 hosts)</option>
                <option value="16">/16 (255.255.0.0) — Corporativo Clase B (65,534 hosts)</option>
                <option value="8">/8 (255.0.0.0) — ISP / Campus Clase A (16.7M hosts)</option>
            </select>
            <button id="btn-calc-ip" class="tool-btn interactive-hover">Calcular Red</button>
            <div id="ip-result" class="result-box"></div>
        </div>
    `,
    'gen-wpa3': `
        <h2>Generador de Seguridad WPA3</h2>
        <p style="margin-bottom:15px">Las redes modernas requieren contraseñas criptográficamente seguras para evitar ataques de fuerza bruta. Genera tu clave aquí.</p>
        <div class="tool-container">
            <button id="btn-gen-pass" class="tool-btn interactive-hover">Generar Clave Aleatoria 256-bit</button>
            <div id="pass-result" class="result-box" style="text-align: center; font-size: 1.5rem; letter-spacing: 2px;"></div>
        </div>
    `,
    'monitor-trafico': `
        <h2>Monitor de Tráfico de Red (Live)</h2>
        <p>Análisis simulado del comportamiento del ancho de banda local procesado por el hardware.</p>
        <div class="chart-container">
            <canvas id="trafficChart"></canvas>
        </div>
    `,
    'wifi-planner': `
        <h2>Planificador Wi-Fi Inteligente</h2>
        <p class="widget-description">Calcula una recomendación rápida de banda, canal y ubicación para mejorar cobertura, estabilidad y latencia en redes domésticas o académicas.</p>
        <div class="tool-container">
            <label class="tool-label" for="wifi-area">Área aproximada</label>
            <select id="wifi-area" class="tool-input">
                <option value="small">Apartamento / salón pequeño</option>
                <option value="medium" selected>Casa mediana / aula técnica</option>
                <option value="large">Casa grande / laboratorio</option>
            </select>
            <label class="tool-label" for="wifi-walls">Paredes entre router y usuario</label>
            <input type="number" id="wifi-walls" class="tool-input" min="0" max="8" value="2">
            <label class="tool-label" for="wifi-devices">Dispositivos conectados</label>
            <input type="number" id="wifi-devices" class="tool-input" min="1" max="80" value="12">
            <label class="tool-label" for="wifi-interference">Interferencia cercana</label>
            <select id="wifi-interference" class="tool-input">
                <option value="low">Baja</option>
                <option value="medium" selected>Media</option>
                <option value="high">Alta: muchas redes vecinas</option>
            </select>
            <button id="btn-wifi-plan" class="tool-btn interactive-hover">Generar recomendación</button>
            <div id="wifi-result" class="result-box"></div>
        </div>
        ${crearInsight('Lectura profesional', 'La planeación Wi-Fi no depende solo de velocidad contratada. La banda, el canal, la potencia y la ubicación física del router determinan estabilidad real.', ['2.4 GHz ofrece mayor alcance, pero más interferencia.', '5 GHz ofrece menor latencia y más ancho de banda cerca del router.', 'Canales 1, 6 y 11 evitan solapamiento en 2.4 GHz.'])}
    `,
    'mtu-mss': `
        <h2>Calculador MTU / MSS</h2>
        <p class="widget-description">Evita fragmentación y microcortes ajustando el tamaño máximo de paquete según el tipo de enlace.</p>
        <div class="tool-container">
            <label class="tool-label" for="mtu-link">Tipo de conexión</label>
            <select id="mtu-link" class="tool-input">
                <option value="1500" selected>Ethernet / Fibra directa - MTU 1500</option>
                <option value="1492">PPPoE - MTU 1492</option>
                <option value="1460">VPN ligera / túnel simple - MTU 1460</option>
                <option value="1420">WireGuard típico - MTU 1420</option>
                <option value="1400">VPN doble / red restrictiva - MTU 1400</option>
            </select>
            <button id="btn-mtu-calc" class="tool-btn interactive-hover">Calcular MSS recomendado</button>
            <div id="mtu-result" class="result-box"></div>
        </div>
        ${crearInsight('Por qué importa', 'Cuando la MTU es demasiado alta para el camino real, los paquetes se fragmentan o se descartan. Eso se siente como páginas que cargan a medias, VPN inestable o juegos con microcortes.', ['MSS IPv4 recomendado = MTU - 40 bytes.', 'MSS IPv6 recomendado = MTU - 60 bytes.', 'En VPN conviene probar valores conservadores antes de culpar al ISP.'])}
    `,
    'qos': `<h2>QoS (Quality of Service) y Priorización</h2>
        ${crearAcordeon('1. ¿Qué es QoS y por qué elimina el Lag?', `<p>QoS es una función del router que reserva y prioriza el ancho de banda para tareas críticas. Si alguien en la red descarga un archivo pesado, sin QoS, tu juego sufrirá pérdida de paquetes (teletransportes). Con QoS, el router pone los paquetes UDP del juego al principio de la fila de procesamiento.</p>`)}
        ${crearAcordeon('2. Configuración ideal para Gaming competitivo', `<ul><li><b>Priorización por MAC:</b> Asigna a la dirección MAC de tu equipo la máxima prioridad.</li><li><b>Priorización por Puerto:</b> Si juegas, investiga el puerto específico del servidor y dale prioridad "Alta".</li><li><b>Control de Ancho de Banda:</b> Limita artificialmente la velocidad de dispositivos secundarios a un máximo del 80% de tu red para que nunca se sature.</li></ul>`)}`,
    'subnetting': `<h2>Direccionamiento IP y Subnetting (IPv4)</h2>
        ${crearAcordeon('1. Estructura de una Dirección IPv4', `<p>Una dirección IP consta de 32 bits divididos en 4 octetos. Ej: <code>192.168.1.50</code>. Sirve para identificar tanto la <b>Red</b> a la que perteneces, como el <b>Host</b> (tu dispositivo específico).</p>`)}
        ${crearAcordeon('2. La Máscara de Subred (/24)', `<p>La máscara determina el límite de dispositivos en tu red local. La máscara por defecto en los hogares es <code>255.255.255.0</code> (conocida como /24). Esto significa que los primeros 3 números identifican tu casa, y el último número (del 1 al 254) identifica a los dispositivos. Por lo tanto, tu router hogareño soporta un máximo de 254 equipos conectados simultáneamente.</p>`)}
        ${crearAcordeon('3. Servidor DHCP', `<p>El DHCP (Dynamic Host Configuration Protocol) es el servicio del router que entrega estas direcciones IP automáticamente. <b>Tip técnico:</b> Es buena práctica asignar "IPs Estáticas" fuera del rango del DHCP a equipos fijos como impresoras o servidores para evitar conflictos de red.</p>`)}
        ${crearAcordeon('4. Matriz Técnica de Máscaras y CIDR (Cheat Sheet)', `
            <p style="margin-bottom: 14px;">Guía de referencia rápida para subnetting y dimensionamiento de enlaces:</p>
            ${crearTablaRed(
                ['Prefijo CIDR', 'Máscara de Subred', 'Hosts Útiles', 'Uso Recomendado'],
                [
                    ['<span class="net-badge tcp">/30</span>', '<code>255.255.255.252</code>', '2 hosts', 'Enlaces WAN punto a punto entre routers'],
                    ['<span class="net-badge tcp">/29</span>', '<code>255.255.255.248</code>', '6 hosts', 'Bloque de IPs fijas de alta prioridad'],
                    ['<span class="net-badge udp">/28</span>', '<code>255.255.255.240</code>', '14 hosts', 'Segmento DMZ de servidores locales'],
                    ['<span class="net-badge udp">/26</span>', '<code>255.255.255.192</code>', '62 hosts', 'VLANs departamentales corporativas'],
                    ['<span class="net-badge status-ok">/24</span>', '<code>255.255.255.0</code>', '254 hosts', 'Red LAN residencial y comercial estándar'],
                    ['<span class="net-badge status-warn">/16</span>', '<code>255.255.0.0</code>', '65,534 hosts', 'Troncal de campus / Red de distribución ISP']
                ]
            )}
        `)}`,
    'diagnostico': `
        <h2>Diagnóstico Integral y Consola CMD en Vivo</h2>
        <p class="widget-description">Herramienta técnica de diagnóstico. Ejecuta comandos de red nativos en la terminal interactiva para medir latencias, rastrear saltos de ruta e inspeccionar adaptadores locales.</p>
        
        <!-- Terminal Interactiva CMD -->
        <div class="cmd-terminal-box">
            <div class="cmd-topbar">
                <div class="cmd-traffic-lights">
                    <span class="cmd-dot cmd-dot-red"></span>
                    <span class="cmd-dot cmd-dot-yellow"></span>
                    <span class="cmd-dot cmd-dot-green"></span>
                </div>
                <div class="cmd-title">Símbolo del sistema — Consola de Diagnóstico NexGen</div>
                <button class="cmd-clear-btn" id="btn-cmd-clear" title="Limpiar consola">Limpiar</button>
            </div>
            <div class="cmd-toolbar">
                <button class="cmd-action-btn" id="btn-cmd-ping">▶ ping 8.8.8.8 -t</button>
                <button class="cmd-action-btn" id="btn-cmd-tracert">▶ tracert google.com</button>
                <button class="cmd-action-btn" id="btn-cmd-ipconfig">▶ ipconfig /all</button>
                <button class="cmd-action-btn" id="btn-cmd-flush">▶ ipconfig /flushdns</button>
            </div>
            <div class="cmd-screen" id="cmd-screen" data-lenis-prevent>
                <div class="cmd-line cmd-welcome">Microsoft Windows [Versión 10.0.22631.3007]</div>
                <div class="cmd-line cmd-welcome">(c) NexGen Telecom Diagnostic Suite. Todos los derechos reservados.</div>
                <div class="cmd-line">&nbsp;</div>
                <div class="cmd-line"><span class="cmd-prompt">C:\\Users\\Admin&gt;</span> Haz clic en cualquiera de los botones superiores para ejecutar un diagnóstico real.</div>
            </div>
        </div>

        ${crearAcordeon('1. Speedtest: Ping, Jitter y Ancho de Banda', `
            <ul>
                <li><b>Ping (Latencia):</b> Mide en milisegundos (ms) el tiempo que tarda un paquete de datos en ir y volver. <em>Óptimo para gaming y teleconferencias:</em> &lt; 40ms.</li>
                <li><b>Jitter (Fluctuación):</b> Es la variación en el tiempo de llegada de los paquetes. Si el jitter sube, experimentarás congelamientos y teletransportes en juegos competitivos.</li>
                <li><b>Descarga vs Subida:</b> Capacidad física de ancho de banda. En Fibra FTTH es 100% simétrica, mientras que en HFC (cable coaxial) la subida suele estar limitada a solo el 10-20% de la descarga.</li>
            </ul>
        `)}

        ${crearAcordeon('2. Manual de Comandos de Red Esenciales', `
            <p><b>Comandos para diagnóstico rápido desde tu computadora:</b></p>
            <p><b>1. Ping continuo para detectar micro-cortes:</b></p>
            ${crearCodigo('ping 8.8.8.8 -t')}
            <p><b>2. Rastreo de ruta de saltos de red (Traceroute):</b></p>
            ${crearCodigo('tracert 1.1.1.1')}
            <p><b>3. Limpiar caché DNS y renovar IP por DHCP:</b></p>
            ${crearCodigo('ipconfig /flushdns && ipconfig /renew')}
        `)}

        ${crearInsight('Diagnóstico de Campo', 'Si el comando ping muestra "Tiempo de espera agotado", la pérdida de paquetes puede ser un cable UTP doblado, saturación del canal Wi-Fi o congestión en el nodo del ISP.', [
            'Ping al router local (192.168.1.1) debe ser siempre < 1 ms por cable o < 4 ms por Wi-Fi.',
            'Tracert revela el nodo exacto del ISP o cable submarino donde se eleva la latencia.',
            'Un flushdns resuelve el 80% de los errores "No se puede acceder al sitio web".'
        ])}
    `,
    'modelo-osi': `
        <h2>Modelo OSI y Arquitectura TCP/IP</h2>
        <p class="widget-description">Explorador interactivo de protocolos, capas de red y encapsulamiento. Comprende cómo un dato viaja desde tu aplicación hasta los fotones de la fibra.</p>
        
        <!-- Simulador Interactivo de Capas OSI -->
        <div class="osi-simulator">
            <div class="osi-sim-header">
                <div class="osi-sim-title">Pila de Protocolos Interactiva (Haz clic en cada capa)</div>
                <button class="osi-sim-run-btn" id="btn-osi-simulate">🚀 Simular Envío de Paquete</button>
            </div>
            
            <div class="osi-grid">
                <!-- Stack de Capas -->
                <div class="osi-stack" id="osi-stack">
                    <div class="osi-layer-pill active" data-layer="7">
                        <span class="layer-num">L7</span>
                        <span class="layer-name">Aplicación</span>
                        <span class="layer-pdu">Datos</span>
                    </div>
                    <div class="osi-layer-pill" data-layer="6">
                        <span class="layer-num">L6</span>
                        <span class="layer-name">Presentación</span>
                        <span class="layer-pdu">Datos</span>
                    </div>
                    <div class="osi-layer-pill" data-layer="5">
                        <span class="layer-num">L5</span>
                        <span class="layer-name">Sesión</span>
                        <span class="layer-pdu">Datos</span>
                    </div>
                    <div class="osi-layer-pill" data-layer="4">
                        <span class="layer-num">L4</span>
                        <span class="layer-name">Transporte</span>
                        <span class="layer-pdu">Segmento</span>
                    </div>
                    <div class="osi-layer-pill" data-layer="3">
                        <span class="layer-num">L3</span>
                        <span class="layer-name">Red</span>
                        <span class="layer-pdu">Paquete</span>
                    </div>
                    <div class="osi-layer-pill" data-layer="2">
                        <span class="layer-num">L2</span>
                        <span class="layer-name">Enlace de Datos</span>
                        <span class="layer-pdu">Trama</span>
                    </div>
                    <div class="osi-layer-pill" data-layer="1">
                        <span class="layer-num">L1</span>
                        <span class="layer-name">Física</span>
                        <span class="layer-pdu">Bits</span>
                    </div>
                </div>

                <!-- Detalle dinámico de la capa seleccionada -->
                <div class="osi-detail-panel" id="osi-detail-panel">
                    <div class="osi-detail-header">
                        <span class="osi-detail-badge" id="osi-badge-num">Capa 7 — Aplicación</span>
                        <span class="osi-pdu-badge" id="osi-badge-pdu">PDU: Datos de Usuario</span>
                    </div>
                    <h3 class="osi-detail-title" id="osi-detail-title">Interfaz de Usuario y Servicios de Red</h3>
                    <p class="osi-detail-desc" id="osi-detail-desc">Es la capa más cercana al usuario final. Proporciona protocolos directos para navegadores web, clientes de correo y videollamadas.</p>
                    
                    <div class="osi-meta-grid">
                        <div class="osi-meta-box">
                            <div class="osi-meta-label">Protocolos Clave</div>
                            <div class="osi-meta-val" id="osi-meta-protocols">HTTP, HTTPS, DNS, DHCP, SSH, FTP, SMTP</div>
                        </div>
                        <div class="osi-meta-box">
                            <div class="osi-meta-label">Hardware / Dispositivo</div>
                            <div class="osi-meta-val" id="osi-meta-hardware">Computadoras, Smartphones, Servidores Web, Firewalls L7</div>
                        </div>
                        <div class="osi-meta-box">
                            <div class="osi-meta-label">Equivalente TCP/IP</div>
                            <div class="osi-meta-val" id="osi-meta-tcp">Capa 4 — Aplicación (Condensa L7, L6 y L5)</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="osi-packet-anim-bar" id="osi-packet-anim" style="display:none;">
                <div class="packet-anim-text" id="packet-anim-text">Encapsulando datos en L7...</div>
                <div class="packet-anim-track"><div class="packet-anim-fill" id="packet-anim-fill"></div></div>
            </div>
        </div>

        ${crearAcordeon('1. OSI vs TCP/IP: La Diferencia Fundamental', `
            <p><b>Modelo OSI (7 Capas):</b> Es un modelo teórico formal creado por ISO para estandarizar la comunicación y ayudar a los ingenieros a diagnosticar problemas capa por capa.</p>
            <p><b>Modelo TCP/IP (4 Capas):</b> Es la arquitectura práctica real sobre la que funciona el Internet moderno. Condensa las capas 7, 6 y 5 en una sola Capa de Aplicación, y las capas 2 y 1 en la Capa de Acceso a la Red.</p>
        `)}

        ${crearAcordeon('2. Transporte (L4): TCP vs UDP (La Clave del Rendimiento)', `
            <ul>
                <li><b>TCP (Transmission Control Protocol):</b> Orientado a la conexión (Three-Way Handshake SYN-SYN/ACK-ACK). Garantiza entrega perfecta sin pérdida de bytes. Si un segmento falla, se retransmite. <em>Uso: Navegación web (HTTPS), transferencias seguras, bases de datos.</em></li>
                <li><b>UDP (User Datagram Protocol):</b> Sin conexión previa ni retransmisiones. Envía datagramas a máxima velocidad con mínima sobrecarga. <em>Uso: Juegos online competitivos (Valorant, CS2), videollamadas y streaming en tiempo real.</em></li>
            </ul>
        `)}

        ${crearAcordeon('3. Enlace de Datos (L2) vs Red (L3): Dirección MAC vs Dirección IP', `
            <ul>
                <li><b>Capa 2 — Enlace de Datos (Dirección MAC):</b> Conmutación local dentro del mismo segmento de red mediante Switches. La dirección MAC física (48 bits hexadecimales) identifica de forma única la tarjeta de red (NIC) en el medio local.</li>
                <li><b>Capa 3 — Red (Dirección IP):</b> Enrutamiento global entre redes dispares mediante Routers. La dirección IP lógica (IPv4 32 bits / IPv6 128 bits) permite la entrega de paquetes a través de la topología mundial de Internet.</li>
            </ul>
        `)}
    `,
    'fibra-optica': `
        <h2>Infraestructura: Fibra Óptica (FTTH) vs HFC (Cobre)</h2>
        <p class="widget-description">Laboratorio interactivo de fotónica y atenuación. Mide la potencia óptica (dBm) en tiempo real según la flexión del cable y analiza por qué la fibra vence al cable coaxial.</p>
        
        <!-- Simulador Interactivo de Atenuación y Curvatura FTTH -->
        <div class="ftth-tester-box">
            <div class="ftth-header">
                <div class="ftth-title">Simulador de Atenuación Óptica y Curvatura (ONT / Router)</div>
                <div class="ftth-status-badge" id="ftth-status-badge">🟢 ENLACE ÓPTIMO (-18.2 dBm)</div>
            </div>
            
            <div class="ftth-control-grid">
                <div class="ftth-slider-container">
                    <label class="ftth-slider-label" for="ftth-bend-slider">
                        <span>Ángulo de Curvatura del Cable de Fibra (Drop Amarillo):</span>
                        <b id="ftth-angle-val">15° (Normal)</b>
                    </label>
                    <input type="range" id="ftth-bend-slider" min="0" max="90" value="15" class="ftth-slider">
                    <div class="ftth-slider-marks">
                        <span>0° (Recto)</span>
                        <span>45° (Curva suave)</span>
                        <span>75° (Riesgo)</span>
                        <span>90° (Quiebre / LOS)</span>
                    </div>
                </div>

                <!-- Panel de LEDs de la ONT -->
                <div class="ont-led-panel">
                    <div class="ont-led-item">
                        <span class="ont-led-bulb on-green" id="led-power"></span>
                        <span class="ont-led-name">PWR</span>
                    </div>
                    <div class="ont-led-item">
                        <span class="ont-led-bulb on-green" id="led-pon"></span>
                        <span class="ont-led-name">PON</span>
                    </div>
                    <div class="ont-led-item">
                        <span class="ont-led-bulb off-red" id="led-los"></span>
                        <span class="ont-led-name">LOS</span>
                    </div>
                    <div class="ont-led-item">
                        <span class="ont-led-bulb on-blue" id="led-lan"></span>
                        <span class="ont-led-name">LAN 1G</span>
                    </div>
                </div>
            </div>

            <!-- Medidor de potencia dBm -->
            <div class="dbm-gauge-container">
                <div class="dbm-gauge-bar">
                    <div class="dbm-gauge-pointer" id="dbm-gauge-pointer" style="left: 65%;"></div>
                </div>
                <div class="dbm-gauge-labels">
                    <span>-12 dBm (Saturación)</span>
                    <span>-18 dBm (Óptimo)</span>
                    <span>-27 dBm (Límite)</span>
                    <span>-35 dBm (Corte)</span>
                </div>
            </div>

            <div class="ftth-log-box" id="ftth-log-box">
                <b>Lectura ONT:</b> Potencia recibida en longitud de onda 1490nm: <span style="color:#10b981; font-weight:800;">-18.2 dBm</span>. Reflexión interna total estable. Sin pérdida de paquetes.
            </div>
        </div>

        ${crearAcordeon('1. Redes FTTH (Fiber To The Home) - Movistar / ETB', `
            <ul>
                <li><b>Medio físico:</b> Núcleo de vidrio de sílice de 9 micras de diámetro (más delgado que un cabello humano).</li>
                <li><b>Velocidad y latencia:</b> Simétrica (igual subida y descarga), latencia de 1 a 5 ms hacia servidores nacionales.</li>
                <li><b>Inmunidad:</b> 100% inmune a rayos, motores eléctricos y ruido electromagnético.</li>
                <li><b>Cuidado crítico:</b> El vidrio no tolera ángulos de 90° (quiebre del haz láser y activación del LED rojo LOS).</li>
            </ul>
        `)}

        ${crearAcordeon('2. Redes HFC (Híbrido Fibra-Coaxial) - Claro / Tigo', `
            <ul>
                <li><b>Medio físico:</b> La fibra llega al nodo del barrio y desde allí entra cable coaxial de cobre grueso con conector de rosca a tu casa.</li>
                <li><b>Limitaciones:</b> Velocidad asimétrica (alta descarga pero muy baja subida), susceptible a humedad en postes, splitters sulfatados y ruido eléctrico.</li>
            </ul>
        `)}
    `,
    'seguridad-red': `<h2>Seguridad de Redes y Firewalls</h2>
        ${crearAcordeon('1. Filtrado de direcciones MAC', `<p>La dirección MAC es la "huella digital" de fábrica de tu celular o PC. En tu router, puedes crear una <b>Lista Blanca</b>: solo los dispositivos cuyas MAC estén registradas allí podrán tener internet, incluso si los hackers saben tu contraseña Wi-Fi.</p>`)}
        ${crearAcordeon('2. Redes de Invitados e Isolation', `<p>Activa la "Red de Invitados" en tu router para visitas. Esta función incluye <b>AP Isolation</b>, lo que significa que los invitados tienen internet, pero no pueden ver ni acceder a tus computadoras, cámaras de seguridad o archivos compartidos en la red principal.</p>`)}
        ${crearAcordeon('3. Port Forwarding Seguro', `<p>Si necesitas abrir un puerto para un servidor o cámaras, nunca uses la función <b>DMZ</b> (que expone tu PC completo al internet público sin protección). Abre solo el puerto específico (ej. 25565) apuntando a la IP estática local de tu equipo.</p>`)}
        ${crearAcordeon('4. Matriz de Puertos Críticos y Políticas de Firewall', `
            <p style="margin-bottom: 14px;">Puertos de red comunes que un administrador o técnico debe conocer y auditar:</p>
            ${crearTablaRed(
                ['Puerto', 'Protocolo', 'Servicio', 'Política de Seguridad'],
                [
                    ['<code>21</code>', '<span class="net-badge tcp">TCP</span>', 'FTP (Texto plano)', '<span class="net-badge status-warn">Bloquear / Migrar a SFTP (22)</span>'],
                    ['<code>22</code>', '<span class="net-badge tcp">TCP</span>', 'SSH (Consola segura)', '<span class="net-badge status-ok">Permitir solo con llaves criptográficas</span>'],
                    ['<code>23</code>', '<span class="net-badge tcp">TCP</span>', 'Telnet (Sin cifrar)', '<span class="net-badge status-warn">Deshabilitar permanentemente</span>'],
                    ['<code>53</code>', '<span class="net-badge udp">UDP</span>', 'DNS (Resolución de nombres)', '<span class="net-badge status-ok">Filtrar con DoH (DNS sobre HTTPS)</span>'],
                    ['<code>80 / 443</code>', '<span class="net-badge tcp">TCP</span>', 'HTTP / HTTPS Web', '<span class="net-badge status-ok">Forzar redirección HTTPS</span>'],
                    ['<code>3389</code>', '<span class="net-badge tcp">TCP</span>', 'RDP (Escritorio Remoto)', '<span class="net-badge status-warn">Aislar estrictamente tras túnel VPN</span>']
                ]
            )}
        `)}`,
    'vpn': `<h2>Uso de VPN (Virtual Private Network)</h2>${crearAcordeon('1. ¿Cómo funciona una VPN?', `<ul><li><b>Sin VPN:</b> Tu PC se conecta al ISP, el ISP lee hacia dónde vas y si está bloqueado, rechaza la conexión.</li><li><b>Con VPN:</b> Tu PC envuelve tus datos en código secreto (encriptación). El ISP solo ve que te conectas a un servidor extraño, pero no sabe qué hay dentro.</li></ul>`)}${crearAcordeon('2. Riesgos de las VPN Gratuitas', `<p>Como estudiantes, solemos buscar VPNs gratis. <b>¡Cuidado!</b> Si no estás pagando por el producto, <b>tú eres el producto</b>.</p><ul><li>Las VPN gratis suelen registrar tu historial de navegación para venderlo a agencias de publicidad.</li></ul>`)}`,
    'ip-publica': `<h2>IP Pública vs Privada y el problema del CGNAT</h2>${crearAcordeon('1. Diferencia de IPs', `<ul><li><b>IP Privada (Local):</b> Es la que te da el router de tu casa (Ej: <code>192.168.1.15</code>). Solo existe dentro de tus cuatro paredes.</li><li><b>IP Pública (Global):</b> Es la "Cédula de Ciudadanía" de tu conexión en el mundo. Es la que te da tu operador para salir a internet.</li></ul>`)}${crearAcordeon('2. ¿Qué es el CGNAT? (Carrier Grade NAT)', `<p>En lugar de darte una IP Pública solo para tu casa, los operadores agrupan a 50 o 100 casas y <b>todas salen a internet usando la misma IP Pública compartida.</b> A esto se le llama CGNAT.</p>`)}`,
    'wifi-publico': `<h2>Peligros del Wi-Fi Público</h2>${crearAcordeon('1. El problema de las redes "abiertas"', `<p>Imagina que estás en un salón de clases y gritas un secreto. Todos pueden escucharte. Así funciona el Wi-Fi público: al no tener contraseña, la información viaja por el aire sin protección (sin encriptar).</p>`)}`,
    'lan': `
        <h2>Armado de Cables UTP: Normas T568A y T568B</h2>
        <p class="widget-description">Guía técnica de cableado estructurado, mapa de pines interactivo RJ-45, comparativa de normas, cables directos vs cruzados y estándares de ponchado profesional.</p>
        
        <!-- Componente Visual Interactivo RJ45 -->
        <div class="wiring-container">
            <div class="wiring-header">
                <div class="wiring-title">Diagrama de Conector RJ-45 (Pines 1 al 8)</div>
                <div class="wiring-tabs">
                    <button class="wiring-tab-btn active" data-norma="t568b">Norma T568B (Comercial)</button>
                    <button class="wiring-tab-btn" data-norma="t568a">Norma T568A (Residencial / Federal)</button>
                </div>
            </div>
            
            <div class="wiring-diagram" id="wiring-diagram">
                <!-- Vista interactiva de 8 pines con colores reales -->
                <div class="rj45-pinout-grid" id="rj45-pinout-grid">
                    <div class="pin-card" data-pin="1">
                        <div class="pin-num">Pin 1</div>
                        <div class="wire-visual wire-w-org"></div>
                        <div class="wire-name">Blanco / Naranja</div>
                        <div class="wire-role">TX+ (Transmisión)</div>
                    </div>
                    <div class="pin-card" data-pin="2">
                        <div class="pin-num">Pin 2</div>
                        <div class="wire-visual wire-org"></div>
                        <div class="wire-name">Naranja</div>
                        <div class="wire-role">TX- (Transmisión)</div>
                    </div>
                    <div class="pin-card" data-pin="3">
                        <div class="pin-num">Pin 3</div>
                        <div class="wire-visual wire-w-grn"></div>
                        <div class="wire-name">Blanco / Verde</div>
                        <div class="wire-role">RX+ (Recepción)</div>
                    </div>
                    <div class="pin-card" data-pin="4">
                        <div class="pin-num">Pin 4</div>
                        <div class="wire-visual wire-blu"></div>
                        <div class="wire-name">Azul</div>
                        <div class="wire-role">Datos Gigabit / PoE</div>
                    </div>
                    <div class="pin-card" data-pin="5">
                        <div class="pin-num">Pin 5</div>
                        <div class="wire-visual wire-w-blu"></div>
                        <div class="wire-name">Blanco / Azul</div>
                        <div class="wire-role">Datos Gigabit / PoE</div>
                    </div>
                    <div class="pin-card" data-pin="6">
                        <div class="pin-num">Pin 6</div>
                        <div class="wire-visual wire-grn"></div>
                        <div class="wire-name">Verde</div>
                        <div class="wire-role">RX- (Recepción)</div>
                    </div>
                    <div class="pin-card" data-pin="7">
                        <div class="pin-num">Pin 7</div>
                        <div class="wire-visual wire-w-brn"></div>
                        <div class="wire-name">Blanco / Marrón</div>
                        <div class="wire-role">Datos Gigabit / PoE</div>
                    </div>
                    <div class="pin-card" data-pin="8">
                        <div class="pin-num">Pin 8</div>
                        <div class="wire-visual wire-brn"></div>
                        <div class="wire-name">Marrón</div>
                        <div class="wire-role">Datos Gigabit / PoE</div>
                    </div>
                </div>
            </div>
            
            <div class="wiring-tip" id="wiring-norma-desc">
                <strong>Norma T568B:</strong> Es el estándar predominante en más del 90% de las redes corporativas y comerciales de América y Europa. Ideal para nuevos despliegues y patch cords.
            </div>
        </div>

        ${crearAcordeon('1. ¿Cuándo y Dónde se Usa T568A vs T568B?', `
            <p>Ambas normas fueron estandarizadas por <b>ANSI/TIA/EIA-568</b>. No hay diferencia en velocidad ni ancho de banda entre ambas, la diferencia radica en la asignación de los pares de hilos (Par 2 Naranja vs Par 3 Verde):</p>
            <ul>
                <li><b>Norma T568A:</b>
                    <ul>
                        <li><b>Origen y uso oficial:</b> Es el estándar original TIA/EIA. Es de uso <em>obligatorio</em> en contratos de cableado del Gobierno Federal de los Estados Unidos (especificación USOC/FIPS).</li>
                        <li><b>Compatibilidad telefónica:</b> Mantiene retrocompatibilidad con conectores telefónicos RJ-11 y RJ-14 (el par central azul y verde coincide con las líneas 1 y 2 de voz analógica).</li>
                        <li><b>Uso común:</b> Instalaciones residenciales modernas y proyectos gubernamentales.</li>
                    </ul>
                </li>
                <li><b>Norma T568B:</b>
                    <ul>
                        <li><b>Uso global masivo:</b> Es la norma más extendida en el mundo comercial, empresarial, centros de datos y redes domésticas estándar.</li>
                        <li><b>Fabricación:</b> La gran mayoría de cables de red comerciales (patch cords) vienen terminados de fábrica bajo T568B.</li>
                    </ul>
                </li>
            </ul>
            <p><b>Regla clave de instalación:</b> En una red estructurada se debe elegir una norma y mantenerla en todos los jacks, paneles y cables. Mezclar normas en extremos de un cable directo provocará fallos de par cruzado no deseados.</p>
        `)}

        ${crearAcordeon('2. Cable Directo (Straight-Through) vs Cable Cruzado (Crossover)', `
            <p>La combinación de normas en las dos puntas del cable determina su tipo:</p>
            <ul>
                <li><b>Cable Directo (T568B en ambos extremos o T568A en ambos):</b>
                    <p>Se utiliza para conectar dispositivos que operan en <b>distintas capas del modelo OSI</b>:</p>
                    <ul>
                        <li>Computadora / Servidor ➔ Switch</li>
                        <li>Switch ➔ Router</li>
                        <li>Router ➔ Access Point Wi-Fi</li>
                    </ul>
                </li>
                <li><b>Cable Cruzado (T568A en un extremo y T568B en el otro):</b>
                    <p>Cruza los pares de Transmisión (TX) con Recepción (RX). Se usaba históricamente para conectar dispositivos de la <b>misma capa OSI</b>:</p>
                    <ul>
                        <li>Computadora ➔ Computadora (enlace directo sin router)</li>
                        <li>Switch ➔ Switch (sin puerto Uplink dedicado)</li>
                        <li>Router ➔ Router</li>
                    </ul>
                </li>
                <li><b>¿Por qué ya no es necesario el cable cruzado? (Auto MDI-X):</b>
                    <p>Todas las tarjetas de red Gigabit (1000BASE-T) y modernas incluyen la tecnología <b>Auto MDI-X</b>. El chip de red detecta automáticamente si los pines están en modo directo o invertido y realiza el cruce electrónico en milisegundos. Puedes usar un cable directo para todo.</p>
                </li>
            </ul>
        `)}

        ${crearAcordeon('3. Categorías de Cable UTP/FTP y Velocidades', `
            <p>El rendimiento no solo depende del ponchado, sino de la categoría física del cable:</p>
            <ul>
                <li><b>Cat 5e (Categoría 5 Mejorada):</b> Frecuencia hasta 100 MHz. Velocidad máxima: 1 Gbps (1000 Mbps) hasta 100 metros. Suficiente para internet doméstico básico.</li>
                <li><b>Cat 6:</b> Frecuencia hasta 250 MHz. Velocidad: 1 Gbps hasta 100m, y hasta <b>10 Gbps</b> en tiradas cortas (hasta 55 metros). Cuenta con una guía plástica central cruciforme (spline) que separa los 4 pares reduciendo la diafonía.</li>
                <li><b>Cat 6A (Augmented):</b> Frecuencia hasta 500 MHz. Velocidad: <b>10 Gbps garantizados hasta 100 metros</b>. Es el estándar recomendado hoy para cableado horizontal en empresas y cámaras PoE de alta resolución.</li>
                <li><b>Cat 7 / Cat 8:</b> Frecuencias de 600 MHz a 2000 MHz. Velocidades de 25 Gbps a 40 Gbps (en distancias cortas de hasta 30m). Blindaje individual por par (S/FTP) diseñado para centros de datos y racks de servidores.</li>
            </ul>
        `)}

        ${crearAcordeon('4. Guía de Ponchado Profesional Paso a Paso', `
            <ol>
                <li><b>Desforre exterior:</b> Retira entre 2.5 y 3 cm de la chaqueta plástica externa usando la cuchilla pelacables de la crimpadora. Ten cuidado de no cortar ni mellar el cobre de los hilos internos.</li>
                <li><b>Destrenzado mínimo (&lt; 1.2 cm):</b> Separa los 4 pares trenzados. <em>Consejo técnico:</em> Mantén el trenzado lo más cerca posible del conector; destrenzar más de 13 mm causa degradación de señal por diafonía (NEXT).</li>
                <li><b>Peinado y ordenación:</b> Ordena los hilos según la norma elegida (ej. T568B: Blanco/Naranja, Naranja, Blanco/Verde, Azul, Blanco/Azul, Verde, Blanco/Marrón, Marrón). Aplánalos firmemente entre tus dedos.</li>
                <li><b>Corte limpio a 90°:</b> Con la cuchilla de corte, recorta los 8 hilos en línea recta perpendicular, dejando aproximadamente 1.2 cm a 1.4 cm de hilos expuestos.</li>
                <li><b>Inserción a fondo en RJ-45:</b> Introduce los hilos en el conector con la pestaña plástica hacia abajo. Asegúrate de que los 8 hilos lleguen hasta el tope frontal metálico y que la chaqueta externa entre dentro del conector (para que la cuña plástica la aprisione y soporte la tensión física).</li>
                <li><b>Crimpeado uniforme:</b> Inserta el conector en la crimpadora y aprieta con firmeza hasta el final del recorrido para que las cuchillas doradas perforen el aislante y hagan contacto con el cobre.</li>
                <li><b>Verificación con Tester:</b> Conecta ambos extremos a un probador de red LAN. Los LEDs del 1 al 8 deben encenderse en orden correlativo y simultáneo.</li>
            </ol>
        `)}

        ${crearInsight('Reglas de Oro del Instalador de Telecomunicaciones', 'Un buen ponchado garantiza latencias estables, cero pérdida de paquetes y la activación completa del enlace a 1 Gbps / 2.5 Gbps en lugar de degradarse a 100 Mbps.', [
            'Nunca destrences más de 1.2 cm los pares de cobre antes de crimpear.',
            'La funda externa siempre debe quedar prensada dentro del conector RJ-45.',
            'En PoE (Power over Ethernet), un mal contacto en los pares azules o marrones puede causar sobrecalentamiento del puerto.'
        ])}
    `
};
