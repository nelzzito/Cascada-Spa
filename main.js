(function() {
    // 1. CONFIGURACIÓN DE CONEXIÓN A BASE DE DATOS
    const url = 'https://gdcilptihuoojbwrlbbh.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkY2lscHRpaHVvb2pid3JsYmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mzc2NjMsImV4cCI6MjA4NzExMzY2M30.zzdm7zVlFV3T-ANcIWE4FR_JSPC-naSuiMnpgZ5ea9A';
    const sb = window.supabase.createClient(url, key);

    // 2. CARGA DE SEDES (PANTALLA INICIAL CON ANIMACIONES)
    async function cargarSedes() {
        const lista = document.getElementById('lista-sedes');
        if (!lista) return;
        
        const { data: sedes, error } = await sb.from('sedes').select('*');
        if (error) return console.error("Error crítico al conectar con sedes:", error.message);
        
        lista.innerHTML = ''; 
        sedes.forEach(sede => {
            const btn = document.createElement('button');
            btn.className = "fade-in bg-teal-600 text-white p-5 rounded-2xl shadow-md hover:bg-teal-700 active:scale-95 transition-all text-lg font-bold flex justify-between items-center mb-4 w-full";
            btn.innerHTML = `<span>${sede.nombre}</span><span>→</span>`;
            btn.onclick = () => mostrarMenuPrincipal(sede);
            lista.appendChild(btn);
        });

        // --- ADICIÓN SOLICITADA: BOTÓN DE ACCESO ADMIN ---
        const btnAdmin = document.createElement('button');
        btnAdmin.className = "mt-12 w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all italic";
        btnAdmin.innerText = "🔒 Acceso Administrativo";
        btnAdmin.onclick = () => window.panelAdmin();
        lista.appendChild(btnAdmin);
    }
// --- 9. PANEL ADMINISTRATIVO CORREGIDO Y OPTIMIZADO ---
window.sedeFiltroActual = 'TODAS'; // Variable para recordar el filtro activo

window.panelAdmin = async function() {
    const pass = prompt("Clave de Acceso Administrativo:");
    if (pass !== "2025") return alert("Acceso Denegado"); 

    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="fade-in p-4 max-w-5xl mx-auto">
            <div class="text-center mb-6">
                <h2 class="text-2xl font-black text-slate-800 uppercase italic leading-none">REPORTE DE CITAS</h2>
                <p class="text-[9px] text-teal-600 font-black uppercase tracking-[0.3em] mt-1 italic">Gestión Central</p>
            </div>

            <div class="flex justify-between items-center mb-8 px-4">
                <span onclick="window.location.reload()" class="text-slate-400 hover:text-[#1e293b] font-black italic text-[10px] uppercase cursor-pointer transition-all tracking-widest">
                    ← MENÚ
                </span>
                
                <div class="flex gap-2">
                    <button onclick="window.seccionGestionarPromos()" 
                        class="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-md hover:bg-purple-700 transition-all flex items-center gap-2">
                        🎁 PROMOS
                    </button>

                    <button onclick="window.exportarExcel()" 
                        class="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2">
                        📊 EXCEL
                    </button>
                </div>
            </div>

            <div id="filtros-admin" class="flex flex-wrap justify-center gap-2 mb-8 max-w-xl mx-auto">
                <button id="btn-todas-admin" onclick="window.filtrarAdmin('TODAS', this)" 
                    style="background-color: #1e293b; color: white; border: 2px solid #1e293b;"
                    class="py-2 px-6 rounded-xl text-[9px] font-black uppercase shadow-md transition-all">
                    TODAS
                </button>
            </div>

            <div class="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div class="grid grid-cols-4 gap-2 px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <span class="text-[10px] font-black text-slate-400 uppercase italic">Sede</span>
                    <span class="text-[10px] font-black text-slate-400 uppercase italic text-center">Fecha / Hora</span>
                    <span class="text-[10px] font-black text-slate-400 uppercase italic">Paciente</span>
                    <span class="text-[10px] font-black text-slate-400 uppercase italic text-right">Acción</span>
                </div>
                
                <div id="contenedor-admin">
                    <p class="animate-pulse text-slate-300 font-bold italic text-xs py-20 text-center uppercase tracking-widest">Cargando registros...</p>
                </div>
            </div>
        </div>`;

    // Cargar botones de sedes dinámicamente
    const { data: sedes } = await sb.from('sedes').select('*');
    const filtros = document.getElementById('filtros-admin');
    
    sedes?.forEach(s => {
        const b = document.createElement('button');
        b.style.backgroundColor = "white";
        b.style.color = "#1e293b";
        b.style.border = "2px solid #f1f5f9";
        b.className = "py-2 px-6 rounded-xl text-[9px] font-black uppercase transition-all shadow-sm";
        b.innerText = s.nombre;
        b.onclick = (e) => window.filtrarAdmin(s.nombre, e.currentTarget);
        filtros.appendChild(b);
    });

    window.renderizarCitasAdmin('TODAS');
};


// Función de filtrado para que los botones funcionen
window.filtrarAdmin = function(sede, btn) {
    window.sedeFiltroActual = sede;
    const botones = document.querySelectorAll('#filtros-admin button');
    botones.forEach(b => {
        b.style.backgroundColor = "white";
        b.style.color = "#1e293b";
        b.style.border = "2px solid #f1f5f9";
    });
    btn.style.backgroundColor = "#1e293b";
    btn.style.color = "white";
    btn.style.border = "2px solid #1e293b";
    window.renderizarCitasAdmin(sede);
};

window.mostrarSeccionPromociones = async function(idSedeRecibida, nombreSedeRecibida) {
    const main = document.getElementById('main-content');
    
    // Si no llegan por parámetro, intentamos rescatar (pero priorizamos el parámetro)
    const sId = idSedeRecibida || window.sedeSeleccionada?.id;
    const sNom = nombreSedeRecibida || window.sedeSeleccionada?.nombre;

    main.innerHTML = `<p class="text-center italic animate-pulse py-10 uppercase text-[10px] font-black">Cargando...</p>`;

    try {
        const { data: promos, error } = await sb.from('promociones').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        let html = `
            <div class="fade-in p-4">
                <button onclick="window.location.reload()" class="text-teal-600 text-[10px] font-black italic uppercase mb-4">← Volver</button>
                <h2 class="text-2xl font-black text-slate-800 uppercase italic mb-1 text-center">Promociones</h2>
                <p class="text-teal-600 text-[9px] font-black uppercase text-center mb-6 italic">Sede: ${sNom}</p>
                <div class="space-y-4">
        `;

        promos.forEach(p => {
            const servicioObj = { id: p.id, nombre: p.titulo, citas_incluidas: 1 };
            const servicioJson = JSON.stringify(servicioObj).replace(/"/g, '&quot;');

            html += `
                <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <div class="flex-1">
                        <h3 class="font-black italic text-slate-800 uppercase text-sm">${p.titulo}</h3>
                        <p class="text-slate-500 text-[10px] italic mt-1">${p.descripcion || ''}</p>
                    </div>
                    <button onclick="window.mostrarFormularioRegistro(${servicioJson}, '${sId}', '${sNom}')" 
                            class="ml-4 bg-teal-600 text-white font-black italic px-6 py-2 rounded-full text-[10px] uppercase shadow-md">
                        ELEGIR
                    </button>
                </div>`;
        });

        html += `</div>
                <div id="modulo-registro" class="hidden mt-6"></div>
                <div id="lista-final" class="hidden"></div> 
            </div>`;

        main.innerHTML = html;
    } catch (err) {
        main.innerHTML = `<p class="text-center text-red-500 font-bold italic uppercase text-xs">Error de conexión.</p>`;
    }
};
window.renderizarCitasAdmin = async function(filtroSede = 'TODAS') {
    const cont = document.getElementById('contenedor-admin');
    const panelPadre = cont.parentElement; 
    const esTodas = filtroSede === 'TODAS';

    const { data: citas, error } = await sb.from('citas')
        .select('*, clientes(nombre, telefono, identificacion), sedes(nombre)')
        .order('fecha_hora', { ascending: true });
        
    if (error) {
        cont.innerHTML = `<div class="p-10 text-center text-red-500 font-bold">ERROR AL CARGAR DATOS</div>`;
        return;
    }

    const filtradas = filtroSede === 'TODAS' ? citas : citas.filter(c => c.sedes?.nombre === filtroSede);

    // 1. RE-GENERAR CABECERA DINÁMICA
    const cabeceraExistente = panelPadre.querySelector('.grid');
    if (cabeceraExistente) cabeceraExistente.remove();

    const nuevoHeader = document.createElement('div');
    nuevoHeader.className = esTodas 
        ? "grid grid-cols-4 gap-2 px-6 py-4 bg-slate-50 border-b border-slate-100" 
        : "grid grid-cols-3 gap-2 px-6 py-4 bg-slate-50 border-b border-slate-100";
    
    nuevoHeader.innerHTML = `
        ${esTodas ? '<span class="text-[10px] font-black text-slate-400 uppercase italic">Sede</span>' : ''}
        <span class="text-[10px] font-black text-slate-400 uppercase italic text-center">Fecha / Hora</span>
        <span class="text-[10px] font-black text-slate-400 uppercase italic">Paciente</span>
        <span class="text-[10px] font-black text-slate-400 uppercase italic text-right">Acción</span>
    `;
    panelPadre.insertBefore(nuevoHeader, cont);

    // 2. RENDERIZAR FILAS
    cont.innerHTML = ''; 

    if (filtradas.length === 0) {
        cont.innerHTML = `<div class="p-10 text-center uppercase text-[10px] font-bold text-slate-400 italic">Sin registros</div>`;
        return;
    }

    // --- CORRECCIÓN DE FECHA (Lógica de Hoy) ---
    const hoyCeroHoras = new Date();
    hoyCeroHoras.setHours(0, 0, 0, 0); // Solo nos importa el día, no la hora
    
    filtradas.forEach(c => {
        const f = new Date(c.fecha_hora);
        const fechaCitaCeroHoras = new Date(c.fecha_hora);
        fechaCitaCeroHoras.setHours(0, 0, 0, 0);

       const ahora = new Date();
const fechaCitaReal = new Date(c.fecha_hora); // Usamos la fecha exacta con hora

let estadoFinal = (c.estado || 'ACTIVO').toUpperCase();

// Si la cita está ACTIVA pero la hora ya pasó hoy, se marca como FINALIZADO
if (estadoFinal === 'ACTIVO' && fechaCitaReal < ahora) {
    estadoFinal = 'FINALIZADO';
}

        let accionHtml = "";
        if (estadoFinal === "FINALIZADO") {
            accionHtml = `<span style="color: #059669;" class="font-black text-[10px] uppercase italic tracking-tighter">● FINALIZADO</span>`;
        } else if (estadoFinal === "CANCELADO") {
            accionHtml = `<span style="color: #ef4444;" class="font-black text-[10px] uppercase italic tracking-tighter">✕ CANCELADO</span>`;
        } else {
            // Botón corregido: enviamos el ID y la fecha para validar la regla de 1 hora después
            accionHtml = `
                <button onclick="window.cambiarEstadoCita('${c.id}', '${c.fecha_hora}')" 
                    style="background-color: #facc15; color: #713f12; border: none;"
                    class="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase shadow-sm active:scale-95 transition-all">
                    CANCELAR
                </button>`;
        }

        let sedeCorto = (c.sedes?.nombre || '').toUpperCase().includes("VALLE") ? "VALLE" : "QUITO";

        const div = document.createElement('div');
        div.className = esTodas 
            ? "grid grid-cols-4 gap-2 px-6 py-4 items-center hover:bg-slate-50 border-b border-slate-50"
            : "grid grid-cols-3 gap-2 px-6 py-4 items-center hover:bg-slate-50 border-b border-slate-50";

// Dentro de window.renderizarCitasAdmin, en el filtradas.forEach:
div.innerHTML = `
    ${esTodas ? `<div class="text-[10px] font-black text-teal-600 uppercase italic tracking-widest ex-sede">${sedeCorto}</div>` : `<span class="hidden ex-sede">${filtroSede}</span>`}
    <div class="text-[11px] font-bold text-slate-700 text-center">
        <span class="ex-fecha">${f.toLocaleDateString()}</span> <br>
        <span class="text-slate-400 italic text-[10px] ex-hora">${f.getUTCHours().toString().padStart(2, '0')}:00</span>
    </div>
    <div class="flex flex-col">
        <span class="font-black text-[11px] uppercase text-slate-800 tracking-tight leading-none ex-paciente">${c.clientes?.nombre || 'N/A'}</span>
        <span class="text-[9px] text-slate-400 font-medium">${c.clientes?.identificacion || ''}</span>
    </div>
    <div class="text-right">
        ${accionHtml}
    </div>
    <span class="hidden ex-id">${c.clientes?.identificacion || '---'}</span>
    <span class="hidden ex-tel">${c.clientes?.telefono || '---'}</span>
    <span class="hidden ex-est">${estadoFinal}</span>
`;
        cont.appendChild(div);
    });
};

// SOLUCIÓN PARA EL ADMINISTRADOR
window.cambiarEstadoCita = async function(id, fechaHora) {
    // Llamamos a la función maestra. 
    // Pasamos null en clienteId y saldo porque el admin no los necesita para refrescar su tabla.
    await window.cancelarCita(id, fechaHora, null, null);
};

window.exportarExcel = function() {
    // 1. Selección del contenedor según tu estructura original
    const contenedor = document.getElementById('contenedor-admin');
    if (!contenedor) return;

    // Buscamos las filas de datos reales
    const filas = Array.from(contenedor.querySelectorAll('div.grid')).filter(f => f.querySelector('.ex-id'));
    if (filas.length === 0) return alert("No hay datos para exportar");

    const fechaHoy = new Date().toLocaleDateString();
    
    // 2. Construcción de la tabla con el formato de la IMAGEN 2
    let excelTemplate = `<html><head><meta charset="UTF-8">
        <style>
            .header-principal { background: #0d9488; color: white; font-family: sans-serif; font-size: 14pt; font-weight: bold; text-align: center; }
            .sub-info { font-family: sans-serif; font-size: 9pt; text-align: center; color: #334155; }
            .col-header { background: #ffffff; color: #000000; font-family: sans-serif; font-size: 10pt; font-weight: bold; border: 0.5pt solid #000000; text-align: center; }
            .celda { border: 0.5pt solid #000000; font-family: sans-serif; font-size: 10pt; padding: 4px; }
            .footer-text { font-family: sans-serif; font-size: 8pt; color: #475569; font-style: italic; }
        </style>
    </head><body>
    <table>
        <tr><td colspan="7" class="header-principal">REPORTE DE CITAS - CASCADA SPA</td></tr>
        <tr><td colspan="7" class="sub-info">Fecha: ${fechaHoy}</td></tr>
        <tr><td colspan="7"></td></tr>

        <tr>
            <th class="col-header" style="width: 80pt;">SEDE</th>
            <th class="col-header" style="width: 80pt;">FECHA</th>
            <th class="col-header" style="width: 60pt;">HORA</th>
            <th class="col-header" style="width: 180pt;">PACIENTE</th>
            <th class="col-header" style="width: 100pt;">ID/CEDULA</th>
            <th class="col-header" style="width: 100pt;">TELEFONO</th>
            <th class="col-header" style="width: 90pt;">ESTADO</th>
        </tr>`;
    
    // 3. Extracción de datos respetando tus clases (ex-sede, ex-id, etc.)
    filas.forEach(f => {
        const sede = f.querySelector('.ex-sede')?.innerText || "";
        
        // Manejo de Fecha y Hora (asumiendo que están en el segundo hijo)
        const fechaHoraBloque = f.children[1]?.innerText || "";
        const partes = fechaHoraBloque.split('\n');
        const fecha = partes[0] ? partes[0].trim() : "";
        const hora = partes[1] ? partes[1].trim() : "";
        
        // Captura de nombre (clase exacta de tu sistema)
        const paciente = f.querySelector('.font-black.text\\[11px\\]')?.innerText || 
                         f.querySelector('.font-black')?.innerText || "";
        
        const cedula = f.querySelector('.ex-id')?.innerText || "";
        const telefono = f.querySelector('.ex-tel')?.innerText || "";
        const estado = f.querySelector('.ex-est')?.innerText || "";

        excelTemplate += `<tr>
            <td class="celda">${sede.toUpperCase()}</td>
            <td class="celda" style="text-align:center;">${fecha}</td>
            <td class="celda" style="text-align:center;">${hora}</td>
            <td class="celda">${paciente}</td>
            <td class="celda" style="text-align:center;">${cedula}</td>
            <td class="celda" style="text-align:center;">${telefono}</td>
            <td class="celda" style="font-weight:bold; text-align:center;">${estado}</td>
        </tr>`;
    });

    // 4. Pie de reporte
    excelTemplate += `
        <tr><td colspan="7"></td></tr>
        <tr><td colspan="7" class="footer-text">REPORTE GENERADO EL: ${new Date().toLocaleString()}</td></tr>
        <tr><td colspan="7" class="footer-text">EMITIDO POR: SISTEMA ADMINISTRATIVO CASCADA SPA</td></tr>
    </table></body></html>`;

    // 5. Descarga
    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Reporte_Citas_Cascada.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

window.seccionGestionarPromos = async function() {
    const contenedor = document.getElementById('contenedor-admin'); // O el ID de tu contenedor principal admin
    if (!contenedor) return;

    // Dibujamos la interfaz de gestión
    contenedor.innerHTML = `
        <div class="p-4 fade-in">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-black italic uppercase text-slate-800">Gestionar Promociones</h2>
                <button onclick="window.panelAdmin()" class="text-[10px] font-bold text-slate-400 uppercase italic">← Volver al Reporte</button>
            </div>

            <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg mb-8">
                <p class="text-[10px] font-black uppercase text-teal-600 mb-4 italic">Crear Nueva Promoción</p>
                <div class="space-y-4">
                    <input type="text" id="promo-titulo" placeholder="Título de la Promo (ej: 2x1 en Masajes)" 
                        class="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-500 transition-all">
                    <textarea id="promo-desc" placeholder="Descripción breve..." 
                        class="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal-500 transition-all h-20"></textarea>
                    <button onclick="window.guardarPromocion()" 
                        class="w-full bg-teal-600 text-white p-3 rounded-xl font-bold uppercase italic text-xs shadow-md active:scale-95 transition-all">
                        🚀 Publicar Promoción
                    </button>
                </div>
            </div>

            <div id="lista-promos-admin" class="space-y-3">
                <p class="text-center text-slate-400 italic text-xs animate-pulse">Cargando promociones...</p>
            </div>
        </div>
    `;

    // Cargamos las promos existentes inmediatamente
    await window.renderizarPromosAdmin();
};

// FUNCIÓN PARA RENDERIZAR LA LISTA EN EL ADMIN
window.renderizarPromosAdmin = async function() {
    const lista = document.getElementById('lista-promos-admin');
    const { data: promos } = await sb.from('promociones').select('*').order('created_at', { ascending: false });

    if (!promos || promos.length === 0) {
        lista.innerHTML = '<p class="text-center text-slate-300 italic text-xs py-4">No hay promociones activas.</p>';
        return;
    }

    lista.innerHTML = promos.map(p => `
        <div class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
                <p class="font-bold text-slate-800 text-sm uppercase italic">${p.titulo}</p>
                <p class="text-[10px] text-slate-500">${p.descripcion || ''}</p>
            </div>
            <button onclick="window.eliminarPromocion('${p.id}')" 
                class="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase italic border border-red-100">
                Eliminar
            </button>
        </div>
    `).join('');
};

// 1. FUNCIÓN PARA GUARDAR LA PROMO
window.guardarPromocion = async function() {
    const titulo = document.getElementById('promo-titulo').value.trim();
    const descripcion = document.getElementById('promo-desc').value.trim();

    if (!titulo) return alert("⚠️ El título es obligatorio.");

    try {
        const { error } = await sb.from('promociones').insert([{ 
            titulo: titulo, 
            descripcion: descripcion 
        }]);

        if (error) throw error;

        alert("✅ Promoción publicada con éxito.");
        
        // Limpiamos los campos
        document.getElementById('promo-titulo').value = '';
        document.getElementById('promo-desc').value = '';

        // Refrescamos la lista de promociones en el panel admin
        await window.renderizarPromosAdmin();
        
    } catch (err) {
        console.error("Error al guardar promo:", err);
        alert("No se pudo guardar la promoción.");
    }
};

// 2. FUNCIÓN PARA ELIMINAR LA PROMO
window.eliminarPromocion = async function(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar esta promoción?")) return;

    try {
        const { error } = await sb.from('promociones').delete().eq('id', id);

        if (error) throw error;

        alert("✅ Promoción eliminada.");
        
        // Refrescamos la lista para ver el cambio
        await window.renderizarPromosAdmin();
        
    } catch (err) {
        console.error("Error al eliminar promo:", err);
        alert("No se pudo eliminar.");
    }
};



 // 3. MENÚ PRINCIPAL (VERSIÓN COMPACTA Y PROFESIONAL)
    function mostrarMenuPrincipal(sede) {
        const main = document.getElementById('main-content');
        main.innerHTML = `
            <div class="fade-in p-2 text-center max-w-sm mx-auto">
                <button onclick="window.location.reload()" class="text-teal-600 font-black mb-2 flex items-center italic text-[9px] hover:opacity-70 transition-all">
                    ← INICIO
                </button>
                
                <h2 class="text-lg font-black text-slate-800 mb-0 italic uppercase leading-none">${sede.nombre}</h2>
                <p class="text-slate-400 mb-4 text-[8px] tracking-[0.2em] uppercase italic font-bold">Seleccione Atención</p>
                
                <div class="grid grid-cols-1 gap-2">
                    
                    <button onclick="window.verServicios('${sede.id}', 'unico', '${sede.nombre}')" class="bg-white border-2 border-teal-500 p-3 rounded-2xl shadow-sm active:scale-95 transition-all text-left flex items-center gap-3">
                        <div class="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black italic text-sm shadow-sm">1</div>
                        <div class="flex-1">
                            <div class="text-teal-600 font-black text-[13px] italic uppercase leading-none">CLIENTE NUEVO</div>
                            <p class="text-slate-500 text-[9px] italic font-medium leading-tight mt-0.5">Evaluación y registro inicial</p>
                        </div>
                    </button>

                    <button onclick="window.iniciarSeguimiento('${sede.id}', '${sede.nombre}')" class="bg-white border-2 border-slate-200 p-3 rounded-2xl shadow-sm active:scale-95 transition-all text-left flex items-center gap-3">
                        <div class="bg-slate-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-black italic text-sm shadow-sm">2</div>
                        <div class="flex-1">
                            <div class="text-slate-800 font-black text-[13px] italic uppercase leading-none">SEGUIMIENTO</div>
                            <p class="text-slate-500 text-[9px] italic font-medium leading-tight mt-0.5">Controles y citas agendadas</p>
                        </div>
                    </button>

  <button onclick="window.mostrarSeccionPromociones('${sede.id}', '${sede.nombre}')" 
        class="bg-white border-2 border-orange-400 p-3 rounded-2xl shadow-sm active:scale-95 transition-all text-left flex items-center gap-3">
    <div class="bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-black italic text-sm shadow-sm">3</div>
    <div class="flex-1">
        <div class="text-orange-600 font-black text-[13px] italic uppercase leading-none">PROMOCIONES</div>
        <p class="text-slate-500 text-[9px] italic font-medium leading-tight mt-0.5">Ofertas y horarios especiales</p>
    </div>
</button>

                </div>
            </div>
        `;
    }
// 4. LISTADO DE SERVICIOS (VERSION COMPACTA Y SEGURA)
    window.verServicios = async function(sedeId, tipoElegido, nombreSede) {
        const main = document.getElementById('main-content');
        main.innerHTML = `<p class="text-center py-10 animate-pulse text-slate-400 italic font-bold text-xs uppercase">Consultando servicios...</p>`;
        
        const { data: servicios, error } = await sb.from('servicios')
            .select('*')
            .eq('sede_id', sedeId)
            .eq('tipo', tipoElegido);
        
        main.innerHTML = `
            <div class="fade-in p-4 max-w-sm mx-auto">
                <button onclick="window.location.reload()" class="text-teal-600 font-black mb-3 italic text-[10px] flex items-center">← VOLVER AL MENÚ</button>
                
                <h3 class="text-lg font-black text-slate-800 mb-0 uppercase italic leading-none">
                    ${tipoElegido === 'unico' ? 'Servicios' : 'Promociones'}
                </h3>
                <p class="text-teal-600 text-[8px] mb-4 uppercase font-black tracking-[0.2em] italic border-b border-teal-100 pb-2">
                    Sede: ${nombreSede}
                </p>

                <div id="lista-final" class="grid grid-cols-1 gap-2"></div>
                <div id="modulo-registro" class="mt-4 hidden"></div>
            </div>`;

        const contenedor = document.getElementById('lista-final');
        
        if (error || !servicios || servicios.length === 0) {
            contenedor.innerHTML = `<p class="text-slate-400 italic text-center py-6 text-[10px] font-bold uppercase">No hay servicios disponibles.</p>`;
            return;
        }

        servicios.forEach(srv => {
            const card = document.createElement('button');
            // Reducimos padding (p-3) y ajustamos el diseño a horizontal
            card.className = "bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center w-full active:scale-95 transition-all";
            
            card.innerHTML = `
                <div class="text-left">
                    <div class="font-black text-slate-700 uppercase italic text-[11px] leading-tight">${srv.nombre}</div>
                    <div class="text-[8px] text-teal-600 font-bold uppercase italic mt-1">
                        ${srv.citas_incluidas || 0} Sesiones Incluidas
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-teal-600 font-black italic text-base leading-none">$${srv.precio}</div>
                    <span class="text-[7px] text-slate-300 font-black uppercase tracking-widest">Elegir</span>
                </div>
            `;
            
            card.onclick = () => {
                // Ocultamos la lista para mostrar el registro sin scroll excesivo
                document.getElementById('lista-final').classList.add('hidden');
                window.mostrarFormularioRegistro(srv, sedeId, nombreSede);
            };
            contenedor.appendChild(card);
        });
    }

  // 5. MÓDULO DE REGISTRO (ULTRA-COMPACTO)
    window.mostrarFormularioRegistro = function(servicio, sedeId, nombreSede) {
        document.getElementById('lista-final').classList.add('hidden');
        const modulo = document.getElementById('modulo-registro');
        modulo.classList.remove('hidden');
        
        modulo.innerHTML = `
            <div class="bg-white p-4 rounded-2xl border border-teal-500 shadow-md fade-in text-left max-w-sm mx-auto">
                <h4 class="font-black italic text-slate-800 uppercase mb-1 text-center text-sm">Ingreso de Paciente</h4>
                <p class="text-teal-600 text-[9px] text-center mb-4 uppercase font-black italic tracking-widest border-b pb-2">
                    ${nombreSede} | ${servicio.nombre}
                </p>
                
                <div class="space-y-3">
                    <div>
                        <label class="text-[9px] text-slate-400 font-bold uppercase italic ml-1">Nombre Completo</label>
                        <input type="text" id="reg-nombre" placeholder="Nombre y Apellido" 
                            class="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500 italic font-bold text-xs shadow-sm">
                    </div>

                    <div>
                        <label class="text-[9px] text-slate-400 font-bold uppercase italic ml-1">Cédula (10 dígitos)</label>
                        <input type="text" id="reg-cedula" maxlength="10" inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '')" placeholder="Ej: 1722334455" 
                            class="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500 italic font-bold text-xs shadow-sm">
                    </div>

                    <div>
                        <label class="text-[9px] text-slate-400 font-bold uppercase italic ml-1">Celular (09...)</label>
                        <input type="tel" id="reg-telefono" maxlength="10" inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '')" placeholder="Ej: 0998877665" 
                            class="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-teal-500 italic font-bold text-xs shadow-sm">
                    </div>
                    
                    <button onclick="window.procesarRegistro('${servicio.id}', '${sedeId}', ${servicio.citas_incluidas}, '${servicio.nombre}', '${nombreSede}')" 
                        id="btn-registro" class="w-full bg-teal-600 text-white p-3.5 rounded-xl font-black italic uppercase shadow-md active:scale-95 transition-all text-sm mt-2">
                        REGISTRAR Y AGENDAR
                    </button>
                </div>
            </div>`;
    }
    
// 6. PROCESAMIENTO REGISTRO (SOLUCIÓN DEFINITIVA AL BLOQUEO)
    window.procesarRegistro = async function(servicioId, sedeId, sesiones, nombrePlan, nombreSede) {
        const nombreInput = document.getElementById('reg-nombre')?.value.trim();
        const cedula = document.getElementById('reg-cedula')?.value.trim();
        const telf = document.getElementById('reg-telefono')?.value.trim();
        const btn = document.getElementById('btn-registro');
        const regexNombre = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;

        // 1. VALIDACIONES PREVIAS
        if(!nombreInput || !cedula || !telf) return alert("⚠️ Por favor complete todos los campos.");
        if(!regexNombre.test(nombreInput)) return alert("⚠️ El nombre solo debe contener letras.");
        if(cedula.length !== 10) return alert("⚠️ La cédula debe tener 10 dígitos.");
        
        // Control Celular: Exactamente 10 dígitos y empieza con 09
        if(telf.length !== 10 || !telf.startsWith('09')) {
            return alert("⚠️ El celular debe tener 10 dígitos y empezar con '09'.");
        }

        try {
            // 2. CAMBIO DE ESTADO VISUAL
            btn.disabled = true;
            btn.innerText = "PROCESANDO...";

            // 3. INSERCIÓN EN BASE DE DATOS
            const { data: nuevoCliente, error } = await sb.from('clientes').insert([{
                nombre: nombreInput, 
                identificacion: cedula, 
                telefono: telf,
                sede_id: sedeId, 
                citas_restantes: sesiones, 
                tratamiento_actual: nombrePlan
            }]).select().single();

            // 4. MANEJO DE ERRORES DE SUPABASE
            if (error) {
                btn.disabled = false;
                btn.innerText = "REGISTRAR Y AGENDAR CITA";
                
                if (error.code === '23505') {
                    return alert("📍 Esta cédula ya está registrada. Por favor use la opción 'SEGUIMIENTO'.");
                } else {
                    return alert("❌ Error de conexión: " + error.message);
                }
            }

            // 5. ÉXITO Y PASO AL CALENDARIO
          // 5. ÉXITO Y PASO AL CALENDARIO
            if (nuevoCliente) {
                const modulo = document.getElementById('modulo-registro');
                if (modulo) {
                    // Aquí inyectamos el título instructivo y el espacio para el calendario
                    modulo.innerHTML = `
                        <div class="fade-in">
                            <div class="bg-teal-600 p-3 rounded-2xl mb-4 shadow-md border-b-4 border-teal-800 text-center">
                                <p class="text-white text-[10px] font-black uppercase italic leading-tight">
                                    ¡REGISTRO EXITOSO!<br>
                                    <span class="text-teal-100 text-[8px]">PASO FINAL: SELECCIONE FECHA Y HORA DE SU CITA</span>
                                </p>
                            </div>
                            <div id="calendario-espacio"></div>
                        </div>
                    `;
                }

                // Llamamos a la agenda con los datos del nuevo cliente
                window.abrirCalendario(nuevoCliente.id, sedeId, nuevoCliente.citas_restantes, nombreSede);
            }

        } catch (err) {
            // Este bloque evita que la pantalla se quede pegada si algo falla catastróficamente
            console.error("Error crítico:", err);
            alert("⚠️ Ocurrió un error inesperado. Reintente en un momento.");
            btn.disabled = false;
            btn.innerText = "REINTENTAR REGISTRO";
        }
    };

    // 7. SEGUIMIENTO
    window.iniciarSeguimiento = function(sedeId, nombreSede) {
        const main = document.getElementById('main-content');
        main.innerHTML = `
            <div class="fade-in p-4 text-center">
                <button onclick="window.location.reload()" class="text-teal-600 font-bold mb-6 flex items-center italic">← VOLVER AL MENÚ</button>
                <h2 class="text-xl font-black mb-1 uppercase italic text-slate-800">Acceso Pacientes</h2>
                <p class="text-teal-600 text-[11px] mb-6 uppercase font-black tracking-widest italic">Gestionando Sede: ${nombreSede}</p>
                <div class="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 text-left">
                    <label class="text-[10px] text-slate-400 font-bold uppercase italic ml-2 mb-1 block">Ingrese su Cédula</label>
                    <input type="text" id="input-clave" maxlength="10" inputmode="numeric" placeholder="Identificación registrada..." 
                        class="w-full p-4 rounded-2xl border-2 mb-4 text-center text-xl outline-none focus:border-teal-500 shadow-inner italic font-bold">
                    <button onclick="window.verificarClave('${sedeId}', '${nombreSede}')" 
                        class="w-full bg-slate-800 text-white p-4 rounded-2xl font-bold italic uppercase shadow-md active:scale-95 transition-all">
                        Verificar en ${nombreSede}
                    </button>
                </div>
                <div id="resultado-privado" class="mt-8"></div>
            </div>`;
    };


    window.verificarClave = async function(sedeId, nombreSede) {
    const clave = document.getElementById('input-clave').value.trim();
    const contenedor = document.getElementById('resultado-privado');
    window.sedeActualId = sedeId;
    window.sedeActualNombre = nombreSede;
    if (!clave || clave.length !== 10) return alert("⚠️ Cédula inválida.");
    
    contenedor.innerHTML = '<p class="animate-pulse italic text-slate-400 font-bold uppercase text-xs text-center">Consultando...</p>';

    // 1. Traemos las citas incluyendo el campo 'estado'
    const { data: cliente, error } = await sb.from('clientes')
        .select('*, citas(id, fecha_hora, estado)')
        .eq('identificacion', clave)
        .eq('sede_id', sedeId)
        .single();

    if (error || !cliente) {
        contenedor.innerHTML = `<div class="bg-orange-50 p-6 rounded-3xl border border-orange-200 text-center text-orange-600 font-bold italic">No encontrado en ${nombreSede}</div>`;
        return;
    }

    // 2. FILTRO ÚNICO: Definimos qué citas son válidas (Futuras y No Canceladas)
    const ahora = new Date();
    const citasValidas = cliente.citas ? cliente.citas.filter(c => {
        const fechaCita = new Date(c.fecha_hora);
        const noEstaCancelada = (c.estado || 'ACTIVO').toUpperCase() !== 'CANCELADO';
        return noEstaCancelada && fechaCita > ahora;
    }) : [];

    // 3. CÁLCULO DE SALDO BASADO EN EL FILTRO
    const totalBase = 14;
    const numCitasAgendadas = citasValidas.length;
    const saldoReal = totalBase - numCitasAgendadas;

    // 4. RENDERIZADO
    contenedor.innerHTML = `
        <div class="bg-white p-4 rounded-2xl border border-teal-500 text-left shadow-lg fade-in max-w-sm mx-auto">
            <div class="flex justify-between items-center mb-3 border-b pb-2">
                <div>
                    <p class="text-[8px] text-teal-600 font-black uppercase italic leading-none">Paciente ${nombreSede}</p>
                    <h3 class="text-base font-black uppercase italic text-slate-800 leading-tight">${cliente.nombre}</h3>
                </div>
                <div class="text-right">
                    <p class="text-slate-400 text-[8px] font-bold uppercase italic leading-none">Saldo</p>
                    <p class="text-lg font-black text-teal-600 leading-none">${saldoReal}/${totalBase}</p>
                </div>
            </div>

            <button onclick="window.abrirCalendario('${cliente.id}', '${sedeId}', ${saldoReal}, '${nombreSede}')" 
                class="w-full bg-teal-600 text-white p-2.5 rounded-xl font-bold italic uppercase text-[10px] shadow-sm active:scale-95 transition-all mb-4">
                + AGENDAR NUEVA SESIÓN
            </button>

            <div>
                <p class="text-[9px] text-slate-400 font-black uppercase italic mb-2 flex justify-between">
                    <span>Mis Próximas Citas</span>
                    <span>${numCitasAgendadas} total</span>
                </p>
                <div id="lista-citas-usuario" class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    ${numCitasAgendadas > 0 ? 
                        citasValidas.map(c => {
                            const f = new Date(c.fecha_hora);
                            const fechaFmt = f.getUTCDate().toString().padStart(2, '0') + "/" + (f.getUTCMonth() + 1).toString().padStart(2, '0');
                            const horaFmt = f.getUTCHours().toString().padStart(2, '0') + ":00";
                            return `
                            <div class="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <div class="flex items-center gap-2">
                                    <div class="bg-teal-500 w-1 h-4 rounded-full"></div>
                                    <span class="text-[10px] font-bold italic text-slate-700">${fechaFmt} - ${horaFmt}</span>
                                </div>
                                <button onclick="window.cancelarCita('${c.id}', '${c.fecha_hora}', '${cliente.id}', ${saldoReal})" 
                                    class="text-[8px] bg-red-50 text-red-500 px-2 py-1 rounded-md font-black uppercase hover:bg-red-500 hover:text-white transition-all border border-red-100">
                                    Eliminar
                                </button>
                            </div>`;
                        }).join('') : '<p class="text-[9px] text-slate-300 italic text-center py-2">No hay citas próximas.</p>'
                    }
                </div>
            </div>
            <div id="calendario-espacio"></div>
        </div>`;
};
// FUNCIÓN UNIFICADA - NO TOCAR NOMBRES DE VARIABLES
window.cancelarCita = async function(id, fechaHora, clienteId, saldoReal) {
    if (!id) return;

    if (!confirm("¿Estás seguro de que deseas cancelar esta sesión?")) return;

    // Detectamos si estamos en el panel de administrador
    const esAdmin = document.getElementById('contenedor-admin');

    try {
        if (esAdmin) {
            // ACCIÓN PARA ADMIN: Solo actualizamos el estado a CANCELADO
            // Esto permite que el registro se quede en la tabla con la X roja
            const { error } = await sb.from('citas')
                .update({ estado: 'CANCELADO' })
                .eq('id', id);
            
            if (error) throw error;
            alert("✅ Cita marcada como CANCELADA satisfactoriamente.");
            
            // Refrescamos la tabla del administrador sin salir de la pantalla
            const filtroActual = window.sedeFiltroActual || 'TODAS';
            await window.renderizarCitasAdmin(filtroActual);
        } 
        else {
            // ACCIÓN PARA CLIENTE: Eliminamos el registro físicamente
            // Esto recupera el saldo inmediatamente para el usuario
            const { error } = await sb.from('citas').delete().eq('id', id);
            
            if (error) throw error;
            alert("✅ Sesión eliminada exitosamente.");

            // Refrescamos la vista del cliente usando las variables globales que ya tienes
            if (window.sedeActualId && window.sedeActualNombre) {
                await window.verificarClave(window.sedeActualId, window.sedeActualNombre);
            }
        }
    } catch (err) {
        console.error("Error en cancelación:", err);
        alert("No se pudo procesar la cancelación.");
    }
};


// AJUSTE PARA EXCEL (Asegúrate de que exportarExcel use window.sedeFiltroActual)
window.exportarExcel = function() {
    const contenedor = document.getElementById('contenedor-admin');
    if (!contenedor) return;

    const filas = Array.from(contenedor.querySelectorAll('div.grid'));
    if (filas.length === 0) return alert("No hay datos para exportar");

    // RECONSTRUCCIÓN DEL FORMATO ORIGINAL SEGÚN TU IMAGEN
    let excelTemplate = `<html><head><meta charset="UTF-8">
    <style>
        /* Tu formato original recuperado */
        .header-verde { background: #0d9488; color: white; font-family: sans-serif; font-size: 16pt; font-weight: bold; text-align: center; }
        .fecha-sub { font-family: sans-serif; font-size: 10pt; text-align: center; }
        .col-titulos { background: #ffffff; color: #000000; font-family: sans-serif; font-size: 11pt; font-weight: bold; border: 0.5pt solid #000000; text-align: center; }
        .celda-datos { border: 0.5pt solid #000000; font-family: sans-serif; font-size: 10pt; padding: 4px; }
        .footer { font-family: sans-serif; font-size: 9pt; color: #666666; font-style: italic; }
    </style>
    </head><body>
    <table>
        <tr><td colspan="7" class="header-verde">REPORTE DE CITAS - CASCADA SPA</td></tr>
        <tr><td colspan="7" class="fecha-sub">Fecha: ${new Date().toLocaleDateString()}</td></tr>
        <tr><td colspan="7"></td></tr>
        
        <tr>
            <th class="col-titulos" style="width: 100pt;">SEDE</th>
            <th class="col-titulos" style="width: 90pt;">FECHA</th>
            <th class="col-titulos" style="width: 70pt;">HORA</th>
            <th class="col-titulos" style="width: 200pt;">PACIENTE</th>
            <th class="col-titulos" style="width: 100pt;">ID/CEDULA</th>
            <th class="col-titulos" style="width: 100pt;">TELEFONO</th>
            <th class="col-titulos" style="width: 90pt;">ESTADO</th>
        </tr>`;

    filas.forEach(f => {
        // Extraemos los datos manteniendo la lógica de las etiquetas ocultas
        const sede = f.querySelector('.ex-sede')?.innerText || "---";
        const fecha = f.querySelector('.ex-fecha')?.innerText || "---";
        const hora = f.querySelector('.ex-hora')?.innerText || "---";
        const paciente = f.querySelector('.ex-paciente')?.innerText || "---";
        const id = f.querySelector('.ex-id')?.innerText || "---";
        const tel = f.querySelector('.ex-tel')?.innerText || "---";
        const estado = f.querySelector('.ex-est')?.innerText || "ACTIVO";

        excelTemplate += `<tr>
            <td class="celda-datos">${sede.toUpperCase()}</td>
            <td class="celda-datos" style="text-align:center;">${fecha}</td>
            <td class="celda-datos" style="text-align:center;">${hora}</td>
            <td class="celda-datos">${paciente.toUpperCase()}</td>
            <td class="celda-datos" style="text-align:center;">${id}</td>
            <td class="celda-datos" style="text-align:center;">${tel}</td>
            <td class="celda-datos" style="text-align:center; font-weight:bold;">${estado.toUpperCase()}</td>
        </tr>`;
    });

    excelTemplate += `
        <tr><td colspan="7"></td></tr>
        <tr><td colspan="7" class="footer">REPORTE GENERADO EL: ${new Date().toLocaleString()}</td></tr>
        <tr><td colspan="7" class="footer">EMITIDO POR: SISTEMA ADMINISTRATIVO CASCADA SPA</td></tr>
    </table></body></html>`;

    // Descarga el archivo
    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Reporte_Citas_Cascada.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

    // 9. CALENDARIO DINÁMICO
    window.abrirCalendario = function(clienteId, sedeId, saldo, nombreSede) {
        if (saldo <= 0) return alert("No dispone de citas. Adquiera un nuevo plan.");
        const espacio = document.getElementById('calendario-espacio');
        espacio.innerHTML = `
            <div class="fade-in bg-slate-50 p-5 rounded-2xl border-t-4 border-teal-500 shadow-inner mt-6 text-center">
                <input type="date" id="fecha-cita" class="w-full p-3 rounded-xl border-2 border-slate-200 mb-6 font-bold text-center outline-none focus:border-teal-500 shadow-sm" 
                    min="${new Date().toISOString().split('T')[0]}" onchange="window.cargarHorasDisponibles('${sedeId}')">
                <div id="panel-horas" class="grid grid-cols-3 gap-2 mb-6"></div>
                <div id="confirmacion-cita" class="hidden">
                    <button id="btn-confirmar" onclick="window.confirmarReserva('${clienteId}', '${sedeId}', ${saldo}, '${nombreSede}')" 
    class="w-full bg-[#1e293b] text-white py-3 px-6 rounded-2xl font-black italic uppercase text-[11px] tracking-[2px] shadow-lg active:scale-95 transition-all mt-4 hover:bg-slate-700 border-b-4 border-slate-900">
    CONFIRMAR CITA
</button>
                </div>
            </div>`;
    };

window.cargarHorasDisponibles = async function(sedeId, nombreSede = "") {
    const fechaInput = document.getElementById('fecha-cita').value;
    const panel = document.getElementById('panel-horas');
    
    // 1. DETECCIÓN INFALIBLE: Buscamos "VALLE" en el parámetro o en el título de la página
    const textoSede = (nombreSede + " " + (document.querySelector('h3')?.innerText || "")).toUpperCase();
    const esValle = textoSede.includes("VALLE") || textoSede.includes("CHILLOS");
    
    const fechaObj = new Date(fechaInput + "T00:00:00");
    const diaSemana = fechaObj.getDay(); 

    // Bloqueo de Domingos
    if (diaSemana === 0) {
        panel.innerHTML = `<div class="col-span-3 p-4 bg-red-50 text-center"><p class="text-red-500 font-bold text-[10px]">DOMINGO CERRADO</p></div>`;
        document.getElementById('confirmacion-cita').classList.add('hidden');
        return;
    }

    panel.innerHTML = '<p class="col-span-3 text-center font-bold text-[10px]">CONSULTANDO...</p>';
    
    const { data: ocupadas } = await sb.from('citas').select('fecha_hora').eq('sede_id', sedeId)
        .gte('fecha_hora', `${fechaInput}T00:00:00.000Z`).lte('fecha_hora', `${fechaInput}T23:59:59.999Z`);
    
    const hOcupadas = ocupadas ? ocupadas.map(c => {
        const d = new Date(c.fecha_hora);
        return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
    }) : [];
    
    const ahora = new Date();
    const hoyEcuador = ahora.toLocaleDateString('en-CA');
    const horaActualDec = ahora.getHours() + (ahora.getMinutes() / 60);

    // 2. CONFIGURACIÓN DE LÍMITES (EN MINUTOS)
    let minInicio = 10 * 60; // 10:00 AM
    let minFin;

    if (diaSemana === 6) { 
        minInicio = 9 * 60; 
        minFin = 15.5 * 60; // Sábado última 3:30 PM
    } else {
        minInicio = 10 * 60;
        // VALLE: Queremos que llegue a las 19:00 (7 PM). 
        // Ponemos 19.5 (7:30 PM) como límite del bucle para asegurar que pinte la de las 7:00 PM
        if (esValle) {
            minFin = 19 * 60; 
        } else {
            // QUITO: Queremos que llegue a las 17:30 (5:30 PM)
            minFin = 17.5 * 60; 
        }
    }

    panel.innerHTML = '';

    // 3. GENERACIÓN DE BLOQUES DE 90 MINUTOS
    // Usamos m <= minFin + 1 para evitar errores de precisión decimal
    for (let m = minInicio; m <= (minFin + 1); m += 90) {
        const h = Math.floor(m / 60);
        const mins = m % 60;
        const horaHHMM = `${h.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        
        const estaOcupada = hOcupadas.includes(horaHHMM);
        const horaDecimal = h + (mins / 60);
        const esPasada = (fechaInput === hoyEcuador && horaDecimal <= horaActualDec);
        
        const btn = document.createElement('button');
        btn.disabled = estaOcupada || esPasada;
        
        const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const horaLabel = `${displayH}:${mins.toString().padStart(2, '0')} ${ampm}`;

        if (estaOcupada) {
            btn.className = "bg-slate-200 text-slate-400 p-2 rounded-lg text-[9px] font-bold italic opacity-50 cursor-not-allowed";
            btn.innerHTML = `<span class="block">${horaLabel}</span><span class="text-[7px]">OCUPADO</span>`;
        } else if (esPasada) {
            btn.className = "bg-orange-50 text-orange-300 p-2 rounded-lg text-[9px] font-bold italic cursor-not-allowed";
            btn.innerHTML = `<span class="block">${horaLabel}</span><span class="text-[7px]">PASADO</span>`;
        } else {
            btn.className = "bg-white border border-teal-500 text-teal-600 p-2 rounded-lg text-xs font-bold italic hover:bg-teal-500 hover:text-white transition-all shadow-sm active:scale-95";
            btn.innerText = horaLabel;
        }

        btn.onclick = () => {
            if(estaOcupada || esPasada) return;
            window.horaSeleccionada = horaHHMM; 
            document.querySelectorAll('#panel-horas button').forEach(b => b.classList.remove('bg-teal-600', 'text-white'));
            btn.classList.add('bg-teal-600', 'text-white');
            document.getElementById('confirmacion-cita').classList.remove('hidden');
        };
        panel.appendChild(btn);
    }
};
  

window.confirmarReserva = async function(clienteId, sedeId, nombreSede) {
    const fecha = document.getElementById('fecha-cita').value;
    const hora = window.horaSeleccionada; 
    const btn = document.getElementById('btn-confirmar');
    
    if (!fecha || !hora) return alert("Seleccione fecha y hora");
    
    btn.disabled = true;
    btn.innerText = "GUARDANDO...";

    // 1. Intentamos el guardado
    const { data, error } = await sb.from('citas').insert([
        { 
            cliente_id: clienteId, 
            sede_id: sedeId, 
            fecha_hora: `${fecha}T${hora}:00Z` 
        }
    ]).select(); // El .select() es clave para confirmar que se creó

    // 2. CONCENTRACIÓN AQUÍ: Si hay error, NO sale el mensaje de éxito
    if (error) {
        console.error("ERROR REAL DE SUPABASE:", error);
        btn.disabled = false;
        btn.innerText = "REINTENTAR";
        
        // Esto te dirá exactamente por qué no se guarda (ej: columna inexistente o tipo de dato)
        return alert("OJO: No se guardó en la base de datos. Motivo: " + error.message);
    }

    // 3. Solo si data tiene algo, es que realmente se guardó
    if (data && data.length > 0) {
        alert("✅ Registro exitoso. Su cita ha sido agendada.");
        window.location.reload();
    } else {
        alert("⚠️ El servidor no devolvió confirmación. Revisa la consola.");
        btn.disabled = false;
    }
};

    document.addEventListener('DOMContentLoaded', cargarSedes);
})();