export function playAlertSound(severity: "high" | "critical" | string) {
    if (typeof window === "undefined") return;

    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        // Check if context is mostly available or create it
        const audioCtx = new AudioContext();

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (severity === "critical") {
            // Urgent double beep
            oscillator.type = "square";
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);

            // Second beep
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.type = "square";
            osc2.frequency.setValueAtTime(800, audioCtx.currentTime + 0.4);
            osc2.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.5);
            gain2.gain.setValueAtTime(0.1, audioCtx.currentTime + 0.4);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.7);
            osc2.start(audioCtx.currentTime + 0.4);
            osc2.stop(audioCtx.currentTime + 0.7);

        } else if (severity === "high") {
            // Single warning beep
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);

            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.2);
        }
    } catch (e) {
        console.warn("Audio playback failed, likely due to autoplay policies. User interaction required.", e);
    }
}
