import { apiJson, apiUrl } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signup-form");
    const status = document.getElementById("signup-status");
    const googleStatus = document.getElementById("google-signup-status");
    document.getElementById("resume-registration").hidden =
        !localStorage.getItem("aequo_pending_checkout");
    let busy = false;

    const register = async (path, payload, message) => {
        if (busy) return;
        busy = true;
        form.querySelector('button[type="submit"]').disabled = true;
        message.textContent = "Guardando el registro...";
        try {
            const response = await fetch(apiUrl(path), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await apiJson(response);
            if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo guardar el registro.");
            if (data.registration_pending && data.checkout_id && data.resume_token) {
                localStorage.setItem("aequo_pending_checkout", JSON.stringify({
                    checkout_id: data.checkout_id, resume_token: data.resume_token,
                }));
                form.reset();
                window.location.assign("pago.html");
                return;
            }
            if (data.subscription_type) {
                localStorage.setItem("aequo_account", JSON.stringify(data));
                window.location.assign("cuenta.html");
                return;
            }
            throw new Error("El servidor no devolvió un registro válido.");
        } catch (error) {
            message.textContent = error.message || "No se pudo guardar el registro.";
        } finally {
            busy = false;
            form.querySelector('button[type="submit"]').disabled = false;
        }
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const values = new FormData(form);
        if (values.get("password") !== values.get("confirm_password")) {
            status.textContent = "Las claves no coinciden.";
            return;
        }
        await register("/api/auth/signup", {
            username: values.get("username"), email: values.get("email"),
            password: values.get("password"),
        }, status);
    });

    const initGoogle = async () => {
        try {
            const response = await fetch(apiUrl("/api/auth/google/config"));
            const config = await apiJson(response);
            if (!response.ok) throw new Error("No se pudo consultar la configuración Google.");
            if (!config.client_id) {
                googleStatus.textContent = "Registro con Google no configurado.";
                return;
            }
            await new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = "https://accounts.google.com/gsi/client";
                script.async = true;
                script.onload = resolve;
                script.onerror = reject;
                document.head.append(script);
            });
            google.accounts.id.initialize({
                client_id: config.client_id,
                callback: async ({ credential }) => {
                    if (!form.elements.consentimiento.reportValidity()) return;
                    await register("/api/auth/google", {
                        credential, register: true,
                    }, googleStatus);
                },
            });
            document.getElementById("google-signup-button").replaceChildren();
            google.accounts.id.renderButton(
                document.getElementById("google-signup-button"),
                { type: "standard", theme: "outline", size: "large", text: "signup_with" },
            );
        } catch (error) {
            googleStatus.textContent = error.message || "No se pudo cargar el acceso seguro de Google.";
        }
    };
    initGoogle();
});
