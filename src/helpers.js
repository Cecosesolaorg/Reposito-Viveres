// --- HELPER SELECTION LOGIC ---
window.HelperApp = {
    open: function () {
        const modal = document.getElementById('helperModal');
        const list = document.getElementById('helperList');
        if (!list) return;

        list.innerHTML = '';

        // --- ADD CUSTOM HELPER BUTTON ---
        const addOtherBtn = document.createElement('button');
        addOtherBtn.className = 'btn-add-other';
        addOtherBtn.innerHTML = `➕ Añadir compañero`;
        addOtherBtn.onclick = () => this.openCustomModal();
        list.appendChild(addOtherBtn);

        const staff = window.STAFF_LIST || {};

        for (const category in staff) {
            const header = document.createElement('div');
            header.className = 'helper-category';
            header.textContent = category === 'SISTEMA' ? '💻 SISTEMA' : '🤝 COORDINACIÓN';
            list.appendChild(header);

            staff[category].forEach(name => {
                const btn = document.createElement('button');
                btn.className = 'helper-btn-select';
                btn.innerHTML = `<span>${name}</span> ➡️`;
                btn.onclick = () => this.select(category, name);
                list.appendChild(btn);
            });
        }

        if (modal) modal.style.display = 'flex';
    },

    close: function () {
        const modal = document.getElementById('helperModal');
        if (modal) modal.style.display = 'none';
    },

    openCustomModal: function () {
        this.close(); // Close main list

        let modal = document.getElementById('customHelperModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'customHelperModal';
            modal.className = 'custom-modal-overlay';
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
                display: flex; align-items: center; justify-content: center; z-index: 2000;
            `;
            modal.innerHTML = `
                <div class="custom-modal" style="background: #1a1e26; border: 1px solid #ffab00; padding: 2.5rem; border-radius: 1.5rem; width: 90%; max-width: 400px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                    <h2 style="color: #ffab00; text-align: center; margin-bottom: 1.5rem; font-size: 1.4rem;">🤝 NUEVO AYUDANTE</h2>
                    <p style="color: rgba(255,255,255,0.7); text-align: center; margin-bottom: 2rem;">Ingresa el nombre de la persona que te ayudará:</p>
                    <input type="text" id="customHelperInput" placeholder="Nombre completo..." 
                        style="width: 100%; background: rgba(255,255,255,0.05); border: 1.5px solid #ffab00; padding: 1.2rem; border-radius: 1rem; color: #fff; text-align: center; font-size: 1.1rem; outline: none; margin-bottom: 2rem;">
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button id="cancelCustomHelper" class="modal-btn secondary" style="background: #333; color: #fff; padding: 0.8rem 1.5rem; border-radius: 0.8rem; border: none; cursor: pointer;">CANCELAR</button>
                        <button id="confirmCustomHelper" class="modal-btn primary" style="background: #ff6d00; color: #fff; padding: 0.8rem 1.5rem; border-radius: 0.8rem; border: none; cursor: pointer; font-weight: bold;">ASIGNAR</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const input = document.getElementById('customHelperInput');
        const confirmBtn = document.getElementById('confirmCustomHelper');
        const cancelBtn = document.getElementById('cancelCustomHelper');

        modal.style.display = 'flex';
        input.value = '';
        input.focus();

        confirmBtn.onclick = () => {
            const name = input.value.trim().toUpperCase();
            if (name) {
                modal.style.display = 'none';
                this.select('', name);
            } else {
                alert("⚠️ Por favor ingresa un nombre.");
            }
        };

        cancelBtn.onclick = () => {
            modal.style.display = 'none';
            this.open(); // Volver a la lista
        };

        input.onkeydown = (e) => {
            if (e.key === 'Enter') confirmBtn.click();
            if (e.key === 'Escape') cancelBtn.click();
        };
    },

    select: function (cat, name) {
        const finalName = name.toUpperCase();
        // Save to dedicated localStorage key
        localStorage.setItem('ayudante', finalName);
        
        // Update the dedicated UI element
        const ayudaEl = document.getElementById('team1-ayudante');
        if (ayudaEl) {
            ayudaEl.textContent = finalName;
        }

        this.close();
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const savedAyudante = localStorage.getItem('ayudante');
    if (savedAyudante) {
        const ayudaEl = document.getElementById('team1-ayudante');
        if (ayudaEl) ayudaEl.textContent = savedAyudante;
    }

    if (document.getElementById('helperBtn')) {
        document.getElementById('helperBtn').onclick = () => window.HelperApp.open();
    }
});
