import { apiUrl } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("reset-form");
    const status = document.getElementById("reset-status");
    const tokenInput = document.getElementById("reset-token");
    const newPasswordInput = document.getElementById("new-password");
    const confirmPasswordInput = document.getElementById("confirm-password");

    const params = new URLSearchParams(window.location.search);
    const tokenFromQuery = params.get("token");
    if (tokenFromQuery) {
        tokenInput.value = tokenFromQuery;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        status.textContent = "Actualizando clave...";
        status.className = "agenda-status";

        const token = String(tokenInput.value || "").trim();
        const newPassword = String(newPasswordInput.value || "");
        const confirmPassword = String(confirmPasswordInput.value || "");

        if (!token) {
            status.textContent = "Ingresá un token válido.";
            return;
        }
        if (newPassword !== confirmPassword) {
            status.textContent = "Las claves no coinciden.";
            return;
        }
        if (newPassword.length < 8) {
            status.textContent = "La nueva clave debe tener al menos 8 caracteres.";
            return;
        }

        try {
            const response = await fetch(apiUrl("/api/auth/reset-password"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, new_password: newPassword }),
            });
            const data = await response.json();
            if (!response.ok || !data.ok) {
                throw new Error(data.error || "No se pudo actualizar la clave.");
            }
            form.reset();
            status.textContent = "Clave actualizada. Redirigiendo a Signin...";
            status.classList.add("success");
            window.setTimeout(() => {
                window.location.href = "signin.html?v=2";
            }, 700);
        } catch (error) {
            status.textContent = error.message || "No se pudo actualizar la clave.";
            status.classList.remove("success");
        }
    });
});
