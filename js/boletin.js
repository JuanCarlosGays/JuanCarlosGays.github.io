import { apiUrl } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("boletin-form");
    const status = document.getElementById("boletin-status");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        status.textContent = "Enviando suscripción...";
        status.className = "agenda-status";

        const formData = new FormData(form);
        const payload = {
            nombre: formData.get("nombre"),
            email: formData.get("email"),
            empresa: formData.get("empresa"),
            rol: formData.get("rol"),
            frecuencia: formData.get("frecuencia"),
            tema_interes: formData.get("tema_interes"),
            consentimiento: formData.get("consentimiento") === "on",
        };

        try {
            const response = await fetch(apiUrl("/api/boletin"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error("No se pudo registrar la suscripción.");
            }

            form.reset();
            status.textContent = "Suscripción confirmada. Gracias por sumarte al boletín.";
            status.classList.add("success");
        } catch (_error) {
            status.textContent = "No se pudo procesar la suscripción. Intentá nuevamente.";
            status.classList.remove("success");
        }
    });
});
