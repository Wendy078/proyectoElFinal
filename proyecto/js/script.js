// ===== VARIABLES GLOBALES =====
let menuAbierto = false;
let paginaActual = 'inicio';
let timeoutResize;

// ===== INICIALIZACIÓN CUANDO SE CARGA LA PÁGINA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema de Control de Almacén - Inicializando...');
    
    // Configurar todas las funcionalidades
    configurarNavegacion();
    configurarLogo();
    configurarMenuMovil();
    configurarBotones();
    configurarTooltips();
    configurarSubmenusDesktop();
    ajustarPosicionMenu();
    
    // Mostrar página de inicio por defecto
    mostrarPagina('inicio');
    
    console.log('✅ Sistema inicializado correctamente');
});

// ===== AJUSTAR POSICIÓN DEL MENÚ SEGÚN ALTURA DEL HEADER =====
function ajustarPosicionMenu() {
    const header = document.querySelector('.header');
    const menu = document.querySelector('.menu');
    
    if (!header || !menu) return;
    
    function actualizarPosicionMenu() {
        if (window.innerWidth > 768) {
            const headerHeight = header.offsetHeight;
            menu.style.top = headerHeight + 'px';
            
            // Actualizar también el margin-top del contenido
            const contenido = document.getElementById('contenido-principal');
            if (contenido) {
                const menuHeight = menu.offsetHeight;
                contenido.style.marginTop = (headerHeight + menuHeight + 20) + 'px';
            }
        }
    }
    
    // Ejecutar al cargar
    actualizarPosicionMenu();
    
    // Ejecutar al redimensionar
    window.addEventListener('resize', function() {
        clearTimeout(timeoutResize);
        timeoutResize = setTimeout(actualizarPosicionMenu, 100);
    });
    
    // Observar cambios en el header (por si cambia de tamaño)
    const observer = new ResizeObserver(actualizarPosicionMenu);
    observer.observe(header);
}

// ===== 1. CONFIGURAR NAVEGACIÓN COMPLETA =====
function configurarNavegacion() {
    // Seleccionar todos los elementos navegables
    const elementosNavegables = document.querySelectorAll(
        '.menu-link, .submenu a, .modelo-card, .footer-links a'
    );
    
    elementosNavegables.forEach(elemento => {
        elemento.addEventListener('click', function(evento) {
            evento.preventDefault();
            evento.stopPropagation(); // Evitar que se propague a otros manejadores
            
            let paginaId = obtenerIdPagina(this);
            
            if (paginaId) {
                console.log('Navegando a:', paginaId);
                mostrarPagina(paginaId);
                
                // Cerrar menú móvil si está abierto
                if (window.innerWidth <= 768 && menuAbierto) {
                    toggleMenuMovil();
                }
            } else {
                console.warn('No se pudo obtener el ID de la página para:', this);
            }
        });
    });
}

function obtenerIdPagina(elemento) {
    // Si es una tarjeta de modelo rápido
    if (elemento.classList.contains('modelo-card')) {
        return obtenerPaginaPorTarjeta(elemento);
    }
    
    // Si tiene data-content
    if (elemento.hasAttribute('data-content')) {
        return elemento.getAttribute('data-content');
    }
    
    // Buscar data-content en el elemento padre (li.menu-item)
    const menuItem = elemento.closest('.menu-item');
    if (menuItem && menuItem.hasAttribute('data-content')) {
        const dataContent = menuItem.getAttribute('data-content');
        // Si es un item con submenú y se hace clic en el enlace principal, ir a la primera opción del submenú
        if (menuItem.classList.contains('has-submenu') && elemento.classList.contains('menu-link')) {
            const primerSubmenu = menuItem.querySelector('.submenu a');
            if (primerSubmenu && primerSubmenu.hasAttribute('data-content')) {
                return primerSubmenu.getAttribute('data-content');
            }
        }
        return dataContent;
    }
    
    // Si tiene onclick con mostrarPagina (extraer argumento)
    const onclickAttr = elemento.getAttribute('onclick');
    if (onclickAttr && onclickAttr.includes('mostrarPagina')) {
        const match = onclickAttr.match(/mostrarPagina\('([^']+)'\)/);
        if (match) return match[1];
    }
    
    // Intentar obtener del href
    const href = elemento.getAttribute('href');
    if (href && href.startsWith('#')) {
        return href.substring(1);
    }
    
    return null;
}

function obtenerPaginaPorTarjeta(tarjeta) {
    const titulo = tarjeta.querySelector('h5')?.textContent.toLowerCase() || '';
    
    if (titulo.includes('ambiental')) return 'ambiental-proposito';
    if (titulo.includes('dfd')) return 'comportamiento-dfd1';
    if (titulo.includes('uso')) return 'oo-casos-negocio';
    if (titulo.includes('diagrama')) return 'estructurado-nivel0';
    
    return 'inicio';
}

// ===== 2. CONFIGURAR LOGO CON OVERLAY =====
function configurarLogo() {
    const logo = document.getElementById('logo');
    const overlay = document.getElementById('logoOverlay');
    const btnCerrar = document.getElementById('closeOverlay');
    
    if (!logo || !overlay || !btnCerrar) return;
    
    // Abrir overlay al hacer clic en el logo
    logo.addEventListener('click', abrirOverlayLogo);
    
    // Cerrar overlay con botón X
    btnCerrar.addEventListener('click', cerrarOverlayLogo);
    
    // Cerrar overlay al hacer clic fuera
    overlay.addEventListener('click', function(evento) {
        if (evento.target === overlay) {
            cerrarOverlayLogo();
        }
    });
    
    // Cerrar overlay con tecla ESC
    document.addEventListener('keydown', function(evento) {
        if (evento.key === 'Escape' && overlay.classList.contains('active')) {
            cerrarOverlayLogo();
        }
    });
}

function abrirOverlayLogo() {
    const overlay = document.getElementById('logoOverlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    }
}

function cerrarOverlayLogo() {
    const overlay = document.getElementById('logoOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
}

// ===== 3. CONFIGURAR MENÚ MÓVIL AVANZADO =====
function configurarMenuMovil() {
    const btnMenu = document.getElementById('mobileMenuBtn');
    const menu = document.querySelector('.menu');
    
    if (!btnMenu || !menu) return;
    
    btnMenu.addEventListener('click', toggleMenuMovil);
    
    // Cerrar menú al hacer clic en un enlace
    menu.addEventListener('click', function(evento) {
        if (window.innerWidth <= 768 && evento.target.closest('a')) {
            // Pequeño delay para ver la transición
            setTimeout(toggleMenuMovil, 300);
        }
    });
    
    // Cerrar menú al cambiar tamaño de ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && menuAbierto) {
            toggleMenuMovil();
        }
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(evento) {
        if (menuAbierto && 
            !menu.contains(evento.target) && 
            evento.target !== btnMenu &&
            !evento.target.closest('#mobileMenuBtn')) {
            toggleMenuMovil();
        }
    });
}

function toggleMenuMovil() {
    const btnMenu = document.getElementById('mobileMenuBtn');
    const menu = document.querySelector('.menu');
    
    if (!btnMenu || !menu) return;
    
    menuAbierto = !menuAbierto;
    
    if (menuAbierto) {
        // Abrir menú
        menu.classList.add('active');
        btnMenu.innerHTML = '<i class="fas fa-times"></i>';
        btnMenu.classList.add('activo');
        btnMenu.setAttribute('aria-expanded', 'true');
        
        // Bloquear scroll del body
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    } else {
        // Cerrar menú
        menu.classList.remove('active');
        btnMenu.innerHTML = '<i class="fas fa-bars"></i>';
        btnMenu.classList.remove('activo');
        btnMenu.setAttribute('aria-expanded', 'false');
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Cerrar todos los submenús
        document.querySelectorAll('.has-submenu.activo').forEach(item => {
            item.classList.remove('activo');
            const submenu = item.querySelector('.submenu');
            if (submenu) {
                submenu.style.maxHeight = '0';
            }
        });
    }
}

// ===== 4. CONFIGURAR SUBMENÚS PARA DESKTOP =====
function configurarSubmenusDesktop() {
    const itemsConSubmenu = document.querySelectorAll('.has-submenu');
    
    itemsConSubmenu.forEach(item => {
        const enlacePrincipal = item.querySelector('.menu-link');
        const submenu = item.querySelector('.submenu');
        
        if (!enlacePrincipal || !submenu) return;
        
        // Para desktop: hover
        if (window.innerWidth > 768) {
            item.addEventListener('mouseenter', function() {
                submenu.style.opacity = '1';
                submenu.style.visibility = 'visible';
                submenu.style.transform = 'translateY(0)';
            });
            
            item.addEventListener('mouseleave', function() {
                submenu.style.opacity = '0';
                submenu.style.visibility = 'hidden';
                submenu.style.transform = 'translateY(10px)';
            });
        }
        
        // Para móvil: click
        enlacePrincipal.addEventListener('click', function(evento) {
            if (window.innerWidth <= 768) {
                evento.preventDefault();
                evento.stopPropagation();
                
                const estaActivo = item.classList.contains('activo');
                
                // Cerrar otros submenús
                document.querySelectorAll('.has-submenu').forEach(otroItem => {
                    if (otroItem !== item) {
                        otroItem.classList.remove('activo');
                        const otroSubmenu = otroItem.querySelector('.submenu');
                        if (otroSubmenu) {
                            otroSubmenu.style.maxHeight = '0';
                        }
                    }
                });
                
                // Alternar submenú actual
                if (estaActivo) {
                    submenu.style.maxHeight = '0';
                    item.classList.remove('activo');
                } else {
                    submenu.style.maxHeight = submenu.scrollHeight + 'px';
                    item.classList.add('activo');
                }
            }
        });
    });
}

// ===== 5. CONFIGURAR TOOLTIPS =====
function configurarTooltips() {
    const itemsMenu = document.querySelectorAll('.menu-item');
    
    itemsMenu.forEach(item => {
        const tooltip = item.querySelector('.tooltip-arriba');
        if (!tooltip) return;
        
        item.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
                tooltip.style.transform = 'translateX(-50%) translateY(0)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
            tooltip.style.transform = 'translateX(-50%) translateY(-5px)';
        });
    });
}

// ===== 6. CONFIGURAR BOTONES =====
function configurarBotones() {
    // Botones con efecto de clic
    const botonesInteractivos = document.querySelectorAll('.btn, .modelo-card, .cta-header');
    
    botonesInteractivos.forEach(boton => {
        boton.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        boton.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        boton.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Botón de información en header
    const ctaHeader = document.querySelector('.cta-header');
    if (ctaHeader) {
        ctaHeader.addEventListener('click', mostrarContacto);
    }
}

// ===== 7. FUNCIÓN PRINCIPAL PARA MOSTRAR PÁGINAS =====
function mostrarPagina(idPagina) {
    // Validar que la página exista
    if (!document.getElementById(idPagina)) {
        console.warn(`⚠️ Página "${idPagina}" no encontrada. Redirigiendo a inicio.`);
        idPagina = 'inicio';
    }
    
    // Ocultar todas las páginas
    document.querySelectorAll('.contenido-pagina').forEach(pag => {
        pag.classList.remove('active');
    });
    
    // Mostrar la página solicitada
    const paginaAMostrar = document.getElementById(idPagina);
    if (paginaAMostrar) {
        paginaAMostrar.classList.add('active');
        paginaActual = idPagina;
        
        // Actualizar estado del menú
        actualizarMenuActivo(idPagina);
        
        // Actualizar URL sin recargar (para compatibilidad)
        actualizarURL(idPagina);
        
        // Scroll suave a la sección, teniendo en cuenta el header y menú fijos
        setTimeout(() => {
            const header = document.querySelector('.header');
            const menu = document.querySelector('.menu');
            const headerHeight = header ? header.offsetHeight : 100;
            const menuHeight = (menu && window.innerWidth > 768) ? menu.offsetHeight : 0;
            const offset = headerHeight + menuHeight;
            
            window.scrollTo({
                top: offset,
                behavior: 'smooth'
            });
        }, 100);
        
        console.log(`📄 Página activa: ${idPagina}`);
    }
}

// ===== 8. ACTUALIZAR MENÚ ACTIVO =====
function actualizarMenuActivo(idPagina) {
    // Remover clase active de todos los items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Buscar el item correspondiente
    let itemMenu = buscarItemPorPagina(idPagina);
    
    // Activar el item encontrado
    if (itemMenu) {
        itemMenu.classList.add('active');
        
        // También activar el padre si está en un submenú
        const itemPadre = itemMenu.closest('.has-submenu');
        if (itemPadre) {
            itemPadre.classList.add('activo');
        }
    }
}

function buscarItemPorPagina(idPagina) {
    // Buscar por data-content exacto
    let enlaceExacto = document.querySelector(`[data-content="${idPagina}"]`);
    if (enlaceExacto) {
        return enlaceExacto.closest('.menu-item');
    }
    
    // Buscar por coincidencia parcial (para subpáginas)
    const todosEnlaces = document.querySelectorAll('[data-content]');
    for (let enlace of todosEnlaces) {
        const contenido = enlace.getAttribute('data-content');
        
        // Ejemplo: si idPagina es "ambiental-contexto" y contenido es "ambiental"
        if (idPagina.includes(contenido) || contenido.includes(idPagina)) {
            const item = enlace.closest('.menu-item');
            if (item) return item;
        }
    }
    
    // Buscar por texto del enlace (fallback)
    const enlacesTexto = document.querySelectorAll('.menu-link');
    for (let enlace of enlacesTexto) {
        const texto = enlace.textContent.trim().toLowerCase();
        const pagina = idPagina.toLowerCase();
        
        if (texto.includes(pagina) || pagina.includes(texto.replace(' ', '-'))) {
            return enlace.closest('.menu-item');
        }
    }
    
    return null;
}

// ===== 9. FUNCIÓN DE CONTACTO MEJORADA =====
function mostrarContacto() {
    // Mostrar página de contactos
    mostrarPagina('contactos');
    
    // Mostrar modal de contacto (puedes implementar un modal más adelante)
    setTimeout(() => {
        const infoContacto = `
        🏢 UNIDAD DE ADMINISTRACIÓN POLICIAL LA PAZ
        
        📍 Dirección: Av. Principal #123, La Paz, Bolivia
        📞 Teléfono: +591 2 1234567
        📧 Email: contacto@sistemaalmacen.bo
        ⏰ Horario: Lunes a Viernes 8:00 - 18:00
        
        📞 Soporte Técnico: +591 2 7654321
        📧 Email Soporte: soporte@sistemaalmacen.bo
        `;
        
        // Usar console para no interrumpir con alertas
        console.log('📞 Información de Contacto:\n' + infoContacto);
        
        // Opcional: mostrar alerta (comentar si no quieres alertas)
        alert('📞 INFORMACIÓN DE CONTACTO\n\n' + infoContacto);
    }, 100);
}

// ===== 10. FUNCIONALIDADES ADICIONALES =====

// Actualizar URL sin recargar
function actualizarURL(idPagina) {
    if (history.pushState) {
        const nuevaURL = window.location.pathname + '#' + idPagina;
        window.history.pushState({pagina: idPagina}, '', nuevaURL);
    }
}

// Manejar navegación con botones atrás/adelante
window.addEventListener('popstate', function(evento) {
    if (evento.state && evento.state.pagina) {
        mostrarPagina(evento.state.pagina);
    } else {
        // Si no hay estado, mostrar la página del hash
        const hash = window.location.hash.substring(1);
        if (hash) {
            mostrarPagina(hash);
        } else {
            mostrarPagina('inicio');
        }
    }
});

// Detectar tecla ESC para cerrar elementos
document.addEventListener('keydown', function(evento) {
    if (evento.key === 'Escape') {
        // Cerrar overlay del logo
        const overlay = document.getElementById('logoOverlay');
        if (overlay && overlay.classList.contains('active')) {
            cerrarOverlayLogo();
        }
        
        // Cerrar menú móvil
        if (window.innerWidth <= 768 && menuAbierto) {
            toggleMenuMovil();
        }
    }
});

// Detectar hash en la URL al cargar
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1);
    if (hash && hash !== paginaActual) {
        mostrarPagina(hash);
    }
});

// Inicializar hash si existe
if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    if (hash) {
        setTimeout(() => mostrarPagina(hash), 100);
    }
}

// ===== 11. EXPORTAR FUNCIONES GLOBALES =====
window.mostrarPagina = mostrarPagina;
window.mostrarContacto = mostrarContacto;
window.toggleMenuMovil = toggleMenuMovil;

// ===== 12. MEJORAS DE PERFORMANCE =====
// Debounce para eventos resize
window.addEventListener('resize', function() {
    clearTimeout(timeoutResize);
    timeoutResize = setTimeout(function() {
        // Reconfigurar submenús si cambia el tamaño
        if (window.innerWidth > 768) {
            document.querySelectorAll('.has-submenu .submenu').forEach(submenu => {
                submenu.style.maxHeight = '';
                submenu.style.opacity = '';
                submenu.style.visibility = '';
                submenu.style.transform = '';
            });
        }
    }, 250);
});

console.log('✨ Script mejorado cargado correctamente');