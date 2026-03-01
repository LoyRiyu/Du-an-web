/* ─── API.JS — Gemini engine + Session Cache + AI Generators ─── */

import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
import { API_BUNKER, STORY }  from './config.js';
import {
    USE_AI, currentDiff, currentDiffKey,
    state, usedThemes, dynamicStory,
    decisionLog
} from './state.js';

let currentKeyIndex = 0;

// ══ GEMINI CORE ══
export async function callGemini(promptText, retryCount = 0) {
    if (!USE_AI || API_BUNKER.length === 0) return null;
    if (retryCount >= API_BUNKER.length) { console.error("❌ All API keys exhausted"); updateAIBadge(); return null; }
    const activeKey = API_BUNKER[currentKeyIndex];
    try {
        const genAI = new GoogleGenerativeAI(activeKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(promptText);
        return JSON.parse(result.response.text());
    } catch (error) {
        currentKeyIndex = (currentKeyIndex + 1) % API_BUNKER.length;
        return callGemini(promptText, retryCount + 1);
    }
}

function updateAIBadge() {
    const badge = document.getElementById('ai-mode-badge');
    if (!badge) return;
    badge.className = USE_AI ? 'ai-on' : 'ai-off';
    badge.textContent = USE_AI ? '⚡ AI Mode' : '📋 Classic Mode';
}

// ══ SESSION CACHE ══
function getCached(stageId) {
    try {
        const v = sessionStorage.getItem(`mhx_${currentDiffKey}_${stageId}`);
        return v ? JSON.parse(v) : null;
    } catch(e) { return null; }
}
function setCached(stageId, data) {
    try { sessionStorage.setItem(`mhx_${currentDiffKey}_${stageId}`, JSON.stringify(data)); } catch(e) {}
}

// ══ AI EVENT (ĐÁNH CƯỢC) ══
export async function fetchAIEvent() {
    const range = currentDiff.winMax - currentDiff.winMin;
    const winRate = Math.floor(Math.random() * (range + 1)) + currentDiff.winMin;
    const prompt = `Tạo 1 sự kiện ĐÁNH CƯỢC kịch tính cho nhóm học sinh thực hiện dự án tình nguyện. KHÔNG nhắc số tiền hay ngày cụ thể trong mô tả. TRẢ VỀ JSON: { "event_title": "...", "event_description": "...", "gamble_choice": { "text": "...", "win_rate": ${winRate}, "win_effect": {"money": 800000, "time": 0, "morale": 20}, "lose_effect": {"money": -400000, "time": -1, "morale": -20} }, "safe_choice": { "text": "...", "effect": {"morale": -5} } }`;
    return await callGemini(prompt);
}

// ══ AI DYNAMIC STAGE ══
export async function fetchDynamicStage(stageId) {
    const base = STORY[stageId];
    if (!base || !base.theme) return null;

    const cached = getCached(stageId);
    if (cached) return cached;

    const stageTitle = (base.text.match(/<b>(.*?)<\/b>/) || [])[1] || "TÌNH HUỐNG MỚI";
    const historyText = usedThemes.length > 0 ? usedThemes.join(", ") : "Chưa có";
    const maxTimeReduce   = Math.max(-Math.floor(state.time   * 0.55), -3);
    const maxMoraleReduce = Math.max(-Math.floor(state.morale * 0.45), -25);

    const prompt = `Viết kịch bản game: "${stageTitle}". Chủ đề: ${base.theme}. LUẬT: KHÔNG lặp lại: ${historyText}. Mỗi lựa chọn có hướng tiếp cận khác nhau (tốn tiền, tốn sức, sáng tạo, ngoại giao...) — AI tự quyết định thứ tự. QUY TẮC BẮT BUỘC: (1) effect.time phải là số nguyên âm đơn vị NGÀY (ví dụ -1, -2, -3), KHÔNG nhỏ hơn ${maxTimeReduce}. (2) effect.morale KHÔNG nhỏ hơn ${maxMoraleReduce}. (3) "text" tình huống KHÔNG nhắc con số trạng thái. (4) KHÔNG đưa trường "impact" vào JSON. (5) Mỗi "text" lựa chọn bắt đầu bằng động từ hành động, KHÔNG có tiền tố A./B./C. TRẢ VỀ JSON: { "text": "<b>${stageTitle}</b><br>[Mô tả tình huống]", "choices": [ { "text": "...", "next": "${base.choices[0].next}", "effect": {"money": -2000000, "time": -1, "morale": 10, "quality": 15} }, { "text": "...", "next": "${base.choices[0].next}", "effect": {"money": 0, "time": -3, "morale": -20, "quality": 5} }, { "text": "...", "next": "${base.choices[0].next}", "effect": {"money": -100000, "time": -2, "morale": -5, "quality": 20} } ] }`;

    const aiResponse = await callGemini(prompt);
    if (aiResponse) {
        aiResponse.image = base.image;
        if (aiResponse.choices) {
            aiResponse.choices.forEach((choice, i) => {
                if (!choice.effect) choice.effect = {};
                choice.next = base.choices[0].next;
                if ((choice.effect.time   || 0) < maxTimeReduce)   choice.effect.time   = maxTimeReduce;
                if ((choice.effect.morale || 0) < maxMoraleReduce) choice.effect.morale = maxMoraleReduce;

                const staticChoice = base.choices[i];
                choice.bgRep ??= staticChoice?.bgRep;
                choice.delayed ??= staticChoice?.delayed;
                choice.flag ??= staticChoice?.flag;
                choice.trustDelta ??= staticChoice?.trustDelta;
            });
        }
        usedThemes.push(aiResponse.text.substring(0, 50).replace(/<[^>]*>?/gm, ''));
        setCached(stageId, aiResponse);
    }
    return aiResponse;
}

// ══ AI CHARACTER REACTION ══
export async function fetchCharReaction(char, choiceText, effect) {
    if (!USE_AI) return null;
    const effectSummary = Object.entries(effect || {})
        .filter(([, v]) => v !== 0)
        .map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`)
        .join(', ') || 'không đổi';
    const prompt = `Bạn đang đóng vai ${char.name}, một thành viên nhóm tình nguyện. Tính cách: ${char.trait}. Trưởng nhóm vừa quyết định: "${choiceText}" (kết quả: ${effectSummary}). Phản ứng tự nhiên của bạn bằng 1 câu ngắn (tối đa 18 từ), giọng khẩu ngữ tuổi teen. Trả về JSON: {"reaction": "..."}`;
    try {
        const res = await callGemini(prompt);
        return res && res.reaction ? { name: char.name, icon: char.icon, text: res.reaction } : null;
    } catch(e) { return null; }
}

// ══ AI LEADERSHIP PROFILE ══
export async function fetchLeadershipProfile(log) {
    if (!USE_AI || log.length < 3) return null;
    const summary = log.slice(0, 10).map((e, i) =>
        `GĐ${i+1} [${e.stageTitle}]: "${e.choiceText.substring(0, 60)}" → tiền:${e.effect.money||0} tg:${e.effect.time||0} ts:${e.effect.morale||0} cl:${e.effect.quality||0}`
    ).join('\n');
    const prompt = `Phân tích phong cách lãnh đạo dựa trên các quyết định sau trong dự án tình nguyện:\n${summary}\n\nTrả về JSON: { "style": "Tên phong cách (3-5 từ, tiếng Việt)", "icon": "1 emoji đặc trưng", "description": "Nhận xét 2-3 câu về phong cách, ưu/nhược điểm, bằng tiếng Việt", "strength_tag": "Điểm mạnh (2-3 từ)", "blind_tag": "Điểm mù (2-3 từ)" }`;
    try { return await callGemini(prompt); } catch(e) { return null; }
}

// ══ AI JUDGE VERDICTS ══
export async function fetchJudgeVerdicts(sceneId) {
    if (!USE_AI) return null;
    const summary = `Kết quả: ${sceneId}. Tiền còn: ${state.money}đ. Ngày dư: ${state.time}. Tinh thần: ${state.morale}%. Chất lượng: ${state.quality}đ. Quyết định nổi bật: ${decisionLog.slice(0,5).map(e=>e.choiceText.substring(0,40)).join(' | ')}`;
    const prompt = `Bạn là 3 thành viên hội đồng đánh giá dự án tình nguyện. Tóm tắt: ${summary}. Mỗi người cho 1 nhận xét ngắn (1 câu, tối đa 20 từ, giọng đặc trưng của họ). TRẢ VỀ JSON: { "phu_huynh": "...", "ke_toan": "...", "co_giao": "..." }`;
    try { return await callGemini(prompt); } catch(e) { return null; }
}
