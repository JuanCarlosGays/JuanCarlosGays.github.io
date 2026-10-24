import { apiJson, apiUrl } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("payment-form");
    const fields = document.getElementById("payment-fields");
    const status = document.getElementById("payment-status");
    const retry = document.getElementById("payment-retry");
    let registration;

    const post = async (path, payload) => {
        const response = await fetch(apiUrl(path), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await apiJson(response);
        if (!response.ok || !data.ok) throw new Error(data.error || "No se pudo completar la operación.");
        return data;
    };

    const pay = async (path, payload) => {
        fields.disabled = true;
        retry.disabled = true;
        status.textContent = "Conectando con el sitio seguro de Mercado Pago...";
        try {
            const data = await post(path, payload);
            if (!data.checkout_url) throw new Error("El proveedor no devolvió un enlace de pago.");
            window.location.assign(data.checkout_url);
        } catch (error) {
            status.textContent = error.message;
            try {
                const state = await post("/api/ecommerce/status", registration);
                retry.hidden = !["pending_payment", "checkout_created"].includes(state.status);
            } catch (stateError) {
                status.textContent += ` No se pudo actualizar el estado: ${stateError.message}`;
            }
        } finally {
            fields.disabled = false;
            retry.disabled = false;
        }
    };

    try {
        registration = JSON.parse(localStorage.getItem("aequo_pending_checkout") || "null");
        if (!registration?.checkout_id || !registration?.resume_token) {
            throw new Error("Primero registrate por email o Google. Volvé a la pantalla de registro.");
        }
        const state = await post("/api/ecommerce/status", registration);
        document.getElementById("payment-registration").textContent =
            `Registro guardado: ${state.username} (${state.email}).`;
        if (["paid", "trialing"].includes(state.status)) {
            window.location.replace("checkout-return.html");
            return;
        }
        if (!["registration_pending", "pending_payment", "checkout_created"].includes(state.status)) {
            throw new Error("Este registro no está disponible para iniciar un pago.");
        }
        const response = await fetch(apiUrl("/api/ecommerce/catalog"));
        const catalog = await apiJson(response);
        if (!response.ok || !catalog.plans) throw new Error(catalog.error || "No se pudo consultar el catálogo.");
        renderCatalog(catalog);
        fields.disabled = false;
        if (state.plan_key) {
            document.getElementById("payment-plan").value = state.plan_key;
            form.querySelector(`input[value="${state.payment_method}"]`)?.setAttribute("checked", "");
            document.getElementById("payment-plan").dispatchEvent(new Event("change"));
        }
        retry.hidden = state.status === "registration_pending";
    } catch (error) {
        document.getElementById("payment-registration").textContent = "No se pudo habilitar el paso de pago.";
        status.textContent = error.message;
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const values = new FormData(form);
        if (values.get("plan_key") === "enterprise") {
            status.textContent = "Enterprise requiere cotización personalizada y contrato anual.";
            return;
        }
        const method = form.querySelector('input[name="payment_method"]:checked');
        if (!method || method.disabled) {
            status.textContent = "Elegí un medio de pago configurado.";
            return;
        }
        await pay("/api/ecommerce/checkout", {
            ...registration, plan_key: values.get("plan_key"), payment_method: method.value,
        });
    });
    retry.addEventListener("click", () => pay("/api/ecommerce/retry", registration));
});

function renderCatalog(data) {
    const select = document.getElementById("payment-plan");
    const list = document.getElementById("payment-plan-prices");
    for (const [key, plan] of Object.entries(data.plans)) {
        const details = [];
        if (plan.credits) details.push(`${plan.credits} créditos`);
        if (plan.valid_days) details.push(`vigencia ${plan.valid_days} días`);
        if (plan.max_seats) details.push(`hasta ${plan.max_seats} personas`);
        if (plan.cases) details.push(`${plan.cases} caso${plan.cases === 1 ? "" : "s"}`);
        if (plan.trial_days) details.push(`${plan.trial_days} días gratis; luego cobro mensual automático salvo cancelación`);
        select.add(new Option(`${plan.name} — ${plan.formatted_price}`, key));
        const card = document.createElement("button");
        card.type = "button";
        card.className = "ecommerce-plan-card";
        card.dataset.plan = key;
        card.setAttribute("aria-pressed", "false");
        card.textContent = `${plan.name}: ${plan.formatted_price}. ${details.join(" · ")}. ${plan.description || ""}`;
        card.addEventListener("click", () => {
            select.value = key;
            select.dispatchEvent(new Event("change"));
        });
        list.append(card);
    }
    select.addEventListener("change", () => {
        list.querySelectorAll("button").forEach(card =>
            card.setAttribute("aria-pressed", String(card.dataset.plan === select.value)));
        document.getElementById("enterprise-quote").hidden = select.value !== "enterprise";
        const plan = data.plans[select.value];
        document.getElementById("payment-trial-info").textContent = plan?.trial_days
            ? `Autorizá tu medio de pago en Mercado Pago. Tenés ${plan.trial_days} días gratis desde la autorización verificada; al finalizar se cobra ${plan.formatted_price} si no cancelás antes desde Mi cuenta.`
            : "Este plan no incluye la prueba mensual: los pagos únicos se cobran al contratar.";
    });
    for (const key of ["mercadopago_card", "mercadopago"]) {
        const method = data.payment_methods[key];
        document.querySelector(`input[value="${key}"]`).disabled = !method.enabled;
        document.querySelector(`[data-method-state="${key}"]`).textContent =
            method.enabled ? "Checkout alojado disponible" : method.disabled_reason;
    }
}
