import { apiUrl } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("confirm-form");
    const status = document.getElementById("confirm-status");
    const tokenInput = document.getElementById("token");
    const params = new URLSearchParams(window.location.search);
    const tokenFromQuery = params.get("token");

    if (tokenFromQuery) {
        tokenInput.value = tokenFromQuery;
    }

    async function confirmToken(token) {
        status.textContent = "Confirmando cuenta...";
        status.className = "agenda-status";

        try {
            const response = await fetch(apiUrl("/api/auth/confirm"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            });
            const data = await response.json();
            if (!response.ok || !data.ok) {
                throw new Error(data.error || "No se pudo confirmar la cuenta.");
            }
            status.textContent = "Cuenta confirmada. Ya podés hacer signin.";
            status.classList.add("success");
            window.setTimeout(() => {
                window.location.href = "signin.html?v=1";
            }, 800);
        } catch (error) {
            status.textContent = error.message || "No se pudo confirmar la cuenta.";
            status.classList.remove("success");
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const token = String(tokenInput.value || "").trim();
        if (!token) {
            status.textContent = "Ingresá un token válido.";
            return;
        }
        await confirmToken(token);
    });

    if (tokenFromQuery) {
        confirmToken(tokenFromQuery);
    }
});
