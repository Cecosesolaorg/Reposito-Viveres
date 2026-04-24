// ============================================================
// CUADERNO RÁPIDO PREMIUM — 100% AUTÓNOMO (HTML + CSS + LÓGICA)
// Reemplaza a la antigua calculadora
// ============================================================

(function () {
    'use strict';

    // ── 1. INYECTAR CSS ──────────────────────────────────────
    const CALC_CSS = `
/* ===== PREMIUM NOTEBOOK CSS ===== */
.premium-notebook {
    display: flex !important;
    background: #111418;
    width: 380px;
    max-width: 95%;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6);
    flex-direction: column;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.notebook-header {
    background: #1a1d24;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #2a2e35;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.notebook-product-title {
    font-size: 1.1rem;
    color: #fff;
    margin: 0;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.notebook-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: #111418;
}

.notebook-textarea {
    width: 100%;
    height: 180px;
    background: transparent;
    border: none;
    color: #e0e0e0;
    font-size: 1.5rem;
    font-family: 'Outfit', sans-serif, monospace;
    resize: none;
    outline: none;
    line-height: 1.5;
}

.notebook-textarea::placeholder {
    color: #4a4e55;
    font-size: 1.2rem;
}

.notebook-footer-display {
    border-top: 2px dashed #4a4e55;
    padding-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.notebook-total-label {
    color: #fff;
    font-size: 1.2rem;
    font-weight: 700;
}

.notebook-total-value {
    color: #00d26a;
    font-size: 2rem;
    font-weight: 700;
}

.notebook-actions {
    display: flex;
    padding: 0;
}

.btn-notebook-cancelar,
.btn-notebook-guardar {
    flex: 1;
    border: none;
    padding: 20px;
    font-size: 1rem;
    font-weight: 800;
    color: #fff;
    cursor: pointer;
    transition: background 0.1s;
}

.btn-notebook-cancelar { background: #8b1c1c; }
.btn-notebook-guardar  { background: #00d26a; color: #000; }
.btn-notebook-cancelar:active { background: #6a0000; }
.btn-notebook-guardar:active  { background: #00b058; }

#calcModal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0; top: 0;
    width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
    align-items: center;
    justify-content: center;
}
`;

    const styleEl = document.createElement('style');
    styleEl.textContent = CALC_CSS;
    document.head.appendChild(styleEl);


    // ── 2. INYECTAR HTML ─────────────────────────────────────
    const CALC_HTML = `
<div id="calcModal" class="modal">
    <div class="premium-notebook">
        <header class="notebook-header">
            <h3 id="calc-product-name" class="notebook-product-title">PRODUCTO</h3>
            <div style="color: #5dade2; font-size: 0.85rem; font-weight: 600;">Guardado: <span id="current-saved-val">0</span></div>
        </header>
        <div class="notebook-body">
            <textarea id="notebookInput" class="notebook-textarea" placeholder="Ej:\n15\n20\n-5\n* 2"></textarea>
            <div class="notebook-footer-display">
                <span class="notebook-total-label">TOTAL:</span>
                <span id="notebookTotal" class="notebook-total-value">0</span>
            </div>
        </div>
        <div class="notebook-actions">
            <button class="btn-notebook-cancelar" id="calcCancelBtn">CANCELAR</button>
            <button class="btn-notebook-guardar" id="calcSaveBtn">GUARDAR</button>
        </div>
    </div>
</div>
`;

    // Inyectamos el modal al final del body
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.createElement('div');
        container.innerHTML = CALC_HTML.trim();
        document.body.appendChild(container.firstChild);

        // Bindings de botones de footer
        document.getElementById('calcCancelBtn').addEventListener('click', () => CalcApp.close());
        document.getElementById('calcSaveBtn').addEventListener('click', () => {
            if (window.saveCalculation) window.saveCalculation();
        });

        // Event listener para actualizar el total al escribir
        document.getElementById('notebookInput').addEventListener('input', () => {
             CalcApp.calculateTotal();
        });
    });


    // ── 3. LÓGICA DEL CUADERNO ──────────────────────────
    const CalcApp = {
        tempTotal: 0,
        tempHistory: "",
        activeProduct: "",

        // --- ABRIR ---
        open: function (product, currentQty, currentHistory) {
            this.activeProduct = product;
            
            const input = document.getElementById('notebookInput');
            
            if (currentHistory && currentHistory !== "0") {
                // Restauramos el historial limpiando separadores de la base de datos
                let parsedHistory = currentHistory;
                
                // Si es un historial de la antigua calculadora, quitamos los = y ()
                parsedHistory = parsedHistory.replace(/ = [0-9.]+/g, '').replace(/\(|\)/g, '');
                
                // Convertimos el viejo " + " o nuestro nuevo " | " a saltos de línea para el cuaderno
                parsedHistory = parsedHistory.replace(/ \+ /g, '\n').replace(/ \| /g, '\n');
                
                input.value = parsedHistory;
            } else {
                input.value = "";
            }
            
            const title = document.getElementById('calc-product-name');
            if (title) title.textContent = product;
            
            const saved = document.getElementById('current-saved-val');
            if (saved) saved.textContent = currentQty || 0;

            this.calculateTotal(); // Inicializar total mostrado
            
            const modal = document.getElementById('calcModal');
            if (modal) {
                modal.style.display = 'flex';
                setTimeout(() => input.focus(), 100);
            }
        },

        // --- CERRAR ---
        close: function () {
            const modal = document.getElementById('calcModal');
            if (modal) modal.style.display = 'none';
        },

        // --- CALCULAR ---
        calculateTotal: function () {
            const input = document.getElementById('notebookInput').value;
            
            try {
                let lines = input.split(/\n/);
                let expr = "";
                
                for(let i=0; i<lines.length; i++) {
                    let line = lines[i].trim();
                    if(!line) continue;
                    
                    // 1. Permitir usar 'x' como multiplicar
                    line = line.replace(/[xX]/g, '*');
                    
                    // 2. Inserción de '+' implícito
                    line = line.replace(/(\d)\s+(?=\d)/g, '$1 + ');
                    line = line.replace(/(\d)\s+(?=\()/g, '$1 + ');
                    line = line.replace(/(\))\s+(?=\d)/g, '$1 + ');
                    
                    // 3. Encerrar en paréntesis cada paso para cálculo secuencial estricto
                    if (/^[+\-*/]/.test(line)) {
                        if (expr) {
                            expr = `(${expr}) ${line}`; 
                        } else {
                            expr = line; 
                        }
                    } else {
                        if (expr) {
                            expr = `(${expr}) + ${line}`;
                        } else {
                            expr = line;
                        }
                    }
                }
                
                let res = 0;
                if (expr !== '') {
                    // Evitar error sintáctico por colgado
                    expr = expr.replace(/[\+\-\*\/]+$/, '');
                    
                    // Evaluamos solo si es válido matemáticamente
                    if (/^[\d+\-*/.\s()]+$/.test(expr)) {
                        res = eval(expr);
                    } else {
                        // Fallback: Si meten texto erróneo, sumar los números detectados
                        const numbers = input.match(/-?\d+(\.\d+)?/g);
                        if (numbers) {
                            res = numbers.reduce((a, b) => a + parseFloat(b), 0);
                        }
                    }
                }
                
                this.tempTotal = isNaN(res) ? 0 : parseFloat(res.toFixed(4));
                document.getElementById('notebookTotal').textContent = this.tempTotal;
            } catch (e) {
                this.tempTotal = 0;
                document.getElementById('notebookTotal').textContent = "...";
            }
        },

        // --- GUARDAR ---
        save: function (onSaveCallback) {
            // Recalcular por si acaso
            this.calculateTotal(); 
            const input = document.getElementById('notebookInput').value;
            
            // Reemplazamos los saltos de línea con " | " para que en el export a Excel se vea claro (ej: 4+4 | 4+4)
            this.tempHistory = input.replace(/\n| \n /g, ' | '); 
            
            if (onSaveCallback) onSaveCallback(this.activeProduct, this.tempTotal, this.tempHistory);
            this.close();
        },

        // --- COMPATIBILIDAD ---
        showAlert: function (msg) {
            alert(msg);
        },
        hideAlert: function () {},
        toggleHistory: function () {
            // Stub por compatibilidad
        }
    };

    // ── 4. EXPONER GLOBALES ──────────────────────────────────
    window.CalcApp = CalcApp;
    window.closeCalculator = () => CalcApp.close();
    window.toggleCalcHistory = () => CalcApp.toggleHistory();

})();
