import { apiUrl } from "./api.js";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('agenda-form');
    const status = document.getElementById('agenda-status');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        status.textContent = 'Enviando solicitud...';
        status.className = 'agenda-status';

        const formData = new FormData(form);
        const payload = {
            nombre: formData.get('nombre'),
            empresa: formData.get('empresa'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            cargo: formData.get('cargo'),
            interes: formData.get('interes'),
            es_cliente: formData.get('es_cliente') === 'si',
            subscription_type: formData.get('subscription_type'),
            username: formData.get('username'),
            password: formData.get('password'),
            mensaje: formData.get('mensaje'),
            consentimiento: formData.get('consentimiento') === 'on',
        };

        try {
            const response = await fetch(apiUrl('/api/agenda'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.id && !data.ok) {
                form.reset();
                status.textContent = `Solicitud #${data.id} guardada. No se pudo enviar el email de confirmación.`;
                status.classList.add('success');
                return;
            }
            if (!response.ok || !data.ok) {
                throw new Error(data.error || 'No se pudo registrar la solicitud.');
            }

            form.reset();
            status.textContent = data.warning
                ? `Solicitud #${data.id} guardada. ${data.warning}`
                : 'Solicitud enviada correctamente. Te contactaremos pronto.';
            status.classList.add('success');
        } catch (error) {
            status.textContent = error.message;
            status.classList.remove('success');
        }
    });
});
