const localHosts = new Set(["localhost", "127.0.0.1"]);
const apiBaseUrl = localHosts.has(window.location.hostname)
    ? ""
    : "https://aequo.onrender.com";

export function apiUrl(path) {
    return `${apiBaseUrl}${path}`;
}

export async function apiJson(response) {
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : {};
    } catch {
        throw new Error("El servidor no devolvió una respuesta válida. Intentá nuevamente en unos minutos.");
    }
}
