import { apiUrl } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("auditoria-form");
    const status = document.getElementById("auditoria-status");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        status.textContent = "Enviando solicitud...";
        status.className = "agenda-status";

        const formData = new FormData(form);
        const payload = {
            nombre: formData.get("nombre"),
            empresa: formData.get("empresa"),
            email: formData.get("email"),
            telefono: formData.get("telefono"),
            area_principal: formData.get("area_principal"),
            tamano_equipo: formData.get("tamano_equipo"),
            objetivo: formData.get("objetivo"),
            consentimiento: formData.get("consentimiento") === "on",
        };

        try {
            const response = await fetch(apiUrl("/api/auditoria"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error("No se pudo registrar la solicitud.");
            }

            form.reset();
            status.textContent = "Solicitud enviada correctamente. Te contactaremos pronto.";
            status.classList.add("success");
        } catch (_error) {
            status.textContent = "No se pudo guardar la solicitud. Intentá nuevamente.";
            status.classList.remove("success");
        }
    });
});
