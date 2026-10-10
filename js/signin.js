import { apiJson, apiUrl } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signin-form");
    const status = document.getElementById("signin-status");
    const googleStatus = document.getElementById("google-signin-status");
    const resendBtn = document.getElementById("resend-btn");
    const resendIdentifier = document.getElementById("resend-identifier");
    const forgotBtn = document.getElementById("forgot-btn");
    const forgotEmail = document.getElementById("forgot-email");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        status.textContent = "Validando acceso…";
        status.className = "agenda-status";
        const formData = new FormData(form);
        try {
            const response = await fetch(apiUrl("/api/auth/signin"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.get("username"),
                    password: formData.get("password"),
                }),
            });
            const data = await apiJson(response);
            if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo iniciar sesión.");
            finishSignin(data, status);
        } catch (error) {
            status.textContent = error.message || "No se pudo iniciar sesión.";
        }
    });

    resendBtn.addEventListener("click", async () => {
        const identifier = String(resendIdentifier.value || "").trim();
        if (!identifier) {
            status.textContent = "Ingresá usuario o email para reenviar la confirmación.";
            return;
        }
        status.textContent = "Enviando email de confirmación…";
        try {
            const response = await fetch(apiUrl("/api/auth/resend-confirmation"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier }),
            });
            const data = await apiJson(response);
            if (!response.ok || !data.ok) throw new Error(data.error || data.message || "No se pudo reenviar.");
            status.textContent = data.message || "Revisá tu email.";
        } catch (error) {
            status.textContent = error.message || "No se pudo reenviar el email.";
        }
    });

    forgotBtn.addEventListener("click", async () => {
        const email = String(forgotEmail.value || "").trim();
        if (!email) {
            status.textContent = "Ingresá el email asociado para recuperar la clave.";
            return;
        }
        status.textContent = "Enviando recuperación…";
        try {
            const response = await fetch(apiUrl("/api/auth/forgot-password"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await apiJson(response);
            if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo procesar la recuperación.");
            status.textContent = data.message;
        } catch (error) {
            status.textContent = error.message || "No se pudo procesar la recuperación.";
        }
    });

    loadCatalog();
    loadGoogleButton();
});

function finishSignin(data, status) {
    localStorage.setItem("aequo_account", JSON.stringify(data));
    status.textContent = "Inicio de sesión correcto. Abriendo tu cuenta…";
    status.classList.add("success");
    window.setTimeout(() => window.location.assign("cuenta.html"), 350);
}

async function loadCatalog() {
    try {
        const response = await fetch(apiUrl("/api/ecommerce/catalog"));
        const data = await apiJson(response);
        for (const plan of Object.values(data.plans || {})) {
            const item = document.createElement("p");
            item.textContent = `${plan.name}: ${plan.formatted_price}`;
            document.getElementById("signin-plan-prices").append(item);
        }
    } catch {
        document.getElementById("signin-plan-prices").textContent = "No pudimos consultar precios.";
    }
}

async function loadGoogleButton() {
    const status = document.getElementById("google-signin-status");
    try {
        const response = await fetch(apiUrl("/api/auth/google/config"));
        const config = await apiJson(response);
        if (!config.client_id) {
            status.textContent = "Inicio de sesión con Google no configurado.";
            return;
        }
        await loadGoogleIdentity();
        google.accounts.id.initialize({
            client_id: config.client_id,
            callback: async ({ credential }) => {
                const payload = {
                    credential,
                };
                status.textContent = "Verificando credencial de Google…";
                try {
                    const response = await fetch(apiUrl("/api/auth/google"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });
                    const data = await apiJson(response);
                    if (data.ok && !data.registration_pending) {
                        finishSignin(data, status);
                        return;
                    }
                    if (data.checkout_id && data.resume_token) {
                        localStorage.setItem("aequo_pending_checkout", JSON.stringify({
                            checkout_id: data.checkout_id, resume_token: data.resume_token,
                        }));
                    }
                    if (data.registration_pending) {
                        window.location.assign("pago.html");
                        return;
                    }
                    if (data.new_google_account) {
                        status.textContent = "Cuenta Google nueva. Continuá en Crear cuenta para registrarte antes de pagar.";
                        window.location.assign("signup.html");
                        return;
                    }
                    throw new Error(data.error || "No se pudo iniciar sesión con Google.");
                } catch (error) {
                    status.textContent = error.message || "No se pudo iniciar sesión con Google.";
                }
            },
        });
        document.getElementById("google-signin-button").replaceChildren();
        google.accounts.id.renderButton(
            document.getElementById("google-signin-button"),
            { type: "standard", theme: "outline", size: "large", text: "signin_with" },
        );
    } catch {
        status.textContent = "No se pudo cargar el acceso seguro de Google.";
    }
}

function loadGoogleIdentity() {
    if (window.google?.accounts?.id) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.append(script);
    });
}
