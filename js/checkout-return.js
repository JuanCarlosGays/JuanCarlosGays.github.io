import { apiJson, apiUrl } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
    const status = document.getElementById("checkout-status");
    const button = document.getElementById("checkout-check");
    const saved = localStorage.getItem("aequo_pending_checkout");
    if (!saved) {
        status.textContent = "No encontramos el checkout local. Ingresá a tu cuenta o volvé a registro.";
        return;
    }
    let checkout;
    try {
        checkout = JSON.parse(saved);
    } catch {
        status.textContent = "No se pudo leer el checkout guardado. Volvé a registrarte.";
        return;
    }

    const checkStatus = async () => {
        button.disabled = true;
        status.textContent = "Consultando el estado verificado del pago…";
        try {
            const response = await fetch(apiUrl("/api/ecommerce/status"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkout),
            });
            const data = await apiJson(response);
            if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo consultar el estado.");
            if (data.status === "registration_pending") {
                status.textContent = "Registro guardado. Todavía falta elegir el plan y pagar; continuá en Plan y pago.";
            } else if (["paid", "trialing"].includes(data.status)) {
                const verified = data.status === "trialing"
                    ? `Suscripción autorizada. Prueba gratuita hasta ${new Date(data.trial_expires_at).toLocaleString("es-AR")}. Cancelá desde Mi cuenta antes del vencimiento para evitar el primer cobro.`
                    : "Pago verificado.";
                status.textContent = data.email_confirmed
                    ? `${verified} Email confirmado. Ya podés iniciar sesión.`
                    : data.confirmation_email_sent
                        ? `${verified} Enviamos un email de confirmación a ${data.email}. Confirmá el email para habilitar el acceso.`
                        : `${verified} No se pudo enviar todavía la confirmación a ${data.email}. Podés solicitar un reenvío desde Iniciar sesión.`;
                status.classList.add("success");
                localStorage.removeItem("aequo_pending_checkout");
            } else {
                status.textContent = "El proveedor todavía no notificó un pago aprobado. El checkout sigue pendiente; esperá y consultá de nuevo.";
            }
        } catch (error) {
            status.textContent = error.message || "No se pudo consultar el estado del pago.";
        } finally {
            button.disabled = false;
        }
    };
    button.addEventListener("click", checkStatus);
    checkStatus();
});
