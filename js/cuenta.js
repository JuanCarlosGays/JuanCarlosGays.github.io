document.addEventListener("DOMContentLoaded", () => {
    const welcome = document.getElementById("account-welcome");
    const username = document.getElementById("account-username");
    const email = document.getElementById("account-email");
    const mode = document.getElementById("account-mode");
    const accountStatus = document.getElementById("account-status");
    const accountExpiry = document.getElementById("account-expiry");
    const accountCases = document.getElementById("account-cases");
    const accountCredits = document.getElementById("account-credits");
    const description = document.getElementById("account-description");
    const accessDetails = document.getElementById("account-access-details");
    const streamlitCard = document.getElementById("account-streamlit-card");
    const streamlitTitle = document.getElementById("account-streamlit-title");
    const streamlitSummary = document.getElementById("account-streamlit-summary");
    const streamlitFeatures = document.getElementById("account-streamlit-features");
    const streamlitLink = document.getElementById("account-streamlit-link");
    const streamlitFrame = document.getElementById("account-streamlit-frame");
    const logoutBtn = document.getElementById("logout-btn");

    const sessionRaw = localStorage.getItem("aequo_account");
    if (!sessionRaw) {
        window.location.href = "signin.html?v=1";
        return;
    }

    let session;
    try {
        session = JSON.parse(sessionRaw);
    } catch (_error) {
        localStorage.removeItem("aequo_account");
        window.location.href = "signin.html?v=1";
        return;
    }

    const modeText = String(session.account_mode || session.subscription_type || "No definido");
    const fallbackProfiles = {
        "Firma Boutique Local (On-Premise)": {
            descripcion: "Acceso local con despliegue interno del estudio.",
            detalles: [
                "Segmento: Corporativo e Institucional (SaaS B2B).",
                "Capacidad: hasta 3 abogados.",
                "Despliegue: 100% local (Zero-Data Leak).",
                "Soporte: remoto estándar por e-mail.",
            ],
            streamlit_access: {
                workspace_title: "Workspace on-premise del estudio",
                workspace_summary: "Entorno profesional con carga documental y preparación del caso para equipos legales pequeños.",
                launch_label: "Abrir workspace on-premise",
                features: [
                    "Carga de PDFs por expediente",
                    "Resumen inicial del caso",
                    "Inicio de agentes especialistas",
                ],
            },
        },
        "Estudio Asociado (Cloud Gestionado)": {
            descripcion: "Acceso cloud administrado por Aequo con soporte dedicado.",
            detalles: [
                "Segmento: Corporativo e Institucional (SaaS B2B).",
                "Capacidad: de 4 a 10 abogados.",
                "Despliegue: nube gestionada por Aequo con actualizaciones automáticas.",
                "Soporte: onboarding IT y mesa de ayuda dedicada.",
            ],
            streamlit_access: {
                workspace_title: "Workspace cloud gestionado",
                workspace_summary: "Mesa colaborativa con carga documental ampliada y operación asistida por Aequo.",
                launch_label: "Abrir workspace cloud",
                features: [
                    "Carga documental ampliada",
                    "Mesa de trabajo colaborativa",
                    "Inicio de agentes con soporte dedicado",
                ],
            },
        },
        "Firma Corporativa (Cloud Aislado)": {
            descripcion: "Acceso corporativo en clúster privado de alta prioridad.",
            detalles: [
                "Segmento: Corporativo e Institucional (SaaS B2B).",
                "Capacidad: de 11 a 30 abogados.",
                "Despliegue: clúster cloud privado e independiente.",
                "Soporte: alertas críticas personalizadas y asistencia 24/7.",
            ],
            streamlit_access: {
                workspace_title: "Workspace corporativo aislado",
                workspace_summary: "Espacio de trabajo con capacidad prioritaria para equipos corporativos y expedientes complejos.",
                launch_label: "Abrir workspace corporativo",
                features: [
                    "Carga documental prioritaria",
                    "Soporte para expedientes complejos",
                    "Operación en clúster privado",
                ],
            },
        },
        "Plan Élite / Enterprise": {
            descripcion: "Acceso enterprise a medida con infraestructura dedicada.",
            detalles: [
                "Segmento: Corporativo e Institucional (SaaS B2B).",
                "Capacidad: más de 30 abogados.",
                "Despliegue: on-premise dedicado o nube privada (Azure/AWS).",
                "Contratación: anual con SLA estricto y cotización personalizada.",
            ],
            streamlit_access: {
                workspace_title: "Workspace enterprise dedicado",
                workspace_summary: "Entorno premium con mayor capacidad documental, activación de demo guiada y operación dedicada.",
                launch_label: "Abrir workspace enterprise",
                features: [
                    "Carga documental enterprise",
                    "Demo guiada disponible",
                    "Operación dedicada con SLA estricto",
                ],
            },
        },
        "Plan Crédito Base": {
            descripcion: "Acceso por consumo para uso flexible bajo demanda.",
            detalles: [
                "Segmento: Consumo Flexible por Uso (Créditos B2B).",
                "Volumen: 50 créditos por recarga.",
                "Consumo: 1 crédito por carga PDF indexada o consulta profunda.",
                "Vencimiento: créditos remanentes a 60 días.",
            ],
            streamlit_access: {
                workspace_title: "Workspace por créditos",
                workspace_summary: "Acceso flexible para casos puntuales con carga acotada de documentos según el consumo contratado.",
                launch_label: "Abrir workspace por créditos",
                features: [
                    "Carga puntual de documentos",
                    "Análisis por demanda",
                    "Inicio directo de la mesa de trabajo",
                ],
            },
        },
        "Plan Crédito Premium": {
            descripcion: "Acceso por créditos con prioridad de procesamiento.",
            detalles: [
                "Segmento: Consumo Flexible por Uso (Créditos B2B).",
                "Volumen: 150 créditos por recarga.",
                "Beneficios: prioridad en clúster agéntico y descarga .docx ilimitada.",
                "Consumo: 1 crédito por carga PDF indexada o consulta profunda.",
            ],
            streamlit_access: {
                workspace_title: "Workspace premium por créditos",
                workspace_summary: "Versión prioritaria del workspace con mayor capacidad documental y recorrido guiado opcional.",
                launch_label: "Abrir workspace premium",
                features: [
                    "Carga documental prioritaria",
                    "Demo guiada opcional",
                    "Procesamiento premium de consultas",
                ],
            },
        },
        "Aequo Ciudadano (Express)": {
            descripcion: "Acceso ciudadano por caso con vigencia corta y guiada.",
            detalles: [
                "Segmento: Triage Particular (Consumo Ciudadano B2C).",
                "Acceso: 7 días por conflicto específico.",
                "Entregables: traducción simple, cálculo de plazos y borrador básico.",
            ],
            streamlit_access: {
                workspace_title: "Workspace ciudadano express",
                workspace_summary: "Vista simplificada para relatar hechos y activar un análisis inicial sin carga documental.",
                launch_label: "Abrir workspace express",
                features: [
                    "Resumen guiado de hechos",
                    "Orientación inicial del conflicto",
                    "Acceso express por caso",
                ],
            },
        },
        "Suscripción Litigio Activo": {
            descripcion: "Acceso mensual ciudadano con continuidad de seguimiento.",
            detalles: [
                "Segmento: Triage Particular (Consumo Ciudadano B2C).",
                "Acceso: hasta 3 casos activos en paralelo.",
                "Entregables: orientación continua, alertas y chat ilimitado.",
            ],
            streamlit_access: {
                workspace_title: "Workspace de litigio activo",
                workspace_summary: "Mesa mensual para seguimiento continuo con soporte documental moderado y continuidad del caso.",
                launch_label: "Abrir workspace litigio activo",
                features: [
                    "Seguimiento continuo del caso",
                    "Carga documental moderada",
                    "Preparación de mesa de trabajo mensual",
                ],
            },
        },
        Demo: {
            descripcion: "Acceso ciudadano por caso con vigencia corta y guiada.",
        },
        Starter: {
            descripcion: "Acceso local con despliegue interno del estudio.",
        },
        Pro: {
            descripcion: "Acceso cloud administrado por Aequo con soporte dedicado.",
        },
        Enterprise: {
            descripcion: "Acceso corporativo en clúster privado de alta prioridad.",
        },
    };
    const fallbackProfile = fallbackProfiles[modeText] || {};
    const profile = session.access_profile || {};
    const rawDetails = Array.isArray(profile.detalles) ? profile.detalles : [];
    const detailsLookCorrupted = rawDetails.some((item) => String(item).includes("?"));
    const details = rawDetails.length > 0 && !detailsLookCorrupted
        ? rawDetails
        : Array.isArray(fallbackProfile.detalles)
            ? fallbackProfile.detalles
            : [];
    const streamlitAccess = profile.streamlit_access || fallbackProfile.streamlit_access || {};
    const streamlitFeaturesList = Array.isArray(streamlitAccess.features) ? streamlitAccess.features : [];

    welcome.textContent = `Bienvenido/a ${session.username}.`;
    username.textContent = session.username || "-";
    email.textContent = session.email || "-";
    mode.textContent = modeText;
    accountStatus.textContent = session.account_status || "active";
    accountExpiry.textContent = session.access_expires_at
        ? new Date(session.access_expires_at).toLocaleDateString("es-AR")
        : "Sin vencimiento informado";
    const maxCases = session.max_active_cases == null ? "sin límite" : session.max_active_cases;
    accountCases.textContent = `${session.active_cases ?? 0} / ${maxCases}`;
    accountCredits.textContent = session.credits_balance == null
        ? "Sin límite"
        : `${session.credits_balance} / ${session.credits_total ?? session.credits_balance}`;
    description.textContent = profile.descripcion || fallbackProfile.descripcion || "Modo personalizado activo.";

    if (accessDetails) {
        accessDetails.innerHTML = "";
        if (details.length > 0) {
            details.forEach((item) => {
                const li = document.createElement("li");
                li.textContent = String(item);
                accessDetails.appendChild(li);
            });
        } else {
            const li = document.createElement("li");
            li.textContent = "Acceso generado por configuración comercial personalizada.";
            accessDetails.appendChild(li);
        }
    }

    if (streamlitCard && streamlitTitle && streamlitSummary && streamlitFeatures && streamlitLink && streamlitFrame) {
        if (streamlitAccess.enabled === false) {
            streamlitCard.hidden = true;
        } else {
            const streamlitBaseUrl = "http://127.0.0.1:8501/";
            const params = new URLSearchParams();
            params.set("mode", String(profile.mode || modeText));
            if (session.username) {
                params.set("user", String(session.username));
            }
            const streamlitUrl = `${streamlitBaseUrl}?${params.toString()}`;

            streamlitTitle.textContent = streamlitAccess.workspace_title || "Workspace Aequo IA";
            streamlitSummary.textContent =
                streamlitAccess.workspace_summary || "Acceso listo para trabajar en la app de Streamlit.";
            streamlitLink.textContent = streamlitAccess.launch_label || "Abrir workspace Aequo IA";
            streamlitLink.href = streamlitUrl;
            streamlitFrame.src = streamlitUrl;

            streamlitFeatures.innerHTML = "";
            if (streamlitFeaturesList.length > 0) {
                streamlitFeaturesList.forEach((item) => {
                    const li = document.createElement("li");
                    li.textContent = String(item);
                    streamlitFeatures.appendChild(li);
                });
            } else {
                const li = document.createElement("li");
                li.textContent = "Acceso sincronizado con el modo contratado.";
                streamlitFeatures.appendChild(li);
            }
        }
    }

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("aequo_account");
        window.location.href = "signin.html?v=1";
    });
});
