/* ─── ADMIN.JS — Admin Panel ─── */

import { ADMIN_PASSWORD } from './config.js';
import {
    state, USE_AI, setUseAI, RATE_AI_EVENT, RATE_STATIC_EVENT,
    setRateAI, setRateStatic, setForceNextEvent
} from './state.js';
import { updateUI } from './ui.js';
import { renderScene } from './game.js';

let adminClickCount = 0;
let adminClickTimer = null;

export function initAdmin() {
    // Triple-click on title
    document.getElementById('admin-trigger').addEventListener('click', () => {
        adminClickCount++;
        clearTimeout(adminClickTimer);
        adminClickTimer = setTimeout(() => { adminClickCount = 0; }, 1000);
        if (adminClickCount >= 3) {
            document.getElementById('admin-login-overlay').style.display = 'flex';
            adminClickCount = 0;
        }
    });

    document.getElementById('admin-cancel-btn').addEventListener('click', () => {
        document.getElementById('admin-login-overlay').style.display = 'none';
    });

    document.getElementById('admin-confirm-btn').addEventListener('click', () => {
        const key = document.getElementById('admin-key-input').value;
        document.getElementById('admin-key-input').value = '';
        if (key === ADMIN_PASSWORD) {
            document.getElementById('admin-login-overlay').style.display = 'none';
            openAdminPanel();
        } else {
            alert('Sai mã!');
            document.getElementById('admin-login-overlay').style.display = 'none';
        }
    });

    document.getElementById('admin-close-btn').addEventListener('click', () => {
        document.getElementById('admin-panel-overlay').style.display = 'none';
    });

    document.getElementById('admin-save-btn').addEventListener('click', saveAdminValues);

    document.getElementById('admin-force-event-btn').addEventListener('click', () => {
        setForceNextEvent(true);
        alert('✅ Sự kiện sẽ xuất hiện ở lần chuyển giai đoạn kế tiếp!');
    });

    document.getElementById('admin-jump-btn').addEventListener('click', () => {
        const targetStage = document.getElementById('admin-stage-select').value;
        document.getElementById('admin-panel-overlay').style.display = 'none';
        renderScene(targetStage);
    });
}

function openAdminPanel() {
    document.getElementById('admin-money').value  = state.money;
    document.getElementById('admin-time').value   = state.time;
    document.getElementById('admin-morale').value = state.morale;
    document.getElementById('admin-quality').value= state.quality;
    document.getElementById('admin-ai-toggle').checked = USE_AI;
    document.getElementById('admin-rate-ai').value     = Math.round(RATE_AI_EVENT * 100);
    document.getElementById('admin-rate-static').value = Math.round(RATE_STATIC_EVENT * 100);
    document.getElementById('admin-panel-overlay').style.display = 'flex';
}

function saveAdminValues() {
    state.money   = parseInt(document.getElementById('admin-money').value)   || 0;
    state.time    = parseInt(document.getElementById('admin-time').value)    || 0;
    state.morale  = parseInt(document.getElementById('admin-morale').value)  || 0;
    state.quality = parseInt(document.getElementById('admin-quality').value) || 0;

    const newAI = document.getElementById('admin-ai-toggle').checked;
    setUseAI(newAI);

    const rAI     = parseInt(document.getElementById('admin-rate-ai').value);
    const rStatic = parseInt(document.getElementById('admin-rate-static').value);
    if (!isNaN(rAI))     setRateAI(Math.min(100, Math.max(0, rAI)) / 100);
    if (!isNaN(rStatic)) setRateStatic(Math.min(100, Math.max(0, rStatic)) / 100);

    updateUI();
    document.getElementById('admin-panel-overlay').style.display = 'none';
}
