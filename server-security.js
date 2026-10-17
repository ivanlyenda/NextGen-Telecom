// =========================================================
// NEXGEN-TELECOM: CONFIGURACIÓN DE SEGURIDAD BACKEND
// Archivo de referencia para implementación con Node.js + Express
// =========================================================

// -------------------------------------------------------
// 1. VARIABLES DE ENTORNO (.env)
// Nunca hardcodear credenciales. Usar process.env
// -------------------------------------------------------
// require('dotenv').config(); // Descomentar al implementar

const SECURITY_CONFIG = {
    // Dominio oficial permitido
    allowedOrigin: process.env.ALLOWED_ORIGIN || 'https://nexgen-telecom.com',
    
    // Rate limiting
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    
    // JWT
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: '24h'
};

// -------------------------------------------------------
// 2. CORS ESTRICTO
// Solo permite peticiones del dominio oficial de NexGen
// -------------------------------------------------------
const corsConfig = {
    origin: function (origin, callback) {
        // Permitir requests sin origin (apps móviles, Postman en dev)
        if (!origin && process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        if (origin === SECURITY_CONFIG.allowedOrigin) {
            callback(null, true);
        } else {
            callback(new Error(`CORS bloqueado: Origen ${origin} no autorizado`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // Cache de preflight por 24h
};

// Uso: app.use(cors(corsConfig));

// -------------------------------------------------------
// 3. RATE LIMITING — Anti DDoS y Fuerza Bruta
// -------------------------------------------------------
// const rateLimit = require('express-rate-limit');

const rateLimiterConfig = {
    windowMs: SECURITY_CONFIG.rateLimitWindowMs,
    max: SECURITY_CONFIG.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Demasiadas solicitudes desde esta IP. Intenta de nuevo en 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    keyGenerator: (req) => {
        // Usar X-Forwarded-For si está detrás de un proxy/CDN
        return req.headers['x-forwarded-for'] || req.ip;
    }
};

// Rate limiter específico para login (más estricto)
const authRateLimiterConfig = {
    windowMs: 15 * 60 * 1000,
    max: 5, // Solo 5 intentos de login cada 15 minutos
    message: {
        error: 'Demasiados intentos de autenticación. Cuenta bloqueada temporalmente.',
        code: 'AUTH_RATE_LIMIT'
    }
};

// Uso:
// app.use('/api/', rateLimit(rateLimiterConfig));
// app.use('/api/auth/login', rateLimit(authRateLimiterConfig));

// -------------------------------------------------------
// 4. SANITIZACIÓN DE INPUTS — Anti SQL Injection & XSS
// -------------------------------------------------------

/**
 * Sanitiza strings contra inyecciones XSS
 * Escapa caracteres peligrosos en HTML
 * @param {string} input - Texto del usuario
 * @returns {string} Texto sanitizado
 */
function sanitizeHTML(input) {
    if (typeof input !== 'string') return '';
    
    const escapeMap = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '&': '&amp;',
        '/': '&#x2F;',
        '`': '&#96;'
    };
    
    return input.replace(/[<>"'&/`]/g, char => escapeMap[char] || char);
}

/**
 * Sanitiza inputs para consultas SQL (capa adicional)
 * NOTA: Siempre usar consultas parametrizadas como defensa principal
 * @param {string} input - Texto del usuario
 * @returns {string} Texto sanitizado
 */
function sanitizeSQL(input) {
    if (typeof input !== 'string') return '';
    
    // Eliminar caracteres de control SQL
    return input
        .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, char => {
            const map = {
                '\0': '\\0',
                '\x08': '\\b',
                '\x09': '\\t',
                '\x1a': '\\z',
                '\n': '\\n',
                '\r': '\\r',
                '"': '\\"',
                "'": "\\'",
                '\\': '\\\\',
                '%': '\\%'
            };
            return map[char] || char;
        });
}

/**
 * Middleware Express para sanitizar automáticamente body, query y params
 */
function sanitizeMiddleware(req, res, next) {
    const sanitizeObject = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = sanitizeHTML(value);
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    };
    
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);
    
    next();
}

// Uso: app.use(sanitizeMiddleware);

// -------------------------------------------------------
// 5. HEADERS DE SEGURIDAD ADICIONALES
// -------------------------------------------------------
function securityHeaders(req, res, next) {
    // Prevenir clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevenir MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Activar XSS filter del navegador
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Content Security Policy estricta
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' https://cdn.tailwindcss.com https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data:; " +
        "connect-src 'self'"
    );
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // HSTS (Force HTTPS)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    next();
}

// Uso: app.use(securityHeaders);

// -------------------------------------------------------
// EXPORTAR CONFIGURACIÓN
// -------------------------------------------------------
module.exports = {
    SECURITY_CONFIG,
    corsConfig,
    rateLimiterConfig,
    authRateLimiterConfig,
    sanitizeHTML,
    sanitizeSQL,
    sanitizeMiddleware,
    securityHeaders
};
