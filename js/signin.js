import { apiJson, apiUrl } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signin-form");
    const status = document.getElementById("signin-status");
    const resendBtn = document.getElementById("resend-btn");
    const resendIdentifier = document.getElementById("resend-identifier");
    const forgotBtn = document.getElementById("forgot-btn");
    const forgotEmail = document.getElementById("forgot-email");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        status.textContent = "Validando acceso...";
        status.className = "agenda-status";

        const formData = new FormData(form);
        const payload = {
            username: formData.get("username"),
            password: formData.get("password"),
        };

        try {
            const response = await fetch(apiUrl("/api/auth/signin"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await apiJson(response);
            if (!response.ok || !data.ok) {
                throw new Error(data.error || "No se pudo iniciar sesión.");
            }

            localStorage.setItem("aequo_account", JSON.stringify(data));
            status.textContent = "Signin correcto. Redirigiendo a tu cuenta...";
            status.classList.add("success");
            window.setTimeout(() => {
                window.location.href = "cuenta.html?v=2";
            }, 450);
        } catch (error) {
            status.textContent = error.message || "No se pudo iniciar sesión.";
            status.classList.remove("success");
        }
    });

    resendBtn.addEventListener("click", async () => {
        const identifier = String(resendIdentifier.value || "").trim();
        if (!identifier) {
            status.textContent = "Ingresá usuario o email para reenviar la confirmación.";
            return;
        }
        status.textContent = "Enviando correo de confirmación...";
        status.className = "agenda-status";

        try {
            const response = await fetch(apiUrl("/api/auth/resend-confirmation"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier }),
            });
            const data = await apiJson(response);
            if (!response.ok || !data.ok) {
                throw new Error(data.error || "No se pudo reenviar el correo.");
            }
            if (data.email_configured === false && data.confirmation_token) {
                const link = data.confirm_url || `confirmar-cuenta.html?token=${encodeURIComponent(data.confirmation_token)}`;
                status.innerHTML = `
                    <div>
                        <div>No hay SMTP configurado en este entorno.</div>
                        <div>Token de confirmación: <strong>${data.confirmation_token}</strong></div>
                        <div><a href="${link}" target="_blank" rel="noreferrer">Confirmar cuenta ahora</a></div>
                    </div>
                `;
            } else {
                status.textContent = data.message || "Te reenviamos el correo de confirmación.";
            }
            status.classList.add("success");
        } catch (error) {
            status.textContent = error.message || "No se pudo reenviar el correo.";
            status.classList.remove("success");
        }
    });

    forgotBtn.addEventListener("click", async () => {
        const email = String(forgotEmail.value || "").trim();
        if (!email) {
            status.textContent = "Ingresá el email asociado para recuperar la clave.";
            return;
        }
        status.textContent = "Enviando recuperación de clave...";
        status.className = "agenda-status";

        try {
            const response = await fetch(apiUrl("/api/auth/forgot-password"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await apiJson(response);
            if (!response.ok || !data.ok) {
                throw new Error(data.error || "No se pudo procesar la recuperación.");
            }
            status.textContent = data.message;
            status.classList.add("success");
        } catch (error) {
            status.textContent = error.message || "No se pudo procesar la recuperación.";
            status.classList.remove("success");
        }
    });
});
