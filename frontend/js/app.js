console.log("✅ Archivo JS cargado correctamente");

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM completamente cargado");

    const createAlertButton = document.getElementById("create-alert-button");
    const campaignSelect = document.getElementById("campaign");
    const metricSelect = document.getElementById("metric");
    const resumen = document.getElementById("resumen");

    const API_BASE = "https://us-central1-kam-bi-451418.cloudfunctions.net";

    const showError = (msg, error) => {
        alert(`⚠️ ${msg}`);
        console.error(`❌ ${msg}`, error);
    };

    const populateSelect = (selectElement, items, placeholder) => {
        selectElement.innerHTML = `<option value="">${placeholder}</option>`;
        items.forEach(item => {
            const option = document.createElement("option");
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
    };

    const fetchCampaigns = async () => {
        try {
            const response = await fetch(`${API_BASE}/get_campaigns`);
            const data = await response.json();
            console.log("✅ Campañas recibidas:", data);
            populateSelect(campaignSelect, data, "Seleccione una campaña");
        } catch (error) {
            showError("No se pudieron cargar las campañas.", error);
        }
    };

    const fetchMetrics = async (campaign) => {
        try {
            const response = await fetch(`${API_BASE}/get_metrics`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ campaign }),
            });

            if (!response.ok) throw new Error("Respuesta no válida del servidor");

            const data = await response.json();
            console.log("✅ Métricas filtradas recibidas:", data);
            populateSelect(metricSelect, data, "Seleccione una métrica");
        } catch (error) {
            showError("No se pudieron cargar las métricas para la campaña seleccionada.", error);
        }
    };

    const handleCreateAlert = async () => {
        const campaign = campaignSelect.value.trim();
        const metric = metricSelect.value.trim();
        const target = document.getElementById("target").value.trim();
        const frequency = document.getElementById("frequency").value.trim();
        const whatsapp = document.getElementById("whatssapp").value.trim();
        const email = document.getElementById("email").value.trim();

        if (!campaign || !metric || !target) {
            alert("❗Por favor completa los campos obligatorios: Campaign, Metric y Target.");
            return;
        }

        const data = { campaign, metric, target, frequency, whatsapp, email };

        const message = `
🚨 Se va a crear una alerta con los siguientes parámetros:

📌 Campaign: ${campaign}
📊 Metric: ${metric}
🎯 Target: ${target}
⏱ Frecuencia: ${frequency || 'No especificada'}
📱 WhatsApp: ${whatsapp || 'No especificado'}
📧 Email: ${email || 'No especificado'}

¿Deseas continuar?`;

        if (!confirm(message)) {
            console.log("❌ Acción cancelada por el usuario.");
            return;
        }

        resumen.innerHTML = `
            <strong>Resumen:</strong><br/>
            Va a crear una alerta para la campaña <strong>${campaign}</strong>, métrica <strong>${metric}</strong>,
            objetivo <strong>${target}</strong>, frecuencia <strong>${frequency || 'No especificada'}</strong>,
            WhatsApp <strong>${whatsapp || 'No especificado'}</strong> y correo <strong>${email || 'No especificado'}</strong>.
        `;

        try {
            const response = await fetch(`${API_BASE}/save_alert`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error(`Código HTTP ${response.status}`);

            alert("✅ La alerta fue enviada y guardada correctamente.");
            console.log("✅ Alerta creada exitosamente:", data);
        } catch (error) {
            showError("Ocurrió un error al enviar la alerta.", error);
        }
    };

    // Inicializaciones
    fetchCampaigns();

    campaignSelect.addEventListener("change", () => {
        const selectedCampaign = campaignSelect.value;
        if (selectedCampaign) fetchMetrics(selectedCampaign);
        else populateSelect(metricSelect, [], "Seleccione una métrica");
    });

    if (createAlertButton) {
        createAlertButton.addEventListener("click", handleCreateAlert);
    } else {
        console.warn("⚠️ No se encontró el botón de crear alerta.");
    }
});