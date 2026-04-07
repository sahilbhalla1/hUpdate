export function formatDateTime(iso) {
    // remove timezone marker so browser does not convert
    const clean = iso.replace("Z", "");

    const d = new Date(clean);
    const pad = (n) => String(n).padStart(2, "0");

    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${String(d.getFullYear()).slice(-2)} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatRemainingTime(minutes) {
    if (minutes < 0) {
        const absMinutes = Math.abs(minutes);
        const hours = Math.floor(absMinutes / 60);
        const mins = absMinutes % 60;
        return `Breached by ${hours}h ${mins}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m remaining`;
};

export const convertUTCToIST = (utcDate, options = {}) => {
    if (!utcDate) return "";

    const defaultOptions = {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    };

    return new Date(utcDate).toLocaleString("en-IN", {
        ...defaultOptions,
        ...options,
    });
};