export function formatDuration(totalSeconds: number): string {
    const s = Math.max(0, Math.round(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m >0) return `${m}m ${sec}s`;

    return `${sec}s`;
}

export function formatPercent(fraction: number): string {
    return `${(fraction * 100).toFixed(1)}%`;
}