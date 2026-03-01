/* ─── STATE.JS — Game state toàn cục ─── */

import { DIFFICULTIES } from './config.js';

// ══ GAME STATE ══
export const state = {
    money: 6000000, time: 25, morale: 100, quality: 0
};

// ══ RUNTIME FLAGS ══
export let USE_AI          = true;
export let forceNextEvent  = false;
export let RATE_AI_EVENT   = 0.15;
export let RATE_STATIC_EVENT = 0.20;
export let GUARANTEE_AT    = 6;

export let currentDiff     = DIFFICULTIES.normal;
export let currentDiffKey  = 'normal';

// ══ PROGRESSION ══
export let currentStageIndex      = 0;
export let stagesSinceStaticEvent = 0;
export let pendingStaticEvent     = null;
export let halftimeSeen           = false;
export let eventsEncountered      = 0;
export let usedThemes             = [];

// ══ ITEMS ══
export let selectedItem   = null;  // 'budget' | 'captain' | 'redo'
export let redoCardUsed   = false;
export let speedModeEnabled = false;
export let ngPlusActive   = false;

// ══ MEMBER MORALE ══
export const memberMorale = { tung: 100, mai: 100, khoa: 100, linh: 100 };

// ══ TRUST SYSTEM ══
// Mỗi nhân vật bắt đầu tại 50 (neutral). Range: 0–100.
// >80 = loyal, <20 = betrayal risk
export const trust = { tung: 50, mai: 60, khoa: 55, linh: 60 };
export let loyaltyTriggered  = false; // true khi đã kích hoạt loyal event
export let betrayalTriggered = false; // true khi đã kích hoạt betrayal event

// ══ DECISION FLAGS ══
// Set of string flags tích luỹ theo lựa chọn của người chơi
// Dùng cho: branching điều kiện, secret endings, judge verdicts
export const decisionFlags = new Set();

// ══ BRANCH TRACKING ══
// 'A' = track đoàn kết (stage_6a), 'B' = track khủng hoảng (stage_6b), null = chưa rẽ nhánh
export let currentBranch = null;
export function setCurrentBranch(v) { currentBranch = v; }

// ══ HIDDEN STATS ══
export let bgReputation = 0;  // -3 → +3, ẩn với người chơi

// ══ DYNAMIC DATA ══
export const dynamicStory = {};
export let decisionLog    = [];
export let memoryAlbum    = [];
export let pendingDelayedEffects = [];

// ══ SPEED MODE ══
export let speedCountdown  = null;

// ══ AUDIO ══
export let audioCtx        = null;
export let soundEnabled    = true;

// ══ CHAR BUBBLE ══
export let charBubbleTimer = null;

// ══ SETTERS (dùng khi cần gán lại primitive) ══
export function setUseAI(v)          { USE_AI = v; }
export function setForceNextEvent(v) { forceNextEvent = v; }
export function setRateAI(v)         { RATE_AI_EVENT = v; }
export function setRateStatic(v)     { RATE_STATIC_EVENT = v; }
export function setGuaranteeAt(v)    { GUARANTEE_AT = v; }
export function setCurrentDiff(diff, key) { currentDiff = diff; currentDiffKey = key; }
export function setCurrentStageIndex(v)   { currentStageIndex = v; }
export function setStagesSinceStatic(v)   { stagesSinceStaticEvent = v; }
export function setPendingStaticEvent(v)  { pendingStaticEvent = v; }
export function setHalftimeSeen(v)        { halftimeSeen = v; }
export function incEventsEncountered()    { eventsEncountered++; }
export function setSelectedItem(v)        { selectedItem = v; }
export function setRedoCardUsed(v)        { redoCardUsed = v; }
export function setSpeedModeEnabled(v)    { speedModeEnabled = v; }
export function setNgPlusActive(v)        { ngPlusActive = v; }
export function setBgReputation(v)        { bgReputation = Math.max(-3, Math.min(3, v)); }
export function setSpeedCountdown(v)      { speedCountdown = v; }
export function setAudioCtx(v)            { audioCtx = v; }
export function setSoundEnabled(v)        { soundEnabled = v; }
export function setCharBubbleTimer(v)     { charBubbleTimer = v; }

// ══ RESET ══
export function resetState() {
    state.money   = currentDiff.money;
    state.time    = currentDiff.time;
    state.morale  = currentDiff.morale;
    state.quality = 0;

    RATE_AI_EVENT     = currentDiff.rateAI;
    RATE_STATIC_EVENT = currentDiff.rateStatic;
    GUARANTEE_AT      = currentDiff.guaranteeAt;

    currentStageIndex      = 0;
    stagesSinceStaticEvent = 0;
    pendingStaticEvent     = null;
    halftimeSeen           = false;
    eventsEncountered      = 0;
    usedThemes             = [];
    bgReputation           = 0;
    redoCardUsed           = false;

    decisionLog          = [];
    memoryAlbum          = [];
    pendingDelayedEffects= [];

    memberMorale.tung  = 100;
    memberMorale.mai   = 100;
    memberMorale.khoa  = 100;
    memberMorale.linh  = 100;

    trust.tung  = 50; trust.mai  = 60; trust.khoa  = 55; trust.linh  = 60;
    loyaltyTriggered = false; betrayalTriggered = false;
    decisionFlags.clear();
    currentBranch = null;

    // Xóa dynamic cache
    Object.keys(dynamicStory).forEach(k => delete dynamicStory[k]);
}

// ══ SETTERS BỔ SUNG (trust, flags, branch) ══
export function setLoyaltyTriggered(v)  { loyaltyTriggered = v; }
export function setBetrayalTriggered(v) { betrayalTriggered = v; }
export function addFlag(flag)           { decisionFlags.add(flag); }
export function hasFlag(flag)           { return decisionFlags.has(flag); }
