import { apiJson, apiUrl } from "./api.js";

export function setupGoogleContact(form) {
    const container = form.querySelector("[data-google-contact-button]");
    const status = form.querySelector("[data-google-contact-status]");
    const manual = form.querySelector("[data-google-contact-manual]");
    let credential = null;
    let verifying = false;

    const clear = () => {
        credential = null;
        form.elements.nombre.readOnly = false;
        form.elements.email.readOnly = false;
        manual.hidden = true;
        status.textContent = "";
    };
    form.addEventListener("reset", clear);
    manual.addEventListener("click", clear);

    const initialize = async () => {
        try {
            const response = await fetch(apiUrl("/api/auth/google/config"));
            const config = await apiJson(response);
            if (!response.ok) throw new Error("No se pudo consultar la configuración de Google.");
            if (!config.client_id) {
                status.textContent = "Google no está configurado. Podés completar el formulario manualmente.";
                return;
            }
            await new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = "https://accounts.google.com/gsi/client";
                script.async = true;
                script.onload = resolve;
                script.onerror = () => reject(new Error("No se pudo cargar Google. Podés completar el formulario manualmente."));
                document.head.append(script);
            });
            google.accounts.id.initialize({
                client_id: config.client_id,
                callback: async (result) => {
                    if (verifying) return;
                    verifying = true;
                    status.textContent = "Verificando identidad con Google...";
                    try {
                        const response = await fetch(apiUrl("/api/auth/google/contact"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ credential: result.credential }),
                        });
                        const data = await apiJson(response);
                        if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo verificar Google.");
                        credential = result.credential;
                        form.elements.nombre.value = data.nombre;
                        form.elements.email.value = data.email;
                        form.elements.nombre.readOnly = true;
                        form.elements.email.readOnly = true;
                        manual.hidden = false;
                        status.textContent = "Nombre y email verificados. Completá los demás datos, aceptá el consentimiento y enviá el formulario.";
                    } catch (error) {
                        clear();
                        status.textContent = error.message;
                    } finally {
                        verifying = false;
                    }
                },
            });
            google.accounts.id.renderButton(container, {
                type: "standard", theme: "outline", size: "large", text: "continue_with",
            });
        } catch (error) {
            status.textContent = error.message;
        }
    };
    initialize();
    return () => credential;
}
