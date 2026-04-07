export const sanitizeInput = (value) => {
    if (!value) return "";

    let cleaned = value;
    // 1️⃣ Remove HTML injection chars
    cleaned = cleaned.replace(/[<>]/g, "");

    // 2️⃣ Remove all disallowed characters (only allow letters, numbers, spaces, basic punctuation)
    cleaned = cleaned.replace(/[^a-zA-Z0-9\s .,_-]/g, "");

    // 3️⃣ Remove SQL / Script keywords entirely (case-insensitive)
    // cleaned = cleaned.replace(
    //     /\b(script|select|drop|insert|update|delete|union|alter|create|replace)\b/gi,
    //     ""
    // );

    // 4️⃣ Collapse multiple spaces into one
    cleaned = cleaned.replace(/\s+/g, " ");

    return cleaned;
};


export const sanitizeNumber = (
    value,
    { min = 1, max = Infinity } = {}
) => {
    const num = Number(value);

    if (isNaN(num)) return min;

    if (num < min) return min;

    if (num > max) return max;

    return Math.floor(num); // ❌ no decimals
};


export const sanitizeSapText = (str = "") => {
    return str
        .replace(/[^\x20-\x7E]/g, " ") // remove unicode
        .replace(/&/g, "and")
        .replace(/</g, " ")
        .replace(/>/g, " ")
        .replace(/"/g, " ")
        .replace(/'/g, " ")
    // .trim();
};