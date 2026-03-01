/* ─── UI.JS — Tất cả hàm thao tác DOM ─── */

import {
    STAGE_ORDER, STAGE_ICONS, ORACLE_POOL, JUDGES, ENDING_LABELS, DIFF_LABELS,
    END_CONFIGS, LB_KEY, HALFTIME_QUOTES
} from './config.js';
import {
    state, memberMorale, currentDiff, currentDiffKey, decisionLog, memoryAlbum,
    eventsEncountered, charBubbleTimer, setCharBubbleTimer, USE_AI, decisionFlags
} from './state.js';

// ══ STATUS BAR ══
export function updateUI() {
    document.getElementById("money").innerText  = state.money.toLocaleString('vi-VN');
    document.getElementById("time").innerText   = state.time;
    document.getElementById("morale").innerText = state.morale;

    const moneyCls  = state.money  < 1000000          ? "stat-card danger" : "stat-card";
    const timeCls   = state.time   <= 3                ? "stat-card danger" : "stat-card";
    const moraleCls = state.morale <= 30               ? "stat-card danger" : "stat-card";
    document.getElementById("money-container").className  = moneyCls;
    document.getElementById("time-container").className   = timeCls;
    document.getElementById("morale-container").className = moraleCls;

    const moneyPct  = Math.max(0, Math.min(100, (state.money / 6000000) * 100));
    const timePct   = Math.max(0, Math.min(100, (state.time  / 25)      * 100));
    const moralePct = Math.max(0, Math.min(100, state.morale));
    document.getElementById("money-fill").style.width  = moneyPct  + "%";
    document.getElementById("time-fill").style.width   = timePct   + "%";
    document.getElementById("morale-fill").style.width = moralePct + "%";
}

// ══ STAGE PROGRESS DOTS ══
export function updateStageDots(currentStageId) {
    const idx = STAGE_ORDER.indexOf(currentStageId);
    for (let i = 1; i <= 10; i++) {
        const dot = document.getElementById("dot-" + i);
        if (!dot) continue;
        const dotIdx = i - 1;
        dot.className = "s-dot";
        if (idx < 0) return;
        if (dotIdx < idx)       dot.classList.add("done");
        else if (dotIdx === idx) dot.classList.add("active");
    }
}

// ══ AI BADGE ══
export function updateAIBadge() {
    const badge = document.getElementById('ai-mode-badge');
    if (!badge) return;
    badge.className = USE_AI ? 'ai-on' : 'ai-off';
    badge.textContent = USE_AI ? '⚡ AI Mode' : '📋 Classic Mode';
}

// ══ MEMBER MORALE ══
export function updateMemberMorale(moraleChange) {
    const members = ['tung','mai','khoa','linh'];
    members.forEach(m => {
        const delta = moraleChange + (Math.random() > 0.5 ? Math.floor(Math.random()*5) : -Math.floor(Math.random()*5));
        memberMorale[m] = Math.max(0, Math.min(100, memberMorale[m] + delta));
        const fill = document.getElementById(`mbar-${m}`);
        const chip = document.getElementById(`member-${m}`);
        if (!fill || !chip) return;
        fill.style.width = memberMorale[m] + "%";
        const pct = memberMorale[m];
        fill.style.background = pct > 60 ? "var(--success)" : pct > 30 ? "var(--warning)" : "var(--danger)";
        chip.className = "member-chip" + (pct <= 25 ? " low" : pct === 0 ? " left" : "");
    });
}

// ══ ORACLE HINT ══
export function showOracleHint(stageIdx) {
    const el = document.getElementById('oracle-hint');
    const textEl = document.getElementById('oracle-text');
    if (!el || !textEl) return;
    if (Math.random() > 0.6) { el.style.display = 'none'; return; }
    const hint = ORACLE_POOL[(stageIdx + Math.floor(Math.random() * 3)) % ORACLE_POOL.length];
    el.querySelector('.oracle-icon').textContent = hint.icon;
    textEl.textContent = hint.text;
    el.style.display = 'flex';
}

// ══ PILLS từ effect ══
export function buildPillsFromEffect(effect) {
    if (!effect) return '';
    const pills = [];
    const money = effect.money || 0;
    const time  = effect.time  || 0;

    if (money !== 0) {
        const label = money < 0
            ? `💰 -${Math.abs(money/1000).toLocaleString('vi-VN')}k`
            : `💰 +${(money/1000).toLocaleString('vi-VN')}k`;
        const cls = money < 0 ? 'pill pill-money-neg' : 'pill pill-money-pos';
        pills.push(`<span class="${cls}">${label}</span>`);
    } else {
        pills.push(`<span class="pill pill-free">💰 Miễn phí</span>`);
    }

    if (time !== 0) {
        pills.push(`<span class="pill pill-time">⏱️ ${time} ngày</span>`);
    } else {
        pills.push(`<span class="pill pill-free">⏱️ 0 ngày</span>`);
    }
    return pills.join('');
}

// ══ LOG PANEL ══
export function updateLogBadge() {
    const badge = document.getElementById('log-count-badge');
    if (badge) badge.textContent = decisionLog.length;
}

export function renderDecisionLogPanel() {
    const container = document.getElementById('log-entries');
    if (!container) return;
    if (decisionLog.length === 0) {
        container.innerHTML = '<p class="log-empty">Chưa có quyết định nào được ghi lại.</p>';
        return;
    }
    container.innerHTML = decisionLog.map((entry, i) => {
        const pillsHtml = Object.entries(entry.effect || {}).map(([k, v]) => {
            if (v === 0) return '';
            const icons  = { money:'💰', time:'⏱️', morale:'❤️', quality:'⭐' };
            const labels = { money:`${v>0?'+':''}${(v/1000).toFixed(0)}k`, time:`${v>0?'+':''}${v}ng`, morale:`${v>0?'+':''}${v}%`, quality:`${v>0?'+':''}${v}đ` };
            const cls = v > 0 ? 'le-pill le-pos' : 'le-pill le-neg';
            return `<span class="${cls}">${icons[k]||''} ${labels[k]||v}</span>`;
        }).filter(Boolean).join('');
        return `<div class="log-entry">
            <div class="log-entry-stage">Giai đoạn ${i+1} · ${entry.stageTitle}</div>
            <div class="log-entry-choice">${entry.choiceText}</div>
            ${pillsHtml ? `<div class="log-entry-effects">${pillsHtml}</div>` : ''}
        </div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

// ══ CHAR BUBBLE ══
export function showCharBubble(charName, charIcon, text) {
    const bubble  = document.getElementById('char-bubble');
    const nameEl  = document.getElementById('cb-name');
    const textEl  = document.getElementById('cb-text');
    const avatarEl= document.getElementById('cb-avatar');
    if (!bubble || !nameEl || !textEl || !avatarEl) return;

    clearTimeout(charBubbleTimer);
    bubble.classList.remove('show');

    requestAnimationFrame(() => {
        avatarEl.textContent = charIcon;
        nameEl.textContent   = charName;
        textEl.textContent   = text;
        requestAnimationFrame(() => bubble.classList.add('show'));
    });

    setCharBubbleTimer(setTimeout(() => bubble.classList.remove('show'), 4500));
}

// ══ MEMORY ALBUM ══
export function pushToAlbum(stageIdx, choiceText) {
    memoryAlbum.push({
        icon: STAGE_ICONS[stageIdx % STAGE_ICONS.length],
        stageLabel: `GĐ ${stageIdx + 1}`,
        caption: choiceText.substring(0, 28).replace(/^[A-Za-z]\.\s*/, '') + (choiceText.length > 28 ? '…' : '')
    });
}

export function renderMemoryAlbum() {
    const section = document.getElementById('memory-album');
    const strip   = document.getElementById('album-strip');
    if (!section || !strip || memoryAlbum.length === 0) { if (section) section.style.display = 'none'; return; }
    section.style.display = 'block';
    strip.innerHTML = memoryAlbum.map(p => `
        <div class="polaroid">
            <span class="polaroid-icon">${p.icon}</span>
            <div class="polaroid-stage">${p.stageLabel}</div>
            <div class="polaroid-caption">${p.caption}</div>
        </div>`).join('');
}

// ══ LEADERSHIP PROFILE ══
export function renderLeadershipProfile(data) {
    const card = document.getElementById('leadership-profile-card');
    const body = document.getElementById('lp-card-body');
    if (!card || !body) return;
    card.style.display = 'block';
    if (!data) {
        body.innerHTML = `<div style="font-size:0.88rem;color:var(--text-dim);font-style:italic;">Không đủ dữ liệu để phân tích (cần ≥ 3 quyết định).</div>`;
        return;
    }
    body.innerHTML = `
        <div class="lp-card-top">
            <div id="lp-icon">${data.icon || '🎯'}</div>
            <div id="lp-style">${data.style || 'Lãnh đạo độc đáo'}</div>
        </div>
        <div id="lp-desc">${data.description || ''}</div>
        <div class="lp-tags">
            ${data.strength_tag ? `<span class="lp-tag lp-tag-strength">✅ ${data.strength_tag}</span>` : ''}
            ${data.blind_tag    ? `<span class="lp-tag lp-tag-blind">⚠️ ${data.blind_tag}</span>` : ''}
        </div>`;
}

// ══ JUDGE PANEL ══
export function renderJudgePanel(data) {
    const panel = document.getElementById('judge-panel');
    const cards = document.getElementById('judge-cards');
    if (!panel || !cards) return;
    panel.style.display = 'block';
    if (!data) {
        cards.innerHTML = `<div style="font-size:0.82rem;color:var(--text-dim);font-style:italic;text-align:center;padding:12px">Hội đồng không đưa ra ý kiến lần này.</div>`;
        return;
    }
    const verdicts = [data.phu_huynh, data.ke_toan, data.co_giao];
    cards.innerHTML = JUDGES.map((j, i) => `
        <div class="judge-card">
            <div class="judge-avatar">${j.icon}</div>
            <div class="judge-info">
                <div class="judge-name">${j.name}</div>
                <div class="judge-verdict">"${verdicts[i] || '...'}"</div>
            </div>
        </div>`).join('');
}

// ══ LEADERBOARD ══
export function saveToLeaderboard(sceneId) {
    try {
        const entry = {
            date: new Date().toLocaleDateString('vi-VN'),
            ending: sceneId,
            label: ENDING_LABELS[sceneId] || sceneId,
            quality: state.quality,
            diff: currentDiffKey,
            icon: DIFF_LABELS[currentDiffKey] || ''
        };
        const all = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
        all.push(entry);
        all.sort((a, b) => b.quality - a.quality);
        localStorage.setItem(LB_KEY, JSON.stringify(all.slice(0, 15)));
        return entry;
    } catch(e) { return null; }
}

export function renderLeaderboard(newEntry) {
    const section = document.getElementById('leaderboard-section');
    const body    = document.getElementById('lb-body');
    if (!section || !body) return;
    try {
        const all = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
        if (all.length === 0) { section.style.display = 'none'; return; }
        section.style.display = 'block';
        body.innerHTML = all.map((e, i) => {
            const isNew = newEntry && e.date === newEntry.date && e.quality === newEntry.quality && e.ending === newEntry.ending;
            return `<div class="lb-row${isNew ? ' lb-new' : ''}">
                <span class="lb-rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                <span class="lb-ending">${e.icon} ${e.label}</span>
                <span class="lb-score">⭐ ${e.quality}</span>
                <span class="lb-diff">${e.diff || ''}</span>
                <span class="lb-date">${e.date}</span>
            </div>`;
        }).join('');
    } catch(e) { section.style.display = 'none'; }
}

// ══ HALFTIME ══
export function showHalftime(nextStageId, onContinue) {
    document.getElementById("ht-money").innerText  = state.money.toLocaleString('vi-VN') + "đ";
    document.getElementById("ht-time").innerText   = state.time + " ngày";
    document.getElementById("ht-morale").innerText = state.morale + "%";
    document.getElementById("ht-quality").innerText= state.quality + " điểm";
    document.getElementById("ht-quote").innerText  = HALFTIME_QUOTES[Math.floor(Math.random() * HALFTIME_QUOTES.length)];
    document.getElementById("halftime-overlay").style.display = "flex";
    document.getElementById("halftime-continue").onclick = () => {
        document.getElementById("halftime-overlay").style.display = "none";
        onContinue();
    };
}

// ══ END SCREEN ══
export function showEndScreen(sceneId) {
    const cfg = END_CONFIGS[sceneId] || { badge:"🎯", title:"KẾT THÚC", subtitle:"", color:"var(--gold)", image:"" };

    document.getElementById("end-badge").innerText   = cfg.badge;
    const titleEl = document.getElementById("end-title");
    titleEl.innerText      = cfg.title;
    titleEl.style.color    = cfg.color;
    document.getElementById("end-subtitle").innerText = cfg.subtitle;

    const endImgContainer = document.getElementById("end-image-container");
    const endImg = document.getElementById("end-image");
    if (cfg.image) { endImg.src = cfg.image; endImgContainer.style.display = "block"; }
    else           { endImgContainer.style.display = "none"; }

    document.getElementById("end-money").innerText   = Math.max(0, state.money).toLocaleString('vi-VN') + "đ";
    document.getElementById("end-time").innerText    = Math.max(0, state.time) + " ngày";
    document.getElementById("end-morale").innerText  = state.morale + "%";
    document.getElementById("end-quality").innerText = state.quality + " điểm";
    document.getElementById("end-events").innerText  = eventsEncountered + " lần";

    const moraleEl = document.getElementById("end-morale");
    moraleEl.style.color = state.morale <= 30 ? "var(--danger)" : state.morale >= 80 ? "var(--success)" : "var(--warning)";

    const secretHint = document.getElementById("secret-hint");
    if (secretHint) secretHint.style.display = sceneId === "end_perfect" ? "block" : "none";

    document.getElementById("end-screen").style.display = "flex";
}

// ══════════════════════════════════════════════════════
//  UI ADDITIONS — Trust Bars · Branch Indicator · Trust Event
//  (Nâng cấp v2: Decision Flags · Trust System · Branching)
// ══════════════════════════════════════════════════════

/**
 * Cập nhật 4 trust bars trong member-morale-bar.
 * trust: { tung, mai, khoa, linh } — giá trị 0–100
 */
export function updateTrustBars(trust) {
    const chars = ['tung', 'mai', 'khoa', 'linh'];
    chars.forEach(m => {
        const v = trust[m] ?? 50;

        // Màu theo ngưỡng
        const color = v > 80 ? 'var(--success)' : v > 40 ? 'var(--warning)' : 'var(--danger)';

        // Cập nhật morale bar (dùng chung element, giờ đại diện trust)
        const fill = document.getElementById(`mbar-${m}`);
        if (fill) {
            fill.style.width   = v + '%';
            fill.style.background = color;
        }

        // Tooltip trust level trên chip
        const chip = document.getElementById(`member-${m}`);
        if (chip) {
            const label = v > 80 ? '🤝' : v > 60 ? '😊' : v > 40 ? '😐' : v > 20 ? '😒' : '😡';
            // Cập nhật avatar để phản ánh trust
            const avatar = chip.querySelector('.member-avatar');
            if (avatar) avatar.textContent = label;
            chip.title = `Trust: ${v}/100`;
        }
    });
}

/**
 * Hiển thị trust event notification (loyalty hoặc betrayal).
 * Dạng toast nổi lên giữa màn hình, tự biến mất sau 4s.
 */
export function showTrustEvent({ type, memberName, memberIcon, message }) {
    // Xoá toast cũ nếu có
    document.getElementById('trust-event-toast')?.remove();

    const toast = document.createElement('div');
    toast.id = 'trust-event-toast';
    toast.className = `trust-toast trust-toast-${type} fade-in`;
    toast.innerHTML = `
        <div class="tt-icon">${memberIcon}</div>
        <div class="tt-body">
            <div class="tt-type">${type === 'loyalty' ? '🤝 ĐỒNG MINH TRUNG THÀNH' : '⚠️ CẢNH BÁO PHẢN BỘI'}</div>
            <div class="tt-name">${memberName}</div>
            <div class="tt-msg">${message}</div>
        </div>`;

    // Insert sau status-bar
    const statusBar = document.querySelector('.status-bar');
    statusBar?.after(toast);
    setTimeout(() => toast.classList.add('tt-exit'), 3500);
    setTimeout(() => toast.remove(), 4200);
}

/**
 * Hiển thị Branch Indicator — màn hình transition trước khi vào stage 6a/6b.
 * Gọi callback onContinue sau khi người chơi bấm nút.
 */
export function showBranchIndicator({ isTrackA, titleA, subtitleA, titleB, subtitleB, onContinue }) {
    // Tái dùng halftime-overlay với nội dung mới
    const overlay = document.getElementById('halftime-overlay');
    if (!overlay) { onContinue(); return; }

    const color = isTrackA ? 'var(--success)' : 'var(--danger)';
    const icon  = isTrackA ? '🤝' : '⚡';
    const title = isTrackA ? titleA : titleB;
    const sub   = isTrackA ? subtitleA : subtitleB;

    overlay.innerHTML = `
        <div class="halftime-label" style="background:${isTrackA ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)'};border-color:${color}">
            ${isTrackA ? '✦ RẼ NHÁNH: ĐI ĐƯỜNG NÀO? ✦' : '✦ RẼ NHÁNH: CON ĐƯỜNG KHÓ ✦'}
        </div>
        <div style="font-size:3rem;margin-bottom:10px;animation:badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both">${icon}</div>
        <h2 style="font-family:'Playfair Display',serif;font-size:clamp(1.4rem,4vw,2rem);color:${color};margin-bottom:10px;letter-spacing:1px">${title}</h2>
        <p style="font-size:clamp(0.9rem,2vw,1.05rem);color:var(--text-sub);font-style:italic;max-width:440px;line-height:1.75;margin-bottom:28px">${sub}</p>
        <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;justify-content:center">
            <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:12px 18px;font-size:0.85rem;color:var(--text-sub)">
                🏷 Flags tích luỹ: <strong style="color:${color}">${[...decisionFlags].join(', ') || 'chưa có'}</strong>
            </div>
        </div>
        <button id="branch-continue" style="
            padding:14px 40px;font-size:1rem;font-weight:700;
            background:${color};color:#000;border:none;border-radius:50px;
            cursor:pointer;letter-spacing:1px;font-family:Inter,sans-serif;
            transition:all 0.22s;box-shadow:0 0 24px rgba(0,0,0,0.3)
        ">${isTrackA ? '🚀 Bước vào chặng mới' : '⚔️ Đối mặt với khủng hoảng'}</button>`;

    overlay.style.display = 'flex';

    document.getElementById('branch-continue').onclick = () => {
        overlay.style.display = 'none';
        // Restore halftime-overlay content bình thường (bằng cách set innerHTML thay thế)
        // (không cần vì showHalftime sẽ tự fill lại khi cần)
        onContinue();
    };
}

