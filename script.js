// La configuración se manejará dentro del DOMContentLoaded para asegurar que Firebase esté listo
let database;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Firebase con seguridad
    try {
        const firebaseConfig = {
            databaseURL: "https://cecosesola-inventario-default-rtdb.firebaseio.com/"
        };
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        database = firebase.database();
        console.log("✅ Firebase conectado en Inicio");
    } catch (error) {
        console.error("❌ Error al iniciar Firebase:", error);
    }

    // --- EFECTO DE FONDO INTERACTIVO (Glow que sigue al mouse) ---
    const bgGlow = document.querySelector('.background-glow');
    if (bgGlow) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;

            // 1. Inyectar variables para animaciones CSS
            bgGlow.style.setProperty('--x', `${x}%`);
            bgGlow.style.setProperty('--y', `${y}%`);

            // 2. Aplicar degradado premium directo
            bgGlow.style.background = `
                radial-gradient(circle at ${x}% ${y}%, rgba(255, 109, 0, 0.4) 0%, transparent 60%),
                radial-gradient(circle at ${100 - x}% ${100 - y}%, rgba(0, 210, 255, 0.2) 0%, transparent 60%)
            `;
        });
    }

    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const responsableInput = document.getElementById('responsable');

    // Cargar responsable predeterminado
    const savedResponsable = localStorage.getItem('responsableDirecto');
    if (savedResponsable && responsableInput) {
        responsableInput.value = savedResponsable;
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const responsable = document.getElementById('responsable').value.trim();
        const assignedAisle = document.getElementById('assignedAisle').value;

        // 1. CASO ADMINISTRADOR (JAVIER CAMERO)
        if (responsable.toUpperCase() === "JAVIER CAMERO") {
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('userName', "JAVIER CAMERO");
            localStorage.setItem('responsableDirecto', "JAVIER CAMERO");
            localStorage.setItem('assignedAisle', assignedAisle || "DASHBOARD");
            localStorage.setItem('cecosesolaUser', "JAVIER CAMERO");

            ejecutarEntrada();
            return;
        }

        // 2. CASO USUARIO NORMAL
        if (responsable && assignedAisle) {
            localStorage.setItem('isAdmin', 'false');
            localStorage.setItem('userName', responsable);
            localStorage.setItem('responsableDirecto', responsable);
            localStorage.setItem('assignedAisle', assignedAisle);
            localStorage.setItem('cecosesolaUser', responsable);

            ejecutarEntrada();
        } else {
            alert('Por favor, ingresa tu nombre y selecciona un pasillo.');
        }
    });

    function ejecutarEntrada() {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Procesando...</span>';

        const assignedAisle = localStorage.getItem('assignedAisle');

        // Mapeo de pasillos a sus respectivos archivos HTML
        const aisleMap = {
            "PASILLO 1 PASTAS": "contenedor/pasillo1/pasillo1.html",
            "PASILLO 2 CAFE": "contenedor/pasillo2/pasillo2.html",
            "PASILLO 3 PANES": "contenedor/pasillo3/pasillo3.html",
            "PASILLO 4 GALLETAS": "contenedor/pasillo4/pasillo4.html",
            "PASILLO 5 SALSA": "contenedor/pasillo5/pasillo5.html",
            "PASILLO 6 JABON": "contenedor/pasillo6/pasillo6.html",
            "PASILLO 7 PAPEL": "contenedor/pasillo7/pasillo7.html",
            "PASILLO 8": "contenedor/pasillo8/pasillo8.html",
            "PASILLO 9 GRANOS": "contenedor/pasillo9/pasillo9.html",
            "PASILLO 10 CAVA CUARTO": "contenedor/pasillo10/pasillo10.html",
            "PASILLO 11": "contenedor/pasillo11/pasillo11.html",
            "PASILLO 12": "contenedor/pasillo12/pasillo12.html",
            "PASILLO 13": "contenedor/pasillo13/pasillo13.html",
            "PASILLO 14": "contenedor/pasillo14/pasillo14.html",
            "PASILLO 15": "contenedor/pasillo15/pasillo15.html",
            "PASILLO 16": "contenedor/pasillo16/pasillo16.html",
            "PASILLO 17": "contenedor/pasillo17/pasillo17.html",
            "PASILLO 18 DEPOSITO ABAJO": "contenedor/pasillo18/pasillo18.html",
            "PASILLO 19 DEPOSITO ARRIBA": "contenedor/pasillo19/pasillo19.html",
            "PASILLO ESPECIAL": "contenedor/pasillo_especial/pasillo_especial.html",
            "COORDINACIÓN": "contenedor/coordinacion/coordinacion.html"
        };

        const targetUrl = aisleMap[assignedAisle] || 'index.html';

        setTimeout(() => {
            if (targetUrl !== 'contenedor/coordinacion/coordinacion.html') {
                const modal = document.getElementById('partnerModal');
                const input = document.getElementById('partnerInput');
                const confirmBtn = document.getElementById('confirmPartnerBtn');
                const cancelBtn = document.getElementById('cancelPartnerBtn');

                modal.style.display = 'flex';
                input.focus();

                confirmBtn.onclick = () => {
                    const name = input.value.trim();
                    if (name) {
                        localStorage.setItem('companero', name.toUpperCase());
                        localStorage.setItem('userLastName', name.toUpperCase());
                        window.location.href = targetUrl;
                    } else {
                        alert("ERROR: Por favor, ingresa el nombre del compañero para continuar.");
                    }
                };

                cancelBtn.onclick = () => {
                    // Si cancela, cerramos el modal y reseteamos el login, no lo mandamos al mapa
                    modal.style.display = 'none';
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>Iniciar Inventario</span>';
                };
            } else {
                window.location.href = targetUrl;
            }
        }, 800);
    }


    // --- API DE ASIGNACIONES LOCALES (FOOTPRINT) ---
    const DEFAULT_ASSIGNMENTS = {
        "PASILLO 1 PASTAS": "---",
        "PASILLO 2 CAFE": "---",
        "PASILLO 3 PANES": "---",
        "PASILLO 4 GALLETAS": "---",
        "PASILLO 5 SALSA": "---",
        "PASILLO 6 JABON": "---",
        "PASILLO 7 PAPEL": "---",
        "PASILLO 8": "---",
        "PASILLO 9 GRANOS": "---",
        "PASILLO 10 CAVA CUARTO": "---",
        "PASILLO 11": "---",
        "PASILLO 12": "---",
        "PASILLO 13": "---",
        "PASILLO 14": "---",
        "PASILLO 15": "---",
        "PASILLO 16": "---",
        "PASILLO 17": "---",
        "PASILLO 18 DEPOSITO ABAJO": "---",
        "PASILLO 19 DEPOSITO ARRIBA": "---",
        "PASILLO ESPECIAL": "---",
        "COORDINACIÓN": "---"
    };

    // --- LÓGICA DE ASIGNACIONES (ICONO DE PERSONAS) ---
    const assignmentsBtn = document.getElementById('teamAssignmentsBtn');
    const assignmentsModal = document.getElementById('assignmentsModal');
    const assignmentsList = document.getElementById('assignmentsList');
    const closeAssignmentsBtn = document.getElementById('closeAssignmentsBtn');

    // Estado de sincronización
    let publishedStaffData = JSON.parse(localStorage.getItem('cachedPublishedStaff')) || {};
    let isSyncing = true;

    renderAssignments();

    // Escuchar cambios en tiempo real
    if (database) {
        // --- SALIDA DE EMERGENCIA PARA OFFLINE ---
        const syncTimeout = setTimeout(() => {
            if (isSyncing) {
                console.warn("⚠️ Tiempo de espera agotado, usando memoria local.");
                isSyncing = false;
                renderAssignments();
            }
        }, 3000);

        database.ref('publishedStaff').on('value', (snapshot) => {
            clearTimeout(syncTimeout);
            isSyncing = false;
            const cloudData = snapshot.val();
            console.log("📥 DATOS RECIBIDOS:", cloudData); // <--- DEBUG PARA TI

            if (cloudData && typeof cloudData === 'object') {
                publishedStaffData = cloudData;
                localStorage.setItem('cachedPublishedStaff', JSON.stringify(publishedStaffData));
            } else {
                console.warn("⚠️ La nube está vacía.");
                publishedStaffData = {};
            }
            renderAssignments();
        }, (error) => {
            clearTimeout(syncTimeout);
            console.error("❌ Error Firebase:", error);
            isSyncing = false;
            renderAssignments();
        });
    } else {
        // Si no hay base de datos (offline total), desbloquear de inmediato
        isSyncing = false;
        renderAssignments();
    }

    function renderAssignments() {
        if (!assignmentsList) return;
        assignmentsList.innerHTML = '';

        // Estructura base completa
        const displayData = { ...DEFAULT_ASSIGNMENTS };

        // Normalización para comparación (ULTRA SENCILLA PARA EVITAR ERRORES)
        const normalize = s => s ? s.toString().toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/S$/g, "").replace(/\s/g, "") : "";

        // Mapear datos de la nube
        const cloudKeys = Object.keys(publishedStaffData);

        cloudKeys.forEach(cloudKey => {
            const cleanCloud = normalize(cloudKey);
            const namesFromCloud = publishedStaffData[cloudKey];

            let matched = false;
            for (const localArea in displayData) {
                const cleanLocal = normalize(localArea);

                // Si coinciden exactamente o por aproximación
                if (cleanLocal === cleanCloud || cleanLocal.includes(cleanCloud) || cleanCloud.includes(cleanLocal)) {
                    displayData[localArea] = namesFromCloud;
                    matched = true;
                    break;
                }
            }
            // Si el área no existe en el mapa predeterminado, se agrega al final
            if (!matched && cleanCloud !== "") {
                displayData[cloudKey] = namesFromCloud;
            }
        });

        // Título o estado de carga
        const statusHeader = document.createElement('div');
        statusHeader.style.cssText = 'display:flex; justify-content:space-between; align-items:center; font-size:0.7rem; opacity:0.8; margin-bottom:12px; color:var(--accent); background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.1);';

        const count = cloudKeys.length;
        statusHeader.innerHTML = `
            <span>${isSyncing ? '⌛ Sincronizando...' : (count > 0 ? `✅ ${count} áreas cargadas` : '🛑 Sin datos en nube')}</span>
            <button id="hardResetBtn" style="background:#ff4757; color:white; border:none; padding:4px 8px; border-radius:5px; cursor:pointer; font-size:0.6rem; font-weight:bold;">RESETEAR</button>
        `;
        assignmentsList.appendChild(statusHeader);

        const resetBtn = document.getElementById('hardResetBtn');
        if (resetBtn) {
            resetBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm("¿Limpiar memoria del sistema y reintentar? Esto borrará todos los datos guardados localmente.")) {
                    localStorage.clear();
                    location.reload();
                }
            };
        }

        const areas = Object.keys(displayData);
        areas.sort().forEach(area => {
            const names = displayData[area] || "---";
            const item = document.createElement('div');
            item.className = 'assignment-item';
            // Hacerlo cliqueable para auto-rellenar
            item.style.cursor = 'pointer';
            item.title = "Haz clic para seleccionar este pasillo";

            item.innerHTML = `
                <div class="assignment-info">
                    <span class="assignment-aisle">${area}</span>
                    <span class="assignment-names">${names.toLowerCase()}</span>
                </div>
                <span class="select-indicator">➡️</span>
            `;

            item.onclick = () => {
                // 1. Seleccionar el pasillo en el dropdown
                const aisleSelect = document.getElementById('assignedAisle');
                if (aisleSelect) {
                    // Intentamos encontrar la opción que más se parezca
                    for (let i = 0; i < aisleSelect.options.length; i++) {
                        if (normalize(aisleSelect.options[i].value) === normalize(area)) {
                            aisleSelect.selectedIndex = i;
                            break;
                        }
                    }
                }

                // 2. Extraer el primer nombre para el campo Responsable (SISTEMA)
                const firstName = names.split('/')[0].split(' ')[0].trim();
                const responsableInput = document.getElementById('responsable');
                if (responsableInput && firstName !== "---") {
                    responsableInput.value = firstName;
                }

                // 3. Cerrar el modal
                assignmentsModal.style.display = 'none';

                // 4. Efecto visual de focus
                if (aisleSelect) aisleSelect.focus();
            };

            assignmentsList.appendChild(item);
        });
    }

    if (assignmentsBtn) {
        assignmentsBtn.onclick = () => {
            assignmentsModal.style.display = 'flex';
        };
    }

    if (closeAssignmentsBtn) {
        closeAssignmentsBtn.onclick = () => {
            assignmentsModal.style.display = 'none';
        };
    }

    // --- LÓGICA DE REINICIO DE DATOS (LIMPIAR TODO) ---
    const cycleBtn = document.getElementById('cycleResetBtn');
    const cycleText = document.getElementById('cycleStatusText');

    if (cycleBtn) {
        cycleBtn.addEventListener('click', () => {
            const resetModal = document.getElementById('resetCycleModal');
            const resetMsg = document.getElementById('resetModalMessage');
            const confirmBtn = document.getElementById('confirmResetBtn');
            const cancelBtn = document.getElementById('cancelResetBtn');

            let message = `
                <div style="text-align: center; line-height: 1.6;">
                    <span style="color:#ff4757; font-weight:bold; font-size: 1.2rem; display: block; margin-bottom: 12px;">⚠️ LEER ATENTAMENTE ⚠️</span>
                    <p style="margin-bottom: 10px;"><strong>ESTA ACCIÓN BORRARÁ SOLO DATOS GUARDADOS EN ESTA PÁGINA:</strong></p>
                    <div style="display: inline-block; text-align: left; margin-bottom: 15px;">
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            <li>1. Historial viejo de la página</li>
                            <li>2. Inventarios ya realizados</li>
                        </ul>
                    </div>
                    <p>¿Estás SEGURO de que deseas continuar?</p>
                </div>
            `;

            resetMsg.innerHTML = message;
            resetModal.style.display = 'flex';

            confirmBtn.onclick = () => {
                // Limpiar TODO el localStorage para que no quede rastro de nada
                localStorage.clear();
                resetModal.style.display = 'none';

                // Mostrar modal de éxito personalizado
                const successModal = document.getElementById('successResetModal');
                const closeSuccessBtn = document.getElementById('closeSuccessBtn');

                if (successModal) {
                    successModal.style.display = 'flex';
                    
                    // Solo recargamos automáticamente ya que el botón no existe
                    setTimeout(() => {
                        location.reload();
                    }, 1500); // 1.5 segundos para que de tiempo a ver el mensaje
                } else {
                    alert("¡Sistema limpiado con éxito!");
                    location.reload();
                }
            };

            cancelBtn.onclick = () => {
                resetModal.style.display = 'none';
            };
        });
    }
});
