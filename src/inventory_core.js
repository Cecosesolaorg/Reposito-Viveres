window.InventoryCore = {
    render: function (inventoryBody, products, inventoryData, searchTerm, aisleId, options = {}) {
        if (!inventoryBody) return;
        inventoryBody.innerHTML = '';

        const countedEl = document.getElementById('counted-total');
        const totalC = Object.values(inventoryData).filter(p => p.checkState === 1 && (p.qty > 0)).length;
        if (countedEl) countedEl.textContent = totalC;

        const normalize = (str) => {
            if (!str) return "";
            return str.toString().toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
        };

        const normalSearch = normalize(searchTerm);

        // Ordenar alfabéticamente antes de filtrar y renderizar
        products.sort((a, b) => a.localeCompare(b));

        const filtered = products.filter(p => {
            const normalP = normalize(p);
            if (!normalP.includes(normalSearch)) return false;
            if (options.onlyWithStock) {
                const qty = (inventoryData[p] || {}).qty || 0;
                return qty > 0;
            }
            return true;
        });

        filtered.forEach(p => {
            const data = inventoryData[p] || { qty: 0, history: "0", checkState: 0, redQty: null };
            const row = document.createElement('tr');
            row.className = 'product-row';

            let diffV = "", diffC = "";
            if (data.redQty !== null && data.redQty !== undefined && (data.checkState > 0)) {
                const diff = (data.qty || 0) - (data.redQty || 0);
                diffV = diff > 0 ? `+${diff}` : `${diff}`;
                diffC = diff > 0 ? "diff-positive" : "diff-negative";
                if (diff === 0) diffV = "0";
            }

            const hText = ""; // History hidden by user request

            row.innerHTML = `
                <td class="col-check">
                    <div style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <div class="indicator state-${data.checkState || 0}"></div> 
                        <div style="display: flex; flex-direction: column;">
                            <span class="product-name" style="font-weight: 700;">${p}</span>
                            ${hText}
                        </div>
                        <span class="edit-btn" style="margin-left: 10px; cursor: pointer;">✏️</span>
                    </div>
                </td>
                <td class="col-qty" style="cursor: pointer; text-align: center;">
                    <span class="qty-val">${data.qty ?? 0}</span>
                </td>
                <td class="col-diff ${diffC}" style="text-align: center;">${diffV}</td>
            `;

            row.querySelector('.indicator').onclick = (e) => {
                e.stopPropagation();
                if (options.onCheckToggle) options.onCheckToggle(p);
            };

            row.querySelector('.col-qty').onclick = () => {
                if (options.onOpenCalc) options.onOpenCalc(p);
            };

            row.querySelector('.edit-btn').onclick = (e) => {
                e.stopPropagation();
                if (options.onEditClick) options.onEditClick(p);
            };

            inventoryBody.appendChild(row);
        });
    },

    openAddProductModal: function (callback) {
        let modal = document.getElementById('dynamicAddProductModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'dynamicAddProductModal';
            modal.className = 'custom-modal-overlay';
            modal.style.display = 'none';
            modal.innerHTML = `
                <div class="custom-modal">
                    <div class="modal-header">
                        <h2>📦 NUEVO PRODUCTO</h2>
                    </div>
                    <div class="modal-body" style="text-align: center;">
                        <p style="margin-bottom: 2rem;">Ingresa el nombre del producto que deseas añadir a este pasillo:</p>
                        <div class="input-group">
                            <input type="text" id="newProductNameInput" placeholder="Nombre del producto..." 
                                style="width: 100%; background: rgba(255,255,255,0.05); border: 1.5px solid var(--accent); padding: 1.2rem; border-radius: 1.2rem; color: #fff; text-align: center; font-size: 1.1rem; outline: none; margin-bottom: 1rem;">
                        </div>
                    </div>
                    <div class="modal-footer" style="justify-content: center; gap: 1.5rem;">
                        <button id="cancelAddBtn" class="modal-btn secondary">CANCELAR</button>
                        <button id="confirmAddBtn" class="modal-btn primary">ACEPTAR</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Estilos adicionales si no existen en el scope global para el input placeholder
            const style = document.createElement('style');
            style.textContent = `
                #newProductNameInput::placeholder { color: rgba(255,255,255,0.2); }
                #newProductNameInput:focus { border-color: #fff; box-shadow: 0 0 20px rgba(255,171,0,0.3); }
            `;
            document.head.appendChild(style);
        }

        const input = document.getElementById('newProductNameInput');
        const confirmBtn = document.getElementById('confirmAddBtn');
        const cancelBtn = document.getElementById('cancelAddBtn');

        modal.style.display = 'flex';
        input.value = '';
        input.focus();

        const close = () => { modal.style.display = 'none'; };

        confirmBtn.onclick = () => {
            const val = input.value.trim().toUpperCase();
            if (val) {
                close();
                if (callback) callback(val);
            } else {
                alert("⚠️ Por favor ingresa un nombre válido.");
            }
        };

        cancelBtn.onclick = close;

        // Soporte para Enter
        input.onkeydown = (e) => {
            if (e.key === 'Enter') confirmBtn.click();
            if (e.key === 'Escape') cancelBtn.click();
        };
    },

    showErrorModal: function (title, message) {
        let modal = document.getElementById('inventoryErrorModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'inventoryErrorModal';
            modal.className = 'custom-modal-overlay';
            modal.style.display = 'none';
            modal.innerHTML = `
                <div class="custom-modal" style="border-color: #ff3d00;">
                    <div class="modal-header">
                        <h2 style="color: #ff3d00;">${title}</h2>
                    </div>
                    <div class="modal-body">
                        <p style="margin-top: 1rem;">${message}</p>
                    </div>
                    <div class="modal-footer" style="justify-content: center;">
                        <button id="closeErrorBtn" class="modal-btn primary" style="background: linear-gradient(135deg, #ff3d00 0%, #d50000 100%);">ACEPTAR</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('closeErrorBtn').onclick = () => { modal.style.display = 'none'; };
        } else {
            // Update content if already exists
            modal.querySelector('h2').textContent = title;
            modal.querySelector('p').textContent = message;
        }

        modal.style.display = 'flex';
    }
};
