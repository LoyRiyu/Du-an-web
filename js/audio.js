/* ─── AUDIO.JS — Web Audio API, không file ngoài ─── */

import { audioCtx, soundEnabled, setAudioCtx } from './state.js';

function getCtx() {
    if (!audioCtx) {
        try {
            setAudioCtx(new (window.AudioContext || window.webkitAudioContext)());
        } catch(e) {}
    }
    // re-import để lấy giá trị mới nhất (module singleton)
    return audioCtx;
}

export function playSound(type) {
    if (!soundEnabled) return;
    try {
        const ctx = getCtx();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;

        if (type === 'click') {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.frequency.value = 880; o.type = 'sine';
            g.gain.setValueAtTime(0.22, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            o.start(now); o.stop(now + 0.1);

        } else if (type === 'good') {
            [523, 659, 784].forEach((freq, i) => {
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.connect(g); g.connect(ctx.destination);
                o.frequency.value = freq;
                const t = now + i * 0.1;
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.18, t + 0.04);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
                o.start(t); o.stop(t + 0.36);
            });

        } else if (type === 'bad') {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = 'sawtooth'; o.connect(g); g.connect(ctx.destination);
            o.frequency.setValueAtTime(240, now);
            o.frequency.exponentialRampToValueAtTime(70, now + 0.45);
            g.gain.setValueAtTime(0.26, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            o.start(now); o.stop(now + 0.52);

        } else if (type === 'gameover') {
            [400, 320, 240, 160].forEach((freq, i) => {
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.type = 'sine'; o.connect(g); g.connect(ctx.destination);
                o.frequency.value = freq;
                const t = now + i * 0.2;
                g.gain.setValueAtTime(0.28, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
                o.start(t); o.stop(t + 0.32);
            });

        } else if (type === 'victory') {
            [523, 659, 784, 1047].forEach((freq, i) => {
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.type = 'sine'; o.connect(g); g.connect(ctx.destination);
                o.frequency.value = freq;
                const t = now + i * 0.13;
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.22, t + 0.05);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
                o.start(t); o.stop(t + 0.6);
            });

        } else if (type === 'gamble') {
            let t = now;
            for (let i = 0; i < 8; i++) {
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.type = 'triangle'; o.connect(g); g.connect(ctx.destination);
                o.frequency.value = 180 + i * 35;
                g.gain.setValueAtTime(0.14, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
                o.start(t); o.stop(t + 0.06);
                t += 0.065 + i * 0.006;
            }
        }
    } catch(e) {}
}
