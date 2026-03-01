/* ─── GAME.JS — Core Engine v2 ─── */
/* Tích hợp: Decision Flags · Trust System · Hard Branching · Expanded Endings */

import {
    STORY, STAGE_ORDER, STATIC_EVENTS, BONUS_OPPORTUNITIES, CHARACTER_ROSTER,
    BRANCH_STAGES, CHOICE_META, SECRET_ENDING_CONDITIONS, END_CONFIGS_V2,
    ENDING_LABELS_V2, resolveBranch
} from './config.js';

import {
    state, currentDiff, currentDiffKey,
    USE_AI, forceNextEvent, setForceNextEvent,
    RATE_AI_EVENT, RATE_STATIC_EVENT, GUARANTEE_AT,
    stagesSinceStaticEvent, setStagesSinceStatic,
    pendingStaticEvent, setPendingStaticEvent,
    halftimeSeen, setHalftimeSeen,
    incEventsEncountered, eventsEncountered, dynamicStory,
    decisionLog, pendingDelayedEffects, memoryAlbum,
    selectedItem, redoCardUsed, setRedoCardUsed,
    speedModeEnabled,
    ngPlusActive, setBgReputation, bgReputation,
    currentStageIndex, setCurrentStageIndex,
    // Trust System
    trust, loyaltyTriggered, betrayalTriggered,
    setLoyaltyTriggered, setBetrayalTriggered,
    // Flags
    decisionFlags, addFlag, hasFlag,
    // Branch
    currentBranch, setCurrentBranch
} from './state.js';

import {
    fetchAIEvent, fetchDynamicStage, fetchCharReaction,
    fetchLeadershipProfile, fetchJudgeVerdicts
} from './api.js';

import {
    updateUI, updateStageDots, updateMemberMorale, showOracleHint,
    buildPillsFromEffect, updateLogBadge, renderDecisionLogPanel,
    showCharBubble, pushToAlbum, renderMemoryAlbum,
    renderLeadershipProfile, renderJudgePanel,
    renderLeaderboard, showHalftime,
    updateTrustBars, showTrustEvent, showBranchIndicator
} from './ui.js';

import { playSound } from './audio.js';


// ══════════════════════════════════════════════════════
//  SECTION 1: HELPERS
// ══════════════════════════════════════════════════════

export function checkGameOver() {
    if (state.money  < 0)                       return 'gameover_money';
    if (state.time   < 0)                       return 'gameover_time';
    if (state.morale < currentDiff.moraleFloor) return 'gameover_morale';
    return null;
}

function resolveNextStageId(rawNextStageId, stageIdx) {
    if (typeof rawNextStageId === 'string' && rawNextStageId.trim()) {
        return rawNextStageId.trim();
    }
    if (stageIdx >= STAGE_ORDER.length - 1) return 'calc_ending';
    return STAGE_ORDER[stageIdx + 1] || 'calc_ending';
}

function applyEffect(effect) {
    state.money   += effect.money   || 0;
    state.time    += effect.time    || 0;
    state.morale  += effect.morale  || 0;
    state.quality += effect.quality || 0;
    if (effect.morale) updateMemberMorale(effect.morale);
    updateUI();
}

function rescalePreloadedMoney(stageId) {
    const scene = dynamicStory[stageId];
    if (!scene?.choices) return;
    const maxCost = Math.min(...scene.choices.map(c => c.effect?.money || 0));
    if (maxCost >= 0) return;
    const budget = state.money * 0.75;
    if (Math.abs(maxCost) <= budget) return;
    const ratio = budget / Math.abs(maxCost);
    scene.choices.forEach(c => {
        if ((c.effect?.money || 0) < 0) c.effect.money = Math.round(c.effect.money * ratio);
    });
}

function scaleBadEffect(effect) {
    const m = currentDiff.penaltyMult;
    if (m === 1.0) return effect;
    return Object.fromEntries(
        Object.entries(effect).map(([k, v]) => [k, v < 0 ? Math.round(v * m) : v])
    );
}

function checkDelayedEffects(stageId) {
    const triggered = pendingDelayedEffects.filter(d => d.triggerStage === stageId);
    triggered.forEach(d => {
        pendingDelayedEffects.splice(pendingDelayedEffects.indexOf(d), 1);
        showDelayedNotif(d.message);
        applyEffect(d.effect);
    });
}

function showDelayedNotif(message) {
    const el = document.createElement('div');
    el.className = 'delayed-notif fade-in';
    el.innerHTML = `<span class="dn-icon">🕐</span><span>${message}</span>`;
    document.getElementById('story-text').before(el);
    setTimeout(() => el.remove(), 7000);
}

function pickStaticEvent(phase) {
    const pool = STATIC_EVENTS.filter(e => !e.phase || e.phase === phase || e.phase === 'any');
    return pool[Math.floor(Math.random() * pool.length)];
}


// ══════════════════════════════════════════════════════
//  SECTION 2: TRUST SYSTEM
// ══════════════════════════════════════════════════════

/**
 * Áp dụng trustDelta từ lựa chọn vào trust của từng nhân vật.
 * Sau đó kiểm tra loyalty / betrayal threshold.
 */
function applyTrustDelta(trustDelta) {
    if (!trustDelta) return;
    const members = ['tung', 'mai', 'khoa', 'linh'];
    members.forEach(m => {
        const delta = trustDelta[m] || 0;
        trust[m] = Math.max(0, Math.min(100, trust[m] + delta));
    });
    updateTrustBars(trust);
    checkTrustThresholds();
}

/**
 * Kiểm tra ngưỡng loyalty (>80) và betrayal (<20).
 * Mỗi loại chỉ trigger 1 lần / game.
 * - Loyalty: nhân vật đó tự giúp xử lý 1 sự kiện xấu tiếp theo (lưu pendingLoyaltyHelp)
 * - Betrayal: nhân vật đó âm thầm làm giảm quality ngẫu nhiên trong 1 stage
 */
function checkTrustThresholds() {
    const members = ['tung', 'mai', 'khoa', 'linh'];
    const charInfo = {
        tung: { name: 'Tùng', icon: '😤' },
        mai:  { name: 'Mai',  icon: '🌸' },
        khoa: { name: 'Khoa', icon: '🤔' },
        linh: { name: 'Linh', icon: '💙' }
    };

    // LOYALTY — chỉ trigger 1 lần, chọn người trust cao nhất
    if (!loyaltyTriggered) {
        const loyalMember = members.find(m => trust[m] > 80);
        if (loyalMember) {
            setLoyaltyTriggered(true);
            pendingLoyaltyHelp = loyalMember;
            const c = charInfo[loyalMember];
            // Hiển thị char bubble thông báo
            showCharBubble(
                c.name, c.icon,
                'Tôi sẽ không bỏ bạn đâu. Cứ giao tôi việc nặng nhất!'
            );
            showTrustEvent({
                type: 'loyalty',
                memberName: c.name,
                memberIcon: c.icon,
                message: `${c.name} trở thành đồng minh trung thành! Họ sẽ tự động giảm nhẹ 1 sự kiện xấu tiếp theo.`
            });
        }
    }

    // BETRAYAL — chỉ trigger 1 lần, chọn người trust thấp nhất
    if (!betrayalTriggered) {
        const betrayer = members.find(m => trust[m] < 20);
        if (betrayer) {
            setBetrayalTriggered(true);
            pendingBetrayalPenalty = betrayer;
            const c = charInfo[betrayer];
            showTrustEvent({
                type: 'betrayal',
                memberName: c.name,
                memberIcon: c.icon,
                message: `${c.name} mất tin tưởng hoàn toàn. Họ sẽ âm thầm làm hỏng chất lượng một công đoạn...`
            });
        }
    }
}

// Lưu pending loyalty/betrayal để xử lý ở event tiếp theo
let pendingLoyaltyHelp    = null; // tên member đang loyal
let pendingBetrayalPenalty = null; // tên member đang betrayal

/**
 * Nếu đang có loyalty pending → giảm 50% penalty của event xấu tiếp theo.
 * Nếu đang có betrayal pending → apply -quality -10 âm thầm sau 1 stage.
 */
function processLoyaltyBetrayal(isBadEvent, effect) {
    let modifiedEffect = { ...effect };

    if (isBadEvent && pendingLoyaltyHelp) {
        // Giảm 50% tất cả penalty
        modifiedEffect = Object.fromEntries(
            Object.entries(effect).map(([k, v]) => [k, v < 0 ? Math.round(v * 0.5) : v])
        );
        const charInfo = { tung:'Tùng', mai:'Mai', khoa:'Khoa', linh:'Linh' };
        const icons    = { tung:'😤', mai:'🌸', khoa:'🤔', linh:'💙' };
        const m = pendingLoyaltyHelp;
        showCharBubble(charInfo[m], icons[m], 'Để tôi lo! Tôi đã lường trước chuyện này rồi.');
        pendingLoyaltyHelp = null;
    }

    if (pendingBetrayalPenalty) {
        // Schedule quality penalty vào stage kế tiếp
        const c = pendingBetrayalPenalty;
        const charInfo = { tung:'Tùng', mai:'Mai', khoa:'Khoa', linh:'Linh' };
        pendingDelayedEffects.push({
            triggerStage: STAGE_ORDER[currentStageIndex + 1] || 'stage_10',
            effect: { quality: -10 },
            message: `😡 ${charInfo[c]} đã âm thầm bỏ qua một số hạng mục. Chất lượng bị ảnh hưởng.`
        });
        pendingBetrayalPenalty = null;
    }

    return modifiedEffect;
}


// ══════════════════════════════════════════════════════
//  SECTION 3: BRANCHING — STAGE 5 → 6A / 6B
// ══════════════════════════════════════════════════════

/**
 * Sau khi người chơi chọn xong stage_5, quyết định vào track nào.
 * Kết quả được hiển thị brief trước khi renderScene.
 */
function resolveAndShowBranch(callback) {
    const branchId = resolveBranch({ morale: state.morale, flags: decisionFlags });
    const isTrackA = branchId === 'stage_6a';
    setCurrentBranch(isTrackA ? 'A' : 'B');

    showBranchIndicator({
        isTrackA,
        titleA: '🤝 Con đường Đoàn Kết',
        subtitleA: 'Nhóm đang vận hành tốt. Thách thức phía trước sẽ là sáng tạo tập thể.',
        titleB: '⚡ Con đường Khủng Hoảng',
        subtitleB: 'Nội bộ đang rạn nứt. Bạn cần hàn gắn trước khi mọi thứ vỡ vụn.',
        onContinue: () => callback(branchId)
    });
}

/**
 * Scene branch dùng BRANCH_STAGES data (không qua AI để đảm bảo nội dung chính xác).
 * Nhưng vẫn có choices với flag + trustDelta riêng.
 */
function renderBranchScene(branchId) {
    const scene = BRANCH_STAGES[branchId];
    if (!scene) { renderScene('stage_7'); return; }

    updateStageDots('stage_6');

    const storyEl = document.getElementById('story-text');
    storyEl.innerHTML = scene.text;
    storyEl.classList.remove('fade-in');
    void storyEl.offsetWidth;
    storyEl.classList.add('fade-in');

    const imgContainer = document.getElementById('image-container');
    if (scene.image) {
        document.getElementById('scene-image').src = scene.image;
        imgContainer.style.display = 'block';
    } else {
        imgContainer.style.display = 'none';
    }

    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    const labels = ['A', 'B', 'C'];

    scene.choices.forEach((choice, i) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn fade-in';
        btn.style.animationDelay = (i * 0.07) + 's';
        const pillsHtml = buildPillsFromEffect(choice.effect);
        btn.innerHTML = `
            <div class="choice-badge">${labels[i]}</div>
            <div class="choice-body">
                <div class="choice-text">${choice.text}</div>
                <div class="choice-pills">${pillsHtml}</div>
            </div>`;
        btn.onclick = () => handleBranchChoice(choice, branchId, i);
        choicesDiv.appendChild(btn);
    });

    document.getElementById('game-container').scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleBranchChoice(choice, branchId, choiceIdx) {
    playSound('click');

    // Ghi log
    const scene = BRANCH_STAGES[branchId];
    decisionLog.push({
        stageTitle: branchId === 'stage_6a' ? 'GĐ 6A: Sức Mạnh Tập Thể' : 'GĐ 6B: Khủng Hoảng Nội Bộ',
        choiceText: choice.text,
        effect: choice.effect || {}
    });
    updateLogBadge();
    pushToAlbum(5, choice.text);

    // Flag
    if (choice.flag) addFlag(choice.flag);
    if (choice.bgRep) setBgReputation(bgReputation + choice.bgRep);

    // Trust
    applyTrustDelta(choice.trustDelta);

    applyEffect(choice.effect || {});

    const fail = checkGameOver();
    if (fail) { renderScene(fail); return; }

    // Character reaction
    if (USE_AI) {
        const roster = [
            { name:'Tùng',icon:'😤',trait:'thực dụng' },
            { name:'Mai', icon:'🌸',trait:'lạc quan'  }
        ];
        const char = roster[Math.floor(Math.random() * roster.length)];
        fetchCharReaction(char, choice.text, choice.effect || {}).then(r => {
            if (r) showCharBubble(r.name, r.icon, r.text);
        });
    }

    // Transition thẳng vào stage_7 (branch đã xong)
    document.getElementById('loading-overlay').style.display = 'flex';

    const stagePromise = dynamicStory['stage_7'] ? Promise.resolve(null) : fetchDynamicStage('stage_7');
    const [dynamicStageData] = await Promise.all([stagePromise]);
    if (dynamicStageData) dynamicStory['stage_7'] = dynamicStageData;

    document.getElementById('loading-overlay').style.display = 'none';
    maybeShowHalftime('stage_7');
}


// ══════════════════════════════════════════════════════
//  SECTION 4: ENDING MATRIX MỞ RỘNG
// ══════════════════════════════════════════════════════

/**
 * Tính ending dựa trên ma trận 3 chiều: quality × morale × flags/trust.
 * Kiểm tra Secret Endings trước, sau đó Regular Endings.
 */
export function calcEnding() {
    const fail = checkGameOver();
    if (fail) return fail;

    const qualityEffective = state.quality + bgReputation * 5;
    const { qualityBad, qualityGood } = currentDiff;

    // ── SECRET ENDINGS (kiểm tra trước) ──
    for (const cond of SECRET_ENDING_CONDITIONS) {
        const pass = cond.check({
            flags: decisionFlags,
            quality: qualityEffective,
            diffQualityBad: qualityBad,
            trustTung: trust.tung
        });
        if (pass) return cond.id;
    }

    // ── REGULAR ENDING MATRIX ──
    if (qualityEffective < qualityBad) return 'end_bad';

    if (qualityEffective >= qualityGood) {
        // Top tier: phân biệt theo morale và branch
        if (state.morale >= 75 && currentBranch === 'A') return 'end_legend';
        if (state.morale >= 50)                          return 'end_perfect';
        return 'end_perfectionists'; // chất lượng cao nhưng nhóm kiệt sức
    }

    // Mid tier: phân biệt theo morale
    if (state.morale < 40) return 'end_hollow'; // đủ điểm nhưng nhóm tan vỡ
    return 'end_normal';
}


// ══════════════════════════════════════════════════════
//  SECTION 5: EVENT POPUP
// ══════════════════════════════════════════════════════

export function showEventPopup(data, nextStageId, isAi) {
    incEventsEncountered();
    playSound(isAi ? 'gamble' : data.type === 'bad' ? 'bad' : 'good');

    const overlay   = document.getElementById('event-overlay');
    const titleTag  = document.getElementById('event-title');
    const descTag   = document.getElementById('event-desc');
    const btnBox    = document.getElementById('event-buttons');
    const winRateEl = document.getElementById('win-rate-label');
    const iconEl    = document.getElementById('event-icon');
    const resultEl  = document.getElementById('gamble-result');

    btnBox.innerHTML = '';
    resultEl.style.display = 'none';
    resultEl.className = '';
    winRateEl.style.display = 'none';
    overlay.className = '';

    if (isAi) {
        // ─ GAMBLE EVENT ─
        overlay.classList.add('tint-gamble');
        iconEl.innerText = '🎲';
        titleTag.innerText = data.event_title;
        titleTag.style.color = 'var(--warning)';
        descTag.innerHTML = `<i>${data.event_description}</i>`;
        winRateEl.style.display = 'inline-block';
        winRateEl.innerText = `🎯 Tỉ lệ thắng: ${data.gamble_choice.win_rate}%`;

        const btnGamble = document.createElement('button');
        btnGamble.className = 'event-btn gamble-fire';
        btnGamble.innerHTML = `🔥 ${data.gamble_choice.text}`;
        btnGamble.onclick = () => {
            btnGamble.disabled = true;
            btnGamble.parentElement.querySelectorAll('button').forEach(b => b.disabled = true);
            playSound('gamble');
            const roll = Math.floor(Math.random() * 100) + 1;
            const win  = roll <= data.gamble_choice.win_rate;
            resultEl.style.display = 'block';
            resultEl.className = win ? 'win' : 'lose';
            document.getElementById('gr-icon').innerText = win ? '🎉' : '💀';
            document.getElementById('gr-text').innerText  = win
                ? 'ĐẠI THẮNG! Vận may đứng về phía bạn!'
                : 'THUA SẠCH! Vận rủi đã ập đến...';
            playSound(win ? 'good' : 'bad');
            setTimeout(() => {
                const raw = win ? data.gamble_choice.win_effect : data.gamble_choice.lose_effect;
                const eff = processLoyaltyBetrayal(!win, raw);
                applyEffectAndNext(eff, nextStageId);
            }, 1800);
        };

        const btnSafe = document.createElement('button');
        btnSafe.className = 'event-btn gamble-safe';
        btnSafe.innerHTML = `🛡️ ${data.safe_choice.text}`;
        btnSafe.onclick = () => applyEffectAndNext(data.safe_choice.effect, nextStageId);

        btnBox.appendChild(btnGamble);
        btnBox.appendChild(btnSafe);

    } else {
        // ─ STATIC EVENT ─
        const isBad = data.type === 'bad';
        overlay.classList.add(isBad ? 'tint-bad' : 'tint-good');
        iconEl.innerText = isBad ? '⚠️' : '✨';
        titleTag.innerText = data.title;
        titleTag.style.color = isBad ? 'var(--danger)' : 'var(--success)';
        descTag.innerText = data.desc;

        if (isBad) {
            document.getElementById('game-container').classList.add('shake');
            setTimeout(() => document.getElementById('game-container').classList.remove('shake'), 500);
        }

        let scaledEffect = isBad ? scaleBadEffect(data.effect) : data.effect;
        scaledEffect = processLoyaltyBetrayal(isBad, scaledEffect);

        const btnOk = document.createElement('button');
        btnOk.className = 'event-btn event-btn-full';
        btnOk.style.borderColor = isBad ? 'rgba(248,113,113,0.4)' : 'rgba(74,222,128,0.4)';
        btnOk.style.color = isBad ? 'var(--danger)' : 'var(--success)';
        btnOk.innerHTML = isBad ? '😤 Chấp nhận và tiếp tục' : '🙌 Tuyệt vời! Tiếp tục thôi';
        btnOk.onclick = () => applyEffectAndNext(scaledEffect, nextStageId);
        btnBox.appendChild(btnOk);

        const canUseRedoCard = isBad && selectedItem === 'redo' && !redoCardUsed;
        const redoAlreadyUsed = isBad && selectedItem === 'redo' && redoCardUsed;

        if (canUseRedoCard) {
            const btnPardon = document.createElement('button');
            btnPardon.className = 'event-btn';
            btnPardon.style.borderColor = 'rgba(96,165,250,0.45)';
            btnPardon.style.color = 'var(--info, #60a5fa)';
            btnPardon.innerHTML = '🛡️ Dùng thẻ ân xá (bỏ qua sự cố)';
            btnPardon.onclick = () => {
                setRedoCardUsed(true);
                proceedAfterEvent(nextStageId);
            };
            btnBox.appendChild(btnPardon);
        } else if (redoAlreadyUsed) {
            const usedBadge = document.createElement('div');
            usedBadge.className = 'event-redo-status';
            usedBadge.innerText = '🪪 Thẻ ân xá đã dùng trong ván này';
            btnBox.appendChild(usedBadge);
        }
    }

    overlay.style.display = 'flex';
}

function applyEffectAndNext(effect, nextStageId) {
    applyEffect(effect);
    proceedAfterEvent(nextStageId);
}

function proceedAfterEvent(nextStageId) {
    document.getElementById('event-overlay').style.display = 'none';

    const fail = checkGameOver();
    if (fail) { renderScene(fail); return; }

    if (pendingStaticEvent) {
        const ev = pendingStaticEvent;
        setPendingStaticEvent(null);
        showEventPopup(ev, nextStageId, false);
        return;
    }

    if (nextStageId === '__branch__') {
        maybeShowHalftime('stage_6');
        return;
    } else {
        maybeShowHalftime(nextStageId);
    }
}


// ══════════════════════════════════════════════════════
//  SECTION 6: BONUS OPPORTUNITY
// ══════════════════════════════════════════════════════

function checkBonusOpportunity(nextStageId, onDone) {
    const bonus = BONUS_OPPORTUNITIES.find(b => b.triggerBeforeStage === nextStageId);
    if (!bonus) { onDone(); return; }

    const seen = sessionStorage.getItem(`bonus_seen_${bonus.id}`);
    if (seen) { onDone(); return; }
    sessionStorage.setItem(`bonus_seen_${bonus.id}`, '1');

    const overlay = document.getElementById('bonus-overlay');
    document.getElementById('bonus-icon').innerText  = bonus.icon;
    document.getElementById('bonus-title').innerText = bonus.title;
    document.getElementById('bonus-desc').innerText  = bonus.desc;
    document.getElementById('bonus-cost-label').innerText = bonus.costLabel;

    const btnsEl = document.getElementById('bonus-btns');
    btnsEl.innerHTML = '';
    overlay.style.display = 'flex';

    const btnAcc = document.createElement('button');
    btnAcc.className = 'bonus-btn accept';
    btnAcc.textContent = bonus.labelAccept;
    btnAcc.onclick = () => { overlay.style.display = 'none'; applyEffect(bonus.accept); onDone(); };

    const btnSkip = document.createElement('button');
    btnSkip.className = 'bonus-btn skip';
    btnSkip.textContent = bonus.labelSkip;
    btnSkip.onclick = () => { overlay.style.display = 'none'; onDone(); };

    btnsEl.appendChild(btnAcc);
    btnsEl.appendChild(btnSkip);
}


// ══════════════════════════════════════════════════════
//  SECTION 7: HALFTIME CHECK
// ══════════════════════════════════════════════════════

function maybeShowHalftime(nextStageId) {
    // Halftime xuất hiện trước khi vào stage_6 (branch point)
    if ((nextStageId === 'stage_6a' || nextStageId === 'stage_6b' || nextStageId === 'stage_6') && !halftimeSeen) {
        setHalftimeSeen(true);
        // Tính branch trước halftime để người chơi đã biết mình vào track nào
        const branchId = resolveBranch({ morale: state.morale, flags: decisionFlags });
        showHalftime(branchId, () => resolveAndShowBranch(branchId2 => renderBranchScene(branchId2)));
    } else {
        checkBonusOpportunity(nextStageId, () => renderScene(nextStageId));
    }
}


// ══════════════════════════════════════════════════════
//  SECTION 8: HANDLE TRANSITION (main entry)
// ══════════════════════════════════════════════════════

export async function handleTransition(choice, nextStageId, stageIdx, choiceIdx) {
    playSound('click');

    // ── Ghi log ──
    const stageData  = STORY[STAGE_ORDER[stageIdx]];
    const stageTitle = (stageData?.text || '').match(/<b>(.*?)<\/b>/)?.[1] || `GĐ ${stageIdx + 1}`;
    decisionLog.push({ stageTitle, choiceText: choice.text, effect: choice.effect || {} });
    updateLogBadge();
    pushToAlbum(stageIdx, choice.text);

    // ── Decision Flag (từ CHOICE_META hoặc choice.flag trực tiếp) ──
    const stageKey = STAGE_ORDER[stageIdx];
    const meta = CHOICE_META[stageKey]?.[choiceIdx];
    const flag = choice.flag || meta?.flag;
    if (flag) addFlag(flag);

    // ── bgReputation ──
    if (choice.bgRep) setBgReputation(bgReputation + choice.bgRep);

    // ── Delayed effects ──
    if (choice.delayed) pendingDelayedEffects.push(choice.delayed);

    // ── Trust Delta (từ choice trực tiếp hoặc CHOICE_META) ──
    const trustDelta = choice.trustDelta || meta?.trustDelta;
    applyTrustDelta(trustDelta);

    // ── Apply effect ──
    applyEffect(choice.effect || {});

    if (dynamicStory[nextStageId]) rescalePreloadedMoney(nextStageId);

    const fail = checkGameOver();
    if (fail) { playSound('gameover'); renderScene(fail); return; }

    // Đặc biệt: nếu nextStage là calc_ending/end/gameover → render luôn
    if (nextStageId === 'calc_ending'
        || (typeof nextStageId === 'string' && (nextStageId.startsWith('end_') || nextStageId.startsWith('gameover')))) {
        renderScene(nextStageId);
        return;
    }

    // ── Character reaction (background) ──
    if (USE_AI) {
        const roster = CHARACTER_ROSTER;
        const char = roster[Math.floor(Math.random() * roster.length)];
        fetchCharReaction(char, choice.text, choice.effect || {})
            .then(r => { if (r) showCharBubble(r.name, r.icon, r.text); });
    }

    // ── Loading + Events ──
    document.getElementById('loading-overlay').style.display = 'flex';

    const triggerAiEvent = forceNextEvent || (USE_AI && Math.random() <= RATE_AI_EVENT);
    if (forceNextEvent) setForceNextEvent(false);

    const phase = stageIdx < 4 ? 'early' : stageIdx < 7 ? 'mid' : 'late';
    const triggerStaticEvent = stagesSinceStaticEvent >= GUARANTEE_AT || Math.random() < RATE_STATIC_EVENT;
    if (triggerStaticEvent) {
        setStagesSinceStatic(0);
        setPendingStaticEvent(pickStaticEvent(phase));
    } else {
        setStagesSinceStatic(stagesSinceStaticEvent + 1);
        setPendingStaticEvent(null);
    }

    // Stage 5 → branch: không cần preload stage_6 vì đó là branch stages
    const isGoingToBranch = nextStageId === 'stage_6';
    const eventPromise = triggerAiEvent ? fetchAIEvent() : Promise.resolve(null);
    const stagePromise = (!isGoingToBranch && !dynamicStory[nextStageId])
        ? fetchDynamicStage(nextStageId)
        : Promise.resolve(null);

    const [aiEventData, dynamicStageData] = await Promise.all([eventPromise, stagePromise]);
    if (dynamicStageData) dynamicStory[nextStageId] = dynamicStageData;

    document.getElementById('loading-overlay').style.display = 'none';

    // Nếu stage_5 xong → trigger branch flow thay vì render stage_6 bình thường
    if (stageKey === 'stage_5') {
        if (triggerAiEvent && aiEventData) {
            // Hiện event trước, sau đó mới branch
            showEventPopup(aiEventData, '__branch__', true);
        } else if (pendingStaticEvent) {
            const ev = pendingStaticEvent; setPendingStaticEvent(null);
            showEventPopup(ev, '__branch__', false);
        } else {
            maybeShowHalftime('stage_6');
        }
        return;
    }

    if (triggerAiEvent && aiEventData) {
        showEventPopup(aiEventData, nextStageId, true);
    } else if (pendingStaticEvent) {
        const ev = pendingStaticEvent; setPendingStaticEvent(null);
        showEventPopup(ev, nextStageId, false);
    } else {
        maybeShowHalftime(nextStageId);
    }
}


// ══════════════════════════════════════════════════════
//  SECTION 9: SPEED MODE
// ══════════════════════════════════════════════════════

let speedTimer = null;

function startSpeedCountdown(timeLimit, onExpire) {
    let remaining = timeLimit;
    const countEl = document.getElementById('speed-countdown');
    const fillEl  = document.getElementById('speed-timer-fill');
    if (countEl) { countEl.style.display = 'block'; countEl.classList.remove('urgent'); }
    if (fillEl)  { fillEl.style.width = '100%'; fillEl.classList.remove('urgent'); }

    clearInterval(speedTimer);
    speedTimer = setInterval(() => {
        remaining--;
        const pct = (remaining / timeLimit) * 100;
        if (fillEl) fillEl.style.width = pct + '%';
        if (countEl) {
            countEl.textContent = `⚡ Còn ${remaining}s để quyết định`;
            if (remaining <= 5) { countEl.classList.add('urgent'); fillEl?.classList.add('urgent'); }
        }
        if (remaining <= 0) { clearInterval(speedTimer); onExpire(); }
    }, 1000);
}

function clearSpeedTimer() {
    clearInterval(speedTimer);
    const countEl = document.getElementById('speed-countdown');
    const fillEl  = document.getElementById('speed-timer-fill');
    if (countEl) countEl.style.display = 'none';
    if (fillEl)  fillEl.style.width = '100%';
}


// ══════════════════════════════════════════════════════
//  SECTION 10: RENDER SCENE
// ══════════════════════════════════════════════════════

export function renderScene(sceneId) {
    clearSpeedTimer();

    // ── Calc ending ──
    if (sceneId === 'calc_ending') sceneId = calcEnding();

    // ── Delayed effects ──
    checkDelayedEffects(sceneId);

    updateStageDots(sceneId);

    const stageIdx = STAGE_ORDER.indexOf(sceneId);
    if (stageIdx >= 0) setCurrentStageIndex(stageIdx);

    const scene = dynamicStory[sceneId] || STORY[sceneId];
    if (!scene) { console.error('Scene not found:', sceneId); return; }

    // ── Story text ──
    const storyEl = document.getElementById('story-text');
    storyEl.innerHTML = scene.text;
    storyEl.classList.remove('fade-in');
    void storyEl.offsetWidth;
    storyEl.classList.add('fade-in');

    // ── Image ──
    const imgContainer = document.getElementById('image-container');
    if (scene.image) {
        document.getElementById('scene-image').src = scene.image;
        imgContainer.style.display = 'block';
    } else {
        imgContainer.style.display = 'none';
    }

    if (stageIdx >= 0) showOracleHint(stageIdx);

    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';

    // ── IS END? ──
    const isEnd = scene.isEnd || STORY[sceneId]?.isEnd
        || sceneId.startsWith('end_') || sceneId.startsWith('gameover');

    if (isEnd) {
        const soundKey = sceneId.includes('perfect') || sceneId.includes('legend') || sceneId.includes('secret')
            ? 'victory'
            : sceneId.startsWith('gameover') ? 'gameover' : 'bad';
        playSound(soundKey);

        const entry = saveToLeaderboardV2(sceneId);
        renderMemoryAlbum();
        renderLeaderboard(entry);
        showEndScreenV2(sceneId);

        if (decisionLog.length >= 3) {
            fetchLeadershipProfile(decisionLog).then(d => renderLeadershipProfile(d));
        }
        fetchJudgeVerdicts(sceneId).then(d => renderJudgePanel(d));

        const ngBtn = document.getElementById('ng-plus-btn');
        if (ngBtn) {
            const goodEndings = ['end_perfect','end_legend','end_secret_clean','end_secret_tung'];
            ngBtn.style.display = goodEndings.includes(sceneId) ? 'inline-block' : 'none';
        }
        return;
    }

    // ── CHOICE BUTTONS ──
    const labels = ['A', 'B', 'C', 'D'];
    const timeLimit = speedModeEnabled ? (stageIdx < 3 ? 20 : stageIdx < 7 ? 15 : 10) : 0;

    scene.choices.forEach((choice, i) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn fade-in';
        btn.style.animationDelay = (i * 0.07) + 's';

        // ── Fog of consequence: hiện pills sau hover ──
        const pillsHtml = buildPillsFromEffect(choice.effect);

        // ── Flag preview badge ──
        const stageKey = STAGE_ORDER[stageIdx];
        const meta = CHOICE_META[stageKey]?.[i];
        const flagBadge = meta?.flag
            ? `<span class="choice-flag-badge" title="Phong cách: ${meta.flag}">🏷 ${meta.flag}</span>`
            : '';

        btn.innerHTML = `
            <div class="choice-badge">${labels[i] || (i + 1)}</div>
            <div class="choice-body">
                <div class="choice-text">${choice.text}</div>
                <div class="choice-pills">${pillsHtml}${flagBadge}</div>
            </div>`;

        btn.onclick = () => {
            clearSpeedTimer();
            const resolvedNext = resolveNextStageId(choice.next, stageIdx);
            handleTransition(choice, resolvedNext, stageIdx, i);
        };

        choicesDiv.appendChild(btn);
    });

    if (speedModeEnabled && timeLimit > 0) {
        startSpeedCountdown(timeLimit, () => {
            const randomIdx    = Math.floor(Math.random() * scene.choices.length);
            const randomChoice = scene.choices[randomIdx];
            const resolvedNext = resolveNextStageId(randomChoice.next, stageIdx);
            handleTransition(randomChoice, resolvedNext, stageIdx, randomIdx);
        });
    }

    document.getElementById('game-container').scrollTo({ top: 0, behavior: 'smooth' });

    // ── Preload next stage (background) ──
    const nextId = resolveNextStageId(scene.choices[0]?.next, stageIdx);
    if (nextId && STORY[nextId]?.theme && !dynamicStory[nextId] && nextId !== 'stage_6') {
        fetchDynamicStage(nextId).then(data => {
            if (data && !dynamicStory[nextId]) dynamicStory[nextId] = data;
        });
    }
}


// ══════════════════════════════════════════════════════
//  SECTION 11: END SCREEN V2
// ══════════════════════════════════════════════════════

function showEndScreenV2(sceneId) {
    const cfg = END_CONFIGS_V2[sceneId] || {
        badge:'🎯', title:'KẾT THÚC', subtitle:'', color:'var(--gold)', image:'', trackLabel:null
    };

    document.getElementById('end-badge').innerText    = cfg.badge;
    const titleEl = document.getElementById('end-title');
    titleEl.innerText   = cfg.title;
    titleEl.style.color = cfg.color;
    document.getElementById('end-subtitle').innerText = cfg.subtitle;

    // Track label
    const trackEl = document.getElementById('end-track-label');
    if (trackEl) {
        trackEl.textContent = cfg.trackLabel || '';
        trackEl.style.display = cfg.trackLabel ? 'inline-block' : 'none';
    }

    // Image
    const endImgWrap = document.getElementById('end-image-container');
    const endImg     = document.getElementById('end-image');
    if (cfg.image) { endImg.src = cfg.image; endImgWrap.style.display = 'block'; }
    else           { endImgWrap.style.display = 'none'; }

    // Stats
    document.getElementById('end-money').innerText   = Math.max(0, state.money).toLocaleString('vi-VN') + 'đ';
    document.getElementById('end-time').innerText    = Math.max(0, state.time) + ' ngày';
    document.getElementById('end-morale').innerText  = state.morale + '%';
    document.getElementById('end-quality').innerText = state.quality + ' điểm';
    document.getElementById('end-events').innerText  = eventsEncountered + ' lần';

    const moraleEl = document.getElementById('end-morale');
    moraleEl.style.color = state.morale <= 30 ? 'var(--danger)' : state.morale >= 75 ? 'var(--success)' : 'var(--warning)';

    // Secret hint
    const secretHint = document.getElementById('secret-hint');
    if (secretHint) {
        if (cfg.secretHint) { secretHint.textContent = cfg.secretHint; secretHint.style.display = 'block'; }
        else                { secretHint.style.display = 'none'; }
    }

    // Trust summary
    renderTrustSummary();

    document.getElementById('end-screen').style.display = 'flex';
}

function renderTrustSummary() {
    const el = document.getElementById('end-trust-summary');
    if (!el) return;
    const chars = [
        { key:'tung', name:'Tùng', icon:'😤' },
        { key:'mai',  name:'Mai',  icon:'🌸' },
        { key:'khoa', name:'Khoa', icon:'🤔' },
        { key:'linh', name:'Linh', icon:'💙' }
    ];
    el.innerHTML = `<div class="trust-summary-title">💗 Mối Quan Hệ Cuối Hành Trình</div>` +
        chars.map(c => {
            const v = trust[c.key];
            const label = v > 80 ? 'Trung thành' : v > 60 ? 'Tin tưởng' : v > 40 ? 'Trung lập' : v > 20 ? 'Nghi ngờ' : 'Phản bội';
            const color = v > 80 ? 'var(--success)' : v > 40 ? 'var(--warning)' : 'var(--danger)';
            return `<div class="trust-summary-row">
                <span>${c.icon} ${c.name}</span>
                <div class="ts-bar"><div class="ts-fill" style="width:${v}%;background:${color}"></div></div>
                <span class="ts-label" style="color:${color}">${label}</span>
            </div>`;
        }).join('');
    el.style.display = 'block';
}


// ══════════════════════════════════════════════════════
//  SECTION 12: LEADERBOARD V2
// ══════════════════════════════════════════════════════

const LB_KEY_V2 = 'mhx_lb_v3';

function saveToLeaderboardV2(sceneId) {
    try {
        const entry = {
            date    : new Date().toLocaleDateString('vi-VN'),
            ending  : sceneId,
            label   : ENDING_LABELS_V2[sceneId] || sceneId,
            quality : state.quality,
            morale  : state.morale,
            diff    : currentDiffKey,
            branch  : currentBranch || '—',
            flags   : [...decisionFlags].join(',')
        };
        const all = JSON.parse(localStorage.getItem(LB_KEY_V2) || '[]');
        all.push(entry);
        all.sort((a, b) => b.quality - a.quality);
        localStorage.setItem(LB_KEY_V2, JSON.stringify(all.slice(0, 15)));
        return entry;
    } catch(e) { return null; }
}


// ══════════════════════════════════════════════════════
//  SECTION 13: INIT GAME
// ══════════════════════════════════════════════════════

export async function initGame() {
    const loading = document.getElementById('loading-overlay');
    document.getElementById('loading-text').innerText = 'KHỞI TẠO VŨ TRỤ...';
    loading.style.display = 'flex';

    updateUI();
    updateStageDots('start');
    updateTrustBars(trust); // hiển thị trust bars ngay từ đầu

    const dynamicData = await fetchDynamicStage('start');
    if (dynamicData) dynamicStory['start'] = dynamicData;

    loading.style.display = 'none';
    renderScene('start');
}
