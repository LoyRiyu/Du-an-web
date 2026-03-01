/* ─── MAIN.JS — Entry Point ─── */

import { DIFFICULTIES, NG_KEY } from './config.js';
import {
    state, resetState, setCurrentDiff, setSpeedModeEnabled,
    setNgPlusActive, setSelectedItem, setSoundEnabled, soundEnabled
} from './state.js';
import { updateUI, updateAIBadge, renderDecisionLogPanel, updateLogBadge } from './ui.js';
import { initGame, renderScene } from './game.js';
import { initAdmin } from './admin.js';
import { canStartGame, initAuth } from './auth.js';

// ══ DIFFICULTY SELECTION ══
function pickDifficulty(diffKey) {
    setCurrentDiff(DIFFICULTIES[diffKey], diffKey);
    document.getElementById('difficulty-screen').style.display = 'none';

    // Speed mode
    const speedToggle = document.getElementById('speed-mode-check');
    if (speedToggle) setSpeedModeEnabled(speedToggle.checked);

    // NG+ ?
    if (localStorage.getItem(NG_KEY)) {
        document.getElementById('item-screen').style.display = 'flex';
    } else {
        document.getElementById('game-container').style.display = 'block';
        resetState();
        initGame();
    }
}

// ══ ITEM SELECTION ══
function initItemScreen() {
    const cards = document.querySelectorAll('.item-card');
    const confirmBtn = document.getElementById('item-confirm-btn');
    let selectedCard = null;

    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedCard = card.dataset.item;
            setSelectedItem(selectedCard);
            if (confirmBtn) confirmBtn.disabled = false;
        });
    });

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            document.getElementById('item-screen').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';

            // Apply item effect to initial state
            applyItemBonus(selectedCard);
            resetState();

            // Re-apply since resetState wipes it
            setSelectedItem(selectedCard);
            applyItemBonus(selectedCard);

            setNgPlusActive(true);
            initGame();
        });
    }
}

function applyItemBonus(itemKey) {
    if (!itemKey) return;
    if (itemKey === 'budget') {
        state.money  += 1500000;
        state.quality -= 10;          // Khó lấy perfect hơn
    } else if (itemKey === 'captain') {
        state.morale += 20;
    }
    // 'redo' không có bonus ngay — hiệu lực xử lý trong game.js
    updateUI();
}

// ══ LOG PANEL ══
function initLogPanel() {
    const toggle = document.getElementById('log-toggle');
    const panel  = document.getElementById('decision-log-panel');
    const backdrop = document.getElementById('log-panel-backdrop');
    const closeBtn = document.getElementById('log-close-btn');

    const open = () => {
        renderDecisionLogPanel();
        panel.classList.add('open');
        if (backdrop) backdrop.classList.add('show');
    };
    const close = () => {
        panel.classList.remove('open');
        if (backdrop) backdrop.classList.remove('show');
    };

    if (toggle)  toggle.addEventListener('click', () => panel.classList.contains('open') ? close() : open());
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
}

// ══ SOUND TOGGLE ══
function initSoundToggle() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        setSoundEnabled(!soundEnabled);
        btn.innerHTML = soundEnabled ? '🔊 <span>Âm Thanh</span>' : '🔇 <span>Tắt Tiếng</span>';
    });
}

// ══ THEME TOGGLE ══
function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    let isVolunteer = false;
    btn.addEventListener('click', () => {
        isVolunteer = !isVolunteer;
        document.body.classList.toggle('theme-volunteer', isVolunteer);
        btn.textContent = isVolunteer ? '🌙 Tối' : '🎨 Tình Nguyện';
    });
}

// ══ NG+ BUTTON ══
function initNgPlusButton() {
    const btn = document.getElementById('ng-plus-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        localStorage.setItem(NG_KEY, '1');
        location.reload();
    });
}

// ══ REPLAY ══
function initReplayButton() {
    const btn = document.getElementById('replay-btn');
    if (btn) btn.addEventListener('click', () => location.reload());
}

// ══ START SCREEN ══
function initStartScreen() {
    document.getElementById('start-btn').addEventListener('click', () => {
        if (!canStartGame()) {
            alert('Vui lòng đăng nhập hoặc bật Guest Mode trước khi chơi.');
            return;
        }
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('difficulty-screen').style.display = 'flex';
    });
}

// ══ DIFFICULTY SCREEN ══
function initDifficultyScreen() {
    document.getElementById('diff-back-btn').addEventListener('click', () => {
        document.getElementById('difficulty-screen').style.display = 'none';
        document.getElementById('start-screen').style.display = 'flex';
    });
    document.getElementById('diff-normal').addEventListener('click', () => pickDifficulty('normal'));
    document.getElementById('diff-expert').addEventListener('click', () => pickDifficulty('expert'));
    document.getElementById('diff-asian').addEventListener('click',  () => pickDifficulty('asian'));
}

// ══ AI BADGE INIT ══
function initAIBadge() {
    const badge = document.getElementById('ai-mode-badge');
    if (!badge) return;
    badge.classList.add('ai-on');
    badge.textContent = '⚡ AI Mode';
    badge.addEventListener('click', () => {
        const { USE_AI: _, setUseAI } = /* dynamic import workaround — toggle via admin */
            { USE_AI: false, setUseAI: null };
        // Chỉ admin có thể tắt AI, badge chỉ để show
    });
}

// ══ KEYBOARD SHORTCUTS ══
function initKeyboard() {
    document.addEventListener('keydown', (e) => {
        // A/B/C shortcuts để chọn choice nhanh
        const keys = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
        const idx  = keys[e.key.toLowerCase()];
        if (idx !== undefined) {
            const btns = document.querySelectorAll('.choice-btn:not(:disabled)');
            if (btns[idx]) btns[idx].click();
        }
    });
}

// ══ BOOT ══
document.addEventListener('DOMContentLoaded', async () => {
    await initAuth();
    initStartScreen();
    initDifficultyScreen();
    initItemScreen();
    initLogPanel();
    initSoundToggle();
    initThemeToggle();
    initNgPlusButton();
    initReplayButton();
    initAdmin();
    initAIBadge();
    initKeyboard();
    updateLogBadge();
    updateAIBadge();

    // Load NG+ nếu đã unlock
    if (localStorage.getItem(NG_KEY)) {
        const startBrief = document.querySelector('.start-brief');
        if (startBrief) {
            const ngChip = document.createElement('div');
            ngChip.className = 'brief-chip';
            ngChip.innerHTML = '<span class="chip-icon">⭐</span> New Game+';
            ngChip.style.borderColor = 'var(--gold-dim)';
            ngChip.style.color = 'var(--gold)';
            startBrief.appendChild(ngChip);
        }
    }
});
