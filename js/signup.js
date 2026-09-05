import { apiJson, apiUrl } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signup-form");
    const status = document.getElementById("signup-status");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        status.textContent = "Creando cuenta...";
        status.className = "agenda-status";

        const formData = new FormData(form);
        const password = String(formData.get("password") || "");
        const confirmPassword = String(formData.get("confirm_password") || "");
        if (password !== confirmPassword) {
            status.textContent = "Las claves no coinciden.";
            return;
        }

        const payload = {
            username: formData.get("username"),
            email: formData.get("email"),
            password,
            subscription_type: formData.get("subscription_type"),
        };

        try {
            const response = await fetch(apiUrl("/api/auth/signup"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await apiJson(response);
            if (!response.ok || !data.ok) {
                throw new Error(data.error || "No se pudo crear la cuenta.");
            }

            form.reset();
            if (data.email_configured === false && data.confirmation_token) {
                const token = data.confirmation_token;
                const link = data.confirm_url || `confirmar-cuenta.html?token=${encodeURIComponent(token)}`;
                status.innerHTML = `
                    <div>
                        <div>Cuenta creada, pero pendiente de confirmación.</div>
                        <div>No hay SMTP configurado en este entorno.</div>
                        <div>Token de confirmación: <strong>${token}</strong></div>
                        <div><a href="${link}" target="_blank" rel="noreferrer">Confirmar cuenta ahora</a></div>
                    </div>
                `;
            } else {
                status.textContent = "Cuenta creada. Revisá tu email para confirmar y luego hacer signin.";
            }
            status.classList.add("success");
        } catch (error) {
            status.textContent = error.message || "No se pudo crear la cuenta.";
            status.classList.remove("success");
        }
    });
});
