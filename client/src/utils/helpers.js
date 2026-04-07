import CryptoJS from "crypto-js";
import axios from "axios";
const secretKey = import.meta.env.VITE_SECRET_KEY;
const laravelCryptoKey = import.meta.env.VITE_LARAVEL_CRYPTO_KEY;
const url = `${import.meta.env.VITE_API_URL}`;

// Prefix local storage key with app path
const getLocalStorageKey = (key) => {
    return `${"/htm"}_${key}`;
};
// set in localstorage
export const setLocalStorage = (key, value) => {
    if (window !== "undefined") {
        localStorage.setItem(getLocalStorageKey(key), JSON.stringify(value));
    }
};
// remove from localstorage
export const removeLocalStorage = (key) => {
    if (window !== "undefined") {
        localStorage.removeItem(getLocalStorageKey(key));
    }
};

export const authenticate = (response, next) => {
    const user = response.data.user;
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(user), secretKey).toString();
    localStorage.setItem(getLocalStorageKey("user"), encrypted);
    next();
};

export const validationAccess = () => {
    if (window !== "undefined") {
        if (localStorage.getItem("validated")) {
            let validated = localStorage.getItem("validated");
            if (validated.startsWith('"') && validated.endsWith('"') && validated.length >= 2) { validated = validated.substring(1, validated.length - 1); }
            // Decrypt the encrypted string using AES decryption with the secret key
            const decryptedBytesValidated = CryptoJS.AES.decrypt(validated, secretKey);
            // Convert the decrypted bytes to a string
            const decryptedStringValidated = decryptedBytesValidated.toString(CryptoJS.enc.Utf8);
            return JSON.parse(decryptedStringValidated);
        } else { return false; }
    }
};

export const signout = async () => {
    try {
        await axios.post(`${url}/auth/logout`, {}, { withCredentials: true });
        localStorage.removeItem(getLocalStorageKey("user"));
        // next();
    } catch (error) {
        console.error(error);
    }
};

// get user
export const isAuth = () => {
    try {
        const encrypted = localStorage.getItem(getLocalStorageKey("user"));
        if (!encrypted) return null;
        const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey).toString(CryptoJS.enc.Utf8);
        if (!decrypted) return null;
        const user = JSON.parse(decrypted);
        if (!user?.id || !user?.role) return null;
        return user;
    } catch {
        return null;
    }
};

export const encodeCredential = (value) => {
    const key = CryptoJS.enc.Base64.parse(laravelCryptoKey); // Laravel app key
    // Generate a random IV
    const iv = CryptoJS.lib.WordArray.random(16);
    // Encrypt the value
    const encrypted = CryptoJS.AES.encrypt(value, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    // Encode the IV and encrypted value in base64
    const payload = {
        iv: CryptoJS.enc.Base64.stringify(iv),
        value: CryptoJS.enc.Base64.stringify(encrypted.ciphertext),
    };
    // Convert to base64 JSON string
    return btoa(JSON.stringify(payload));
}

export const decodeCredential = (encryptedData) => {
    const decodedData = atob(encryptedData);
    const payload = JSON.parse(decodedData);
    // Extract the components
    const iv = CryptoJS.enc.Base64.parse(payload.iv);
    const value = CryptoJS.enc.Base64.parse(payload.value);

    // Decode the base64 key
    const key = CryptoJS.enc.Base64.parse(laravelCryptoKey); //This is Laravel app key where we are encrypting data (EMS Laravel)

    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: value },
        key,
        { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 } // Options
    );
    // Convert the decrypted data to a UTF-8 string
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    const match = plaintext.match(/^s:\d+:"([^"]+)";$/);
    const extractedValue = match ? match[1] : plaintext;
    return extractedValue;
}

export const safeJsonParse = (value) => {
    if (typeof value !== "string") return value;

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};